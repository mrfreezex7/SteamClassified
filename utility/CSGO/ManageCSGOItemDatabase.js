const fs = require('mz/fs');
const config = require('../../config/keys');
const request = require('request');
const { APP_ID } = require('../../enum/game');
const { getCSGODescriptions, getItemName } = require("../../utility/CSGO/optionUtil");
const { ITEM_ICON_SIZE } = require('../../enum/site');
const { log } = require('../../models/Logger');
class CSGOItemDatabase {

    static GenerateCSGOFinalData(callback) {


        request('https://api.hexa.one/market/items/730?key=1182a44d-24ce-2e91-10d9-b7224b0aa064', (error, response, body) => {
            log.info(response.statusCode);
            if (!error && response.statusCode === 200) {
                log.info('got items.starting item manupulation now')
                const items = JSON.parse(body);
                let finalItems = [];
                for (const key in items.result.items) {
                    if (Object.hasOwnProperty.call(items.result.items, key)) {
                        const element = items.result.items[key];

                        let item = {
                            appID: APP_ID.CSGO,
                            name: getItemName(key),
                            image_url: 'https://steamcommunity-a.akamaihd.net/economy/image/' + element.icon_url + ITEM_ICON_SIZE.CSGO,
                            descriptions: getCSGODescriptions(element)
                        };
                        finalItems.push(item);
                    }
                }


                fs.writeFile('./ItemsDB/CSGO/CSGOFinalData.json', JSON.stringify(finalItems, null, 2), function (err) {
                    if (err) return log.info(err);
                    log.info('date updated on CSGOFINALDATA.JSON.server restart required.');
                    callback('date updated on CSGOFINALDATA.JSON file. server restart required.');
                });

            } else {
                callback(error);
            }
        });
    }

}

module.exports = CSGOItemDatabase;


