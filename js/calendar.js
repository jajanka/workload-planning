$(document).ready(function () {
  //called when key is pressed in textbox
	$("#add-year").keypress(function (e) {
	     //if the letter is not digit then display error and don't type anything
	    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
	    	return false;
	   	}
	});

	$("#bttn-add-year").click(function (e) {
		var	year = $("#add-year").val();

		$.post( "php/save_calendar.php", {year: year})
		// when post is finished
		.done(function( data ) {
			alert(data);
		})
		.fail( function( data ) {
		    alert('pfail');
		    console.log(data);
		});
	});
});