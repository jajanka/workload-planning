<?php

$week_days = ['P', 'O', 'T', 'C', 'Pk', 'S', 'Sv'];
$month = ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', 'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris'];


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
		
		$curMonth = 0;
		foreach ($res as $key => $value) {
			if ( date("n",strtotime($value[0])) != $curMonth)
			{		
				echo '<tr><td colspan="5" style="text-align:center; background-color:#337AB7; color: #fff; font-size: 16px;">'.$month[$curMonth].'</td></tr>';
			}
			$curMonth = date("n",strtotime($value[0]));
			//$curMonth = ($curMonth > 10) ? 11 : $curMonth;
			echo '<tr>
		        <td></td>
		        <td id="'.$value[0].'">'.$value[0].' <span style="font-weight: bold;">'.$week_days[date("N", strtotime($value[0]))-1].'</span></td>
		        <td class="'.(($value[1])? "danger":"").'"><div class="checkbox">
					  <label>
					    <label class="checkbox-inline">
						  <input type="checkbox" id="inlineCheckbox1" value="option1" '.(($value[1])? "checked":"unchecked").'> Brīvs
						</label>
					  </label>
					</div></td>
		        <td class="'.(($value[2])? "danger":"").'"><div class="checkbox">
					  <label>
					    <label class="checkbox-inline">
						  <input type="checkbox" id="inlineCheckbox1" value="option1" '.(($value[2])? "checked":"unchecked").'> Brīvs
						</label>
					  </label>
					</div></td>
		        <td class="'.(($value[3])? "danger":"").'"><div class="checkbox">
					  <label>
					    <label class="checkbox-inline">
						  <input type="checkbox" id="inlineCheckbox1" value="option1" '.(($value[3])? "checked":"unchecked").'> Brīvs
						</label>
					  </label>
					</div></td>

		      </tr>';
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
			echo '<option value="'.$value[0].'">'.$value[0].'</option>';
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