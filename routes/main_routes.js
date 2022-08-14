const PageController = require('../controllers/page');

const Auth = require('../middleware/Auth');
const UserMiddleware = require('../middleware/user-middleware');
const RateLimiter = require('../middleware/RateLimiter');


exports.init = (router) => {
    router.get('/', Auth.isMaintenceMode, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getIndexPage);
    router.get('/recent/:page', Auth.isMaintenceMode, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getRecentPostPage);

    router.get('/create', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getCreatePostPage);

    router.get('/bookmarks', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getBookmarksPage);
    router.get('/bookmarks/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getBookmarksPage);

    router.get('/trades', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getTradesPage);
    router.get('/trades/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getTradesPage);

    router.get('/offers', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getOffersPage);
    router.get('/offers/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getOffersPage);

    router.get('/search', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getSearchPage);

    router.get('/searchResult', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getSearchResultPage);
    router.get('/searchResult/:page', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getSearchResultPage);

    router.get('/trade/:postId', Auth.isMaintenceMode, RateLimiter.limit, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getTradePostPage);

    router.get('/user/:userId', Auth.isMaintenceMode, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getUserProfilePage);
    // router.get('/user/:userId/backpack', Auth.isMaintenceMode, UserMiddleware.getUpdatedUserData, PageController.Main.getUserProfileBackpackPage);
    router.get('/user/:userId/:page', Auth.isMaintenceMode, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getUserProfilePage);

    router.get('/settings', Auth.isMaintenceMode, RateLimiter.limit, Auth.isLoggedIn, UserMiddleware.getUpdatedUserData, PageController.Main.getSettingsPage);

    router.get('/privacy-policy', Auth.isMaintenceMode, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getPrivacyPolicyPage);
    router.get('/terms-of-service', Auth.isMaintenceMode, RateLimiter.limit, UserMiddleware.getUpdatedUserData, PageController.Main.getTermsOfServicePage);
}