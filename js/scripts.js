var elMainTopH;

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

    showWindow("index");
    //showWindow("prihlaseni");
}

function clickInit() {

    $('._buttonClick[data-article-id]').on('click', function () {
        console.log("a");
        setTimeout(function () {
            showWindow("article");
        }, 300);

        var idArticle = $(this).attr("data-article-id");
        console.log("Selected article ID:", idArticle);
        getArticle(idArticle);
        getDiscussion(idArticle, null, null);
        $('div[data-cont-id="article"] .header .container .next').attr('data-article-detail-id', idArticle);
        $('div[data-cont-id="article"] .header .container .next[data-article-detail-id]').on('click', function () {
            var idArticle = $(this).attr("data-article-detail-id");
            console.log("Selected article detail ID:", idArticle);
            getArticleDetail(idArticle);
        });
    });

}

/**
 * Funcion show window by its name.
 *
 * @param windowName name of window class
 */
function showWindow(windowName) {
    hideAll();

    if (windowName === "index") {
        containerVisibilitySet("index", true);
    }
    if (windowName === "recCateg") {
        containerVisibilitySet("recCateg", true);
    }
    if (windowName === "articles") {
        containerVisibilitySet("articles", true);
    }
    if (windowName === "search") {
        containerVisibilitySet("search", true);
    }
    if (windowName === "scan") {
        containerVisibilitySet("scan", true);
    }
    if (windowName === "article") {
        containerVisibilitySet("article", true);
    }
    if (windowName === "articleDetail") {
        containerVisibilitySet("articleDetail", true);
    }
    if (windowName === "recList") {
        containerVisibilitySet("recList", true);
    }
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
        success: processArticleDetail,
        error: ajaxError
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
    var page = $('.mainContent.articleDetail');
    page.find('.book_list').remove();
    page.find('.gusetbook').remove();
    page.find('.rating .bs_title:eq(1)').remove();


    // Creating dynamic html element
    var rating = $('<div class="gusetbook"><ul>' +
        '<li><span>' + data.RatingAuthorArticle + '</span>autor článku</li>' +
        '<li><span>' + data.RatingUsers + '</span>čtenáři</li>' +
        '</ul></div>');
    var views = $('<div class="bs_title"><h2>zhlédnuto: ' + data.Views + 'x</h2></div>');
    // Cycle for related articles
    $.each(data.RelatedArticles, function (key, val) {
        var relArticle = $('<div class="book_list _buttonClick"></div>')
            .attr("data-click", "showWindow('article')")
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
            var rating = $('<div class="rate"></div>').text('API - Chybí');
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
        success: processDiscussion,
        error: ajaxError
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
    $("div[data-cont-id='contentArticle'] .discuss").empty();
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
 * @param {type} author
 * @param {type} title
 * @param {type} authorArticle
 * @param {type} isbn
 * @param {type} page
 * @param {type} pageSize
 * @returns {undefined}
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
        success: processSearch,
        error: ajaxError
    });
}

function processSearch(data, textStatus, jqXHR) {
    // Console info
    console.log("AJAX Search:", jqXHR.status, textStatus);
    // Creating html element and putting data
    var articlesList = $('<div class="articlesList"></div>').text('Seznam vyhledaných článků');
    $.each(data, function (key, val) {
        var articleBox = $('<div class="articleBox"></div>').text('Článek').attr("article-id", val.Id);
        var title = $('<div class="title"></div>').text(val.Title);
        var author = $('<div class="author"></div>').text(val.Author.NameFirst + " " + val.Author.NameLast);
        var date = $('<div class="date"></div>').text(val.Date);
        var type = $('<div class="type"></div>').text(val.Type.Name);
        articleBox
            .append(title)
            .append(author)
            .append(date)
            .append(type);
        if (val.RatingAuthorArticle) {
            var rating = $('<div class="rating"></div>').text(val.RatingAuthorArticle);
            articleBox.append(rating);
        }
        articlesList.append(articleBox);
        $("div[data-cont-id='search']").append(articlesList);
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
}