define([
	'libs/springfield/BartConnector',
], function(
	BartConnector
){
	/**
	 * Can request the quickstart XML from a given uri. When it is requested calls the success callback with the xml as an argument.
	 *
	 * @namespace Springfield.Bart
	 * @class QuickstartConnector
	 * @param {Object} options Overwrites the properties set in settings.
	 * @uses Springfield.Bart.BartConnector
	 * @constructor
	 */
	function QuickstartConnector(options){
		/**
		 * The settings of QuickstartConnector.
		 *
		 * @property settings
		 * @type Object
		 * @private
		 */
		var settings = {
			/**
			 * The callback which will be called when the request succeeds.
			 *
			 * @property settings.success
			 * @type function
			 * @private
			 * @default null
			 */
			'success': null,
			/**
			 * The uri of the presentation.
			 *
			 * @property settings.uri
			 * @type String
			 * @private
			 * @default null
			 * @example
			 * 	/domain/springfieldwebtv/user/david/collection/3/presentation/43
			 */
			'uri': null
		}

		var bc = BartConnector(), requestOptions = {
			'url': null,
			'type': 'POST',
			'accepts' : 'text/xml',
			'contentType' : 'text/xml',
			'data' : "<fsxml mimetype='application/fscommand' id='dynamic'><properties><handler>/dynamic/presentation/playout/html5</handler></properties></fsxml>"
		}

		/**
		 * Validates the options.
		 *
		 * @method validate
		 * @return Boolean
		 * @private
		 */
		var validate = function(){
			if(settings.uri === null){
				throw "No URI given!";
			}
			return true;
		};

		/**
		 * Requests from the given uri, and triggers success callback on success.
		 *
		 * @method request
		 * @return void
		 * @private
		 */
		var request = function(){
			if(typeof settings.success == "function")
				requestOptions.success = settings.success;

			bc.request(requestOptions);
		};

		$.extend(settings, options);
		requestOptions.url = settings.uri;
		validate();
		request();
	}

	return QuickstartConnector;
});
