var prodsToSave = [];
var Product = {};

// use: when post/get data then ajax gif loader shows
$(document).ajaxStop(function(){
    console.debug("ajaxStop");
    $("#ajax_loader").hide();
    $("#productsTable").show();
 });
 $(document).ajaxStart(function(){
     console.debug("ajaxStart");
     $("#productsTable").hide();
     $("#ajax_loader").show();
 });


$(document).ready(function () {
	// reckons only deleted loaded products
	var deletedProducts = [];

	// load info about products
	$.post( "php/products_load_info.php", {getInfo: true})
	// when post is finished
	.done(function( data ) {
		var infoArr = JSON.parse(data);
		console.log(infoArr);
		$("#productsTable tbody tr").each(function() {
			var pid = $(this).find('td:nth-child(1) button').attr('name');
			var pname = $(this).find('td:nth-child(2)').text();
			var pweight = $(this).find('td:nth-child(3)').text();
			var pm_min = $(this).find('td:nth-child(4)').text();
			var peff = $(this).find('td:nth-child(8)').text();
			var pmodal = (infoArr[pid] !== undefined) ? JSON.parse(infoArr[pid]) : '';
			prodsToSave.push({'pid': pid, 'name': pname, 'weight': pweight, 
							'm_min': pm_min, 'eff': peff, 'modal': pmodal, 'status':'loaded'});
		})
	})
	.fail( function( data ) {
	    showError("Nevar ielādēt produkta informāciju.", 'danger');
	});

	var confirmOptions = {title: "Dzēst?", btnOkLabel: "Jā", btnCancelLabel: "Nē", singleton: true, onCancel: function(){
		$(this).addClass('hidden'); 
		}
	};

	// allow click on new generated buttons
	$(document).on('click', '#productsTable .delete', function() {
		// get products status
		var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
		var status = prodsToSave[$(this).parent().parent()[0].rowIndex-firstRowIndex]['status'];
		// if loaded product is deleted add it do deleted products arrays
		if (status == 'loaded' || status == 'moded') {
			deletedProducts.push($(this).parent().parent().find('td:nth-child(1) button').attr('name'));
		}
		console.log(deletedProducts);
		// delete modal product info about this deleted product
		var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
		prodsToSave.splice($(this).parent().parent()[0].rowIndex-firstRowIndex, 1);
		$(this).parent().parent().remove();

		// on deletion check if save button should be enabled
		var enableSave = true;
		$( "#productsTable tbody tr td:nth-child(2)" ).each(function() {
			if ($(this).hasClass('danger')){
				enableSave = false;
			}
		})
		if (enableSave) {
			$('#bttn-save-products').prop('disabled', false);
			clonedHeaderRow.find('button').prop('disabled', false);
		}
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
	$('#productsTable').on('blur keyup paste input', 'tbody .td1', function(e) {
		var curThis = this;
		// Fix for browser different tabel row indexes
		var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
		var row = this.parentNode.rowIndex;
		var r = row - firstRowIndex;
		var text = $(this).text();
		var cleanCell = true, cleanCol = true;
		var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
		console.log(prodsToSave[r]);
		prodsToSave[r]['status'] = (prodsToSave[r]['status'] == 'loaded')? 'moded': prodsToSave[r]['status'];

		// checks if this product name is unique in all prducts name column
	    $( "#productsTable tbody tr td:nth-child(2)" ).each(function() {
	    	if (row != this.parentNode.rowIndex) { // cheks when it's not comparing to it self
	    		if (text == $(this).text() || text.trim() == "") {
	    			$(curThis).addClass('danger');	
	    			cleanCell = false;
	    			$('#bttn-save-products').prop('disabled', true);
	    			clonedHeaderRow.find('button').prop('disabled', true);
	    			$(curThis).parent().find('td:nth-child(1) button').prop('disabled', true);
	    		}
	    		if ($(this).hasClass('danger')) {
	    			cleanCol = false;
	      			$('#bttn-save-products').prop('disabled', true);
	      			clonedHeaderRow.find('button').prop('disabled', true);
	    		}
	    	}
	    })
	    if (cleanCell) {
	    	$(curThis).removeClass('danger');
	    	// disable info button
	    	$(curThis).parent().find('td:nth-child(1) button').prop('disabled', false);
	    	clonedHeaderRow.find('button').prop('disabled', false);
	    	// change products name
			prodsToSave[r]['name'] = text;
		}
	    if (cleanCell && cleanCol) {
	    	$('#bttn-save-products').prop('disabled', false);
	    	clonedHeaderRow.find('button').prop('disabled', false);
	    }
	});
	$('#productsTable').on('keyup', '.td2', function(e) {
		// Fix for table index in browsers. Chrome table indexes is for whole table. Mozilla indexes starts ar table tbody as specified
	    var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
	    var row = this.parentNode.rowIndex-firstRowIndex;
	    prodsToSave[row]['status'] = (prodsToSave[row]['status'] == 'loaded')? 'moded': prodsToSave[row]['status'];
	    prodsToSave[row]['weight'] = $(this).text();
	    isRowValid(this);
	});
	$('#productsTable').on('keyup', '.td3', function(e) {
	    // Fix for table index in browsers. Chrome table indexes is for whole table. Mozilla indexes starts ar table tbody as specified
	    var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
	    var row = this.parentNode.rowIndex-firstRowIndex;
	    prodsToSave[row]['status'] = (prodsToSave[row]['status'] == 'loaded')? 'moded': prodsToSave[row]['status'];
	    prodsToSave[row]['m_min'] = $(this).text();
	    isRowValid(this);
	});
	$('#productsTable').on('keyup', '.td7', function(e) {
	    // Fix for table index in browsers. Chrome table indexes is for whole table. Mozilla indexes starts ar table tbody as specified
	    var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
	    var row = this.parentNode.rowIndex-firstRowIndex;
	    prodsToSave[row]['status'] = (prodsToSave[row]['status'] == 'loaded')? 'moded': prodsToSave[row]['status'];
	    prodsToSave[row]['eff'] = $(this).text();
	    isRowValid(this);
	});

	function isRowValid(t) {
		for (var i = 3; i <= 8; i++) {
			if ( !isNumber($(t).parent().find('td:nth-child('+i+')').text()) ){
				$('#bttn-save-products').prop('disabled', true);
				clonedHeaderRow.find('button').prop('disabled', true);
				return;
			}
		};
		$('#bttn-save-products').prop('disabled', false);
		clonedHeaderRow.find('button').prop('disabled', false);
	}

$('body').on('focus', '[contenteditable]', function() {

}).on('blur keyup paste input', '[contenteditable]', function() {
	var t = $(this).parent();
    var v1 = t.find('td:nth-child(3)')[0].innerHTML;
    var v2 = t.find('td:nth-child(4)')[0].innerHTML;
    var v3 = t.find('td:nth-child(6)')[0].innerHTML;
    var v4 = t.find('td:nth-child(8)')[0].innerHTML;
    var kgh = (v2 * 60 * v1 / 1000 / 1000 * v4 / 100).toFixed(3);
    t.find('td:nth-child(5)')[0].innerHTML = kgh;
    t.find('td:nth-child(7)')[0].innerHTML = (kgh * 1).toFixed(3);
});



	// info modal for products
	$("#productsTable").on('click', '.info', function() {
		// current product
		var productName = $(this).parent().parent().find('td:nth-child(2)').text();
		Product['curModalProduct'] = productName;
		/////////////////
		// curent row index
		// Fix for table index in browsers. Chrome table indexes is for whole table. Mozilla indexes starts ar table tbody as specified
	    var firstRowIndex = $('#productsTable tbody').find('tr').first()[0].rowIndex;
		Product['curRow'] = $(this).parent().parent()[0].rowIndex - firstRowIndex;
		// set id to product name
		$(this).attr('id', 'productName')

		$('#productModal .modal-title')[0].innerHTML = productName;
		// set overll comment 
		if (prodsToSave[Product['curRow']]['modal'] != '') 
			$('#overallComment').val(prodsToSave[Product['curRow']]['modal']['info']);

		var td_html = '';
		for (var i = 1; i <= 21; i++) 
		{
			var comment = '';
			var is_checked = 'unchecked';
			if (prodsToSave[Product['curRow']]['modal'] != '') {
				// check if this machine number is defined in json modal
				if (prodsToSave[Product['curRow']]['modal'][i] !== undefined) {
					comment = prodsToSave[Product['curRow']]['modal'][i]['comment'];
					if (prodsToSave[Product['curRow']]['modal'][i]['check']) { 	
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
    	$('#productModal').modal('show');
	});

	$('#productModal').on('hidden.bs.modal', function () {
		$('#overallComment').val('');
	})

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
    var newRow = '<tr><td><button type="button" class="btn btn-success info" aria-label="Left Align" id="" name="new" disabled>'+
    		'<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></button></td>'+
    		'<td class="td1" contenteditable="true"></td><td class="td2" contenteditable="true">0</td>'+
    		'<td class="td3" contenteditable="true">0</td><td class="td4"></td>'+
    		'<td class="td5">1</td><td class="td6"></td><td class="td7" contenteditable="true">90</td>'+
    		'<td><button type="button" class="btn btn-danger delete hidden" aria-label="Left Align" id="del">'+
	        '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
	        '</td></tr>';

	// add new row on + click
	$("#bttn-add-product").click(function (e) {
		$("#productsTable tbody").prepend(newRow);
		prodsToSave.unshift({'pid':'new','name': '', 'weight': 1000, 'm_min': 500, 'eff': 90, 'modal': '', 'status':'new'});
		$(".delete").confirmation(confirmOptions);
		$('#productsTable tbody tr:nth-child(1) td:nth-child(2)').addClass('danger');	
	    $('#bttn-save-products').prop('disabled', true);
	    clonedHeaderRow.find('button').prop('disabled', true);
	});

	// shows delete icon in the end of row
	$('#productsTable').on("mouseenter", "tbody tr", function() {
    	$(this).find('td .btn-danger').last().removeClass('hidden'); 
	});

	$('#productsTable').on("mouseleave", "tbody tr", function() {
	   	$(this).find('td .btn-danger').last().addClass('hidden');
	});
	///////////////////////////////////
	///////////////////////////////////

	$("#bttn-save-modal").click(function (e) {
		var curProd = Product['curModalProduct'];
		var cRow = Product['curRow'];
		var Modal = {};
		Modal['info'] = $('#overallComment').val();
		// empty modal textarea
		$('#overallComment').val('');

		$( "#productsInfoTable tbody tr" ).each(function() {
			var cbLabel = $( this ).find('td:nth-child(1) label').text();
		  	var comment = $( this ).find('td:nth-child(2) input').val();	
			// if checkbox is checked
		  	if ( $( this ).find('td:nth-child(1) input').is(":checked") ) {
		  		console.log(comment);
		  		Modal[cbLabel] = {'comment': comment, 'check': true};
		  	} else {
		  		Modal[cbLabel] = {'comment': comment, 'check': false};
		  	}
		});
		prodsToSave[cRow]['modal'] = Modal;
		prodsToSave[cRow]['status'] = (prodsToSave[cRow]['status'] == 'loaded')? 'moded': prodsToSave[cRow]['status'];
		console.log(Modal);
	})

	$("#productsTable").on('click', '#bttn-save-products', function (e) {
		console.log('sd');
		var upsertData = [];
		for (var i = prodsToSave.length - 1; i >= 0; i--) {
			// push only new or modified products
			if ( prodsToSave[i]['status'] != 'loaded') {
				upsertData.push(prodsToSave[i]);
			}
		};
		jsonTable = JSON.stringify(upsertData);
		jsonDelete = JSON.stringify(deletedProducts);
		console.log(jsonTable);
		console.log(jsonDelete);
		$.post( "php/products_save.php", {upsert: jsonTable, del: jsonDelete})
		// when post is finished
		.done(function( data ) {
			if (data == '1')
				showError('Dati saglabāti!', 'success');
			else {
				showError('Dati saglabāti!', 'success');
				showError('Šie produkti jau pastāv '+data, 'danger');
			}
			location.reload();
		})
		.fail( function( data ) {
		    showError("Nevar saglabāt datus.", 'danger');
		});

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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var header_lag_fix = true;
var col_widths = {};
var head_width = 960;
function UpdateTableHeaders() {
   $("#productsTable").each(function() {
   
        var el            = $(this),
           offset         = el.offset(),
           scrollTop      = $(window).scrollTop(),
           floatingHeader = $(".floatingHeader", this)
       
        if ((scrollTop > offset.top) && (scrollTop < offset.top + el.height())) {
        	// fixes problem when header is at top fixed and not having correct th width. 
       		if (header_lag_fix) {
       			console.log('Static header');
       			for (var i = 1; i <= 8; i++) {
        			$('#productsTable thead th:nth-child('+i+')').width(col_widths[i]);
        		};
        		$('#productsTable thead').width(head_width);
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
        	head_width = $('#productsTable thead').width();
            floatingHeader.css({
            "visibility": "hidden"
            });      
        };
    });
}
