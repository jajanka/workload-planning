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
			<td><button type="button" class="btn btn-success info" aria-label="Left Align" id="'.$value[1].'" name="'.$value[0].'">
			  <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
			</button>
			</td>
	        <td class="td1">'.$value[1].'</td>
	        <td class="td2">'.$value[2].'</td>
	        <td class="td3">'.$value[3].'</td>
	        <td class="td4">'.$kg_h.'</td>
	        <td class="td5">'.$value[4].'</td>
	        <td class="td6">'.$total_kg_h.'</td>
	        <td class="td7">'.$value[5].'</td>
	        <td><button type="button" 
	        class="btn btn-danger delete hidden" aria-label="Left Align" id="del'.$value[0].'">
	        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
	       </td>
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