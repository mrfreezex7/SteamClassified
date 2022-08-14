class SearchQuery {
    static SearchQuries = {};

    static AddSearchQuery(userId, SearchQuery) {
        this.SearchQuries[userId] = SearchQuery;
    }

    static getSearchQuery(userId) {
        if (this.SearchQuries[userId] !== -1) {

            if (this.SearchQuries[userId].hasOwnProperty('$and')) {
                this.SearchQuries[userId]['$and'][0]['offering.market_hash_name'] = new RegExp(this.SearchQuries[userId]['$and'][0]['offering.market_hash_name'], "i");
                this.SearchQuries[userId]['$and'][1]['requesting.market_hash_name'] = new RegExp(this.SearchQuries[userId]['$and'][1]['requesting.market_hash_name'], "i");
            } else if (this.SearchQuries[userId].hasOwnProperty('offering.appID')) {
                this.SearchQuries[userId]['offering.market_hash_name'] = new RegExp(this.SearchQuries[userId]['offering.market_hash_name'], "i");
            } else if (this.SearchQuries[userId].hasOwnProperty('requesting.appID')) {
                this.SearchQuries[userId]['requesting.market_hash_name'] = new RegExp(this.SearchQuries[userId]['requesting.market_hash_name'], "i");
            }

            return this.SearchQuries[userId];
        } else {
            return null;
        }
    }
}

module.exports = SearchQuery;