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
var oldMarkedCells = {}; // one event previous: all td or cells marked

var markedProducts = {};
var productsColor = {};

var Move = {}; // namespace for marked products variable
var PBuffer = {cut: {}, copy: {}} // namespace for buffer, that is, copy, paste, cut and stuff

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
        $("#ajax_loader").offset($("#right").offset());
    }
 });

$( document ).ready(function() 
{
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

        if(prevTop != currentTop) { // vertical scroll
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
    function pad(n){return n<10 ? '0'+n : n;}

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
            header_day_html += '<td id="'+date_formated+'" class="" colspan="3">'+dateStr+'</td>'; //date
        });
        $('.table1-header .header-time').html('<td class="redips-mark blank"></td>'+header_time_html);
        $('.table1-header .header-day').html('<td class="redips-mark blank"></td>'+header_day_html);

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
        $('.left-header').html(left_header_html);
        $('#table2 tbody').html(table2_html);

        // update bttn-checkboxes
        initBttnCheckbox();
        drawTodaysSign();
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
            header_day_html += '<td id="'+date_formated+'" class="" colspan="3">'+dateStr+'</td>'; //date
        });
        $('.table1-header .header-time').append(header_time_html);
        $('.table1-header .header-day').append(header_day_html);
        initBttnCheckbox();

        // add table main table cells
        // generate table cells
        for (var i = 1; i <= r; i++) {  
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
            $('#table2 tr:nth-child('+i+')').append(table2_html);
        };
        drawTodaysSign();
        loadTable(lastDateObj_formated, expandDate_formated, false);
    }

    function drawTodaysSign (argument) 
    {
        var today = new Date();
        var whichShift = 0;
        var h = today.getHours();
        if ( (h >= 22 && h <= 23) || h <= 5) whichShift = 0;
        else if ( h >= 6 && h <= 13) whichShift = 1;
        else if ( h >= 14 && h <= 21) whichShift = 2;
        console.log(whichShift + " " +h);

        // mark today in the table
        var today_formated = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate());
        if ($('#'+today_formated+'H')[0] == undefined) {
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
                var arrowOffset = $('.tooltip-arrow').offset();
                $('.tooltip-arrow').css('left', '');
                $('.tooltip').offset({top: $('.tooltip').offset().top, left: arrowOffset.left-45});
            }, 1000);
        }
    }

    function fillProducts(product, start, count) {
        if (Object.keys(markedMachines).length < 1) {
            showError('Nav atzīmēta neviena mašīna.', 'danger');
            return;
        }
        $.post( "php/products_formula.php", {kg: count, prod: product})
        // when post is finished
        .done(function( data ) {
            var jsonCount = '';
            //alert(data+" "+Math.ceil(JSON.parse(data)));
            //return;
            if (data != '') 
            {
                jsonCount = Math.ceil(JSON.parse(data));
                // row column length
                var column_count = document.getElementById('table2').rows[0].cells.length;
                var count_check = 0, 
                    lastFilledProducts = [];

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
                            if (td_html[0].innerHTML.trim().length == 0 && !td_html.hasClass('dark')) {
                                if (i >= column_count)  {
                                    console.log('Expand1');
                                    expandTable(machineCount, 7);
                                    column_count = $( "#table2 tbody tr:nth-child(1) td").last()[0].cellIndex;
                                }
                                // update products colors
                                updateColor(product);
                                // put a product in cell
                                td_html.html( setProductDiv(td_html.attr("name"), product) ) ;
                                addedTiles[td_html.attr("name")] = product;
                                // add to last filled products
                                lastFilledProducts.push(td_html.attr("name"));
                                jsonCount--;
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
                if (jsonData != ''){
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
                        //loadedTiles[td_name] = plan.product;
                    });
                }
                console.log('shiftsDone ');
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
                shiftFromFreeDays();
            },
              async:is_async
        });
    }
    drawTable("2015/10/30", "2015/11/04");
    loadTable("2015/10/30", "2015/11/04", true);

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
            markedShift = 1;
            deletedTiles = {};
            loadedTiles = {};
            addedTiles = {};
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
        if(e.which == 1) {
            console.log('Mouse move '+Move.move_products['start']+ ' ' +Move.move_products['move']);
            console.log(markedProducts);
            if (Move.move_products['start'] && Move.move_products['move'] && Object.keys(markedProducts).length > 0) {
                console.log('te nav');
                //////////////////////////////////////////////////
                // MOVING ALREADY MARKED PRODUCTS!!
                //////////////////////////////////////////////////
                // unhighlight previous cells when moving products
                for (var i = Move.prevMovePosProduct.length - 1; i >= 0; i--) {
                    Move.prevMovePosProduct[i].css('background-color', '#EEE' );
                    // unhighlight product
                    if (Move.prevMovePosProduct[i].children() != []) {
                        Move.prevMovePosProduct[i].children().removeClass('marked');
                    }
                };
                Move.prevMovePosProduct = [];

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

                            var td_html = $( "#table2 tbody tr:nth-child("+row+") td:nth-child("+col+")");
                            //console.log("#table2 tbody tr:nth-child("+row+") td:nth-child("+col+")");
                            td_html.css('background-color', '#D93600' );
                            // highlight product
                            if (td_html.children() != []) {
                                td_html.children().addClass('marked');
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

            Move.mouseStillDown = true;
            Move.start_x = e.pageX, Move.start_y = e.pageY;
            if (!ctrlPressed) {
                Move.start_row = e.target.parentNode.rowIndex+1, Move.start_col = e.target.cellIndex+1;
            }
            else {
                Move.start_row = e.target.parentNode.parentNode.rowIndex+1, Move.start_col = e.target.parentNode.cellIndex+1;
            }
            if (!ctrlPressed) {
                // button pressed on now marked products
                if (e.target.className == 'blue marked' && Move.move_products['start']) {
                    Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
                    Move.start_col = e.target.parentNode.cellIndex+1;
                    // if marked products start to move and it starts from product div not empty cell
                    if (Move.move_products['start']) {
                        Move.move_products['move'] = true;
                    }
                }
                // if buton pressed on already moved marked products
                else if ((e.target.className == 'blue' || e.target.className == 'blue marked') && !Move.move_products['start']) {
                    Move.move_products['start'] = true; Move.move_products['move'] = true;
                    Move.old_row = Move.start_row = e.target.parentNode.parentNode.rowIndex+1, 
                    Move.old_col = Move.start_col = e.target.parentNode.cellIndex+1;
                    // place it in marked cells not products
                    var curCell = e.target.parentNode;
                    // get cell in marked products
                    getMarkedProducts();
                }
                else
                {
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
        }
    });

/*
============================================================
           ######### CONTEXT MENU #########
============================================================
*/
    document.getElementById('table2').oncontextmenu = function(e) {
        $('#marked-modal .modal-dialog').attr('style','left: '+(e.clientX)+'px; top: '+(e.clientY-10)+'px;');
        $('#marked-modal').modal('show');
        $(".modal-backdrop").remove();
        Move.start_x = e.pageX, Move.start_y = e.pageY;
        /*if (e.target.tagName == "TD") {
            PBuffer.start_row =  e.target.parentNode.rowIndex+1;
            PBuffer.start_col =  e.target.cellIndex+1;
        }
        else {
            PBuffer.start_row =  e.target.parentNode.parentNode.rowIndex+1;
            PBuffer.start_col =  e.target.parentNode.cellIndex+1;
        }*/
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

    $("body").mouseup(function(e) {
        if (e.which == 1) {

            // if some cells is marked
            if ($('.temp-marked')[0] !== undefined) {
                // delete marking drawing
                $('.temp-marked').remove();
                console.log(Move.start_row+" "+Move.old_row+" : "+Move.start_col+" "+ Move.old_col);
                // get products
                getMarkedProducts();
                
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
                            markedProducts[key].cEnd < 1 /*|| markedProducts[key].cEnd > lastTdIndex*/) { 
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
                            // old product place. remove all prev products
                            var td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+")");
                            td_html.css('background-color', '#EEE' );
                            // if new products is not out of table bounds
                            if (is_valid) {
                                td_html.html('');
                            }
                        }
                    }
                }
                var prevRow = -1, td_html;
                for (var key in markedProducts) {
                    if (markedProducts.hasOwnProperty(key)) {
                        var i;
                        // new product place. place new products in cells
                        if ( prevRow == markedProducts[key].rEnd ) 
                        {
	                        if ( $("#table2 tbody tr:nth-child("+markedProducts[key].r+") td:nth-child("+markedProducts[key].c+")").hasClass('dark') || 
	                        	$("#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+markedProducts[key].cEnd+")").hasClass('dark') ) 
	                        {
	                            td_html = td_html.closest('td').next();
	                            i = td_html[0].cellIndex+1;
	                        }
	                        else {
	                            i = td_html[0].cellIndex + ((markedProducts[key].cEnd - td_html[0].cellIndex));
	                            td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+i+")");
	                        }
	                    }
                        else {
                            i = markedProducts[key].cEnd;
                            td_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+i+")");
                        }

                        //console.log(td_html.hasClass('dark'));
                        td_html.css('background-color', '#EEE' );
                        if (is_valid) {
                            // row's last td index
                            var rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;

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
                            if (startIndex > rowLastCellIndex) {
                                console.log('Expand2');
                                expandTable(machineCount, 7);
                                rowLastCellIndex = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td").last()[0].cellIndex;
                            }

                            $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+") div").removeClass('marked');
                            var nextCell_html = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+")")[0].innerHTML;
                            // next cell  
                            var nextCell = $( "#table2 tbody tr:nth-child("+markedProducts[key].rEnd+") td:nth-child("+(startIndex)+")");

                            for (var i = startIndex; i <= rowLastCellIndex; i++) {
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
                                while (nextCell.hasClass('dark')){
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
                            };
                            // make new row and column positon when product is placed
                            markedProducts[key].c = td_html[0].cellIndex + 1;
                            markedProducts[key].r = td_html[0].parentNode.rowIndex + 1;
                            // draw product
                            td_html.html( setProductDiv(key, markedProducts[key].product, true));
                        }
                    }
                }
                //Move.move_products['start'] = false; Move.move_products['move'] = false;
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

            Move.mouseStillDown = false;
        }
    });

    $('#delete-marked-bttn').click(function() { 
        Move.modal_action = true;
        for (var key in markedProducts) {
            // if new marked cell not in old then unmark it
            if (markedProducts.hasOwnProperty(key)) {
                $('[name="'+key+'"]')[0].innerHTML = "";
                deletedTiles[key] = markedProducts[key].product;
            }
        };
        markedProducts = {};
        Move.move_products['start'] = false; Move.move_products['move'] = false;
    });

    $('#marked-modal').on('hidden.bs.modal', function () {
        if (!Move.modal_action) {
            for (var key in markedProducts) {
                if (markedProducts.hasOwnProperty(key)) {
                    // .attr('style',  'background-color:#e3e3e3');
                    if ($('[name="'+key+'"]')[0].innerHTML.trim() != '') {
                        $('[name="'+key+'"] div').removeClass('marked');
                        //console.log($('[name="'+key+'"]')[0].innerHTML);
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
            Move.start_row = PBuffer.cornerY; Move.start_col = PBuffer.cornerX;
        }
    });
    $('#copy-marked-bttn').click(function(e) { 
        if (Object.keys(markedProducts).length > 0) {
            PBuffer.cut = {};
            PBuffer.copy = markedProducts;
            Move.start_row = PBuffer.cornerY; Move.start_col = PBuffer.cornerX;
        }
    });
    $('#paste-marked-bttn').click(function(e) { 
        console.log(PBuffer.mousemove);
        // cut or paste 
        notDelete = ( Object.keys(PBuffer.cut).length > 0 ) ? false : true;
        // get copy or cut products from buffer, assign that to marked products
        markedProducts = ( Object.keys(PBuffer.cut).length > 0 ) ? PBuffer.cut : PBuffer.copy;
        console.log();
        Move.move_products['start'] = true;  Move.move_products['move'] = true;

        // simulate mouse move to get rEnd and cRow defined for markedProducts
        var $el = $("#table2 tbody tr:nth-child("+PBuffer.cornerY+") td:nth-child("+PBuffer.cornerX+")");
        var event = jQuery.Event( "mousemove", {
            target: PBuffer.mousemove.target,
            which: 1
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
        //Move.move_products['start'] = false;  Move.move_products['move'] = false;
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

function getMarkedProducts() {
    markedProducts = {};
    Move.mProdCountInRow = {};
    // get maximum and minimum values to be able to start the loop properly
    var maxR = Math.max(Move.start_row, Move.old_row), minR = Math.min(Move.start_row, Move.old_row), 
        maxC = Math.max(Move.start_col, Move.old_col), minC = Math.min(Move.start_col, Move.old_col);
    console.log('MinR: '+minR+', MinC: '+minC);

    var markedDivs = $( "#table2 tbody tr:nth-child(n+"+minR+"):nth-child(-n+"+maxR+") td:nth-child(n+"+minC+"):nth-child(-n+"+maxC+") div");
    var mdlen = markedDivs.length;
    // get corner of marked place area. It's the min col and row combination. Paste from buffer will start there
    PBuffer.cornerY = markedDivs[0].parentNode.parentNode.rowIndex+1;
    PBuffer.cornerX = markedDivs[0].parentNode.cellIndex+1;

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
	console.log('Shift free days');
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
        clientX: 500,
        clientY: 300
    });
    allFreeDivs.trigger(event);
    $('.marked').removeClass('marked');
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

function setProductDiv (name, product,marked) {
    cls = (marked) ? ' marked' : '';
    return '<div id="'+name+'" class="blue'+cls+'" product="'+product+'"'+ 
            'style="background-color:'+productsColor[product]+'; color:'+generateTextColor(productsColor[product])+'">'+product+'</div';
}


save = function () {
    // declare local variables
    var JSONobjNew = addedTiles,    // prepare JSON object
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