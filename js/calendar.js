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
  //called when key is pressed in textbox
	$("#add-year").keypress(function (e) {
	     //if the letter is not digit then display error and don't type anything
	    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
	    	return false;
	   	}
	});

	$("#bttn-add-year").click(function (e) {
		var	year = parseInt($("#add-year").val());

		if (year > 2005 && year < 2038) {
			$.post( "php/calendar_save.php", {year: year})
			// when post is finished
			.done(function( data ) {
				showError(data, 'success')
				location.reload();
			})
			.fail( function( data ) {
			    showError("Nevar paradīt datus.", 'danger');
			});
		}
		else 
		{
			showError("Nederīgs gads.", 'danger');
			return false;
		}
	});

	$("#bttn-show-year").click(function (e) {
		var	year = parseInt($("#getYear").val());

		if (year > 2005 && year < 2038) {
			$.post( "php/calendar_load.php", {get_year: year})
			// when post is finished
			.done(function( data ) {
				//alert(data);
				$('#calendarTable tbody').html(data);
			})
			.fail( function( data ) {
			    showError("Nevar paradīt datus.", 'danger');
			});
		}
		else 
		{
			showError("Nevar paradīt datus.", 'danger');
			return false;
		}
	});

	$('#calendarTable tbody').on('change' , '.checkbox' , function() {
		if($(this).find('input')[0].checked) {
			$(this).parent().addClass('danger');
		}
		else {
			$(this).parent().removeClass('danger');
		}
		// from td input get tr,etc,row. It is twp parents backwards
		var row = $(this)[0].parentNode.parentNode;
		// get seconds td text. Split it by ' ' format is 2015-03-23 Pk
		var date = $(row).find("td:nth-child(2)")[0].textContent.split(' ')[0];
		//console.log($(row).find("td:nth-child(2)").textContent);

		datesToSave[date] = {'shift1': $(row).find("td:nth-child(3)").find('input')[0].checked, 
								'shift2': $(row).find("td:nth-child(4)").find('input')[0].checked, 
								'shift3': $(row).find("td:nth-child(5)").find('input')[0].checked
							};
		console.log(datesToSave);
	});

	$("#bttn-save-year").click(function (e) {

		$.post( "php/calendar_save.php", {update: JSON.stringify(datesToSave)})
		// when post is finished
		.done(function( data ) {
			showError("Dati saglabāti.", 'success');
		})
		.fail( function( data ) {
		    showError("Nevar saglabāt datus.", 'danger');
		    console.log(data);
		});

	});

	var clonedHeaderRow;

   $("#calendarTable").each(function() {
       clonedHeaderRow = $(".persist-header", this);
       clonedHeaderRow
         .before(clonedHeaderRow.clone())
         .css("width", clonedHeaderRow.width())
         .addClass("floatingHeader");
         
   });
   
   $(window)
    .scroll(UpdateTableHeaders)
    .trigger("scroll");


});

function showError(text, type) {
	var alertType = (type == 'danger') ? 'Kļūda!' : '';
	$('#message').prepend('<div class="alert alert-'+type+' fade in" role="alert" style="display: none; margin-top: 5px;">'+
		'<a href="#" class="close" data-dismiss="alert">&times;</a>'+
		'<strong>'+alertType+'</strong> '+text+'</div>');
	$(".alert").fadeIn(25);
	setTimeout(function(){ $('.alert').alert('close'); }, 5000);
}


function UpdateTableHeaders() {
   $("#calendarTable").each(function() {
   
       var el             = $(this),
           offset         = el.offset(),
           scrollTop      = $(window).scrollTop(),
           floatingHeader = $(".floatingHeader", this)
       
       if ((scrollTop > offset.top) && (scrollTop < offset.top + el.height())) {
           floatingHeader.css({
            "visibility": "visible"
           });
       } else {
           floatingHeader.css({
            "visibility": "hidden"
           });      
       };
   });
}
