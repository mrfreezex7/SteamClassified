function getDOTA2Descriptions(item) {
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
            result = { name: tag.name, color: tag.color };
        }
    })
    return result;
}

function getDOTA2_Quality(item) {
    let result = '';
    item.tags.forEach(tag => {
        if (tag.category == 'Quality') {
            result = { name: tag.name, color: tag.color };
        }
    })
    return result;
}
module.exports = {
    getDOTA2Descriptions: getDOTA2Descriptions,
}