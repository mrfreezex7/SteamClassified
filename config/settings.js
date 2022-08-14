module.exports = {
    sanitizeOptions: {
        allowedTags: ['p', 'ol', 'ul', 'li', 'span', 'br', 'u', 'em', 'strong', 's', 'a'],
        allowedAttributes: false // all attr allowed
    },
    postSlotAllowedLimit: {
        7: 50,//admin
        1: 10,//mod
        2: 5, //member
        3: 10,//premium
        410: 0 //banned
    },
    roleColor: {
        7: '#2ECC71',
        1: '#D35400',
        2: '#70A1C5',
        3: '#FE8656',
        410: '#6f6f6f'
    },
    postPerPageLimit: 10,
}