const { forEach } = require('async-foreach');
const { APP_ID } = require('../enum/game');
const TF2ItemTemplate = require('./TF2/TF2ItemTemplate');
const CSGOItemTemplate = require('./CSGO/CSGOItemTemplate');
const DOTA2ItemTemplate = require('./DOTA2/DOTA2ItemTemplate');

class Requesting {

    constructor(RequestingItems) {
        this.RequestingItems = RequestingItems;
    }

    getData() {
        if (this.RequestingItems.length <= 0) return []

        let finalData = [];
        forEach(this.RequestingItems, function (item, index, arr) {

            item.id = index;
            let itemData = Requesting.getItemData(item);
            if (itemData) {
                finalData.push(itemData)
            }
        });

        return finalData;
    }

    static getItemData(item) {
        if (!item.hasOwnProperty('appID')) return;

        switch (item.appID) {
            case APP_ID.TF2:
                return new TF2ItemTemplate.TF2_Item(item).toJSON();
                break;
            case APP_ID.CSGO:
                return new CSGOItemTemplate.CSGO_Item(item).toJSON();
                break;
            case APP_ID.DOTA2:
                return new DOTA2ItemTemplate.DOTA2_Item(item).toJSON();
                break;
            case APP_ID.RUST:
                break;
            default:
                return [];
                break;
        }
    }

}

module.exports = Requesting;
