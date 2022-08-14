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

const ITEM_TYPE = Object.freeze({
    'Cosmetic': 'Cosmetic',
    'Tool': 'Tool',
    'Action': 'Action',
    'Primary': 'Primary',
    'Secondary': 'Secondary',
    'Melee': 'Melee',
    'Building': 'Building',
    'Pda': 'Pda',
    'Pda2': 'Pda2',
    'Taunt': 'Taunt',
})

const SKIN_EXTERIOR_QUALITY = Object.freeze({
    'Factory New': 'Factory New',
    'Minimal Wear': 'Minimal Wear',
    'Field-Tested': 'Field-Tested',
    'Well-Worn': 'Well-Worn',
    'Battle-Scarred': 'Battle-Scarred',
})

module.exports = {
    QUALITY: QUALITY,
    ITEM_TYPE: ITEM_TYPE,
    SKIN_EXTERIOR_QUALITY: SKIN_EXTERIOR_QUALITY
}