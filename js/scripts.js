var tableLen = 10;
var tableHeaders =['22-06', '06-14', '14-22'];
var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
var machineCount = 12;
var loadedTiles = {};
var addedTiles = {};
var deletedTiles = {};
var markedMachines = {};
var lastFilledProducts = [];
var markedShift = 1;

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
	// Button-checkbox
	/////////////////////////////////////

	function initBttnCheckbox() {

		$('.button-checkbox-time').each(function () {

	        // Settings
	        var $widget = $(this),
	            $button = $widget.find('button'),
	            $checkbox = $widget.find('input:checkbox'),
	            color = $button.data('color'),
	            settings = { on: {icon: 'glyphicon glyphicon-check' },
	                off: { icon: 'glyphicon glyphicon-unchecked' }
	            };

	        // Event Handlers
	        $button.on('click', function () {
	            $checkbox.prop('checked', !$checkbox.is(':checked'));
	            $checkbox.triggerHandler('change');
	            updateDisplay(true);
	        });
	        $checkbox.on('change', function () {
	            //updateDisplay();
	        });
	        // Actions
	        function updateDisplay(clicked) {
	            var isChecked = $checkbox.is(':checked');
	            // Set the button's state
	            $button.data('state', (isChecked) ? "on" : "off");

	            // Set the button's icon
	            $button.find('.state-icon').removeClass().addClass('state-icon ' + settings[$button.data('state')].icon);

	            // Update the button's color
	            if (isChecked) {
	                $button.removeClass('btn-default').addClass('btn-' + color + ' active');
	                // get index of pressed bttn-chkbox cell
	                markedShift = $widget.parent().index();
			        // on click disable all remaining bttn-chkbox. allows only one active bttn-chkbox
			        console.log(markedShift);
			        if ( $button.hasClass('active') ) {
			        	// iterate over bttn-chkbox time
			        	$('.button-checkbox-time').each(function () {
					        // Settings
					        var $widget2 = $(this),
						        $button2 = $widget2.find('button');
						    // if button in not active then disable it
					        if ( !($button2.hasClass('active')) ) {
					        	$button2.addClass('disabled');
				        	}
				        });
			        }
	            }
	            else {
	                $button.removeClass('btn-' + color + ' active').addClass('btn-default');
	                if (clicked == true) {
	                	markedShift = 1;
				        $('.button-checkbox-time').each(function () {
				        	var $widget2 = $(this),
						        $button2 = $widget2.find('button');
				        	$button2.removeClass('disabled');
				        });
		           	}
		        }
	        }
	        // $( "#table2 tbody tr:nth-child(2) td:nth-child(456)").index()
	        // Initialization
	        function init() {

	            updateDisplay();

	            // Inject the icon if applicable
	            if ($button.find('.state-icon').length == 0) {
	                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
	            }
	        }
	        init();
	    });
	

		$('.button-checkbox').each(function () {

	        // Settings
	        var $widget = $(this),
	            $button = $widget.find('button'),
	            $checkbox = $widget.find('input:checkbox'),
	            color = $button.data('color'),
	            settings = { on: {icon: 'glyphicon glyphicon-check' },
	                off: { icon: 'glyphicon glyphicon-unchecked' }
	            };

	        // Event Handlers
	        $button.on('click', function () {
	            $checkbox.prop('checked', !$checkbox.is(':checked'));
	            $checkbox.triggerHandler('change');
	            updateDisplay2(true);
	        });
	        $checkbox.on('change', function () {
	            updateDisplay2();
	        });

	        // Actions
	        function updateDisplay2(clicked) {
	            var isChecked = $checkbox.is(':checked');

	            // Set the button's state
	            $button.data('state', (isChecked) ? "on" : "off");

	            // Set the button's icon
	            $button.find('.state-icon').removeClass().addClass('state-icon ' + settings[$button.data('state')].icon);

	            // Update the button's color
	            if (isChecked) {
	                $button.removeClass('btn-default').addClass('btn-' + color + ' active');

	                // get toggled bttn-checkbox number. It's machine number
	                var toggledChkBox = $button.context.getElementsByTagName('button')[0].childNodes[2].textContent;
	                // color row with this number
	                $( "#table2 tbody tr:nth-child("+toggledChkBox+") td").attr('style',  'background-color:#e3e3e3');
	                markedMachines[toggledChkBox] = true;
	                console.log(markedMachines);
	            }
	            else {
	                $button.removeClass('btn-' + color + ' active').addClass('btn-default');

	                if (clicked == true) {
		               // get toggled bttn-checkbox number. It's machine number
		               var toggledChkBox = $button.context.getElementsByTagName('button')[0].childNodes[2].textContent;
		               // color row with this number
		            	$( "#table2 tbody tr:nth-child("+toggledChkBox+") td").attr('style',  'background-color:#eeeeee');
		            	delete markedMachines[toggledChkBox];
		                console.log(markedMachines);  
		            }
	            }
	        }
	        // $( "#table2 tbody tr:nth-child(2) td:nth-child(456)").index()
	        // Initialization
	        function init2() {

	            updateDisplay2();

	            // Inject the icon if applicable
	            if ($button.find('.state-icon').length == 0) {
	                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
	            }
	        }
	        init2();
	    });
	}

	// End button-checkbox
	/////////////////////////////////////////////////////////
	
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

	// add leading zero function
	function pad(n){return n<10 ? '0'+n : n}

	function drawTable(startDate, endDate)
	{
		var dates = getDates(new Date(startDate), new Date(endDate));
		var header_time_html = '';
		var header_day_html = '';

		dates.forEach(function(d) // timeline header
		{	
			for (var i = 0; i < tableHeaders.length; i++) { // time
			checkBox_html = '<span class="button-checkbox-time">'+
		        '<button style="width:100%;" type="button" class="btn btn-xs" data-color="success">'+tableHeaders[i]+'</button>'+
		        '<input type="checkbox" class="hidden" unchecked />'+
		    	'</span>';
				header_time_html += '<td class="redips-mark dark">'+checkBox_html+'</td>';
			};
			var dateStr = d.getDate()  + "." + monthNamesShort[d.getMonth()] + "  " + d.getFullYear();
			header_day_html += '<td class="redips-mark dark" colspan="3">'+dateStr+' '+d.getDay()+'</td>'; //date
		});
		$('.table1-header .header-time').html('<td class="redips-mark blank"></td>'+header_time_html);
		$('.table1-header .header-day').html('<td class="redips-mark blank"></td>'+header_day_html);


		board = [];
		var left_header_html = ''; //left static column header
		var table2_html = '';	// table cells

		// generate table cells
		for (var i = 0; i < machineCount; i++) {	
			// length for employee change times. There are 3 in 1 day
			var cellLen = dates.length*3;
			// push in board array of length of
			board.push( Array.apply(null, Array(cellLen)).map(function () {}) );

			checkBox_html = '<span class="button-checkbox">'+
				        '<button style="width:100%;" type="button" class="btn btn-xs" data-color="success">'+(i+1)+'</button>'+
				        '<input type="checkbox" class="hidden" unchecked />'+
				    	'</span>';
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
	  			var cur_date_formated = cur_date.getFullYear()+'-'+pad((cur_date.getMonth()+1))+'-'+pad(cur_date.getDate())+'/'+i+'/'+j%3;
	  			//console.log(cur_date_formated);
	    		table2_html += '<td name="'+cur_date_formated+'"></td>';
	  			// table2_html += '<td name="'+cur_date_formated+'"><div id="'+j+'" class="redips-drag blue" product="FTG123">'+j+'</div></td>';
	  		};
	  		table2_html += '</tr>';
		};
		$('.left-header').html(left_header_html);
		$('#table2 tbody').html(table2_html);
		// update bttn-checkboxes
		initBttnCheckbox();
	}

	drawTable("2015/10/29", "2015/11/2");

	/* ################################################
	###################### EVENTS #######################
	*/

	$('#gen-table-bttn').click(function() { 
		markedMachines = {};
		markedShift = 1;
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
    	//drawProductTable(p, q);
    	lastFilledProducts = fillProducts(p, markedShift, q);
    	REDIPS.drag.init();
    	console.log(lastFilledProducts);
    });

    $('#undo-gen-prod-bttn').click(function() { 
    	console.log('asd');
    	for (var i = 0; i < lastFilledProducts.length; i++) {
    		$('[name="'+lastFilledProducts[i]+'"]').html('');
    	};
    });

	//// Rectangle draw, marking products
	///////////////////////// 
	var mouseStillDown = false;
	var start_x = 0, start_y = 0;

	function drawRect(e) {
		// if draw cube right down
		if (e.pageY - start_y >= 0 && e.pageX - start_x >= 0) {
    		$(".rect").css({position:"absolute", width: e.pageX-start_x, height: e.pageY-start_y, left:start_x, top:start_y});
    	}
    	// draw cube left up
    	else if (e.pageY - start_y < 0 && e.pageX - start_x < 0) {
    		$(".rect").css({position:"absolute", width: start_x-e.pageX, height: start_y-e.pageY, left:e.pageX, top:e.pageY});
    	}
    	// draw cube left down
    	else if (e.pageX - start_x < 0) {
    		$(".rect").css({position:"absolute", width: start_x-e.pageX, height: e.pageY-start_y, left:e.pageX});
    	}
    	// draw right up
    	else if (e.pageY - start_y < 0) {
    		$(".rect").css({position:"absolute", width: e.pageX-start_x, height: start_y-e.pageY, top:e.pageY});
    	}
    	console.log($(".rect").offset());
	}

	$("#table2").mousemove(function(e) { // move rect on mousemove over table2
	    if (mouseStillDown) {
	    	drawRect(e);
	    }
	});
	$(".rect").mousemove(function(e) {  // move rect when mouse is over shown rect
	    if (mouseStillDown){
	    	drawRect(e);
	    }
	});

	$("#table2").mousedown(function(e) {
	    mouseStillDown = true;
	    start_x = e.pageX, start_y = e.pageY;
	    $(".rect").css({position:"absolute", left:e.pageX, top:e.pageY, width:1, height: 1})
	});
	$(".rect").mousedown(function(e) {
	    mouseStillDown = true;
	    start_x = e.pageX, start_y = e.pageY;
	    $(".rect").css({position:"absolute", left:e.pageX, top:e.pageY, width:1, height: 1})
	});

	$("body").mouseup(function(e) {
	    mouseStillDown = false;
	});

	/* ####################### END OF EVENTS #############################
		#################################################################
	*/ 
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

function fillProducts(product, start, count) {
	// row column length
	var column_count = document.getElementById('table2').rows[0].cells.length;
	var count_check = 0, 
		is_valid = false;
		filledProd = [];
	for (var i = start; i <= column_count; i++) {
		for (var key in markedMachines) {
		    if (markedMachines.hasOwnProperty(key)) {
				var td_html = $( "#table2 tbody tr:nth-child("+key+") td:nth-child("+i+")");
				if (td_html[0].innerHTML.trim().length == 0) {
					count_check++;
				}
			if (count_check >= count) { is_valid = true; break; }
		    }
		}
		if (count_check >= count) { is_valid = true; break; }
	}
	console.log(is_valid);

	// if products can be filled in table
	if (is_valid) {
		// iterate over columns
		for (var i = start; i < column_count; i++) {
			// for each marked machine in left header column
			for (var key in markedMachines) {
				// js lagging fix
			    if (markedMachines.hasOwnProperty(key)) {
			    	// get cell
					var td_html = $( "#table2 tbody tr:nth-child("+key+") td:nth-child("+i+")");
					// if inner html in cell is empty
					if (td_html[0].innerHTML.trim().length == 0) {
						// put a product in cell
						td_html.html('<div id="'+td_html.attr("name")+'" class="redips-drag blue" product="'+product+'">'+product+'</div');
						addedTiles[td_html.attr("name")] = product;
						// add to last filled products
						filledProd.push(td_html.attr("name"));
						count--;
					}
			    }
			    if (0 >= count) { break; } // if all products placed
			}
			if (0 >= count) { break; }
		};
	}
	return filledProd;
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