const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');
const Ticket = require('../models/Ticket');
const Report = require('../models/Report');
const Admin = require('../models/Admin');

const config = require('../config/keys');
const { log } = require('../models/Logger');


exports.getAdminDashboard = async (req, res, next) => {
    const SteamUser = req.user;

    let dashboardData = await Admin.getDashBoardData();

    res.render('admin_pages/dashboard', { pageTitle: "SteamClassified - Admin", user: SteamUser, dashboard: dashboardData, isMaintenance: config.maintenance.current, hasSEO: false, NODE_ENV: false });
}

exports.getAdminManageDatabase = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('admin_pages/manage-database', { pageTitle: "SteamClassified - Admin", user: SteamUser, hasSEO: false, NODE_ENV: false });
}

exports.getAdminTickets = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Admin.getTickets(false, page, SteamUser._id).then(({ docs, pagination }) => {
        res.render('admin_pages/my-tickets', { pageTitle: "SteamClassified - Admin", user: SteamUser, tickets: docs, pagination, pagination, hasSEO: false, NODE_ENV: false });
    }).catch(err => {
        log.info(err);
        res.render('admin_pages/my-tickets', { pageTitle: "SteamClassified - Admin", user: SteamUser, tickets: [], pagination: [], hasSEO: false, NODE_ENV: false });
    })
}

exports.getAdminOpenTickets = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Admin.getTickets(false, page).then(({ docs, pagination }) => {
        res.render('admin_pages/open-tickets', { pageTitle: "SteamClassified - Admin", user: SteamUser, tickets: docs, pagination, pagination, hasSEO: false, NODE_ENV: false });
    }).catch(err => {
        log.info(err);
        res.render('admin_pages/open-tickets', { pageTitle: "SteamClassified - Admin", user: SteamUser, tickets: [], pagination: [], hasSEO: false, NODE_ENV: false });
    })
}

exports.getAdminClosedTickets = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Admin.getTickets(true, page).then(({ docs, pagination }) => {
        res.render('admin_pages/closed-tickets', { pageTitle: "SteamClassified - Admin", user: SteamUser, tickets: docs, pagination, pagination, hasSEO: false, NODE_ENV: false });
    }).catch(err => {
        log.info(err);
        res.render('admin_pages/closed-tickets', { pageTitle: "SteamClassified - Admin", user: SteamUser, tickets: [], pagination: [], hasSEO: false, NODE_ENV: false });
    })
}

exports.getAdminReports = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Admin.getReports(false, page, SteamUser._id).then(({ docs, pagination }) => {
        res.render('admin_pages/my-reports', { pageTitle: "SteamClassified - Admin", user: SteamUser, reports: docs, pagination, pagination, hasSEO: false, NODE_ENV: false });
    }).catch(err => {
        log.info(err);
        res.render('admin_pages/my-reports', { pageTitle: "SteamClassified - Admin", user: SteamUser, reports: [], pagination: [], hasSEO: false, NODE_ENV: false });
    })
}

exports.getAdminOpenReports = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Admin.getReports(false, page).then(({ docs, pagination }) => {
        res.render('admin_pages/open-reports', { pageTitle: "SteamClassified - Admin", user: SteamUser, reports: docs, pagination, pagination, hasSEO: false, NODE_ENV: false });
    }).catch(err => {
        log.info(err);
        res.render('admin_pages/open-reports', { pageTitle: "SteamClassified - Admin", user: SteamUser, reports: [], pagination: [], hasSEO: false, NODE_ENV: false });
    })

}

exports.getAdminClosedReports = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Admin.getReports(true, page).then(({ docs, pagination }) => {
        res.render('admin_pages/closed-reports', { pageTitle: "SteamClassified - Admin", user: SteamUser, reports: docs, pagination, pagination, hasSEO: false, NODE_ENV: false });
    }).catch(err => {
        log.info(err);
        res.render('admin_pages/closed-reports', { pageTitle: "SteamClassified - Admin", user: SteamUser, reports: [], pagination: [], hasSEO: false, NODE_ENV: false });
    })

}

exports.getAdminManageUsers = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('admin_pages/manage-users', { pageTitle: "SteamClassified - Admin", user: SteamUser, hasSEO: false, NODE_ENV: false });
}