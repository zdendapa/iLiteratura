/**
 * URL of page which reacts to AJAX requests
 * @type {string}
 */
var queryURL = "http://private-anon-49613b467-iliteratura.apiary-mock.com";


/**
 * Function call init function and show default window
 */
function onDeviceReady() {

    scripDefaultInit();

    hideAll();
    showWindow("index");
    $('.footer li[data-animation="index"] span').addClass("active");
}

/**
 * Initialize button click on data-article-id buttons, call AJAX functions for content of article and discussion.
 */
function clickInit() {
    $(document).on('click', '._buttonClick[data-article-id]', function (e) {
        setTimeout(function () {
            showWindow("article");
        }, 300);

        // Resetting error highlighting
        removeInputErrorHighlighting();

        var idArticle = $(this).attr("data-article-id");
        console.log("Selected article ID:", idArticle);
        getArticle(idArticle);
        getDiscussion(idArticle, null, null);
        $('div[data-cont-id="article"] .header .container .next').attr('data-article-detail-id', idArticle);
    });

    $(document).on('click', '._buttonClick[data-article-detail-id]', function () {
        var idArticle = $(this).attr("data-article-detail-id");
        console.log("Selected article detail ID:", idArticle);
        getArticleDetail(idArticle);
    });
    $('.tab_link').on('click', 'li', function () {
        $(this).parent().find('span').removeClass('active');
        $(this).find('span').addClass('active');
    });

    $('.header .container').on('touchstart', 'span.back', function () {
        var el = $(this)
        $(el).css("color","#FFFFFF");

        setTimeout(function () {
            pageSys.goBack();
            $(el).css("color","#244d80");
        }, 100);
    });

    $('.footer').on('touchstart', 'span', function () {
        var elAnimPrevSpan = $('.footer').find("span.active").first();
        if($(elAnimPrevSpan).length==0)
        {
            elAnimPrevSpan = $('.footer').find("li").first().find("span");
        }
        var elAnimPrev = $(elAnimPrevSpan).parent();
        var animIndexPrev = $(elAnimPrev).index();

        var elAnimSpan = $(this);
        var elAnim = $(elAnimSpan).parent();
        var animIndex = $(elAnim).index();
        var animPage = $(elAnim).attr("data-animation");

        var smer;
        /*
        console.log(animIndexPrev);
        console.log(animIndex);
        */
        if(animIndexPrev>animIndex)
        {
            smer = "l";
        }

        if(animPage==pageSys.pageCurrent)
        {
            return;
        }
        // vizual
        $('.footer').find('span.active').removeClass('active');
        $('.footer').find('li[data-animation="' + animPage + '"] span').addClass('active');
        if(animIndex==4) {
            scanBarcode();
            return;
        }
        showWindow(animPage,smer);
        //console.log(animPage);

    });
}

/**
 * Initialize focusOut listener on search input.
 */
function focusOutInit() {
    $('div[data-cont-id="search"] .search-input input').focusout(function () {
        var input = $('div[data-cont-id="search"] .search-input input').val();
        if (input !== "") {
            searchArticles(input, input, input, input, 1, 10);
        }
    });
}
/**
 * Initialize transition futures like swiper, and special exceptions
 */
function transitionInit() {
    //pageSys.pageExceptionsAdd("articleDetail");
    $("#selHodnoceni").width($(".rating_box .rating_button").width()+"px");
}

/**
 * Initialize data, like localStorage...
 */
function dataManagerLoad() {

}


/**
 * Funcion show window by its name.
 *
 * @param windowName name of window class
 * @param par parameter
 */
function showWindow(windowName, par) {
    // -------
    var direction = "r";
    var oldPage = pageSys.pageCurrent;
    if(typeof par != "undefined")
    {
        if(par=="back-l")
        {
            direction = "l";
            oldPage = pageSys.pageBack;
        }
        if(par=="l")
        {
            direction = "l";
        }
    }

    if (windowName === "index") {
        //containerVisibilitySet("index", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "recCateg") {
        //containerVisibilitySet("recCateg", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "recArticles") {
        //containerVisibilitySet("recArticles", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "articles") {
        //containerVisibilitySet("articles", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "search") {
        //containerVisibilitySet("search", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "article") {
        //containerVisibilitySet("article", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "articleDetail") {
        //containerVisibilitySet("articleDetail", true);
        containerSlide(oldPage,windowName,direction);
    }
    if (windowName === "recList") {
        //containerVisibilitySet("recList", true);
        containerSlide(oldPage,windowName,direction);
    }

    // vlozeni do page historie
    pageSys.addCurrent(windowName);
    return;



    // Animace
    var smer = "r";
    if(par == "smer-l")
    {
        smer = "l";

    }
    var prevWindow = pageSys.pageCurrent;
    if(par == "back")
    {
        smer = "l";
        prevWindow = pageSys.pageBack;

    }
    /*
    console.log(prevWindow);
    console.log(windowName);
    */
    if (prevWindow && (prevWindow !== windowName)) {

        animateWindow(prevWindow, windowName, smer);

    }

    // vlozeni do page historie
    pageSys.addCurrent(windowName);

}

/**
 * Makes AJAX request for article by its ID.
 *
 * @param id of article
 */
function getArticle(id) {
    var url = queryURL + "/articles/" + id;
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        /*beforeSend: addLoadingImg($("div[data-cont-id='article'] .artical")),*/
        success: processArticle,
        error: ajaxError
    });
}

/**
 * Function makes HTML code from AJAX request.
 *
 * @param data from AJAX request
 * @param textStatus from AJAX request
 * @param jqXHR javascipt XMLHttpRequest
 */
function processArticle(data, textStatus, jqXHR) {
    // Console info
    console.log("AJAX Article Detail:", jqXHR.status, textStatus);
    var img = $('<img/>').attr('src', data.TitleImgUrl);
    var title = $('<h3></h3>').text(data.Title);
    var author = $('<div class="author"></div>').text("Autor článku: " + data.Author.NameFirst + " " + data.Author.NameLast + " - " + data.Date);
    var text = $('<div class="text"></div>').text(data.Text);
    $("div[data-cont-id='article'] .artical")
        .empty()
        .append(img)
        .append(title)
        .append(author)
        .append(text);


}

/**
 * Makes AJAX request for detailed info for article by its ID.
 * On success call processArticleDetail function
 * On error call ajaxError function
 *
 * @param idArticle of article
 */
function getArticleDetail(idArticle) {
    var url = queryURL + "/articles/detail/" + idArticle;
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        beforeSend: function () {
            var page = $('.articleDetail .container.content');
            page.find('.book_list').remove();
            page.find('.gusetbook').remove();
            page.find('.rating .bs_title:eq(1)').remove();
            addLoadingImg(page.find('.related-articles'));
        },
        success: processArticleDetail,
        error: ajaxError,
        complete: function () {
            removeLoadingImg($('.articleDetail .container.content').find('.related-articles'));
        }
    });
}

/**
 * Takes data from jQuery AJAX request, create html elements and put them into HTML doc
 *
 * @param data AJAX request data
 * @param textStatus status of AJAX request
 * @param jqXHR javascript XMLHttpRequest
 */
function processArticleDetail(data, textStatus, jqXHR) {
    // Console info
    console.log("AJAX Article Detail:", jqXHR.status, textStatus);

    // Elements for putting content
    var page = $('.articleDetail .container.content');


    // Creating dynamic html element
    var rating = $('<div class="gusetbook"><ul>' +
        '<li><span>' + data.RatingAuthorArticle + '</span>autor článku</li>' +
        '<li><span>' + data.RatingUsers + '</span>čtenáři</li>' +
        '</ul></div>');
    var views = $('<div class="bs_title"><h2>zhlédnuto: ' + data.Views + 'x</h2></div>');
    // Cycle for related articles
    $.each(data.RelatedArticles, function (key, val) {
        var relArticle = $('<div class="book_list _buttonClick"></div>')
            //.attr("data-click", "showWindow('article')")
            .attr("data-article-id", val.Id);
        var bookListLeft = $('<div class="book_list_left"></div>')
            .append($('<h3></h3>').text(val.Title))
            .append($('<span></span>').text(val.Type.Name.toUpperCase()))
            .append($('<p>Autor - (API chybí)</p>'));
        var bookListRight = $('<div class="book_list_right"></div>');
        var rateDiv = $('<div class="rate_div"></div>');
        if (val.Type.Rating) {
            var rating = $('<div class="rate"></div>').text(val.Type.Rating);
        } else {
            var rating = $('<div class="rate"></div>').text('0%');
        }
        rateDiv
            .append(rating)
            .append($('<span href="#" class="next_link"><i class="fa fa-angle-right"></i></span>'));
        bookListRight.append(rateDiv);
        relArticle
            .append(bookListLeft)
            .append(bookListRight);
        page.find('.related-articles').append(relArticle);
    });

    // Appending to document
    page.find('.rating')
        .append(rating)
        .append(views);
}

/**
 * Makes AJAX post to server with user rating of article.
 *
 * @param idArticle of article
 * @param rating of article 1-5
 */
function postArticleRating(idArticle, rating) {
    var url = queryURL + "/articles/rating/" + idArticle;
    var json = JSON.stringify({RatingUser: rating});
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        processData: false,
        data: json,
        success: function (data, textStatus, jqXHR) {
            console.log("AJAX PostArticleRating:", jqXHR.status, textStatus);
        },
        error: ajaxError
    });
}

/**
 * Function returns discussion of selected article by id.
 *
 * @param idArticle id of article
 * @param page Optional. Page number to show results at certain page. Has example value.
 * @param pageSize Optional. Number of results per page. Has example value.
 */
function getDiscussion(idArticle, page, pageSize) {
    page = page || 1;
    pageSize = pageSize || 10;
    var url = queryURL + "/discussions/search?{" + idArticle + "}&{" + page + "}&{" + pageSize + "}";
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        beforeSend: function () {
            var page = $("div[data-cont-id='article']");
            page.find(".discuss_content").remove();
            addLoadingImg($("div[data-cont-id='article'] .discuss"));
        },
        success: processDiscussion,
        error: ajaxError,
        complete: function () {
            removeLoadingImg($("div[data-cont-id='article']").find(".discuss"));
        }
    });
}

/**
 * Makes HTML code from received AJAX data.
 *
 * @param data from AJAX request
 * @param textStatus from AJAX request
 * @param jqXHR javascript XMLHttpRequest
 */
function processDiscussion(data, textStatus, jqXHR) {
    // Console info
    console.log("AJAX Discussion:", jqXHR.status, textStatus);
    // Creating html element and putting data

    $.each(data, function (key, value) {
        var discussionBox = $('<div class="discuss_content"></div>');
        var name = $('<h4></h4>').text(value.Name);
        var text = $('<p></p>').text(value.Text);
        discussionBox
            .append(name)
            .append(text);
        $("div[data-cont-id='article'] .discuss").append(discussionBox);
    });
}

/**
 * Function makes AJAX post to discussion.
 *
 * @param idArticle of article
 * @param name of contributor
 * @param email of contributor
 * @param post text
 */
function postDiscussion(idArticle, name, email, post) {
    var url = queryURL + "/discussions/" + idArticle;
    var json = JSON.stringify({Name: name, Email: email, Text: post});
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        processData: false,
        data: json,
        success: function (data, textStatus, jqXHR) {
            console.log("AJAX PostDiscussion:", jqXHR.status, textStatus);
        },
        error: ajaxError
    });
}

/**
 * Function make AJAX search request.
 *
 * @param {string} author
 * @param {string} title
 * @param {string} authorArticle
 * @param {string} isbn
 * @param {number} page
 * @param {number} pageSize
 */
function searchArticles(author, title, authorArticle, isbn, page, pageSize) {
    author = author || "";
    title = title || "";
    authorArticle = authorArticle || "";
    isbn = isbn || "";
    page = page || 1;
    pageSize = pageSize || 10;
    var url = queryURL + "/articles/search?" +
        "{" + author + "}&{" + title + "}&{" + authorArticle + "}&{" + isbn + "}&{" + page + "}&{" + pageSize + "}";

    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        beforeSend: function () {
            $('.search .container.content .articlesList').remove();
            addLoadingImg($('.search .container.content'));
        },
        success: processSearch,
        error: ajaxError,
        complete: function () {
            removeLoadingImg($('.search .container.content'));
        }
    });
}

/**
 * Take AJAX data from search request and make HTML code from them.
 *
 * @param data from AJAX request
 * @param textStatus from AJAX request
 * @param jqXHR javascript XMLHttpRequest
 */
function processSearch(data, textStatus, jqXHR) {
    // Console info
    console.log("AJAX Search:", jqXHR.status, textStatus);
    //removeLoadingImg();

    var page = $("div[data-cont-id='search'] .container.content");
    page.find('.articlesList').remove();

    // Creating html element and putting data
    var articlesList = $('<div class="articlesList"></div>');
    $.each(data, function (key, val) {
        var articleBox = $('<div class="book_list _buttonClick"></div>').attr("data-article-id", val.Id);
        var leftPart = $('<div class="book_list_left"></div>');
        var title = $('<h3></h3>').text(val.Title);
        var type = $('<span></span>').text(val.Type.Name);
        var author = $('<p></p>').text(val.Author.NameFirst + " " + val.Author.NameLast + " " + val.Date);
        leftPart
            .append(title)
            .append(type)
            .append(author);

        var rightPart = $('<div class="book_list_right"></div>').append($('<div class="rate_div"></div>'));
        if (val.RatingAuthorArticle) {
            var rating = $('<div class="rate"></div>').text(val.RatingAuthorArticle + "0 %");
        }

        rightPart.find('.rate_div')
            .append(rating)
            .append($('<span class="next_link"><i class="fa fa-angle-right"></i></span>'));

        articleBox
            .append(rightPart)
            .append(leftPart);

        articlesList.append(articleBox);
        page.append(articlesList);
    });

}

/**
 * Function output error message into console.
 *
 * @param jqXHR jQuery XMLHTTPRequest
 * @param textStatus status of AJAX
 * @param errThrown error message
 */
function ajaxError(jqXHR, textStatus, errThrown) {
    console.log("AJAX:", textStatus, jqXHR.status, errThrown);
    $(".article .container.content").scrollTop(0);
}

/**
 * Add ajax loading image to some jQuery selected element
 *
 * @param jQueryEl
 */
function addLoadingImg(jQueryEl) {
    var img = $('<img class="loading-image"/>')
        .attr('src', './img/ajax-loader.gif')
        .attr('alt', 'Nahrávám data ...');
    jQueryEl.append(img);
}

/**
 * Function removes loading image.
 *
 * @param jQueryEl
 */
function removeLoadingImg(jQueryEl) {
    jQueryEl.find('.loading-image').remove();
}

/**
 * Take data from discussion form and make check. If everything is OK, then call AJAX post.
 */
function sendDiscussionPost() {
    removeInputErrorHighlighting();
    var name, email, text, error, articleID;
    articleID = $('div[data-cont-id="article"] .header .container .next[data-article-detail-id]').attr('data-article-detail-id');
    error = false;
    name = $('.artical_form input[name="name"]');
    email = $('.artical_form input[name="mail"]');
    text = $('.artical_form textarea[name="message"]');
    if (name.val() === "") {
        name.before('<p class="error">Jméno musí být vyplněno.</p>');
        name.css('border', '1px solid red');
        error = true;
    }

    if (validateEmail(email.val())) {
        email.before('<p class="error">E-mail musí být vyplněn a ve správné formě.</p>');
        email.css('border', '1px solid red');
        error = true;
    }

    if (text.val() === "") {
        text.before('<p class="error">Text příspěvku musí být vyplněn.</p>');
        text.css('border', '1px solid red');
        error = true;
    }
    if (!error) {
        postDiscussion(articleID, name.val(), email.val(), text.val());
        removeInputErrorHighlighting();
        alertG("Příspěvek odeslán.", "Info");
    }
}

/**
 * Test if mail address suits regexp.
 *
 * @param email string with mail adress
 * @returns {boolean} true if mail test fails
 */
function validateEmail(email) {
    var emailReg = new RegExp("^[\\w\\d._%+-]+@[\\w\\d.-]+\\.[\\w]{2,4}$");
    return !emailReg.test(email);
}

/**
 * Function removes error highlighting and values of inputs and textareas.
 */
function removeInputErrorHighlighting() {
    $('input').val("").css('border', 0);
    $('textarea').val("").css('border', 0);
    $('p.error').remove();
}

/**
 * Makes barcode scan.
 */
function scanBarcode() {

    var scannerSupport = true;
    var msg = function() {
        alertG("Scaner nelze připojit");
    };
    if(typeof cordova == "undefined")
    {
        msg();
        return;
    }
    /*
    if(typeof cordova.plugins == "undefined")
    {
        msg();
        return;
    }
    if(typeof cordova.plugins.BarcodeScanner == "undefined")
    {
        msg();
        return;
    }
    */

    var scanner = cordova.require("cordova/plugin/BarcodeScanner");

    scanner.scan(function (result) {
        searchArticles("", "", "", result.text, 1, 10);
        $('.search-input input').val(result.text);
        showWindow("search");
        $('.footer').find('span.active').removeClass('active');
        $('.footer').find('li[data-animation="search"] span').addClass('active');

        /*alert("We got a barcode\n" +
         "Result: " + result.text + "\n" +
         "Format: " + result.format + "\n" +
         "Cancelled: " + result.cancelled);
         */
        console.log("SCANNER result: \n" +
            "text: " + result.text + "\n" +
            "format: " + result.format + "\n" +
            "cancelled: " + result.cancelled + "\n");
        console.log("SCANNER:", result);

    }, function (error) {
        showWindow("search");
        $('.footer').find('span.active').removeClass('active');
        $('.footer').find('li[data-animation="search"] span').addClass('active');
        alertG("Chyba scanneru")
        console.log("SCANNER failed: ", error);
    });
}

/**
 *
 * @param leavingWindow
 * @param comingWindow
 * @param side
 */
function animateWindow(leavingWindow, comingWindow, side) {
    var time = 300; //miliseconds
    var leave, from = "";

    switch (side) {
        case "l" :
            from = "from-left";
            leave = "leave-right";
            break;
        case "r" :
            from = "from-right";
            leave = "leave-left";
            break;
        default :
            from = "from-right";
            leave = "leave-left";
            break;
    }

    containerVisibilitySet(leavingWindow, true);
    containerVisibilitySet(comingWindow, true);
    $('.mainContent.' + leavingWindow).addClass(leave).delay(time).queue(function () {
        containerVisibilitySet(leavingWindow, false);
        $(this).removeClass(leave).dequeue();
    });
    $('.mainContent.' + comingWindow).addClass(from).delay(time).queue(function () {
        $(this).removeClass(from).dequeue();
    });

}

function test()
{
    //$("div.mainContent.index").addClass("left")
    //$("div.mainContent.index").css("-webkit-transform", "translate3d(-100%, 0, 0)");
    //$("div.mainContent.index").css("transform", "translate3d(-100%, 0, 0)");
    ///containerSlide("articleDetail", "article","r");
    containerSlide("index", "article","r");
}