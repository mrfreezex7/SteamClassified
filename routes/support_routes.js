const PageController = require('../controllers/page');
const Auth = require('../middleware/Auth');
const UserMiddleware = require('../middleware/user-middleware');
const RateLimiter = require('../middleware/RateLimiter');

exports.init = (router) => {

    router.get('/support', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getMySupportPage);

    router.get('/support/tickets/open', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getMyOpenTicketsPage);
    router.get('/support/tickets/open/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getMyOpenTicketsPage);

    router.get('/support/tickets/closed', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getMyClosedTicketsPage);
    router.get('/support/tickets/closed/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getMyClosedTicketsPage);

    router.get('/support/reports', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getReportsPage);
    router.get('/support/reports/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getReportsPage);


    router.get('/ticket/:ticketId', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Support.getTicketPage);
}