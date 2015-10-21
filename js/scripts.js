var tableLen = 10;
var tableHeaders =['22-06', '06-14', '14-22'];
var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
var machineCount = 21;

var loadedTiles = {}; // loaded products from DB
var addedTiles = {}; // new placed products in table
var deletedTiles = {}; // deleted products from table that were load from DB

var markedMachines = {}; // marked machines where to place products
var markedShift = 1; // marked employee shift

var lastFilledProducts = []; // used to undo last placed products

var newMarkedCells = {}; // all td or cells marked
var oldMarkedCells = {}; // one event previous: all td or cells marked

var markedProducts = {};

var Move = {};

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
	// Init tooltip
	$('[data-toggle="tooltip"]').tooltip(); 

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
	  		};
	  		table2_html += '</tr>';
		};
		$('.left-header').html(left_header_html);
		$('#table2 tbody').html(table2_html);
		// update bttn-checkboxes
		initBttnCheckbox();
	}

	function loadTable(startD, endD) {
		$.post( "php/load.php", {startDate: startD, endDate: endD})
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
    					'style="border-style: solid; cursor: move;">'+plan.product+'</div>');
    				// add objects to loadedTiles
    				loadedTiles[td_name] = plan.product;
    			});
    			REDIPS.drag.init();
			}
		});
	}
	function showWelcome() {
		console.log('20-23');
	}
	drawTable("2015/10/28", "2015/11/2");
	loadTable("2015/10/28", "2015/11/2");

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
		var sd = new Date(startDate), ed = new Date(endDate);
		// if start date is less or equal to end date the draw table
		if (sd <= ed){

	    	drawTable(startDate, endDate);
	    	// replace all '/' in date to '-'. It's for postgres date format
	    	startDate = startDate.replace(/\//g, '-');
			endDate = endDate.replace(/\//g, '-');
			loadTable(startDate, endDate);
			var start_date_formated = sd.getDate()+'.'+monthNamesShort[sd.getMonth()]+'. '+sd.getFullYear();
			var end_date_formated = ed.getDate()+'.'+monthNamesShort[ed.getMonth()]+'. '+ed.getFullYear();
			$('.page-date-header p').html(start_date_formated+' - '+end_date_formated);
		}
		else {
			showError('Nav korekti ievadīts datums.');
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
	Move.mouseStillDown = false,
	Move.start_x = 0, Move.start_y = 0,
	Move.start_row = 1, Move.start_col = 1,
	Move.old_row = 0, Move.old_col = 0,
	Move.move_products = {'start':false, 'move':false},
	Move.modal_action = false;
	Move.move_start_mouse_pos = []; // first mouse pos when start to move multiply products

	function markCells(r1, r2, c1, c2, old_r, old_c, e) {
		// new cell indexes
		Move.old_row = e.target.parentNode.rowIndex+1;
		Move.old_col = e.target.cellIndex+1;

		if ( (old_r != Move.old_row || old_c != Move.old_col) ) {
		// for each row
		    for (var i = r1; i <= r2; i++) {
		    	// for each column
				for (var j = c1; j <= c2; j++) {
					// get cell
					var td_html = $( "#table2 tbody tr:nth-child("+i+") td:nth-child("+j+")");
					td_html.css('background-color', '#D93600' );
					newMarkedCells[td_html.attr("name")] = {'r':td_html[0].parentNode.rowIndex+1, 'c':td_html[0].cellIndex+1};
				}
			}
		}
	}

	function drawRect(e, old_r, old_c) {
		// if old new marked cells is not empty then pass it to new marked cells
		if (Object.keys(newMarkedCells).length > 0) 
			oldMarkedCells = newMarkedCells;
		newMarkedCells = {};
		// if column or row is changed
		
		// if draw cube right down
		if (e.pageY - Move.start_y >= 0 && e.pageX - Move.start_x >= 0) {
    		markCells(Move.start_row, e.target.parentNode.rowIndex+1, Move.start_col, e.target.cellIndex+1, old_r, old_c, e);
    	}
    	// draw cube left up
    	else if (e.pageY - Move.start_y < 0 && e.pageX - Move.start_x < 0) {
    		markCells(e.target.parentNode.rowIndex+1, Move.start_row, e.target.cellIndex+1, Move.start_col, old_r, old_c, e);
    	}
    	// draw cube left down
    	else if (e.pageX - Move.start_x <= 0) {
    		markCells(Move.start_row, e.target.parentNode.rowIndex+1, e.target.cellIndex+1, Move.start_col, old_r, old_c, e);
    	}
    	// draw right up
    	else if (e.pageY - Move.start_y <= 0) {
    		markCells(e.target.parentNode.rowIndex+1, Move.start_row, Move.start_col, e.target.cellIndex+1, old_r, old_c, e);
    	}
    	// unmark old cells
    	if (Object.keys(newMarkedCells).length > 0) {
	    	for (var key in oldMarkedCells) {
	    		// id new marked cell not in old then unmark it
			    if (oldMarkedCells.hasOwnProperty(key) && !(key in newMarkedCells)) {
					$('[name="'+key+'"]').css('background-color', '#EEEEEE' );
				}
			};
		};
		if ((Object.keys(newMarkedCells).length < 1) ) {newMarkedCells = oldMarkedCells;}
		//console.log(newMarkedCells);
	}

	var prevMovePosProduct = [];
	$("#table2").mousemove(function(e) { // move rect on mousemove over table2
		//console.log(Move.move_products['start']);
		//console.log(Move.move_products['move']);
		//console.log(markedProducts);
		//console.log(e.target.tagName);
	    if (Move.move_products['start'] && Move.move_products['move']) {
	    	prevNewPosProd = [];
	    	// unhighlight previous cells when moving products
	    	for (var i = prevMovePosProduct.length - 1; i >= 0; i--) {
	    		prevMovePosProduct[i].css('background-color', '#EEE' );
	    	};
	    	// highligt cells on moving products
			for (var key in markedProducts) {
			    if (markedProducts.hasOwnProperty(key)) {
			    	//console.log('markedProducts'+key);
			    	// .attr('style',  'background-color:#e3e3e3');
			    		var row,col;
			    		if (e.target.tagName == "TD") {
			    			row = markedProducts[key].r - (Move.start_row - e.target.parentNode.rowIndex)+1;
			    			col = markedProducts[key].c - (Move.start_col - e.target.cellIndex) + 1;
			    		} else {
			    			row = markedProducts[key].r - (Move.start_row - e.target.parentElement.parentNode.rowIndex)+1;
			    			col = markedProducts[key].c - (Move.start_col - e.target.parentElement.cellIndex) + 1;
			    		}
			    		markedProducts[key].rEnd = row;
			    		markedProducts[key].cEnd = col;
			    		//console.log('Row:'+row+' '+key);
			    		//console.log("Col:"+col+' '+key);

			    		var td_html = $( "#table2 tbody tr:nth-child("+row+") td:nth-child("+col+")");
						td_html.css('background-color', '#D93600' );
						prevMovePosProduct.push(td_html);   
			    }
			}
	    }
	    else if (Move.mouseStillDown) {
	    	drawRect(e, Move.old_row, Move.old_col);
	    }
	});

	$("#table2").mousedown(function(e) {
		for (var key in newMarkedCells) {
		    if (newMarkedCells.hasOwnProperty(key)) {
		    	// .attr('style',  'background-color:#e3e3e3');
		    	if ($('[name="'+key+'"]')[0].innerHTML.trim() != '') {
		    		$('[name="'+key+'"] div').removeClass('marked');
		    		//console.log($('[name="'+key+'"]')[0].innerHTML);
		    	}
		    }
		}
	    Move.mouseStillDown = true;
	    Move.start_x = e.pageX, Move.start_y = e.pageY;
	    Move.start_row = e.target.parentNode.rowIndex+1, Move.start_col = e.target.cellIndex+1;
	    // if button pressed to move products, then on mouse down start to move products
	    if (Move.move_products['start']) {
	    	Move.move_products['move'] = true;
		}
		else{
			newMarkedCells = {};
		}
		console.log(123);
	});
	

	$("body").mouseup(function(e) {
		//console.log(newMarkedCells);
	    if (Move.mouseStillDown && Object.keys(newMarkedCells).length > 0) {
			if (!Move.move_products['move']){
				$('.modal-dialog').attr('style','left: '+e.clientX+'px; top: '+e.clientY+'px;');
				$('#marked-modal').modal('show');
		    	getMarkedProducts();
			}
	    	for (var key in newMarkedCells) {
	    		// if new marked cell not in old then unmark it
			    if (newMarkedCells.hasOwnProperty(key)) {
					$('[name="'+key+'"]').css('background-color', '#EEEEEE' );
				}
			};
		}
		// if released mouse when moving many products, then apply new pos, palce products in new pos
		// this need two loops becouse in case when u drop on cell that is in marked prodcuts then it disapeer
		if (Move.move_products['start'] && Move.move_products['move']) {
			for (var key in markedProducts) {
			    if (markedProducts.hasOwnProperty(key)) {
					// old product place. remove all prev products
					var td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+")");
					td_html.css('background-color', '#EEE' );
					td_html.html(''); 
			    }
			}
			for (var key in markedProducts) {
			    if (markedProducts.hasOwnProperty(key)) {
		    		// new product place. place new products in cells
		    		var td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+markedProducts[key].cEnd+")");
					td_html.css('background-color', '#EEE' );
					td_html.html('<div id="'+key+'" class="redips-drag blue" product="'+markedProducts[key].product+'">'+markedProducts[key].product+'</div');
			    }
			}
			REDIPS.drag.init();

		}

		Move.mouseStillDown = false;
		Move.move_products['start'] = false; Move.move_products['move'] = false;
	});

	$('#delete-marked-bttn').click(function() { 
    	Move.modal_action = true;
    	for (var key in newMarkedCells) {
    		// id new marked cell not in old then unmark it
		    if (newMarkedCells.hasOwnProperty(key)) {
				$('[name="'+key+'"]')[0].innerHTML = ' ';
			}
		};
		newMarkedCells = {};	
    });

   	$('#marked-modal').on('hidden.bs.modal', function () {
   		if (!Move.modal_action) {
			for (var key in newMarkedCells) {
			    if (newMarkedCells.hasOwnProperty(key)) {
			    	// .attr('style',  'background-color:#e3e3e3');
			    	if ($('[name="'+key+'"]')[0].innerHTML.trim() != '') {
			    		$('[name="'+key+'"] div').removeClass('marked');
			    		//console.log($('[name="'+key+'"]')[0].innerHTML);
			    	}
			    }
			}
			if (!Move.move_products['start']) { 
				console.log('#marked-modal');
				newMarkedCells = {};
			}
		}
		Move.modal_action = false;
    });

    $('#move-marked-bttn').click(function(e) { 
    	Move.modal_action = true; // true if modal is not canceled
    	Move.move_products['start'] = true;
    });

   	$(".redips-drag").on('mouseover', function() { console.log('ws'); });

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
	for (var i = start; i <= column_count; i++) { // counts empty cell in marked machines. starting from marked e shift
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
		for (var i = start; i <= column_count; i++) {
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
	else{
		showError('Nepietiek vietas tabulā (max '+count_check+')');
	}
	return filledProd;
}

function getMarkedProducts() {
	markedProducts = {};
	for (var key in newMarkedCells) {
	    if (newMarkedCells.hasOwnProperty(key)) {
	    	// .attr('style',  'background-color:#e3e3e3');
	    	if ($('[name="'+key+'"]')[0].innerHTML.trim() != '') {
	    		$('[name="'+key+'"] div').addClass('marked');
	    		markedProducts[key] = {'r': $('[name="'+key+'"]')[0].parentNode.rowIndex+1, 
	    								'c': $('[name="'+key+'"]')[0].cellIndex+1,
	    								'rEnd': $('[name="'+key+'"]')[0].parentNode.rowIndex+1, 
	    								'cEnd': $('[name="'+key+'"]')[0].cellIndex+1,
	    								'product': $('[name="'+key+'"] div').attr('product')
	    								};
	    		//console.log($('[name="'+key+'"] div').attr('product'));
	    	}
	    }
	}
}

function showError(text) {
	$('#message').prepend('<div class="alert alert-danger fade in" role="alert" style="display: none; margin-top: 5px;">'+
		'<a href="#" class="close" data-dismiss="alert">&times;</a>'+
		'<strong>Kļūda!</strong> '+text+'</div>');
	$(".alert").fadeIn(25);
	setTimeout(function(){ $('.alert').alert('close'); }, 5000);

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
		console.log(currentCell.parentNode.rowIndex);
		if (Move.move_products['start']) {
			Move.move_products['move'] = true;
			Move.start_row = currentCell.parentNode.rowIndex+1;
			Move.start_col = currentCell.cellIndex+1;
			temp_obj = rd.obj;
			console.log($(temp_obj).attr('product'));
			rd.deleteObject(rd.obj);
			// update td witch have attr name with drag tile
			$('[name="'+$(temp_obj).attr('id')+'"]').html('<div id="'+$(temp_obj).attr('id')+'" class="redips-drag blue" product="'+$(temp_obj).attr('product')+ '">'+$(temp_obj).attr('product')+'</div>');
			REDIPS.drag.init();
		}
		
		console.log(Move.move_products['start']);
		console.log($(currentCell).context.cellIndex);
		//REDIPS.drag.init();
		// .context.cellIndex
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