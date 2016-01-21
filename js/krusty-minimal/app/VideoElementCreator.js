define(['libs/jquery.browser.mobile'], function() {
  var VideoElementCreator = function(options) {
    var self = {};
    var settings = {
      'videos': null,
			'quality': '360p',
      'currentOrder': null,
      'order': {
        'mobile': ['360p', '180p', '720p', '1080p'],
        'desktop': ['720p', '1080p', '720p', '1080p']
      },
    };

    $.extend(settings, options);

    self.create = function() {
      var video = $(document.createElement("video"));
      video.attr('controls', 'controls');

      var source = getWantedSource();
      var codec = getWantedCodec(source.codecs, "video/mp4");
      if (codec.streamSrc !== undefined) {
        var streamSource = $(document.createElement("source"));
        streamSource.attr('src', codec.streamSrc);
        streamSource.attr('type', codec.type);
        video.append(streamSource);
      }

      source = $(document.createElement("source"));
      source.attr('src', codec.src);
      source.attr('type', codec.type);
      video.append(source);

      return video;
    };

    var getWantedSource = function() {
      currentSource = settings.videos[settings.videos.length-1];
     
      return currentSource;
    };

    var getWantedCodec = function(codecs, wantedCodec) {
      return $.grep(codecs, function(c) {
        if (c.type == wantedCodec) {
          return c;
        }
      })[0];
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
