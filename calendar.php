	<?php 
		$title = 'Kalendārs';
		include("header.php");
	?>
		<script type="text/javascript" src="js/calendar.js"></script>
		<div class="container">

			<div class="form-inline">

				<div class="form-group">
					<label for="bttn-add-year">Pievienot gadu</label>
					<div class="form-inline">
				    	<input type="text" class="form-control" id="add-year" maxlength="4" placeholder="Gads">
				    	<button type="submit" class="btn btn-primary" id="bttn-add-year">Labi</button>
				  	</div>
				</div>

				<div class="form-group" style="margin-left: 20px;">
					<label for="bttn-add-year">Pievienot gadu</label>
					<div class="form-inline">
						<select class="form-control">
						    <option value="one">One</option>
						    <option value="two">Two</option>
						    <option value="three">Three</option>
						    <option value="four">Four</option>
						    <option value="five">Five</option>
						</select>
						<button type="submit" class="btn btn-primary" id="bttn-add-year">Labi</button>
					</div> 
				</div>
			</div>

		</div><!-- main container -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>
	</body>
</html>