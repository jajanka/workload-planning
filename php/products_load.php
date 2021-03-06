<?php

$is_admin = false;
if ( $_SESSION['login_user'] == 'admin' ) 
{
	$is_admin = true;
}

require('../h/postgres_cmp.php');

$selectQ = "SELECT * FROM products ORDER BY p_name";

try
{
	$pdo = $pgc->prepare($selectQ);
	$pdo->execute();
	$res = $pdo->fetchAll(PDO::FETCH_NUM);
	
	foreach ($res as $key => $value) {
		// =C117*60*B117/1000/1000*L117/100
		$kg_h = number_format($value[3] * 60 * $value[2] / 1000 / 1000 * $value[5] / 100, 3); 
		$total_kg_h = number_format($kg_h * $value[4], 3);

		echo '<tr>
			<td><button type="button" class="btn btn-success info" aria-label="Left Align" id="'.$value[1].'" name="'.$value[0].'">
			  <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
			</button>
			</td>
	        <td '.( $is_admin ? 'class="td1" contenteditable="true"': '').'>'.$value[1].'</td>
	        <td '.( $is_admin ? 'class="td2" contenteditable="true"': '').'>'.$value[2].'</td>
	        <td '.( $is_admin ? 'class="td3" contenteditable="true"': '').'>'.$value[3].'</td>
	        <td class="td4" style="color: #888">'.$kg_h.'</td>
	        <td class="td5" style="color: #888">'.$value[4].'</td>
	        <td class="td6" style="color: #888">'.$total_kg_h.'</td>
	        <td '.( $is_admin ? 'class="td7" contenteditable="true"': '').'>'.$value[5].'</td>
	        <td>'.( $is_admin ? '<button type="button" 
	        class="btn btn-danger delete hidden" aria-label="Left Align" id="del'.$value[0].'">
	        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>':'').'
	       </td>
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

?>