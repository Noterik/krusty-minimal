define([], function(){
	function BartResponseParser(options){
		var settings = {
			nic: null,
			response: null,
			uri: null,
		};

		var rParse = function(xml, parent){
			if(parent === null){
				parent = settings.uri;
			}

			xml.children().each(function(key, item){
				if(item.nodeName == 'properties'){
					$(item).children().each(function(pKey, property){
						var propName = property.nodeName;
						settings.nic.put(parent + '/properties/' + propName, $(property).text());
					});
				}else{
					var nodeName = item.nodeName;
					var id = $(item).attr('id');
					if(id === undefined)
						id = "";

					settings.nic.put(parent + '/' + nodeName, null);
					settings.nic.put(parent + '/' + nodeName + '/' + id, null);

					rParse($(item), parent + '/' + nodeName + '/' + id);
				}
			});
		};

		$.extend(settings, options);

		return {
			parse: function(){
				if(!(settings.response instanceof jQuery)){
					settings.response = $(settings.response);
				}
				var fsxml = settings.response.find('fsxml');
				if(fsxml !== null){
					rParse(settings.response.find('fsxml'), null);
				}else{
					throw "Response does not contain fsxml.";
				}
			}
		};

	}

	return BartResponseParser;
});
