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
	$("table.table tr td").bind("click", dataClick);

	$("#productsTable button").click(function() {
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
	});
});


function dataClick(e) {
    console.log(e);
    //if (e.currentTarget.innerHTML != "") return;
    if(e.currentTarget.contentEditable != null){
        $(e.currentTarget).attr("contentEditable",true);
    }
    else{
        $(e.currentTarget).append("<input type='text'>");
    }    
}

function showError(text, type) {
	var alertType = (type == 'danger') ? 'Kļūda!' : '';
	$('#message').prepend('<div class="alert alert-'+type+' fade in" role="alert" style="display: none; margin-top: 5px;">'+
		'<a href="#" class="close" data-dismiss="alert">&times;</a>'+
		'<strong>'+alertType+'</strong> '+text+'</div>');
	$(".alert").fadeIn(25);
	setTimeout(function(){ $('.alert').alert('close'); }, 5000);
}