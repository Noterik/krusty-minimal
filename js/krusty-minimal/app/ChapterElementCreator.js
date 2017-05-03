define([
        'libs/jquery.browser.mobile',
        'config/BaseConfig',
], function(JQueryBrowserMobile, BaseConfig){
  var ChapterElementCreator = function(options) {
    var self = {};
    var settings = {
      chapters: null,
      currentChapter: 0
    };

    $.extend(settings, options);

    self.create = function() {    	    	
    	var chapterinfo = $(document.createElement("div"));
    	chapterinfo.attr('id', 'chapterinfo');
    	
    	var currentChapterHeader = $(document.createElement("div"));
    	currentChapterHeader.attr('class', 'currentchapter');   
    	currentChapterHeader.attr('id', 'currentchapter_heading');
    	currentChapterHeader.text("Huidig hoofdstuk");
    	
    	var currentChapterHeaderPlus = $(document.createElement("span"));
    	currentChapterHeaderPlus.attr('class', 'fa-stack');
    	currentChapterHeaderPlus.attr('id', 'currrentchapter_heading_plus');
    	
    	var currentChapterHeaderPlusBackground = $(document.createElement("i"));
    	currentChapterHeaderPlusBackground.attr('class', 'fa fa-circle fa-stack-2x');
    	currentChapterHeaderPlusBackground.attr('id', 'plusbackground');
    	currentChapterHeaderPlus.append(currentChapterHeaderPlusBackground);
    	
    	var currentChapterHeaderPlusSign = $(document.createElement("span"));
    	currentChapterHeaderPlusSign.attr('class', 'fa-stack-1x plussign');
    	currentChapterHeaderPlusSign.text("+");
    	currentChapterHeaderPlus.append(currentChapterHeaderPlusSign);
    	
    	currentChapterHeader.append(currentChapterHeaderPlus);
    	chapterinfo.append(currentChapterHeader);
    	
    	var currentChapterText = $(document.createElement("div"));
    	currentChapterText.attr('class', 'currentchapter');   
    	currentChapterText.attr('id', 'currentchapter_text');
    	currentChapterText.text('Hoofdstukinformatie wordt geladen');
    	chapterinfo.append(currentChapterText);
    	
    	chapterinfo.click(function() {    		
    		$("#chapterinfo").hide();
    		$("#videoplayer")[0].pause();
    		
    		var allChapters = $(document.createElement("div"));
    		allChapters.attr('id', 'allchapters');
    		allChapters.attr('class', 'chapters_font');
    		
    		var allChaptersHeader = $(document.createElement("div"));
    		allChaptersHeader.attr('class', 'currentchapter allchaptersheaderbackground');   
    		allChaptersHeader.attr('id', 'currentchapter_heading');
    		allChaptersHeader.text("Alle hoofdstukken");
    		
    		var allChaptersHeaderClose = $(document.createElement("span"));
    		allChaptersHeaderClose.attr('class', 'fa-stack');
    		allChaptersHeaderClose.attr('id', 'currrentchapter_heading_plus');
        	
        	var allChaptersHeaderCloseBackground = $(document.createElement("i"));
        	allChaptersHeaderCloseBackground.attr('class', 'fa fa-circle fa-stack-2x');
        	allChaptersHeaderCloseBackground.attr('id', 'plusbackground');
        	allChaptersHeaderClose.append(allChaptersHeaderCloseBackground);
        	
        	var allChaptersHeaderCloseSign = $(document.createElement("span"));
        	allChaptersHeaderCloseSign.attr('class', 'fa-stack-1x closesign');
        	allChaptersHeaderCloseSign.text("x");
        	allChaptersHeaderClose.append(allChaptersHeaderCloseSign);
        	
        	allChaptersHeaderClose.click(function() {
        		$("#allchapters").remove();        		
        		$("#chapterinfo").show();
        		$("#videoplayer")[0].play();
        	});
        	
        	allChaptersHeader.append(allChaptersHeaderClose);
        	allChapters.append(allChaptersHeader);        	
        	
        	var allChaptersBody = $(document.createElement("div"));
        	allChaptersBody.attr('id', 'allchaptersbody');
        	
        	var allChaptersTable = $(document.createElement("table"));
        	allChaptersTable.attr('id', 'allchapterstable');
        	
        	//add all chapters
        	for (var i = 0; i < settings.chapters.length; i++) {

        		var row = "<tr id='chapter_"+i+"'";
        		
        		//highlight current chapter
        		if (settings.currentChapter == i) {
        			row += " class='allchapters_currentchapter'";
        		}
        		
        		row += "><td class='chapternumber'>"+(parseInt(i)+1)+".</td>";
        		row += "<td class='chaptertitle' data-chapterid='"+i+"'>"+decode(settings.chapters[i].title)+"</td>";
        		row += "<td class='readmore' data-chapterid='"+i+"'>Lees meer</td></tr>";
         		allChaptersTable.append(row);
        	}

        	allChaptersBody.append(allChaptersTable);
        	allChapters.append(allChaptersBody);        	
        	
    		$(".videoplayer").first().append(allChapters);    
    		
    		//seek on clicking on a title
    		$(".chaptertitle").click(function() {
            	var position  = $(this).data("chapterid");
            	
            	$("#allchapters").remove();
            	$("#chapterinfo").show();
            	
            	$("#seek-bar").val(settings.chapters[position].starttime).change();
            	$("#videoplayer")[0].play();
            });
    		
    		//show all text after clicking lees meer
    		$(".readmore").click(function() {
    			$("#allchapterstable").hide();
    			
    			var position  = $(this).data("chapterid");
    			
    			var extendedChapterInfo = $(document.createElement("div"));    			
    			extendedChapterInfo.attr('id', 'extendchapterinfo');
    			
    			var chapterTitle = $(document.createElement("div"));
    			chapterTitle.attr('id', 'chaptertitle');   
    			chapterTitle.text(decode(settings.chapters[position].title));
    			
    			var returnButton = $(document.createElement("button"));
    			returnButton.attr("id", "returnbutton");
    			returnButton.text("Terug naar overzicht");
    			chapterTitle.append(returnButton);
    			
    			returnButton.click(function() {
        			$("#extendchapterinfo").remove();
        			
        			$("#allchapterstable").show();
        		});
    			
    			extendedChapterInfo.append(chapterTitle);

    			var chapterBody = $(document.createElement("div"));
    			chapterBody.attr('id', 'chapterbody');
    			chapterBody.html(decode(settings.chapters[position].description));
    			extendedChapterInfo.append(chapterBody);
    			
    			$("#allchaptersbody").append(extendedChapterInfo);
    		});
    		
    		
    	});
    	
    	return chapterinfo;
    };
    
    self.timeupdate = function(currenttime) {
    	var seektime = currenttime;
    	var found = false;
    	
    	for (var i = 0; i < settings.chapters.length; i++) {
    		seektime  -= settings.chapters[i].duration;
    		if (seektime < 0 && !found) {
    			$("#currentchapter_text").text(decode(settings.chapters[i].title));
    			$("#chapter_"+i).addClass("allchapters_currentchapter");
    			settings.currentChapter = i;
    			found = true;
    		} else {
    			$("#chapter_"+i).removeClass("allchapters_currentchapter");
    		}
    	}
    };
    
    return self;
  };
  
  return ChapterElementCreator;
});

function decode(input) {
	if (input.indexOf("\\")!=-1) {
		var pos = input.indexOf("\\");
		var output = "";
		while (pos!=-1) {
			// is it dec or hex encoding ?
			if (input.charAt(pos+2)=="x") {
				output+=input.substr(0,pos);
				var code=int(input.substr(pos+1,6));
				output+=String.fromCharCode(code);
				input = input.substring(pos+7);
			} else {
				output+=input.substr(0,pos);
				code =parseInt(input.substr(pos+1,3));
				if (code == 13) {
					output+="<br/>";
				} else {
					output+=String.fromCharCode(code);
				}
				input = input.substring(pos+4);
			}
			pos = input.indexOf("\\");
		}
		output+=input;
		return output;
	} else {
		return input;
	}
}