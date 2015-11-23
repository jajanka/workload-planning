var tableLen = 10;
var tableHeaders =['22-06', '06-14', '14-22'];
var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
var machineCount = 21;
var historyEndCell = 1;

var loadedTiles = {}; // loaded products from DB

var markedMachines = {}; // marked machines where to place products
var markedShift = 0 // marked employee shift

var undoProducts = []; // used to undo last 10 placed products

var markedProducts = {};
var productsColor = {};

var Move = {}; // namespace for marked products variable
var PBuffer = {cut: {}, copy: {}}; // namespace for buffer, that is, copy, paste, cut and stuff

// use: when post/get data then ajax gif loader shows
// scope the jQuery
( function($) {
    $(document).ajaxStop(function(ev){
        console.debug("ajaxStop");
        if (ev.currentTarget.activeElement.id != 'product' && ev.currentTarget.activeElement.id != 'gen-prod-bttn') { 
            $("#ajax_loader img").hide();
            $("#ajax_loader").fadeOut( 200 );
        }
     });
})( jQuery );

( function($) {
     $(document).ajaxStart(function(ev) {
        console.debug("ajaxStart");
        if (ev.currentTarget.activeElement.id != 'product' && ev.currentTarget.activeElement.id != 'gen-prod-bttn') {
            $("#ajax_loader img").show();
            $("#ajax_loader").show();
            //$("#ajax_loader").offset($("#right").offset());
        }
     });
})( jQuery );

// scope the jQuery
( function($) {

$( document ).ready(function() 
{
    var statusBar = {'marked': {'label': 'Iezīmēts', 'count': 0}}
    // Init tooltip
    //$('[data-toggle="tooltip"]').tooltip(); 

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
                        markedShift = 0;
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
                    $( "#table2 tbody tr:nth-child("+toggledChkBox+") td").addClass('machine-row');
                    markedMachines[toggledChkBox] = true;
                    console.log(markedMachines);
                }
                else {
                    $button.removeClass('btn-' + color + ' active').addClass('btn-default');

                    if (clicked == true) {
                       // get toggled bttn-checkbox number. It's machine number
                       var toggledChkBox = $button.context.getElementsByTagName('button')[0].childNodes[2].textContent;
                       // color row with this number
                        $( "#table2 tbody tr:nth-child("+toggledChkBox+") td").removeClass('machine-row');
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
    $(window).scroll(function() {
        var currentTop = $(window).scrollTop();
        var currentLeft = $(window).scrollLeft();

        if(prevTop != currentTop) { // vertical scroll
            prevTop = currentTop;
            var prevOffset = $('.table1-header').offset();
            var prevOffsetLeft = $('.left-header').offset();
            $('.table1-header').offset({top: initHeaderOffset.top+currentTop, left: prevOffset.left});
            $('.left-header').offset({top: 155, left: prevOffsetLeft.left}); //
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
            checkBox_html = '<span class="button-checkbox-time">'+
                '<button style="width:100%;" type="button" class="btn btn-xs" data-color="success">'+tableHeaders[i]+'</button>'+
                '<input type="checkbox" class="hidden" unchecked />'+
                '</span>';
                header_time_html += '<td class="">'+checkBox_html+'</td>';
            };
            var dateStr = d.getDate()  + "." + monthNamesShort[d.getMonth()] + "  " + d.getFullYear();
            // format date for header date id
            var date_formated = d.getFullYear()+'-'+pad((d.getMonth()+1))+'-'+pad(d.getDate())+'H';
            header_day_html += '<td id="'+date_formated+'" class="day-td" colspan="3">'+dateStr+'</td>'; //date
        });

        $('.table1-header .header-time').html('<td class="blank"></td>'+header_time_html);
        $('.table1-header .header-day').html('<td class="blank"></td>'+header_day_html);

        var left_header_html = ''; //left static column header
        var table2_html = '';   // table cells
        
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
        // var tableLeftUpperCorner = '<div id="leftUppercorner"></div>';
        $('.left-header').html(left_header_html);
        $('#table2 tbody').html(table2_html);

        // update bttn-checkboxes
        initBttnCheckbox();
        drawTodaysSign(1000, true);
    }

    function expandTable(r, c) 
    {
        // last day date of current table
        var lastDate = $('.header-day td').last()[0].id;
        lastDate = lastDate.slice(0, -1);

        var lastDateObj = new Date(lastDate);
        lastDateObj.setDate(lastDateObj.getDate() + 1);
        var lastDateObj_formated = lastDateObj.getFullYear()+'-'+pad((lastDateObj.getMonth()+1))+'-'+pad(lastDateObj.getDate());

        // create expandig table last date
        var expandDate = new Date(lastDate);
        expandDate.setDate(expandDate.getDate() + 7);

        var expandDate_formated = expandDate.getFullYear()+'-'+pad((expandDate.getMonth()+1))+'-'+pad(expandDate.getDate());
        // get all dates for expanding table 
        var dates = getDates(new Date(lastDate), expandDate);
        // delete first array element becouse it's unnecessery
        dates.shift();
        var header_time_html = '';
        var header_day_html = '';

        initBttnCheckbox(); // fix for bttn-checkbox
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
            header_day_html += '<td id="'+date_formated+'" class="day-td" colspan="3">'+dateStr+'</td>'; //date
        });
        $('.table1-header .header-time').append(header_time_html);
        $('.table1-header .header-day').append(header_day_html);
        initBttnCheckbox();

        // add table main table cells
        // generate table cells
        for (var i = 0; i < r; i++) {  
            var table2_html = '';   // table cells
            // length for employee change times. There are 3 in 1 day
            var cellLen = dates.length*3;
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
            $('#table2 tr:nth-child('+(i+1)+')').append(table2_html);
        };
        drawTodaysSign(1000, false);
        loadTable(lastDateObj_formated, expandDate_formated, false);
    }

    function fillProducts(product, start, count) {
        if (Object.keys(markedMachines).length < 1) {
            showError('Nav atzīmēta neviena mašīna.', 'gen-prod-bttn');
            return;
        }
        $.post( "php/products_formula.php", {kg: count, prod: product})
        // when post is finished
        .done(function( data ) {
            var jsonCount = 0;
            var usedShifts = {}; // set of columns where products is landed;
            var firstPlacedIndex = -1;

            if (data != '') 
            {
                updateUndo();
                console.log(JSON.parse(data));
                jsonCount = Math.ceil(JSON.parse(data));
                uneditable_jsonCount = jsonCount;
                // row column length
                var column_count = document.getElementById('table2').rows[0].cells.length;
                var count_check = 0;

                // if products can be filled in table
                // iterate over columns
                for (var i = start; i <= column_count; i++) {
                    // for each marked machine in left header column
                    for (var key in markedMachines) {
                        // js lagging fix
                        if (markedMachines.hasOwnProperty(key)) {
                            // get cell
                            var td_html = $( "#table2 tbody tr:nth-child("+key+") td:nth-child("+i+")");
                            // if inner html in cell is empty
                            if (td_html[0].innerHTML.trim() == "" && !td_html.hasClass('dark')) {
                                if (i >= column_count)  {
                                    console.log('Expand1');
                                    expandTable(machineCount, 7);
                                    column_count = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                                }
                                // update products colors
                                updateColor(product);
                                // put a product in cell
                                td_html.html( setProductDiv(td_html.attr("name"), product) ) ;
                                jsonCount--;
                                usedShifts[i] = true;
                                if ( firstPlacedIndex == -1 ) firstPlacedIndex = i;
                            } 
                            else if (td_html.hasClass('dark')) 
                            {
                                while (td_html.hasClass('dark')){
                                    i++;
                                    if (i >= column_count)  {
                                        console.log('Expand1');
                                        expandTable(machineCount, 7);
                                        column_count = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                                    }
                                    td_html = $( "#table2 tbody tr:nth-child("+key+") td:nth-child("+i+")");
                                }
                                                        // update products colors
                                updateColor(product);
                                // put a product in cell
                                td_html.html( setProductDiv(td_html.attr("name"), product) ) ;
                                jsonCount--;
                                usedShifts[i] = true;
                                if ( firstPlacedIndex == -1 ) firstPlacedIndex = i;
                            }
                        }
                        if (0 >= jsonCount) { break; } // if all products placed
                    }
                    if (0 >= jsonCount) { break; }
                };

                // Preperation for message that is shoen when products is added to plan.
                var endDateCol = (i % 3 == 0) ? i / 3 + 1 : parseInt(i/3) + 2;
                var startDateCol = (firstPlacedIndex % 3 == 0) ? firstPlacedIndex / 3 + 1 : parseInt(firstPlacedIndex/3) + 2;

                var endDate = new Date( $('.header-day td:nth-child('+endDateCol+')')[0].id.slice(0, -1) );
                var startDate = new Date( $('.header-day td:nth-child('+startDateCol+')')[0].id.slice(0, -1) );

                endDate_formated = endDate.getFullYear()+'.gada '+endDate.getDate()+'.'+ monthNamesShort[endDate.getMonth()];
                if ( firstPlacedIndex % 3 == 1 ) {
                    startDate.setDate(startDate.getDate() - 1);
                }
                startDate_formated = startDate.getFullYear()+'.gada '+startDate.getDate()+'.'+ monthNamesShort[startDate.getMonth()];

                if (i % 3 == 0) endDate_formated += ' 22:00';
                if (i % 3 == 1) endDate_formated += ' 06:00';
                if (i % 3 == 2) endDate_formated += ' 14:00';

                if (firstPlacedIndex % 3 == 0) startDate_formated += ' 14:00';
                if (firstPlacedIndex % 3 == 1) startDate_formated += ' 22:00';
                if (firstPlacedIndex % 3 == 2) startDate_formated += ' 06:00';

                $('#successModal .modal-body p').html('Pievienota/as <b>'+Object.keys(usedShifts).length+'</b> maiņa/as uz <b>'+Object.keys(markedMachines).length+'</b> mašīnām ('+uneditable_jsonCount+' vienības)<br />');
                $('#successModal .modal-body p').append('<b>Sākums:</b> '+startDate_formated+'<br />');
                $('#successModal .modal-body p').append('<b>Beigas:</b> '+endDate_formated);
                $('#successModal').modal('show');
            }
            else 
            {
                showError("Nekorekts rezultāts.", 'gen-prod-bttn');
            }

        })
        .fail( function( data ) {
            showError("Nevar pievienot produktu.", 'gen-prod-bttn');
        });
    }

    function loadTable(startD, endD, is_async) {
        //console.log(startD);
        $.ajax({
              type: 'POST',
              url: "php/load.php",
              data: {startDate: startD, endDate: endD},
              success: function( data ) {
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
                if (jsonData != '' && jsonData['shifts'] !== undefined) {
                    // iterate over JSON array
                    jsonData['shifts'].forEach(function(shift) {
                        console.log(shift);
                        // make id for tile
                        var head_id = '#'+shift.week_day+'H';
                        // update color for product name
                        var head_id_col = $(head_id)[0].cellIndex;
                        var calculated_id = head_id_col*3-1;
                        // mark free shifts all columns with redips-mark dark
                        if (shift.shift1) {
                            $('.header-time td:nth-child('+(calculated_id)+')').html(tableHeaders[0]).addClass('free');
                            $('#table2 tr:nth-child(n) td:nth-child('+(calculated_id-1)+')').addClass('redips-mark  dark');
                        }
                        if (shift.shift2) {
                            $('.header-time td:nth-child('+(calculated_id+1)+')').html(tableHeaders[1]).addClass('free');
                            $('#table2 tr:nth-child(n) td:nth-child('+calculated_id+')').addClass('redips-mark  dark');
                        }
                        if (shift.shift3) {
                            $('.header-time td:nth-child('+(calculated_id+2)+')').html(tableHeaders[2]).addClass('free');
                            $('#table2 tr:nth-child(n) td:nth-child('+(calculated_id+1)+')').addClass('redips-mark  dark');
                        }
                    });
                }
                console.log('shiftsDone ');
                // place products in table
                if (jsonData != '' && jsonData['products'] !== undefined){
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
                shiftFromFreeDays();
            },
              async:is_async
        });
    }

    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 21);
    var endDate_formated = endDate.getFullYear()+'/'+(endDate.getMonth()+1)+'/'+endDate.getDate();

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    var startDate_formated = startDate.getFullYear()+'/'+(startDate.getMonth()+1)+'/'+startDate.getDate();

    drawTable(startDate_formated, endDate_formated);
    loadTable(startDate_formated, endDate_formated, true);

    /* ################################################
    ###################### EVENTS #######################
    */

    $('#gen-table-bttn').click(function() { 
        var startDate = $('[name="start"]').val();
        var endDate = $('[name="end"]').val();
        var sd = new Date(startDate), ed = new Date(endDate);
        // if start date is less or equal to end date the draw table
        if (sd <= ed) {
            $('[data-toggle="tooltip"]').tooltip('destroy');
            markedMachines = {};
            markedShift = 0;
            loadedTiles = {};
            drawTable(startDate, endDate);
            // replace all '/' in date to '-'. It's for postgres date format
            startDate = startDate.replace(/\//g, '-');
            endDate = endDate.replace(/\//g, '-');
            console.log('Start loading table...');
            loadTable(startDate, endDate, true);
            console.log('Finished loading!');
            var start_date_formated = sd.getDate()+'.'+monthNamesShort[sd.getMonth()]+'. '+sd.getFullYear();
            var end_date_formated = ed.getDate()+'.'+monthNamesShort[ed.getMonth()]+'. '+ed.getFullYear();
            $('.page-date-header').html(start_date_formated+' - '+end_date_formated);
        }
        else {
            showError('Nav korekti ievadīts datums.', 'gen-table-bttn');
        }
    });


    $('#gen-prod-bttn').click(function() { 
        var p = $('#product').val();
        var q = $('#quantity').val();
        if ( markedShift < 1 ) {
        	showError("Nav atzīmēta starta maiņa!", 'gen-prod-bttn');
        	return;
        }
        fillProducts(p, markedShift, q);
    });

    $('#undo-gen-prod-bttn').click(function() { 
        Move.move_products['start'] = false; Move.move_products['move'] = false;

        if ( undoProducts.length > 0 ) {
            initBttnCheckbox(); // unpressable bttn fix
            markedShift = 0;

            var undoHTML = undoProducts.pop();
            $('.table1-header').html(undoHTML['header']);
            $('#table2').html(undoHTML['table']);
            loadedTiles = undoHTML['loadedTiles'];

            $('.button-checkbox-time').each(function () {
            	$(this).find('button').attr('class', 'btn btn-xs btn-default');
            	$(this).find('i').attr('class', 'state-icon glyphicon glyphicon-unchecked');
            })

            drawTodaysSign(0, true);
            initBttnCheckbox();
        }
    });

    $('#save-bttn').click(function() { 
        save();
    });

    $('#deselect-machine-bttn').click(function() { 
        $('.button-checkbox').each(function () 
        {
            // deselect checked machines bttn-chckbxs.
            if ( $(this).find('input:checkbox').is(':checked') ){
                $(this).find('button').click();
            }
        });
    });

    $( "#gen-prod-bttn" ).mouseout(function() {
        setTimeout( function() { $( "#gen-prod-bttn" ).tooltip('destroy') }, 3000 );
	});
	$( "#gen-table-bttn" ).mouseout(function() {
         setTimeout( function() { $( "#gen-table-bttn" ).tooltip('destroy') }, 3000 );
	});
	$( "#save-bttn" ).mouseout(function() {
         setTimeout( function() { $( "#save-bttn" ).tooltip('destroy') }, 3000 );
	});
    $( "#bttn-prod-info" ).mouseout(function() {
         setTimeout( function() { $( "#bttn-prod-info" ).tooltip('destroy') }, 3000 );
    });

    //// Rectangle draw, marking products
    ///////////////////////// 
    Move.mouseStillDown = false,
    Move.start_x = 0, Move.start_y = 0,
    Move.start_row = 1, Move.start_col = 1,
    Move.old_row = 0, Move.old_col = 0,
    //Move.last_row = 0, Move.last_col = 0,
    Move.move_products = {'start':false, 'move':false},
    Move.modal_action = false,
    Move.move_start_mouse_pos = [], // first mouse pos when start to move multiply products
    Move.mProdCountInRow = {};

    function drawRect(e, old_r, old_c) {        
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
        if (old_e.pageY - Move.start_y >= 0 && old_e.pageX - Move.start_x >= 0) 
        {
            Move.old_row = e.parentNode.rowIndex+1; Move.old_col = e.cellIndex+1;
            if ( (old_r != Move.old_row || old_c != Move.old_col) ) 
            {
                $('.temp-marked').remove();
                var rows = [Move.start_row, e.parentNode.rowIndex+1], cols = [Move.start_col, e.cellIndex+1];
                $( "#table2 tr:nth-child(n+"+Math.min(...rows)+"):nth-child(-n+"+Math.max(...rows)+") td:nth-child(n+"+Math.min(...cols)+"):nth-child(-n+"+Math.max(...cols)+")").append('<div class="temp-marked"></div>'); 
            }
        }
        // draw cube left up
        else if (old_e.pageY - Move.start_y < 0 && old_e.pageX - Move.start_x < 0) 
        {
            Move.old_row = e.parentNode.rowIndex+1; Move.old_col = e.cellIndex+1;
            if ( (old_r != Move.old_row || old_c != Move.old_col) ) 
            {
                $('.temp-marked').remove();
                var rows = [e.parentNode.rowIndex+1, Move.start_row], cols = [e.cellIndex+1, Move.start_col];
                $( "#table2 tr:nth-child(n+"+Math.min(...rows)+"):nth-child(-n+"+Math.max(...rows)+") td:nth-child(n+"+Math.min(...cols)+"):nth-child(-n+"+Math.max(...cols)+")").append('<div class="temp-marked"></div>'); 
            }
        }
        // draw cube left down
        else if (old_e.pageX - Move.start_x <= 0) 
        {
            Move.old_row = e.parentNode.rowIndex+1; Move.old_col = e.cellIndex+1;
            if ( (old_r != Move.old_row || old_c != Move.old_col) ) 
            {
                $('.temp-marked').remove();
                var rows = [Move.start_row, e.parentNode.rowIndex+1], cols = [e.cellIndex+1, Move.start_col];
                $( "#table2 tr:nth-child(n+"+Math.min(...rows)+"):nth-child(-n+"+Math.max(...rows)+") td:nth-child(n+"+Math.min(...cols)+"):nth-child(-n+"+Math.max(...cols)+")").append('<div class="temp-marked"></div>'); 
            }
        }
        // draw right up
        else if (old_e.pageY - Move.start_y <= 0) 
        {
            Move.old_row = e.parentNode.rowIndex+1; Move.old_col = e.cellIndex+1;
            if ( (old_r != Move.old_row || old_c != Move.old_col) ) 
            {
                $('.temp-marked').remove();
                var rows = [e.parentNode.rowIndex+1, Move.start_row], cols = [Move.start_col, e.cellIndex+1];
                $( "#table2 tr:nth-child(n+"+Math.min(...rows)+"):nth-child(-n+"+Math.max(...rows)+") td:nth-child(n+"+Math.min(...cols)+"):nth-child(-n+"+Math.max(...cols)+")").append('<div class="temp-marked"></div>'); 
            }
        }
    }

    Move.prevMovePosProduct = [];
    $("#table2").mousemove(function(e) { // move rect on mousemove over table2
        //console.log("After trigger "+(e.target.parentElement.rowIndex + 1)+' '+(e.target.cellIndex + 1));
        if(e.which == 1 && e.buttons > 0) {
            console.log('Mouse move '+Move.move_products['start']+ ' ' +Move.move_products['move']+'  which:'+e.which);
            console.log(markedProducts);
            if (Move.move_products['start'] && Move.move_products['move'] && Object.keys(markedProducts).length > 0) {
                console.log('te nav');
                //////////////////////////////////////////////////
                // MOVING ALREADY MARKED PRODUCTS!!
                //////////////////////////////////////////////////
                // unhighlight previous cells when moving products
                $('.marked').removeClass('marked');
                $('.td-marked').removeClass('td-marked');

                Move.prevMovePosProduct = [];

                // highligt cells on moving products
                for (var key in markedProducts) { 
                    if (markedProducts.hasOwnProperty(key)) {
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

                            var td_html = $( "#table2 tbody tr:nth-child("+row+") td:nth-child("+col+")");
                            // highlight product
                            if ( td_html.children()[0] !== undefined ) {
                                td_html.children().addClass('marked');
                            } 
                            else {
                                console.log('td_marked');
                                td_html.addClass('td-marked');
                            }
                            Move.prevMovePosProduct.push(td_html);   
                    }
                }
            }
            else if (Move.mouseStillDown) { // marking products
                Move.move_products['start'] = false;
                markedProducts = {};
                drawRect(e, Move.old_row, Move.old_col);
            }
        }
    });

    $("#table2").mousedown(function(e) {
        if(e.which == 1) {
            $('.temp-marked').remove();

            // update undo array on keydown and when there is no marked products.
            //console.log(loadedTiles);
            updateUndo();

            Move.mouseStillDown = true;
            Move.start_x = e.pageX, Move.start_y = e.pageY;
            if (!ctrlPressed) {
                Move.start_row = e.target.parentNode.rowIndex+1, Move.start_col = e.target.cellIndex+1;
            }
            else {
                $('.marked').removeClass('marked');
                markedProducts = {};
                Move.start_row = e.target.parentNode.parentNode.rowIndex+1, Move.start_col = e.target.parentNode.cellIndex+1;
            }
            if (!ctrlPressed) {
                // button pressed on now marked products
                if (e.target.className == 'blue marked' && Move.move_products['start']) {
                	console.log('Down1'+' '+Move.move_products['start']+' '+Move.move_products['move']);
                    Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
                    Move.start_col = e.target.parentNode.cellIndex+1;
                    // if marked products start to move and it starts from product div not empty cell
                    if (Move.move_products['start']) {
                        Move.move_products['move'] = true;
                    }
                }
                // if buton pressed on already moved marked products
                else if (e.target.className == 'blue marked' && !Move.move_products['start']) {
                	console.log('Down2'+' '+Move.move_products['start']+' '+Move.move_products['move']);
                    Move.move_products['start'] = true; Move.move_products['move'] = true;
                    Move.old_row = Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
                    Move.old_col = Move.start_col = e.target.parentNode.cellIndex+1;
                    // place it in marked cells not products
                    var curCell = e.target.parentNode;
                    // get cell in marked products
                    getMarkedProducts();
                }
                else if (e.target.className == 'blue') {
                	console.log('Down3'+' '+Move.move_products['start']+' '+Move.move_products['move']);
                	Move.move_products['start'] = true; Move.move_products['move'] = true;
                    Move.old_row = Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
                    Move.old_col = Move.start_col = e.target.parentNode.cellIndex+1;
                    // place it in marked cells not products
                    var curCell = e.target.parentNode;
                    // get cell in marked products
                    $('.marked').removeClass('marked');
                    getMarkedProducts();
                }
                else
                {
                	console.log('Down4'+' '+Move.move_products['start']+' '+Move.move_products['move']);
                    for (var i = Move.prevMovePosProduct.length - 1; i >= 0; i--) {
                        Move.prevMovePosProduct[i].children().removeClass('marked');
                    };
                    for (var key in markedProducts) {
                        if (markedProducts.hasOwnProperty(key)) {
                            $('[name="'+key+'"] div').removeClass('marked');
                        }
                    }
                    Move.start_row = e.target.parentNode.rowIndex+1, Move.start_col = e.target.cellIndex+1;
                    Move.move_products['start'] = false; Move.move_products['move'] = false;
                    markedProducts = {};
                }
            }
            console.log('Mouse down '+Move.move_products['start']);
            statusBar['marked']['count'] = $('.marked').length;
            $('#status div').html( statusBar['marked']['label']+': '+statusBar['marked']['count'] );
        }
    });

/*
============================================================
           ######### CONTEXT MENU #########
============================================================
*/
    document.getElementById('table2').oncontextmenu = function(e) {
        $('#marked-modal .modal-dialog').attr('style','left: '+(e.clientX)+'px; top: '+(e.clientY)+'px;');
        $('#marked-modal').modal('show');
        $(".modal-backdrop").remove();
        Move.start_x = e.pageX, Move.start_y = e.pageY;

        PBuffer.mousemove = e;
        return false;
    }
    // fix to pop up context menu when one already is shown
    $(document).on('mousedown', '#marked-modal', function(e) {
        if (e.which == 3) {
            console.log(e.target);
            $('#marked-modal').modal('hide');
        }
    });
/*
============================================================
           ######### CONTEXT MENU END #########
============================================================
*/
    /*$("body").mouseup(function(e) {
        if ($('.temp-marked')[0] !== undefined) { 
            $("body").trigger(e);
        }
    })*/
    $("body").mouseup(function(e) {
        if (e.which == 1) {

            // if some cells is marked
            if ($('.temp-marked')[0] !== undefined) {
                // delete marking drawing
                $('.temp-marked').remove();
                console.log(Move.start_row+" "+Move.old_row+" : "+Move.start_col+" "+ Move.old_col);
                // get products
                getMarkedProducts();
                statusBar['marked']['count'] = $('.marked').length;
                $('#status div').html( statusBar['marked']['label']+': '+statusBar['marked']['count'] );
                
            }
            if ( Object.keys(markedProducts).length > 0) {
                console.log('M up Move.move_products[start] ' +Move.move_products['start']);
                console.log('Modal action '+Move.modal_action);
                 // true if modal is not canceled
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
                            markedProducts[key].cEnd < historyEndCell /*|| markedProducts[key].cEnd > lastTdIndex*/) { 
                            //showError('Produkti neietilpst tabulā.');
                            is_valid = false;
                            $('#error-modal .modal-dialog').attr('style','left: '+(e.clientX-80)+'px; top: '+(e.clientY-10)+'px;');
                            $('#error-modal').modal('show');
                            
                            break;
                        }
                    }
                }
                // if copy than dont delete prev products. In case of cut and paste del proucts from prev place
                if (!e.notDelete || e.notDelete === undefined) 
                {
                    for (var key in markedProducts) {
                        if (markedProducts.hasOwnProperty(key)) {
                            var td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+")");
                            // if new products is not out of table bounds
                            if (is_valid) {
                                td_html.html('');
                            }
                        }
                    }
                }
                $('.td-marked').removeClass('td-marked');

                if ( is_valid ) 
                {
                    var prevRow = -1, td_html, darkCell = false, darkCounter = 0, 
                    freeShiftGroup = 0, rowLastCellIndex, last_i = -1;
                    for (var key in markedProducts) {
                        if (markedProducts.hasOwnProperty(key)) 
                        {
                            var i; 
                            darkCell = false;
                            // row's last td index
                            rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                            // new product place. place new products in cells
                            // if same row
                            if ( prevRow == markedProducts[key].rEnd ) 
                            {	
                                var endCell = $("#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+markedProducts[key].cEnd+")");
                                
                                if ( td_html[0].cellIndex + 1 < endCell[0].cellIndex + 1) {
                                    i = markedProducts[key].cEnd;
                                }
                            	// if cell starting or end position is in free shift
    	                        else if ( $("#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+")").hasClass('dark') || 
    	                        	endCell.hasClass('dark') ) 
    	                        {
    	                        	/* next placement cell is next from previous placed cell becouse this one is landed on free shift 
    	                        	and it should be in front of the previous placed cell
    	                        	*/
    	                            td_html = td_html.closest('td').next();
    	                            i = td_html[0].cellIndex+1;
                                    darkCell = true;
                                    darkCounter++;
    	                        }
    	                        else {
    	                            i = td_html[0].cellIndex + ((markedProducts[key].cEnd - td_html[0].cellIndex)) + darkCounter;
                                    // if the next cell is placed on the prev cell or behind that cell then next cell is previous + 1
                                    i = (last_i < i) ? i : td_html[0].cellIndex+2;
    	                        }
    	                    }
                            else {
                                i = markedProducts[key].cEnd;
                                darkCounter = ( $("#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+i+")").hasClass('dark') ) ? 1 : 0;
                            }

                            if (i >= rowLastCellIndex)  {
                                console.log('Expand11');
                                expandTable(machineCount, 7);
                                rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                                td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+i+")");
                            }

                            if ( !darkCell ) {
                                // if placement cell is out of borders then expand table to get the cell
                                if (i > rowLastCellIndex) {
                                    console.log('Expand2');
                                    expandTable(machineCount, 7);
                                    rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                                }
                                td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+i+")");
                            }

                            if (is_valid) {

                                // if product is landed on free day. then while loop on col till it gets to work shift
                                while (td_html.hasClass('dark'))
                                {
                                    i++;
                                    if (i >= rowLastCellIndex)  {
                                        console.log('Expand1');
                                        expandTable(machineCount, 7);
                                        rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                                    }
                                    td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+i+")");
                                }
       
                                prevRow = markedProducts[key].rEnd;
                                // id products goes further then showed table dates
                                var startIndex = i;

                                $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+") div").removeClass('marked');
                                var nextCell_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+")")[0].innerHTML;
                                // next cell  
                                var nextCell = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+")");

                                for (var i = startIndex; i <= rowLastCellIndex; i++) 
                                {
                                    // if next cell have no products then break
                                    if (nextCell_html == "" && !nextCell.hasClass('dark')) break; 

                                    if (i >= rowLastCellIndex) {
                                        console.log('Expand3');
                                        expandTable(machineCount, 7);
                                        rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                                    }
                                    // current cell in next cell innerHTML
                                    var currentCell = nextCell_html;
                                    // next cell
                                    nextCell = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+")");
                                    // next cell html
                                    $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+") div").removeClass('marked');
                                    nextCell_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+")")[0].innerHTML;
                                   
                                    // if cell is in free shift then while loop till it gets out of free shifts
                                    while (nextCell.hasClass('dark'))
                                    {
                                        i += 1;
                                        if (i >= rowLastCellIndex) {
                                            console.log('Expand4');
                                            expandTable(machineCount, 7);
                                            rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                                            //break;
                                        }
                                        nextCell = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+")");
                                        nextCell_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(i+1)+")")[0].innerHTML;
                                    }
                                    nextCell[0].innerHTML = currentCell;
                                    // give next replaced product the id of cell name
                                    nextCell.find('div').attr('id', nextCell.attr('name'));
                                };

                                last_i = i;
                                // make new row and column positon when product is placed
                                markedProducts[key].c = td_html[0].cellIndex + 1;
                                markedProducts[key].r = td_html[0].parentNode.rowIndex + 1;
                                // draw product
                                td_html.html( setProductDiv(td_html.attr('name'), markedProducts[key].product, true));

                            }
                        }
                    }

                    // get first hash key
                    for (var firstKey in markedProducts) { if ( markedProducts.hasOwnProperty(key) ) break; }

                    // new array for new td ids
                    var newProds = {};
                    // get new row and column position for marked products when they are released to be able to move them again
                    for (var key in markedProducts) {
                        if (markedProducts.hasOwnProperty(key)) {
                            newProds[$('#table2 tr:nth-child('+markedProducts[key].r+') td:nth-child('+markedProducts[key].c+')').attr('name')] = markedProducts[key];
                        }
                    }
                    markedProducts = newProds;
                }
                else {
                    // remove marked class from products 
                    $('.marked').removeClass('marked');
                    // old product place. remove all prev products
                    $('.td-marked').removeClass('td-marked');
                    // TODO: atkrasot sarkanos selus, kas rodas kad kustina produktus
                    for (var key in markedProducts) {
                        if (markedProducts.hasOwnProperty(key)) {
                            // mark products that was moved
                            $( "#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+") div").addClass('marked');
                            // reset cell end position to start position becouse there is out of table bounds error
                            markedProducts[key].rEnd = markedProducts[key].r;
                            markedProducts[key].cEnd = markedProducts[key].c;
                        }
                    }
                    //markedProducts = {};
                }
            }

            Move.mouseStillDown = false;
        }
    });

    $('#delete-marked-bttn').click(function() { 
        Move.modal_action = true;

        updateUndo();

        for (var key in markedProducts) {
            // if new marked cell not in old then unmark it
            if (markedProducts.hasOwnProperty(key)) 
            {
                $('[name="'+key+'"]')[0].innerHTML = "";
            }
        };
        markedProducts = {};
        Move.move_products['start'] = false; Move.move_products['move'] = false;
    });

    $('#marked-modal').on('hidden.bs.modal', function () {
        if (!Move.modal_action) {
            for (var key in markedProducts) {
                if (markedProducts.hasOwnProperty(key)) 
                {
                    if ($('[name="'+key+'"]')[0].innerHTML.trim() != '') {
                        $('[name="'+key+'"] div').removeClass('marked');
                    }
                }
            }
            if (!Move.move_products['start']) { 
                console.log('#marked-modal');
                markedProducts = {};
            }
        }
        Move.modal_action = false;
    });

    $('#move-marked-bttn').click(function(e) { 
        Move.modal_action = true; // true if modal is not canceled
        Move.move_products['start'] = true;
        Move.move_products['move'] = true;
    });

    $('#cut-marked-bttn').click(function(e) { 
        if (Object.keys(markedProducts).length > 0) {
            PBuffer.copy = {}
            PBuffer.cut = markedProducts;
            //Move.start_row = PBuffer.cornerY; Move.start_col = PBuffer.cornerX;
        }
    });
    $('#copy-marked-bttn').click(function(e) { 
        if (Object.keys(markedProducts).length > 0) {
            PBuffer.cut = {};
            PBuffer.copy = markedProducts;
            //Move.start_row = PBuffer.cornerY; Move.start_col = PBuffer.cornerX;
        }
    });
    $('#paste-marked-bttn').click(function(e) { 
    
        updateUndo();

        // get first hash key
        var clipBoard = ( Object.keys(PBuffer.cut).length > 0 ) ? PBuffer.cut : PBuffer.copy;
        for (var firstKey in clipBoard) { break; }
        // if clipboard not empty
        if (firstKey !== undefined) 
        {
            PBuffer.cornerY = clipBoard[firstKey].r;
            PBuffer.cornerX = clipBoard[firstKey].c;
            for (var key in clipBoard) {
                if (clipBoard.hasOwnProperty(key)) {
                    PBuffer.cornerY = ( PBuffer.cornerY > clipBoard[key].r  ) ? clipBoard[key].r : PBuffer.cornerY;
                    PBuffer.cornerX = ( PBuffer.cornerX > clipBoard[key].c  ) ? clipBoard[key].c : PBuffer.cornerX;
                }
            }

            Move.start_row = PBuffer.cornerY; Move.start_col = PBuffer.cornerX;
            // cut or paste 
            notDelete = ( Object.keys(PBuffer.cut).length > 0 ) ? false : true;

            // get copy or cut products from buffer, assign that to marked products
            markedProducts = ( Object.keys(PBuffer.cut).length > 0 ) ? PBuffer.cut : PBuffer.copy;
            Move.move_products['start'] = true;  Move.move_products['move'] = true;

            // simulate mouse move to get rEnd and cRow defined for markedProducts
            var $el = $("#table2 tbody tr:nth-child("+PBuffer.cornerY+") td:nth-child("+PBuffer.cornerX+")");
            var event = jQuery.Event( "mousemove", {
                target: PBuffer.mousemove.target,
                which: 1,
                buttons: 1
            });
            console.log("Before trigger "+(PBuffer.mousemove.target.parentElement.rowIndex + 1)+' '+(PBuffer.mousemove.target.cellIndex + 1));
            $el.trigger(event);

            Move.move_products['start'] = true;  Move.move_products['move'] = true;
            // trigger mousdown to place products
            var event = jQuery.Event( "mouseup", {
                target: PBuffer.mousemove.target,
                which: 1,
                clientX: PBuffer.mousemove.clientX,
                clientY: PBuffer.mousemove.clientY,
                notDelete: notDelete
            });
            $el.trigger(event);
        }
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
      hint: false,
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
                for (var i = 1; i <= machineCount; i++) 
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

                showError("Šāds '"+$('#product').val()+"' produkts neeksistē.", 'bttn-prod-info');
            }
        })
        .fail( function( data ) {
            showError("Nevar saglabāt datus.", 'save-bttn');
        });

    });
    /* ####################### END OF EVENTS #############################
        #################################################################
    */ 
});
})( jQuery );

function getMarkedProducts() {
    markedProducts = {};
    Move.mProdCountInRow = {};
    // get maximum and minimum values to be able to start the loop properly
    var maxR = Math.max(Move.start_row, Move.old_row), minR = Math.min(Move.start_row, Move.old_row), 
        maxC = Math.max(Move.start_col, Move.old_col), minC = Math.min(Move.start_col, Move.old_col);
    console.log('MinR: '+minR+', MinC: '+minC);

    var markedDivs = $( "#table2 tbody tr:nth-child(n+"+minR+"):nth-child(-n+"+maxR+") td:nth-child(n+"+minC+"):nth-child(-n+"+maxC+") div");
    var mdlen = markedDivs.length;

    if (mdlen > 0) { // checks if there is some marked product
        // get corner of marked place area. It's the min col and row combination. Paste from buffer will start there
        PBuffer.cornerY = markedDivs[0].parentNode.parentNode.rowIndex+1;
        PBuffer.cornerX = markedDivs[0].parentNode.cellIndex+1;
    }

    for (var i = 0; i < mdlen; i++)
    {
        markedDivs[i].className += ' marked';
        // update marked product count in row
        var row = markedDivs[i].parentNode.rowIndex+1;
        if (Move.mProdCountInRow[row] === undefined) 
            Move.mProdCountInRow[row] = [markedDivs[i].cellIndex+1];
        else
            Move.mProdCountInRow[row].push(markedDivs[i].cellIndex+1);

        markedProducts[markedDivs[i].id] = {'r': markedDivs[i].parentNode.parentNode.rowIndex+1, 
                                'c': markedDivs[i].parentNode.cellIndex+1,
                                'rEnd': markedDivs[i].parentNode.parentNode.rowIndex+1, 
                                'cEnd': markedDivs[i].parentNode.cellIndex+1,
                                'product': markedDivs[i].getAttribute('product')
                                };

        PBuffer.cornerY = ( PBuffer.cornerY > markedProducts[markedDivs[i].id].r  ) ? markedProducts[markedDivs[i].id].r : PBuffer.cornerY;
        PBuffer.cornerX = ( PBuffer.cornerX > markedProducts[markedDivs[i].id].c  ) ? markedProducts[markedDivs[i].id].c : PBuffer.cornerX;
    };
    console.log(markedProducts);
}

function shiftFromFreeDays() {
    // make a copy of marked products becouse new marked products will be modified
	markedProductsCopy = markedProducts;
    markedProducts = {};

    var allFreeDivs = $('.dark div');

    var fdlen = allFreeDivs.length;

    for (var i = 0; i < fdlen; i++)
    {
        markedProducts[allFreeDivs[i].id] = {'r': allFreeDivs[i].parentNode.parentNode.rowIndex+1, 
                                'c': allFreeDivs[i].parentNode.cellIndex+1,
                                'rEnd': allFreeDivs[i].parentNode.parentNode.rowIndex+1, 
                                'cEnd': allFreeDivs[i].parentNode.cellIndex+1,
                                'product': allFreeDivs[i].getAttribute('product')
                                };
    }
    // triger mouseup event to move products from free sifts
    Move.move_products = {'start':true, 'move':true};
    var event = jQuery.Event( "mouseup", {
        which: 1,
        buttons: 1,
        clientX: 500,
        clientY: 300
    });
    allFreeDivs.trigger(event);
    $('.marked').removeClass('marked');

    // get back markedProducts value
    markedProducts = markedProductsCopy;
}
// add leading zero function
function pad(n){return n<10 ? '0'+n : n;}

function drawTodaysSign (draw_time, draw_history) 
{
    var today = new Date();
    var whichShift = 0;
    var h = today.getHours();
    // fix a bug when, for example today is 2015/11/20  22:52, but 2015/11/21 first shift starts on 2015/11/20 22:00
    // so today in this time interval is already next day
    if ( h >= 22 && h <= 23 ) today.setDate(today.getDate() + 1);

    if ( (h >= 22 && h <= 23) || h <= 5) whichShift = 0;
    else if ( h >= 6 && h <= 13) whichShift = 1;
    else if ( h >= 14 && h <= 21) whichShift = 2;
    console.log(whichShift + " " +h);

    // mark today in the table
    var today_formated = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate());
    if ($('#'+today_formated+'H')[0] === undefined) {
        console.log('Nav datuma');
    }
    else {
        var date_cellIndex = $('#'+today_formated+'H')[0].cellIndex;
        var time_index = (date_cellIndex* 3 - 1) + whichShift;
        //console.log($('.table1-header .header-time td:nth-child('+(time_index)+')'))
        // iterate through currrent shift column in planning table
        for (var i = 1; i <= machineCount; i++) {
            $('#table2 tr:nth-child('+i+') td:nth-child('+(time_index-1)+')').addClass('today');
        };
        
        $('#table2 tr:nth-child('+machineCount+') td:nth-child('+(time_index-1)+')').attr('data-toggle', "tooltip");
        $('#table2 tr:nth-child('+machineCount+') td:nth-child('+(time_index-1)+')').attr('data-placement', "bottom");
        $('#table2 tr:nth-child('+machineCount+') td:nth-child('+(time_index-1)+')').attr('data-container', "#table2");
        $('#table2 tr:nth-child('+machineCount+') td:nth-child('+(time_index-1)+')').attr('title', "Š o b r ī d");
        $('[data-toggle="tooltip"]').tooltip({trigger: 'manual'}).tooltip('show'); 
    
        // fix to correct show todays tooltip when today is not first fenerated in #table2 seenable content
        setTimeout(function (){ 
            var arrowOffset = $('#table2 .tooltip-arrow').offset();
            var innerWidth = $('#table2 .tooltip-inner').width();
            $('#table2 .tooltip-arrow').css('left', '');
            $('#table2 .tooltip').offset({top: $('.tooltip').offset().top, left: arrowOffset.left - innerWidth/2});
        }, draw_time);
    }
    if ( draw_history ) drawHistoryDiv(today, whichShift);
}

function drawHistoryDiv (today, whichShift) {
    var disableButtons = false;
    if ( $(".today")[0] !== undefined ) {
        var todaysCol = $(".today")[0].cellIndex + 1;
        if ( todaysCol > 7 ) {
            var todaysPos =  $(".today").position().left - $("#table2").position().left - (70*3*7) + whichShift*70+ 2;
            $('#history-mark').css('height', $('#table2').css('height'));
            $('#history-mark').css('width', todaysPos);
            historyEndCell = $(".today")[0].cellIndex - $("#table2 tr:nth-child(1) td")[0].cellIndex - 3*7+1+whichShift;
            disableButtons = true;
        } 
        else {
            $('#history-mark').css('height', 0);
            $('#history-mark').css('width', 0);
            historyEndCell = 1;
        }
    } else {
        // there is not today in the plan
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var lastTDname = $('#table2 tr:nth-child(1) td').last().attr('name').split('/')[0].replace(/-/g, '/');
        var lastDate = new Date(lastTDname);
        var daysBetween = Math.round( (today.getTime() - lastDate.getTime()) / oneDay );

        if ( daysBetween > 0) {
            $('#history-mark').css('height', $('#table2').css('height'));
            var back = 7 - daysBetween;
            var endOffset = (70*3*back)+whichShift*70 + 2;
            $('#history-mark').css('width', $('#table2 tr:nth-child(1) td').last().position().left - endOffset);
            historyEndCell = $('#table2 tr:nth-child(1) td').last()[0].cellIndex - 3 * back + whichShift;
            disableButtons = true;
        }
        else {
            $('#history-mark').css('height', 0);
            $('#history-mark').css('width', 0);
            historyEndCell = 1;
        }
    }
    if ( disableButtons ) {
	    var rangeBttns = $( '.header-time td:nth-child(n+2):nth-child(-n+'+(historyEndCell-1)+') button' );
	    $.each( rangeBttns, function() {
	    	this.parentNode.parentNode.style.backgroundColor = "#EEE";
	    	// get a shift text and place it in td
	    	this.parentNode.parentNode.innerHTML = this.innerHTML.split(';')[1];
	    })
	}
}

function updateUndo () {
    console.log('update undo.');
    var h = $('.table1-header').html();
    var t = $('#table2').html();

    if ( undoProducts.length > 0 ) {
        // if last saved undo is not equal with this table, then update
        if ( undoProducts[undoProducts.length - 1]['table'] != t ) {
            if ( undoProducts.length > 19 ) {
                undoProducts.shift();
            }
            undoProducts.push( {'header': h, 'table': t, 'loadedTiles': JSON.parse(JSON.stringify(loadedTiles)) } );
        }
    } 
    else {
        if ( undoProducts.length > 19 ) {
                undoProducts.shift();
        }
        // JSON is needed to clone the loadedTitles value, becouse otherwise it's passed by ref and this line loses a meaning
        undoProducts.push( {'header': h, 'table': t, 'loadedTiles': JSON.parse(JSON.stringify(loadedTiles)) } );
    }
}

function showError(text, bttn_id) {
    $('#'+bttn_id).attr('title', text);
    $('#'+bttn_id).tooltip({trigger: 'manual', container: '#'+bttn_id}).tooltip('show');

    var arrowOffset = $('#'+bttn_id+' .tooltip-arrow').offset();
    var innerWidth = $('#'+bttn_id+' .tooltip-inner').width();
    // top remains the same, only left is changed
    $('#'+bttn_id+' .tooltip-inner').offset({top: $('#'+bttn_id+' .tooltip-inner').offset().top, left: arrowOffset.left-innerWidth / 2});
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
    var random_color= '#'+Math.floor(Math.random()*16777215).toString(16);
    // fix.. for sometimes it generates 5 char color string insteed of 6
    random_color = (random_color.length < 7) ? random_color + random_color[random_color.length -1] : random_color;
    if(productsColor[product] === undefined) {
        productsColor[product] = random_color;
    }
}

/* ### END OF COLOR FUNCTIONS ###
    ###########################
*/

function setProductDiv (name, product, marked) {
    cls = (marked) ? ' marked' : '';
    return '<div id="'+name+'" class="blue'+cls+'" product="'+product+'"'+ 
            'style="background-color:'+productsColor[product]+'; color:'+generateTextColor(productsColor[product])+'">'+product+'</div';
}


save = function () {
    // declare local variables
    //var JSONobjNew, JSONobjDel;
    var addedTiles = {}, deletedTiles = {}, newLoadedTiles = {};

    var allProducts = $( "#table2 tbody tr td div");
    $.each(allProducts, function(prod) {
    	if ( this.id in loadedTiles ) {
    		if ( loadedTiles[this.id] != this.getAttribute('product') ) {
    			addedTiles[this.id] = this.getAttribute('product');
    		}
    	} else {
    		addedTiles[this.id] = this.getAttribute('product');
    	}
    	newLoadedTiles[this.id] = this.getAttribute('product');
    })

    for (var key in loadedTiles) {
        if (loadedTiles.hasOwnProperty(key)) {
            console.log(key);
        	if ( document.getElementsByName(key)[0].innerHTML == "" ) {
				deletedTiles[key] = loadedTiles[key];
        	}	
        }
    }
    console.log('SAVE POST');
    console.log(addedTiles);
    console.log(deletedTiles);
    $.post( "php/save.php", {upsert: JSON.stringify(addedTiles), del: JSON.stringify(deletedTiles)})
    // when post is finished
    .done(function( data ) {
        console.log('psuccess');
        loadedTiles = newLoadedTiles;
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
