define([],function(){var a=function(f){var e={};var g={data:null,sources:null,screenshot:null};$.extend(g,f);function c(){d();b()}function d(){var k=$(g.data);var j=k.find("presentation > videoplaylist").first().find("video").first();var i=$(k.find('fsxml > video[fullid|="'+j.attr("referid")+'"]'));var h=[];if(i.children("rawvideo").length>0){$.each(i.children("rawvideo"),function(n,o){o=$(o);if((!o.find("original").text()&&o.find("wantedheight").text())!==""||i.children("rawvideo").length===1){var r=false;var q=$.grep(h,function(s){return s.quality==(o.find("wantedheight").text())});if(q===null){r=true;q={}}q.quality=o.find("height").text()+"p";if(q.codecs===undefined){q.codecs=[]}var p={};switch(o.find("extension").text()){case"mp4":p.type="video/mp4"}var l=o.find("mount").text().split(",")[0];p.src="http://streaming11.dans.knaw.nl/rafael/"+i.attr("fullid")+"/rawvideo/"+o.attr("id")+"/"+o.find("filename").text();var m=i.attr("fullid");q.codecs.push(p);h.push(q)}})}g.sources=h}function b(){var k=$(g.data);var h=k.find("presentation > videoplaylist").first().find("video").first();var o=$(k.find('fsxml > video[fullid|="'+h.attr("referid")+'"]'));var p=o.find("screens");var i=p.find("properties > uri").text();i=i.replace(".noterik.com","streaming11.dans.knaw.nl/stills");var l=Math.floor(parseInt(o.find("rawvideo[id=1] > properties > duration").text())/2);var m=Math.floor(l/3600);var j=Math.floor((l%3600)/60);var n=Math.floor((l%3600)%60);g.screenshot=i+"/h/"+m+"/m/"+j+"/sec"+n+".jpg"}e.getSources=function(){return g.sources};e.getScreenshot=function(){return g.screenshot};c();return e};return a});