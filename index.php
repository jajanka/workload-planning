	<?php 
		$title = 'Plānošana';
		include("header.php");
	?>
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