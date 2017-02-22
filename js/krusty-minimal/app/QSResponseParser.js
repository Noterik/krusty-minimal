define([
  'config/BaseConfig',
], function(
  BaseConfig
) {
  var QSResponseParser = function(options) {
    var self = {};
    var settings = {
      data: null,
      videos: null,
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
      var playlistVideos = data.find('presentation > videoplaylist').first().find('video');
      var videos = {};
      videos.duration = 0;
      videos.length = playlistVideos.length;

      $.each(playlistVideos, function(k, video) {
	      var referVid = $(data.find('fsxml > video[fullid|="' + $(video).attr('referid') + '"]'));
	      var v = {};
	      
	      //Starttime and duration set are in ms
	      v.starttime = !$(video).find('starttime').text() ? 0.0 : parseFloat($(video).find('starttime').text()); 
	      v.duration = !$(video).find('duration').text() ? -1.0 : parseFloat($(video).find('duration').text()); 
	      v.subtitles = !$(video).find('webvtt').text() ? undefined : BaseConfig.baseURI+'/subtitles'+ referVid.attr('fullid') +"/"+ $(video).find('webvtt').text(); 

	      v.position = k;
	      v.sources = [];
	      
	      var duration = 0;
	      
	      if (referVid.children('rawvideo').length > 0) {
	        $.each(referVid.children('rawvideo'), function(key, rawVideo) {
	          rawVideo = $(rawVideo);

	          //Only use video's that are not the original and which have a wantedheight defined.
	          if ((!rawVideo.find('original').text() && rawVideo.find('wantedheight').text() !== "") || referVid.children('rawvideo').length === 1) {  	  
	        	var add = false;
	            
	            //Check if there is already a source defined with the given wantedheight, if there is skip it, otherwise there will be duplicates.
	            var source = $.grep(v.sources, function(source) {
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
	            codec.src = BaseConfig.baseURI+'/rafael/' + referVid.attr('fullid') + '/rawvideo/' + rawVideo.attr('id') + '/'+ rawVideo.find('filename').text();
	            var fullId = referVid.attr('fullid');
	            
	            //Add the codec to the source.
	            source.codecs.push(codec);
	            v.sources.push(source);
	            
	            //we need the duration to calculate the total duration, duration is in seconds, convert to miliseconds
	            duration = rawVideo.find('duration').text() !== "" ? parseFloat(rawVideo.find('duration').text()) * 1000 : duration;
	            v.oduration = duration;
	          }
	        });
	      }
	      videos[k] = v;
	      videos.duration = v.duration == -1 ? videos.duration + duration : videos.duration + v.duration;
      });
      settings.videos = videos;
    }

    function parseScreenshot() {
      var data = $(settings.data);
      var video = data.find('presentation > videoplaylist').first().find('video').first();
      var starttime = !$(video).find('starttime').text() ? 0 : $(video).find('starttime').text(); 
      var referVid = $(data.find('fsxml > video[fullid|="' + video.attr('referid') + '"]'));
      var screenshotElement = referVid.find('screens');
      var uri = screenshotElement.find('properties > uri').text();
      uri = uri.replace(".noterik.com", BaseConfig.baseURI+"/stills");
      //var screenshotTime = Math.floor(parseInt(referVid.find('rawvideo[id=1] > properties > duration').text()) / 2);
      var screenshotTime =  Math.floor(parseInt(starttime) / 1000) + 10;
      var hours = Math.floor(screenshotTime / 3600);
      var minutes = Math.floor((screenshotTime % 3600) / 60);
      var seconds = Math.floor((screenshotTime % 3600) % 60);
      settings.screenshot = uri + "/h/" + hours + "/m/" + minutes + "/sec" + seconds + ".jpg";
    }

    self.getVideos = function() {
      return settings.videos;
    };

    self.getScreenshot = function() {
      return settings.screenshot;
    };

    initialize();

    return self;
  };

  return QSResponseParser;
});
