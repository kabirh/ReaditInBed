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
    // console.log('getFeed running on '+feedurl);
    $.getJSON(feedurl, function(data) {
        // console.log(data);
        if (!data) {alert('Sorry, I ran into an error getting this data.')};
        
        $.each(data.data.children, function(i,item){
            // console.log(item.data.title);
            // console.log(item.data.domain);
            if ($("#"+item.data.id+"")[0]) {/*console.log("Found a dupe: "+item.data.id)*/}
            else {

                $("#feed").append('<div class="post" id="'+item.data.id+'">');
                $("#"+item.data.id+"").append('<div class="headline" id="'+item.data.id+'">');
                $("#"+item.data.id+"").append('<div class="content" id="'+item.data.id+'">');
                $("#"+item.data.id+"").append('<div class="comment" id="'+item.data.id+'">');
                $("#"+item.data.id+"").append('<div class="viewthread" id="'+item.data.id+'">');
                $(".comment#"+item.data.id+"").append('<p>Loading top comment..</p>');    
  
                getHeadline(item);
                
                var domain = item.data.domain;
                if (domain === "imgur.com" || domain === "i.imgur.com") { 
                    $(".content#"+item.data.id+"").addClass("image");
                    getImgur(item);  
                } else if (item.data.url.split('.').pop() === "jpg" || item.data.url.split('.').pop() === "gif" || item.data.url.split('.').pop() === "png") {
                    // console.log("found a non-imgur image link"); 
                    $(".content#"+item.data.id+"").append('<a href="' + item.data.url + '"><img class="lazy" src="img/grey.gif" data-original="' + item.data.url + '" width="100%"></a>');
                } else if (domain.search('self.') == 0 && item.data.selftext_html != null) {
                    $(".content#"+item.data.id+"").addClass("selfpost");
                    $(".content#"+item.data.id+"").html(item.data.selftext_html);
                    var htmlString = $(".content#"+item.data.id+"").text();
                    $(".content#"+item.data.id+"").html(htmlString);
                }
                  else if (domain === "youtube.com" || domain === "youtu.be") {
                    // console.log(domain+" is a youtube link");
                    var youtubeID = item.data.media.oembed.url.split('=').pop();
                    $(".content#"+item.data.id+"").addClass("youtube");
                    $(".content#"+item.data.id+"").append('<iframe class="youtube-player" type="text/html" src="http://www.youtube.com/embed/'+youtubeID+'" frameborder="0"></iframe>');
                }
            }        
        });
    
        // old image lazy loader location

        // end image loader
        
        // var myPhotoSwipe = $(".gallery a").photoSwipe({ enableMouseWheel: false , enableKeyboard: false });
        
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
    
        $.each(data.data.children, function(i,item){
            var commentUrl = "http://www.reddit.com/comments/"+item.data.id+".json?jsonp=?";
            // console.log(commentUrl);
        
            $.getJSON(commentUrl, function(data) {
                var comment = data[1].data.children[0].data.body_html;
                var commentScore = data[1].data.children[0].data.ups - data[1].data.children[0].data.downs; 

                $(".comment#"+item.data.id+"").html(comment)
                var htmlStr = $(".comment#"+item.data.id+"").text();
                $(".comment#"+item.data.id+"").html(htmlStr);
                $(".comment#"+item.data.id+"").prepend('<span class="c_score">'+commentScore+' points</span> <span class="author">'+data[1].data.children[0].data.author+'</span>');

                var commentUrl = "http://www.reddit.com/comments/"+item.data.id+".compact";
                commentUrl = "'"+commentUrl+"'";
                $(".viewthread#"+item.data.id+"").html('<button type="submit" onclick="viewLink('+commentUrl+')" class="viewthread">View Thread</button>');

            });
        });

        $("img.lazy").lazyload({effect : "fadeIn"});
                        
        nextUrl = "http://www.reddit.com/.json?jsonp=?&count=25&after="+data.data.after+"";
        // console.log('next url is '+nextUrl);
    });
};

var getHeadline = function(item) {
    var linkurl = item.data.url;
    linkurl = "'"+linkurl+"'";
    $(".headline#"+item.data.id+"").append('<p><span class="score">'+item.data.score+'</span> <a href="' + linkurl + '">' + item.data.title + '</a> <span class="domain">('+item.data.domain+')</span></p>');
}

var getImgur = function(item) {
    var postUrl = item.data.url;
    
    if (postUrl.search('/a/') != -1) {
        var postID = item.data.id;
        $(".content#"+item.data.id+"").append('<ul class="gallery">');
        getAlbum(postUrl, postID);
    } else {
        if (postUrl.charAt(postUrl.length-4) != ".") {postUrl = postUrl+".jpg";}
        //console.log(postUrl);
        // postUrl = "'"+postUrl+"'";
        //console.log(postUrl);
        $(".content#"+item.data.id+"").append('<a href="' + postUrl + '"><img class="lazy" src="img/grey.gif" data-original="'+postUrl+'" width="100%"></a>');
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
    
        $(".content#"+postID+"").append('<div class="clear">');
        
    });

    // var myPhotoSwipe = $(".gallery a").photoSwipe({ enableMouseWheel: false , enableKeyboard: false });        

}
