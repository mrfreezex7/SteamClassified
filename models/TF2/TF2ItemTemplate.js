const { APP_ID } = require("../../enum/game");
const { getTF2Descriptions } = require("../../utility/TF2/optionUtil");

const TF2UnusualParticlesData = require('../../ItemsDB/TF2/TF2UnusualParticlesData.json');
const TF2PaintsData = require('../../ItemsDB/TF2/TF2PaintsData.json');

class TF2_Item {
    constructor(item) {
        this.id = item.id;
        this.appID = APP_ID.TF2;
        this.quality = item.hasOwnProperty('options') ? item.options.quality : 'Unique';
        this.name = this.quality === 'Unique' ? item.name : this.quality + ' ' + item.name;
        this.market_hash_name = this.name;
        this.descriptions = TF2_Item.getDescription(item);
        this.image_url = item.image_url;
        this.particle = TF2_Item.getParticleLink(this.descriptions);
        this.paint = TF2_Item.getPaintColor(this.descriptions);
        this.hidden = false;
    }

    toJSON() {
        return {
            'id': this.id,
            'appID': this.appID,
            'name': this.name,
            'market_hash_name': this.market_hash_name,
            'descriptions': this.descriptions,
            'image_url': this.image_url,
            'quality': this.quality,
            'particle': this.particle,
            'paint': this.paint,
            'hidden': this.hidden
        }
    }

    static getDescription(item) {
        if (!item.hasOwnProperty('options')) {
            return {
                type: item.type,
            }
        } else {
            return getTF2Descriptions(item);
        }
    }

    static getParticleLink(description) {
        if (description.hasOwnProperty('effect') && TF2UnusualParticlesData.data.hasOwnProperty(description.effect)) {
            return TF2UnusualParticlesData.data[description.effect];
        }
    }

    static getPaintColor(description) {
        if (description.hasOwnProperty('paint') && TF2PaintsData.hasOwnProperty(description.paint)) {
            return TF2PaintsData[description.paint];
        }
    }
}


class TF2_UserItem {
    constructor(item) {
        this.id = item.id;
        this.appID = APP_ID.TF2;
        this.name = item.name;
        this.market_hash_name = item.market_hash_name;
        this.image_url = item.image_url;
        this.descriptions = item.descriptions;
        this.quality = item.quality;
        this.particle = item.particle;
        this.hidden = false;
    }

    toJSON() {
        let data = {
            'id': this.id,
            'appID': this.appID,
            'name': this.name,
            'market_hash_name': this.market_hash_name,
            'image_url': this.image_url,
            'descriptions': this.descriptions,
            'quality': this.quality,
            'particle': this.particle,
            'hidden': this.hidden
        }

        return data;
    }
}


module.exports = { 'TF2_Item': TF2_Item, 'TF2_UserItem': TF2_UserItem };