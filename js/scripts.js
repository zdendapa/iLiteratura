//var queryURL = "http://private-anon-49613b467-iliteratura.apiary-mock.com";
var urlQuery = "http://webapi.iliteratura.cz";
var urlSite = "http://iliteratura.cz";

// whole page waiter
var waiter = {
    element : "",
    visibility : false
};


var articlesClanky = {
    page : 1,
    loadIfEmpty : function()
    {
        if(articles.clanky.data.length==0)
        {
            $(".articles .content").empty();
            imgLoadingAdd($('.articles .content'));
            ajaxClanky(1);
        }
    },
  data : []
};

var articles = {
    // vyhledavani
    search : {
        data : [],
        waitContainer : $('.search .content'),
        getDataByID : function (id)
        {
            return articles.getDataByID(id,this.data);
        }
    },

    // clanky
    clanky : {
        data : [],
        getDataByID : function (id)
        {
            return articles.getDataByID(id,this.data);
        }
    },


    novinky : {
        data : [],
        page : 0,
        getDataByID : function (id)
        {
            return articles.getDataByID(id,this.data);
        }
    },

    doporucene : {
        data : [],
        page : 0,
        getDataByID : function (id)
        {
            return articles.getDataByID(id,this.data);
        }
    },

    // return article dataindex of article id
    idIndex : function(id)
    {
        var idIndex = -1;
        for(var i=0;i<this.data.length;i++)
        {
            var idin = inited.propertyGet(this.data[i],"Id");
            if(idin==id)
            {
                idIndex = i;
            }
        }
        return idIndex;
    },
    getDataByID : function(idIndex,data)
    {
        var dataIndex = -1;
        for(var i=0;i<data.length;i++)
        {
            var idin = inited.propertyGet(data[i],"Id");
            if(idin==idIndex)
            {
                dataIndex = i;
            }
        }
        if(dataIndex>-1)
        {
            return data[dataIndex];
        } else
        return null;
    }
};

/*
because I cannot run more details ajax (it will flood server) I must run them synchronous by batch
 so when it goes one batch I waiting for end

if details ajax is call
     detailsAjaxInAction = true
     when another is call detailsAjaxRunNew = true
 when finish
    when detailsAjaxRunNew is true, run again
    else render result
  */
var article = {
    data : "",
    ajaxInAction : false,
    ajaxRunNew : false,
    ajaxRunNewId : "",
    ajaxStopRender : false,
    detailsAjax : [],
    detailsAjaxInAction : false,
    detailsAjaxRunNew : false,
    detailData : []
};



// waiter in page (for scrollable effect must be in page wher you go)
var waiterInner = '<div class="waiter table">  <div class="tableCellMiddle">  <img class="wait" src="img/wait.gif" alt="Wait"/>  </div>  </div>';

/**
 * Function call init function and show default window
 */



function onDeviceReady() {

    //jsonGet.ajaxStart();
    /*
    var fileName = "nejlepsi-knihy-roku-2014.json";

    $.getJSON("data/"+fileName, function(json) {

        console.log(JSON.stringify(json));
    });

*/

    if (!local) {
        navigator.splashscreen.show();
    }
    scripDefaultInit();

    hideAll();



    //showWait(false);


    // articlesClanky initialize---------------
    $(".articles .content").empty();
    // set scroll function
    var el = document.getElementsByClassName("mainContent articles")[0].getElementsByClassName("content")[0];
    scrollLoadClanky = new scrollLoad(el);
    scrollLoadClanky.scrollBottomFunction = function()
    {
        imgLoadingAdd($(".articles .container.content"))
        ajaxClanky(articles.novinky.page+1);
    };


    // index initialize  ---------------
    $(".index .container.content").empty();
    waiterInject($(".index .container.content"));

    ajaxGetNovinky(1);
    showWindow("index");


    $('.footer li[data-animation="index"] span').addClass("active");
    if (!local) {
        navigator.splashscreen.hide();
    }



    // set scroll function
    el = document.getElementsByClassName("mainContent index")[0].getElementsByClassName("content")[0];
    scrollLoadIndex = new scrollLoad(el);
    scrollLoadIndex.scrollBottomFunction = function()
    {
        imgLoadingAdd($(".index .container.content"))
        ajaxGetNovinky(articles.novinky.page+1);
    };



}

/**
 * Initialize button click on data-article-id buttons, call AJAX functions for content of article and discussion.
 */
function clickInit() {
    $(document).on('click', '._buttonClick[data-article-id]', function (e) {

        var idArticle = $(this).attr("data-article-id");

        setTimeout(function () {

            /*
            if(idArticle.indexOf(".json")>-1)
            {
                showWindow("recList");
            } else
            {
             showWindow("article");
            }
            */

            showWindow("article");

            setTimeout(function () {
                // Resetting coments input fields
                removeInputErrorHighlighting();
            }, 300);
        }, 300);





        // is already rendered?
        if($("div[data-cont-id='article'] .artical").attr("data-article-id")==idArticle)
        {
            logging("article is already rendered :)");
            return;
        }



        /*
        if(pageSys.pageCurrent=="recCateg")
        {
            ajaxDoporucene("nejlepsi-knihy-roku-2014.json");

            return;
        }
*/


        // -------------- do you have already in memory?
        var dataClanku;
        // for clanky
        if(pageSys.pageCurrent=="articles")
        {
            dataClanku = articles.clanky.getDataByID(idArticle);
            if(dataClanku!=null)
            {
                processArticle(dataClanku);
                return;
            } else
            {
                imgLoadingAdd($('.articles .container.content'));
                getArticle(idArticle);
                return;
            }

        }
        if(pageSys.pageCurrent=="search")
        {
            dataClanku = articles.search.getDataByID(idArticle);
            if(dataClanku!=null)
            {
                processArticle(dataClanku);
                return;
            } else
            {
                imgLoadingAdd($('.articles .container.content'));
                getArticle(idArticle);
                return;
            }
        }
        // doporucene
        if(pageSys.pageCurrent=="recCateg")
        {
            dataClanku = articles.doporucene.getDataByID(idArticle);
            if(dataClanku!=null)
            {
                article.ajaxStopRender = true;
                processArticle(dataClanku);
                return;
            } else
            {
                imgLoadingAdd($('.articles .container.content'));
                getArticle(idArticle,"novinky");
                return;
            }
        }
        else
        {
        // for aticless

            dataClanku = articles.novinky.getDataByID(idArticle);
            if(dataClanku!=null)
            {
                article.ajaxStopRender = true;
                processArticle(dataClanku);
                return;
            }
        }


        logging("Article is not in memmory, lets load!")



        getArticle(idArticle);


        //getDiscussion(idArticle, null, null);
        $('div[data-cont-id="article"] .header .container .next').attr('data-article-detail-id', idArticle);
    });

    $(document).on('click', '._buttonClick[data-article-detail-id]', function () {
        var idArticle = $(this).attr("data-article-detail-id");
        console.log("Selected article detail ID:", idArticle);

        //processArticleDetail(articles.getDataByID(idArticle));
        //getArticleDetail(idArticle);
    });
    $('.tab_link').on('click', 'li', function () {
        $(this).parent().find('span').removeClass('active');
        $(this).find('span').addClass('active');
    });

    $('.search-by-tags li').on(support.supportedTouchStartEven, function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $(this).addClass('selected');
        }
    });

    $('.search-by-tags h3').on(support.supportedTouchStartEven, function () {
        if ($(this).closest('div').hasClass('reduced')) {
            $(this).closest('div').removeClass('reduced');
        } else {
            $(this).closest('div').addClass('reduced');
        }
    });

    // back button -zpet
    $('.header .container').on(support.supportedTouchStartEven, 'span.back', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var el = $(this)
        $(el).css("color", "#FFFFFF");

        setTimeout(function () {
            pageSys.goBack();
            $(el).css("color", "#244d80");
        }, 100);
    });

    $('.mainContent .header').on(support.supportedTouchStartEven, function () {
        var $container = $(this).parent().find('.container.content');
        $container.animate({scrollTop: 0}, '300', 'swing');
    });

    $('.footer').on(support.supportedTouchStartEven, 'span', function () {
        var elAnimPrevSpan = $('.footer').find("span.active").first();
        if ($(elAnimPrevSpan).length == 0) {
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
        if (animIndexPrev > animIndex) {
            smer = "l";
        }

        if (animPage == pageSys.pageCurrent) {
            return;
        }
        if (animIndex == 4) {
            if(!support.sccanerBarcode)
            {
                alertG("Scaner nelze připojit");
                return;
            }
            scanBarcode();
            return;
        }
        // vizual
        $('.footer').find('span.active').removeClass('active');
        $('.footer').find('li[data-animation="' + animPage + '"] span').addClass('active');

        showWindow(animPage, smer);
        //console.log(animPage);

    });


    /**
     * Initialize focusOut listener on search input.
     */
    $('#inputSearch').focusout(function () {
        var input = $(this).val();
        if (input !== "") {
            //searchArticles(input, input, input, input, 1, 10);
            ajaxSearch();
        }
    });

    $("#inputSearch").keypress(function (e) {
        if (e.keyCode == 13) {
            var input = $(this).val();
            if (input !== "") {
                //searchArticles(input, input, input, input, 1, 10);
                ajaxSearch();
            }
        }
    });

}



/**
 * Initialize transition futures like swiper, and special exceptions
 */
function transitionInit() {
    //pageSys.pageExceptionsAdd("articleDetail");
    $("#selHodnoceni").width($(".rating_box .rating_button").width() + "px");

    waiter.element = $(".special.wait");

    $("body").height($(window).height());
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
    if (typeof par != "undefined") {
        if (par == "back-l") {
            direction = "l";
            oldPage = pageSys.pageBack;
        }
        if (par == "l") {
            direction = "l";
        }
    }

    if (windowName === "index") {
        //containerVisibilitySet("index", true);
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "recCateg") {
        //containerVisibilitySet("recCateg", true);
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "recArticles") {
        //containerVisibilitySet("recArticles", true);
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "articles") {
        //containerVisibilitySet("articles", true);
        articlesClanky.loadIfEmpty();
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "search") {
        //containerVisibilitySet("search", true);
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "article") {
        //containerVisibilitySet("article", true);
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "articleDetail") {
        //containerVisibilitySet("articleDetail", true);
        containerSlide(oldPage, windowName, direction);
    }
    if (windowName === "recList") {
        console.log(oldPage+ windowName+ direction)
        //containerVisibilitySet("recList", true);
        containerSlide(oldPage, windowName, direction);
    }

    // vlozeni do page historie
    pageSys.addCurrent(windowName);
    return;


    // Animace
    var smer = "r";
    if (par == "smer-l") {
        smer = "l";

    }
    var prevWindow = pageSys.pageCurrent;
    if (par == "back") {
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

function clankyZanrChange()
{
    articlesClanky.page =1;
    articles.clanky.data = [];
    articlesClanky.loadIfEmpty();
}

function ajaxClanky(page) {
    articles.novinky.page = page;
    logging("ajaxClanky");
    var zanrId = $("#selBeletrie").val();
    var url = urlQuery + "/api/articles/GetByGenre?genreId="+zanrId+"&page="+page+"&pageSize=10";
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        success: ajaxClankyProcess,
        error: ajaxError
    });
}

function ajaxSearch() {
    logging("ajaxSearch");
    var str = $("#inputSearch").val();
    var url = urlQuery + "/api/articles/Search?searchString="+str;
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        success: ajaxSearchProcess,
        error: ajaxError,
        beforeSend: function () {
            $('.search .container.content').empty();
            imgLoadingAdd($('.search .container.content'));
        },
        complete: function () {
            imgLoadingRemove($('.search .container.content'));
        }
    });
}


function ajaxDoporucene(fileName) {
    logging("ajaxDoporucene");

    imgLoadingAdd($('.recList .container.content'));

    $.getJSON("data/"+fileName, function(json) {

        $('.recList .container.content').empty();
        imgLoadingRemove($('.recList .container.content'));
        ajaxDoporuceneProcess(json);
    });
}

// for Clanky and Search
function articlesPreRender(data)
{
    var htmlString = '';

    for(var i=0;i<data.length;i++)
    {
        var dataArt = data[i];
        var imgUrl = inited.propertyGet(dataArt,"TitleImageUrl");
        if(imgUrl=="" || imgUrl==null)
        {
            imgUrl = "http://www.iliteratura.cz/Content/Covers/loga/iLi_clanek.jpg";
        } else
        {
            imgUrl = urlSite + imgUrl;
        }
        var authorArticleName = "";
        authorArticleName = inited.propertyGet(dataArt,"AuthorArticle.NameFirst") + " ";
        authorArticleName += inited.propertyGet(dataArt,"AuthorArticle.NameLast");

        var articleDate = iniDate.conv1(inited.propertyGet(dataArt,"Date"));

        var artTitle = inited.propertyGet(dataArt,"Title");
        var artText = inited.propertyGet(dataArt,"Annotation");
        var artRating = inited.propertyGet(dataArt,"RatingAuthorArticle");
        if(artRating !="") artRating += "0%";
        else artRating = "0%";
        var type = inited.propertyGet(dataArt,"Type.Name").toUpperCase();


        htmlString += '<div class="book_list _buttonClick" data-article-id="'+dataArt.Id+'">';
        htmlString += '<div class="book_list_right">';
        htmlString += '<div class="rate_div">';
        htmlString += '<div class="rate">'+artRating+'</div>'
        htmlString += '<span class="next_link"><i class="fa fa-angle-right"></i></span>';
        htmlString += '</div>';
        htmlString += '</div>';
        htmlString += '<div class="book_list_left">';
        htmlString += '<h3>'+artTitle+'</h3>';
        htmlString += '<span>'+type+'</span>';
        htmlString += '<p>'+ authorArticleName +' '+articleDate+'</p>'
        htmlString += '</div>';
        htmlString += '</div>';
    }

    return htmlString;
}

function ajaxDoporuceneProcess(data) {

    var htmlString = articlesPreRender(data);

    $(".recList .content").html(htmlString);

    logging("ajaxDoporuceneProcess");

}

function ajaxSearchProcess(data) {

    articles.search.data.push.apply(articles.search.data, data);

    var htmlString = articlesPreRender(data);

    $(".search .content").html(htmlString);

    logging("ajaxSearchProcess");

}

function ajaxClankyProcess(data) {

    articles.clanky.data.push.apply(articles.clanky.data, data);

    var htmlString = articlesPreRender(data);

    if(articles.novinky.page==1)
    {
        //$(".articles .articlesList").empty();
    }

    $(".articles .content").append(htmlString);

    imgLoadingRemove($(".articles .content"));
    logging("clanky added");
    scrollLoadClanky.loadStart = false;

}

function ajaxGetNovinky(page) {
    articles.novinky.page = page;
    logging("ajaxGetNovinky");
    var url = urlQuery + "/api/articles/Get?page="+page+"&pageSize=10";
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        success: processArticles,
        error: ajaxError
    });
}

function getArticles_nepouzivane(page, pageSize) {
    var url = "http://iliteratura-api-test.azurewebsites.net/api/articles/Get?page={" + page + "}&pageSize={" + pageSize + "}";
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        success: processArticles,
        error: ajaxError
    });
}

/**
 * Makes AJAX request for article by its ID.
 *
 * @param id of article
 */
function getArticle(id, type) {

    if(article.ajaxInAction)
    {
        article.ajaxInAction = true;
        article.ajaxRunNew = true;
        article.ajaxRunNewId = id;
        logging("ajaxArticle already goes - quit")
        return;
    }

    type = type==null?"":type;

    $("div[data-cont-id='article'] .artical").empty();
    imgLoadingAdd($('.article .container.content'));

    article.ajaxInAction = true;
    article.ajaxStopRender = false;
    var url = urlQuery + "/api/articles/Get/" + id;
    console.log(url);
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        /*beforeSend: imgLoadingAdd($("div[data-cont-id='article'] .artical")),*/
        success: function(data) {
            if(type=="novinky")
            {
                articles.doporucene.data[articles.doporucene.data.length] = data;
            }
            if(!article.ajaxStopRender)
            {
                processArticle(data);
            }

        },
        complete : function()
        {
            article.ajaxInAction = false;
            if(article.ajaxRunNew)
            {
                article.ajaxRunNew = false;
                getArticle(article.ajaxRunNewId);
                return;
            }
        },
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
function processArticles(data, textStatus, jqXHR) {
    // Console info
    if(articles.novinky.data.length>0)
    {
        articles.novinky.data.push.apply(articles.novinky.data, data);
    } else
    {
        articles.novinky.data = data;
    }


    console.log(data);

    //htmlString = '<div class="bs_title"><h2>Kniha týdne</h2></div>';
    var htmlString = '';
    for(var i=0;i<data.length;i++)
    {
        var dataArt = data[i];
        var imgUrl = inited.propertyGet(dataArt,"TitleImageUrl");
        if(imgUrl=="" || imgUrl==null)
        {
            imgUrl = "http://www.iliteratura.cz/Content/Covers/loga/iLi_clanek.jpg";
        }else
        {
            imgUrl = urlSite + imgUrl;
        }
        var authorArticleName = "";
        authorArticleName = inited.propertyGet(dataArt,"AuthorArticle.NameFirst") + " ";
        authorArticleName += inited.propertyGet(dataArt,"AuthorArticle.NameLast");

        var articleDate = iniDate.conv1(inited.propertyGet(dataArt,"Date"));

        var artTitle = inited.propertyGet(dataArt,"Title");
        var artText = inited.propertyGet(dataArt,"Annotation");
        var artRating = inited.propertyGet(dataArt,"RatingAuthorArticle");
        if(artRating !="") artRating += "0%";
            else artRating = "0%";


        htmlString += '<div class="book_seciton _buttonClick" data-article-id="'+dataArt.Id+'">';

        htmlString += '<div class="book_seciton_left"><img src="'+imgUrl+'" alt="book"><span>RECENZE</span>';

        htmlString += '<p>'+ authorArticleName +'<br>'+articleDate+'</p>'
        htmlString += '</div>';


        htmlString += '<div class="book_seciton_right">';

        htmlString += '<h3>'+artTitle+'</h3>';

        htmlString += '<div class="rate_div"><div class="rate">'+artRating+'</div>';
        htmlString += '<a href="artical.html" class="next_link"><i class="fa fa-angle-right"></i></a></div>';
        htmlString += '<p>'+artText+'<p>';
        htmlString += '</div></div>';

    }
    if(articles.novinky.page==1)
    {
        $(".index .container.content").empty();
    }

    $(".index .container.content").append(htmlString);

    imgLoadingRemove($(".index .container.content"));
    logging("novinky added");
    scrollLoadIndex.loadStart = false;
    /*
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

        */


}

/**
 * Function makes HTML code from AJAX request.
 *
 * @param data from AJAX request
 * @param textStatus from AJAX request
 * @param jqXHR javascipt XMLHttpRequest
 */
function processArticle(data, textStatus, jqXHR) {

    article.data = data;


    // Console info
    //console.log("AJAX Article Detail:", jqXHR.status, textStatus);
    console.log(data);
    var imgUrl = inited.propertyGet(data,"TitleImageUrl");
    if(imgUrl=="" || imgUrl==null)
    {
        imgUrl = "http://www.iliteratura.cz/Content/Covers/loga/iLi_clanek.jpg";
    }else
    {
        imgUrl = urlSite + imgUrl;
    }
    var artAuthor = inited.propertyGet(data,"Author.Firstname") + " " + inited.propertyGet(data,"Author.Lastname");
    var artDate = iniDate.conv1(inited.propertyGet(data,"Date"));
    var artDate = inited.propertyGet(data,"Date");
    var artText = inited.propertyGet(data,"Text");
    artText = stringUrlImageFix(artText);
    var artTitle = inited.propertyGet(data,"Title");
    var type = inited.propertyGet(data,"Type.Name").toUpperCase();
    /*
    var img = $('<img/>').attr('src', imgUrl);
    var title = $('<h3></h3>').text(data.Title);
    var author = $('<div class="author"></div>').text("Autor článku: " + artAuthor + " - " + data.Date);
    var text = $('<div class="text"></div>').text(data.Text);
    */
     htmlString = "";
    htmlString += '<img src="'+imgUrl+'" alt="Článek">';
    htmlString += '<h3>'+artTitle+'</h3>';
    htmlString += '<div class="article-author"><span>Autor článku: </span>';
    htmlString += '<span class="author">'+artAuthor+'</span>';
    htmlString += '<span> - </span>';
    htmlString += '<span class="date">13.7.2014</span>';
    htmlString += '</div>';

    htmlString += '<div class="article-type">';
    htmlString += type;//'recenze, sociologie';
    htmlString += '</div>';
    htmlString += '<p>';
    htmlString += artText;
    htmlString += '</p>';
    htmlString += '</div>';

    imgLoadingRemove($('.article .container.content'))

    $("div[data-cont-id='article'] .artical").html(htmlString)
        .attr("data-article-id",data.Id);
    $(".article .container.content").scrollTop(0,0);


    if(article.data.RelatedArticleIds.length>0)
    {
        ajaxDetailsSet();
    }

}

function stringUrlImageFix(data)
{
    var regex = new RegExp('src="', 'g');
    return data.replace(regex, 'src="http://iliteratura.cz');
}

// prepare ajax calls for details. When you go back from article, they will be aborted
function ajaxDetailsSet()
{

    if(article.detailsAjaxInAction)
    {
        article.detailsAjaxRunNew = true;
        logging("ajaxDetails already goes - quit")
        return;
    }



    logging("set ajax calls for article: " + article.data.Id + " count:" + article.data.RelatedArticleIds.length);
    article.detailsAjaxInAction = true;
    $(".articleDetail .mid_section").empty();
    imgLoadingAdd($('.articleDetail .mid_section'));

    // disable if ajax calls if is in progress
    /*
    if(article.data.detailsAjaxInAction)
    {
        for(var i=0;i<article.detailsAjax.length;i++)
        {
            article.detailsAjax[i].abort();
            logging("ajaxDetails aborting: ");
        }
        article.data.detailsAjaxInAction = false;
    }
*/

    article.detailsAjax = [];
    article.detailData = [];



    // call ajaxs
    for(var i=0;i<article.data.RelatedArticleIds.length;i++)
    {
        article.data.detailsAjaxInAction = true;
        var url = urlQuery + "/api/articles/Get/" + article.data.RelatedArticleIds[i];
        article.detailsAjax[i] = $.ajax({
                url: url,
                dataType: 'json',
                crossDomain: true,
                success: processArticleDetail2,
                error: ajaxError
        });
    }
}

/**
    generate related articles (související clanky)
 */
function processArticleDetail2(data) {

    article.detailData[article.detailData.length] = data;
    logging("articleDetail ajax got:" + article.detailData.length);

    // when all data from ajax are in array, lest process result

    if(article.detailData.length==article.detailsAjax.length) {
        logging("articleDetail all got! Now lets render all them");

        article.detailsAjaxInAction = false;
        if(article.detailsAjaxRunNew)
        {
            ajaxDetailsSet();
            article.detailsAjaxRunNew = false;
            return;
        }

        var htmlString = "";
        htmlString += '<div class="container content">';
        htmlString += '<div class="related-articles">';
        htmlString += '<div class="bs_title"><h2>související články:</h2></div>';

        for(var i=0;i<article.detailData.length;i++)
        {
            var o = article.detailData[i];
            var title = inited.propertyGet(o,"Title");
            var type = inited.propertyGet(o,"Type.Name").toUpperCase();
            var authorArticleName = inited.propertyGet(o,"AuthorArticle.NameFirst") + " ";
            authorArticleName += inited.propertyGet(o,"AuthorArticle.NameLast");
            var articleDate = iniDate.conv1(inited.propertyGet(o,"Date"));
            var artRating = inited.propertyGet(o,"RatingAuthorArticle");
            if(artRating !="") artRating += "0%";
            else artRating = "0%";


            htmlString += '<div class="book_list _buttonClick" data-article-id="'+ o.Id+'">';
            htmlString += '<div class="book_list_left">';
            htmlString += '<h3>'+title+'</h3>';
            htmlString += '<span>'+type+'</span>';
            htmlString += '<p>'+ authorArticleName +' '+ articleDate+'</p>';
            htmlString += '</div>';
            htmlString += '<div class="book_list_right">';
            htmlString += '<div class="rate_div">';
            htmlString += '<div class="rate">'+artRating+'</div>';
            htmlString += '<a href="#_" class="next_link"><i class="fa fa-angle-right"></i></a> </div>';
            htmlString += '</div>';
            htmlString += '</div>';


        }



        htmlString += '</div>';
        htmlString += '</div>';
        htmlString += '</div>';
        $(".articleDetail .mid_section").html(htmlString);
        imgLoadingRemove($('.articleDetail .mid_section'));

    }
}



/**
 * Makes AJAX request for detailed info for article by its ID.
 * On success call processArticleDetail function
 * On error call ajaxError function
 *
 * @param idArticle of article
 */
function getArticleDetail(idArticle) {
    var url = urlQuery + "/articles/detail/" + idArticle;
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        beforeSend: function () {
            var page = $('.articleDetail .container.content');
            page.find('.book_list').remove();
            page.find('.gusetbook').remove();
            page.find('.rating .bs_title:eq(1)').remove();
            imgLoadingAdd(page.find('.related-articles'));
        },
        success: processArticleDetail,
        error: ajaxError,
        complete: function () {
            imgLoadingRemove($('.articleDetail .container.content').find('.related-articles'));
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
    //console.log("AJAX Article Detail:", jqXHR.status, textStatus);

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
    var url = urlQuery + "/articles/rating/" + idArticle;
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
    var url = urlQuery + "/discussions/search?{" + idArticle + "}&{" + page + "}&{" + pageSize + "}";
    $.ajax({
        url: url,
        dataType: 'json',
        crossDomain: true,
        beforeSend: function () {
            var page = $("div[data-cont-id='article']");
            page.find(".discuss_content").remove();
            imgLoadingAdd($("div[data-cont-id='article'] .discuss"));
        },
        success: processDiscussion,
        error: ajaxError,
        complete: function () {
            imgLoadingRemove($("div[data-cont-id='article']").find(".discuss"));
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
    var url = urlQuery + "/discussions/" + idArticle;
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
    /*var url = urlQuery + "/articles/search?" +
     "{" + author + "}&{" + title + "}&{" + authorArticle + "}&{" + isbn + "}&{" + page + "}&{" + pageSize + "}";*/
    var url =
        "http://iliteratura-api-test.azurewebsites.net/api/articles/" +
        "Search?author={" + author + "}&title={" + title + "}&authorArticle={" + authorArticle + "}&" +
        "isbn={" + isbn + "}&page={" + page + "}&pageSize={" + pageSize + "}";

    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        beforeSend: function () {
            $('.search .container.content .articlesList').remove();
            imgLoadingAdd($('.search .container.content'));
        },
        success: processSearch,
        error: ajaxError,
        complete: function () {
            imgLoadingRemove($('.search .container.content'));
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
    //imgLoadingRemove();

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
function ajaxError_old(jqXHR, textStatus, errThrown) {
    console.log("AJAX:", textStatus, jqXHR.status, errThrown);
}
function ajaxError(data) {
    console.log(data);
    showInfow(false);

    if(!local)
    {
        if(typeof navigator.connection!="undefined")
        {
            showInfow(false);
            var networkState = navigator.connection.type;
            if(networkState == Connection.UNKNOWN || networkState== Connection.NONE)
            {
                alertG("Nelze se připojit k internetu","Chyba!");
                return;false
            }
        }

    }

    var msg = "";
    if(typeof data.msg != "undefined")
    {
        msg = data.msg;
    }

    if(typeof data.responseText != "undefined")
    {
        msg = data.responseText;
    }

    if(msg=="")
    {
        alertG("Chyba s komunikací se serverem","Chyba!");
    } else
    {
        alertG("chyba:" +data.msg,"Chyba!");
    }
}

/**
 * Add ajax loading image to some jQuery selected element
 *
 * @param jQueryEl
 */
function imgLoadingAdd(jQueryEl) {
    var img = $('<img class="loading-image"/>')
        //.attr('src', './img/ajax-loader.gif')
        .attr('src', './img/wait.gif')
        .attr('alt', 'Nahrávám data ...');
    jQueryEl.append(img);
}

/**
 * Function removes loading image.
 *
 * @param jQueryEl
 */
function imgLoadingRemove(jQueryEl) {
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
    /*
    $('input').val("").css('border', 0);
    $('textarea').val("").css('border', 0);
    $('p.error').remove();
    */
}

/**
 * Makes barcode scan.
 */
function scanBarcode() {

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
        //searchArticles("", "", "", result.text, 1, 10);
        $('#inputSearch').val(result.text);
        showWindow("search");
        $('.footer').find('span.active').removeClass('active');
        $('.footer').find('li[data-animation="search"] span').addClass('active');

        setTimeout(function () {
            ajaxSearch();
        }, 100);


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

function waiterShow(show) {
    if(show==waiter.visibility) return;

    if (show) {
        $(waiter.element).css("display","block");
        waiter.visibility = true;
    } else {
        $(waiter.element).css("display","none");
        waiter.visibility = false;
    }
}

function waiterInject(container) {
    $(container).append(waiterInner);
}

var jsonGet = {
    res : [],
    ajaxStart : function(){
        var ajaxids = [33941,33715];
        logging("ajaxStart ");
        for(var i=0;i<ajaxids.length;i++)
        {
            this.ajax(ajaxids[i]);
            logging("start " +i);
        }
    },
    ajax : function(id){
        var url = urlQuery + "/api/articles/Get/"+id;
        $.ajax({
            url: url,
            dataType: 'json',
            crossDomain: true,
            success: this.resultGet,
            error: ajaxError
        });
    },
    resultGet : function(data){
        logging("data " +jsonGet.res.length);
        jsonGet.res[jsonGet.res.length] = data;
        if(jsonGet.res.length==2)
        {
            logging("hotovo");
        }
    }
};

