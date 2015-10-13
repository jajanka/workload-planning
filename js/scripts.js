$( document ).ready(function() 
{
	// Scroll. Fixed vertical and horizontal header
	////////////////////////////////////////////////////////
	var initHeaderOffset = $('.table1-header').offset();
	var initColOffset = $('.left-header').offset();

	console.log(initHeaderOffset);
	setTimeout(function(){ 
		initHeaderOffset = $('.table1-header').offset();
		console.log(initHeaderOffset); 
	}, 500);

	console.log(initColOffset);
	setTimeout(function(){ 
		initColOffset = $('.left-header').offset();
		console.log(initColOffset); 
	}, 500);


	//initHeaderOffset.top += 10;
	//console.log(initHeaderOffset);
	
	var prevTop = 0;
	var prevLeft = 0;
	$("#right").scroll(function() {
	    var currentTop = $("#right").scrollTop();
	    var currentLeft = $("#right").scrollLeft();

	    if(prevTop != currentTop) {	// vertical scroll
	        prevTop = currentTop;
	        var prevOffset =$('.table1-header').offset();
	        $('.table1-header').offset({top: initHeaderOffset.top, left: prevOffset.left});
	        console.log("I scrolled vertically.");
	    }
	    if(prevLeft != currentLeft) { // horizontall scroll
	        prevLeft = currentLeft;
	        var prevOffset =$('.left-header').offset();
	        console.log(prevOffset);
	        $('.left-header').offset({top: prevOffset.top, left: initColOffset.left});
	        console.log("I scrolled horizontally.");
	    }
	});

	//////////////////////////////////////////////////////
	

  function repeat(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
  }

  var tableLen = 30;
  var tableHeaders =['22-06', '06-14', '14-22'];
  var curHeader = 0;
  var machineCount = 20;
  var totalDays = 1;

  for (var i = 0; i < tableLen; i++) { // time headers
    $('.table1-header .header-time').append('<td class="redips-mark dark">'+tableHeaders[curHeader]+'</td>');
    $('#table2 colgroup').append('<col width="70"/>');
    if (curHeader == 0){
    	$('.table1-header .header-day').append('<td class="redips-mark dark" colspan="3">'+totalDays+'.okt</td>');
    }
    curHeader++;
    if (curHeader > 2){
    	curHeader = 0;
    	totalDays++;
    }
  };

  for (var i = 0; i < machineCount; i++) {
  	$('.left-header').append('<tr><th class="redips-mark dark">'+(i+1)+'</th></tr>');
  	if (i==3)
  		$('#table2 tbody').append('<tr><td><div id="x" class="redips-drag blue">FTG201A</div></td>'+repeat('<td></td>',tableLen-1)+'</tr>');
  		//$('#table2 tbody').append('<tr><td><div id="x" class="redips-drag blue">C</div></td>'+repeat('<td><div id="x" class="redips-drag blue">C</div></td>',tableLen-1)+'<tr>');
  	else
  		//$('#table2 tbody').append('<tr><td><div id="x" class="redips-drag blue">C</div></td>'+repeat('<td><div id="x" class="redips-drag blue">C</div></td>',tableLen-1)+'<tr>');
    	$('#table2 tbody').append('<tr>'+repeat('<td></td>',tableLen)+'</tr>');

  };

});


/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false, REDIPS: true */

/* enable strict mode */
"use strict";

// define redipsInit variable
var redipsInit;

// redips initialization
redipsInit = function () {
	// reference to the REDIPS.drag lib
	var rd = REDIPS.drag;
	// initialization
	rd.init();
	// dragged elements can be placed to the empty cells only
	rd.dropMode = 'single';
	// elements could be cloned with pressed SHIFT key
	rd.clone.keyDiv = true;
	// define dropped handler
	rd.event.dropped = function (targetCell) {
		var tbl,	// table reference of dropped element
			id,		// id of scrollable container
			msg;	// message
		// find table of target cell
		tbl = rd.findParent('TABLE', targetCell);
		// test if table belongs to scrollable container
		if (tbl.sca !== undefined) {
			// every table has defined scrollable container (if table belongs to scrollable container)
			// scrollable container has reference to the DIV container and DIV container has Id :)
			id = tbl.sca.div.id;
			// prepare message according to container Id
			// here can be called handler_dropped for scrollable containers
			switch (id) {
			case 'left':
				msg = 'Left container';
				break;
			case 'right':
				msg = 'Right container';
				break;
			default:
				msg = 'Container without Id';
			}
		}
		// table does not belong to any container
		else {
			msg = 'Table does not belong to any container!';
		}
		// display message
		document.getElementById('message').innerHTML = msg;
	};
};


// add onload event listener
if (window.addEventListener) {
	window.addEventListener('load', redipsInit, false);
}
else if (window.attachEvent) {
	window.attachEvent('onload', redipsInit);
}