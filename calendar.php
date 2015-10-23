	<?php 
		$title = 'Kalendārs';
		include("header.php");
	?>
		<script type="text/javascript" src="js/calendar.js"></script>
		<div class="container">

		<div class="panel panel-primary" style="margin-top: 20px;">
	    <div class="panel-heading">Kalendārs</div>
	    <div class="panel-body">
	    	<div class="form-inline">
				<div class="form-group">
					<label for="bttn-add-year">Pievienot gadu</label>
					<div class="form-inline">
				    	<input type="text" class="form-control" id="add-year" maxlength="4" placeholder="Gads">
				    	<button type="submit" class="btn btn-primary" id="bttn-add-year">Labi</button>
				  	</div>
				</div>

				<div class="form-group" style="margin-left: 20px;">
					<label for="bttn-add-year">Parādīt gadu</label>
					<div class="form-inline">
						<select class="form-control" id="getYear">
						<?php
							include('php/calendar_load.php');
						?>
						</select>
						<button type="submit" class="btn btn-primary" id="bttn-show-year">Labi</button>
					</div> 
				</div>
			</div>
	    </div>
	  </div>

		                        
		  <div class="table-responsive" style="margin-top: 20px;">      
		  <h2>Kalendārs</h2>    
		  <table class="table table-striped" id="calendarTable">
		    <thead>
		      <tr>
		        <th>#</th>
		        <th>Datums</th>
		        <th>1. maiņa (22..06)</th>
		        <th>2. maiņa (06..14)</th>
		        <th>3. maiņa (14..22)</th>
		      </tr>
		    </thead>
		    <tbody>

		    </tbody>
		  </table>
		  </div>
		</div><!-- main container -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>
	</body>
</html>