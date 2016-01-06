var tableLen = 10;
var tableHeaders =['22-06', '06-14', '14-22'];
var monthNamesShort = ['jan','feb','mar','apr','mai','jūn','jūl','aug','sep','okt','nov','dec'];
var machineCount = 0;
var historyEndCell = 1;

var loadedTiles = {}; // loaded products from DB

var markedMachines = {}; // marked machines where to place products
var markedShift = 0 // marked employee shift

var undoProducts = []; // used to undo last 10 placed products

var markedProducts = {};
var productsColor = {};

var Produce = {uniqueProducts: {}, table: {} }; 

var Move = {}; // namespace for marked products variable
var PBuffer = {cut: {}, copy: {}}; // namespace for buffer, that is, copy, paste, cut and stuff

// use: when post/get data then ajax gif loader shows
// scope the jQuery

( function($) {
    $(document).ajaxStop(function(ev){
        console.debug("ajaxStop");
        if (ev.currentTarget.activeElement.id != 'product') { 
            $("#ajax_loader img").hide();
            $("#ajax_loader").fadeOut( 200 );
        }
     });
})( jQuery );
/*
( function($) {
     $(document).ajaxStart(function(ev) {
        console.debug("ajaxStart");
        if (ev.currentTarget.activeElement.id != 'product') {
            $("#ajax_loader img").show();
            $("#ajax_loader").show();
        }
     });
})( jQuery );
*/
// scope the jQuery
( function($) {

$( document ).ready(function() 
{
    $('#successModal').draggable();

    var draggableDiv = $('#produceModal').draggable();
    $('#produceTable', draggableDiv).mousedown(function(ev) {
         draggableDiv.draggable('disable');
    }).mouseup(function(ev) {
         draggableDiv.draggable('enable');
    });

    var statusBar = {'marked': {'label': 'Iezīmēts', 'count': 0}};
    var tableView = getView(); 
    var activeChkBoxTime = {};
    var machineStartPoint = 0;

    // Button-checkbox
    /////////////////////////////////////
    function initBttnCheckbox(which) {

        if ( which == 0 || which == 1 )
        {
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
                $button.unbind('click').bind('click', function () {
                    $checkbox.prop('checked', !$checkbox.is(':checked'));
                    $checkbox.triggerHandler('change');
                    updateDisplay(true);
                });
                // Actions
                function updateDisplay(clicked) {
                    if ( clicked )
                    {
                        var isChecked = $checkbox.is(':checked');
                        
                        if ( activeChkBoxTime.btn === undefined ) {
                            activeChkBoxTime.btn = $button;
                            activeChkBoxTime.chkbox = $checkbox;
                        }
                        else {
                            // unmark last marked checkbox
                            activeChkBoxTime.btn.data('state', "off");
                            activeChkBoxTime.btn.find('.state-icon').removeClass().addClass('state-icon ' + settings['off'].icon);
                            activeChkBoxTime.btn.removeClass('btn-' + color + ' active').addClass('btn-default');
                            activeChkBoxTime.chkbox.prop('checked', false);
                            activeChkBoxTime.chkbox.triggerHandler('change');
                        }
                        // Set the button's state
                        $button.data('state', (isChecked) ? "on" : "off");

                        // Set the button's icon
                        $button.find('.state-icon').removeClass().addClass('state-icon ' + settings[$button.data('state')].icon);

                        markedShift = 0;
                        // Update the button's color
                        if (isChecked) {
                            $button.removeClass('btn-default').addClass('btn-' + color + ' active');
                            // get index of pressed bttn-chkbox cell
                            markedShift = $widget.parent().index();
                        }
                        activeChkBoxTime.btn = $button;
                        activeChkBoxTime.chkbox = $checkbox;
                    }
                    else 
                    {
                        $button.data('state', "off");
                        $button.find('.state-icon').removeClass().addClass('state-icon ' + settings[$button.data('state')].icon);
                        $button.removeClass('btn-' + color + ' active').addClass('btn-default');
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
        }
    
        if ( which == 0 || which == 2 )
        {
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

                        // get toggled bttn-checkbox number. It's machine number -- this was previous approach
                        // $button.context.getElementsByTagName('button')[0].childNodes[2].textContent;
                        // now get number by row index
                        var toggledChkBox = $button[0].parentElement.parentElement.parentElement.rowIndex+1;
                        console.log($button[0].parentElement.parentElement.parentElement.rowIndex+1);
                        // color row with this number
                        $( "#table2 tbody tr:nth-child("+toggledChkBox+") td").addClass('machine-row');
                        markedMachines[toggledChkBox] = true;
                        console.log(markedMachines);
                    }
                    else {
                        $button.removeClass('btn-' + color + ' active').addClass('btn-default');

                        if (clicked == true) {
                           // get toggled bttn-checkbox number. It's machine number
                           var toggledChkBox = $button[0].parentElement.parentElement.parentElement.rowIndex+1;
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
    }

    // End button-checkbox
    /////////////////////////////////////////////////////////
    $('.popupDatepicker').datepick({dateFormat: 'dd/mm/yyyy'});


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
                        '<button style="width:100%;" type="button" class="btn btn-xs" data-color="success">'+(i+1+machineStartPoint)+'</button>'+
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
        initBttnCheckbox(0);
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
        expandDate.setDate(expandDate.getDate() + 21);

        var expandDate_formated = expandDate.getFullYear()+'-'+pad((expandDate.getMonth()+1))+'-'+pad(expandDate.getDate());
        // get all dates for expanding table 
        var dates = getDates(new Date(lastDate), expandDate);
        // delete first array element becouse it's unnecessery
        dates.shift();
        var header_time_html = '';
        var header_day_html = '';

        initBttnCheckbox(1); // fix for bttn-checkbox
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
        initBttnCheckbox(1);

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

    function fillProducts(product, start, count, with_shifting) {
        if ( Object.keys(markedMachines).length < 1 ) {
            showNotification('Nav atzīmēta neviena mašīna.', 'danger');
            return;
        }
        if ( count > 50000 ) {
            showNotification('Kļūda! Maksimālais ievades daudzums ir 50000kg.', 'danger');
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
                var jsonData = JSON.parse(data)
                jsonCount = jsonData['shifts'];
                var notAllowedMachines = jsonData['notAllowedMachines'];
                console.log(notAllowedMachines);
                console.log(jsonCount);
                
                // check if product is not added on unallowed machines
                var wrongMachines = [];
                for (var i = 0; i < notAllowedMachines.length; i++) {
                    if ( notAllowedMachines[i] - machineStartPoint in markedMachines ){
                        wrongMachines.push(notAllowedMachines[i]);
                    }
                };
                if ( wrongMachines.length !== 0 )
                {   
                    $('#successModal .modal-content').removeClass('panel-danger').removeClass('panel-success').addClass('panel-danger');
                    $('#successModal .modal-title').html('Pievienošana liegta');
                    $('#successModal .modal-body p').html('Produkts nav atļauts pievienošanai uz mašīnām/as: <b>'+wrongMachines.join(', ')+'</b>');
                    $('#successModal').modal('show');
                    return;
                }

                uneditable_jsonCount = jsonCount;
                // row column length
                var column_count = document.getElementById('table2').rows[0].cells.length;
                var count_check = 0;
                var i = start;

                if ( !with_shifting ) 
                {
                    if ( jsonCount > 0) updateColor(product);
                    // if products can be filled in table
                    // iterate over columns
                    var last_td;
                    for (i = i; i <= column_count; i++) {
                        // for each marked machine in left header column
                        for (var key in markedMachines) {
                            // js lagging fix
                            if (markedMachines.hasOwnProperty(key)) {
                                // get cell
                                var td_html = $( "#table2 tbody tr:nth-child("+key+") td:nth-child("+i+")");
                                // if inner html in cell is empty
                                if (i >= column_count)  {
                                    console.log('Expand1');
                                    expandTable(machineCount, 7);
                                    column_count = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                                }
                                if ( td_html.hasClass('dark') ) {
                                    continue;
                                }

                                if ( td_html[0].innerHTML.trim() ==  "" ) {
                                    // put a product in cell
                                    td_html.html( setProductDiv(td_html.attr("name"), product, false, jsonData['kgPerShift'], 'false') );
                                    last_td = td_html;
                                    jsonCount--;
                                    usedShifts[i] = true;
                                    if ( firstPlacedIndex == -1 ) firstPlacedIndex = i;

                                } 
                            }
                            if (0 >= jsonCount) { // if all products placed 
                                td_html.html( setProductDiv(td_html.attr("name"), product, false, jsonData['kgLastShift'], 'false') );
                                break; 
                            } 
                        }
                        if (0 >= jsonCount) { 
                            td_html.html( setProductDiv(td_html.attr("name"), product, false, jsonData['kgLastShift'], 'false') );
                            break; 
                        }
                    };
                }
                // with shifting
                else
                {
                    var endFill = false,
                        tileCounter = 1,
                        start_i = 0,
                        start_shift = start,
                        td_div;
                        markedProducts = {};

                    firstPlacedIndex = start;

                    if ( jsonCount > 0 ) 
                    {
                        updateColor(product);

                        var allMachines = [];
                        for ( var mac in markedMachines )
                        {
                            allMachines.push(parseInt(mac));
                        }
                        allMachines.sort( function(a,b) { return a-b; } )

                        var rowLastCellIndex = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                        while ( true )
                        {
                            if (start_shift >= rowLastCellIndex)  {
                                console.log('Expand1-Produce');
                                expandTable(machineCount, 7);
                                rowLastCellIndex = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                            }

                            for (var i = start_i; i < allMachines.length; i++)
                            {
                                td_div = $( "#table2 tbody tr:nth-child("+allMachines[i]+") td:nth-child("+start_shift+") div");

                                if ( td_div[0] !== undefined )
                                    if ( td_div.attr('fixed') == 'true' ) 
                                        continue;

                                markedProducts[ allMachines[i]+'/'+start_shift ] = {
                                        'r': allMachines[i], 
                                        'c': start_shift,
                                        'rEnd': allMachines[i], 
                                        'cEnd': start_shift,
                                        'product': product,
                                        'kg': ( tileCounter == jsonCount) ? jsonData['kgLastShift'] : jsonData['kgPerShift']
                                        };
                                usedShifts[start_shift] = true;

                                if ( tileCounter == jsonCount ) {
                                    endFill = true;
                                    break;
                                }           
                                tileCounter++;
                            }
                            if ( endFill )
                                break;
                            start_i = 0;
                            start_shift++;
                        }
                        i = start_shift;

                        Move.start_row = allMachines[0]; 
                        Move.start_col = start;
                        var el = $('#table2 tbody tr:nth-child('+Move.start_row+') td:nth-child('+ Move.start_col +')');

                        // simulate mouse move to get rEnd and cRow defined for markedProducts
                        console.log(markedProducts);
                        triggeProductPlacement(el, el.find('div')[0], true, 300, 300, markedProducts);
                    }
                }

                // Preperation for message that is shown when products is added to plan.
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

                $('#successModal .modal-title').html('Kopsavilkums');
                $('#successModal .modal-content').removeClass('panel-danger').addClass('panel-success');
                $('#successModal .modal-body p').html('Pievienota/as <b>'+Object.keys(usedShifts).length+'</b> maiņa/as uz <b>'+Object.keys(markedMachines).length+'</b> mašīnas/ām ('+uneditable_jsonCount+' vienības)<br />');
                $('#successModal .modal-body p').append('<b>Sākums:</b> '+startDate_formated+'<br />');
                $('#successModal .modal-body p').append('<b>Beigas:</b> '+endDate_formated);
                $('#successModal').modal('show');
            }
            else 
            {
                showNotification("Nekorekts rezultāts.", 'danger');
            }

        })
        .fail( function( data ) {
            showNotification("Nevar pievienot produktu.", 'danger');
        });
    }

    function loadTable(startD, endD, is_async) {
        $.ajax({
              type: 'POST',
              url: "php/load.php",
              data: {startDate: startD, endDate: endD, view: tableView},
              success: function( data ) {
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
                            var td_cell = $('[name="'+td_name+'"]');
                            td_cell.html(setProductDiv(td_name, plan.product, false, plan.kg, plan.fixed_position.toString()));
                            if ( plan.fixed_position.toString() == 'true' ) {
                                td_cell.addClass('dark');
                                td_cell.addClass('fixed-pos');
                            }
                            // add objects to loadedTiles
                            loadedTiles[td_name] = {product: plan.product, kg: plan.kg, fixed: plan.fixed_position.toString()};
                        });
                    }
                }
                shiftFromFreeDays();
            },
              async:is_async
        });
    }

    function getView()
    {
        var view = getURLParameter('view');
        if ( view !== null) {
            if ( !(view == '1' || view == '2') ){
                view = '1';
            }
        }
        else {
            view = '1';
        }
        return view;
    }

    function getMachineCountAndStartPoint()
    {
        $.ajax({
              type: 'POST',
              url: "php/machine_count.php",
              data: {view: tableView},
              success: function( data ) {
                if ( data != '' )
                {
                    jsonCount = jQuery.parseJSON(data);
                    machineCount = parseInt(jsonCount['count']);
                    machineStartPoint = parseInt(jsonCount['viewStart']);
                }
            },
              async:false
        });
    }
    // Init actions on first start
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 21);
    var endDate_formated = endDate.getFullYear()+'/'+(endDate.getMonth()+1)+'/'+endDate.getDate();

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    var startDate_formated = startDate.getFullYear()+'/'+(startDate.getMonth()+1)+'/'+startDate.getDate();

    getMachineCountAndStartPoint();
    drawTable(startDate_formated, endDate_formated);
    loadTable(startDate_formated, endDate_formated, true);

    /* ################################################
    ###################### EVENTS #######################
    */

    $('#gen-table-bttn').click(function() { 
        var startDate = $('[name="start"]').val();
        var endDate = $('[name="end"]').val();
        // format to: mm/dd/yyyy input: dd/mm/yyyy
        startDate = startDate.split('/')[1]+'/'+startDate.split('/')[0]+'/'+startDate.split('/')[2];
        endDate = endDate.split('/')[1]+'/'+endDate.split('/')[0]+'/'+endDate.split('/')[2];

        var sd = new Date(startDate), ed = new Date(endDate);
        // if start date is less or equal to end date the draw table
        if (sd <= ed) {
            $('[data-toggle="tooltip"]').tooltip('destroy');
            markedMachines = {};
            markedShift = 0;
            markedProducts = {};
            loadedTiles = {};

            // get postgre time format
            startDate = startDate.split('/')[2]+'-'+startDate.split('/')[0]+'-'+startDate.split('/')[1];
            endDate = endDate.split('/')[2]+'-'+endDate.split('/')[0]+'-'+endDate.split('/')[1];

            drawTable(startDate, endDate);
            console.log('Start loading table...');
            loadTable(startDate, endDate, true);
            console.log('Finished loading!');

            var start_date_formated = sd.getDate()+'.'+monthNamesShort[sd.getMonth()]+'. '+sd.getFullYear();
            var end_date_formated = ed.getDate()+'.'+monthNamesShort[ed.getMonth()]+'. '+ed.getFullYear();
            $('.page-date-header').html(start_date_formated+' - '+end_date_formated);
        }
        else {
            showNotification('Nav korekti ievadīts datums.', 'danger');
        }
    });


    $('#gen-prod-bttn').click(function() { 
        var p = $('#product').val();
        var q = $('#quantity').val();
        if ( markedShift < 1 ) {
        	showNotification("Nav atzīmēta starta maiņa!", 'danger');
        	return;
        }
        fillProducts(p, markedShift, q, false);
    });

    $('#gen-prod-shift-bttn').click(function() { 
        var p = $('#product').val();
        var q = $('#quantity').val();
        if ( markedShift < 1 ) {
            showNotification("Nav atzīmēta starta maiņa!", 'danger');
            return;
        }
        fillProducts(p, markedShift, q, true);
    });

    $('#undo-gen-prod-bttn').click(function() { 
        Move.move_products['start'] = false; Move.move_products['move'] = false;

        if ( undoProducts.length > 0 ) {
            //initBttnCheckbox(0); // unpressable bttn fix
            markedShift = 0;

            var undoHTML = undoProducts.pop();
            $('.table1-header').html(undoHTML['header']);
            $('#table2').html(undoHTML['table']);
            loadedTiles = undoHTML['loadedTiles'];
            markedProducts = undoHTML['marked'];

            $('.button-checkbox-time').each(function () {
            	$(this).find('button').attr('class', 'btn btn-xs btn-default');
            	$(this).find('i').attr('class', 'state-icon glyphicon glyphicon-unchecked');
            })

            drawTodaysSign(0, true);
            initBttnCheckbox(1);
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

    $( "#production-bttn" ).click( function() {
        $('#produceModal').modal('show');
    })

    $( "#gen-prod-bttn" ).mouseout(function() {
        setTimeout( function() { $( "#gen-prod-bttn" ).tooltip('destroy') }, 3000 );
	});
    $( "#add-group-btn" ).mouseout(function() {
        setTimeout( function() { $( "#add-group-btn" ).tooltip('destroy') }, 3000 );
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
    $( "#interval-bttn" ).mouseout(function() {
         setTimeout( function() { $( "#interval-bttn" ).tooltip('destroy') }, 3000 );
    });

    $( "#interval-bttn" ).click( function() {
        var startDate = $('[name="produceStart"]').val();
        var endDate = $('[name="produceEnd"]').val();
        // format to: mm/dd/yyyy input: dd/mm/yyyy
        startDate = startDate.split('/')[1]+'/'+startDate.split('/')[0]+'/'+startDate.split('/')[2];
        endDate = endDate.split('/')[1]+'/'+endDate.split('/')[0]+'/'+endDate.split('/')[2];

        var sd = new Date(startDate), ed = new Date(endDate);
        // if start date is less or equal to end date the draw table
        if (sd <= ed) 
        {
            // get postgre time format
            startDate = startDate.split('/')[2]+'-'+startDate.split('/')[0]+'-'+startDate.split('/')[1];
            endDate = endDate.split('/')[2]+'-'+endDate.split('/')[0]+'-'+endDate.split('/')[1];
            var nextShift = 1;

            // if today is equal with intervals start day
            if ( formatDate(new Date()) == formatDate(new Date(startDate)) ) 
            {
                var todayDate = new Date();
                var today_h = todayDate.getHours();
                nextShift = getShiftNumber(today_h, true);
                if ( nextShift == 0 ) todayDate.setDate(todayDate.getDate() + 1);
                nextShift = ( nextShift == 0) ? 1 : nextShift+1;
                startDate = formatDate(todayDate);
            }

            var startDateIndex = ( $( '#'+startDate+'H')[0].cellIndex-1 ) * 3 + nextShift;
            console.log(startDateIndex, nextShift, startDate, today_h);
            var endDateIndex = $( '#'+endDate+'H')[0].cellIndex * 3;
            console.log("#table2 tbody tr:nth-child(n+1):nth-child(-n+"+machineCount+") td:nth-child(n+"+startDateIndex+"):nth-child(-n+"+endDateIndex+") div");
            
            // get all products that ar in range of selected interval
            var intervalProducts = $( "#table2 tbody tr:nth-child(n+1):nth-child(-n+"+machineCount+") td:nth-child(n+"+startDateIndex+"):nth-child(-n+"+endDateIndex+") div");
            Produce.uniqueProducts = {};
            console.log( intervalProducts.length );

            $.each( intervalProducts, function() 
            {
                Produce.uniqueProducts[this.innerHTML] = {count: 0, kg: 0, lastCol: 0, machines: {}, shifts: {}};
            })
            console.log( Produce.uniqueProducts);

            var td_cell;
            for ( var col = startDateIndex; col <= endDateIndex; col++ )
            {
                for ( var row = 1; row <= machineCount; row++ )
                {
                    td = $('#table2 tr:nth-child('+row+') td:nth-child('+col+') div');
                    if ( td[0] !== undefined  ) {
                        Produce.uniqueProducts[ td.attr('product') ].count += 1;
                        Produce.uniqueProducts[ td.attr('product') ].kg += parseFloat( td.attr('kg') );

                        if ( Produce.uniqueProducts[ td.attr('product') ].fixed !== undefined ) 
                        {
                            if ( Produce.uniqueProducts[ td.attr('product') ].fixed != td.attr('fixed') && Produce.uniqueProducts[ td.attr('product') ].fixed != 'mid') {
                                Produce.uniqueProducts[ td.attr('product') ].fixed = 'mid';
                            }
                            else if ( Produce.uniqueProducts[ td.attr('product') ].fixed != 'mid' )
                            {
                                Produce.uniqueProducts[ td.attr('product') ].fixed = td.attr('fixed');
                            }
                        }
                        else
                        {
                            Produce.uniqueProducts[ td.attr('product') ].fixed = td.attr('fixed');
                        }

                        if ( Produce.uniqueProducts[ td.attr('product') ].shifts[col] !== undefined )
                        {
                            Produce.uniqueProducts[ td.attr('product') ].shifts[col].push(row);
                        }
                        else 
                        {
                            Produce.uniqueProducts[ td.attr('product') ].shifts[col] = [row];
                        }

                        Produce.uniqueProducts[ td.attr('product') ].machines[row] = true;

                        if ( Produce.uniqueProducts[ td.attr('product') ].lastCol < col )
                            Produce.uniqueProducts[ td.attr('product') ].lastCol = col

                        if ( Produce.uniqueProducts[ td.attr('product') ].firstCol !== undefined ) 
                        {
                            if ( Produce.uniqueProducts[ td.attr('product') ].firstCol > col )
                                Produce.uniqueProducts[ td.attr('product') ].firstCol = col
                        }
                        else 
                        {
                            Produce.uniqueProducts[ td.attr('product') ].firstCol = col;
                        }
                    }   
                };
            };

            // delete products form table set that don't end in the interval
            // iterate through last interval column
            var endCellIndex = $('#table2 tr:nth-child(1) td').last()[0].cellIndex+1;
            
            var lastNextColProds = $( "#table2 tbody tr:nth-child(n+1):nth-child(-n+"+machineCount+") td:nth-child("+(endDateIndex + 1)+") div");
            var lastNextColProducts = {};
            // make set of products, so there is only unique product names
            $.each( lastNextColProds, function(i, item) {
                lastNextColProducts[item.innerHTML] = true;
            });

            var lastColProds = $( "#table2 tbody tr:nth-child(n+1):nth-child(-n+"+machineCount+") td:nth-child("+endDateIndex+") div");
            var lastColProducts = {};
            // make set of products, so there is only unique product names
            $.each( lastColProds, function(i, item) {
                lastColProducts[item.innerHTML] = true;
            });

            for ( var row = 1; row <= machineCount; row++ ) 
            {
                td = $('#table2 tr:nth-child('+row+') td:nth-child('+endDateIndex+')');
                td_product = $(td).find('div');
                td_next = $(td).next();

                // if cell have product
                if ( td_product[0] !== undefined  ) 
                {
                    // if the same product is in the next column somewhere
                    if ( td_product[0].innerHTML in lastNextColProducts ) 
                    {
                        delete Produce.uniqueProducts[ td_product[0].innerHTML ];
                    }
                    else 
                    {
                        // if next cell is over table end boundries
                        if ( td_next[0] === undefined )
                        {
                            delete Produce.uniqueProducts[ td_product[0].innerHTML ];
                        }
                    }
                }
            };
            // check for every product that is in next col over interval last col
            // if that product is not in the interval of the last col then delete it from the list
            for (var key in lastNextColProducts) { 
                if ( lastNextColProducts.hasOwnProperty(key) )
                {
                    if ( !key in lastColProducts ) {
                        delete Produce.uniqueProducts[ key ];
                    }
                }
            }
            console.log( Produce.uniqueProducts);

            var produceTable_html = '';
            Produce.table = {};
            for (var key in Produce.uniqueProducts) {
                // js lagging fix
                if (Produce.uniqueProducts.hasOwnProperty(key)) {
                    produceTable_html += '<tr>';
                    produceTable_html += '<td><div class="checkbox"><label><label class="checkbox-inline">'+
                          '<input type="checkbox" id="checkbox'+key+'" value="option1" unchecked>'+
                        '</label></label></div></td>';
                    produceTable_html += '<td>'+key+'</td><td contenteditable="true">'+Produce.uniqueProducts[key].kg.toFixed(2)+'</td>';
                    produceTable_html += '<td><button type="button" class="btn btn-success" id="produce-change-bttn">Izmainīt</button></td>';
                    produceTable_html += '</tr>';
                    Produce.table[key] = {kg: Produce.uniqueProducts[key].kg.toFixed(2), fixed: Produce.uniqueProducts[key].fixed};   
                    
                }
            }
            if ( produceTable_html == '' ) {
                $('#produceTable tbody').html('<p>Nav produktu dotājā intervālā.</p>')
            }
            else {
                $('#produceTable tbody').html(produceTable_html);
            }

            for (var key in Produce.uniqueProducts) {
                if (Produce.uniqueProducts.hasOwnProperty(key)) 
                {
                    // mark checkboxes with tri-state
                    if ( Produce.uniqueProducts[key].fixed == 'true' ) {
                        $('#checkbox'+key).prop('checked', true);
                    }
                    else if ( Produce.uniqueProducts[key].fixed == 'mid' ) {
                        $('#checkbox'+key)[0].indeterminate = true;
                    }
                    else {
                        $('#checkbox'+key).prop('checked', false);
                    }
                }
            }
        }
        else 
        {
            showNotification('Nav korekti ievadīts datums.', 'danger');
        }
    })

    $( "#produceModal" ).on('click', '#produce-change-bttn', function(e) {
        var changedProducts = [];
        var curRow = $("#produceTable tbody tr:nth-child("+e.target.parentNode.parentNode.rowIndex+")");
        var keyProduct = curRow.find('td:nth-child(2)')[0].innerHTML;
 
        // if table before closing is not the same as it  was opened. some products value are changed. Or the fixed state checkbox is changed
        if ( Produce.table[ keyProduct ].kg != curRow.find('td:nth-child(3)')[0].innerHTML || Produce.table[ keyProduct ].fixed != curRow.find('td:nth-child(1) input').is(':checked') )
        {
            changedProducts.push( {startKg: Produce.table[ keyProduct ],
                                    endKg: curRow.find('td:nth-child(3)')[0].innerHTML,
                                    fixed: curRow.find('td:nth-child(1) input').is(':checked')
                                })
        }

        // the length either will be 0 or 1. So if this statement is true, then we can access changeProducts by index '0'.
        if ( changedProducts.length > 0 ) 
        {
            $.ajax({
                type: 'POST',
                url: "php/products_formula.php",
                data: {kg: Math.round(parseFloat(changedProducts[0].endKg)), prod: keyProduct},
                success: function( data ) { 
                    var jsonCount = 0;
                    var usedShifts = {}; // set of columns where products is landed;
                    var firstPlacedIndex = -1;
                    var isAnyMachine = true;
                    console.log(data);

                    if (data != '') 
                    {
                        updateUndo();
                        console.log(JSON.parse(data));
                        jsonData = JSON.parse(data)
                        jsonCount = jsonData['shifts'];
                        var notAllowedMachines = jsonData['notAllowedMachines'];
                        console.log(jsonCount);
                        //return;
                        uneditable_jsonCount = jsonCount;
                        var newKey,
                            firstMac,
                            tileCounter = 1,
                            endFill = false,
                            last_i = 0,
                            last_shift = 0,
                            unplacedProducts = [],
                            td_div,
                            is_fixed = ( changedProducts[0].fixed ) ? 'true':'false';
                        markedProducts = {};

                        //  delete product divs from table
                        var td_cell_blabla;
                        for ( var shift in Produce.uniqueProducts[keyProduct].shifts ) 
                        {
                            if ( Produce.uniqueProducts[keyProduct].shifts.hasOwnProperty(shift) ) 
                            {
                                var machineRows = Produce.uniqueProducts[keyProduct].shifts[shift];
                                for (var i = 0; i < machineRows.length; i++) 
                                {      
                                    td_cell_blabla = $('#table2 tbody tr:nth-child('+machineRows[i]+') td:nth-child('+ shift +')');
                                    td_cell_blabla[0].innerHTML = '';
                                    td_cell_blabla.removeClass('dark');
                                    td_cell_blabla.removeClass('fixed-pos');
                                }
                            }
                        }
                        var machineRows = Object.keys( Produce.uniqueProducts[keyProduct].machines );
                        var machLen = machineRows.length;
                        var testEmptyCell;
                        for ( var shift in Produce.uniqueProducts[keyProduct].shifts ) 
                        {   
                            firstMac = ( firstMac === undefined ) ? shift : firstMac;
                            if ( Produce.uniqueProducts[keyProduct].shifts.hasOwnProperty(shift) ) 
                            {
                                
                                if ( jsonCount == 0 ) 
                                { 
                                    last_i = machineRows[0];
                                    last_shift = shift;
                                    endFill = true;
                                }

                                for (var i = 0; i < machLen; i++) 
                                {      
                                    testEmptyCell = $( "#table2 tbody tr:nth-child("+machineRows[i]+") td:nth-child("+shift+")");
                                    if ( testEmptyCell[0] !== undefined && testEmptyCell.find('div')[0] === undefined ) 
                                    {
                                        newKey = machineRows[i]+'/'+shift;
                                        // end fill is true if kg is given less then the original
                                        if ( !endFill ) 
                                        {
                                            markedProducts[newKey] = {'r': parseInt(machineRows[i]), 
                                                    'c': shift,
                                                    'rEnd': parseInt(machineRows[i]), 
                                                    'cEnd': shift,
                                                    'product': keyProduct,
                                                    'kg': ( tileCounter == jsonCount) ? jsonData['kgLastShift'] : jsonData['kgPerShift'],
                                                    'fixed': is_fixed
                                                    }; 
                                            last_shift = shift;
                                            last_i = machineRows[i];
                                        }
                                        else  {
                                            unplacedProducts.push( [parseInt(machineRows[i]), parseInt(shift)] );
                                        }

                                        if ( tileCounter == jsonCount ) {
                                            last_i = machineRows[i];
                                            last_shift = shift;
                                            endFill = true;
                                        }           
                                        tileCounter++;
                                    }
                                }
                            }
                        }

                        // if kg is set bigger then original kg
                        if ( !endFill ) 
                        {
                            var allMachines = [];
                            var beforeFirstRow = 0;

                            // get column - 1 of the products firstCol to get some row to continue that not in firstCol
                            var colBeforeStart = $("#table2 tbody tr:nth-child(n+1):nth-child(-n+"+machineCount+") td:nth-child("+(Produce.uniqueProducts[keyProduct].firstCol-1)+") div")
                            $.each( colBeforeStart, function() 
                            {
                                // check if products is the same
                                if ( this.innerHTML == keyProduct )
                                {
                                    beforeFirstRow = this.parentElement.parentElement.rowIndex + 1;
                                    if ( !(beforeFirstRow in Produce.uniqueProducts[keyProduct].machines) )
                                    {
                                        allMachines.push(beforeFirstRow);
                                    }
                                }
                            })

                            // get all machines
                            for ( var mac in Produce.uniqueProducts[keyProduct].machines )
                            {   
                                // push to all machines if it is not unallowed machine
                                if ( $.inArray(parseInt(mac), notAllowedMachines) == -1 )
                                {
                                    allMachines.push(parseInt(mac));
                                }
                            }
                            allMachines.sort( function(a,b) { return a-b; } );
                            if ( allMachines.length == 0 )
                            {
                                isAnyMachine = false;
                                $('#successModal .modal-content').removeClass('panel-danger').removeClass('panel-success').addClass('panel-danger');
                                $('#successModal .modal-title').html('Papildināšana liegta');
                                $('#successModal .modal-body p').html('Produktam nav pieejama neviena mašīna.');
                                $('#successModal').modal('show');
                            }

                            // if product kg is changed to bigger
                            last_i = parseInt(last_i);
                            var start_i = ( allMachines[ allMachines.indexOf( last_i )+1] !== undefined ) ? allMachines.indexOf( last_i )+1 : 0;
                            if ( $.inArray(last_i, notAllowedMachines) > -1 && $.inArray(last_i, allMachines) == -1 )
                            {
                                for (var m = 0; m < allMachines.length; m++) {
                                    if ( allMachines[m]  > last_i) {
                                        start_i = m;
                                        break;
                                    }
                                };
                            }
                            if ( start_i == 0 ) last_shift++;

                            var rowLastCellIndex = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                            while ( isAnyMachine )
                            {
                                if (last_shift >= rowLastCellIndex)  {
                                    console.log('Expand1-Produce');
                                    expandTable(machineCount, 7);
                                    rowLastCellIndex = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                                }
                                for (var i = start_i; i < allMachines.length; i++)
                                {
                                    td_div = $( "#table2 tbody tr:nth-child("+allMachines[i]+") td:nth-child("+last_shift+") div");

                                    if ( td_div[0] !== undefined )
                                        if ( td_div.attr('fixed') == 'true' ) 
                                            continue;

                                    markedProducts[ allMachines[i]+'/'+last_shift ] = {'r': allMachines[i], 
                                            'c': last_shift,
                                            'rEnd': allMachines[i], 
                                            'cEnd': last_shift,
                                            'product': keyProduct,
                                            'kg': ( tileCounter == jsonCount) ? jsonData['kgLastShift'] : jsonData['kgPerShift'],
                                            'fixed': is_fixed
                                            };
                                    if ( tileCounter == jsonCount ) {
                                        endFill = true;
                                        break;
                                    }           
                                    tileCounter++;

                                }
                                start_i = 0;
                                last_shift++;

                                if ( endFill )
                                    break;
                            }
                        }
                        else 
                        {
                            // get endppoints to where to pull backwards
                            if ( jsonCount < Produce.uniqueProducts[keyProduct].count )
                            {
                                console.log('Smaller');
                                var endPoints = {};
                                for (var i = unplacedProducts.length - 1; i >= 0; i--)
                                {
                                    if ( endPoints[ unplacedProducts[i][0] ] !== undefined )
                                    {
                                        if ( unplacedProducts[i][1] < endPoints[ unplacedProducts[i][0] ].col )
                                            endPoints[ unplacedProducts[i][0] ].col = unplacedProducts[i][1];
                                    }
                                    else
                                    {
                                        endPoints[ unplacedProducts[i][0] ] = {col: unplacedProducts[i][1], move: false};
                                        // check if in the next tile there is a product, that meen line should be moved backwards.
                                        var c = unplacedProducts[i][1] + 1;
                                        var nextCell = $( "#table2 tbody tr:nth-child("+unplacedProducts[i][0]+") td:nth-child("+c+")" );
                                        // skip the free shifts... get over free shifts
                                        while ( nextCell.hasClass('dark') ) {
                                            nextCell = $( "#table2 tbody tr:nth-child("+unplacedProducts[i][0]+") td:nth-child("+c+")" );
                                            c++;
                                        }
                                       
                                        if ( nextCell[0].innerHTML != "" )
                                        {
                                            endPoints[ unplacedProducts[i][0] ].move = true;
                                        }
                                    }
                                    
                                };
                                console.log(endPoints);

                                // pull front backward's to endpoint
                                moveBackwards( endPoints ) ;
                                
                            }
                            else
                            {
                                console.log('same');
                            }
                            console.log(unplacedProducts);
                        }

                        Move.start_col = firstMac; 
                        Move.start_row = Produce.uniqueProducts[keyProduct].shifts[firstMac][0];
                        var el = $('#table2 tbody tr:nth-child('+Move.start_row+') td:nth-child('+ Move.start_col +')');

                        // simulate mouse move to get rEnd and cRow defined for markedProducts
                        triggeProductPlacement(el, el.find('div')[0], true, 300, 300, markedProducts);
                    }
                    else
                    {
                        showNotification("Nekorekts rezultāts.", 'danger');
                    }
                },
                async: false
            })
            Produce.table[ keyProduct ] = {kg: curRow.find('td:nth-child(3)')[0].innerHTML, fixed: curRow.find('td:nth-child(1) input').is(':checked').toString()};
            showNotification('\'<strong>'+keyProduct+'</strong>\' izmaiņas pabeigtas.', 'success');
        }
        else {
            showNotification('Bez izmaiņām.', 'success');
        }
        console.log(changedProducts);
    })

    function triggeProductPlacement(el, trgt, not_del ,cx, cy, markedP)
    {
        // glitch fix when this function starts and i dunno why but markedProducts sudenlly is empty, so i pass it like argument
        if ( markedP !== undefined ) markedProducts = markedP;

        Move.move_products['start'] = true;  Move.move_products['move'] = true;
        var event = jQuery.Event( "mousemove", {
            target: trgt,
            which: 1,
            buttons: 1
        });
        el.trigger(event);

        Move.move_products['start'] = true;  Move.move_products['move'] = true;
        // trigger mousdown to place products
        var event = jQuery.Event( "mouseup", {
            target: trgt,
            which: 1,
            clientX: cx,
            clientY: cy,
            notDelete: not_del
        });
        el.trigger(event);
    }

    function moveBackwards( endPoints )
    {
        var nextCell,
            endCell,
            lastCell = $( "#table2 tbody tr:nth-child(2) td" ).last()[0].cellIndex+1;

        for ( var end_point in endPoints )
        {
            if ( endPoints.hasOwnProperty(end_point) )
            {
                var start_col = endPoints[end_point].col,
                    end_col = endPoints[end_point].col,
                    tableEnd = false,
                    setterCell;
                    expanded = 0;
                if ( endPoints[end_point].move )
                {
                    nextCell = $( "#table2 tbody tr:nth-child("+end_point+") td:nth-child("+start_col+")" );
                    while ( true )
                    {
                        while ( nextCell.hasClass('dark') || nextCell[0].innerHTML == "" ) {
                            start_col++;
                            if ( start_col > lastCell) {
                                tableEnd = true;
                                break;
                            }
                            nextCell = $( "#table2 tbody tr:nth-child("+end_point+") td:nth-child("+start_col+")" );
                        }

                        setterCell = $( "#table2 tbody tr:nth-child("+end_point+") td:nth-child("+end_col+")" );
                        // change the products id to cell's name attr.. it should be the same.
                        setterCell[0].innerHTML = nextCell[0].innerHTML;
                        if ( setterCell.find('div')[0] !== undefined )
                        {
                            setterCell.find('div').attr('id', setterCell.attr('name'));
                        }

                        nextCell[0].innerHTML = '';

                        // get next end point
                        endCell = $( "#table2 tbody tr:nth-child("+end_point+") td:nth-child("+end_col+")" );
                        while ( endCell.hasClass('dark') || endCell[0].innerHTML != "" ) {
                            end_col++;
                            if ( end_col > lastCell) {
                                tableEnd = true;
                                break;
                            }
                            endCell = $( "#table2 tbody tr:nth-child("+end_point+") td:nth-child("+end_col+")" );
                        }

                        if ( tableEnd ) break;
                    }
                }
            }
        }
    }

    $('#produceModal').on('shown.bs.modal', function() {
        $('#produceTable tbody').html('');
        var today = new Date();
        var today_formated = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate());
        var maxD, minD, today_td = $('#'+today_formated+'H');

        // if there is no unchangable products in the plan
        if ( $('.history').length == 0 ) {
            minD = $('.day-td').first()[0].id.slice(0, -1);
            maxD = $('.day-td').last()[0].id.slice(0, -1);
        }
        else {
            if ( $('.day-td').length == parseInt($('.history').length/3) ) {
                maxD = '0-0-0';  minD = '0-0-0';
                console.log('disableAll interval');
            }
            else 
            {   
                var temphist = historyEndCell;
                var startInterval = parseInt(temphist/3)+2;
                minD = $('.header-day td:nth-child('+startInterval+')')[0].id.slice(0, -1);
                maxD = $('.day-td').last()[0].id.slice(0, -1);
            }
        }
        // if there is  today in the showed plan then set the min date to it
        if ( today_td[0] !== undefined ) {
            minD = today_td[0].id.slice(0, -1);
        }

        $( '.popupDatepickerProduce').datepick( "destroy" );
        $('.popupDatepickerProduce').datepick({minDate: new Date(minD), maxDate: new Date(maxD), dateFormat: 'dd/mm/yyyy'});
        
        // set values of date inputs in modal open
        if ( $('[name="produceStart"]').val() == '' )
        {   
            var startDate = minD.split('-')[2]+'/'+minD.split('-')[1]+'/'+minD.split('-')[0];
            var endDate = maxD.split('-')[2]+'/'+maxD.split('-')[1]+'/'+maxD.split('-')[0];
            $('[name="produceStart"]').val(startDate);
            $('[name="produceEnd"]').val(endDate);
        }
    })

    
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
                    getMarkedProducts(e);
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
                    getMarkedProducts(e);
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
    $("#right").mouseup(function(e) {
        if (e.which == 1) {

            // if some cells is marked
            if ($('.temp-marked')[0] !== undefined) {
                // delete marking drawing
                $('.temp-marked').remove();
                console.log(Move.start_row+" "+Move.old_row+" : "+Move.start_col+" "+ Move.old_col);
                // get products
                getMarkedProducts(e);
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
                            //showNotification('Produkti neietilpst tabulā.');
                            is_valid = false;
                            $('#error-modal .modal-title').html('<strong>Kļūda!</strong> Produkti neietilpst tabulā.');
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
                                td_html.html( setProductDiv(td_html.attr('name'), markedProducts[key].product, true, markedProducts[key].kg, markedProducts[key].fixed) );
                                if ( markedProducts[key].fixed == 'true' ) {
                                    td_html.addClass('dark');
                                    td_html.addClass('fixed-pos');
                                }
                                else {
                                    td_html.removeClass('dark');
                                    td_html.removeClass('fixed-pos');
                                }
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
            if ( e.initShifFreeDays ) markedProducts = {};

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
            // simulate mouse move to get rEnd and cRow defined for markedProducts
            var el = $("#table2 tbody tr:nth-child("+PBuffer.cornerY+") td:nth-child("+PBuffer.cornerX+")");

            triggeProductPlacement(el, PBuffer.mousemove.target, notDelete, PBuffer.mousemove.clientX, PBuffer.mousemove.clientY );

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

        $.post( "php/products.php", {product: $('#product').val(), view: tableView})
        // when post is finished
        .done(function( data ) {
            if (data != '[]') {
                console.log(data);
                jsonModal = JSON.parse(data);
                console.log(jsonModal);
                //jsonModal = JSON.parse(jsonModal[0]);
                //console.log(jsonModal);
                $('#productModal .modal-title')[0].innerHTML = $('#product').val();
                // set overll comment 
                if (jsonModal != null) 
                    $('#overallComment').val(jsonModal['info']);

                var td_html = '';
                var startMachine = parseInt(jsonModal['viewStart']);
                for (var i = 1+startMachine; i <= machineCount+startMachine; i++) 
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
                    td_html += '<td><div class="checkbox"><label><input type="checkbox" '+is_checked+' disabled>'+i+'</label></div></td>';
                    td_html += '<td><input type="text" class="form-control input-sm" value="'+comment+'"></td>';
                        
                    td_html += '</tr>';
                };
                $('#productsInfoTable tbody').html(td_html);
                // $('#productModal').modal({'backdrop': 'static'});
                $('#productModal').modal({'show': true, });
            }
            else {
                showNotification("Šāds <b>'"+$('#product').val()+"'</b> produkts neeksistē.", 'danger');
            }
        })
        .fail( function( data ) {
            showNotification("Nevar saglabāt datus.", 'danger');
        });

    });
    /* ####################### END OF EVENTS #############################
        #################################################################
    */
    
    save = function () {
        // declare local variables
        //var JSONobjNew, JSONobjDel;
        var addedTiles = {}, deletedTiles = {}, newLoadedTiles = {};

        var allProducts = $( "#table2 tbody tr td div");
        $.each(allProducts, function(prod) 
        {
            if ( this.id in loadedTiles ) {
                //console.log( loadedTiles[this.id].product+'=='+this.getAttribute('product')+' '+loadedTiles[this.id].kg+'=='+this.getAttribute('kg')+' '+loadedTiles[this.id].fixed+'=='+this.getAttribute('fixed') );
                if ( loadedTiles[this.id].product != this.getAttribute('product') || loadedTiles[this.id].kg != this.getAttribute('kg') || loadedTiles[this.id].fixed.toString() != this.getAttribute('fixed').toString() ) {
                    //console.log('true');
                    addedTiles[this.id] = {product: this.getAttribute('product'), kg: this.getAttribute('kg'), fixed: this.getAttribute('fixed')};
                }
            } else {
                addedTiles[this.id] = {product: this.getAttribute('product'), kg: this.getAttribute('kg'), fixed: this.getAttribute('fixed')};
            }
            newLoadedTiles[this.id] = {product: this.getAttribute('product'), kg: this.getAttribute('kg'), fixed: this.getAttribute('fixed')};
        })

        for (var key in loadedTiles) {
            if (loadedTiles.hasOwnProperty(key)) {
                //console.log(key);
                if ( document.getElementsByName(key)[0].innerHTML == "" ) {
                    deletedTiles[key] = loadedTiles[key];
                }   
            }
        }
        console.log('SAVE POST');
        console.log(addedTiles);
        console.log(deletedTiles);
        $.post( "php/save.php", {upsert: JSON.stringify(addedTiles), del: JSON.stringify(deletedTiles), view: tableView})
        // when post is finished
        .done(function( data ) {
            showNotification("Plāns saglabāts.", 'success');
            console.log('psuccess');
            loadedTiles = newLoadedTiles;
        })
        .fail( function( data ) {
            console.log('pfail');
            console.log(data);
        });
    };

});
})( jQuery );

function getMarkedProducts(e) {
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
        if ( markedDivs[i].getAttribute('fixed') != 'true' )
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
                                    'product': markedDivs[i].getAttribute('product'),
                                    'kg': markedDivs[i].getAttribute('kg'),
                                    'fixed': markedDivs[i].getAttribute('fixed')
                                    };

            PBuffer.cornerY = ( PBuffer.cornerY > markedProducts[markedDivs[i].id].r ) ? markedProducts[markedDivs[i].id].r : PBuffer.cornerY;
            PBuffer.cornerX = ( PBuffer.cornerX > markedProducts[markedDivs[i].id].c ) ? markedProducts[markedDivs[i].id].c : PBuffer.cornerX;
        }
        // if the fixed tile is selected then throw an error
        else 
        {
            markedProducts = {};
            $('.marked').removeClass('marked');
            $('#error-modal .modal-title').html('<strong>Kļūda!</strong> Nedrīkst iezīmēt fiksēto plānu.');
            $('#error-modal .modal-dialog').attr('style','left: '+(e.clientX-80)+'px; top: '+(e.clientY-10)+'px;');
            $('#error-modal').modal('show');
            break;
        }
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
        if ( !$(allFreeDivs[i].parentNode).hasClass('fixed-pos') || $(allFreeDivs[i].parentNode).hasClass('redips-mark') ) 
        {
            markedProducts[allFreeDivs[i].id] = {'r': allFreeDivs[i].parentNode.parentNode.rowIndex+1, 
                                    'c': allFreeDivs[i].parentNode.cellIndex+1,
                                    'rEnd': allFreeDivs[i].parentNode.parentNode.rowIndex+1, 
                                    'cEnd': allFreeDivs[i].parentNode.cellIndex+1,
                                    'product': allFreeDivs[i].getAttribute('product'),
                                    'kg': allFreeDivs[i].getAttribute('kg'),
                                    'fixed': allFreeDivs[i].getAttribute('fixed')
                                    };
        }
    }
    // triger mouseup event to move products from free sifts
    Move.move_products = {'start':true, 'move':true};
    var event = jQuery.Event( "mouseup", {
        which: 1,
        buttons: 1,
        clientX: 500,
        clientY: 300,
        initShifFreeDays: true
    });
    allFreeDivs.trigger(event);
    $('.marked').removeClass('marked');

    // get back markedProducts value
    markedProducts = markedProductsCopy;
}
// add leading zero function
function pad(n){return n<10 ? '0'+n : n;}

function getShiftNumber(h, nextShift) {
    var shift;
    if ( (h >= 22 && h <= 23) || h <= 5 ) shift =  0;
    else if ( h >= 6 && h <= 13 ) shift = 1;
    else if ( h >= 14 && h <= 21 ) shift = 2;
    
    return ( nextShift ) ? (shift+1) % 3 : shift;
}
function formatDate(d) {
    return d.getFullYear()+'-'+pad((d.getMonth()+1))+'-'+pad(d.getDate());
}

function drawTodaysSign (draw_time, draw_history) 
{
    var today = new Date();
    var whichShift = 0;
    var h = today.getHours();
    // fix a bug when, for example today is 2015/11/20  22:52, but 2015/11/21 first shift starts on 2015/11/20 22:00
    // so today in this time interval is already next day
    if ( h >= 22 && h <= 23 ) today.setDate(today.getDate() + 1);

    whichShift = getShiftNumber(h, false)

    console.log(whichShift + " " +h);

    // mark today in the table
    var today_formated = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate());
    if ($('#'+today_formated+'H')[0] === undefined) {
        $('#today-line').remove();
        console.log('Nav datuma');
    }
    else {
        if ( $('#today-line')[0] === undefined ) {
            $('#right').prepend('<div id="today-line"></div>');
        }

        var date_cellIndex = $('#'+today_formated+'H')[0].cellIndex;
        var time_index = (date_cellIndex* 3 - 1) + whichShift;
        //console.log($('.table1-header .header-time td:nth-child('+(time_index)+')'))
        // iterate through currrent shift column in planning table
        for (var i = 1; i <= machineCount; i++) {
            $('#table2 tr:nth-child('+i+') td:nth-child('+(time_index-1)+')').addClass('today');
        };
        var lineHeight = parseInt($('.left-header').css('height'))+60;

        $('#today-line').css('height', lineHeight.toString()+'px');
        $('#today-line').offset({top: $('#today-line').offset().top, left: $('.today').offset().left});
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
            var endOffset = (70*3*back)+whichShift*70;
            $('#history-mark').css('width', $('#table2 tr:nth-child(1) td').last().position().left - endOffset);
            historyEndCell = $('#table2 tr:nth-child(1) td').last()[0].cellIndex - 3 * (back+1) + 1 + whichShift;
            disableButtons = true;
        }
        else {
            $('#history-mark').css('height', 0);
            $('#history-mark').css('width', 0);
            historyEndCell = 1;
        }
    }
    if ( disableButtons ) {
        if (historyEndCell >= 2) {
    	    var rangeBttns = $( '.header-time td:nth-child(n+2):nth-child(-n+'+(historyEndCell-1)+') button' );
    	    $.each( rangeBttns, function() 
            {
                var parent = this.parentNode.parentNode;
                $(parent).addClass('history');
    	    	parent.style.backgroundColor = "#EEE";
    	    	// get a shift text and place it in td
    	    	parent.innerHTML = this.innerHTML.split(';')[1];
    	    })
        }
	}
}

function updateUndo () {
    console.log('update undo.');
    var h = $('.table1-header').html();
    var t = $('#table2').html();

    if ( undoProducts.length > 0 ) {
        // if last saved undo is not equal with this table, then update
        if ( undoProducts[undoProducts.length - 1]['table'] != t ) {
            if ( undoProducts.length > 29 ) {
                undoProducts.shift();
            }
            undoProducts.push( {'header': h, 
                                'table': t, 'loadedTiles': JSON.parse(JSON.stringify(loadedTiles)),
                                'marked': markedProducts } );
        }
    } 
    else {
        if ( undoProducts.length > 19 ) {
                undoProducts.shift();
        }
        // JSON is needed to clone the loadedTitles value, becouse otherwise it's passed by ref and this line loses a meaning
        undoProducts.push( {'header': h, 
                            'table': t, 'loadedTiles': JSON.parse(JSON.stringify(loadedTiles)),
                            'marked': markedProducts } );
    }
}

function showNotification(text, type) {
    var title = ''
    if ( type == 'danger' ) title = 'Kļūda! ';
    else if ( type == 'success' ) title =  'Paziņojums! ';
    
    $.toaster({ priority : type, title : title, message : text});
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
    var letters = '0123456789ABCDEF'.split('');
    var random_color = '#';
    for (var i = 0; i < 6; i++ ) {
        random_color += letters[Math.round(Math.random() * 15)];
    }
    if(productsColor[product] === undefined) {
        productsColor[product] = random_color;
    }
}

/* ### END OF COLOR FUNCTIONS ###
    ###########################
*/

function setProductDiv (name, product, marked, kg, is_fixed) {
    cls = (marked) ? ' marked' : '';
    is_static = ( is_fixed == 'true' ) ? 'true':'false';
    return '<div id="'+name+'" class="blue'+cls+'" product="'+product+'" kg="'+kg+'" fixed="'+is_static+'"'+ 
            'style="background-color:'+productsColor[product]+'; color:'+generateTextColor(productsColor[product])+'">'+product+'</div';
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

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
