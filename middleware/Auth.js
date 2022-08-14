const config = require('../config/keys')
const MainController = require('../controllers/main-controller');

exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        req.session.redirect_to = req.route.path;
        res.redirect('/auth/steam');
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.user) {
        if (req.user.steamID === process.env.ADMIN_ID) {
            next();
        } else {
            res.redirect('/404');
        }
    } else {
        req.session.redirect_to = req.route.path;
        res.redirect('/auth/steam');
    }
}

exports.isMaintenceMode = (req, res, next) => {
    if (config.maintenance.current) {
        MainController.getMaintenancePage(req, res, next);
    } else {
        next();
    }
}