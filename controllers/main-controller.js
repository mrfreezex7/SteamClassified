const mongoose = require('mongoose');
const moment = require('moment');

const User = require('../models/User');
const Post = require('../models/Post');
const { log } = require('../models/Logger');


exports.getMaintenancePage = async (req, res, next) => {
    res.render('pages/maintenance', { pageTitle: "Maintenance - SteamClassified.com", hasSEO: false, NODE_ENV: process.env.NODE_ENV });
}

exports.getIndexPage = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Post.getPosts(page).then(({ docs, pagination }) => {
        res.render('pages/index', { pageTitle: "Steam Classified - Trade TF2, Dota2, CS:GO and more!", user: SteamUser, posts: docs, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/index', { pageTitle: "Steam Classified - Trade TF2, Dota2, CS:GO and more!", user: SteamUser, posts: [], pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })


}

exports.getPrivacyPolicyPage = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('pages/privacy-policy', { pageTitle: "Privacy Policy - SteamClassified.com", user: SteamUser, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
}

exports.getTermsOfServicePage = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('pages/terms-of-service', { pageTitle: "Terms of Service - SteamClassified.com", user: SteamUser, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
}

exports.getSettingsPage = async (req, res, next) => {
    const SteamUser = req.user;
    User.getTradeUrl(SteamUser._id).then(({ tradeUrl }) => {
        req.user.tradeUrl = tradeUrl;
        res.render('pages/settings', { pageTitle: "Settings - SteamClassified.com", user: SteamUser, hasSEO: false, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        req.user.tradeUrl = '';
        res.render('pages/settings', { pageTitle: "Settings - SteamClassified.com", user: SteamUser, hasSEO: false, NODE_ENV: process.env.NODE_ENV });
        log.info(err);
    })



}

exports.getRecentPostPage = async (req, res, next) => {
    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Post.getPosts(page).then(({ docs, pagination }) => {
        res.render('pages/index', { pageTitle: "Steam Classified - Trade TF2, Dota2, CS:GO and more!", user: SteamUser, posts: docs, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/index', { pageTitle: "Steam Classified - Trade TF2, Dota2, CS:GO and more!", user: SteamUser, posts: [], pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })
}

exports.getCreatePostPage = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('pages/createPost', { pageTitle: "Create New Trade - SteamClassified.com", user: SteamUser, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
}


exports.getTradesPage = async (req, res, next) => {

    const SteamUser = req.user;
    const page = parseInt(req.params.page) || 1;

    Post.getUserTradePosts(SteamUser.userId, page).then(({ docs, pagination }) => {
        res.render('pages/trades', { pageTitle: "My Trades - SteamClassified.com", user: SteamUser, posts: docs, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/trades', { pageTitle: "My Trades - SteamClassified.com", user: SteamUser, posts: result.results, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })
}


exports.getBookmarksPage = async (req, res, next) => {

    const SteamUser = req.user;


    const page = parseInt(req.params.page) || 1;

    User.getBookmarks(SteamUser.userId, page).then(({ docs, pagination }) => {
        res.render('pages/bookmarks', { pageTitle: "Bookmarks - SteamClassified.com", user: SteamUser, posts: docs, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/bookmarks', { pageTitle: "Bookmarks - SteamClassified.com", user: SteamUser, posts: result.results, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })

}




exports.getOffersPage = async (req, res, next) => {

    const SteamUser = req.user;

    const page = parseInt(req.params.page) || 1;
    User.getOffers(SteamUser._id, page).then(({ docs, pagination }) => {
        res.render('pages/offers', { pageTitle: "Offers - SteamClassified.com", user: SteamUser, posts: docs, pagination: pagination, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/offers', { pageTitle: "Offers - SteamClassified.com", user: SteamUser, posts: [], pagination: [], hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    })


}



exports.getSearchPage = async (req, res, next) => {
    const SteamUser = req.user;
    res.render('pages/searchPost', { pageTitle: "Search Trade - SteamClassified.com", user: SteamUser, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
}

exports.getSearchResultPage = async (req, res, next) => {
    const SteamUser = req.user;

    const page = parseInt(req.params.page) || 1;

    Post.getSearchedPosts(SteamUser.userId, page).then(({ docs, pagination }) => {
        res.render('pages/searchResult', { pageTitle: "Search Result - SteamClassified.com", user: SteamUser, posts: docs, pagination, pagination, hasSEO: false, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/searchResult', { pageTitle: "Search Result - SteamClassified.com", user: SteamUser, posts: [], pagination: [], hasSEO: false, NODE_ENV: process.env.NODE_ENV });
    })

}

exports.getTradePostPage = async (req, res, next) => {
    const SteamUser = req.user;
    const postId = parseInt(req.params.postId);

    Post.getPost(postId, SteamUser).then(({ post, isBookmarked }) => {
        res.render('pages/tradePost', { pageTitle: "Trade #" + post.postId + " - SteamClassified.com", user: SteamUser, post: post, isBookmarked: isBookmarked, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        res.render('pages/404', { pageTitle: "404 Error", post: [], hasSEO: false, NODE_ENV: process.env.NODE_ENV });
    })

}

exports.getUserProfilePage = async (req, res, next) => {

    const SteamUser = req.user;
    const userId = req.params.userId;
    const page = parseInt(req.params.page) || 1;
    let isOwner = false;

    if (SteamUser) {
        isOwner = SteamUser.userId == userId;
    }


    User.getProfileData(userId, isOwner, true, page).then(({ user, posts }) => {
        res.render('pages/userProfile', { pageTitle: user.name + " Profile - SteamClassified.com", user: SteamUser, posts: posts.docs, profileData: user, subNav: 'trades', pagination: posts.pagination, moment: moment, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        log.info(err);
        res.render('pages/404', { pageTitle: "404 Error", post: [], hasSEO: false, NODE_ENV: process.env.NODE_ENV });
    })


}

exports.getUserProfileBackpackPage = async (req, res, next) => {

    const SteamUser = req.user;
    const userId = req.params.userId;
    let isOwner = false;

    if (SteamUser) {
        isOwner = SteamUser.userId == userId;
    }

    User.getProfileData(userId, isOwner).then(({ user }) => {
        res.render('pages/userProfile', { pageTitle: "SteamClassified.com", user: SteamUser, profileData: user, subNav: 'backpack', moment: moment, hasSEO: true, NODE_ENV: process.env.NODE_ENV });
    }).catch(err => {
        res.render('pages/404', { pageTitle: "404 Error", post: [], hasSEO: false, NODE_ENV: process.env.NODE_ENV });
    })


}
