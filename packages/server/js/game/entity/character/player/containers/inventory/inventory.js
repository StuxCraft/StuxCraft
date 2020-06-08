/* global module */

let _ = require('underscore'),
    Container = require('../container'),
    Messages = require('../../../../../../network/messages'),
    Packets = require('../../../../../../network/packets'),
    Constants = require('./constants'),
    Items = require('../../../../../../util/items');

class Inventory extends Container {

    constructor(owner, size) {
        super('Inventory', owner, size);
    }

    load(ids, counts, abilities, abilityLevels) {
        super.load(ids, counts, abilities, abilityLevels);

        this.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Batch, [this.size, this.slots]));
    }

    add(item) {
        if (!this.canHold(item.id, item.count)) {
            this.owner.send(new Messages.Notification(Packets.NotificationOpcode.Text, {
                message: Constants.InventoryFull
            }));
            return false;
        }

        let slot = super.add(item.id, item.count, item.ability, item.abilityLevel);

        if (!slot)
            return false;

        this.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Add, slot));

        this.owner.save();

        if (item.instance)
            this.owner.world.removeItem(item);

        return true;
    }

    remove(id, count, index) {

        if (!id || !count)
            return false;

        if (!index)
            index = this.getIndex(id);

        if (!super.remove(index, id, count))
            return false;

        this.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Remove, {
            index: parseInt(index),
            count: count
        }));

        this.owner.save();

        return true;
    }

}

module.exports = Inventory;