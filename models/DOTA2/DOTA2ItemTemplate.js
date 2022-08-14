const { APP_ID } = require("../../enum/game");


class DOTA2_Item {
    constructor(item) {
        this.id = item.id;
        this.appID = APP_ID.DOTA2;
        this.name = item.name;
        this.market_hash_name = item.name;
        this.image_url = item.image_url;
        this.descriptions = item.descriptions;
        this.hidden = false;
    }

    toJSON() {
        return {
            'id': this.id,
            'appID': this.appID,
            'name': this.name,
            'market_hash_name': this.market_hash_name,
            'image_url': this.image_url,
            'descriptions': this.descriptions,
            'hidden': this.hidden
        }
    }
}


class DOTA2_UserItem {
    constructor(item) {
        this.id = item.id;
        this.appID = APP_ID.DOTA2;
        this.name = item.name;
        this.market_hash_name = item.market_hash_name;
        this.image_url = !item.icon_url ? item.image_url : item.icon_url;
        this.descriptions = item.descriptions;
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
            'hidden': this.hidden
        }

        return data;
    }
}


module.exports = { 'DOTA2_Item': DOTA2_Item, 'DOTA2_UserItem': DOTA2_UserItem };