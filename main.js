var yttv = {
    
    interests: [],
    videos: [],
    past: [],
    current: undefined,
    future: [],
    player: undefined,
    ready: false,
    
    controls: {
        bind: function(){
            window.onkeyup = function( event ){
                if ( yttv.display.current == "video" ){
                    if ( event.keyCode == 37 ){
                        yttv.controls.previousVid();
                    }
                    if ( event.keyCode == 39 ){
                        yttv.controls.nextVid();
                    }
                    if ( event.keyCode == 73 ){
                        yttv.display.setTo("interests");
                    }
                    if ( event.keyCode == 32 ){
                        if ( yttv.player.getPlayerState() == 1 ){
                            yttv.controls.pauseVid();
                        } else {
                            yttv.controls.playVid();
                        }
                    }
                }
            };    
        },
        
        nextVid: function( delay ){
            yttv.past.push( yttv.current );
            yttv.current = yttv.future.splice( 0 , 1 )[0];
            
            yttv.controls.setVid( yttv.current );
            
            if ( typeof delay == "undefined" || delay == false ){
                yttv.controls.playVid();
            } else {
                setTimeout( function(){
                    yttv.controls.playVid();
                } , 3500 );   
            }
            
            yttv.checkFuture();
        },
        
        previousVid: function(){
            if ( yttv.past.length > 2 ){
                yttv.future.unshift( yttv.current );
                yttv.current = yttv.past[ yttv.past.length - 1 ];
                yttv.past.splice( yttv.past.length - 1 );
                
                yttv.controls.setVid( yttv.current );
                yttv.controls.playVid();
            }
        },
        
        pauseVid: function(){
            yttv.player.pauseVideo();
            document.getElementById("playButton").innerHTML = "<p style='margin-left: -2px'>^</p>";
            document.getElementById("player").className = "paused";
        },
        
        playVid: function(){
            yttv.player.playVideo();
            document.getElementById("playButton").innerHTML = "<p style='margin-left: 1px'>=</p>";
            document.getElementById("player").className = "playing";
        },
        
        setVid: function( vid ){
            if ( typeof vid != "undefined" ){
                yttv.player.loadVideoById( vid.id );
                var upnext = yttv.future[0].title;
                
                var vidData = "<h1>" + vid.title + "</h1><b><h3>Video URL</h3></b><a href='" + vid.url + "' target='_blank'><h3>" + vid.url + "</h3></a><b><h3>#" + vid.q + "</h3></b><br /><h2>" + vid.caption + "</h2><b><h3>Up Next</h3><p>"+upnext+"</p></b>";
                
                document.getElementById("vidInfo").innerHTML = vidData;
                document.title = vid.title + " | YouTube TV";
            }
        },
    },
    
    checkFuture: function(){
        if ( yttv.future.length < 10 ){
            yttv.updateVids( false );
        }  
    },
    
    display: {
        
        current: "video",
        timer: undefined,
        
        setTo: function( string ){
            yttv.display.current = string;
            document.body.className = string;
            yttv.display.update();
        },
        
        is: function(){
            return yttv.display.current;
        },
        
        setup: function(){
            var pref = document.getElementById("prefButton"),
                inter = document.getElementById("interButton"),
                play = document.getElementById("playButton"),
                next = document.getElementById("nextButton"),
                prev = document.getElementById("previousButton"),
                video = document.getElementById("video");
                
            pref.onmouseup = function(){
                if ( yttv.display.current == "preferences" ){
                    yttv.display.setTo( "video" );
                } else {
                    yttv.display.setTo( "preferences" );
                }
            };
            
            inter.onmouseup = function(){
                if ( yttv.display.current == "interests" ){
                    yttv.display.setTo( "video" );
                    yttv.parseInterests();
                } else {
                    yttv.display.setTo( "interests" );
                }
            };
            
            next.onmouseup = function(){
                yttv.controls.nextVid();
            };
            
            prev.onmouseup = function(){
                yttv.controls.previousVid();
            };
            
            play.onmouseup = function(){
                if ( yttv.player.getPlayerState() == 1 ){
                    yttv.controls.pauseVid();
                } else {
                    yttv.controls.playVid();
                }
            };
            
            video.onmouseup = function(){
                if ( yttv.display.current == "preferences" ){
                    yttv.display.setTo("video");
                }  
            };
            
            window.onmousemove = function(){
                yttv.display.showInterface();
            };
            
            setInterval( function(){
                document.getElementById("vidInfo").style.marginTop = -Math.round( document.getElementById("vidInfo").offsetHeight / 2 ) + "px";
            } , 1000 / 60 );
        },
        
        showInterface: function(){
            var pref = document.getElementById("prefButton"),
                inter = document.getElementById("interButton"),
                play = document.getElementById("playButton"),
                next = document.getElementById("nextButton"),
                prev = document.getElementById("previousButton");
                
            pref.style.opacity = inter.style.opacity = play.style.opacity = next.style.opacity = prev.style.opacity = 1;
            clearTimeout( yttv.display.timer );
            yttv.display.timer = setTimeout( function(){
                yttv.display.hideInterface();
            } , 4000 );
        },
        
        hideInterface: function(){
            var pref = document.getElementById("prefButton"),
                inter = document.getElementById("interButton"),
                play = document.getElementById("playButton"),
                next = document.getElementById("nextButton"),
                prev = document.getElementById("previousButton");
                
            pref.style.opacity = inter.style.opacity = play.style.opacity = next.style.opacity = prev.style.opacity = 0;
        },
        
        update: function(){
            var pref = document.getElementById("prefButton"),
                inter = document.getElementById("interButton");
            
            if ( yttv.display.current == "preferences" ){
                pref.innerHTML = "<p>+</p>";
            } else {
                pref.innerHTML = "<p>?</p>";
            }
            
            if ( yttv.display.current == "interests" ){
                inter.innerHTML = "<p>+</p>";
                document.getElementById("interests").focus();
            } else {
                inter.innerHTML = "<p>i</p>";
            }
        }
    },
    
    init: function(){
        yttv.display.setup();
        yttv.controls.bind();
    },
    
    parseInterests: function(){
        var interestString = document.getElementById("interests").value,
            oldInterests = yttv.interests;
        yttv.interests = interestString.split( ", " , 15 );
        
        if ( oldInterests.toString() != yttv.interests.toString() ){
            console.log( yttv.interests );
            yttv.updateVids();
        }
    },
    
    updateVids: function( wipe ){
        if ( typeof wipe == "undefined" || wipe == true ){
           yttv.future = []; 
        }
        yttv.getVid( yttv.interests );
    },
    
    getVid: function( array ){
        var ids = [], count = 0;
        
        function findId( term ){
            var list = gapi.client.youtube.search.list({
                q: term,
                maxResults: 50,
                type: 'video',
                part: 'snippet'
            });
            
            list.execute( function(response){
                ids = ids.concat( response.items );
                for( var i = 0 , idur = response.items.length ; i < idur ; i++ ){
                    response.items[i].query = term;
                }
                count++;
                if ( count < array.length ){
                   findId( array[count] ); 
                } else {
                    yttv.parseVids( ids );
                }
            });
        }
        
        findId( array[0] );
    },
    
    parseVids: function( raw ){
        yttv.videos = [];
        for( var i = 0 , idur = raw.length ; i < idur ; i++ ){
            var vid = {
                id: raw[i].id.videoId,
                title: raw[i].snippet.title,
                caption: raw[i].snippet.description,
                url: "http://www.youtube.com/watch?v=" + raw[i].id.videoId,
                q: raw[i].query,
            };
            
            yttv.videos.push( vid );
        }
        
        while( yttv.videos.length > 0 ){
            yttv.future = yttv.future.concat( yttv.videos.splice( Math.floor( Math.random() * yttv.videos.length ) , 1 ));
        }
        
        if ( yttv.current == undefined ){
            yttv.controls.nextVid();
        }
        
        var vid = yttv.current;
        var upnext = yttv.future[0].title;
        var vidData = "<h1>" + vid.title + "</h1><b><h3>Video URL</h3></b><a href='" + vid.url + "' target='_blank'><h3>" + vid.url + "</h3></a><b><h3>#" + vid.q + "</h3></b><br /><h2>" + vid.caption + "</h2><b><h3>Up Next</h3><p>"+upnext+"</p></b>";
            
        document.getElementById("vidInfo").innerHTML = vidData;

        
    },
    
    auth: function(){
        var clientId = '304114233340',
            scope = 'https://www.googleapis.com/auth/youtube',
            apiKey = 'AIzaSyDQPUoxp2ErQlEDTQ_MexBIUu9Lk9ympFM';
            
        function load() {
            gapi.client.setApiKey( apiKey );
            gapi.auth.authorize({
                client_id: clientId,
                scope: scope,
                immediate: true
            } , getYt );
        
        }
        
        load();
        
        function getYt(){
            gapi.client.load('youtube', 'v3', yttv.parseInterests );
        }
    },
    
    playerEvents: {
        
        vidReady: function(){
            setInterval( function(){
                document.getElementById("progress").style.width = Math.round(( yttv.player.getCurrentTime() / yttv.player.getDuration()) * window.innerWidth ) + "px";
            } , 1000 / 24 );
            yttv.playerEvents.vidEvent({ data: "start" });
            setInterval( function(){
                if ( typeof document.getElementById("vidInfo").getElementsByTagName("a")[0] != "undefined" ){
                    document.getElementById("vidInfo").getElementsByTagName("a")[0].setAttribute( "href" , yttv.player.getVideoUrl() + "&t=" + Math.round( yttv.player.getCurrentTime()) + "s" );
                }
            } , 1000 );
        },
        
        vidEvent: function( event ){
            
            if ( event.data == 1 ){
                document.getElementById("player").style.opacity = 1;
                document.getElementById("video").style.backgroundColor = "rgba(0,0,0,1)";
                document.getElementById("vidInfo").style.opacity = 0;
            } else {
                if ( event.data == 2 || event.data == 3 || event.data == -1 ){
                    document.getElementById("player").style.opacity = 0.25;
                    document.getElementById("video").style.backgroundColor = "rgba(0,0,0,1)";
                    document.getElementById("vidInfo").style.opacity = 1;
                    document.getElementById("vidInfo").style.pointerEvents = "auto";
                } else {
                    document.getElementById("player").style.opacity = 0;
                    document.getElementById("video").style.backgroundColor = "rgba(0,0,0,0)";
                    document.getElementById("vidInfo").style.opacity = 0;
                    document.getElementById("vidInfo").style.pointerEvents = "none";
                }
                if ( event.data == 0 || event.data == "start" ){
                    yttv.controls.nextVid( true );
                }
            }
        }
    }
};

window.addEventListener( "load" , function(){
   yttv.init();
   setTimeout( function(){
       document.getElementById("introFlag").style.opacity = 0;
       document.getElementById("introFlag").style.bottom = "95px";
   } , 6000 );
});

function loadYt(){
    yttv.auth();
    var tag = document.createElement('script');
        
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    yttv.player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: undefined,
        events: {
            'onReady': yttv.playerEvents.vidReady,
            'onStateChange': yttv.playerEvents.vidEvent,
        },
        playerVars: {
            "showinfo" : 0,
            "controls" : 0,
            "autohide" : 1,
            "modestbranding" : 1,
            "iv_load_policy" : 3,
            "rel" : 0,
        }
    });
}