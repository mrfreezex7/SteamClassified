

const Ticket = require('../models/Ticket');
const Report = require('../models/Report');
const ErrorController = require('./error-controller');
const { log } = require('../models/Logger');

exports.getMySupportPage = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('support_pages/overview', { pageTitle: "Support - SteamClassified.com", user: SteamUser, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
}

exports.getMyOpenTicketsPage = async (req, res, next) => {
    const SteamUser = req.user;


    const page = parseInt(req.params.page) || 1;

    Ticket.getMySupportTickets(SteamUser._id, page, false).then(({ docs, pagination }) => {
        res.render('support_pages/my-open-tickets', { pageTitle: "Open Tickets - SteamClassified.com", user: SteamUser, tickets: docs, pagination, pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('support_pages/my-open-tickets', { pageTitle: "Open Tickets - SteamClassified.com", user: SteamUser, tickets: [], pagination: [], hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })
}

exports.getMyClosedTicketsPage = async (req, res, next) => {
    const SteamUser = req.user;

    const page = parseInt(req.params.page) || 1;

    Ticket.getMySupportTickets(SteamUser._id, page, true).then(({ docs, pagination }) => {
        res.render('support_pages/my-closed-tickets', { pageTitle: "Closed Tickets - SteamClassified.com", user: SteamUser, tickets: docs, pagination, pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('support_pages/my-closed-tickets', { pageTitle: "Closed Tickets - SteamClassified.com", user: SteamUser, tickets: [], pagination: [], hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })
}

exports.getReportsPage = async (req, res, next) => {
    const SteamUser = req.user;

    const page = parseInt(req.params.page) || 1;

    Report.getMyReports(SteamUser._id, page).then(({ docs, pagination }) => {
        res.render('support_pages/my-reports', { pageTitle: "Reports - SteamClassified.com", user: SteamUser, reports: docs, pagination, pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('support_pages/my-reports', { pageTitle: "Reports - SteamClassified.com", user: SteamUser, reports: [], pagination: [], hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })

}

exports.getTicketPage = async (req, res, next) => {

    const SteamUser = req.user;
    const ticketId = parseInt(req.params.ticketId);
    log.info('getting ticket')

    Ticket.getTicket(ticketId, SteamUser).then(ticket => {
        res.render('pages/ticket', { pageTitle: "Ticket #" + ticket.ticketId + " - SteamClassified.com", user: SteamUser, ticket: ticket, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        ErrorController.get404Page(req, res, next);
    })


}