import * as particleDB from './particleDB.js';
import * as TF2DB from './TF2DB.js';

export const APP_ID = Object.freeze({
    440: 'TF2',
    730: 'CSGO',
    570: 'DOTA2',
    252490: 'RUST',

    'TF2': 440,
    'CSGO': 730,
    'DOTA2': 570,
    'RUST': 252490
})

export const DefaultOption = Object.freeze({
    440: {
        quality: 'Unique',
        paint: 'No_Paint',
        effect: 'No_Effect',
        killstreak: 'No_Killstreak',
        parts: 'No_Parts',
        exterior: 'No_Exterior',
        craftable: 'Craftable',
    }
})

const QUALITY = Object.freeze({
    'Normal': 'Normal',
    'Unique': 'Unique',
    'Vintage': 'Vintage',
    'Genuine': 'Genuine',
    'Strange': 'Strange',
    'Unusual': 'Unusual',
    'Haunted': 'Haunted',
    "Collectors": 'Collectors',
    'Decorated': 'Decorated',
    'Community': 'Community',
    'Self-Made': 'Self-Made',
    'Valve': 'Valve'
})

const SKIN_EXTERIOR_QUALITY = Object.freeze({
    'Factory New': 'Factory New',
    'Minimal Wear': 'Minimal Wear',
    'Field-Tested': 'Field-Tested',
    'Well-Worn': 'Well-Worn',
    'Battle-Scarred': 'Battle-Scarred',
})

const TF2_SPELL_LIST = Object.freeze({
    'Team Spirit Footprints': 'Team Spirit Footprints',
    'Gangreen Footprints': 'Gangreen Footprints',
    'Corpse Gray Footprints': 'Corpse Gray Footprints',
    'Violent Violet Footprints': 'Violent Violet Footprints',
    'Rotten Orange Footprints': 'Rotten Orange Footprints',
    'Bruised Purple Footprints': 'Bruised Purple Footprints',
    'Headless Horseshoes': 'Headless Horseshoes',
    'Die Job': 'Die Job',
    'Spectral Spectrum': 'Spectral Spectrum',
    'Putrescent Pigmentation': 'Putrescent Pigmentation',
    'Sinister Staining': 'Sinister Staining',
    'Chromatic Corruption': 'Chromatic Corruption',
    'Exorcism': 'Exorcism',
    'Voices from Below': 'Voices from Below',
    'Pumpkin Bombs': 'Pumpkin Bombs',
    'Halloween Fire': 'Halloween Fire',
})

const TF2_PART_LIST = Object.freeze({
    "Airborne Enemies Killed": "Airborne Enemies Killed",
    "Heavies Killed": "Heavies Killed",
    "Demomen Killed": "Demomen Killed",
    "Revenge Kills": "Revenge Kills",
    "Domination Kills": "Domination Kills",
    "Soldiers Killed": "Soldiers Killed",
    "Full Moon Kills": "Full Moon Kills",
    "Cloaked Spies Killed": "Cloaked Spies Killed",
    "Scouts Killed": "Scouts Killed",
    "Engineers Killed": "Engineers Killed",
    "Robots Destroyed": "Robots Destroyed",
    "Low-Health Kills": "Low-Health Kills",
    "Halloween Kills": "Halloween Kills",
    "Robots Destroyed During Halloween": "Robots Destroyed During Halloween",
    "Underwater Kills": "Underwater Kills",
    "Snipers Killed": "Snipers Killed",
    "Kills While Übercharged": "Kills While Übercharged",
    "Pyros Killed": "Pyros Killed",
    "Defender Kills": "Defender Kills",
    "Medics Killed": "Medics Killed",
    "Tanks Destroyed": "Tanks Destroyed",
    "Medics Killed That Have Full ÜberCharge": "Medics Killed That Have Full ÜberCharge",
    "Giant Robots Destroyed": "Giant Robots Destroyed",
    "Kills During Victory Time": "Kills During Victory Time",
    "Robot Spies Destroyed": "Robot Spies Destroyed",
    "Unusual-Wearing Player Kills": "Unusual-Wearing Player Kills",
    "Spies Killed": "Spies Killed",
    "Burning Enemy Kills": "Burning Enemy Kills",
    "Killstreaks Ended": "Killstreaks Ended",
    "Damage Dealt": "Damage Dealt",
    "Point-Blank Kills": "Point-Blank Kills",
    "Full Health Kills": "Full Health Kills",
    "Robot Scouts Destroyed": "Robot Scouts Destroyed",
    "Taunting Player Kills": "Taunting Player Kills",
    "Not Crit nor MiniCrit Kills": "Not Crit nor MiniCrit Kills",
    "Player Hits": "Player Hits",
    "Gib Kills": "Gib Kills",
    "Buildings Destroyed": "Buildings Destroyed",
    "Headshot Kills": "Headshot Kills",
    "Projectiles Reflected": "Projectiles Reflected",
    "Allies Extinguished": "Allies Extinguished",
    "Posthumous Kills": "Posthumous Kills",
    "Critical Kills": "Critical Kills",
    "Kills While Explosive Jumping": "Kills While Explosive Jumping",
    "Sappers Destroyed": "Sappers Destroyed",
    "Long-Distance Kills": "Long-Distance Kills",
    "Kills with a Taunt Attack": "Kills with a Taunt Attack",
    "Freezecam Taunt Appearances": "Freezecam Taunt Appearances",
    "Fires Survived": "Fires Survived",
    "Kills": "Kills",
    "Assists": "Assists",
    "Allied Healing Done": "Allied Healing Done"
})

let TF2_KILLSTREAK_SHEEN = {
    "Team Shine": "Team Shine",
    "Hot Rod": "Hot Rod",
    "Manndarin": "Manndarin",
    "Deadly Daffodil": "Deadly Daffodil",
    "Agonizing Emerald": "Agonizing Emerald",
    "Mean Green": "Mean Green",
    "Villainous Violet": "Villainous Violet"
}

let TF2_KILLSTREAK_KILLSTREAKER = {
    "Cerebral Discharge": "Cerebral Discharge",
    "Fire Horns": "Fire Horns",
    "Flames": "Flames",
    "Hypno-Beam": "Hypno-Beam",
    "Incinerator": "Incinerator",
    "Singularity": "Singularity",
    "Tornado": "Tornado",
}


export function getTF2Descriptions(item) {
    let descriptionData = {
        'type': item.type,
        'paint': getPaintColor(item),
        'effect': getUnusualEffect(item),
        'killstreak': getKillstreaker(item),
        'craftable': getCraftable(item),
        'exterior': getSkinExterior(item),
        'spells': getSpells(item),
        'parts': getParts(item),
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

export function getParts(item) {
    let result = [];

    for (let i = 0; i < item.descriptions.length - 1; i++) {
        const element = item.descriptions[i];
        for (const key in TF2_PART_LIST) {
            if (Object.hasOwnProperty.call(TF2_PART_LIST, key)) {
                if (element.value.indexOf(key + ":") !== -1 && result.indexOf(key) == -1) {
                    result.push(key);
                }
            }
        }

    }

    if (result.length <= 0) {
        result = '';
    }
    return result;
}

export function getSpells(item) {
    let result = [];
    item.descriptions.forEach(description => {
        if (description.value.indexOf("Halloween:") !== -1 && description.value.indexOf("(spell only active during event)") !== -1) {
            let name = description.value.replace('Halloween:', '').replace('(spell only active during event)', '').trim();
            if (TF2_SPELL_LIST[name]) {
                result.push(TF2_SPELL_LIST[name]);
            }
        }
    })
    if (result.length <= 0) {
        result = '';
    }
    return result;
}

export function getSkinExterior(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == "Exterior" && SKIN_EXTERIOR_QUALITY[tag.name]) {
            result = SKIN_EXTERIOR_QUALITY[tag.name];
        }
    })

    return result;
}

export function getCraftable(item) {
    let result = 'Craftable';
    item.descriptions.forEach(description => {
        if (description.value.indexOf("( Not Usable in Crafting )") !== -1) {
            result = 'Non-Craftable';
        }
    })
    return result;
}

export function getKillstreaker(item) {
    if (item.name.indexOf('Fabricator') != -1 && item.tags[1].name == 'Recipe') {
        let type = item.market_hash_name.indexOf('Specialized') != -1 ? 'Specialized' : item.market_hash_name.indexOf('Professional') != -1 ? 'Professional' : '';
        return [type, item.descriptions[item.descriptions.length - 3].value];
    } else if (item.tags[1].name == 'Professional Killstreak Kit') {
        let type = item.market_hash_name.indexOf('Specialized') != -1 ? 'Specialized' : item.market_hash_name.indexOf('Professional') != -1 ? 'Professional' : '';
        return [type, item.descriptions[0].value, item.descriptions[1].value];
    } else if (item.tags[1].name == 'Specialized Killstreak Kit') {
        return [item.descriptions[0].value];
    } else {
        return getItemKillstreak(item);
    }
}

export function getItemKillstreak(item) {
    let result = [];
    let type = item.market_hash_name.indexOf('Specialized') != -1 ? 'Specialized' : item.market_hash_name.indexOf('Professional') != -1 ? 'Professional' : '';

    let confirmedKillstrekItem = false;

    if (type != '') {

        item.descriptions.forEach(description => {
            if (description.value.indexOf("Killstreaks Active") != -1 && description.value.length == 18) {
                confirmedKillstrekItem = true;
                result.push(type + ' Killstreaks Active');
            }
        })

        if (confirmedKillstrekItem) {
            if (type == 'Specialized') {
                item.descriptions.forEach(description => {
                    if (description.value.indexOf("Sheen:") != -1) {
                        let sheenName = description.value.replace('Sheen:', '').trim();
                        if (TF2_KILLSTREAK_SHEEN[sheenName]) {
                            result.push('Sheen: ' + TF2_KILLSTREAK_SHEEN[sheenName]);
                        }
                    }
                })
            } else if (type == 'Professional') {
                item.descriptions.forEach(description => {
                    if (description.value.indexOf("Sheen:") != -1) {
                        let sheenName = description.value.replace('Sheen:', '').trim();
                        if (TF2_KILLSTREAK_SHEEN[sheenName]) {
                            result.push('Sheen: ' + TF2_KILLSTREAK_SHEEN[sheenName]);
                        }
                    }
                    if (description.value.indexOf("Killstreaker:") != -1) {
                        let killstreakName = description.value.replace('Killstreaker:', '').trim();
                        if (TF2_KILLSTREAK_KILLSTREAKER[killstreakName]) {
                            result.push('Killstreaker: ' + TF2_KILLSTREAK_KILLSTREAKER[killstreakName]);
                        }
                    }
                })
            }
        }
    } else {
        return ''
    }

    if (result.length <= 0) {
        result = '';
    }

    return result;




}

export function getUnusualEffect(item) {

    let result = '';


    if (item.hasOwnProperty('tags') && item.tags[0].name === 'Unusual') {
        item.descriptions.forEach(description => {
            if (description.value.indexOf('★ Unusual Effect:') !== -1 && description.hasOwnProperty('color')) {
                result = description.value.replace('★ Unusual Effect:', '').trim();
            }
        });
    }

    return result;
}

export function getPaintColor(item) {
    let result = '';
    item.descriptions.forEach(description => {
        if (description.value.indexOf('Paint Color:') !== -1 && description.hasOwnProperty('color')) {
            result = description.value.replace('Paint Color:', '').trim();
        }
    });
    return result;
}


export function GetSearchQuery(searchData) {

    if (searchData.offeringItems.length > 0 && searchData.requestingItems.length > 0) {
        return getBothSideQuery(searchData.offeringItems[0], searchData.requestingItems[0]);
    } else if (searchData.offeringItems.length > 0) {
        return getOfferingSideQuery(searchData.offeringItems[0]);
    } else if (searchData.requestingItems.length > 0) {
        return getRequestingSideQuery(searchData.requestingItems[0]);
    } else {
        return false;
    }
}


function getBothSideQuery(offeringItem, requestingItem) {
    let offeringSearchQuery = getOfferingSideQuery(offeringItem);
    let requestingSearchQuery = getRequestingSideQuery(requestingItem);


    if (offeringSearchQuery && requestingSearchQuery) {
        return { $and: [offeringSearchQuery, requestingSearchQuery] };
    } else {
        return false;
    }
}

function getOfferingSideQuery(offeringItem) {
    let { quality, descriptionQuery } = getDescriptionQuery(offeringItem, 'offering');
    let searchQuery = {};
    if (offeringItem.hasOwnProperty('query')) {
        searchQuery = { 'offering.appID': offeringItem.appID, 'offering.market_hash_name': offeringItem.query }
    } else {
        searchQuery = { 'offering.appID': offeringItem.appID, 'offering.market_hash_name': quality == QUALITY.Unique ? offeringItem.name : quality + ' ' + offeringItem.name }
    }

    if (descriptionQuery !== null) {
        for (const key in descriptionQuery) {
            if (Object.hasOwnProperty.call(descriptionQuery, key)) {
                const value = descriptionQuery[key];
                searchQuery[key] = value;
            }
        }
        return searchQuery;
    } else {
        return searchQuery;
    }
}

function getRequestingSideQuery(requestingItem) {
    let { quality, descriptionQuery } = getDescriptionQuery(requestingItem, 'requesting');
    let searchQuery = {};
    if (requestingItem.hasOwnProperty('query')) {
        searchQuery = { 'requesting.appID': requestingItem.appID, 'requesting.market_hash_name': requestingItem.query }
    } else {
        searchQuery = { 'requesting.appID': requestingItem.appID, 'requesting.market_hash_name': quality == QUALITY.Unique ? requestingItem.name : quality + ' ' + requestingItem.name }
    }

    if (descriptionQuery !== null) {
        for (const key in descriptionQuery) {
            if (Object.hasOwnProperty.call(descriptionQuery, key)) {
                const value = descriptionQuery[key];
                searchQuery[key] = value;
            }
        }
        return searchQuery;
    } else {
        return searchQuery;
    }
}

function getDescriptionQuery(item, itemSlot) {
    let descriptionQuery = {}
    let quality = QUALITY.Unique;
    if (item.hasOwnProperty('options')) {

        quality = item.options.quality;

        for (const key in item.options) {
            if (Object.hasOwnProperty.call(item.options, key)) {
                const itemValue = item.options[key];
                if (DefaultOption[440][key] != itemValue) {
                    if (key == 'parts' && TF2DB.partsData[itemValue]) {
                        descriptionQuery[itemSlot + '.descriptions.' + key] = TF2DB.partsData[itemValue];
                    }
                    else if (key != 'quality') {
                        descriptionQuery[itemSlot + '.descriptions.' + key] = itemValue;
                    } else {
                        descriptionQuery[itemSlot + '.' + key] = itemValue;
                    }
                }
            }
        }

    } else {
        descriptionQuery[itemSlot + '.quality'] = QUALITY.Unique
    }

    return { quality: quality, descriptionQuery: descriptionQuery };

}

export function getCSGODescriptions(item) {
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

export function hasStatTrak(item) {
    if (item.market_hash_name.indexOf('StatTrak™') !== -1) {
        return true
    } else {
        return '';
    }
}

export function getParticlesLink(item, quality) {
    if (quality === 'Unusual') {
        let effect = getUnusualEffect(item);
        if (effect != '') {
            let particleLink = particleDB.data.data[effect];
            return particleLink;
        }
    } else {
        return '';
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
            result = { name: tag.name, color: '#' + tag.color };
        }
    })
    return result;
}

function getCSGO_Quality(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Quality') {
            result = { name: tag.name, color: '#' + tag.color };
        }
    })
    return result;
}


export function getDota2Descriptions(item) {
    let descriptionData = {
        'type': item.type,
        'rarity': getDOTA2_Rarity(item),
        'quality': getDOTA2_Quality(item),
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

function getDOTA2_Rarity(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Rarity') {
            result = { name: tag.name, color: '#' + tag.color };
        }
    })
    return result;
}

function getDOTA2_Quality(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Quality') {
            result = { name: tag.name, color: '#' + tag.color };
        }
    })
    return result;
}

