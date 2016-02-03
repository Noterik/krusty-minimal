define(['libs/jquery.browser.mobile'], function() {
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
      'ticket': null
    };

    $.extend(settings, options);

    self.create = function() {
      var video = $(document.createElement("video"));
      video.attr('controls', 'controls');
      video.attr('id', 'videoplayer');

      var source = getWantedSource();
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
      video.on('ended', function() {
    	  settings.currentItem = settings.currentItem < settings.videos.length-1 ? settings.currentItem+1 : 0;	
    	  var s = getWantedSource();
    	  var codec = getWantedCodec(s.codecs, "video/mp4");

    	  //only continue playing when in a playlist
    	  if (settings.currentItem == 0) {
    		  $(this).removeAttr('autoplay');
    	  } else {
    		  $(this).attr('autoplay', 'autoplay'); 
    	  }
    	  
    	  $(this).children('source').first().attr('src', codec.src+getQueryString());
    	  $(this).load();    	 
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
    	
    	if (settings.videos[settings.currentItem].starttime != 0 || settings.videos[settings.currentItem].duration != -1) {
    		query += "&t=";
    		if (settings.videos[settings.currentItem].starttime != 0) { 
    			query += settings.videos[settings.currentItem].starttime == 0 ? "," : settings.videos[settings.currentItem].starttime / 1000+",";
    		}
    		if (settings.videos[settings.currentItem].duration != -1) {
    			query += (settings.videos[settings.currentItem].starttime + settings.videos[settings.currentItem].duration) / 1000;
    		}
    	}
    	return query;    	
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
