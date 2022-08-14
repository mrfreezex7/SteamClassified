const TF2UnusualParticlesData = require('../../ItemsDB/TF2/TF2UnusualParticlesData.json');
const TF2PaintsData = require('../../ItemsDB/TF2/TF2PaintsData.json');
const TF2StrangePartsData = require('../../ItemsDB/TF2/TF2StrangePartsData.json');
const tf2 = require('../../enum/tf2');

function getTF2Descriptions(item) {
    let descriptionData = {
        'type': item.type,
        'paint': getPaintColor(item.options),
        'effect': getUnusualEffect(item.options),
        'killstreak': getKillstreaker(item.options),
        'parts': getParts(item.options),
        'exterior': getSkinExterior(item.options),
        'craftable': getCraftable(item.options),
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

function getSkinExterior(options) {
    if (options.hasOwnProperty('exterior') && options.parts != 'No_Exterior' && tf2.SKIN_EXTERIOR_QUALITY[options.exterior] !== -1) {
        return tf2.SKIN_EXTERIOR_QUALITY[options.exterior];
    }

    return '';
}


function getParts(options) {
    if (options.hasOwnProperty('parts') && options.parts != 'No_Parts' && TF2StrangePartsData[options.parts] !== -1) {
        return [TF2StrangePartsData[options.parts]];
    }

    return '';
}

function getCraftable(options) {
    if (options.hasOwnProperty('craftable') && options.craftable != '') {
        return options.craftable === "Non-Craftable" ? 'Non-Craftable' : '';
    }

    return '';
}

function getKillstreaker(options) {
    if (options.hasOwnProperty('killstreak') && options.killstreak != 'No_Killstreak' && (options.killstreak == 'Normal' || options.killstreak == 'Specialized' || options.killstreak == 'Professional')) {
        return [options.killstreak + " Killstreaks Active"];
    }

    return '';
}

function getUnusualEffect(options) {

    if (options.hasOwnProperty('effect') && options.effect != 'No_Effect' && TF2UnusualParticlesData[options.effect] !== -1) {
        return options.effect;
    }

    return '';
}

function getPaintColor(options) {
    if (options.hasOwnProperty('paint') && options.paint != 'No_Paint' && TF2PaintsData[options.paint] !== -1) {
        return options.paint;
    }

    return '';
}

module.exports = {
    getTF2Descriptions: getTF2Descriptions
}