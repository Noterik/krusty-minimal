require([
	'libs/util/Url',
	'app/jquery.krusty-minimal'
], function(
	Url
){
	$(document).ready(function(){
		var vars = Url.getUrlVars();
		$('.presentation').krusty(vars);
	});
});
