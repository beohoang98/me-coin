/*
 * Title: Blockchain Project
 * Description: sockets methods for the blockchain (pending transactions, chat, etc..)
 * Author: Mor Cohen
 * Date: 15/10/18
 */

var objForDupCheck = null;
var socket = io();

socket.on('connect', () => {
    //console.log(socket);
    document.getElementById("noMemberID").innerHTML = socket.id;
});

function sendMessage(message) {
    if (!message.replace(/\s/g, '').length) {
        alert("לא ניתן לשלוח הודעה ריקה");
    }
    else {
        message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        socket.emit('getNewMessage', {
            message: message,
            id: socket.id
        });
    }
};


socket.on('newMessage', (message) => {
    document.getElementById("btn-input").value = null;
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear();
    var hour = d.getHours();
    var minutes = d.getMinutes();
    var id;
    $('#chat').append(
        '<li class="right clearfix">' +
        '<div class="chat-body clearfix">' +
        '<div class="header">' +
        '<div class="row">' +
        '<strong class="col-6 pull-right primary-font">' +
        '<span style="color: gold">' +
        'מספר משתמש: ' +
        '</span>' +
        (message.id === socket.id ? '<span style="color: #1d82ff;">' : '<span>') +
        message.id +
        '</span>' +
        '</strong>' +
        '<small class="col-6 text-muted text-left">' +
        hour + ':' + minutes + ' ' +
        (('' + day).length < 2 ? '0' : '') + day + '/' +
        (('' + month).length < 2 ? '0' : '') + month + '/' +
        output +
        '</small>' +
        '</div >' +
        '</div >' +
        '<p>' +
        message.message +
        '</p>' +
        '</div >' +
        '</li >');
    var s = $("#chat > li:last-child").position();
    $("div").scrollTop(s.top);
});

socket.on('PT', (pt) => {

    var rows = document.getElementById("lastTransactionsTable").getElementsByTagName("tr").length;
    var row = document.getElementById("mineButton");

    if ((pt.length === 1) && (rows === 1) && (pt[0].sender === "system-reward")) {
        row.setAttribute("disabled", true);
    }


    for (let i = 0; i < pt.length; i++) {//i used JQuery to display the table
        if (objForDupCheck !== null)
            if (pt[i].transactionId === objForDupCheck.transactionId)
                continue;
        $('#lastTransactionsTable > tbody:last-child').append('<tr>' +
            '<td style="font-size:x-small; max-width: 100px;">' +
            pt[i].transactionId + '</td>' +
            '<td style="font-size:x-small; max-width: 220px;">' +
            pt[i].sender + '</td>' +
            '<td style="font-size:x-small; max-width: 220px;">' +
            pt[i].recipient + '</td>' +
            '<td>' +
            pt[i].amount + '</td>' +
            '</tr >');
        objForDupCheck = pt[i];
    }
    for (let i = 1; i < pt.length; i++) {//after mining keep the last row (miner reward).
        if (pt[i].sender === "system-reward") {
            $("#lastTransactionsTable td").remove();
            $('#lastTransactionsTable > tbody:last-child').append('<tr>' +
                '<td style="font-size:x-small; overflow: auto; max-width: 100px;">' +
                pt[pt.length - 1].transactionId + '</td>' +
                '<td style="font-size:x-small; max-width: 220px;">' +
                pt[pt.length - 1].sender + '</td>' +
                '<td style="font-size:x-small; max-width: 220px;">' +
                pt[pt.length - 1].recipient + '</td>' +
                '<td>' +
                pt[pt.length - 1].amount + '</td>' +
                '</tr >');
            $("#lastTransactionsTable td").remove();

        }
    }

});
socket.on('mineSuccess', (trueOrFalse) => {//after mining success - display a meassage to all users
    function removePopUp() {
        $("#alert").remove();
    }
    if (trueOrFalse === true) {//i could use JQuery
        var alert = document.createElement("div");
        alert.setAttribute("class", "alert alert-success");
        alert.setAttribute("id", "alert");
        alert.setAttribute("style", "position: fixed; bottom: 0; width: 100 %; z-index:1000;");
        alert.innerHTML = '<strong>' + "הודעה גלובלית - " + '</strong>' + "אחד המשתמשים ביצע כריה בהצלחה!";
        document.getElementsByTagName("body")[0].appendChild(alert);
        setTimeout(removePopUp, 5000);
    }
});