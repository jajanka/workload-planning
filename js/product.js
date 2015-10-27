var datesToSave = {};

// use: when post/get data then ajax gif loader shows
$(document).ajaxStop(function(){
    console.debug("ajaxStop");
    $("#ajax_loader img").hide();
    $("#ajax_loader").hide();
    $("#calendarTable").show();
 });
 $(document).ajaxStart(function(){
     console.debug("ajaxStart");
     $("#calendarTable").hide();
     $("#ajax_loader img").show();
     $("#ajax_loader").show();
 });


$(document).ready(function () {

	var confirmOptions = {title: "Dzēst?", btnOkLabel: "Jā", btnCancelLabel: "Nē", singleton: true, onCancel: function(){
		$(this).addClass('hidden'); 
		}
	};

	// allow click on new generated buttons
	$(document).on('click', '#productsTable .delete', function() {
		$(this).parent().parent().remove()
		console.log('delete');
	})
	// init yes/no box on delete
	$(".delete").confirmation(confirmOptions);

	/*///////////////////////////
	//// Make editable correct cells
	*/
	// allow modify table cells
	$("#productsTable").on('click', 'tbody .td1', function() {
	    cellEdit(this);
	})
	$("#productsTable").on('click', 'tbody .td2', function() {
	    cellEdit(this);
	})
	$("#productsTable").on('click', 'tbody .td3', function() {
	    cellEdit(this);
	})
	$("#productsTable").on('click', 'tbody .td7', function() {
	    cellEdit(this);
	})
	////////////////////////////////
	$('#productsTable').on('keydown', 'td', function(e) {
	    // when edit a cell and press Enter then cell becomes uneditable
	    if ( e.keyCode === 13 ) {
	    	console.log(this);
	    	$(this).attr("contentEditable","false");
	    }
	});

	//if the letter is not digit then display error and don't type anything
	$('#productsTable').on('keypress', 'td2', function(e) {
	    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) return false;
	});
	$('#productsTable').on('keypress', 'td3', function(e) {
	    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) return false;
	});
	$('#productsTable').on('keypress', 'td7', function(e) {
	    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) return false;
	});



$('body').on('focus', '[contenteditable]', function() {

}).on('blur keyup paste input', '[contenteditable]', function() {
	var t = $(this).parent();
    var v1 = t.find('td:nth-child(3)')[0].innerHTML;
    var v2 = t.find('td:nth-child(4)')[0].innerHTML;
    var v3 = t.find('td:nth-child(6)')[0].innerHTML;
    var v4 = t.find('td:nth-child(8)')[0].innerHTML;
    var kgh = (v2 * 60 * v1 / 1000 / 1000 * v4 / 100).toFixed(3);
    t.find('td:nth-child(5)')[0].innerHTML = kgh;
    t.find('td:nth-child(7)')[0].innerHTML = (v3 / kgh).toFixed(3);
});



	// info modal for products
	$("#productsTable").on('click', '.info', function() {
		console.log('info');
		product_name = $("#"+this.id).parent().closest("td").next()[0].innerHTML;
		$('#productModal .modal-title')[0].innerHTML = product_name;
		
		var td_html = '';
		for (var i = 1; i <= 21; i++) 
		{
			td_html += '<tr>';
			td_html += '<td><div class="checkbox"><label><input type="checkbox">'+i+'</label></div></td>';
			td_html += '<td><input type="text" class="form-control input-sm"></td>';
			td_html += '</tr>';
		};
		$('#productsInfoTable tbody').html(td_html);
    	$('#productModal').modal('show');
	});;


	var clonedHeaderRow;
	// for static header on top. clone
   $("#productsTable").each(function() {
       clonedHeaderRow = $(".persist-header", this);
       clonedHeaderRow
         .before(clonedHeaderRow.clone())
         .css("width", clonedHeaderRow.width())
         .addClass("floatingHeader");
         
   });
   
   $(window)
    .scroll(UpdateTableHeaders)
    .trigger("scroll");

    // new added row html
    var newRow = '<tr><td><button type="button" class="btn btn-success info" aria-label="Left Align" id="a">'+
    		'<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></button></td>'+
    		'<td class="td1"></td><td class="td2"></td><td class="td3"></td><td class="td4"></td>'+
    		'<td class="td5">1</td><td class="td6"></td><td class="td7">90</td>'+
    		'<td><button type="button" class="btn btn-danger delete hidden" aria-label="Left Align" id="del">'+
	        '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
	        '</td></tr>';

	// add new row on + click
	$("#bttn-add-product").click(function (e) {
		$("#productsTable tbody").prepend(newRow);
		$(".delete").confirmation();
	});

	// shows delete icon in the end of row
	$('#productsTable').on("mouseenter", "tbody tr", function() {
    	$(this).find('td .btn-danger').last().removeClass('hidden'); 
	});

	$('#productsTable').on("mouseleave", "tbody tr", function() {
	   	$(this).find('td .btn-danger').last().addClass('hidden');
	});

});


function showError(text, type) {
	var alertType = (type == 'danger') ? 'Kļūda!' : '';
	$('#message').prepend('<div class="alert alert-'+type+' fade in" role="alert" style="display: none; margin-top: 5px;">'+
		'<a href="#" class="close" data-dismiss="alert">&times;</a>'+
		'<strong>'+alertType+'</strong> '+text+'</div>');
	$(".alert").fadeIn(25);
	setTimeout(function(){ $('.alert').alert('close'); }, 5000);
}

function cellEdit(cell) {
	if($(cell).attr("contentEditable") == true){
        $(cell).attr("contentEditable","false");
    } else {
        $(cell).attr("contentEditable","true");
    }
}

var header_lag_fix = true;
var col_widths = {};
function UpdateTableHeaders() {
   $("#productsTable").each(function() {
   
        var el             = $(this),
           offset         = el.offset(),
           scrollTop      = $(window).scrollTop(),
           floatingHeader = $(".floatingHeader", this)
       
        if ((scrollTop > offset.top) && (scrollTop < offset.top + el.height())) {
        	// fixes problem when header is at top fixed and not having correct th width. 
       		if (header_lag_fix) {
       			for (var i = 1; i <= 8; i++) {
        			$('#productsTable thead th:nth-child('+i+')').width(col_widths[i]);
        		};
	       		floatingHeader.css('height','40px');
	       	}
            floatingHeader.css({
            "visibility": "visible"
            });
           	header_lag_fix = false;
        } else {
        	header_lag_fix = true;
        	for (var i = 1; i <= 8; i++) {
        		col_widths[i] = $('#productsTable thead th:nth-child('+i+')').width();
        	};
            floatingHeader.css({
            "visibility": "hidden"
            });      
        };
    });
}
