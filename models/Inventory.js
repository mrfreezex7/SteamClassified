var forEach = require('async-foreach').forEach;
const inventoryApi = require("steam-inventory-api-ng");

const InvetoryAPI = new inventoryApi();

const TF2FinalData = require('../ItemsDB/TF2/TF2FinalData.json');
const CSGOFinalData = require('../ItemsDB/CSGO/CSGOFinalData.json');
const DOTA2FinalData = require('../ItemsDB/DOTA2/DOTA2FinalData.json');

const TF2DefaultData = require('../ItemsDB/TF2/TF2DefaultData.json');
const CSGODefaultData = require('../ItemsDB/CSGO/CSGODefaultData.json');
const DOTA2DefaultData = require('../ItemsDB/DOTA2/DOTA2DefaultData.json');

const { APP_ID } = require('../enum/game');

class Inventory {

    constructor(steamID, appID, contextID) {
        this.steamID = steamID;
        this.appID = appID;
        this.contextID = contextID;
    }
    // '76561198114402400':tf2
    // '76561198139171368' tf2
    // '76561198261369921' tf2
    // '76561198115627154' csgo
    // '76561198092117337' dota2
    //( Not Usable in Crafting )
    async getUserInventory() {
        return InvetoryAPI.get(this.steamID, this.appID, this.contextID, false, 1, "'english'").then(data => {

            return data.inventory;
        }).catch(err => {
            return null;
        })
    }

    static async getGameItems(itemName, appID) {
        let items = [];

        if (itemName.trim().length <= 0) {
            return Inventory.getDefaultItems(appID);
        }

        const regexText = getRegexText(escapeRegex(itemName));

        if (!regexText) return [];

        switch (appID) {
            case APP_ID.TF2:
                items = getFilteredGameItems(TF2FinalData, '^' + regexText + '.*');
                break;
            case APP_ID.CSGO:
                items = getFilteredGameItems(CSGOFinalData, '^' + regexText + '.*');
                break;
            case APP_ID.DOTA2:
                items = getFilteredGameItems(DOTA2FinalData, '^' + regexText + '.*');
                break;
            case APP_ID.RUST:
                break;
            default:
                return [];
                break;
        }

        return items;
    }

    static getDefaultItems(appID) {
        switch (appID) {
            case APP_ID.TF2:
                return TF2DefaultData;

            case APP_ID.CSGO:
                return CSGODefaultData;

            case APP_ID.DOTA2:
                return DOTA2DefaultData;


            default:
                return [];
        }
    }
}


function getFilteredGameItems(arrayItems, match) {
    var reg = new RegExp(match, 'i');

    return arrayItems.filter(function (item) {
        return typeof item.name == 'string' && item.name.match(reg) && item.image_url != '' && item.image_url != 'https://steamcommunity-a.akamaihd.net/economy/image/null/64fx64f';

    });
}

function getRegexText(itemName) {
    if (itemName.length <= 0) return false;

    let finalRegexText = '';
    let regexTextArray = itemName.trim().split(' ');
    if (regexTextArray.length > 0) {
        if (regexTextArray.length > 1) {
            regexTextArray.forEach(text => {
                // ^(?=.*\bjack\b)(?=.*\bjames\b).*$
                finalRegexText += "(?=.*\\b" + text + ")"
            })
        } else {
            finalRegexText = "(?=.*" + regexTextArray[0] + ")"
        }
    } else {
        return false;
    }

    return finalRegexText;
}

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = Inventory;

//get player inventory 
// get game invenrory

