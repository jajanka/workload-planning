var tableLen = 10;
var tableHeaders =['22-06', '06-14', '14-22'];
var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
var machineCount = 12;
var board = [];

$( document ).ready(function() 
{
	$('.popupDatepicker').datepick({dateFormat: 'yyyy/mm/dd'});


	// Scroll. Fixed vertical and horizontal header
	////////////////////////////////////////////////////////
	var initHeaderOffset = $('.table1-header').offset();
	var initColOffset = $('.left-header').offset();

	/*console.log(initHeaderOffset);
	setTimeout(function(){ //
		initHeaderOffset = $('.table1-header').offset();
		console.log(initHeaderOffset); 
	}, 500);

	console.log(initColOffset);
	setTimeout(function(){ 
		initColOffset = $('.left-header').offset();
		console.log(initColOffset); 
	}, 500);*/


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
	        $('.left-header').offset({top: prevOffset.top, left: initColOffset.left});
	        //console.log("I scrolled horizontally.");
	    }
	});

	//////////////////////////////////////////////////////

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

	function drawTable(startDate, endDate)
	{
		var dates = getDates(new Date(startDate), new Date(endDate));
		var header_time_html = '';
		var header_day_html = '';

		dates.forEach(function(d) // timeline header
		{	
			for (var i = 0; i < tableHeaders.length; i++) { // time
				header_time_html += '<td class="redips-mark dark">'+tableHeaders[i]+'</td>';
			};
			var dateStr = d.getDate()  + "." + monthNamesShort[d.getMonth()] + "  " + d.getFullYear();
			header_day_html += '<td class="redips-mark dark" colspan="3">'+dateStr+'</td>'; //date
		});
		$('.table1-header .header-time').html('<td class="redips-mark blank"></td>'+header_time_html);
		$('.table1-header .header-day').html('<td class="redips-mark blank"></td>'+header_day_html);


		board = [];
		var left_header_html = ''; //left statuc column header
		var table2_html = '';	// table cells

		// generate table cells
		for (var i = 0; i < machineCount; i++) {	
			// length for employee change times. There are 3 in 1 day
			var cellLen = dates.length*3;
			// push in board array of length of
			board.push( Array.apply(null, Array(cellLen)).map(function () {}) );

	  		left_header_html += '<tr><th class="redips-mark dark">'+(i+1)+'</th></tr>';
	  		table2_html += '<tr>';
	  		// counts to 3
	  		var data_counter = 0;
	  		for (var j = 0; j < cellLen; j++) {
	  			// if mod 3 is 0 then gets next date index
	  			data_counter = (j > 0 && j % 3 == 0)? ++data_counter : data_counter;
	  			// iterate through dates
	  			var cur_date = dates[data_counter];
	  			// make td name with date from array
	  			var cur_date_formated = cur_date.getFullYear()+'-'+(cur_date.getMonth()+1)+'-'+cur_date.getDate()+'/'+i+'/'+j%3;
	  			//console.log(cur_date_formated);
	    		table2_html += '<td name="'+cur_date_formated+'"></td>';
	  			// table2_html += '<td name="'+cur_date_formated+'"><div id="'+j+'" class="redips-drag blue" product="FTG123">'+j+'</div></td>';
	  		};
	  		table2_html += '</tr>';
		};
		$('.left-header').html(left_header_html);
		$('#table2 tbody').html(table2_html);
	}

	drawTable("2015/10/29", "2015/11/2");

	$('#gen-table-bttn').click(function() { 
		var startDate = $('[name="start"]').val();
		var endDate = $('[name="end"]').val();
    	drawTable(startDate, endDate);
    });


	$('#gen-prod-bttn').click(function() { 
		var p = $('#product').val();
		var q = $('#quantity').val();
    	drawProductTable(p, q);
    	REDIPS.drag.init();
    });

});

function drawProductTable(productName, productCount)
{
	var table_products_html = '',	// table cells
		table_products_col = '',	// table col width
		current_product = 0;
	// generate table cells, iterate columns
	for (var i = 0; i < productCount/12; i++) {	
		// row start tag
		table_products_html += '<tr>';
		// generate one row all cells
		for (var j = 0; j < 12; j++) {
			// generate column width
			if (i == 0) {table_products_col += '<col width="70"/>'}
			// if not all products is in temp table
			if (current_product < productCount){
				// td cell with product
				table_products_html += '<td><div id="x" class="redips-drag blue" product="'+productName+'">'+productName+'</div></td>';
			}else{
				// divide row in cells
  				table_products_html += '<td></td>';
			}
  			// increase current product by 1
  			current_product++;
  		}
  		// row end tag
		table_products_html += '</tr>';

	};
	$('#table-products tbody').html(table_products_html);
	$('#table-products colgroup').html(table_products_col);
}

function save(type) {
	// define table_content variable
	var table_content;
	// prepare table content of first table in JSON format or as plain query string (depends on value of "type" variable)
	table_content = REDIPS.drag.saveContent('table2', 'json');
	console.log(table_content);
}

/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false, REDIPS: true */

/* enable strict mode */
"use strict";

// define redipsInit variable
var redips = {};

// redips initialization
redips.init = function () {
	// reference to the REDIPS.drag lib
	var rd = REDIPS.drag;
	// create XMLHttp request object
	redips.request = redips.initXMLHttpClient();
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
		//targetCell.getElementsByTagName('div')[0].setAttribute("product", "FTG201");
		targetCell.getElementsByTagName('div')[0].id = targetCell.getAttribute('name'); //getAttribute('name')
		console.log(targetCell.getElementsByTagName('div')[0]); //getElementsByTagName('div')[0]
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
	// event handler invoked after DIV element is cloned - called from REDIPS.drag.move_object()
};

/**
 * Function moves element to the random position. Generated position must be different then current position.
 */
redips.move = function () {
	var id = 'x',	// id of drag element
		rowIndex,	// row index (random number from 0 to 6)
		cellIndex,	// cell index (random number from 0 to 6)
		pos;		// current position as array (returned from get_position method)
	// set current position for DIV element with defined id
	pos = REDIPS.drag.getPosition(id);
	// generate random position (must be different then current position)
	/*do {
		rowIndex = Math.floor(Math.random() * 7);	// from 0 to 6
		cellIndex = Math.floor(Math.random() * 7);	// from 0 to 6
	} while (pos[1] === rowIndex && pos[2] === cellIndex);*/
	// disable "Move" button
	//redips.buttonEnable(false);
	// move object to the random position
	REDIPS.drag.moveObject({
		id: id,								// id of object to move
		clone: false,				// clone option (if set to true then DIV element will be cloned)
		overwrite: true,		// overwrite target cell (if set to true, then content in target cell will be overwritten)
		target: [3, 1, 1],	// target position
		//callback: redips.buttonEnable		// function to call after animation is over
		//callback: redips.move				// try to comment upper line and uncomment this line (refresh page and click on "Move" button)
	});
};


// XMLHttp request object
redips.initXMLHttpClient = function () {
	var XMLHTTP_IDS,
		xmlhttp,
		success = false,
		i;
	// Mozilla/Chrome/Safari/IE7/IE8 (normal browsers)
	try {
		xmlhttp = new XMLHttpRequest(); 
	}
	// IE (?!)
	catch (e1) {
		XMLHTTP_IDS = [ 'MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0',
						'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP' ];
		for (i = 0; i < XMLHTTP_IDS.length && !success; i++) {
			try {
				success = true;
				xmlhttp = new ActiveXObject(XMLHTTP_IDS[i]);
			}
			catch (e2) {}
		}
		if (!success) {
			throw new Error('Unable to create XMLHttpRequest!');
		}
	}
	return xmlhttp;
};

redips.save = function () {
	// declare local variables
	var frm,			// form reference inside component (it should be only one form)
		JSONobj = [["2015-10-29/7/1","FUX666",7,1],["2015-10-30/9/1","FUX666",9,4]],	// prepare JSON object
		json,			// json converted to the string
		component,		// component object
		div,			// current DIV element
		pos,			// component position
		i;				// loop variable

	// prepare query string in JSON format (only if array isn't empty)
	if (JSONobj.length > 0) {
		json = JSON.stringify(JSONobj);
	}
	// open asynchronus request (POST method)
	redips.request.open('POST', 'php/save.php', true);
	// set content type for POST method
	redips.request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	// the onreadystatechange event is triggered every time the readyState changes
	redips.request.onreadystatechange = function () {
		//  request finished and response is ready (set innerHTML of dropped DIV element
		if (redips.request.readyState === 4) {
			if (redips.request.status === 200) {
				message.innerHTML = redips.request.responseText;
				console.log(redips.request.responseText);
			}
			// if request status isn't OK
			else {
				message.innerHTML = 'Error: [' + redips.request.status + '] ' + redips.request.statusText;
			}
	    }
	};
	redips.request.send('json=' + json); // send POST request
};


// add onload event listener
if (window.addEventListener) {
	window.addEventListener('load', redips.init, false);
}
else if (window.attachEvent) {
	window.attachEvent('onload', redips.init);
}