define(["libs/jquery.browser.mobile"],function(){var a=function(e){var d={};var f={videos:null,quality:"360p",currentOrder:null,currentItem:0,order:{mobile:["360p","180p","720p","1080p"],desktop:["720p","1080p","720p","1080p"]},ticket:null};$.extend(f,e);d.create=function(){var j=$(document.createElement("video"));j.attr("controls","controls");j.attr("id","videoplayer");var l=g();var k=h(l.codecs,"video/mp4");if(k.streamSrc!==undefined){var i=$(document.createElement("source"));i.attr("src",k.streamSrc);i.attr("type",k.type);j.append(i)}l=$(document.createElement("source"));l.attr("src",k.src+c());l.attr("type",k.type);j.append(l);j.on("ended",function(){f.currentItem=f.currentItem<f.videos.length-1?f.currentItem+1:0;var m=g();var n=h(m.codecs,"video/mp4");if(f.currentItem==0){$(this).removeAttr("autoplay")}else{$(this).attr("autoplay","autoplay")}$(this).children("source").first().attr("src",n.src+c());$(this).load()});return j};var g=function(){currentSource=f.videos[f.currentItem].sources[f.videos[f.currentItem].sources.length-1];return currentSource};var h=function(i,j){return $.grep(i,function(k){if(k.type==j){return k}})[0]};var c=function(){query="?ticket="+f.ticket;if(f.videos[f.currentItem].starttime!=0||f.videos[f.currentItem].duration!=-1){query+="&t=";if(f.videos[f.currentItem].starttime!=0){query+=f.videos[f.currentItem].starttime==0?",":f.videos[f.currentItem].starttime/1000+","}if(f.videos[f.currentItem].duration!=-1){query+=(f.videos[f.currentItem].starttime+f.videos[f.currentItem].duration)/1000}}return query};var b=function(){f.currentOrder=f.order.desktop;if($.browser.mobile){f.currentOrder=f.order.mobile}};b();return d};return a});