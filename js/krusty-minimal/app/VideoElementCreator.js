define([
        'libs/jquery.browser.mobile',
        'config/BaseConfig',
        'app/ChapterElementCreator',
], function(JQueryBrowserMobile, BaseConfig, ChapterElementCreator){
  var VideoElementCreator = function(options) {
    var self = {};
    var settings = {
      'videos': null,
	  'quality': '360p',
      'currentOrder': null,
      'currentItem': 0,
      'order': {
        'mobile': ['360p', '180p', '720p', '1080p'],
        'desktop': ['720p', '1080p', '720p', '1080p']
      },
      'ticket': null,
      wasPlaying: false,
      seekTime: -1,
      startTime: null
    };
    var tempVolume = 0;
    var prevItemsTime = 0;

    $.extend(settings, options);

    self.create = function() {
      var video = $(document.createElement("video"));
      video.attr('id', 'videoplayer');

      //autoplay option from baseconfig
      if (BaseConfig.autoplay) {
		  video.attr('autoplay', 'autoplay');
      }
      
      //check if we have a specific time set to start this video
      if (settings.startTime != null) {
    	 var seektime = settings.startTime;
      
    	  for (var i = 0; i < settings.videos.length; i++) {
    		  seektime  -= settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
    		  if (seektime < 0) {
    			  //ok, we found the correct video, correct seektime for this video
    			  seektime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;

				  settings.currentItem = i;
				  //set global seektime for if the new video is loaded
				  settings.seekTime = settings.videos[i].starttime != 0 ? settings.videos[settings.currentItem].starttime + seektime : seektime;
				 
				  prevItemsTime = 0;
				  
				  for (var i = 0; i < settings.currentItem; i++) {
	    			  prevItemsTime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
	    		  }				  
				  break;
    		  }
    	  }
      }    
      
      var source = getWantedSource(settings);
      var codec = getWantedCodec(source.codecs, "video/mp4");
      if (codec.streamSrc !== undefined) {
        var streamSource = $(document.createElement("source"));
        streamSource.attr('src', codec.streamSrc);
        streamSource.attr('type', codec.type);
        video.append(streamSource);
      }

      source = $(document.createElement("source"));
      source.attr('src', codec.src+getQueryString());
      source.attr('type', codec.type);
      
      video[0].addEventListener('error', function() {
    	 $("body").append("<div class='error'>You don't have valid credentials to play this video.</div>");
      });
      
      video.append(source);
      
      video.on('ended', function() {
    	  settings.currentItem = settings.currentItem < settings.videos.length-1 ? settings.currentItem+1 : 0;	
    	  
    	  loadVideo(video);
      });
      
      $("#seek-bar").attr("max", settings.videos.duration);
      $("#playtime").text(formatTime(0));
      $("#totaltime").text(formatTime(settings.videos.duration/1000));
      
      if (BaseConfig.chapterInfo) {
    	  var creator = ChapterElementCreator({});
    	  element = creator.create();
      }
      
      video.on('play', function() {
    	  $("#play-pause > span").addClass("fa-pause");
    	  $("#play-pause > span").removeClass("fa-play");
      });
      
      video.on('pause', function() {
    	  $("#play-pause > span").addClass("fa-play");
    	  $("#play-pause > span").removeClass("fa-pause");
      });
      
      video.on('timeupdate', function() {    	  
    	  var correctedTime = (this.currentTime*1000)-settings.videos[settings.currentItem].starttime;
    	  if (correctedTime < 0) {
    		  correctedTime = 0;
    	  }
    	  
    	  $("#playtime").text(formatTime((prevItemsTime/1000)+correctedTime/1000));
    	  $("#seek-bar").val(prevItemsTime+correctedTime);
    	  
    	  if (settings.videos[settings.currentItem].duration != -1 && correctedTime >= settings.videos[settings.currentItem].duration) {
    		  settings.currentItem = settings.currentItem < settings.videos.length-1 ? settings.currentItem+1 : 0;	
        	  
    		  loadVideo(video);
    	  }
      });
      
      video[0].addEventListener('volumechange', function() {
    	  if (video[0].muted == true || video[0].volume == 0) {
    		  $("#mute-unmute > span").addClass("fa-volume-off");
    		  $("#mute-unmute > span").removeClass("fa-volume-up");
    		  $("#mute-unmute > span").removeClass("fa-volume-down");
    	  } else {
    		  if (video[0].volume < 0.5) {
    			  $("#mute-unmute > span").addClass("fa-volume-down");
        		  $("#mute-unmute > span").removeClass("fa-volume-off");
        		  $("#mute-unmute > span").removeClass("fa-volume-up");
    		  } else {
    			  $("#mute-unmute > span").addClass("fa-volume-up");
        		  $("#mute-unmute > span").removeClass("fa-volume-off");
        		  $("#mute-unmute > span").removeClass("fa-volume-down");
    		  }
    	  }
      });
      
      video[0].addEventListener('loadedmetadata', function() {
    	  //check if a seek took place or just a new video from the video playlist was loaded
    	  if (settings.seekTime != -1) {
    		  video[0].currentTime = settings.seekTime / 1000;
    		  settings.seekTime = -1;
    	  } else {
	    	  if (settings.videos[settings.currentItem].starttime != 0) {
	    		  video[0].currentTime = settings.videos[settings.currentItem].starttime / 1000;
	    	  } 
    	  }
    	  
    	  //check if video was playing before and not yet playing again, if so play again
    	  if (settings.wasPlaying && video[0].paused) {
    		  video[0].play();
    	  }
    	  //either video now started playing or was already playing if ordered in the loadvideo, so wasPlaying can be set to false
    	  settings.wasPlaying = false;
      });
      
      $("#play-pause").click(function() {
    	 if (video[0].paused == true ) {
    		 video[0].play(); 
    	 } else {
    		 video[0].pause();
    	 }
      });
      
      $("#mute-unmute").click(function() {
    	 if(video[0].muted == true) {
    		 video[0].muted = false;
    		 $("#volume-bar").val(tempVolume);
    	 } else {
    		 video[0].muted = true;
    		 tempVolume = $("#volume-bar").val();
    		 $("#volume-bar").val(0);
    	 }
      });
      
      $("#volume-bar").on("change mousemove", function() {
    	  video[0].volume = $(this).val();
    	  if ($(this).val() > 0 && video[0].muted == true) {
    		  video[0].muted = false;
    	  }
      });
      
      $("#seek-bar").on("change", function() {
    	  var seektime = $(this).val();
    	  var i = 0;
    	  
    	  for (var i = 0; i < settings.videos.length; i++) {
    		  seektime  -= settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
    		  if (seektime < 0) {
    			  //ok, we found the correct video, correct seektime for this video
    			  seektime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
    			  
    			  if (settings.currentItem == i) {
    				  //simple, just do a seek
    				  
    				  //check if we need to correct for the video starttime that is set
    				  if (settings.videos[settings.currentItem].starttime != 0) {
    		    		  video[0].currentTime = (settings.videos[settings.currentItem].starttime / 1000) + (seektime / 1000);
    		    	  } else {
    		    		  video[0].currentTime = seektime / 1000;
    		    	  }
    				  
    				  if (settings.wasPlaying && video[0].paused) {
    		    		  video[0].play();
    		    	  }
       		    	  settings.wasPlaying = false; 				  
    			  } else {
    				  //other video has to be loaded
    				  settings.currentItem = i;
    				  //set global seektime for if the new video is loaded
    				  settings.seekTime = settings.videos[i].starttime != 0 ? settings.videos[settings.currentItem].starttime + seektime : seektime;
    				  loadVideo(video);
    			  }
    			  break;
    		  }
    	  }
      });
      
      $("#seek-bar").on("input", function() {
    	  if (!video[0].paused && !video[0].ended) {
    		  settings.wasPlaying = true;
    		  video[0].pause();
    	  }
    	  
    	  $("#playtime").text(formatTime($(this).val() / 1000));
      });
      
      $("#fullscreen").click(function() {
    	  toggleFullScreen();
      });
      
      $(window).on('resize', function() {
    	  video.width($("#videoplayer").parent().width());
    	  video.height($("#videoplayer").parent().height());
    	  
    	  $(".playIcon").css('left', (($("#videoplayer").width() / 2) - ($(".playIcon").width() / 2)) +"px");
    	  $(".playIcon").css('top', (($("#videoplayer").height() / 2) - ($(".playIcon").height() / 2)) +"px");
    	  
    	  $("#seek-bar").css('width', ($("#videoplayer").parent().width() - 325) +"px");
      });

      return video;
    };

    var getWantedSource = function() {
        currentSource = settings.videos[settings.currentItem].sources[settings.videos[settings.currentItem].sources.length-1];
        
        return currentSource;
    };
    
    var getWantedCodec = function(codecs, wantedCodec) {
      return $.grep(codecs, function(c) {
        if (c.type == wantedCodec) {
          return c;
        }
      })[0];
    };
    
    var getQueryString = function() {
    	query = "?ticket="+settings.ticket;
    	return query;    	
    };
    
    var loadVideo = function(video) {
    	var s = getWantedSource();
    	  var codec = getWantedCodec(s.codecs, "video/mp4");

    	  prevItemsTime = 0;
    	  
    	  //only continue playing when in a playlist
    	  if (settings.currentItem == 0) {
    		  //end of playlist, pause
    		  video.removeAttr('autoplay');
    		  $("#play-pause > span").addClass("fa-play");
    		  $("#play-pause > span").removeClass("fa-pause");
    	  } else {
    		  video.attr('autoplay', 'autoplay');
    		  
    		  for (var i = 0; i < settings.currentItem; i++) {
    			  prevItemsTime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
    		  }
    	  }
    	  
    	  video.children('source').first().attr('src', codec.src+getQueryString());
    	  video.load();
    };

    var initialize = function() {
      settings.currentOrder = settings.order.desktop;
      if ($.browser.mobile) {
        settings.currentOrder = settings.order.mobile;
      }
    };

    initialize();

    return self;
  };

  return VideoElementCreator;
});

function toggleFullScreen() {
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) {
				document.documentElement.msRequestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
				document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
		$("#fullscreen > span").addClass("fa-compress");
  	  	$("#fullscreen > span").removeClass("fa-expand");
	} else {
		if (document.exitFullscreen) {
				document.exitFullscreen();
		} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
		}
		$("#fullscreen > span").addClass("fa-expand");
  	  	$("#fullscreen > span").removeClass("fa-compress");
	}
}

function formatTime(time) {
	var hours, minutes, seconds;
	
	hours = Math.floor(time / 3600);
	minutes = Math.floor((time % 3600) / 60);
	seconds = Math.floor((time % 60));
	
	formattedTime = "";
	if (hours > 0) {
		if (hours < 10) {
			formattedTime += "0";
		}
		formattedTime += hours+":";
	}
	if (minutes < 10) {
		formattedTime += "0";
	}
	formattedTime += minutes+":";
	if (seconds < 10) {
		formattedTime += "0";
	}
	formattedTime += seconds;
	
	return formattedTime;
}
