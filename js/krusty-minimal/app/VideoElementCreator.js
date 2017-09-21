define([
        'libs/jquery.browser.mobile',
        'libs/contextmenu/jquery.contextMenu.min',
        'libs/contextmenu/jquery.ui.position.min',
        'libs/jquery.cookie-1.4.1.min',
        ], function() {
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
      'starttime': 0,
      wasPlaying: false,
      seekTime: -1,
      playMode: null
    };
    var tempVolume = 0;
    var prevItemsTime = 0;
    var subtitlesEnabled = false;
    var subtitleLanguage = "";

    $.extend(settings, options);

    self.create = function() {
      var video = $(document.createElement("video"));
      video.attr('id', 'videoplayer');

      //starttime requested
      if (settings.starttime > 0) {
    	  startAtRequestedVideo();
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
      video.append(source);
      
      if (settings.playMode == "menu") {
    	  createMenu();
      }
      
      var subtitles = getSubtitles();
      if (subtitles != undefined && subtitles.length > 0) {    	  
    	  $("#subtitles").show();

    	  var menuItems  = {};

    	  for (var i = 0; i < subtitles.length; i++) {    		  
    		  var item = {};
    		  
    		  var track = $(document.createElement("track"));
        	  track.attr('src', subtitles[i].subtitle);
              track.attr('kind', 'subtitles');
              
              if (subtitles[i].language != undefined) {
            	  item.name = languageArray[subtitles[i].language];
            	  track.attr('srclang', subtitles[i].language);
            	  track.attr('label', languageArray[subtitles[i].language]);
            	  //check if subtitles is enabled and we are matching
            	  if ($.cookie("subtitles") == "true" &&  $.cookie("language") == subtitles[i].language) {
            		  track.attr('default', 'default');
            		  $("#subtitles > span").addClass("subtitles-enabled");
    	        	  $("#subtitles > span").removeClass("subtitles-crossed-out");
    	        	  item.icon = "fa-check";
    	        	  subtitlesEnabled = true;
    	        	  subtitleLanguage = subtitles[i].language;
            	  }
              } else {
            	  
              }             
              video.append(track);
              menuItems[subtitles[i].language] = item;
    	  }
    	  
    	  var item = {};
    	  item.name = "Disabled";    	  
    	  if ($.cookie("subtitles") != "true") {
    		  item.icon = "fa-check";
    	  }
    	  menuItems.disabled = item;
    	  
    	  if (subtitles.length > 1) {   		      		  
    		  jQuery.contextMenu({    		  
    			  selector: '#subtitles',
	              trigger: 'left',
	              build: function($trigger, e) {
	            	  return {	              
			              callback: function (key, options) {			            	  
			            	  $(video.prop('textTracks')).prop('mode', function(){
			            		  menuItems[this.language].icon = "";
			            		  if (this.language == key) {
			            			  menuItems[this.language].icon = "fa-check";
			            			  menuItems.disabled.icon = "";
			            		  }
			            		  return this.language == key ? 'showing' : 'disabled';	            		  
			            	  });
			    	            
			    	          if (key == "disabled") {
			    	        	  menuItems.disabled	.icon = "fa-check";
			            		  $.cookie("subtitles", 'false');
			            		  subtitlesEnabled = false;
			    	        	  $("#subtitles > span").removeClass("subtitles-enabled");
			    	        	  $("#subtitles > span").addClass("subtitles-crossed-out");
			    	          } else {
			    	        	  subtitlesEnabled = true;
			    	        	  subtitleLanguage = key;
			    	        	  $.cookie("subtitles", 'true');
		            			  $.cookie("language", key);
			    	        	  $("#subtitles > span").addClass("subtitles-enabled");
			    	        	  $("#subtitles > span").removeClass("subtitles-crossed-out");
			    	          }
			              },
			              items: menuItems
	            	  };
	              }
    		  });
    	  }
      } else {
    	  $("#subtitles").hide();
      }

      video.on('ended', function() {
    	  if (settings.playMode == "menu") {
    		  $("#menu").show();
    	  } else {    	  
    		  settings.currentItem = settings.currentItem < settings.videos.length-1 ? settings.currentItem+1 : 0;	
    	  
    		  loadVideo(video);
    	  }
      });
      
      $("#seek-bar").attr("max", settings.videos.duration);
      $("#playtime").text(formatTime(0));
      $("#totaltime").text(formatTime(settings.videos.duration/1000));
      
      video.on('play', function() {
    	  $("#play-pause > span").addClass("fa-pause");
    	  $("#play-pause > span").removeClass("fa-play");
      });
      
      video.on('pause', function() {
    	  $("#play-pause > span").addClass("fa-play");
    	  $("#play-pause > span").removeClass("fa-pause");
      });
      
      video.on('timeupdate', function() {    	  
    	  if (settings.playMode == "menu") {
    		  var correctedTime = (this.currentTime*1000)-settings.videos[settings.currentItem].starttime;
	    	  if (correctedTime < 0) {
	    		  correctedTime = 0;
	    	  }
    		  
    		  $("#playtime").text(formatTime(correctedTime/1000));
	    	  $("#seek-bar").val(correctedTime);    		  
    	  } else {
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
    	  
    	  if (settings.playMode == "menu") {    	  
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
      
      $("#subtitles").click(function(e) {
    	  var subtitles = getSubtitles();
    	  if (subtitles.length  == 1) {
    		  toggleSubtitles();
    	  }    	  
      });
      
      $(window).on('resize', function() {
    	  video.width($("#videoplayer").parent().width());
    	  video.height($("#videoplayer").parent().height());
    	  
    	  $(".playIcon").css('left', (($("#videoplayer").width() / 2) - ($(".playIcon").width() / 2)) +"px");
    	  $(".playIcon").css('top', (($("#videoplayer").height() / 2) - ($(".playIcon").height() / 2)) +"px");
    	  
    	  var w = 325;
    	  var subtitles = getSubtitles();
    	  if (subtitles != undefined && subtitles.length > 0) {
    		  w += 20;
    	  }
    	  if (settings.playMode == "menu") {
    		  w += 20;
    	  }

    	  $("#seek-bar").css('width', ($("#videoplayer").parent().width() - w) +"px");
      });

		$("body").on('click', '.menuitem', function(event) {      	
	      	var playlistItem = event.target.id.substr(event.target.id.indexOf("_")+1);
	  		settings.currentItem = playlistItem;
	  		
	  		var d = settings.videos[playlistItem].duration == -1 ? settings.videos[playlistItem].oduration : settings.videos[playlistItem].duration;
	  		
	  		$("#seek-bar").attr("max", d - settings.videos[playlistItem].starttime);
	        $("#playtime").text(formatTime(0));  		
	  		$("#totaltime").text(formatTime((d-settings.videos[playlistItem].starttime)/1000));
	  		
	  		$("#menu").hide();
	  		
	  		loadVideo(video);
	  		video[0].currentTime = 0;
	  		video[0].play();
	  	});
		
		$("body").on('click', '#menuicon', function() {
			video[0].pause();
			$("#menu").show();
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
    	query = "";
    	
    	if (settings.ticket != null) {
    		query = "?ticket="+settings.ticket;
    	}
    	return query;    	
    };
    
    var getSubtitles = function() {
    	return settings.videos[settings.currentItem].subtitles;
    }
    
    var loadVideo = function(video) {
    	var s = getWantedSource();
    	var codec = getWantedCodec(s.codecs, "video/mp4");

    	//only continue playing when in a playlist
    	if (settings.currentItem == 0) {
    		video.removeAttr('autoplay');
    		prevItemsTime = 0;
    	} else {
    		video.attr('autoplay', 'autoplay');
    		  
    		for (var i = 0; i < settings.currentItem; i++) {
    			prevItemsTime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
    		}
    	}
    	  
    	video.children('source').first().attr('src', codec.src+getQueryString());
    	
    	var subtitles = getSubtitles();
    	if (subtitles != undefined && subtitles.length > 0) {
    		jQuery.contextMenu('destroy');
    		
    		$(video.children('track').remove());
    		
    		$("#subtitles").show();
        	  
        	var menuItems  = {};
        	
        	for (var i = 0; i < subtitles.length; i++) {        		
        		var item = {};
        		  
        		var track = $(document.createElement("track"));
            	track.attr('src', subtitles[i].subtitle);
                track.attr('kind', 'subtitles');
 
                if (subtitles[i].language != undefined) {
                	item.name = languageArray[subtitles[i].language];
                	track.attr('srclang', subtitles[i].language);
                	track.attr('label', languageArray[subtitles[i].language]);
                	
                	//continue with subtitles in same language as previously selected, if available
                	if (subtitlesEnabled && subtitleLanguage == subtitles[i].language) {
                		item.icon = "fa-check";
                		track.attr('default', 'default');
                	}
                } else {
               	  
                }             
                video.append(track);
                menuItems[subtitles[i].language] = item;
        	}
        	  
        	var item = {};
        	item.name = "Disabled";
        	if (!subtitlesEnabled) {
        		item.icon = "fa-check";
        	}
        	menuItems.disabled = item;
        	  
        	if (subtitles.length > 1) {
        		//workaround for firefox
        		if (navigator.userAgent.search("Firefox") > -1) {
	        		$(video.prop('textTracks')).prop('mode', function() {
	        			return this.language == subtitleLanguage ? 'showing' : 'disabled';	 
	        		});
        		}
        		
        		jQuery.contextMenu({    		  
        			selector: '#subtitles',
    	            trigger: 'left',
    	            build: function($trigger, e) {
  	            	  return {	              
  			              callback: function (key, options) {  			            	  
  			            	  $(video.prop('textTracks')).prop('mode', function(){
  			            		  menuItems[this.language].icon = "";
  			            		  if (this.language == key) {
  			            			  menuItems[this.language].icon = "fa-check";
  			            			  menuItems.disabled.icon = "";  			            			  
  			            		  }
  			            		  return this.language == key ? 'showing' : 'disabled';	            		  
  			            	  });
  			    	            
  			    	          if (key == "disabled") {
  			    	        	  menuItems.disabled.icon = "fa-check";
  			    	        	  $.cookie("subtitles", 'false');
  			    	        	  subtitlesEnabled = false;
  			    	        	  $("#subtitles > span").removeClass("subtitles-enabled");
  			    	        	  $("#subtitles > span").addClass("subtitles-crossed-out");
  			    	          } else {
  			    	        	  subtitlesEnabled = true;
  			    	        	  subtitleLanguage = key;
  			    	        	  $.cookie("subtitles", 'true');
		            			  $.cookie("language", key);
  			    	        	  $("#subtitles > span").addClass("subtitles-enabled");
  			    	        	  $("#subtitles > span").removeClass("subtitles-crossed-out");
  			    	          }
  			              },
  			              items: menuItems
  	            	  	};
    	            }
        		});
        	} else if (subtitles.length == 1){
        		//workaround due to firefox
        		if (subtitlesEnabled && navigator.userAgent.search("Firefox") > -1) {
        			$(video.prop('textTracks')).first().prop('mode', 'showing');
        		}
        	}
    	} else {
    		jQuery.contextMenu('destroy');
    		$("#subtitles").hide();
    	}
    	  
    	video.load();
    };

    var initialize = function() {
      settings.currentOrder = settings.order.desktop;
      if ($.browser.mobile) {
        settings.currentOrder = settings.order.mobile;
      }
    };
    
    //create overlay with menu videos
    var createMenu = function() {
    	var menu = $(document.createElement("div"));
        menu.attr('id', 'menu');
        
        for (var i = 0; i < settings.videos.length; i++) {
        	var item = $(document.createElement("div"));
        	item.attr('id', 'videoitem_'+i);
        	item.attr('class', 'menuitem');
        	item.text(settings.videos[i].title);
        	menu.append(item);
        }
        
        $('body').append(menu);
    }
    
    var toggleSubtitles = function() {
    	var video = document.getElementById("videoplayer");

    	if (video.textTracks[0].mode == "showing") {
    		subtitlesEnabled = false;
      	  	$.cookie("subtitles", 'false');
    		video.textTracks[0].mode = "hidden";
    		$("#subtitles > span").removeClass("subtitles-enabled");
    		$("#subtitles > span").addClass("subtitles-crossed-out");
    	} else {
    		subtitlesEnabled = true;
    		$.cookie("subtitles", 'true');
    		video.textTracks[0].mode = "showing";
    		$("#subtitles > span").removeClass("subtitles-crossed-out");
    		$("#subtitles > span").addClass("subtitles-enabled");
    	}
    }
    
    var startAtRequestedVideo = function() {    	
    	var starttime = settings.starttime * 1000;
    	prevItemsTime = 0;
    	
    	for (var i = 0; i < settings.videos.length; i++) {
    		starttime  -= settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
    		
  		  	if (starttime < 0) {
  		  		//this video has to be loaded
  		  		settings.currentItem = i;
  		  		//correct the negative value we got for checking if < 0 for this video by adding back the duration
  		  		starttime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
  		  		//set global seektime for if the new video is loaded  		  		
  		  		settings.seekTime = settings.videos[i].starttime != 0 ? settings.videos[settings.currentItem].starttime + starttime : starttime;
  		  	} else {
  		  		prevItemsTime += settings.videos[i].duration == -1 ? settings.videos[i].oduration : settings.videos[i].duration;
  		  	}
    	}
    }

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

//map xml:lang language value to local language name for most common languages
var languageArray = {'am':	'አማርኛ', 'ar': 'العربية', 'ast': 'asturianu', 'az':	'azərbaycanca', 'bg':	'български', 'br':	'brezhoneg', 'bs':	'bosanski', 'ca':	'català', 'co':	'corsu', 'cs':	'čeština', 'da':	'dansk', 'de':	'Deutsch', 'el':	'Ελληνικά', 'en':	'English', 'eo':	'Esperanto', 'es':	'español', 'et':	'eesti', 'eu':	'euskara', 'fi':	'suomi', 'fr':	'français', 'fy':	'Frysk', 'gl':	'galego', 'gcf': 'Kréyòl gwadloupéyen', 'he': 'עברית', 'hr':	'hrvatski', 'hu':	'magyar', 'id':	'Bahasa Indonesia', 'is':	'íslenska', 'it':	'italiano', 'ja':	'日本語', 'ko':	'한국어', 'lb':	'Lëtzebuergesch', 'lt':	'lietuvių', 'lv':	'latviešu', 'mk':	'македонски', 'nl':	'Nederlands', 'nn':	'norsk nynorsk', 'no':	'norsk bokmål', 'pl':	'polski', 'pt':	'português', 'pt-br':	'português do Brasil', 'ro':	'română', 'ro-md':	'молдовеняскэ', 'ru':	'русский', 'sk':	'slovenčina', 'sl':	'slovenščina', 'sq':	'shqip', 'sv':	'svenska', 'tr':	'Türkçe', 'uk':	'українська', 'vi':	'Tiếng Việt', 'zh-hans': '中文（简体）‎', 'zh-hant': '中文（繁體）‎', 'zh-tw': '中文（台灣）‎'};