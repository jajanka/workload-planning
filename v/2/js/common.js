$(document).ready(function () {

	var loc = location.pathname.split('/')
	$('#mainNavBar').find('a[href="' + loc[loc.length -1 ] + '"]').parent('li').addClass('active');

})