	<?php 
		$title = 'Plānošana';
		include("header.php");
	?>
		<link rel="stylesheet" href="css/noselect.css" type="text/css" media="screen"/>
		<script type="text/javascript" src="bootstrap/js/typeahead.bundle.js"></script>
		<script type="text/javascript" src="datepicker/jquery.plugin.js"></script>
		<script type="text/javascript" src="datepicker/jquery.datepick.js"></script>
		<script type="text/javascript" src="datepicker/jquery.datepick-lv.js"></script> 
		<script type="text/javascript" src="js/redis/redips-drag-min.js"></script>
		<script type="text/javascript" src="js/scripts.js"></script>
		<div class="container">
 		<?php include("plan.html") ;?>
		</div><!-- main container -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>
	</body>
</html>