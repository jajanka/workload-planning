<?php

$week_days = ['P', 'O', 'T', 'C', 'Pk', 'S', 'Sv'];
$month = ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', 'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'];
$monthNamesShort = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','dec'];

if (isset($_POST['get_year']) && is_numeric($_POST['get_year'])) 
{
	require('../../h/postgres_cmp.php');

	$year = $_POST['get_year'];
	$start_date = (string)$year."-01-01";
	$end_date = (string)$year."-12-31";

	$selectQ = "SELECT * FROM calendar WHERE week_day >= :start_date AND week_day <= :end_date ORDER BY week_day ASC";

	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindValue(':start_date', $start_date );
		$pdo->bindValue(':end_date', $end_date );
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);
		
		$today = date("Y-m-d", strtotime('-7 days'));
		$curMonth = 0;
		$curDay = 1;

		foreach ($res as $key => $value) {
			if ( date("n",strtotime($value[0])) != $curMonth)
			{		
				echo '<tr><td id="'.$monthNamesShort[$curMonth].'" colspan="6" style="text-align:center; background-color:#337AB7; color: #fff; font-size: 16px;">'.$month[$curMonth].'</td></tr>';
			}
			$curMonth = date("n",strtotime($value[0]));
			//$curMonth = ($curMonth > 10) ? 11 : $curMonth;
			echo '<tr>
		        <td style="color: #999;">'.$curDay.'.</td>
		        <td id="'.$value[0].'"><strong>'.$value[0].' </strong>'.$week_days[date("N", strtotime($value[0]))-1].'</td>
		        <td class="'.(($value[1])? "danger":"").'">
		        	<div class="checkbox">
					  <label>
					    <label class="checkbox-inline">
						  <input type="checkbox" id="inlineCheckbox1" value="option1" '.(($value[1])? "checked":"unchecked").'
						  	'.( ($value[0] <= $today ) ? "disabled":"").'> Brīvs
						</label>
					  </label>
					</div>
				</td>
		        <td class="'.(($value[2])? "danger":"").'">
		        	<div class="checkbox">
					  <label>
					    <label class="checkbox-inline">
						  <input type="checkbox" id="inlineCheckbox1" value="option1" '.(($value[2])? "checked":"unchecked").'
						  	'.( ($value[0] <= $today ) ? "disabled":"").'> Brīvs
						</label>
					  </label>
					</div>
				</td>
		        <td class="'.(($value[3])? "danger":"").'">
		        	<div class="checkbox">
					  <label>
					    <label class="checkbox-inline">
						  <input type="checkbox" id="inlineCheckbox1" value="option1" '.(($value[3])? "checked":"unchecked").'
						  	'.( ($value[0] <= $today ) ? "disabled":"").'> Brīvs
						</label>
					  </label>
					</div></td>
				<td>
				</td>

		      </tr>';
		      $curDay++;
		}	
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}

	$pdo = NULL;
	$pgc = NULL;
}
else 
{
	require('../h/postgres_cmp.php');

	//$sequance = trim($_POST['sequance']);
	$selectQ = "SELECT DISTINCT EXTRACT(YEAR FROM week_day) FROM calendar ORDER BY EXTRACT(YEAR FROM week_day) ASC";

	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		foreach ($res as $key => $value) {
			// id this is current year then set it as combo box default value
			if ( date('Y') == $value[0] ) 
			{
				 echo '<option value="'.$value[0].'" selected="selected">'.$value[0].'</option>';
			}
			else 
			{
				echo '<option value="'.$value[0].'">'.$value[0].'</option>';
			}
		}		

	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}
	$pdo = NULL;
	$pgc = NULL;
}

?>