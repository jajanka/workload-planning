		<!-- main container -->
 		<div class="container">
			<!-- tables inside this DIV could have draggable content -->
			<div class="panel panel-primary panel-fixed">
			<div class="panel-body">
				<div class="form-inline" style="float:left; margin-left: 10px;"> 
					<div class="form-group wrapper-actions-option">
				     	<div class="form-inline">
			                <div class="input-daterange input-group col-xs-8" id="datepicker">
			                	<span class="input-group-addon">no</span>
			                    <input id="datepickerFrom" type="text" class="input-sm form-control popupDatepicker" name="start" /> 
			                    <span class="input-group-addon">līdz</span>
			                    <input id="datepickerFrom" type="text" class="input-sm form-control popupDatepicker" name="end" />
			                </div>
		                	<button type="button" class="btn btn-sm btn-primary tooltip-error" id="gen-table-bttn" data-placement="bottom" title="">Parādīt laika periodu</button>
		                </div>
		            </div>
		            <?php
		            if ( $_SESSION['login_user'] == 'admin' )
		            {
			            echo '<div class="form-group wrapper-actions-option">
				            <div class="form-inline">
				            	<button type="button" class="btn btn-sm btn-success info tooltip-error" aria-label="Left Align" id="bttn-prod-info" data-dismiss="modal" data-backdrop="false" data-placement="bottom" title="">
								  <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
								</button>

								<input id="product" type="text" class="input-sm form-control" data-provide="typeahead" autocomplete="off" placeholder="Produkts"/>
					            <input id="quantity" type="number" min="0" step="1" class="input-sm form-control" placeholder="Kg" />

					            <div class="btn-group tooltip-error" role="group" aria-label="Pievienošana" id="add-group-btn" data-placement="bottom" title="">
								  <button type="button" class="btn btn-sm btn-primary" id="gen-prod-bttn"	>Pievienot</button>
								  <button type="button" class="btn btn-sm btn-primary" id="gen-prod-shift-bttn">Pievienot ar pārbīdi</button>
								</div>
							</div>
						</div>';
					}
					?>
				</div>
			</div>
			</div>
			</div>
				<div id="status"><div>Iezīmēts: 0</div></div>
				<!-- right container -->
				<table class="left-header">
					<div id="leftUppercorner"><button type="submit" class="btn btn-default" id="deselect-machine-bttn"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>
				</table>
				<div id="right" >
				<div id="today-line"></div>
					<div id='ajax_loader' style="position: fixed; left: auto; width: 100%; height: 100%; background-color: #EEEEEE; display: block; z-index: 101;">
					    <!--<img src="css/images/ring-alt.gif" style="display: block; margin: auto; position: relative; top: 50%; transform: translateY(-50%);"></img> -->
					     <div class="spinner">
						  <div class="rect1"></div>
						  <div class="rect2"></div>
						  <div class="rect3"></div>
						  <div class="rect4"></div>
						  <div class="rect5"></div>
						</div>
					</div>


					<table class="table1-header">	
					 	<tr class="header-day">
				            <!-- <td class="redips-mark blank"></td> -->
				        </tr>				  
				        <tr class="header-time">
				            <!-- <td class="redips-mark blank"></td> -->
				        </tr>
					</table>

					<table class="table-container">
						<tr>
						<td style="border-color: transparent;">
							
						</td>
						
						<div id="history-mark" style="position: absolute; background-color: rgba(230,230,230, 0.5); z-index: 4;"></div>

						<td style="border-color: transparent;">
							<table id="table2">
								<tbody>
								</tbody>
							</table>
						</td>
						</tr>
					</table>
				</div><!-- right container -->
			
		<!-- Modal -->
	    <div class="modal" id="marked-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	        <div class="modal-dialog modal-sm">
	            <div class="modal-content" style="width:150px">
	            
	                <div class="modal-body">                
	                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="move-marked-bttn" style="width:100%;"><span class="glyphicon glyphicon-fullscreen"></span> Pārvietot</button><br />
	                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="copy-marked-bttn" title="Atcelt" style="width:100%;"><span class="glyphicon glyphicon-copy"></span> Kopēt</button>
	                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="cut-marked-bttn" style="width:100%;"><span class="glyphicon glyphicon-scissors"></span> Izgriezt</button><br />
	                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="paste-marked-bttn" title="Atcelt" style="width:100%;"><span class="glyphicon glyphicon-paste"></span> Ielīmēt</button>
	                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="delete-marked-bttn" style="width:100%;"><span class="glyphicon glyphicon-remove"></span> Dzēst</button><br />
	                </div>
	                
	            </div>
	        </div>
	    </div>

	    <div class="modal bs-example-modal-sm" id="error-modal" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">
		  <div class="modal-dialog modal-sm">
		    <div class="modal-content panel-danger">
		      <div class="modal-header panel-heading">
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		        <p class="modal-title"><strong>Kļūda!</strong> Produkti neietilpst tabulā.</p>
		      </div>
		    </div>
		  </div>
		</div>

		<div class="modal" id="productModal">
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
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		</div><!-- /.modal -->

		<div class="modal" id="successModal" style="z-index: 1051 !important;">
		  <div class="modal-dialog">
		    <div class="modal-content panel-success">
		      <div class="modal-header panel-heading">
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		        <h4 class="modal-title">Kopsavilkums</h4>
		      </div>
		      <div class="modal-body">
		        <p>One fine body</p>
		      </div>
		      <div class="modal-footer">
		        <button type="button" class="btn btn-default" data-dismiss="modal">Aizvērt</button>
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		</div><!-- /.modal -->


		<div class="modal" id="produceModal">
		  <div class="modal-dialog">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		        <h4 class="modal-title">Ražošana</h4>
		      </div>
		      <div class="modal-body">

		      	<div class="form-group">
		      	<label for="bttn-add-year">Izvēlēties intervālu</label>
			     	<div class="form-inline">
		                <div class="input-daterange input-group col-xs-8" id="datepicker">
		                	<span class="input-group-addon">no</span>
		                    <input id="datepickerFrom" type="text" class="input form-control popupDatepickerProduce" name="produceStart" /> 
		                    <span class="input-group-addon">līdz</span>
		                    <input id="datepickerFrom" type="text" class="input form-control popupDatepickerProduce" name="produceEnd" />
		                </div>
	                	<button type="button" class="btn btn-primary tooltip-error" id="interval-bttn" data-placement="bottom" title="">Parādīt</button>
	                </div>
	            </div>

		        <div class="table-responsive">        
				  <table class="table table-striped" id="produceTable">
				    <thead>
				      <tr>
				     	<th>Fiksēts</th>
				        <th>Produkts</th>
				        <th>Atlicis saražot (kg)</th>
				        <th>Veikt izmaiņas</th>
				      </tr>
				    </thead>
				    <tbody>

				    </tbody>
				  </table>
				  </div>
			    </div>
		      <div class="modal-footer">
		        <button type="button" class="btn btn-default" data-dismiss="modal">Aizvērt</button>
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		</div><!-- /.modal -->