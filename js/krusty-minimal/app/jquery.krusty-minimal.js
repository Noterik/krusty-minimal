requirejs.config({
	baseUrl: 'js/krusty-minimal'
});

define([
	'libs/springfield/QuickStartConnector',
	'app/QSResponseParser',
	'app/VideoElementCreator',
	'app/AudioElementCreator'
], function(
	QuickstartConnector,
	QSResponseParser,
	VideoElementCreator,
	AudioElementCreator
){
	(function( $ ) {
		var element = null;
		var bgImage = null;
		var playIcon = null;

		jQuery.fn.krusty = function(method) {
			if ( methods[method] ) {
				console.log(methods);
				return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
			} else if ( typeof method === 'object' || ! method ) {
  		    	return methods.init.apply( this, arguments );
			} else {
  				$.error( 'Method ' +  method + ' does not exist on jQuery.krustyMinimal' );
			}
		};

		function listenToEvents(context, element){
			element.on('loadstart', function(){
				$(context).trigger('loadstart');
			});

			element.on('playing', function(){
				$(context).trigger('playing');
			});

			element.on('pause', function(){
				$(context).trigger('pause');
			});
		}

		var methods = {
			init: function(options){
				var self = this;
				var qc = QuickstartConnector({
					'uri': options.uri,					
					'success': function(data){
						var parser = QSResponseParser({data:data, ticket:options.ticket});
						var videos = parser.getVideos();
						var audios = parser.getAudios();
						var screenshot = parser.getScreenshot();
						
						if (options.ticket != null) {
							screenshot = screenshot+"?ticket="+options.ticket;
						}
						
						var creator;
						if (audios.length > 0) {
							creator = AudioElementCreator({'audios': audios, 'quality': options.quality, 'ticket': options.ticket});
						} else {
							creator = VideoElementCreator({'videos': videos, 'quality': options.quality, 'ticket': options.ticket});
						}
						element = creator.create();
						listenToEvents(self, element);
						element.width($(self)[0].clientWidth);
						element.height($(self)[0].clientHeight);
						bgImage = $(document.createElement("img"));
						if (audios.length > 0) {
							bgImage.attr('src', 'img/audio.png');
						} else {
							bgImage.attr('src', screenshot);
						}
						bgImage.attr('class', 'bgImage');
						bgImage.attr('width', $(self)[0].clientWidth);
						bgImage.attr('height', $(self)[0].clientHeight);
						playIcon = $(document.createElement("div"));
						playIcon.attr('class', 'playIcon');						
						playIcon.on('click', function(){
							element[0].play();
						});
						element.on('play', function(){
							playIcon.hide();
							if (audios.length == 0) {
								bgImage.hide();
							}
						});
						$(self).append(element);
						$(self).append(bgImage);
						$(self).append(playIcon);
						playIcon.css('left', ((element.width() / 2) - (playIcon.width() / 2)) + "px");
						playIcon.css('top', ((element.height() / 2) - (playIcon.height() / 2)) + "px");
						
						$("#seek-bar").css('width', ($("#videoplayer").width() - 345) +"px");
					}
				});
			},
			resize: function(){
				element.width($(self)[0].clientWidth);
				element.height($(self)[0].clientHeight);
				bgImage.attr('width', element[0].clientWidth);
				bgImage.attr('height', element[0].clientHeight);
				playIcon.css('left', ((element.width() / 2) - (playIcon.width() / 2)) + "px");
				playIcon.css('top', ((element.height() / 2) - (playIcon.height() / 2)) + "px");
			}
		};
		jQuery.holdReady(false);
	})(jQuery);
});
