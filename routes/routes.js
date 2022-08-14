const express = require('express');
const router = express.Router();

const MainRoutes = require('./main_routes');
const SupportRoutes = require('./support_routes');
const AdminRoutes = require('./admin_routes');
const AuthRoutes = require('./auth_routes');



MainRoutes.init(router);
SupportRoutes.init(router);
AdminRoutes.init(router);
AuthRoutes.init(router);



module.exports = router;
