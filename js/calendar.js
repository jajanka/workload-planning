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
				alert(data);
				location.reload();
			})
			.fail( function( data ) {
			    alert('pfail');
			    console.log(data);
			});
		}
		else 
		{
			alert('Nederīgs gads.');
			return false;
		}
	});

	$("#bttn-show-year").click(function (e) {
		var	year = parseInt($("#getYear").val());

		if (year > 2005 && year < 2038) {
			$.post( "php/calendar_save.php", {get_year: year})
			// when post is finished
			.done(function( data ) {
				//alert(data);
				$('#calendarTable tbody').html(data);
			})
			.fail( function( data ) {
			    alert('pfail');
			    console.log(data);
			});
		}
		else 
		{
			alert('Nederīgs gads.');
			return false;
		}
	});

});