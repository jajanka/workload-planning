	<?php 
		include('php/session.php');
		if ( $_SESSION['login_user'] != 'admin' )
		{
			header("location: index.php");
		}
		$title = 'Kalendārs';
		include("header.php");
	?>
		<div class="container-other">

		<div class="panel panel-primary" style="margin-top: 20px;">
	    <div class="panel-heading">Kalendārs</div>
	    <div class="panel-body">
	    	<div class="form-inline">
				<div class="form-group">
					<label for="bttn-add-year">Pievienot gadu</label>
					<div class="form-inline">
				    	<input type="text" class="form-control" id="add-year" maxlength="4" placeholder="Gads">
				    	<button type="submit" class="btn btn-primary" id="bttn-add-year" style="margin-right: 20px;">Labi</button>
				  	</div>
				</div>

				<div class="form-group">
					<label for="bttn-show-year">Parādīt gadu</label>
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

	  <div id="message"></div>
		                        
		  <div class="table-responsive" style="margin-top: 20px;">        
		  <table class="table table-striped" id="calendarTable">
		  	<h2>Kalendārs</h2>  
		  	<div id='ajax_loader' style="width: 100%; height: 100px; background-color: #FFF; display: none; z-index: 10; margin: auto 0px;">
			    <div class="cssload-loader-inner">
					<div class="cssload-cssload-loader-line-wrap-wrap">
						<div class="cssload-loader-line-wrap"></div>
					</div>
					<div class="cssload-cssload-loader-line-wrap-wrap">
						<div class="cssload-loader-line-wrap"></div>
					</div>
					<div class="cssload-cssload-loader-line-wrap-wrap">
						<div class="cssload-loader-line-wrap"></div>
					</div>
					<div class="cssload-cssload-loader-line-wrap-wrap">
						<div class="cssload-loader-line-wrap"></div>
					</div>
					<div class="cssload-cssload-loader-line-wrap-wrap">
						<div class="cssload-loader-line-wrap"></div>
					</div>
				</div>
			</div>
		    <thead class="persist-header">
		      <tr>
		        <th>#</th>
		        <th>Datums</th>
		        <th>1. maiņa 22:00 - 06:00</th>
		        <th>2. maiņa 06:00 - 14:00</th>
		        <th>3. maiņa 14:00 - 22:00</th>
		      </tr>
		    </thead>
		    <tbody>
		    <?php
		    # current location
		    $start_url = "http" . (($_SERVER['SERVER_PORT'] == 443) ? "s://" : "://") . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		    $arr = explode('/', $start_url);
		    # pop last element
		    array_pop($arr);
		    # direction to php file to POST
		    $url = implode('/', $arr).'/php/calendar_load.php';

		    // POST to PHP file, get table content
			$data = array('get_year' => date("Y"));

			// use key 'http' even if you send the request to https://...
			$options = array(
			    'http' => array(
			        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			        'method'  => 'POST',
			        'content' => http_build_query($data),
			    ),
			);
			$context  = stream_context_create($options);
			$result = file_get_contents($url, false, $context);

			print_r($result);

		    ?>
		    </tbody>
		  </table>
		  </div>
		</div><!-- main container -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>
	</body>
	
	<?php include("footer.html"); ?>
	<script type="text/javascript" src="js/calendar.js"></script>
</html>