	<?php 
		$title = 'Produkti';
		include("header.php");
	?>
		<script type="text/javascript" src="js/calendar.js"></script>
		<div class="container">

		<div class="panel panel-primary" style="margin-top: 20px;">
	    <div class="panel-heading">...</div>
	    <div class="panel-body">
	    	<div class="form-inline">
				<div class="form-group">
					<label for="bttn-add-year">...</label>
					<div class="form-inline">
				    	<input type="text" class="form-control" id="add-year" maxlength="4" placeholder="...">
				    	<button type="submit" class="btn btn-primary" id="bttn-add-year" style="margin-right: 20px;">...</button>
				  	</div>
				</div>

				<div class="form-group">
					<label for="bttn-show-year">...</label>
					<div class="form-inline">
						<select class="form-control" id="getYear">
						</select>
						<button type="submit" class="btn btn-primary" id="bttn-show-year">...</button>
					</div> 
				</div>
				<div class="form-group" style="float: right; margin-top: 25px;">
					
					<div class="form-inline">
					<label for="bttn-save-year">...</label>
						<button type="submit" class="btn btn-success" id="bttn-save-year">...</button>
					</div> 
				</div>

			</div>
	    </div>
	  </div>

	  <div id="message"></div>
		                        
		  <div class="table-responsive" style="margin-top: 20px;">      
		  <h2>Produkti</h2>    
		  <table class="table table-striped" id="productsTable">
		    <thead>
		      <tr>
		        <th>#</th>
		        <th>Produkts</th>
		        <th>Svars</th>
		        <th>m/min</th>
		        <th>Kg/h</th>
		        <th>Mašīnu skaits</th>
		        <th>Kopējais kg/h</th>
		        <th>Efektivitāte</th>
		      </tr>
		    </thead>
		    <tbody>
		    <?php
		    	include('php/products_load.php');
		    ?>
		    </tbody>
		  </table>
		  </div>
		</div><!-- main container -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>
	</body>
</html>