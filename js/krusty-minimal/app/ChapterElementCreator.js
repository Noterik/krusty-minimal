define([
        'libs/jquery.browser.mobile',
        'config/BaseConfig',
], function(JQueryBrowserMobile, BaseConfig){
  var ChapterElementCreator = function(options) {
    var self = {};
    var settings = {
      
    };

    $.extend(settings, options);

    self.create = function() {
    	console.log("creating chapter stuff");
    };
    return self;
  };
  
  return ChapterElementCreator;
});