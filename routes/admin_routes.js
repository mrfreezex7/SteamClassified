const PageController = require('../controllers/page');
const Auth = require('../middleware/Auth');


exports.init = (router) => {

    router.get('/admin', Auth.isAdmin, PageController.Admin.getAdminDashboard);

    router.get('/admin/manage-database', Auth.isAdmin, PageController.Admin.getAdminManageDatabase);

    router.get('/admin/tickets/my', Auth.isAdmin, PageController.Admin.getAdminTickets);
    router.get('/admin/tickets/my/:page', Auth.isAdmin, PageController.Admin.getAdminTickets);
    router.get('/admin/tickets/open', Auth.isAdmin, PageController.Admin.getAdminOpenTickets);
    router.get('/admin/tickets/open/:page', Auth.isAdmin, PageController.Admin.getAdminOpenTickets);
    router.get('/admin/tickets/closed', Auth.isAdmin, PageController.Admin.getAdminClosedTickets);
    router.get('/admin/tickets/closed/:page', Auth.isAdmin, PageController.Admin.getAdminClosedTickets);

    router.get('/admin/reports/my', Auth.isAdmin, PageController.Admin.getAdminReports);
    router.get('/admin/reports/my/:page', Auth.isAdmin, PageController.Admin.getAdminReports);
    router.get('/admin/reports/open', Auth.isAdmin, PageController.Admin.getAdminOpenReports);
    router.get('/admin/reports/open/:page', Auth.isAdmin, PageController.Admin.getAdminOpenReports);
    router.get('/admin/reports/closed', Auth.isAdmin, PageController.Admin.getAdminClosedReports);
    router.get('/admin/reports/closed/:page', Auth.isAdmin, PageController.Admin.getAdminClosedReports);

    router.get('/admin/manage/users', Auth.isAdmin, PageController.Admin.getAdminManageUsers);
}