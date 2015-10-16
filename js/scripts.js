var tableLen = 10;
var tableHeaders =['22-06', '06-14', '14-22'];
var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
var machineCount = 12;
var loadedTiles = {};
var addedTiles = {};
var deletedTiles = {};

// use: when post/get data then ajax gif loader shows
$(document).ajaxStop(function(){
    console.debug("ajaxStop");
    $("#ajax_loader img").hide();
    $("#ajax_loader").fadeOut( 200 );
 });
 $(document).ajaxStart(function(){
     console.debug("ajaxStart");
     $("#ajax_loader img").show();
     $("#ajax_loader").show();
 });

$( document ).ready(function() 
{
	$('.popupDatepicker').datepick({dateFormat: 'yyyy/mm/dd'});


	// Scroll. Fixed vertical and horizontal header
	////////////////////////////////////////////////////////
	var initHeaderOffset = $('.table1-header').offset();
	var initColOffset = $('.left-header').offset();
	
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

			checkBox_html = '<label><input type="checkbox" name="machineCheck" value="'+(i+1)+'">'+(i+1)+'</label>';
	  		left_header_html += '<tr><th class="redips-mark dark">'+checkBox_html+'</th></tr>';
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
		deletedTiles = {};
    	loadedTiles = {};
    	addedTiles = {};
		var startDate = $('[name="start"]').val();
		var endDate = $('[name="end"]').val();
		// if start date is less or equal to end date the draw table
		if (new Date(startDate) <= new Date(endDate)){

	    	drawTable(startDate, endDate);
	    	// replace all '/' in date to '-'. It's for postgres date format
	    	startDate = startDate.replace(/\//g, '-');
			endDate = endDate.replace(/\//g, '-');

	    	$.post( "php/load.php", {startDate: startDate, endDate: endDate})
    		// when post is finished
    		.done(function( data ) {
    			// parse received php data to JSON
    			var jsonData = '';
    			try {
    				jsonData = jQuery.parseJSON(data);
    			}
    			catch (e) {}
    			// if json is parsed
    			if (jsonData != ''){
	    			// iterate over JSON array
	    			jsonData.forEach(function(plan) {
	    				// make id for tile
	    				td_name = plan.p_date+'/'+plan.machine+'/'+plan.e_shift;
	    				// update td witch have attr name with drag tile
	    				$('[name="'+td_name+'"]').html('<div id="'+td_name+'" class="redips-drag blue" product="'+plan.product+'" '+
	    					'style="border-style: solid; cursor: move;">'+plan.product+'</div>')
	    				// add objects to loadedTiles
	    				loadedTiles[td_name] = plan.product;
	    			});
	    			REDIPS.drag.init();
    			}
			});
		}
    });


	$('#gen-prod-bttn').click(function() { 
		var p = $('#product').val();
		var q = $('#quantity').val();
    	drawProductTable(p, q);
    	REDIPS.drag.init();
    });

    $('.left-header').on('change', ':checkbox', function () {
	    if ($(this).is(':checked')) {
	    	$( "#table2 tbody tr:nth-child("+$(this).val()+") td").attr('style',  'background-color:#e3e3e3');
	        console.log($(this).val() + ' is now checked');
	    } else {
	    	$( "#table2 tbody tr:nth-child("+$(this).val()+") td").attr('style',  'background-color:#eee');
	        console.log($(this).val() + ' is now unchecked');
	    }
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
	// boolean if cloned
	redips.is_cloned = 0;
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
		console.log(targetCell.getElementsByTagName('div')[0].getAttribute("product"));
		// previous cell name 
		var prevName = targetCell.getElementsByTagName('div')[0].id;
		var prevProduct = targetCell.getElementsByTagName('div')[0].getAttribute("product");

		targetCell.getElementsByTagName('div')[0].id = targetCell.getAttribute('name'); //getAttribute('name')
		console.log(prevName); //getElementsByTagName('div')[0]
		console.log(targetCell.getElementsByTagName('div')[0]);

		// if dropping in same cell as started to drop
		if (prevName == targetCell.getAttribute('name')){

		}
		// if loaded tile is moved and not cloned
		else if (prevName in loadedTiles && !(prevName in addedTiles) && !redips.is_cloned) {
			console.log('LoadedTile');
			// mark this loded tile pos as deleted becouse it is moved
			deletedTiles[prevName] = prevProduct;
			// new tile added
			addedTiles[targetCell.getAttribute('name')] = prevProduct;
		}
		// if loaded tile is cloned
		else if (prevName in loadedTiles && !(prevName in addedTiles) && redips.is_cloned) {
			addedTiles[targetCell.getAttribute('name')] = prevProduct;
		}
		else {
			// tile move to new cell. Delete previous tile pos if it's in added.
			delete addedTiles[prevName];
			// add tiles to addedTiles
			addedTiles[targetCell.getAttribute('name')] = prevProduct;
			// when add tile then delete it form deleteTiles
			delete deletedTiles[targetCell.getAttribute('name')];
		}
		console.log(redips.is_cloned);
	};
	// deletion event when cell moved to trash
	rd.event.deleted = function (cloned) {
		if (!cloned){
			delete addedTiles[rd.obj.id];
			// if this cell is from database
			if (rd.obj.id in loadedTiles) {
				// add it to array
				deletedTiles[rd.obj.id] = loadedTiles[rd.obj.id];
			}
			console.log(deletedTiles);
		}
	};
	rd.event.clicked = function (currentCell) {
		redips.is_cloned = false;
	};
	rd.event.cloned = function (clonedElement) {
		redips.is_cloned = true;
		console.log('cloned');
	}
};

redips.save = function () {
	// declare local variables
	var	JSONobjNew = addedTiles,	// prepare JSON object
		JSONobjDel = deletedTiles;

	console.log(JSON.stringify(addedTiles));

	$.post( "php/save.php", {upsert: JSON.stringify(JSONobjNew), del: JSON.stringify(JSONobjDel)})
	// when post is finished
	.done(function( data ) {
		console.log('psuccess');
	})
	.fail( function( data ) {
	    console.log('pfail');
	    console.log(data);
	});
};


// add onload event listener
if (window.addEventListener) {
	window.addEventListener('load', redips.init, false);
}
else if (window.attachEvent) {
	window.attachEvent('onload', redips.init);
}
function p(){ console.log(loadedTiles); console.log(addedTiles); console.log(deletedTiles); }