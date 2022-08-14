const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const keys = require('./keys');
const mongoose = require('mongoose');
const User = require('../models/User');
const Site = require('../enum/site');
const settings = require('../config/settings');
const { log } = require('../models/Logger');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((userdata, done) => {
    done(null, userdata);
});

passport.use(new SteamStrategy({
    returnURL: keys.passportOption.returnURL
    , realm: keys.passportOption.realm
    , apiKey: keys.TestBot.apiKey
}, (identifier, profile, done) => {


    process.nextTick(() => {
        User.findOne({ steamID: profile.id }).then((currentUser) => {
            if (currentUser) {
                currentUser.personaName = profile._json.personaname;
                currentUser.avatar = profile._json.avatar;
                return done(null, User.getMinimalData(currentUser));
            } else {
                let isAdmin = (process.env.ADMIN_ID === profile._json.steamid);
                new User({
                    _id: new mongoose.Types.ObjectId(),
                    userId: profile._json.steamid,
                    name: profile._json.personaname,
                    profilePic: profile._json.avatar,
                    profilePicFull: profile._json.avatarfull,
                    steamID: profile._json.steamid,
                    profileUrl: profile._json.profileurl,
                    role: isAdmin ? Site.ROLES.Admin : Site.ROLES.Member,
                    roleColor: isAdmin ? settings.roleColor[Site.ROLES.Admin] : settings.roleColor[Site.ROLES.Member],
                    roleName: isAdmin ? Site.ROLES[Site.ROLES.Admin] : Site.ROLES[Site.ROLES.Member],
                })
                    .save()
                    .then(currentUser => {
                        log.info('new user joined ' + currentUser.name);
                        return done(null, User.getMinimalData(currentUser));
                    })
                    .catch(err => log.info(err));

            }
        })
    })

}));