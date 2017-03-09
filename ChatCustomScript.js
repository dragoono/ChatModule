﻿/**
 * Created by Niklas Grieger on 02.12.2016.
 * js for the Chat Widget
 */
var Chat = Chat || (function () {
    var allCategoriesDataSource;
    var allUserDatasource;
    var empfaenger_name;
    var currentUserType = "";
    var currentUserDataSource = null;
    var adminId = 0;
    var empfaenger_id;
    var partial;
    // Reference the auto-generated proxy for the hub.  
    var chat = $.connection.chatHub;
    var notification = $.connection.notificationHub;
    var user = $.connection.userHub;
    $.connection.hub.logging = true;
    function fillUserlist() {
        /// <summary>
        /// Fills the friendlist.
        /// </summary>
        var contactlist = [];
        if (partial == "True") {
            var url = "/Chat/Chatlogs/GetAllSubjects";
        }
        else {
            var url = "/Chatlogs/GetAllSubjects";
        }
        $.ajax({
            url: url,
            success: function (data) {
                $.each(data,
                    function (i, item) {
                        //Verhindert, dass der CurrentUser in der Liste erscheint
                        //if (item.user_id != currentUserDataSource.user_id) {
                        var contact = "<div id='" + item.supportgroup_id + "' class='friend'>" +
                                                    //"<img src='" + item.avatarlink + "' alt='Kein Bild!'/>" +
                                                        "<p>" +
                                                            "<strong>" + item.subject + "</strong></br>" +
                                                        "</p>" +
                                                        //"<span id='user_name'>"+item.user_name+"</span>" +
                                                        //"<div class='status available'></div>" +
                                                    "</div>";
                            contactlist.push(contact);
                        //}
                    });
                supportGroups = data;
                console.log("supportGroups:");
                console.log(supportGroups);
                var searchbox = "<div id='search'>" +
                                    "<input type='text' id='searchfield' placeholder='Search contacts...' />" +
                                "</div>";
                contactlist.push(searchbox);
                $("#friends").html(contactlist);
            },
            cache: false
        });
    }
    function fillSupportList() {
        /// <summary>
        /// Fills the friendlist.
        /// </summary>
        var contactlist = [];
        //Pfad anpassung, wenn es als Partial View geladen wird oder nicht
        if (partial == "True") {
            var url = "/Chat/Users/GetContactListForAdmin?currentUserId=" + currentUserDataSource.user_id;
        }
        else {
            var url = "/Users/GetContactListForAdmin?currentUserId=" + currentUserDataSource.user_id;
        }
        $.ajax({
            //?empfaenger_id=" + localStorage.getItem("currentUserId")
            url: url,
            success: function (data) {
                var status = "";
                $.each(data,
                    function (i, item) {
                        //Verhindert, dass der CurrentUser in der Liste erscheint
                        if (item.user_id != currentUserDataSource.user_id) {
                            var contact = "<div id='" + item.user_id + "' class='friend userheader'>" +
                                                    "<img src='" + item.avatarlink + "' alt='Kein Bild!'/>" +
                                                        "<span id='user_name'>" + item.first_name + " " + item.last_name + "</span>" +
                                                        "<div class='status  "+ item.status + "'></div>" +
                                                    "</div>";
                            contactlist.push(contact);
                        }
                    });
                
                //allSupportUserDataSource = data;
                //console.log("allSupportUserDataSource:");
                //console.log(allSupportUserDataSource);
                var searchbox = "<div id='search'>" +
                                    "<input type='text' id='searchfield' placeholder='Search contacts...' />" +
                                "</div>";
                contactlist.push(searchbox);
                $("#friends").html(contactlist);
            },
            cache: false
        });
    }
    function loadMessagesUser2User() {
        /// <summary>
        /// Loads the messages user2 user.
        /// </summary>
        var timenow = kendo.toString(new Date, "dd.MM.yyyy HH:mm:ss");
        var chatlogu2u = [];
        var sender_id = currentUserDataSource.user_id;
        var dataString = 'sender_id=' + sender_id + '&empfaenger_id=' + empfaenger_id;
        //Pfad anpassung, wenn es als Partial View geladen wird oder nicht
        if (partial == "True") {
            var url = "/Chat/Chatlogs/GetChatUser2User";
        }
        else {
            var url = "/Chatlogs/GetChatUser2User";
        }
        $.ajax({
            type: 'GET',
            data: dataString,
            url: url,
            success: function (data) {
                console.log("GetChatUser2User: ");
                console.log(data);
                var chatlogu2uItem = "";
                var today = kendo.toString(new Date(), "dd. MMMM");
                var todayDay = kendo.toString(new Date(), "d");
                chatlogu2uItem = "<label>" + today + "</label>";
                chatlogu2u.push(chatlogu2uItem);
                $.each(data,
                    function (i, item) {
                            var chatlogu2uItem = "";
                            var timeFromNow = kendo.toString(kendo.parseDate(item.timestamp, "H:mm"), "H:mm");
                            console.log(item);
                            console.log(currentUserDataSource.user_id);
                            // == da der localstorage im Format String ist und nicht den gleichen Typ hat
                            if (currentUserDataSource.user_id == item.empfaenger_id) {
                                console.log("empfenger: " + item.empfaenger_id);
                                chatlogu2uItem = "<div class='message'>" +
                                                    "<img src='' />" +
                                                    "<div class='bubble'> " +
                                                        item.message +
                                                        "<div class='corner'></div> " +
                                                        "<span>" + timeFromNow + "</span>" +
                                                    "</div>" +
                                                 "</div>";
                            }
                            else if (item.sender_id == currentUserDataSource.user_id) {
                                console.log("sender: " + item.sender_id);
                                chatlogu2uItem = "<div class='message right'>" +
                                                    "<div class='bubble'>" +
                                                        item.message +
                                                        "<div class='corner'></div>" +
                                                        "<span>" + timeFromNow + "</span>" +
                                                    "</div>" +
                                                 "</div>";
                            }
                            chatlogu2u.push(chatlogu2uItem);
                        
                    });
                console.log("ChatUser2User:" + chatlogu2u);
                $("#chat-messages").html(chatlogu2u);
                console.log($("#chat-messages"));
            }
        });
        //Ab hier wird der Hub getriggert wenn eine Message ankommt
        //Scrollt nach unten beim ersten mal laden des Chats
        setTimeout(function () {
            $("#chat-messages").scrollTop($("#chat-messages").prop("scrollHeight"));
        }, 100);
        //if (localStorage.getItem("currentUserId") == sender_id || localStorage.getItem("currentUserId") != empfaenger_id){

            //chat.client.addNewMessageToPage = function (sender_id, empfaenger_id, message, timestamp) {
            //    console.log("SignalR: addNewMessageToPage getriggert...");
            //    var chatlogu2uItem = "";
            //    // Add the message to the page. 
            //    //Wenn der der empfänger ist werden die Nachrichten links angezeigt
            //    if (currentUserDataSource.user_id == sender_id) {
            //        console.log("local = " + sender_id);
            //        chatlogu2uItem = "<div class='message right'>" +
            //                                "<div class='bubble'>" +
            //                                    message +
            //                                    "<div class='corner'></div>" +
            //                                    "<span>" + timestamp + "</span>" +
            //                                "</div>" +
            //                                "</div>";
            //        $('#chat-messages').append(chatlogu2uItem);
            //    }
            //    else if (currentUserDataSource.user_id == empfaenger_id) {
            //        console.log("local= " + adminId);
            //        chatlogu2uItem = "<div class='message'>" +
            //                                        "<img src='' />" +
            //                                        "<div class='bubble'> " +
            //                                            message +
            //                                            "<div class='corner'></div> " +
            //                                            "<span>" + timestamp + "</span>" +
            //                                        "</div>" +
            //                                     "</div>";
            //        $('#chat-messages').append(chatlogu2uItem);
            //    }
            //    console.log(chatlogu2uItem);
            //    $("#chat-messages").scrollTop($("#chat-messages").prop("scrollHeight"));
            //}
            
                ////Zum Real time Anzeigen [User] is Typing....
                //chat.client.sayWhoIsTyping = function (name) {
                //    console.log("UserisTypingToClient" + name);
                //    $('#isTyping').html(name + " is typing...");
                //    setTimeout(function () {
                //        $('#isTyping').html('&nbsp;');
                //    }, 5000);
                //}
            
          
            $.connection.hub.start().done(function () {
                console.log("Hab start for WhoIsTyping!");
                var i = 0;
                $('#message').keypress(function (e) {
                        if (e.which == 13) {
                            $('#sendmessage').trigger('click');
                        } else {
                            var encodedName = currentUserDataSource.full_name;
                            console.log("Typing User..." + encodedName);
                            i++;
                            console.log(i+"...");
                            chat.server.isTyping(encodedName);
                        }
                    });
            }).fail(function (reason) {
                console.log("SignalR connection in UserisTyping failed: " + reason);
            });
            
        //}
    }
    function sendMessage() {
        console.log("IM sendMessage()");
        /// <summary>
        /// Sends the message user2 user.
        /// </summary>
        var timeNow = kendo.toString(new Date(), "H:mm");
        var sender_id = currentUserDataSource.user_id;
        var sender_name = currentUserDataSource.full_name
        if ($("#message").val() !== "") {
            
            //Start Hub to Send something
            $.connection.hub.start().done(function () {
                // Call the Send method on the hub. 
                chat.server.send(sender_id, empfaenger_id, $('#message').val(), timeNow);
                console.log("Sende Notification an Server...")
                notification.server.sendNotification("Neue Message von: " + sender_name,sender_id, empfaenger_id);
            
                console.log("SignalR: ChatMessageSend getriggert...");
                //$('#send').click(function () {
            }).fail(function (reason) {
                console.log("SignalR connection in sendMessage und/oder sendNotification failed: " + reason);
            });;
                
                //Pfad anpassung, wenn es als Partial View geladen wird oder nicht
                if (partial == "True") {
                    var url = "/Chat/Chatlogs/SendMessage";
                }
                else {
                    var url = "/Chatlogs/SendMessage";
                }
                var dataString = 'sender_id=' + sender_id + '&empfaenger_id=' + empfaenger_id + '&message=' + $("#message").val();
                $.ajax({
                    type: 'POST',
                    data: dataString,
                    url: url,
                    success: function (data) {
                        var array = [sender_id, empfaenger_id, $('#message').val(), timeNow];
                        console.log("Array wurde zum Hub gesendet: " + array);
                        console.log("Folgende Message wurde an empfaenger_id: " + empfaenger_id + " gesendet: ");
                        console.log($("#message").val());
                        // Clear text box and reset focus
                        $('#message').val('').focus();
                    }
                });
            
        }

        
    }
    function toggleChat() {
        /// <summary>
        /// Setzt den Focus auf das Suchfeld oder die MessageBox 
        /// Animiert beim Klick auf ein Kontakt den Übergang zum Privaten Chat
        /// </summary>
        
        console.log("3");
        $("#searchfield")
            .focus(function () {
                if ($(this).val() == "Search contacts...") {
                    $(this).val("");
                }
            });
        $("#searchfield")
            .focusout(function () {
                if ($(this).val() == "") {
                    $(this).val("Search contacts...");

                }
            });

        $("#sendmessage input")
            .focus(function () {
                if ($(this).val() == "Send message...") {
                    $(this).val("");
                }
            });
        $("#sendmessage input")
            .focusout(function () {
                if ($(this).val() == "") {
                    $(this).val("Send message...");

                }
            });

        setTimeout(function () {
            $(".friend")
                .each(function () {
                    $(this)
                        .click(function () {
                            var childOffset = $(this).offset();
                            var parentOffset = $(this).parent().parent().offset();
                            var childTop = childOffset.top - parentOffset.top;
                            var clone = $(this).find('img').eq(0).clone();
                            var top = childTop + 12 + "px";

                            if (currentUserType == "normal") {
                                subject = $(this).find("p strong").html();
                                $("#chooseSupportDiv").kendoWindow({
                                    modal: true
                                });
                                
                                $('#chooseSupport').kendoDropDownList({
                                        autoWidth: true,
                                        optionLabel: "Wählen Sie ihren Ansprechpartner...",
                                        dataTextField: "user_name",
                                        dataValueField: "supporter_id",
                                        headerTemplate: '<div class="dropdown-header k-widget k-header">' +
                                                            '<span>Foto</span>' +
                                                            '<span>Kontakt</span>' +
                                                            '<span>Status</span>' +
                                                        '</div>',
                                        footerTemplate: 'Total #: instance.dataSource.total() # items found',
                                        valueTemplate: '<span class="selected-value" style="background-image: url(\'#:data.avatarlink#\')"></span><span>#:data.user_name#</span><span class="status #:data.status#"></span>',
                                        template: '<span class="k-state-default" style="background-image: url(\'#:data.avatarlink#\')"></span>' +
                                                    '<span class="k-state-default">#:data.user_name#</span>'+
                                                    '<span class="k-state-default status #:data.status#" style="margin:10px;"></span>',
                                        dataSource: {
                                            transport: {
                                                    read: {
                                                        url: "/Chat/Users/GetSupportsBySubject?subject=" + subject,
                                                        success: function (data) {
                                                            console.log(data);
                                                        }
                                                    }
                                            }
                                        },
                                        height: 400,
                                        select: function (e) {
                                            //Prevented den fall, wenn das Option Label ausgewählt ist
                                            if (e.dataItem.supporter_id != "") {
                                                console.log(e);
                                                empfaenger_name = e.dataItem.user_name;
                                                empfaenger_id = e.dataItem.supporter_id;
                                                empfaenger_status = e.dataItem.status;
                                                empfaenger_avatar = e.dataItem.avatarlink;
                                                var drp_chooseSupport = $("#chooseSupport").data("kendoDropDownList");

                                                //$(clone).css({ 'top': top }).addClass("floatingImg").appendTo("#profile");

                                                //setTimeout(function () {
                                                //    $("#profile p").addClass("animate");
                                                //    $("#profile").addClass("animate");
                                                //},
                                                //    100);
                                                setTimeout(function () {
                                                    $("#chat-messages").addClass("animate");
                                                    //$('.cx, .cy').addClass('s1');
                                                    //setTimeout(function () { $('.cx, .cy').addClass('s2'); }, 100);
                                                    //setTimeout(function () { $('.cx, .cy').addClass('s3'); }, 200);
                                                },
                                                    150);

                                                //$('.floatingImg')
                                                //    .animate({
                                                //        'width': "68px",
                                                //        'left': '220px',
                                                //        'top': '180px'
                                                //    },
                                                //        200);

                                                //var bezeichnung = $(this).find("p strong").html();

                                                var profilHtml = "<div class='userheader " + empfaenger_id + "'>" +
                                                                     "<div id='close' class='glyphicon glyphicon-share-alt'></div>" +
                                                                     "<img class='avatar' src='" + empfaenger_avatar + "' alt='Kein Bild gefunden!' style='margin:10px;left:14px;position:relative;'/></br>" +
                                                                     "<div class='status " + empfaenger_status + "' style='left:50%; position:relative;'></div></br>" +
                                                                     "<b>Sie spechen mit: " + empfaenger_name + "</b>"+
                                                                 "</div>";
                                                $("#profile").html(profilHtml);
                                                //var email = $(this).find("p span").html();
                                                //$("#profile p").html(bezeichnung);
                                                //$("#profile span").html(zuständiger);
                                                //$("#profile span").html(email);

                                                //$(".message").not(".right").find("img").attr("src", $(clone).attr("src"));
                                                $("#chooseSupportDiv").data("kendoWindow").close();
                                                $('#friendslist').fadeOut();
                                                $('#chatview').fadeIn();

                                                setTimeout(function () {
                                                    //Scrollt zur letzten Nachricht
                                                    $("#chat-messages").scrollTop($("#chat-messages").prop("scrollHeight"));
                                                }, 10);

                                                $('#close')
                                                    .unbind("click")
                                                    .click(function () {
                                                        $("#chat-messages, #profile, #profile p").removeClass("animate");
                                                        //$('.cx, .cy').removeClass("s1 s2 s3");
                                                        $("#chooseSupport").val("").data("kendoDropDownList").text("");
                                                        //$('.floatingImg')
                                                        //    .animate({
                                                        //        'width': "40px",
                                                        //        'top': top,
                                                        //        'left': '12px'
                                                        //    },
                                                        //        200,
                                                        //        function () { $('.floatingImg').remove() });

                                                        setTimeout(function () {
                                                            $('#chatview').fadeOut();
                                                            $('#friendslist').fadeIn();
                                                        },
                                                            50);
                                                    });
                                                loadMessagesUser2User();
                                            }
                                        }
                                });
                                var drp_chooseSupportDiv = $("#chooseSupportDiv").data("kendoWindow");
                                drp_chooseSupportDiv.center().open();
                                //setTimeout(function () {
                                //    $("#chat-messages").addClass("animate");
                                //    $('.cx, .cy').addClass('s1');
                                //    setTimeout(function () { $('.cx, .cy').addClass('s2'); }, 100);
                                //    setTimeout(function () { $('.cx, .cy').addClass('s3'); }, 200);
                                //},
                                //    150);

                                //$('#friendslist').fadeOut();
                                //$("#chooseSupportDiv").fadeIn();
                                //$('#close')
                                //.unbind("click")
                                //.click(function () {
                                //    setTimeout(function () {
                                //        $('#chooseSupportDiv').fadeOut();
                                //        $('#friendslist').fadeIn();
                                //    },
                                //        50);
                                //});
                                
                                
                            }
                            else if(currenUserType="admin"){
                                empfaenger_name = $(this).find("span#user_name").text();
                                empfaenger_id = $(this).attr('id');
                                empfaenger_avatar = $(this).find("img").attr("src");
                                empfaenger_status = $(this).find("div.status").attr("class");
                                //$(clone).css({ 'top': top }).addClass("floatingImg").appendTo("#profile");

                                setTimeout(function () {
                                    $("#profile p").addClass("animate");
                                    $("#profile").addClass("animate");
                                }, 100);

                                setTimeout(function () {
                                    $("#chat-messages").addClass("animate");
                                //    $('.cx, .cy').addClass('s1');
                                //    setTimeout(function () { $('.cx, .cy').addClass('s2'); }, 100);
                                //    setTimeout(function () { $('.cx, .cy').addClass('s3'); }, 200);
                                },  150);

                                //$('.floatingImg')
                                //    .animate({
                                //        'width': "68px",
                                //        'left': '40%',
                                //        'top': '20%'
                                //    },
                                //        200);

                                //var bezeichnung = $(this).find("p strong").html();


                                var profilHtml = "<div class='userheader "+empfaenger_id+"'>"+
                                                    "<div id='close' class='glyphicon glyphicon-share-alt'></div>" +
                                                    "<img class='avatar' src='" + empfaenger_avatar + "' alt='Kein Bild gefunden!' style='margin:10px;left:14px;position:relative;'/></br>" +
                                                    "<div class='status " + empfaenger_status + "' style='left:50%; position:relative;'></div></br>" +
                                                    "<b>Sie spechen mit: " + empfaenger_name + "</b>"
                                                 "</div>";
                                $("#profile").html(profilHtml);
                                //var zuständiger = "<b>Sie spechen mit: " + empfaenger_name + "</b>";
                                //console.log("empfaenger_name");
                                //console.log(empfaenger_name);
                                //var email = $(this).find("p span").html();
                                //$("#profile p").html(bezeichnung);
                                //$("#profile span").html(zuständiger);
                                //$("#profile span").html(email);

                                //$(".message").not(".right").find("img").attr("src", $(clone).attr("src"));
                                $('#friendslist').fadeOut();
                                $('#chatview').fadeIn();
                                setTimeout(function(){
                                    //Scrollt zur letzten Nachricht
                                    $("#chat-messages").scrollTop($("#chat-messages").prop("scrollHeight"));
                                },10);

                                $('#close')
                                    .unbind("click")
                                    .click(function () {
                                        $("#chat-messages, #profile, #profile p").removeClass("animate");
                                        //$('.cx, .cy').removeClass("s1 s2 s3");
                                        //$('.floatingImg')
                                        //    .animate({
                                        //        'width': "40px",
                                        //        'top': top,
                                        //        'left': '12px'
                                        //    },
                                        //        200,
                                        //        function () { $('.floatingImg').remove() });

                                        setTimeout(function () {
                                            $('#chatview').fadeOut();
                                            $('#friendslist').fadeIn();
                                        },
                                            50);
                                    });
                                loadMessagesUser2User();
                            }
                            
                        });

                });
        }, 600);
    }
    function checkUserIsAdmin(currentUserId) {
        if (partial == "True") {
            var url = "/Chat/Users/CheckUserIsAdmin?user_id=" + currentUserId;
        }
        else {
            var url = "/Users/CheckUserIsAdmin?user_id=" + currentUserId;
        }
        $.ajax({
            url: url,
            success: function (data) {
                console.log(data);
                if (data === "False") {
                    fillUserlist();
                    currentUserType="normal";
                }
                else if (data === "True") {
                    fillSupportList();
                    currentUserType="admin";
                }
            }
        })
    }
    function openChatUser2User(senderId, empfaengerId) {
            console.log("Öffne Chat...");
            console.log($(".friend#" + senderId).find("div"));
            $(".friend#" + senderId).find("div").trigger("click");
            setTimeout(function () {
                $("#btnChat").click();
                //Scrollt zur letzten Nachricht
                $("#chat-messages").scrollTop($("#chat-messages").prop("scrollHeight"));
            }, 500);
    }
    //function toggle() {
    //    var ele = $(".showMessage_fullMessage");
    //    var text = $("#showMessage_toggle");
    //    if (ele.css("display") === "block") {
    //        ele.css("display", "none");
    //        text.html("+");
    //    }
    //    else {
    //        ele.css("display", "block");
    //        text.html("-");
    //    }
    //}
    function getMessagesSinceLastLogout(currentUserIdParam) {
        //Pfad anpassung, wenn es als Partial View geladen wird oder nicht
        if (partial == "True") {
            var url = "/Chat/Chatlogs/GetMessagesSinceLastLogin?currentUserId=" + currentUserIdParam;
        }
        else {
            var url = "/Chatlogs/GetMessagesSinceLastLogin?currentUserId=" + currentUserIdParam;
        }
        $.ajax({
            type: "GET",
            url: url,
            success: function (data) {
                console.log("Initialisiere neue Notifications seit letztem Login...")
                
                var count = 0;
                if (data.length > 0) {
                    $.each(data, function (index, value) {
                        console.log(index + ". Message seit letztem Login: " + message)
                        $('#notiContent').append($("<li>"+
                                                        "<a style='text-decoration:none !important;' href='javascript:Chat.OpenChatUser2User(" + value.sender_id + ", " + value.empfaenger_id + ");'>" +
                                                            "Neue Message von: " + value.sender_name+"</br>"+
                                                            "Message: " + kendo.toString(kendo.parseDate(value.timestamp, "H:mm"), "H:mm") + "-> " + value.message +
                                                        "</a>"+
                                                   "</li>"));
                        count++;
                    });
                }
                else {
                    console.log(data);
                    $('#notiContent').html($('<li>Keine Neuigkeiten</li>'));
                }
                $('span.count').html(count);
                
            }
        })
    }
    function saveLogoutTime() {
        $.ajax({
            type: 'POST',
            url: "/Chatlogs/SaveLoginTime?currentUserId=" + currentUserDataSource.user_id,
            success: function () {
                console.log("Der Timestamp vom Userlogin ID=" + currentUserDataSource.user_id + " wurde geändert");
            },
            error: function () {
                console.log("Userlogin ID=" + currentUserDataSource.user_id + " Timestamp wurde nicht gesetzt");
            }
        });
    }
    function updateNotificationCount() {
        var count = 0;
        count = parseInt($('span.count').html()) || 0;
        count++;
        $('span.count').html(count);
    }
    function login() {
        currentUserId = $("#aktUser").data("kendoDropDownList").value();
        currentUserName = $("#aktUser").data("kendoDropDownList").text();
        console.log("currentUserName");
        console.log(currentUserName);
        localStorage.setItem("currentUserId", currentUserId);
        localStorage.setItem("currentUserName", currentUserName);
        checkUserIsAdmin(currentUserId);
        getMessagesSinceLastLogin();
        saveLoginTime();
        init();
    }
    function logout() {
        $('#close').trigger("click");
        localStorage.setItem("currentUserId", "");
        $("#top h4").html("");
        $("#friends").html("");
        $("#login").show();
        $("#chatContent").hide();
    }
    function updateNotificationCount() {
                var count = 0;
                count = parseInt($('span.count').html()) || 0;
                count++;
                $('span.count').html(count);
    }
    function init(currentUserIdParam, Partial) {
        
        partial = Partial;
        if(currentUserIdParam != null){
            if (partial == "True") {
                var urlCurrentUser = "/Chat/Chatlogs/GetUserInfoById?currentUserId=" + currentUserIdParam;
                var urlSetUserOnline = "/Chat/Chatlogs/SetUserStatus?status=" + 'available' + "&currentUserId=" + currentUserIdParam;
            }
            else{
                var urlCurrentUser = "/Chatlogs/GetUserInfoById?currentUserId=" + currentUserIdParam;
                var urlSetUserOnline = "/Chatlogs/SetUserStatus?status=" + 'available' + "&currentUserId=" + currentUserIdParam;
            }
                
                //setTimeout(function () {
                //    $.connection.hub.start().done(function () {
                //        // Call the Send method on the hub. 
                //        user.server.realTimeStatus(currentUserIdParam, 'available');
                //        console.log("Sende Status an Server...")
                //        console.log("SignalR: realTimeStatus getriggert...");
                //    }).fail(function (reason) {
                //        console.log("SignalR connection in realTimeStatus(online) failed: " + reason);
                //    });
                //    console.log("2");
                //}, 5000);
            
            //Updatet den User Status in der Oberfläche, sobald der SignalR Hub getriggert wurde
            
            $.ajax({
                type: "GET",
                url: urlCurrentUser,
                success: function (data) {
                    currentUserDataSource = data;
                    console.log(currentUserDataSource);
                    getMessagesSinceLastLogout(currentUserIdParam);
                    checkUserIsAdmin(currentUserIdParam);
                    $("#top h4").html("Sie melden sich als: <b>" + currentUserDataSource.full_name + "</b>");
                    toggleChat();
                },
                error: function (e) {
                    console.log("Userinfos konnten für den User mit der ID: " + currentUserIdParam + " nicht geladen werden.");
                    console.log(e.responseText);
                }
            });
            chat.client.addNewMessageToPage = function (sender_id, empfaenger_id, message, timestamp) {
                console.log("SignalR: addNewMessageToPage getriggert...");
                var chatlogu2uItem = "";
                // Add the message to the page. 
                //Wenn der der empfänger ist werden die Nachrichten links angezeigt
                if (currentUserDataSource.user_id == sender_id) {
                    console.log("local = " + sender_id);
                    chatlogu2uItem = "<div class='message right'>" +
                                            "<div class='bubble'>" +
                                                message +
                                                "<div class='corner'></div>" +
                                                "<span>" + timestamp + "</span>" +
                                            "</div>" +
                                            "</div>";
                    $('#chat-messages').append(chatlogu2uItem);
                }
                else if (currentUserDataSource.user_id == empfaenger_id) {
                    console.log("local= " + adminId);
                    chatlogu2uItem = "<div class='message'>" +
                                                    "<img src='' />" +
                                                    "<div class='bubble'> " +
                                                        message +
                                                        "<div class='corner'></div> " +
                                                        "<span>" + timestamp + "</span>" +
                                                    "</div>" +
                                                 "</div>";
                    $('#chat-messages').append(chatlogu2uItem);
                }
                console.log(chatlogu2uItem);
                $("#chat-messages").scrollTop($("#chat-messages").prop("scrollHeight"));
            }
            //Zum Real time Anzeigen [User] is Typing....
            chat.client.sayWhoIsTyping = function (name) {
                console.log("UserisTypingToClient" + name);
                $('#isTyping').html(name + " is typing...");
                setTimeout(function () {
                    $('#isTyping').html('&nbsp;');
                }, 5000);
            }
            //Fügt dem User eine Notification in echtzeit hinzu
            notification.client.getNotification = function (notification, sender_id, empfaenger_id) {

                if (empfaenger_id == currentUserIdParam) {
                    console.log("Empfange Notification...");
                    console.log(notification + " wurde als Notfication dem Client hinzugefügt!");
                    updateNotificationCount();
                    $('#notiContent').html('');
                    $('#notiContent').append("<a href='javascript:Chat.OpenChatUser2User(" + sender_id + ", " + empfaenger_id + ");'>" + $.notify(notification, "info") + "</a>");
                }
            };
            ////Updatet den User Status in der Oberfläche, sobald der SignalR Hub getriggert wurde
            user.client.getRealTimeStatus = function (user_id, status) {
                console.log("SignalR: getRealTimeStatus getriggert...");
                console.log("User mit ID: " + user_id + " ist nun " + status);
                $(".userheader").find(".status").attr('class', 'status ' + status);
            };
            $.ajax({
                type: "POST",
                url: urlSetUserOnline,
                success: function () {
                    console.log("user ist jetzt online/available");
                }
            });
            $.connection.hub.start().done(function () {
                // Call the Send method on the hub. 
                user.server.realTimeStatus(currentUserIdParam, 'available');
                console.log("Sende Status an Server...")
                console.log("SignalR: realTimeStatus getriggert...");
            }).fail(function (reason) {
            console.log("SignalR connection in realTimeStatus(online) failed: " + reason);
        });
            
            //Savet den Zeitpunkt, in dem der User die Seite schließt
            
            $(window).bind('beforeunload', function () {
                $.connection.hub.start().done(function () {
                    
                    // Call the Send method on the hub. 
                    user.server.realTimeStatus(currentUserIdParam, 'inactive');
                    console.log("Sende Status an Server...")
                    console.log("SignalR: realTimeStatus getriggert...");
                }).fail(function (reason) {
                    console.log("SignalR connection in realTimeStatus(offline) failed: " + reason);
                });
                $.ajax({  
                    type: 'POST',
                    url: "/Chat/Chatlogs/SetUserStatus?status=inactive&currentUserId=" + currentUserIdParam,
                    success: function () {
                        console.log("Der Timestamp vom Userlogin ID=" + currentUserIdParam + " wurde geändert");
                        console.log("user ist jetzt offline/inactive");
                        //user.server.realTimeStatus(currentUserIdParam, 'inactive');
                    },
                    error: function (e) {
                        console.log("Userlogin ID=" + currentUserIdParam + " Timestamp wurde nicht gesetzt");
                        console.log(e);
                    }
                });
                //$.connection.hub.start().done(function () {
                    
                        // Call the Send method on the hub. 
                        //user.server.realTimeStatus(currentUserIdParam, 'inactive');
                    //    console.log("Sende Status an Server...")
                    //    console.log("SignalR: realTimeStatus getriggert...");
                    //}).fail(function (reason) {
                    //    console.log("SignalR connection in realTimeStatus(offline) failed: " + reason);
                    //});
                //Sendet den Status an den SignalR Hub
                
            });
        
                    
    }
    else{

    }
        //$("#aktUser").kendoDropDownList({
        //    dataSource: {
        //        transport: {
        //            read: function (e) {
        //                $.ajax({
        //                    url: "/Users/GetAllUser",
        //                    success: function (data) {
        //                        console.log(data);
        //                        allUserDatasource = data;
        //                        e.success(data);
        //                    }
        //                })
        //            }
        //        }
        //    },
        //    optionLabel: "Wählen Sie ihre Identität...",
        //    dataTextField: "user_name",
        //    dataValueField: "user_id"
        //});
        //console.log(localStorage);
        //if (localStorage.getItem("currentUserId") === null || localStorage.getItem("currentUserId") === "") {
        //    $("#top h4").html("");
        //    $("#friends").html("");
        //    $("#login").show();
        //    $("#chatContent").hide();
        //}
        //else {
        //    $("#login").hide();
        //    $("#chatContent").show();
        //    toggleChat();
        //    $("#top h4").html("Sie melden sich als: <b>" + localStorage.getItem("currentUserName") + "</b>");
        //}
    }
    return {
        Init: init,
        Login: login,
        Logout:logout,
        SendMessage: sendMessage,
        OpenChatUser2User: openChatUser2User
    }
})();