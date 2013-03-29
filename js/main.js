var launch = function() {

    $('body').css('background-image', 'img/blu_stripes.png');
    
    url = "http://www.reddit.com/.json?jsonp=?";
    
    getFeed(url);

};

var refresh = function(){
    $('html, body').animate({ scrollTop: 0 }, 0);
    $('#feed').empty();
    getFeed(url);
};

var getFeed = function(feedurl) {
    //console.log('getFeed running on '+feedurl);
    $.getJSON(feedurl, function(data) {
        //console.log(data);

        if (!data) {alert('Sorry, I ran into an error getting this data.')};
        
        $.each(data.data.children, function(i,item){
            // console.log(item.data.title);
            // console.log(item.data.domain);
            if ($("#"+item.data.id+"")[0]) {/*console.log("Found a dupe: "+item.data.id)*/}
            else {

                $("#feed").append('<div class="post" id="'+item.data.id+'">');
                $("#"+item.data.id+"").append('<div class="headline">');
                $("#"+item.data.id+"").append('<div class="content">');
                $("#"+item.data.id+"").append('<div class="comment"><p>Loading top comment..</p>');
                $("#"+item.data.id+"").append('<div class="viewthread">');
                //$("#"+item.data.id+"").append('<p>Loading top comment..</p>');
  
                getHeadline(item);
                
                var domain = item.data.domain;
                if (domain === "imgur.com" || domain === "i.imgur.com") { 
                    $("#"+item.data.id+" .content").addClass("image");
                    getImgur(item);  
                } else if (item.data.url.split('.').pop() === "jpg" || item.data.url.split('.').pop() === "gif" || item.data.url.split('.').pop() === "png") {
                    // console.log("found a non-imgur image link"); 
                    $("#"+item.data.id+" .content").append('<a href="' + item.data.url + '"><img class="lazy" src="img/grey.gif" data-original="' + item.data.url + '" width="100%"></a>');
                } else if (domain.search('self.') == 0 && item.data.selftext_html != null) {
                    $("#"+item.data.id+" .content").addClass("selfpost");
                    $("#"+item.data.id+" .content").html(item.data.selftext_html);
                    var htmlString = $("#"+item.data.id+" .content").text();
                    $("#"+item.data.id+" .content").html(htmlString);
                }
                  else if (domain === "youtube.com" || domain === "youtu.be") {
                    // console.log(domain+" is a youtube link");
                    // if (item.data.media.oembed.url) {
                        //var youtubeID = item.data.url.split('=').pop();
                        var youtubeID = item.data.url;                        
                        $("#"+item.data.id+" .content").addClass("embed youtube");
                        $("#"+item.data.id+" .content").append('<a href="'+youtubeID+'">'+item.data.title+'</a>');
                        //$("#"+item.data.id+" .content").append('<iframe class="youtube-player" type="text/html" src="http://www.youtube.com/embed/'+youtubeID+'" frameborder="0"></iframe>');
                    // }
                }
                    else if (domain ==="qkme.me") {
                        $("#"+item.data.id+" .content").addClass("embed qkme");
                        $("#"+item.data.id+" .content").append('<a href="'+item.data.url+'">'+item.data.title+'</a>');
                    }
            }        
        });
    
        // old image lazy loader location

        // end image loader
        
        // var myPhotoSwipe = $(".gallery a").photoSwipe({ enableMouseWheel: false , enableKeyboard: false });
        
        
    
        $.each(data.data.children, function(i,item){
            var commentUrl = "http://www.reddit.com/comments/"+item.data.id+".json?jsonp=?";
            // console.log(commentUrl);
        
            $.getJSON(commentUrl, function(data) {
                var comment = data[1].data.children[0].data.body_html;
                var commentScore = data[1].data.children[0].data.ups - data[1].data.children[0].data.downs; 

                $("#"+item.data.id+" .comment").html(comment)
                var htmlStr = $("#"+item.data.id+" .comment").text();
                $("#"+item.data.id+" .comment").html(htmlStr);
                $("#"+item.data.id+" .comment").prepend('<span class="c_score">'+commentScore+' points</span> <span class="author">'+data[1].data.children[0].data.author+'</span>');

                var commentUrl = "http://www.reddit.com/comments/"+item.data.id+".compact";
                //commentUrl = "'"+commentUrl+"'";
                $("#"+item.data.id+" .viewthread").html('<a href="' + commentUrl + '" class="viewthread">View Thread</a>');
                $("#"+item.data.id+" .viewthread").append('<div class="clear">');

            });
        });

        $("img.lazy").lazyload({effect : "fadeIn"});

        $(".content.selfpost, .comment").dotdotdot({
            /*  The HTML to add as ellipsis. */
            ellipsis        : '[...]',

            /*  How to cut off the text/html: 'word'/'letter'/'children' */
            wrap            : 'word',

            /*  jQuery-selector for the element to keep and put after the ellipsis. */
            after           : null,

            /*  Whether to update the ellipsis: true/'window' */
            watch           : 'window',
        
            /*  Optionally set a max-height, if null, the height will be measured. */
            height          : 100,

            /*  Deviation for the height-option. */
            tolerance       : 10,

            /*  Callback function that is fired after the ellipsis is added,
                receives two parameters: isTruncated(boolean), orgContent(string). */
            callback        : function( isTruncated, orgContent ) {},

            lastCharacter   : {

                /*  Remove these characters from the end of the truncated text. */
                remove          : [ ' ', ',', ';', '.', '!', '?' ],

                /*  Don't add an ellipsis if this array contains 
                    the last character of the truncated text. */
                noEllipsis      : []
            }
        });
                        
        nextUrl = "http://www.reddit.com/.json?jsonp=?&count=25&after="+data.data.after+"";
        // console.log('next url is '+nextUrl);
    });
};

var getHeadline = function(item) {
    //console.log("wtf is happening here."+item.data.id)

    var linkurl = item.data.url;
    // linkurl = "'"+linkurl+"'";
    $("#"+item.data.id+" .headline").append('<p><span class="score">'+item.data.score+'</span> <a href="' + item.data.url + '">' + item.data.title + '</a> <span class="domain">('+item.data.domain+')</span></p>');
}

var getImgur = function(item) {
    var postUrl = item.data.url;
    
    if (postUrl.search('/a/') != -1) {
        var postID = item.data.id;
        $("#"+item.data.id+" .content").append('<ul class="gallery">');
        getAlbum(postUrl, postID);
    } else {
        if (postUrl.charAt(postUrl.length-4) != ".") {postUrl = postUrl+".jpg";}
        //console.log(postUrl);
        // postUrl = "'"+postUrl+"'";
        //console.log(postUrl);
        $("#"+item.data.id+" .content").append('<a href="' + postUrl + '"><img class="lazy" src="img/grey.gif" data-original="'+postUrl+'" width="100%"></a>');
    }
}

var getAlbum = function(album, postID) {
    // console.log("Running getAlbum with "+album);
    var albumArray = album.split("/");
    albumUrl = "http://api.imgur.com/2/album/"+albumArray[albumArray.length-1]+".json";
    // console.log("albumUrl is "+albumUrl);
    
    $.getJSON(albumUrl, function(data) {
        // console.log(data.album.images.length);
        
        $.each(data.album.images, function(i, item) {
           // console.log(item.links.small_square);
           $("div#"+postID+" .gallery").append('<li><a href="'+item.links.original+'"><img src="'+item.links.small_square+'" alt="Image '+i+'"></a></li>');
           if ( i > 4) {return false};
        });
    
        $("#"+postID+" .content").append('<div class="clear">');
        
    });

    // var myPhotoSwipe = $(".gallery a").photoSwipe({ enableMouseWheel: false , enableKeyboard: false });        

}
