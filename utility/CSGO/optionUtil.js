
const { SKIN_EXTERIOR_QUALITY } = require('../../enum/csgo');

const uselessWordsArray =
    [
        '(Factory New)', '(Minimal Wear)', '(Field-Tested)', '(Well-Worn)', '(Battle-Scarred)'
    ];

var uselessWordsStr = uselessWordsArray.join("|");


function getCSGODescriptions(item) {
    let descriptionData = {
        'type': item.type,
        'isStatTrak': hasStatTrak(item),
        'exterior': getCSGO_SkinExterior(item),
        'rarity': getCSGO_Rarity(item),
        'quality': getCSGO_Quality(item),
    }
    let finalData = {}

    for (const key in descriptionData) {
        if (Object.hasOwnProperty.call(descriptionData, key)) {
            const element = descriptionData[key];
            if (element != '') {
                finalData[key] = element;
            }
        }
    }

    return finalData;

}

function hasStatTrak(item) {

    if (item.market_name.indexOf('StatTrak™') !== -1) {
        return true
    } else {
        return '';
    }
}

function getItemName(txt) {
    var regexFromMyArray = new RegExp(uselessWordsStr, 'gi');

    var matches = txt.match(regexFromMyArray) || [];

    if (matches.length > 0) {
        return txt.replace(new RegExp('\\b(' + uselessWordsStr + ')\\b', 'gi'), ' ')
            .replace(/\s{2,}/g, ' ')
            .replace(/[\(\)']+/g, '').trim();
    } else {
        return txt;
    }

}

function getCSGO_SkinExterior(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Exterior' && SKIN_EXTERIOR_QUALITY[tag.name]) {
            result = SKIN_EXTERIOR_QUALITY[tag.name];
        }
    })
    return result;
}

function getCSGO_Rarity(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Rarity') {
            result = { name: tag.name, color: tag.color };
        }
    })
    return result;
}

function getCSGO_Quality(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Quality') {
            result = { name: tag.name, color: tag.color };
        }
    })
    return result;
}
module.exports = {
    getCSGODescriptions: getCSGODescriptions,
    getItemName: getItemName,
}