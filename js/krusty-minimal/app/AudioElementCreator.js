define(['libs/jquery.browser.mobile'], function() {
  var AudioElementCreator = function(options) {
    var self = {};
    var settings = {
      'audios': null,
      'currentItem': 0,
      'ticket': null,
      wasPlaying: false,
      seekTime: -1,
      playMode: null
    };
    var tempVolume = 0;
    var prevItemsTime = 0;

    $.extend(settings, options);

    self.create = function() {
      var audio = $(document.createElement("audio"));
      audio.attr('id', 'videoplayer');

      var source = getWantedSource(settings);
      var codec = getWantedCodec(source.codecs, "audio/mp4");
      if (codec.streamSrc !== undefined) {
        var streamSource = $(document.createElement("source"));
        streamSource.attr('src', codec.streamSrc);
        streamSource.attr('type', codec.type);
        audio.append(streamSource);
      }

      source = $(document.createElement("source"));
      source.attr('src', codec.src+getQueryString());
      source.attr('type', codec.type);
      audio.append(source);
      
      if (settings.playMode == "menu") {
    	  createMenu();
      }
      
      var subtitles = getSubtitles();
      if (subtitles !== undefined) {
    	  $("#subtitles").show();
    	  
    	  var track = $(document.createElement("track"));
    	  track.attr('src', subtitles);
          track.attr('kind', 'subtitles');
          audio.append(track);
      } else {
    	  $("#subtitles").hide();
      }
      
      $("#fullscreen").hide();

      audio.on('ended', function() {
    	  if (settings.playMode == "menu") {
    		  $("#menu").show();
    	  } else {
    		  settings.currentItem = settings.currentItem < settings.audios.length-1 ? settings.currentItem+1 : 0;	
    	  	    	  
    		  loadAudio(audio);
    	  }
      });
      
      $("#seek-bar").attr("max", settings.audios.duration);
      $("#playtime").text(formatTime(0));
      $("#totaltime").text(formatTime(settings.audios.duration/1000));
      
      audio.on('play', function() {
    	  $("#play-pause > span").addClass("fa-pause");
    	  $("#play-pause > span").removeClass("fa-play");
      });
      
      audio.on('pause', function() {
    	  $("#play-pause > span").addClass("fa-play");
    	  $("#play-pause > span").removeClass("fa-pause");
      });
      
      audio.on('timeupdate', function() {    	  
    	  if (settings.playMode == "menu") {
    		  var correctedTime = (this.currentTime*1000)-settings.audios[settings.currentItem].starttime;
	    	  if (correctedTime < 0) {
	    		  correctedTime = 0;
	    	  }
	    	  
	    	  $("#playtime").text(formatTime(correctedTime/1000));
	    	  $("#seek-bar").val(correctedTime);
    	  } else {    	  
	    	  var correctedTime = (this.currentTime*1000)-settings.audios[settings.currentItem].starttime;
	    	  if (correctedTime < 0) {
	    		  correctedTime = 0;
	    	  }
	    	  
	    	  $("#playtime").text(formatTime((prevItemsTime/1000)+correctedTime/1000));
	    	  $("#seek-bar").val(prevItemsTime+correctedTime);
	    	  
	    	  if (settings.audios[settings.currentItem].duration != -1 && correctedTime >= settings.audios[settings.currentItem].duration) {
	    		  settings.currentItem = settings.currentItem < settings.audios.length-1 ? settings.currentItem+1 : 0;	
	        	  
	    		  loadAudio(audio);
	    	  }
    	  }
      });
      
      audio[0].addEventListener('volumechange', function() {
    	  if (audio[0].muted == true || audio[0].volume == 0) {
    		  $("#mute-unmute > span").addClass("fa-volume-off");
    		  $("#mute-unmute > span").removeClass("fa-volume-up");
    		  $("#mute-unmute > span").removeClass("fa-volume-down");
    	  } else {
    		  if (audio[0].volume < 0.5) {
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
      
      audio[0].addEventListener('loadedmetadata', function() {
    	  //check if a seek took place or just a new audio from the audio playlist was loaded
    	  if (settings.seekTime != -1) {
    		  audio[0].currentTime = settings.seekTime / 1000;
    		  settings.seekTime = -1;
    	  } else {
	    	  if (settings.audios[settings.currentItem].starttime != 0) {
	    		  audio[0].currentTime = settings.audios[settings.currentItem].starttime / 1000;
	    	  } 
    	  }
    	  
    	  //check if audio was playing before and not yet playing again, if so play again
    	  if (settings.wasPlaying && audio[0].paused) {
    		  audio[0].play();
    	  }
    	  //either audio now started playing or was already playing if ordered in the loadaudio, so wasPlaying can be set to false
    	  settings.wasPlaying = false;
      });
      
      $("#play-pause").click(function() {
    	 if (audio[0].paused == true ) {
    		 audio[0].play(); 
    	 } else {
    		 audio[0].pause();
    	 }
      });
      
      $("#mute-unmute").click(function() {
    	 if(audio[0].muted == true) {
    		 audio[0].muted = false;
    		 $("#volume-bar").val(tempVolume);
    	 } else {
    		 audio[0].muted = true;
    		 tempVolume = $("#volume-bar").val();
    		 $("#volume-bar").val(0);
    	 }
      });
      
      $("#volume-bar").on("change mousemove", function() {
    	  audio[0].volume = $(this).val();
    	  if ($(this).val() > 0 && audio[0].muted == true) {
    		  audio[0].muted = false;
    	  }
      });
      
      $("#seek-bar").on("change", function() {
    	  var seektime = $(this).val();
    	  
    	  if (settings.playMode == "menu") {  
    		  //check if we need to correct for the audio starttime that is set
			  if (settings.audios[settings.currentItem].starttime != 0) {
	    		  audio[0].currentTime = (settings.audios[settings.currentItem].starttime / 1000) + (seektime / 1000);
	    	  } else {
	    		  audio[0].currentTime = seektime / 1000;
	    	  }
			  
			  if (settings.wasPlaying && audio[0].paused) {
	    		  audio[0].play();
	    	  }
			  settings.wasPlaying = false; 
    	  } else {    	  
	    	  var i = 0;
	    	  
	    	  for (var i = 0; i < settings.audios.length; i++) {
	    		  seektime  -= settings.audios[i].duration == -1 ? settings.audios[i].oduration : settings.audios[i].duration;
	    		  if (seektime < 0) {
	    			  //ok, we found the correct audio, correct seektime for this audio
	    			  seektime += settings.audios[i].duration == -1 ? settings.audios[i].oduration : settings.audios[i].duration;
	    			  
	    			  if (settings.currentItem == i) {
	    				  //simple, just do a seek
	    				  
	    				  //check if we need to correct for the audio starttime that is set
	    				  if (settings.audios[settings.currentItem].starttime != 0) {
	    		    		  audio[0].currentTime = (settings.audios[settings.currentItem].starttime / 1000) + (seektime / 1000);
	    		    	  } else {
	    		    		  audio[0].currentTime = seektime / 1000;
	    		    	  }
	    				  
	    				  if (settings.wasPlaying && audio[0].paused) {
	    		    		  audio[0].play();
	    		    	  }
	       		    	  settings.wasPlaying = false; 				  
	    			  } else {
	    				  //other audio has to be loaded
	    				  settings.currentItem = i;
	    				  //set global seektime for if the new audio is loaded
	    				  settings.seekTime = settings.audios[i].starttime != 0 ? settings.audios[settings.currentItem].starttime + seektime : seektime;
	    				  loadAudio(audio);
	    			  }
	    			  break;
	    		  }
	    	  }
    	  }
      });
      
      $("#seek-bar").on("input", function() {
    	  if (!audio[0].paused && !audio[0].ended) {
    		  settings.wasPlaying = true;
    		  audio[0].pause();
    	  }
    	  
    	  $("#playtime").text(formatTime($(this).val() / 1000));
      });
      
      $("#fullscreen").click(function() {
    	  toggleFullScreen();
      });
      
      $("#subtitles").click(function() {
    	 toggleSubtitles(); 
      });
      
      $(window).on('resize', function() {
    	  audio.width($("#videoplayer").parent().width());
    	  audio.height($("#videoplayer").parent().height());
    	  
    	  $(".playIcon").css('left', (($("#videoplayer").width() / 2) - ($(".playIcon").width() / 2)) +"px");
    	  $(".playIcon").css('top', (($("#videoplayer").height() / 2) - ($(".playIcon").height() / 2)) +"px");
    	  
    	  var w = 325;
    	  var subtitles = getSubtitles();
    	  if (subtitles != undefined) {
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
	  		
	  		var d = settings.audios[playlistItem].duration == -1 ? settings.audios[playlistItem].oduration : settings.videos[playlistItem].duration;
	  		
	  		$("#seek-bar").attr("max", d - settings.audios[playlistItem].starttime);
	        $("#playtime").text(formatTime(0));  		
	  		$("#totaltime").text(formatTime((d-settings.audios[playlistItem].starttime)/1000));
	  		
	  		$("#menu").hide();
	  		
	  		loadAudio(audio);
	  		audio[0].currentTime = 0;
	  		audio[0].play();
	  	});
		
		$("body").on('click', '#menuicon', function() {
			audio[0].pause();
			$("#menu").show();
		});

      return audio;
    };

    var getWantedSource = function() {
        currentSource = settings.audios[settings.currentItem].sources[settings.audios[settings.currentItem].sources.length-1];
        
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
    	return settings.audios[settings.currentItem].subtitles;
    }
    
    var loadAudio = function(audio) {
    	var s = getWantedSource();
    	  var codec = getWantedCodec(s.codecs, "audio/mp4");

    	  //only continue playing when in a playlist
    	  if (settings.currentItem == 0) {
    		  audio.removeAttr('autoplay');
    		  prevItemsTime = 0;
    	  } else {
    		  audio.attr('autoplay', 'autoplay');
    		  
    		  for (var i = 0; i < settings.currentItem; i++) {
    			  prevItemsTime += settings.audios[i].duration == -1 ? settings.audios[i].oduration : settings.audios[i].duration;
    		  }
    	  }
    	  
    	  audio.children('source').first().attr('src', codec.src+getQueryString());
    	  
    	  var subtitles = getSubtitles();
    	  if (subtitles != undefined) {
    		  $("#subtitles").show();
    		  
    		  audio.children('track').first().attr('src', subtitles);
    	  } else {
    		  $("#subtitles").hide();
    	  }
    	  
    	  audio.load();
    };
    
  //create overlay with menu audios
    var createMenu = function() {
    	var menu = $(document.createElement("div"));
        menu.attr('id', 'menu');
        
        for (var i = 0; i < settings.audios.length; i++) {
        	var item = $(document.createElement("div"));
        	item.attr('id', 'audioitem_'+i);
        	item.attr('class', 'menuitem');
        	item.text(settings.audios[i].title);
        	menu.append(item);
        }
        
        $('body').append(menu);
    }

    return self;
  };

  return AudioElementCreator;
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

function toggleSubtitles(audio) {
	var audio = document.getElementById("videoplayer");

	if (audio.textTracks[0].mode == "showing") {
		audio.textTracks[0].mode = "hidden";
		$("#subtitles > span").removeClass("subtitles-enabled");
	} else {
		audio.textTracks[0].mode = "showing";
		$("#subtitles > span").addClass("subtitles-enabled");
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
