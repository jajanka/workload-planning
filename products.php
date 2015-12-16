	<?php 
		include('php/session.php');
		$title = 'Produkti · Culimeta';
		include("header.php");
	?>
		<div class="container-other">
		                        
		  <div class="table-responsive" style="margin-top: 20px;">  
		  <div class="form-inline" style="max-width: 960px; margin: 0px auto">
				<label for="bttn-add-product" id="labelProduct">Produkti
			<?php
			if ( $_SESSION['login_user'] == 'admin' ) {
				echo '<button type="submit" class="btn btn-default" id="bttn-add-product"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></label>';
			}
			?>
				
		  </div>

		  <div id="message"></div>

		  <table class="table table-striped" id="productsTable">
		  	<div id='ajax_loader' style="background-color: #FFF; display: none; z-index: 10; margin: auto 0px;">
			    <div class="spinner">
				  <div class="rect1"></div>
				  <div class="rect2"></div>
				  <div class="rect3"></div>
				  <div class="rect4"></div>
				  <div class="rect5"></div>
				</div>
			</div>
		    <thead class="persist-header">
		      <tr>
		        <th>Info</th>
		        <th>Produkts</th>
		        <th>Svars</th>
		        <th>m/min</th>
		        <th>Kg/h</th>
		        <th>Mašīnu skaits</th>
		        <th>Kopējais kg/h</th>
		        <th>Efektivitāte %</th>
		        <th style="width: 50px;"></th>
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


	<div class="modal fade" id="productModal">
	  <div class="modal-dialog">
	    <div class="modal-content">
	      <div class="modal-header">
	        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        <h4 class="modal-title">Modal title</h4>
	      </div>
	      <div class="modal-body">
	      	<textarea class="form-control custom-control" rows="3" style="resize:none" id="overallComment"></textarea>
	        <div class="table-responsive">        
			  <table class="table table-striped" id="productsInfoTable">
			    <thead>
			      <tr>
			        <th>Mašīna</th>
			        <th>Komentārs</th>
			      </tr>
			    </thead>
			    <tbody>

			    </tbody>
			  </table>
			  </div>
		    </div>
	      <div class="modal-footer">
	        <button type="button" class="btn btn-default" data-dismiss="modal">Aizvērt</button>
	      <?php
	      if ( $_SESSION['login_user'] == 'admin' ){
	        echo '<button type="button" class="btn btn-success" data-dismiss="modal" id="bttn-save-modal">Saglabāt</button>';
	      }
	      ?>
	      </div>
	    </div><!-- /.modal-content -->
	  </div><!-- /.modal-dialog -->
	</div><!-- /.modal -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>

	<a href="#0" class="cd-top">Top</a>
	</body>

	<?php include("footer.html"); ?>
	<script type="text/javascript" src="js/jquery.toaster.js"></script>
	<script type="text/javascript" src="js/product.js"></script>
	<script type="text/javascript" src="js/totop.js"></script>

</html>