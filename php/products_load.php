<?php

require('../h/postgres_cmp.php');

$selectQ = "SELECT * FROM products";

try
{
	$pdo = $pgc->prepare($selectQ);
	$pdo->execute();
	$res = $pdo->fetchAll(PDO::FETCH_NUM);
	
	$curProduct = 1;
	foreach ($res as $key => $value) {
		// =C117*60*B117/1000/1000*L117/100
		$kg_h = number_format($value[3] * 60 * $value[2] / 1000 / 1000 * $value[5] / 100, 3); 
		$total_kg_h = number_format($value[4] / $kg_h, 3);

		echo '<tr>
			<td><button type="button" class="btn btn-default" aria-label="Left Align" id="p'.$value[0].'">
			  <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
			</button>
			</td>
	        <td>'.$value[1].'</td>
	        <td>'.$value[2].'</td>
	        <td>'.$value[3].'</td>
	        <td>'.$kg_h.'</td>
	        <td>'.$value[4].'</td>
	        <td>'.$total_kg_h.'</td>
	        <td>'.$value[5].' %</td>
	      </tr>';

	     $curProduct++;
	}	
}
catch(PDOException $e)
{
    $pgc = NULL;
    die('error in gc function => ' . $e->getMessage());
}

$pdo = NULL;
$pgc = NULL;

?>