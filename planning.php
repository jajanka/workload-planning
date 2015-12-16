	<?php 
		include('php/session.php');
		$title = 'Plānošana · Culimeta';
		include("header.php");
	?>
		<link rel="stylesheet" href="css/noselect.css" type="text/css" media="screen"/>
		
 		<?php include("plan.php") ;?>
		

	<!-- <footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer> -->
	</body>

	<?php include("footer.html") ;?>
	<script src="js/jquery-ui.min.js"></script>
	<script type="text/javascript" src="bootstrap/js/typeahead.bundle.js"></script>
	<script type="text/javascript" src="datepicker/jquery.plugin.js"></script>
	<script type="text/javascript" src="datepicker/jquery.datepick.js"></script>
	<script type="text/javascript" src="datepicker/jquery.datepick-lv.js"></script>
	<script type="text/javascript" src="js/jquery.toaster.js"></script>
	<script type="text/javascript" src="js/scripts.js"></script>
</html>