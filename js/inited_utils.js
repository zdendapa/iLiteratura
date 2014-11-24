/**
 * page history system
 */
var pageSys = {
    pageBackArr:[],
    // pages thats are ignored
    pageExceptions:[],
    // always keep page before!
    pageBack:"",
    // page right now
    pageCurrent:"",
    countMemorizedPages:10,
    addCurrent: function(c){
        this.pageBack = this.pageCurrent;
        this.pageCurrent = c;
        //console.log(c);
        this.pageBackArr.push(c);
        if(this.pageBackArr.length>this.countMemorizedPages)
            this.pageBackArr = this.pageBackArr.slice(1,this.countMemorizedPages+1);
    },
    goBack : function() {
        this.pageBack = this.pageCurrent;
        this.pageBackArr.pop();
        this.pageCurrent = this.pageBackArr.pop();
        //this.pageBack = this.pageBackArr[this.pageBackArr.length-1];
        var goback = true;
        for (i = 0; i < this.pageExceptions.length; i++) {
            if(this.pageExceptions[i]==this.pageCurrent)
                goback = false;
        }
        if(goback) showWindow(this.pageCurrent,"back-l");
    },
    reset : function(currenPage) {
        this.pageCurrent = currenPage;
        this.pageBackArr = [];
        this.pageBackArr.push(currenPage);
        this.pageBack = "";
    },
    pageExceptionsAdd : function(windowName) {
        this.pageExceptions.push(windowName);
    }
};

/**
 * Menu button
 */
function enableMenuButton() {
    document.addEventListener("menubutton", menuButton, true);
}

/**
 * Back button
 */
function enableBackButton() {
    document.addEventListener("backbutton", backKeyDown, true);
    if (typeof navigator.app == "undefined") return;
    if (typeof navigator.app.overrideBackbutton == "undefined") return;
    navigator.app.overrideBackbutton(true);
}

/**
 * Function asks user if he wants to exit app.
 */
function backKeyDown() {
    var r = confirm("Chcete opustit aplikaci?");
    if (r == true) {
        navigator.app.exitApp();
    } else {
        return;
    }
}

/**
 * Function provides logging. If level parameter is inserted, then it log into system console, or like alert message.
 * If not, logging is inserted into #log element on page.
 *
 * @param str string that should be outputted into log
 * @param level 1=INFO, 2=WARNING, 3=ERROR
 */
function logging(str, level) {
    if (level == 1 || level == null) console.log("INFO:" + str);
    if (level == 2) console.log("WARN:" + str);
    if (level == 3) alert("ERROR:" + str);

    var elLog = $("#log");
    if (elLog.length > 0) {
        var elTextarea = $("#log").find("textarea");
        var text = $(elTextarea).val();
        text += str + "\n";
        $(elTextarea).val(text);
        $(elTextarea).scrollTop($(elTextarea)[0].scrollHeight);
    }
}

/**
 * Function makes alert message.
 *
 * @param msg Message that will be in alert
 * @param title of alert
 */
function alertG(msg, title) {
    if (typeof navigator.notification != "undefined") {
        if (title == "") title = "Upozornění!";

        navigator.notification.alert(
            msg,  // message
            null,         // callback
            title,            // title
            'OK'                  // buttonName
        );
    } else {
        alert(msg);
    }
}