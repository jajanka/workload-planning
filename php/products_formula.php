<?php

if (isset($_POST['kg']) && isset($_POST['prod'])) 
{
	require('../../h/postgres_cmp.php');

	$kg = $_POST['kg'];
	$prod = $_POST['prod'];
	$res = '';

	$selectQ = 'SELECT weigth, m_speed, efficiency_percentage FROM products WHERE p_name = UPPER(:product) LIMIT 1';
	
	try
	{

		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':product', $prod, PDO::PARAM_STR);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ($pdo->rowCount() > 0)
		{
			$kg_h = number_format($res[0][1] * 60 * $res[0][0] / 1000 / 1000 * $res[0][2] / 100, 3); 
			$resultCount = number_format( (($kg / $kg_h) / 7.5), 2);
			echo  json_encode( (int)str_replace(',', '', $resultCount) );
		}
		else {
			echo '';
		}
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}
	$pgc = NULL;
}

?>