$( document ).ready(function() 
{
	$('.popupDatepicker').datepick({dateFormat: 'yyyy/mm/dd'});


	// Scroll. Fixed vertical and horizontal header
	////////////////////////////////////////////////////////
	var initHeaderOffset = $('.table1-header').offset();
	var initColOffset = $('.left-header').offset();

	console.log(initHeaderOffset);
	setTimeout(function(){ //
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
	        //console.log("I scrolled vertically.");
	    }
	    if(prevLeft != currentLeft) { // horizontall scroll
	        prevLeft = currentLeft;
	        var prevOffset =$('.left-header').offset();
	        console.log(prevOffset);
	        $('.left-header').offset({top: prevOffset.top, left: initColOffset.left});
	        //console.log("I scrolled horizontally.");
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

  	var getDates = function(startDate, endDate) {
	  	var dates = [],
	      	currentDate = startDate,
	      	addDays = function(days) {
	        	var date = new Date(this.valueOf());
	        	date.setDate(date.getDate() + days);
	        	return date;
	      	};

	 	while (currentDate <= endDate) {
	    	dates.push(currentDate);
	    	currentDate = addDays.call(currentDate, 1);
	  	}
		return dates;
	};


  var tableLen = 10;
  var tableHeaders =['22-06', '06-14', '14-22'];
  var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
  var machineCount = 25;

	function drawTable(startDate, endDate)
	{
		var dates = getDates(new Date(startDate), new Date(endDate));
		var header_time_html = '';
		var header_day_html = '';

		dates.forEach(function(d) {	// timeline header
			for (var i = 0; i < tableHeaders.length; i++) {
				header_time_html += '<td class="redips-mark dark">'+tableHeaders[i]+'</td>';
			};
			var dateStr = d.getDate()  + "." + monthNamesShort[d.getMonth()] + "  " + d.getFullYear();
			header_day_html += '<td class="redips-mark dark" colspan="3">'+dateStr+'</td>';
		});
		$('.table1-header .header-time').html('<td class="redips-mark blank"></td>'+header_time_html);
		$('.table1-header .header-day').html('<td class="redips-mark blank"></td>'+header_day_html);


		var left_header_html = '';
		var table2_html = '';

		for (var i = 0; i < machineCount; i++) {	// table cells
	  		left_header_html += '<tr><th class="redips-mark dark">'+(i+1)+'</th></tr>';

	  		table2_html += '<tr>';
	  		var l = dates.length*3;

	  		for (var j = 0; j < l; j++) {
	    		table2_html += '<td></td>';
	  		};
	  		table2_html += '</tr>';
		};
		$('.left-header').html(left_header_html);
		$('#table2 tbody').html(table2_html);
	}

	$('#gen-table-bttn').click(function() { 
		var startDate = $('[name="start"]').val();
		var endDate = $('[name="end"]').val();
    	drawTable(startDate, endDate);
    });
	

	// Usage
	var dates = getDates(new Date("2015/02/25"), new Date("2015/3/2"));                                                                                                           
	dates.forEach(function(d) {
	  //console.log(d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear());
	});

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