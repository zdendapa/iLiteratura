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

var inited = {

    /*
     reads properties of object. If doesnt exist, return ""
     example inited.propertyGet(data,"AuthorArticle.NameFirst")
      */
    propertyGet : function(obj,prop)
    {
        var props = prop.split(".");
        var objProps = "";
        var valReturn = "";
        for(var i=0;i<props.length;i++)
        {

            var o = eval("obj" + objProps);
            if(o== null) return "";

            if(o.hasOwnProperty(props[i]))
            {
                objProps = "." + props[i];
            }
            else
            {
                return "";
            }
        }


        return eval("o" + objProps);
    }
};

var iniDate = {
    // "2014-12-08T10:00:00", "2014-12-08"
    //
    // do 8.12.2014

    conv1 : function (dateStr)
    {
        if(dateStr.length==0) return "";

        var str = dateStr;
        if(dateStr.indexOf("T")>-1)
            str = dateStr.split("T")[0];

        if(dateStr.indexOf("-")>-1)
        {
            var arr = str.split("-");
            str = this.zerosLeadRemove(arr[2]) + "." + this.zerosLeadRemove(arr[1]) + "." + arr[0];
        }

        return str;
    },
    // z "0000test" udela "test"
    zerosLeadRemove : function(s)
    {
        while(s.charAt(0) === '0')
            s = s.substr(1);
        return s;
    }
};

/*
 when scroll bottom -300px occurs, scrollBottomFunction is called (and loadStart = true)
 You must set loadStart to false when your action is complete!!
 */
function scrollLoad(scrollerEl){
    this.scrollerEl = scrollerEl;
    this.loadStart = false;

    this.scrollerEl.addEventListener('scroll', function(e) {
        // OPTIMALIZOVAT! na javascript
        if ($(this.scrollerEl).scrollTop() + $(this.scrollerEl).height() > $(this.scrollerEl).get(0).scrollHeight - 300) {
            if(this.loadStart) return;
            this.loadStart = true;
            logging("Scrolled to bottom - start load another data");
            this.scrollBottomFunction()
        }

    }.bind(this), false);

    this.scrollBottomFunction = function (){

    }
};