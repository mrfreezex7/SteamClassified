import * as utils from './utils.js';
import * as cookieConsent from './cookie-consent.js';
import * as particleDB from './particleDB.js';
import * as TF2DB from './TF2DB.js';


class PostTimer {

  static id = 0;

  constructor(elem, orignalTime, postId = null) {
    this.id = PostTimer.id;
    this.postId = postId;
    this.elem = elem;
    this.orignalTime = orignalTime;
    this.agoTime = '';
    PostTimer.id++;
  }

  static PostTimers = [];

  ActivatePostTimerInterval() {
    this.agoTime = moment(this.orignalTime).fromNow();
    this.elem.innerHTML = this.agoTime;
    setInterval(() => {
      let originalDate = new Date(this.elem.getAttribute('datetime'));
      this.agoTime = moment(originalDate).fromNow();
      this.elem.innerHTML = this.agoTime;
      if (this.postId) {

        if (moment(Date.now()).diff(moment(originalDate), 'minutes') >= 30) {

          let bumpBtn = document.getElementById('post-bump-btn-' + this.postId);

          if (bumpBtn && bumpBtn.classList.contains('hidden')) {
            bumpBtn.classList.remove('hidden');
          }
        }
      }
    }, 1000 * 5);


  }

  static init() {
    let postTimes = document.getElementsByTagName('time');

    for (let i = 0; i < postTimes.length; i++) {
      const element = postTimes[i];
      let originalDate = new Date(element.getAttribute('datetime'));
      let postId = element.getAttribute('postid');
      element.innerHTML = '555';
      let postTimer = new PostTimer(element, originalDate, postId ? postId : null);
      postTimer.ActivatePostTimerInterval();
    }
  }
}

const socket = io();

socket.on("connect", () => {
  console.log('connected to server');
})

const SlotType = {
  OFFERING: 0,
  REQUESTING: 1
}

const MESSAGE_TYPE = {
  'error': 'error',
  'success': 'success',
  'warning': 'warning',
  'info': 'info',
  'other': 'other'
}

const MESSAGE_DURATION = {
  'five': 5,
  'ten': 10,
}

const REPORT_TYPE = {
  'user': 'user',
  'post': 'post',
  'postComment': 'postComment'
}

const postNotesMaxHeight = 68;

const clickaway = window.VueClickaway.mixin;

let vm = new Vue({
  el: "#app",
  mixins: [clickaway],
  data() {
    return {
      CommentReplyTextCounter: 0,
      HidingComment: [],
      isMaintenance: false,
      moment: moment,
      postTimes: {},
      ReportModal: {
        active: false,
        reason: 404,
        description: '',
        isReporting: false,
        reportType: null,
        reportObjId: '',
        reportParentID: ''

      },
      TicketReply: {
        input: '',
        replying: false,
        closing: false,
        assigning: false,
      },
      Report: {
        assigning: false,
        settingResult: false,
      },
      ManageUser: {
        input: '',
        searching: false,
        user: null,
        selectedRole: 404,
        roleModal: false,
        isUpdatingRole: false,
      },
      isCreatingTicket: null,
      SupportTicketInput: {
        subject: '',
        description: '',
      },
      GlobalNotificaiton: {
        active: false,
        show: true,
      },
      ProfilePicDropdown: {
        active: false,
      },
      SystemMessages: [],
      isUpdatingNotes: false,
      isSavingData: false,
      ToggleEditNotes: false,
      ItemHidden: {},
      Quill: null,
      SearchPage: {
        main: false,
        message: false,
      },
      SelectedSlotType: SlotType.OFFERING,
      OfferingItems: [],
      RequestingItems: [],
      UserInventory: [],
      UserInventoryCache: {
        TF2: {
          currentPage: 1,
          totalPages: 0,
          items: [],
          totalItems: 0,
        },
        CSGO: {
          currentPage: 1,
          totalPages: 0,
          items: [],
          totalItems: 0,
        },
        DOTA2: {
          currentPage: 1,
          totalPages: 0,
          items: [],
          totalItems: 0,
        }
      },
      SearchedItems: [],
      SearchedItemsCache: {
        TF2: {
          currentPage: 1,
          totalPages: 0,
          items: [],
          totalItems: 0,
        },
        CSGO: {
          currentPage: 1,
          totalPages: 0,
          items: [],
          totalItems: 0,
        },
        DOTA2: {
          currentPage: 1,
          totalPages: 0,
          items: [],
          totalItems: 0,
        }
      },
      MaxSlot: 8,
      SelectedGame: 'TF2',
      SearchedWord: "",
      SearchedWordCache: {
        Offering: '',
        Requesting: '',
      },
      ShowLoading: {
        main: true,
        loader: false,
        error: false,
        empty: false,
      },
      isCreatingPost: false,
      isSearchingPost: false,
      isCommenting: false,
      isSubCommenting: false,
      CommentText: "",
      CommentTextCounter: 0,
      CommentTextMaxCounter: 150,
      CommentReplyText: "",
      CommentReplyTextContainer: 0,
      CurrentCommentID: "",
      isBookmarked: null,
      SlotOption: {
        selectedItem: '',
        global: {
          hidden: true,
          top: 0,
          left: 0,
        },
        quality: utils.DefaultOption[440].quality,
        paint: utils.DefaultOption[440].paint,
        effect: utils.DefaultOption[440].effect,
        killstreak: utils.DefaultOption[440].killstreak,
        parts: utils.DefaultOption[440].parts,
        exterior: utils.DefaultOption[440].exterior,
        craftable: utils.DefaultOption[440].craftable,
      }
    }
  },
  methods: {
    HamburgerBtnClick() {


      let hambugerData = document.getElementById('hamburger-data');
      if (hambugerData.classList.contains('hambuger-hidden')) {
        hambugerData.classList.remove('hambuger-hidden')
      } else {
        hambugerData.classList.add('hambuger-hidden')
      }
    },
    ReadMore(e) {
      let currentNode = e.currentTarget;
      let postNote = currentNode.parentNode.getElementsByClassName('post-notes')[0];
      let inneritem = postNote.getElementsByClassName('inner-item')[0];
      currentNode.classList.add('hidden');

      postNote.style.setProperty('max-height', (inneritem.offsetHeight + 16 + 8) + 'px');
    },
    GetItemPaginateData() {
      if (this.SelectedSlotType == SlotType.OFFERING) {
        return {
          currentPage: this.UserInventoryCache[this.SelectedGame].currentPage,
          totalPages: this.UserInventoryCache[this.SelectedGame].totalPages,
          totalItems: this.UserInventoryCache[this.SelectedGame].totalItems,
        }
      } else if (this.SelectedSlotType == SlotType.REQUESTING) {
        return {
          currentPage: this.SearchedItemsCache[this.SelectedGame].currentPage,
          totalPages: this.SearchedItemsCache[this.SelectedGame].totalPages,
          totalItems: this.SearchedItemsCache[this.SelectedGame].totalItems,
        }
      }
    },
    PaginateCreatePageItem(isNext) {

      if (this.SelectedSlotType == SlotType.OFFERING) {

        if (isNext && this.UserInventoryCache[this.SelectedGame].currentPage < this.UserInventoryCache[this.SelectedGame].totalPages) {
          this.UserInventoryCache[this.SelectedGame].currentPage++;
        } else if (!isNext && this.UserInventoryCache[this.SelectedGame].currentPage <= this.UserInventoryCache[this.SelectedGame].totalPages && this.UserInventoryCache[this.SelectedGame].currentPage > 1) {
          this.UserInventoryCache[this.SelectedGame].currentPage--;
        }
      } else if (this.SelectedSlotType == SlotType.REQUESTING) {
        if (isNext && this.SearchedItemsCache[this.SelectedGame].currentPage < this.SearchedItemsCache[this.SelectedGame].totalPages) {
          this.SearchedItemsCache[this.SelectedGame].currentPage++;
        } else if (!isNext && this.SearchedItemsCache[this.SelectedGame].currentPage <= this.SearchedItemsCache[this.SelectedGame].totalPages && this.SearchedItemsCache[this.SelectedGame].currentPage > 1) {
          this.SearchedItemsCache[this.SelectedGame].currentPage--;
        }
        this.SearchedItems = this.GetPaginatedGameCatlogItem(this.SelectedGame);
      }



    },
    GetPostTime(postId, time) {
      this.postTimes[postId] = {
        orignalTime: time,
        agoTime: this.moment(new Date(time)).fromNow()
      };

      setInterval(() => {
        this.postTimes[postId].agoTime = this.moment(new Date(this.postTimes[postId].orignalTime)).fromNow();
      }, 1000 * 60);

      return this.postTimes[postId].agoTime;
    },
    HideComment(post_Id, comment_Id, reply_Id) {

      if (this.HidingComment.indexOf(comment_Id) === -1) {
        this.HidingComment.push(comment_Id);



        socket.emit('HideComment', { post_Id: post_Id, comment_Id: comment_Id, reply_Id: reply_Id }, result => {
          if (result) {
            location.reload();
          } else {
            this.HidingComment.splice(this.HidingComment.indexOf(comment_Id), 1);
            this.AddSystemMessage('Failed to hide comment', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
          }
        })
      } else {
        this.AddSystemMessage('Please wait your action is being processed.', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
      }

    },
    UnhideOwnerComment(id) {
      let hideCommentObj = document.getElementById('hide-' + id);
      let unHideCommentObj = document.getElementById('unhide-' + id);
      if (hideCommentObj && unHideCommentObj) {
        hideCommentObj.classList.add('hidden');
        unHideCommentObj.classList.add('unHideCommentAnim');
        unHideCommentObj.classList.remove('hidden');
      }
    },
    NotificationRedirectTo(notification_Id, url) {
      socket.emit('NotificationClicked', { notification_Id }, result => {
        location.replace(url);
      });
    },
    ToggleNotifications() {
      this.GlobalNotificaiton.active = !this.GlobalNotificaiton.active;
    },
    ToggleProfilePicDropdown() {
      this.ProfilePicDropdown.active = !this.ProfilePicDropdown.active;
    },
    ClearAllNotifications() {
      let counterBadge = document.getElementById('global-notification-counter-badge');
      socket.emit('ClearAllNotifications', result => {
        if (result) {
          this.GlobalNotificaiton.show = false;
          this.AddSystemMessage('Successfully cleared all notifications', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
        } else {
          this.AddSystemMessage('Failed to clear notifications', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        }
      });
    },
    SearchUser() {
      if (this.ManageUser.input.trim().length == 17)//76561198964938453
      {
        socket.emit('SearchUser', { steam64ID: this.ManageUser.input.trim() }, result => {
          if (result) {
            this.ManageUser.user = result;
          } else {
            this.ManageUser.user = null;
            this.AddSystemMessage('no user found with that id', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
          }
        })
      } else {
        this.AddSystemMessage('Please enter a valid steam64ID', MESSAGE_TYPE.warning, MESSAGE_DURATION.five);
      }
    },
    UpdateRole() {
      let user_id = this.ManageUser.user._id;
      let upgradeToRole = this.ManageUser.selectedRole;
      this.ManageUser.isUpdatingRole = true;
      if (upgradeToRole == 404 || upgradeToRole == 101) {
        this.AddSystemMessage('Please select a role before clicking update role', MESSAGE_TYPE.warning, MESSAGE_DURATION.five);
        this.ManageUser.isUpdatingRole = false;
      } else {
        socket.emit('UpdateUserRole', { user_id, upgradeToRole }, result => {
          if (result) {
            this.AddSystemMessage('Role Updated Successfully', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
            this.ManageUser.user = result;
            this.ManageUser.roleModal = false;
            this.ManageUser.isUpdatingRole = false;
          } else {
            this.AddSystemMessage('Failed to update user role', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
            this.ManageUser.roleModal = false;
            this.ManageUser.isUpdatingRole = false;
          }
        })
      }
    },
    CreateReport() {

      this.ReportModal.isReporting = true;

      if (this.ReportModal.reportObjId.trim().length <= 0 || this.ReportModal.reportParentID.trim().length <= 0) {
        this.AddSystemMessage('Something wrong.Please try again!', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        this.ReportModal.active = false;
        return;
      }

      //validate reason before sending

      if (REPORT_TYPE[this.ReportModal.reportType]) {
        socket.emit('CreateReport',
          {
            reason: this.ReportModal.reason,
            description: this.ReportModal.description,
            reportType: this.ReportModal.reportType,
            reportObjId: this.ReportModal.reportObjId,
            reportParentID: this.ReportModal.reportParentID
          }, result => {
            if (result) {
              this.AddSystemMessage('Report submitted successfully!', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
              this.ReportModal.active = false;
            } else {
              this.AddSystemMessage('Something wrong.Please try again!', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
              this.ReportModal.active = false;
            }
          }
        )
      } else {
        this.AddSystemMessage('Something wrong.Please try again!', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        this.ReportModal.active = false;
      }

    },
    ShowReportModal(reportType, reportObjId, reportParentID) {
      this.ReportModal.active = true;
      this.ReportModal.reason = 404;
      this.ReportModal.description = '';
      this.ReportModal.isReporting = false;
      this.ReportModal.reportType = reportType;
      this.ReportModal.reportObjId = reportObjId;
      this.ReportModal.reportParentID = reportParentID;
    },
    SetReportResult(reportResult, report_id) {
      this.Report.settingResult = true;
      socket.emit('SetReportResult', { reportResult: reportResult, report_id: report_id }, result => {
        if (result == null) {
          this.Report.settingResult = false;
          this.AddSystemMessage('Failed ', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        } else if (result == 'resolved') {
          this.AddSystemMessage('Report set to Resolved', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
        } else if (result == 'invalid') {
          this.AddSystemMessage('Report set to Invalid', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
        }

        setTimeout(() => {
          location.replace('/admin/reports/my');
        }, 1000);
      })
    },
    AssignReport(report_id) {
      this.Report.assigning = true;
      socket.emit('AssignReport', { report_id: report_id }, result => {
        if (result) {
          this.AddSystemMessage('Report Assigned to you successfully', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
          setTimeout(() => {
            location.replace('/admin/reports/my');
          }, 1000);
        } else {
          this.Report.assigning = false;
          this.AddSystemMessage('Failed to assign Report. ', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        }
      })
    },
    AssignTicket(ticket_id) {
      this.TicketReply.assigning = true;
      socket.emit('AssignTicket', { ticket_id: ticket_id }, result => {
        if (result) {
          this.AddSystemMessage('Ticket Assigned to you successfully', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          this.TicketReply.assigning = false;
          this.AddSystemMessage('Failed to assign ticket. ', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        }
      })
    },
    CloseTicket(ticketId) {
      this.TicketReply.closing = true;
      socket.emit('CloseTicket', { ticketId: ticketId }, result => {
        if (result) {
          this.AddSystemMessage('Ticket closed successfully', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          this.TicketReply.closing = false;
          this.AddSystemMessage('Failed to close ticket.Please try again!', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        }
      })
    },
    AddTicketReply(ownerId, ticketId) {
      if (this.TicketReply.input.trim().length <= 0) {
        this.AddSystemMessage('Please fill empty fields.', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
      } else {
        this.TicketReply.replying = true;
        socket.emit('AddTicketReply', { ownerId: ownerId, ticketId: ticketId, replyText: this.TicketReply.input.trim() }, result => {
          if (result) {
            this.AddSystemMessage('Replied successfully', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
            setTimeout(() => {
              location.reload();
            }, 1000);
          } else {
            this.TicketReply.replying = false;
            this.AddSystemMessage('Failed to reply ticket', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
          }
        })
      }
    },
    CreateSupportTicket() {

      if (this.SupportTicketInput.subject.trim().length <= 0 && this.SupportTicketInput.description.trim().length <= 0) {
        this.AddSystemMessage('Please fill subject and describe field.', MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      } else if (this.SupportTicketInput.subject.trim().length <= 0) {
        this.AddSystemMessage('Please fill subject field.', MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      } else if (this.SupportTicketInput.description.trim().length <= 0) {
        this.AddSystemMessage('Please fill describe field.', MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      } else {
        this.isCreatingTicket = true;
        socket.emit('CreateSupportTicket', { subject: this.SupportTicketInput.subject.trim(), description: this.SupportTicketInput.description.trim() }, result => {
          if (result) {
            this.AddSystemMessage('Ticket created sucessfully ', MESSAGE_TYPE.success, MESSAGE_DURATION.five);
            setTimeout(() => {
              location.replace(result);
            }, 1000);
          } else {
            this.isCreatingTicket = false;
            this.AddSystemMessage('Failed to create ticket.Join Discord ', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
          }
        })

        return;
      }
    },
    AddSystemMessage(message, messageType, messageDuration) {
      let messageObject = {
        id: this.SystemMessages.length,
        message: message,
        messageType: messageType,
        messageDuration: messageDuration
      }

      messageObject.timeOutObject = setTimeout(() => {
        this.RemoveSystemMessage(messageObject.id);
      }, messageObject.messageDuration * 1000)

      this.SystemMessages.push(messageObject);
    },
    RemoveSystemMessage(id) {
      let index = this.SystemMessages.findIndex(message => message.id == id);
      if (index !== -1) {
        clearTimeout(this.SystemMessages[index].timeOutObject);
        this.SystemMessages.splice(index, 1);
      }
    },
    UpdateTradeUrl: function () {
      let tradeUrl = document.getElementById('trade-url').value;
      if (tradeUrl.trim() == '') return;
      this.isSavingData = true;
      socket.emit('UpdateTradeUrl', { tradeUrl: tradeUrl.trim() }, result => {

        if (result == true) {
          this.AddSystemMessage('Trade offer updated successfully', MESSAGE_TYPE.success, MESSAGE_DURATION.five);

        } else {
          this.AddSystemMessage(result, MESSAGE_TYPE.error, MESSAGE_DURATION.five);

        }
        this.isSavingData = false;
      })
    },
    TogglePostTime: function (postId) {
      let createdTime = document.getElementById('created-time-' + postId);
      let bumpedTime = document.getElementById('bumped-time-' + postId);

      if (createdTime.classList.contains('hidden')) {
        bumpedTime.classList.add('hidden');
        createdTime.classList.remove('hidden');
      } else if (bumpedTime.classList.contains('hidden')) {
        createdTime.classList.add('hidden');
        bumpedTime.classList.remove('hidden');
      }
    },
    EditPostNotes: function (id) {

      this.ToggleEditNotes = true;
      let parent = document.getElementById('post-notes-parent');
      if (!parent.classList.contains('noPadding')) {
        parent.classList.add('noPadding');
      }

      this.Quill = LoadQuill('post-notes');

    },
    UpdatePostNotes: function (postId) {

      this.isUpdatingNotes = true;
      let notes = this.Quill.root.innerHTML;

      if (this.Quill.getText().trim().length === 0) {
        notes = '';
      }
      socket.emit('UpdatePostNotes', { postId: postId, notes: notes }, result => {

        if (result) {
          location.reload();
        } else {
          this.isUpdatingNotes = false;
          this.AddSystemMessage('Failed to update notes.', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
        }
      })
    },
    HideUnhideItem: function (elem, postId, itemId, slotType, hideItem) {

      let hideIcon = `<svg class="edit-item-icon" xmlns="http://www.w3.org/2000/svg" height="18px"
            viewBox="0 0 24 24" width="18px" fill="#FFFFFF">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
                d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>`;

      let unHideIcon = `<svg class="edit-item-icon" xmlns="http://www.w3.org/2000/svg" height="18px"
        viewBox="0 0 24 24" width="18px" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>`

      if (!this.ItemHidden.hasOwnProperty(itemId)) {
        this.ItemHidden[itemId] = hideItem;
      } else {
        this.ItemHidden[itemId] = !this.ItemHidden[itemId];
      }
      socket.emit('HideUnhideItem', { postId: postId, itemId: itemId, slotType: slotType, hidden: this.ItemHidden[itemId] }, result => {

        elem.preventDefault();
        let mainParent = document.getElementById('offering-' + itemId);
        let svgParent = document.getElementById('offering-edit-' + itemId);
        if (result == null) {

        } else if (result) { //item hidden in database set front end to show it
          mainParent.classList.add('hidden-item');
          svgParent.innerHTML = unHideIcon;
        } else {//item un-hidden in database set front end to show it
          mainParent.classList.remove('hidden-item');
          svgParent.innerHTML = hideIcon;
        }
      })
    },
    ShowItemTooltip: function (el) {
      let parent = el.target;

      let tooltipTemplate = parent.getElementsByClassName('tooltip-template')[0].innerHTML;
      let tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = '';


      let offset = getOffset(parent);

      tooltip.innerHTML = tooltipTemplate;

      tooltip.style.display = 'block';
      let tooltipWidth = tooltip.getBoundingClientRect().width;
      tooltip.style.top = offset.top + parent.offsetHeight + 2 + 'px';
      tooltip.style.left = offset.left - ((tooltipWidth - parent.offsetWidth) / 2) + 'px';




    },
    HideItemTooltip: function () {
      let tooltip = document.getElementById('tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
      }
    },
    LoadInventory: function () {
      if (utils.APP_ID[this.SelectedGame]) {
        this.SearchedItems = [];
        this.SearchedWord = "";
        this.SearchedWordCache.Offering = '';
        this.SearchedWordCache.Requesting = '';
        this.UserInventory = [];
        this.ShowLoading.error = false;
        this.ShowLoading.empty = false;
        this.ShowLoading.main = true;
        this.ShowLoading.loader = true;

        this.GetUserInventory(utils.APP_ID[this.SelectedGame]);
      }
    },
    ShowReplyInput: function (e, commentId) {
      let parentNode = e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode;


      let replyNode = document.getElementById('post-sub-replies');
      this.CommentReplyText = '';
      this.CurrentCommentID = '';
      this.CurrentCommentID = commentId;

      parentNode.appendChild(replyNode);
      replyNode.classList.remove("hidden");
    },
    ProfilePicDropdownClickAway() {
      if (this.ProfilePicDropdown.active) {
        this.ProfilePicDropdown.active = false;
      }
    },
    NotificationClickAway() {
      if (this.GlobalNotificaiton.active) {
        this.GlobalNotificaiton.active = false;
      }
    },
    ClickAway: function () {
      this.SlotOption.selectedItem = '';
      this.SlotOption.global.hidden = true;
    },
    SelectSlot: function (slotType, isSearch = false) {
      switch (slotType) {
        case SlotType.OFFERING:
          this.SearchedWord = this.SearchedWordCache.Offering;
          this.SelectedSlotType = SlotType.OFFERING;
          break;
        case SlotType.REQUESTING:
          this.SearchedWord = this.SearchedWordCache.Requesting;
          this.SelectedSlotType = SlotType.REQUESTING;
          break;
      }
    },
    SelectSlotItem: function (slotType, item, elem, isSearch = false) {
      if (isSearch) {

        switch (item.appID) {
          case utils.APP_ID.TF2:
            this.GetTF2SlotOption(item, elem);
            break;
          case utils.APP_ID.CSGO:
            break;
          case utils.APP_ID.DOTA2:
            break;
          case utils.APP_ID.RUST:
            break;
          default:
            break;
        }

        return;
      }


      this.SelectSlot(slotType);
      switch (slotType) {
        case SlotType.OFFERING:
          //no option for offering slot items
          break;
        case SlotType.REQUESTING:

          switch (item.appID) {
            case utils.APP_ID.TF2:
              this.GetTF2SlotOption(item, elem);
              break;
            case utils.APP_ID.CSGO:
              break;
            case utils.APP_ID.DOTA2:
              break;
            case utils.APP_ID.RUST:
              break;
            default:
              break;
          }

          break;
      }
    },
    GetTF2SlotOption: function (item, elem) {
      setTimeout(() => {
        this.SlotOption.selectedItem = item;
        if (!item.hasOwnProperty('options')) {
          item.options = {
            quality: utils.DefaultOption[440].quality,
            paint: utils.DefaultOption[440].paint,
            effect: utils.DefaultOption[440].effect,
            killstreak: utils.DefaultOption[440].killstreak,
            parts: utils.DefaultOption[440].parts,
            exterior: utils.DefaultOption[440].exterior,
            craftable: utils.DefaultOption[440].craftable,
          }

        }
        this.SlotOption.quality = item.options.quality;
        this.SlotOption.paint = item.options.paint;
        this.SlotOption.effect = item.options.effect;
        this.SlotOption.killstreak = item.options.killstreak;
        this.SlotOption.parts = item.options.parts;
        this.SlotOption.exterior = item.options.exterior;
        this.SlotOption.craftable = item.options.craftable;



        let offsetY = 88;

        let offset = getOffset(elem.target);

        this.SlotOption.global.top = offset.top + offsetY;
        this.SlotOption.global.left = offset.left;

        this.SlotOption.global.hidden = false;
      }, 0);
    },
    UpdateItemOption: function () {
      if (this.SlotOption.selectedItem) {
        this.SlotOption.selectedItem.options.quality = this.SlotOption.quality;
        this.SlotOption.selectedItem.options.paint = this.SlotOption.paint;
        this.SlotOption.selectedItem.options.effect = this.SlotOption.effect;
        this.SlotOption.selectedItem.options.killstreak = this.SlotOption.killstreak;
        this.SlotOption.selectedItem.options.parts = this.SlotOption.parts;
        this.SlotOption.selectedItem.options.exterior = this.SlotOption.exterior;
        this.SlotOption.selectedItem.options.craftable = this.SlotOption.craftable;
      }
    },
    RemoveSlotItem: function (slotType, index, item, isSearch = false) {

      this.SlotOption.global.hidden = true;

      switch (slotType) {
        case SlotType.OFFERING:
          if (!isSearch) {
            let inventoryItemIndex = this.UserInventory.findIndex(inventoryItem => inventoryItem.id === item.id);
            if (inventoryItemIndex !== -1 && this.UserInventory[inventoryItemIndex].isSelected) {
              this.UserInventory[inventoryItemIndex].isSelected = false;
              this.OfferingItems.splice(index, 1);
            }
          } else {
            this.OfferingItems.splice(index, 1);
          }
          break;
        case SlotType.REQUESTING:
          this.RequestingItems.splice(index, 1);
          break;
      }
      this.HideItemTooltip();
    },
    GetUserInventory: function (appID) {

      let Items = this.GetUserInventoryCache(appID, 'Offering');
      if (Items.length > 0) {
        setTimeout(() => {

          this.UserInventory = Items.filter(function (item) {
            return item;
          });

          this.ShowLoading.main = false;
        }, 1);

        return;
      }
      socket.emit('GetUserInventory', appID, result => {

        let count = 0;
        if (result == null) {
          this.UserInventory = [];
          this.ShowLoading.loader = false;
          this.ShowLoading.error = true;
          return;
        }
        let InventoryItems = [];

        switch (appID) {
          case utils.APP_ID.TF2:
            InventoryItems = result.map(item => {
              if (item.hasOwnProperty('appid')) {
                return {
                  'id': item.assetid,
                  'appID': item.appid,
                  'name': item.name,
                  'market_hash_name': item.market_hash_name,
                  'type': item.type,//type is important dont delete it without it you cant see level 5 tool eg
                  'image_url': 'https://steamcommunity-a.akamaihd.net/economy/image/' + item.icon_url + '/64fx64f',
                  'descriptions': utils.getTF2Descriptions(item),
                  'tags': item.tags,
                  'quality': item.tags[0].name,
                  'particle': utils.getParticlesLink(item, item.tags[0].name),
                  'isSelected': false,
                }
              }

            });

            break;
          case utils.APP_ID.CSGO:

            InventoryItems = result.map(item => {
              return {
                'id': item.assetid,
                'appID': item.appid,
                'name': item.name,
                'market_hash_name': item.market_hash_name,
                'type': item.type,//type is important dont delete it without it you cant see level 5 tool eg
                'image_url': 'https://steamcommunity-a.akamaihd.net/economy/image/' + item.icon_url + '/64fx64f',
                'descriptions': utils.getCSGODescriptions(item),
                'tags': item.tags,
                'isSelected': false,
              }
            });

            break;
          case utils.APP_ID.DOTA2:
            InventoryItems = result.map(item => {
              return {
                'id': item.assetid,
                'appID': item.appid,
                'name': item.name,
                'market_hash_name': item.market_hash_name,
                'type': item.type,//type is important dont delete it without it you cant see level 5 tool eg
                'image_url': 'https://steamcommunity-a.akamaihd.net/economy/image/' + item.icon_url + '/64fx64f',
                'descriptions': utils.getDota2Descriptions(item),
                'tags': item.tags,
                'isSelected': false,
              }
            });

            break;
          case utils.APP_ID.RUST:
            break;
          default:
            return [];
            break;
        }


        if (this.UserInventoryCache[utils.APP_ID[appID]]) {
          this.UserInventoryCache[utils.APP_ID[appID]].items = InventoryItems;
        }

        if (this.UserInventoryCache[utils.APP_ID[appID]].items.length > 0) {
          this.ShowLoading.main = false;
        } else {
          this.ShowLoading.loader = false;
          this.ShowLoading.empty = true;
        }

      })
    },
    GetUserInventoryCache(appID, side) {
      switch (appID) {
        case utils.APP_ID.TF2:
          if (this.UserInventoryCache.TF2.items.length > 0) {
            return this.GetPaginatedInventoryItem(utils.APP_ID[utils.APP_ID.TF2]);
          }
          break;
        case utils.APP_ID.CSGO:
          if (this.UserInventoryCache.CSGO.items.length > 0) {
            return this.GetPaginatedInventoryItem(utils.APP_ID[utils.APP_ID.CSGO]);
          }
          break;
        case utils.APP_ID.DOTA2:
          if (this.UserInventoryCache.DOTA2.items.length > 0) {
            return this.GetPaginatedInventoryItem(utils.APP_ID[utils.APP_ID.DOTA2]);
          }
          break;
        case utils.APP_ID.RUST:
          break;
        default:
          return [];
          break;
      }
      return [];
    },
    GetPaginatedInventoryItem: function (appName, searchedWord = '') {
      const ItemsPerPage = 50;




      let items = this.UserInventoryCache[appName].items;

      let totalItems = items.length;
      let totalPages = Math.ceil(items.length / ItemsPerPage);
      const currentPage = this.UserInventoryCache[appName].currentPage;


      if (searchedWord.trim().length > 0) {
        let finalResult = [];

        finalResult = items.filter(item => {
          return searchedWord.toLowerCase().split(' ').every(v => item.name.toLowerCase().includes(v));
        })

        totalPages = Math.ceil(finalResult.length / ItemsPerPage);

        items = finalResult;

      }


      if (totalItems <= 0) {
        this.UserInventoryCache[appName].totalItems = 0;
        this.UserInventoryCache[appName].totalPages = 0;
        this.UserInventoryCache[appName].currentPage = 1;
        return [];
      } else {
        this.UserInventoryCache[appName].totalItems = totalItems;
        this.UserInventoryCache[appName].totalPages = totalPages;
        this.UserInventoryCache[appName].currentPage = currentPage;
        return items.filter((item, index) => {
          if (index >= ((currentPage - 1) * ItemsPerPage) && index < (currentPage * ItemsPerPage)) {
            return item;
          }
        });
      }
    },
    SearchItem: function (e, isSearch = false) {
      let searchedWord = '';

      if (isSearch) {
        searchedWord = e.target.value.trim().toLowerCase();
        this.GenerateGameCatlog(searchedWord);
        return;
      }
      if (this.SelectedSlotType == SlotType.Offering) {
        searchedWord = e.target.value.trim().toLowerCase();
        this.SearchedWordCache.Offering = searchedWord;
      } else if (this.SelectedSlotType == SlotType.REQUESTING) {
        searchedWord = e.target.value.trim().toLowerCase();
        this.SearchedWordCache.Requesting = searchedWord;
        this.GenerateGameCatlog(searchedWord);
      }

    },
    GetParticleLink: function (item) {

      if (particleDB.data.data.hasOwnProperty(item.options.effect)) {
        return particleDB.data.data[item.options.effect];
      } else {
        return utils.DefaultOption[440].effect;
      }
    },
    GetPaintColor: function (item) {
      if (TF2DB.paintsData.hasOwnProperty(item.options.paint)) {
        return TF2DB.paintsData[item.options.paint];
      } else {
        return [null];
      }
    },
    GenerateGameCatlog: function (itemName) {
      socket.emit('GetGameItems', { name: itemName, appid: utils.APP_ID[this.SelectedGame] }, result => {
        let gameItems = [];
        result.forEach(item => {
          item['options'] = {
            'quality': utils.DefaultOption[440].quality,
            'paint': utils.DefaultOption[440].paint,
            'effect': utils.DefaultOption[440].effect,
            'killstreak': utils.DefaultOption[440].killstreak,
            'parts': utils.DefaultOption[440].parts,
            'exterior': utils.DefaultOption[440].exterior,
            'craftable': utils.DefaultOption[440].craftable,
          }
          gameItems.push(item);
        })

        this.SearchedItemsCache[utils.APP_ID[utils.APP_ID[this.SelectedGame]]].items = gameItems;
        this.SearchedItems = this.GetPaginatedGameCatlogItem(utils.APP_ID[utils.APP_ID[this.SelectedGame]]);
      })
    },
    GetPaginatedGameCatlogItem: function (appName) {
      const ItemsPerPage = 50;

      let items = this.SearchedItemsCache[appName].items;

      let totalItems = items.length;
      let totalPages = Math.ceil(items.length / ItemsPerPage);
      const currentPage = this.SearchedItemsCache[appName].currentPage;

      if (totalItems <= 0) {
        this.SearchedItemsCache[appName].totalItems = 0;
        this.SearchedItemsCache[appName].totalPages = 0;
        this.SearchedItemsCache[appName].currentPage = 1;
        return [];
      } else {
        this.SearchedItemsCache[appName].totalItems = totalItems;
        this.SearchedItemsCache[appName].totalPages = totalPages;
        this.SearchedItemsCache[appName].currentPage = currentPage;
        let startIndex = ((currentPage - 1) * ItemsPerPage);
        let endIndex = (currentPage * ItemsPerPage);
        let result = [];



        for (let i = startIndex; i < endIndex; i++) {
          const item = items[i];
          if (item) {

            result.push(item);
          }
        }

        return result;
      }
    },
    SelectCatlogItem: function (item, isSearch = false) {

      if (isSearch) {
        switch (this.SelectedSlotType) {
          case SlotType.OFFERING:
            if (this.OfferingItems.length < this.MaxSlot) {
              this.OfferingItems.push(JSON.parse(JSON.stringify(item)));
            } else {
              this.AddSystemMessage('Cannot add more items', MESSAGE_TYPE.warning, MESSAGE_DURATION.five)
            }
            break;
          case SlotType.REQUESTING:
            if (this.RequestingItems.length < this.MaxSlot) {
              this.RequestingItems.push(JSON.parse(JSON.stringify(item)));
            } else {
              this.AddSystemMessage('Cannot add more items', MESSAGE_TYPE.warning, MESSAGE_DURATION.five)
            }
            break
        }
        return;
      }

      switch (this.SelectedSlotType) {
        case SlotType.OFFERING:
          if (this.OfferingItems.length < this.MaxSlot) {

            let inventoryItemIndex = this.UserInventory.findIndex(inventoryItem => inventoryItem.id === item.id);

            if (inventoryItemIndex !== -1 && !this.UserInventory[inventoryItemIndex].isSelected) {
              this.UserInventory[inventoryItemIndex].isSelected = true;
              this.OfferingItems.push(item);
            }
          } else {
            this.AddSystemMessage('Cannot add more items.', MESSAGE_TYPE.warning, MESSAGE_DURATION.five)
          }
          break;
        case SlotType.REQUESTING:
          if (this.RequestingItems.length < this.MaxSlot) {
            this.RequestingItems.push(JSON.parse(JSON.stringify(item)));
          } else {
            this.AddSystemMessage('Cannot add more items.', MESSAGE_TYPE.warning, MESSAGE_DURATION.five)
          }
          break
      }

    },
    CreatePost: function () {

      if (this.OfferingItems.length <= 0 && this.RequestingItems.length <= 0) {
        this.AddSystemMessage('Please add items on both sides', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
        return;
      }
      else if (this.OfferingItems.length <= 0) {
        this.AddSystemMessage('Please add items on left side', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
        return;
      } else if (this.RequestingItems.length <= 0) {
        this.AddSystemMessage('Please add items on right side', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
        return;
      } else {
        if (!this.isCreatingPost) {
          this.isCreatingPost = true;
          let notes = this.Quill.root.innerHTML;


          if (this.Quill.getText().trim().length === 0) {
            notes = '';
          }

          let data = {
            offeringItems: this.OfferingItems,
            requestingItems: this.RequestingItems,
            notes: notes
          }

          socket.emit('CreatePost', data, result => {
            if (result) {
              location.replace(result);
            } else {
              this.AddSystemMessage('Error occured while creating post.', MESSAGE_TYPE.error, MESSAGE_DURATION.five);
              setTimeout(() => {
                location.replace('/');
              }, 5000);
            }
          });
        }
      }
    },
    OpenPostCloseConfirmDialog(postId) {
      let parentNode = document.getElementById('confirm-post-close-dialog-' + postId);
      if (parentNode && parentNode.classList.contains('hidden')) {
        parentNode.classList.remove('hidden');
      }
    },
    ClosePostCloseConfirmDialog(postId) {
      let parentNode = document.getElementById('confirm-post-close-dialog-' + postId);
      if (parentNode && !parentNode.classList.contains('hidden')) {
        parentNode.classList.add('hidden');
      }
    },
    ClosePost: function (post_Id, postId) {

      let postActionsParent = document.getElementById('post-actions-' + postId);
      let parentNode = document.getElementById('trade-post-' + postId);
      let closeBtn = document.getElementById('close-btn-' + postId);
      let closeBtnLoader = document.getElementById('close-btn-loader-' + postId);
      let confirmClosePostWrapper = document.getElementById('confirm-close-post-wrapper-' + postId);


      if (closeBtn && !closeBtn.classList.contains('hidden')) {
        closeBtn.classList.add('hidden');
        confirmClosePostWrapper.style.display = "none";;
        closeBtnLoader.classList.remove('hidden');
        socket.emit("ClosePost", { post_Id: post_Id }, result => {

          if (result) {
            parentNode.classList.add('trade-post-closed');
            postActionsParent.innerHTML = '<p>closed</p>';

            let hideunhideItems = document.getElementsByClassName('hide-unhide-item-icon');
            for (let i = 0; i < hideunhideItems.length; i++) {
              hideunhideItems[i].innerHTML = '';
            }

            let editnotes = document.getElementById('edit-notes-' + postId);
            if (editnotes) {
              editnotes.innerHTML = '';
            }
            this.ClosePostCloseConfirmDialog(postId);
          } else {

            closeBtn.classList.remove('hidden');
            confirmClosePostWrapper.style.display = "flex";
            closeBtnLoader.classList.add('hidden');
          }
        })
      }
    }, BumpPost: function (post_Id, postId) {

      let createdTime = document.getElementById('created-time-' + postId);
      let bumpedTimeElem = document.getElementById('bumped-time-' + postId);
      let bumpBtnWrapper = document.getElementById('post-bump-btn-' + postId);
      let bumpBtn = document.getElementById('bump-btn-' + postId);
      let bumpBtnLoader = document.getElementById('bump-btn-loader-' + postId);
      let bumpedTime = bumpedTimeElem.getElementsByTagName('time')[0];


      if (bumpBtn && !bumpBtn.classList.contains('hidden')) {
        bumpBtn.classList.add('hidden');
        bumpBtnLoader.classList.remove('hidden');
        socket.emit("BumpPost", { post_Id: post_Id }, result => {

          if (result) {
            createdTime.classList.add('hidden');
            bumpedTimeElem.classList.remove('hidden');
            bumpedTime.setAttribute("datetime", result);
            bumpedTime.innerHTML = this.moment(result).fromNow();
            bumpBtnLoader.classList.add('hidden');
            bumpBtn.classList.remove('hidden');
            bumpBtnWrapper.classList.add('hidden');
          } else {
            bumpBtnLoader.classList.add('hidden');
            bumpBtn.classList.remove('hidden');
          }
        })
      }
    }
    , SearchPost: function () {
      if (this.OfferingItems.length <= 0 && this.RequestingItems.length <= 0) {
        this.AddSystemMessage('Please add a item', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
        return;
      } else {
        if (!this.isSearchingPost) {
          this.SearchPage.main = false;
          this.isSearchingPost = true;

          let data = {
            offeringItems: this.OfferingItems,
            requestingItems: this.RequestingItems,
            notes: ''
          }

          let searchQuery = utils.GetSearchQuery(data);

          if (searchQuery) {
            socket.emit('SearchPost', searchQuery, result => {

              if (result) {
                location.replace('/searchResult');
              }
              return;
              location.replace(result);
            });
          } else {
            location.replace('/');
          }
        }
      }
    },
    AddComment: function (postOwner_ID, post_Id, postId) {

      this.isCommenting = true;
      if (this.CommentText.trim().length > 0 && this.ValidateComment(this.CommentText.trim())) {
        socket.emit('AddComment', { postOwner_ID: postOwner_ID, post_Id: post_Id, postId: postId, commentText: this.CommentText.trim() }, result => {

          if (result) {
            location.reload();
          } else {
            this.isCommenting = false;
            this.AddSystemMessage('Failed to post comment.Please try again!', MESSAGE_TYPE.error, MESSAGE_DURATION.ten);
          }
        })
      } else {
        this.AddSystemMessage('Please fill the required fields!', MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
        this.isCommenting = false
      }
    },
    AddCommentReply: function (postOwner_ID, post_Id, postId) {



      this.isSubCommenting = true;
      if (this.CommentReplyText.trim().length > 0 && this.ValidateComment(this.CommentReplyText.trim())) {
        socket.emit('AddCommentReply', { postOwner_ID: postOwner_ID, post_Id: post_Id, postId: postId, commentId: this.CurrentCommentID, commentText: this.CommentReplyText.trim() }, result => {

          if (result) {
            location.reload();
          } else {
            this.isSubCommenting = false;
            this.AddSystemMessage('Failed to post reply.Please try again!', MESSAGE_TYPE.error, MESSAGE_DURATION.ten);

          }
        })
      } else {
        this.AddSystemMessage('Please fill the required fields!', MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
        this.isSubCommenting = false;
      }
    },
    SetBookmark: function (postId, isBookmarked) {

      if (this.isBookmarked !== null) {
        isBookmarked = this.isBookmarked;
      }
      let favouriteDiv = document.getElementById('post-bookmark');

      if (isBookmarked) {
        favouriteDiv.classList.remove('post-isBookmarked')
        favouriteDiv.classList.add('post-isNotBookmarked')
      } else {
        favouriteDiv.classList.remove('post-isNotBookmarked')
        favouriteDiv.classList.add('post-isBookmarked')
      }

      // if (favouriteDiv.classList.contains('post-isBookmarked')) {
      //     favouriteDiv.classList.remove('post-isBookmarked')
      //     favouriteDiv.classList.add('post-isNotBookmarked')
      // } else if (favouriteDiv.classList.contains('post-isNotBookmarked')) {
      //     favouriteDiv.classList.remove('post-isNotBookmarked')
      //     favouriteDiv.classList.add('post-isBookmarked')
      // }

      socket.emit('SetBookmark', { postId: postId, isBookmarked: isBookmarked }, result => {

        if (result) {
          favouriteDiv.classList.remove('post-isNotBookmarked')
          favouriteDiv.classList.add('post-isBookmarked')
          this.isBookmarked = true;
        } else {
          favouriteDiv.classList.remove('post-isBookmarked')
          favouriteDiv.classList.add('post-isNotBookmarked')
          this.isBookmarked = false;
        }
      })
    },
    GetMaintenaceMode: function () {
      socket.emit('GetMaintenaceMode', result => {
        this.isMaintenance = result;
      })
    },
    SetMaintenanceMode: function () {
      socket.emit('SetMaintenanceMode', { isMaintenance: !this.isMaintenance }, result => {
        if (result) {
          this.isMaintenance = true;
          document.getElementById("maintenance-check").checked = true;
        } else {
          this.isMaintenance = false;
          document.getElementById("maintenance-check").checked = false;
        }
      })
    },
    GetNSetTF2UnusualParticlePathData: function () {
      vm.AddSystemMessage('GettingNSettingTF2UnusualParticlePathData', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
      socket.emit('GetNSetTF2UnusualParticlePathDataFromBP', result => {
        vm.AddSystemMessage(result, MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      })
    },
    GetNSetTF2BackpackData: function () {
      vm.AddSystemMessage('GettingNSettingTF2BackpackData', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
      socket.emit('GetNSetTF2BackpackData', result => {
        vm.AddSystemMessage(result, MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      })
    },
    GenerateTF2FinalData: function () {
      vm.AddSystemMessage('GenerateTF2FinalData', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
      socket.emit('GenerateTF2FinalData', result => {
        vm.AddSystemMessage(result, MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      })
    },
    GenerateCSGOFinalData: function () {
      vm.AddSystemMessage('GeneratingCSGOFinalData', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
      socket.emit('GenerateCSGOFinalData', result => {
        vm.AddSystemMessage(result, MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      })
    },
    GenerateDOTA2FinalData: function () {
      vm.AddSystemMessage('GeneratingDOTA2FinalData', MESSAGE_TYPE.info, MESSAGE_DURATION.five);
      socket.emit('GenerateDOTA2FinalData', result => {
        vm.AddSystemMessage(result, MESSAGE_TYPE.info, MESSAGE_DURATION.ten);
      })
    },
    ValidateComment(comment) {
      if (comment.length <= this.CommentTextMaxCounter) {
        return true;
      } else {
        return false;
      }
    }
  },
  computed: {
    FilteredUserInventory() {
      if (this.SearchedWord && this.SelectedSlotType == SlotType.OFFERING) {
        this.SearchedWordCache.Offering = this.SearchedWord;
        this.UserInventory = this.GetPaginatedInventoryItem(utils.APP_ID[utils.APP_ID[this.SelectedGame]], this.SearchedWord);
        return this.UserInventory;
      } else {
        this.UserInventory = this.GetPaginatedInventoryItem(utils.APP_ID[utils.APP_ID[this.SelectedGame]]);
        return this.UserInventory;
      }
    }
  },
  watch: {
    SelectedGame: function (val) {
      const pageName = window.location.pathname;

      if (pageName === '/search') {
        this.GenerateGameCatlog('');
        return;
      }
      if (pageName == '/create') {
        if (this.SearchedWord == '') {

          this.GenerateGameCatlog('');
        }
        this.LoadInventory();
      }
    },
    CommentText: function (val) {
      this.CommentTextCounter = this.CommentText.length;
    },
    CommentReplyText: function (val) {
      this.CommentReplyTextCounter = this.CommentReplyText.length;
    },
    SearchedWord: function (params) {
      this.UserInventoryCache[this.SelectedGame].currentPage = 1;
      this.SearchedItemsCache[this.SelectedGame].currentPage = 1;
      if (this.SearchedWord == '') {

        this.GenerateGameCatlog('');
      }
    },
    SelectedSlotType: function () {
      if (this.SearchedWord == '') {

        this.GenerateGameCatlog('');
      }
    }
  },
  beforeMount() {
    const pageName = window.location.pathname;

    if (pageName === '/search') {
      this.MaxSlot = 1;
      this.GenerateGameCatlog('');
      return;
    }

    if (pageName === '/create') {

      this.LoadInventory();
      return;
    }
    if (pageName === '/admin') {
      this.GetMaintenaceMode();
      return;
    }


  },
  mounted() {
    const pageName = window.location.pathname;
    if (pageName.indexOf('trade') !== -1) {
      const link = window.location.href;

      if (link.indexOf('#') !== -1) {
        let id = link.slice(link.indexOf('#') + 1, link.length);

        document.getElementById('unhide-' + id.toString()).classList.add('post-reply-highlighted');
      }

    }



  }
})

function getOffset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'color': ["#000000", "#e60000", 'custom-color2', "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", '#B2B2B2', '#FFD700', '#476291', '#4D7455', '#CF6A32', '#8650AC', '#38F3AB', '#AA0000', '#FAFAFA', '#70B04A', '#A50F79'] }, { 'background': [] }],
];


window.onload = () => {
  cookieConsent.init();
  PostTimer.init();

  vm.Quill = LoadQuill('editor');



  let notes = document.getElementsByClassName('inner-item');

  for (let i = 0; i < notes.length; i++) {
    const element = notes[i];

    if (notes[i].offsetHeight > (postNotesMaxHeight - 16 - 8)) {
      let readMoreBtn = element.parentNode.parentNode.getElementsByClassName('read-more-btn')[0];
      if (readMoreBtn) {
        readMoreBtn.classList.remove('hidden');
      }
    }
  }

}

function LoadQuill(id) {
  if (document.getElementById(id)) {
    var quillOptions = {
      modules: {
        toolbar: toolbarOptions,
        magicUrl: true,
        clipboard: {
          matchVisual: false
        }
      },
      placeholder: 'Write trade message here...',
      theme: 'snow'
    };

    let quill = new Quill('#' + id, quillOptions);
    return quill;
  } else {
    return null;
  }
}
