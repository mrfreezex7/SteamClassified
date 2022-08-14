const Inventory = require('./models/Inventory');

let Post = require('./models/Post');
const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const Offering = require('./models/Offering');
const Requesting = require('./models/Requesting');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Report = require('./models/Report');
const Admin = require('./models/Admin');
const { APP_ID } = require('./enum/game');
const config = require('./config/keys');
const settings = require('./config/settings');
const SearchQuery = require('./models/SearchQuery');
const { GlobalNotification, GlobalNotificationType } = require('./models/GlobalNotification');
const TF2ItemDatabase = require('./utility/TF2/ManageTF2ItemDatabase');
const CSGOItemDatabase = require('./utility/CSGO/ManageCSGOItemDatabase');
const DOTA2ItemDatabase = require('./utility/DOTA2/ManageDota2ItemDatabase');
const Maintenance = require('./models/Maintenance');
const TradeOfferParse = require('steam-tradeoffer-url-parser');
const { log } = require('./models/Logger');



exports.SocketConnect = (io) => {

    io.on('connection', socket => {

        let user = false;

        if (
            typeof socket.handshake.session.passport !== 'undefined' &&
            typeof socket.handshake.session.passport.user !== 'undefined' &&
            typeof socket.handshake.session.passport.user._id !== 'undefined'
        ) {
            user = socket.handshake.session.passport.user;
            log.info(user.name + " Connected");


            socket.on('GetUserInventory', (appID, cb) => {
                if (APP_ID[appID]) {
                    new Inventory(user.steamID, appID, '2').getUserInventory().then(items => {
                        cb(items);
                    })
                } else {
                    cb([]);
                }

            })

            socket.on('GetGameItems', (data, cb) => {
                Inventory.getGameItems(data.name, data.appid).then(items => {
                    cb(items)
                })
            })

            socket.on('AddComment', ({ postOwner_ID, post_Id, postId, commentText }, cb) => {

                Post.addComment(user._id, postOwner_ID, post_Id, postId, commentText).then(result => {
                    log.info(user.name + ' added a new comment');
                    cb(result);
                }).catch(err => {
                    log.info(err);
                    cb(false);
                });
            })

            socket.on('AddCommentReply', ({ postOwner_ID, post_Id, postId, commentId, commentText }, cb) => {
                Post.addCommentReply(user._id, postOwner_ID, post_Id, postId, commentId, commentText).then(result => {
                    log.info(user.name + ' replied to a comment');
                    cb(result);
                }).catch(err => {
                    log.info(err);
                    cb(false);
                });
            })

            socket.on('HideComment', ({ post_Id, comment_Id, reply_Id }, cb) => {
                Post.hideComment(user, post_Id, comment_Id, reply_Id).then(result => {
                    cb(result);
                }).catch(err => {
                    log.info(err);
                    cb(null);
                });
            })

            socket.on('SetBookmark', ({ postId, isBookmarked }, cb) => {
                User.setBookmark(user.userId, postId, isBookmarked).then(result => {
                    log.info(user.name + ' Bookmarked ' + postId + ' : ' + result);
                    cb(result);
                }).catch(err => {
                    log.info(err);
                });
            })

            socket.on('CreatePost', (data, cb) => {

                let post = new Post({
                    _id: new mongoose.Types.ObjectId(),
                    owner: user,
                    userId: user.userId,
                    offering: new Offering(data.offeringItems).getData(),
                    requesting: new Requesting(data.requestingItems).getData(),
                    notes: sanitizeHtml(data.notes, settings.sanitizeOptions),
                })

                if (post.offering.length > 0 && post.requesting.length > 0) {
                    post.createPost(user._id, result => {
                        log.info(user.name + ' created a new post');
                        cb(config.website.mainURL + 'trade/' + result);
                    })
                } else {
                    cb(null);
                }

            })

            socket.on('ClosePost', (data, cb) => {
                Post.closePost(user._id, data.post_Id, result => {
                    log.info(user.name + ' is closed post: ' + result);
                    cb(result);
                })
            })

            socket.on('SearchPost', (searchQuery, cb) => {
                log.info(searchQuery)
                SearchQuery.AddSearchQuery(user.userId, searchQuery);
                log.info(user.name + ' new search query added ');
                cb(true);
            })

            socket.on('HideUnhideItem', (data, cb) => {
                Post.HideUnhideItem(data).then(result => {
                    return cb(data.hidden);
                }).catch(err => {
                    log.info(err);
                    return cb(null)
                })
            })

            socket.on('UpdatePostNotes', (data, cb) => {
                Post.UpdatePostNotes(data.postId, sanitizeHtml(data.notes, settings.sanitizeOptions)).then(() => {
                    log.info(user.name + ' updated post notes');
                    return cb(true);
                }).catch(err => {
                    log.info(err);
                    return cb(null)
                })
            })

            socket.on('BumpPost', (data, cb) => {
                Post.BumpPost(data.post_Id).then((result) => {
                    log.info(user.name + ' is bumped post: ' + result.bump);
                    return cb(result.bump);
                }).catch(err => {
                    log.info(err);
                    return cb(null)
                })
            })

            socket.on('UpdateTradeUrl', ({ tradeUrl }, cb) => {

                TradeOfferParse(tradeUrl.trim())
                    .then(parsed => {
                        if (parsed) {
                            User.UpdateTradeUrl(user._id, parsed.url).then(result => {
                                if (result) {
                                    log.info(user.name + ' updated his trade url.');
                                    cb(true);
                                } else {
                                    cb('Failed to update trade offer');
                                }
                            });

                        } else {
                            cb('Invalid trade url');
                        }

                    })
                    .catch(err => {

                        cb('Invalid trade url');
                    });

            })


            socket.on('CreateSupportTicket', ({ subject, description }, cb) => {
                const ticket = new Ticket({
                    _id: new mongoose.Types.ObjectId(),
                    owner: user,
                    subject: subject,
                    description: description
                });

                ticket.Create(result => {
                    log.info(user.name + ' created new support ticket : ' + result);
                    cb(result);
                });

            })

            socket.on('AddTicketReply', ({ ownerId, ticketId, replyText }, cb) => {
                Ticket.AddReply(ownerId, ticketId, replyText, user._id, result => {
                    log.info(user.name + ' added ticket reply : ' + result);
                    cb(result);
                })
            })

            socket.on('CloseTicket', ({ ticketId }, cb) => {
                Ticket.CloseTicket(ticketId, user, result => {
                    log.info(user.name + ' is closed ticket : ' + result);
                    cb(result);
                })
            })

            socket.on('CreateReport', ({ reason, description = '', reportType, reportObjId, reportParentID }, cb) => {

                let reportReason = Report.getReportReason(reason);

                if (!reportReason) {
                    cb(false);
                    return;
                }

                const report = new Report({
                    _id: new mongoose.Types.ObjectId(),
                    owner: user,
                    reason: reportReason,
                    description: description, //todo issue with description fix it later
                    reportType: Report.ValidateReportType(reportType),
                    reportObjId: reportObjId,
                    reportParentId: reportParentID
                });

                report.Create(result => {
                    log.info(user.name + ' created new report : ' + result);
                    cb(result);
                });

            })

            socket.on('NotificationClicked', ({ notification_Id }, cb) => {
                GlobalNotification.RemoveNotification(user._id, notification_Id).then(result => {
                    cb(result);
                }).catch(err => {
                    log.info(err);
                    cb('failed to redirect')
                })
            })

            socket.on('ClearAllNotifications', cb => {
                GlobalNotification.ClearAllNotifications(user._id).then(result => {
                    cb(true);
                }).catch(err => {
                    cb(false)
                })
            })

            if (user.steamID === process.env.ADMIN_ID) {
                AdminCommands(socket, user);
            }


        }

    })
}


function AdminCommands(socket, user) {

    socket.on('GetMaintenaceMode', (cb) => {
        cb(config.maintenance.current);
    })


    socket.on('SetMaintenanceMode', ({ isMaintenance }, cb) => {

        Maintenance.setMode(isMaintenance).then(result => {
            cb(result);
        }).catch(err => {
            log.info(err);
            cb(false)
        })

    })


    socket.on('AssignTicket', ({ ticket_id }, cb) => {

        Admin.assginTicket(ticket_id, user._id, user.name).then(result => {
            cb(result);
        }).catch(err => {
            log.info(err);
            cb(null)
        })

    })

    socket.on('AssignReport', ({ report_id }, cb) => {

        Admin.assignReport(report_id, user._id).then(result => {
            cb(result);
        }).catch(err => {
            log.info(err);
            cb(null)
        })

    })

    socket.on('SetReportResult', ({ reportResult, report_id }, cb) => {

        Admin.SetReportResult(reportResult, report_id, user._id).then(result => {
            log.info(result);
            if (result != null) {
                let notification = new GlobalNotification({
                    type: GlobalNotificationType.report,
                    redirectId: '/support/reports',
                    id: result.reportId,
                });
                GlobalNotification.AddNotification(result.owner, notification);
                cb(reportResult)
            }
            else {
                cb(null);
            };
        }).catch(err => {
            log.info(err);
            cb(null)
        })

    })

    socket.on('SearchUser', ({ steam64ID }, cb) => {

        Admin.searchUser(steam64ID).then(result => {
            cb(result);
        }).catch(err => {
            log.info(err);
            cb(null)
        })

    })

    socket.on('UpdateUserRole', ({ user_id, upgradeToRole }, cb) => {

        Admin.updateUserRole(user_id, user, upgradeToRole).then(result => {
            log.info(result);
            cb(result);
        }).catch(err => {
            log.info(err);
            cb(null)
        })

    })

    socket.on('GetNSetTF2UnusualParticlePathDataFromBP', callback => {
        TF2ItemDatabase.GetNSetTF2UnusualParticlePathDataFromBP(result => {
            log.info(result);
            callback(result);
        })
    })


    socket.on('GetNSetTF2BackpackData', callback => {
        TF2ItemDatabase.GetNSetTF2BackpackData(result => {
            log.info(result);
            callback(result);
        })
    })

    socket.on('GenerateTF2FinalData', callback => {
        TF2ItemDatabase.GenerateTF2FinalData(result => {
            log.info(result);
            callback(result);
        })
    })

    socket.on('GenerateCSGOFinalData', callback => {
        CSGOItemDatabase.GenerateCSGOFinalData(result => {
            log.info(result);
            callback(result);
        })
    });

    socket.on('GenerateDOTA2FinalData', callback => {
        DOTA2ItemDatabase.GenerateDOTA2FinalData(result => {
            log.info(result);
            callback(result);
        })
    });
}