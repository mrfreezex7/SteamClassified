
const passport = require('passport');
const PageController = require('../controllers/page');


exports.init = (router) => {

    router.get('/auth/steam',
        passport.authenticate('steam', { failureRedirect: '/' }),
        (req, res) => {
            res.redirect('/');
        });

    router.get('/auth/steam/return',
        passport.authenticate('steam', { failureRedirect: '/' }),
        (req, res) => {
            var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
            delete req.session.redirect_to;
            res.redirect(redirect_to);
        });

    router.get('/logout', async (req, res) => {
        await req.logout();
        res.redirect('/');
    });

}