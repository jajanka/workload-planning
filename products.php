	<?php 
		$title = 'Produkti';
		include("header.php");
	?>
		<script type="text/javascript" src="js/product.js"></script>
		<div class="container">

		<div class="panel panel-primary" style="margin-top: 20px;">
	    <div class="panel-heading">...</div>
	    <div class="panel-body">
	    	<div class="form-inline">
				<div class="form-group">
					<label for="bttn-add-year">Pievienot produktu</label>
					<div class="form-inline">
				    	<input type="text" class="form-control" id="add-year" maxlength="4" placeholder="...">
				    	<button type="submit" class="btn btn-primary" id="bttn-add-year" style="margin-right: 20px;">...</button>
				  	</div>
				</div>

				<div class="form-group" style="float: right; margin-top: 25px;">
					
					<div class="form-inline">
					<label for="bttn-save-year">Saglabāt izmaiņas</label>
						<button type="submit" class="btn btn-success" id="bttn-save-products">Saglabāt</button>
					</div> 
				</div>

			</div>
	    </div>
	  </div>

	  <div id="message"></div>
		                        
		  <div class="table-responsive" style="margin-top: 20px;">  
		  <div class="form-inline">
				<label for="bttn-add-product" id="labelProduct">Produkti
				<button type="submit" class="btn btn-default" id="bttn-add-product"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></label>
				
			</div>
		  
		  <table class="table table-striped" id="productsTable">
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
	      	<textarea class="form-control custom-control" rows="3" style="resize:none"></textarea>
	        <div class="table-responsive" style="margin-top: 20px;">        
			  <table class="table table-striped" id="productsInfoTable">
			    <thead>
			      <tr>
			        <th>Mašīna</th>
			        <th>Komantārs</th>
			      </tr>
			    </thead>
			    <tbody>

			    </tbody>
			  </table>
			  </div>
		    </div>
	      <div class="modal-footer">
	        <button type="button" class="btn btn-default" data-dismiss="modal">Aizvērt</button>
	        <button type="button" class="btn btn-success" id="bttn-save-modal"">Saglabāt</button>
	      </div>
	    </div><!-- /.modal-content -->
	  </div><!-- /.modal-dialog -->
	</div><!-- /.modal -->

	<footer class="footer">
      © 2015 - Jānis Mateuss  
	</footer>
	</body>
</html>