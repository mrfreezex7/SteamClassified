const ROLES = {
    Admin: 7,
    Moderator: 1,
    Member: 2,
    Premium: 3,
    Banned: 410,
    7: 'Admin',
    1: 'Moderator',
    2: 'Member',
    3: 'Premium',
    410: 'Banned'
}

const ITEM_ICON_SIZE = {
    TF2: '/64fx64f',
    CSGO: '/64fx64f',
    DOTA2: '/64fx64f'
}

module.exports = {
    ROLES: ROLES,
    ITEM_ICON_SIZE: ITEM_ICON_SIZE,
}