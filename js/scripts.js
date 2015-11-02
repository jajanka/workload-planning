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
var productsColor = {};

var Move = {}; // namespace for marked products variable

// use: when post/get data then ajax gif loader shows
$(document).ajaxStop(function(ev){
	console.debug("ajaxStop");
	if (ev.currentTarget.activeElement.id != 'product' && ev.currentTarget.activeElement.id != 'gen-prod-bttn') { 
	    $("#ajax_loader img").hide();
	    $("#ajax_loader").fadeOut( 200 );
	}
 });
 $(document).ajaxStart(function(ev) {
 	console.debug("ajaxStart");
 	if (ev.currentTarget.activeElement.id != 'product' && ev.currentTarget.activeElement.id != 'gen-prod-bttn') {
	    $("#ajax_loader img").show();
	    $("#ajax_loader").show();
	}
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
				header_time_html += '<td class="">'+checkBox_html+'</td>';
			};
			var dateStr = d.getDate()  + "." + monthNamesShort[d.getMonth()] + "  " + d.getFullYear();
			// format date for header date id
			var date_formated = d.getFullYear()+'-'+pad((d.getMonth()+1))+'-'+pad(d.getDate())+'H';
			header_day_html += '<td id="'+date_formated+'" class="" colspan="3">'+dateStr+' '+d.getDay()+'</td>'; //date
		});
		$('.table1-header .header-time').html('<td class="redips-mark blank"></td>'+header_time_html);
		$('.table1-header .header-day').html('<td class="redips-mark blank"></td>'+header_day_html);

		var left_header_html = ''; //left static column header
		var table2_html = '';	// table cells

		// generate table cells
		for (var i = 0; i < machineCount; i++) {	
			// length for employee change times. There are 3 in 1 day
			var cellLen = dates.length*3;

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
			//alert(data);
			// parse received php data to JSON
			var jsonData = '';
			try {
				jsonData = jQuery.parseJSON(data);
			}
			catch (e) {}
			console.log(jsonData);
			// if json is parsed
			// place free shifts
			if (jsonData != ''){
    			// iterate over JSON array
    			jsonData['shifts'].forEach(function(shift) {
    				// make id for tile
    				var head_id = '#'+shift.week_day+'H';
    				// update color for product name
    				var head_id_col = $(head_id)[0].cellIndex;
    				// mark free shifts all columns with redips-mark dark
    				if (shift.shift1) {
    					$('.header-time td:nth-child('+((head_id_col*3-1))+')').html(tableHeaders[0]).addClass('free');
    					for (var i = 1; i <= machineCount; i++) {
    						$('#table2 tr:nth-child('+i+') td:nth-child('+((head_id_col*3-1)-1)+')').addClass('redips-mark  dark');
    					};
    				}
    				if (shift.shift2) {
    					$('.header-time td:nth-child('+((head_id_col*3-1)+1)+')').html(tableHeaders[1]).addClass('free');
    					for (var i = 1; i <= machineCount; i++) {
    						$('#table2 tr:nth-child('+i+') td:nth-child('+(head_id_col*3-1)+')').addClass('redips-mark  dark');
    					};
    				}
    				if (shift.shift3) {
    					$('.header-time td:nth-child('+((head_id_col*3-1)+2)+')').html(tableHeaders[2]).addClass('free');
    					for (var i = 1; i <= machineCount; i++) {
    						$('#table2 tr:nth-child('+i+') td:nth-child('+((head_id_col*3-1)+1)+')').addClass('redips-mark  dark');
    					};
    				}
    				//loadedTiles[td_name] = plan.product;
    			});
			}
			// place products in table
			if (jsonData != ''){
				if (jsonData['products'] !== undefined) {
	    			// iterate over JSON array
	    			jsonData['products'].forEach(function(plan) {
	    				// make id for tile
	    				td_name = plan.p_date+'/'+plan.machine+'/'+plan.e_shift;
	    				// update color for product name
	    				updateColor(plan.product);
	    				// update td witch have attr name with drag tile
	    				$('[name="'+td_name+'"]').html(setProductDiv(td_name, plan.product));
	    				// add objects to loadedTiles
	    				loadedTiles[td_name] = plan.product;
	    			});
	    		}
			}
		});
	}
	drawTable("2015/10/28", "2015/11/2");
	loadTable("2015/10/28", "2015/11/2");

	/* ################################################
	###################### EVENTS #######################
	*/

	$('#gen-table-bttn').click(function() { 
		var startDate = $('[name="start"]').val();
		var endDate = $('[name="end"]').val();
		var sd = new Date(startDate), ed = new Date(endDate);
		// if start date is less or equal to end date the draw table
		if (sd <= ed){
			markedMachines = {};
			markedShift = 1;
			deletedTiles = {};
	    	loadedTiles = {};
	    	addedTiles = {};
	    	drawTable(startDate, endDate);
	    	// replace all '/' in date to '-'. It's for postgres date format
	    	startDate = startDate.replace(/\//g, '-');
			endDate = endDate.replace(/\//g, '-');
			loadTable(startDate, endDate);
			var start_date_formated = sd.getDate()+'.'+monthNamesShort[sd.getMonth()]+'. '+sd.getFullYear();
			var end_date_formated = ed.getDate()+'.'+monthNamesShort[ed.getMonth()]+'. '+ed.getFullYear();
			$('.page-date-header').html(start_date_formated+' - '+end_date_formated);
		}
		else {
			showError('Nav korekti ievadīts datums.');
		}
    });


	$('#gen-prod-bttn').click(function() { 
		var p = $('#product').val();
		var q = $('#quantity').val();
    	lastFilledProducts = fillProducts(p, markedShift, q);
    	console.log(lastFilledProducts);
    });

    $('#undo-gen-prod-bttn').click(function() { 
    	console.log('asd');
    	for (var i = 0; i < lastFilledProducts.length; i++) {
    		$('[name="'+lastFilledProducts[i]+'"]').html('');
    	};
    });

    $('#save-bttn').click(function() { 
    	save();
    });

	//// Rectangle draw, marking products
	///////////////////////// 
	Move.mouseStillDown = false,
	Move.start_x = 0, Move.start_y = 0,
	Move.start_row = 1, Move.start_col = 1,
	Move.old_row = 0, Move.old_col = 0,
	Move.move_products = {'start':false, 'move':false},
	Move.modal_action = false;
	Move.move_start_mouse_pos = [], // first mouse pos when start to move multiply products
	Move.mProdCountInRow = {};

	function markCells(r1, r2, c1, c2, old_r, old_c, e) {
		// new cell indexes
		Move.old_row = e.parentNode.rowIndex+1;
		Move.old_col = e.cellIndex+1;

		if ( (old_r != Move.old_row || old_c != Move.old_col) ) {
		// for each row
		    for (var i = r1; i <= r2; i++) {
		    	// for each column
				for (var j = c1; j <= c2; j++) {
					// get cell
					var td_html = $( "#table2 tbody tr:nth-child("+i+") td:nth-child("+j+")");
					td_html.css('background-color', '#D93600' );
					newMarkedCells[td_html.attr("name")] = {'r':td_html[0].parentNode.rowIndex+1, 'c':td_html[0].cellIndex+1};
					// highlight product if cell have product in it
					if (td_html.children() != []) {
						td_html.children().addClass('marked');
					}
				}
			}
		}
	}

	function drawRect(e, old_r, old_c) {
		// if old new marked cells is not empty then pass it to new marked cells
		if (Object.keys(newMarkedCells).length > 0) 
			oldMarkedCells = newMarkedCells;
		newMarkedCells = {};
		
		// save original event
		old_e = e;

		// if mouse is over empty cell
		if (e.target.tagName == 'TD') {
			e = e.target;
		}
		// if mouse is over product
		else if (e.target.tagName == 'DIV'){
			e = e.target.parentElement;
		}

		// if draw cube right down
		if (old_e.pageY - Move.start_y >= 0 && old_e.pageX - Move.start_x >= 0) {
    		markCells(Move.start_row, e.parentNode.rowIndex+1, Move.start_col, e.cellIndex+1, old_r, old_c, e);
    	}
    	// draw cube left up
    	else if (old_e.pageY - Move.start_y < 0 && old_e.pageX - Move.start_x < 0) {
    		markCells(e.parentNode.rowIndex+1, Move.start_row, e.cellIndex+1, Move.start_col, old_r, old_c, e);
    	}
    	// draw cube left down
    	else if (old_e.pageX - Move.start_x <= 0) {
    		markCells(Move.start_row, e.parentNode.rowIndex+1, e.cellIndex+1, Move.start_col, old_r, old_c, e);
    	}
    	// draw right up
    	else if (old_e.pageY - Move.start_y <= 0) {
    		markCells(e.parentNode.rowIndex+1, Move.start_row, Move.start_col, e.cellIndex+1, old_r, old_c, e);
    	}
    	// unmark old cells
    	if (Object.keys(newMarkedCells).length > 0) {
	    	for (var key in oldMarkedCells) {
	    		// id new marked cell not in old then unmark it
			    if (oldMarkedCells.hasOwnProperty(key) && !(key in newMarkedCells)) {
			    	var td_html = $('[name="'+key+'"]');
					td_html.css('background-color', '#EEEEEE' );
					// unhighlight product
		    		if (td_html.children() != []) {
						td_html.children().removeClass('marked');
					}
				}
			};
		};
		if ((Object.keys(newMarkedCells).length < 1) ) {newMarkedCells = oldMarkedCells;}
		//console.log(newMarkedCells);
	}

	var prevMovePosProduct = [];
	$("#table2").mousemove(function(e) { // move rect on mousemove over table2
		if(e.which == 1) {
			console.log('Mouse move '+Move.move_products['start']+ ' '+Move.move_products['move']);
			console.log(markedProducts);
		    if (Move.move_products['start'] && Move.move_products['move'] && Object.keys(markedProducts).length > 0) {
		    	//////////////////////////////////////////////////
		    	// MOVING ALREADY MARKED PRODUCTS!!
		    	//////////////////////////////////////////////////
		    	// unhighlight previous cells when moving products
		    	for (var i = prevMovePosProduct.length - 1; i >= 0; i--) {
		    		prevMovePosProduct[i].css('background-color', '#EEE' );
	   				// unhighlight product
		    		if (prevMovePosProduct[i].children() != []) {
						prevMovePosProduct[i].children().removeClass('marked');
					}
		    	};
		    	prevMovePosProduct = [];

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
				    		console.log(markedProducts[key].cEnd);
				    		//console.log('Row:'+row+' '+key);
				    		//console.log("Col:"+col+' '+key);

				    		var td_html = $( "#table2 tbody tr:nth-child("+row+") td:nth-child("+col+")");
				    		//console.log("#table2 tbody tr:nth-child("+row+") td:nth-child("+col+")");
							td_html.css('background-color', '#D93600' );
							// highlight product
				    		if (td_html.children() != []) {
								td_html.children().addClass('marked');
							}
							prevMovePosProduct.push(td_html);   
				    }
				}
		    }
		    else if (Move.mouseStillDown) { // marking products
		    	drawRect(e, Move.old_row, Move.old_col);
		    }
		}
	});

	$("#table2").mousedown(function(e) {
		if(e.which == 1) {
			$('.marked').removeClass('marked');
			// unhighlight marked products
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
		    if (!ctrlPressed) {
			    Move.start_row = e.target.parentNode.rowIndex+1, Move.start_col = e.target.cellIndex+1;
			}
			else {
			    Move.start_row = e.target.parentNode.parentNode.rowIndex+1, Move.start_col = e.target.parentNode.cellIndex+1;
			}
			if (!ctrlPressed) {
			    if (e.target.className == 'blue' && Move.move_products['start']) {
				    Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
				    Move.start_col = e.target.parentNode.cellIndex+1;
				    // if marked products start to move and it starts from product div not empty cell
				    if (Move.move_products['start']) {
				    	Move.move_products['move'] = true;
					}
				}
				else if (e.target.className == 'blue' && !Move.move_products['start']) {
					newMarkedCells = {};
					Move.move_products['start'] = true; Move.move_products['move'] = true;
					Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
					Move.start_col = e.target.parentNode.cellIndex+1;
					// place it in marked cells not products
					var curCell = e.target.parentNode;
					newMarkedCells[$(curCell).attr('name')] = {'r':$(curCell)[0].parentNode.rowIndex+1, 'c':$(curCell)[0].cellIndex+1};
					// get cell in marked products
					getMarkedProducts();
					console.log(newMarkedCells);
				}
				else
				{
			    	Move.start_row = e.target.parentNode.rowIndex+1, Move.start_col = e.target.cellIndex+1;
					newMarkedCells = {};
				}
			}
			console.log('Mouse down '+Move.move_products['start']);
		}
	});

	document.getElementById('right').oncontextmenu = function(e) {
	   	console.log(newMarkedCells);

		$('#marked-modal .modal-dialog').attr('style','left: '+(e.clientX)+'px; top: '+(e.clientY-10)+'px;');
		$('#marked-modal').modal('show');

	    return false;
	}

	$("body").mouseup(function(e) {
		if (e.which == 1) {

			// unmark empty cells
			if ( Object.keys(newMarkedCells).length > 0) {
				for (var key in newMarkedCells) {
		    		// if new marked cell not in old then unmark it
				    if (newMarkedCells.hasOwnProperty(key)) {
						$('[name="'+key+'"]').css('background-color', '#EEEEEE' );
					}
				};
				console.log('M up Move.move_products[start] ' +Move.move_products['start']);
				if (!Move.move_products['start']) getMarkedProducts();
				Move.modal_action = true; // true if modal is not canceled
	    		Move.move_products['start'] = true;
	    		//Move.move_products['move'] = true;
	    		console.log('Mouse up '+Move.move_products['start']);
			}
			else {
				Move.move_products['start'] = false; Move.move_products['move'] = false;
			}
			// if released mouse when moving many products, then apply new pos, palce products in new pos
			if (Move.move_products['start'] && Move.move_products['move']) {
				console.log('Place products');
				// check if products can be placed in new place
				var lastTdIndex = $("#table2:first tr:nth-child(1) td:last-child")[0].cellIndex+1;
				var is_valid = true;
				// checks if product can be placed in new place
				for (var key in markedProducts) {
				    if (markedProducts.hasOwnProperty(key)) {
				    	// new place is out of table bounds then don't placed
			    		if (markedProducts[key].rEnd < 1 || markedProducts[key].rEnd > machineCount ||
			    			markedProducts[key].cEnd < 1 /*|| markedProducts[key].cEnd > lastTdIndex*/) { 
			    			//showError('Produkti neietilpst tabulā.');
			    			is_valid = false;
							$('#error-modal .modal-dialog').attr('style','left: '+(e.clientX-80)+'px; top: '+(e.clientY-10)+'px;');
							$('#error-modal').modal('show');
							
			    			break;
			    		}
					}
				}
				for (var key in markedProducts) {
				    if (markedProducts.hasOwnProperty(key)) {
						// old product place. remove all prev products
						var td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+")");
						td_html.css('background-color', '#EEE' );
						// if new products is not out of table bounds
						if (is_valid) {
							td_html.html(''); 
						}
				    }
				}
				//var shifted_rows = {};
				for (var key in markedProducts) {
				    if (markedProducts.hasOwnProperty(key)) {

			    		// new product place. place new products in cells
			    		var td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+markedProducts[key].cEnd+")");
						td_html.css('background-color', '#EEE' );
						if (is_valid) {
							// row's last td index
							var rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
							// row's first new product
							var startIndex = markedProducts[key].cEnd;
							// 
							var nextCell_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+")")[0].innerHTML;

							for (var i = startIndex; i <= rowLastCellIndex; i++) {
								// if next cell have no products then break
								if (nextCell_html == "") break; 
								// current cell in next cell innerHTML
								var currentCell = nextCell_html;
								// next cell
								nextCell = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+")");
								// next cell html
								nextCell_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+")")[0].innerHTML;

								nextCell[0].innerHTML = currentCell;
								console.log(nextCell_html);
							};
							td_html.html( setProductDiv(key, markedProducts[key].product, true));
				    	}
				    }
				}
				markedProducts = {};
				
				Move.move_products['start'] = false; Move.move_products['move'] = false;
			}

			Move.mouseStillDown = false;
		}
	});

	$('#delete-marked-bttn').click(function() { 
    	Move.modal_action = true;
    	for (var key in newMarkedCells) {
    		// if new marked cell not in old then unmark it
		    if (newMarkedCells.hasOwnProperty(key)) {
				$('[name="'+key+'"]')[0].innerHTML = "";
			}
		};
		newMarkedCells = {};	
		markedProducts = {};
		Move.move_products['start'] = false; Move.move_products['move'] = false;
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

	// constructs the suggestion engine
	var prods = new Bloodhound({
	    datumTokenizer: Bloodhound.tokenizers.whitespace,
	    queryTokenizer: Bloodhound.tokenizers.whitespace,
	    remote: {
	       url: 'php/products.php',

	       prepare: function (query, settings) {
	          settings.dataType = 'json';
              settings.type = 'POST';
	          settings.data = {q:query};

	          return settings;
	       }
	   }
	});
	$('#product').typeahead({
	  hint: true,
	  highlight: true,
	  minLength: 1
	},
	{
	  name: 'product',
	  source: prods,
	  limit: 7
	});

	$('#product').css("vertical-align", " middle");

	// info modal for products
	$("body").on('click', '.info', function() {
		console.log($('#product').val());

		$.post( "php/products.php", {product: $('#product').val()})
		// when post is finished
		.done(function( data ) {
			if (data != '[]') {
				console.log(data);
				jsonModal = JSON.parse(data)[0];
				console.log(jsonModal);
				jsonModal = JSON.parse(jsonModal[0]);
				console.log(jsonModal);
				$('#productModal .modal-title')[0].innerHTML = $('#product').val();
				// set overll comment 
				if (jsonModal != null) 
					$('#overallComment').val(jsonModal['info']);

				var td_html = '';
				for (var i = 1; i <= 21; i++) 
				{
					var comment = '';
					var is_checked = 'unchecked';
					if (jsonModal != null) {
						if (jsonModal[i] !== undefined) {
						 	comment = jsonModal[i]['comment'];
						 	if (jsonModal[i]['check']) {
						 		is_checked = 'checked';
						 	}
						}
					}
					td_html += '<tr>';
					td_html += '<td><div class="checkbox"><label><input type="checkbox" '+is_checked+'>'+i+'</label></div></td>';
					td_html += '<td><input type="text" class="form-control input-sm" value="'+comment+'"></td>';
						
					td_html += '</tr>';
				};
				$('#productsInfoTable tbody').html(td_html);
				// $('#productModal').modal({'backdrop': 'static'});
		    	$('#productModal').modal({'show': true, });
		    }
		    else {
		    	showError("Šāds '"+$('#product').val()+"' produkts neeksistē.", 'danger');
		    }
		})
		.fail( function( data ) {
		    showError("Nevar saglabāt datus.", 'danger');
		});

	});

	/* ####################### END OF EVENTS #############################
		#################################################################
	*/ 
});

function fillProducts(product, start, count) {
	if (Object.keys(markedMachines).length < 1) {
		showError('Nav atzīmēta neviena mašīna.', 'danger');
		return;
	}
	$.post( "php/products_formula.php", {kg: count, prod: product})
	// when post is finished
	.done(function( data ) {
		var jsonCount = '';
		if (data != '') 
		{
			jsonCount = Math.ceil(JSON.parse(data));
			// row column length
			var column_count = document.getElementById('table2').rows[0].cells.length;
			var count_check = 0, 
				is_valid = false;
				lastFilledProducts = [];
			for (var i = start; i <= column_count; i++) { // counts empty cell in marked machines. starting from marked e shift
				for (var key in markedMachines) {
				    if (markedMachines.hasOwnProperty(key)) {
						var td_html = $( "#table2 tbody tr:nth-child("+key+") td:nth-child("+i+")");
						if (td_html[0].innerHTML.trim().length == 0) {
							count_check++;
						}
					if (count_check >= jsonCount) { is_valid = true; break; }
				    }
				}
				if (count_check >= jsonCount) { is_valid = true; break; }
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
								// update products colors
								updateColor(product);
								// put a product in cell
								td_html.html( setProductDiv(td_html.attr("name"), product) ) ;
								addedTiles[td_html.attr("name")] = product;
								// add to last filled products
								lastFilledProducts.push(td_html.attr("name"));
								jsonCount--;
							}
					    }
					    if (0 >= jsonCount) { break; } // if all products placed
					}
					if (0 >= jsonCount) { break; }
				};
			}
			else{
				showError('Nepietiek vietas tabulā (max '+count_check+')');
			}
			return lastFilledProducts;
		}
		else 
		{
			showError("Nekorekts rezultāts.", 'danger');;
		}

	})
	.fail( function( data ) {
	    showError("Nevar pievienot produktu.", 'danger');
	});

}

function getMarkedProducts() {
	markedProducts = {};
	Move.mProdCountInRow = {};
	for (var key in newMarkedCells) {
	    if (newMarkedCells.hasOwnProperty(key)) {
	    	var td_html = $('[name="'+key+'"]')[0];
	    	// if cell have product
	    	if (td_html.innerHTML.trim() != '') {
	    		$('[name="'+key+'"] div').addClass('marked');
	    		// update marked product count in row
	    		var row = td_html.parentNode.rowIndex+1;
	    		 if (Move.mProdCountInRow[row] === undefined) 
	    		 	Move.mProdCountInRow[row] = [td_html.cellIndex+1];
	    		 else
	    		 	Move.mProdCountInRow[row].push(td_html.cellIndex+1);

	    		markedProducts[key] = {'r': td_html.parentNode.rowIndex+1, 
	    								'c': td_html.cellIndex+1,
	    								'rEnd': td_html.parentNode.rowIndex+1, 
	    								'cEnd': td_html.cellIndex+1,
	    								'product': $('[name="'+key+'"] div').attr('product'),
	    								'diffToFirst': 1, 'diffToLastFirst': 1
	    								};
	    	}
	    }
	}
	// update markedProducts.count. It's count of how many products is marked in this product row
	for (var key in markedProducts) {
	    if (markedProducts.hasOwnProperty(key)) {
	    	var maxDiff = Math.max.apply(Math, Move.mProdCountInRow[markedProducts[key].r]);
	    	var minDiff = Math.min.apply(Math, Move.mProdCountInRow[markedProducts[key].r]);

	    	markedProducts[key].diffToFirst = markedProducts[key].c - minDiff + 1;
	    	markedProducts[key].diffToLastFirst = maxDiff - minDiff + 1;
	    }
	}
	console.log(markedProducts);
}

function showError(text) {
	$('#message').prepend('<div class="alert alert-danger fade in" role="alert" style="display: none; margin-top: 5px;">'+
		'<a href="#" class="close" data-dismiss="alert">&times;</a>'+
		'<strong>Kļūda!</strong> '+text+'</div>');
	$(".alert").fadeIn(25);
	setTimeout(function(){ $('.alert').alert('close'); }, 5000);
}


/* ###### COLOR FUNCTIONS #######
###################################
*/

function hexToRgb(hex) { // converts color from hex to rgb
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function generateTextColor(color) { // generates 
	var color = hexToRgb(color);
  	if (color != null) { // 'ok' is true when the parsing was a success
	    var brightness = Math.sqrt(
				           color.r * color.r * .299 +
				           color.g * color.g * .587 +
				           color.b * color.b * .114); 
	    var foreColor = (brightness < 130) ? "#FFFFFF" : "#000000";
	    return foreColor;
	}
}

function updateColor(product) { // get random color
	var random_color = '#'+Math.floor(Math.random()*16777215).toString(16);
	if(productsColor[product] === undefined) {
		productsColor[product] = random_color;
	}
}

/* ### END OF COLOR FUNCTIONS ###
    ###########################
*/

function setProductDiv (name, product,marked) {
	cls = (marked) ? ' marked' : '';
	return '<div id="'+name+'" class="blue'+cls+'" product="'+product+'"'+ 
			'style="background-color:'+productsColor[product]+'; color:'+generateTextColor(productsColor[product])+'">'+product+'</div';
}


save = function () {
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


// checks if Ctrl button is pressed
var ctrlPressed = false;
$(window).keydown(function(evt) {
  if (evt.which == 17) { // ctrl
    ctrlPressed = true;
  }
}).keyup(function(evt) {
  if (evt.which == 17) { // ctrl
    ctrlPressed = false;
  }
});

function p(){ console.log(loadedTiles); console.log(addedTiles); console.log(deletedTiles); }