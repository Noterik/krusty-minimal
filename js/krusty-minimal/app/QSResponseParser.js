define([], function() {
  var QSResponseParser = function(options) {
    var self = {};
    var settings = {
      data: null,
      sources: null,
      screenshot: null
    };
    $.extend(settings, options);

    function initialize() {
      parseSources();
      parseScreenshot();
    }

    function parseSources() {
      var data = $(settings.data);
       
      //Go through all video's in the videoplaylist in the response, and parse them into PlaylistItem objects.
      var videos = data.find('presentation > videoplaylist').first().find('video');
      
      var videoSources = [];
      
      //for (var counter = 0; counter < videos.length; counter++) {
      
      $.each(videos, function(counter, video){
      var referVid = $(data.find('fsxml > video[fullid|="' + $(video).attr('referid') + '"]'));
      var sources = [];
     
      
      if (referVid.children('rawvideo').length > 0) {
        $.each(referVid.children('rawvideo'), function(key, rawVideo) {
          rawVideo = $(rawVideo);
          //Only use video's that are not the original and which have a wantedheight defined.
          if ((!rawVideo.find('original').text() && rawVideo.find('wantedheight').text()) !== "" || referVid.children('rawvideo').length === 1) {
            var add = false;
            
            //Check if there is already a source defined with the given wantedheight, if there is skip it, otherwise there will be duplicates.
            var source = $.grep(sources, function(source) {
              return source.quality == (rawVideo.find('wantedheight').text());
            });
            if (source === null) {
              add = true;
              source = {};
            }

            //Set the String by which we can retrieve the quality. Add a p behind the height, so that 360 become 360p.
            source.quality = rawVideo.find('height').text() + "p";
            //Set the codecs available for the source.
            if (source.codecs === undefined)
              source.codecs = [];

            var codec = {};

            //Set the video MIME type of the codec.
            switch (rawVideo.find('extension').text()) {
              case 'mp4':
                codec.type = 'video/mp4';
            }
            
            //Get the mount where we can find the video.
            var mount = rawVideo.find('mount').text().split(',')[0];
            codec.src = 'http://streaming11.dans.knaw.nl/rafael/' + referVid.attr('fullid') + '/rawvideo/' + rawVideo.attr('id') + '/'+ rawVideo.find('filename').text();
            var fullId = referVid.attr('fullid');
            
            //Add the codec to the source.
            source.codecs.push(codec);
            sources.push(source);
          }
        });
      }
      //settings.sources = sources;
      videoSources[counter] = sources;
      });
      console.log(videoSources);
    }

    function parseScreenshot() {
      var data = $(settings.data);
      var video = data.find('presentation > videoplaylist').first().find('video').first();
      var referVid = $(data.find('fsxml > video[fullid|="' + video.attr('referid') + '"]'));
      var screenshotElement = referVid.find('screens');
      var uri = screenshotElement.find('properties > uri').text();
      uri = uri.replace(".noterik.com", "streaming11.dans.knaw.nl/stills");
      var screenshotTime = Math.floor(parseInt(referVid.find('rawvideo[id=1] > properties > duration').text()) / 2);
      var hours = Math.floor(screenshotTime / 3600);
      var minutes = Math.floor((screenshotTime % 3600) / 60);
      var seconds = Math.floor((screenshotTime % 3600) % 60);
      settings.screenshot = uri + "/h/" + hours + "/m/" + minutes + "/sec" + seconds + ".jpg";
    }

    self.getSources = function() {
      return settings.sources;
    };

    self.getScreenshot = function() {
      return settings.screenshot;
    };

    initialize();

    return self;
  };

  return QSResponseParser;
});
