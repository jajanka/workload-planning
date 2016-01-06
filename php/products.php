<?php

//echo json_encode(['Alabama', 'Alaska', 'Arizona']);
if (isset($_POST['q'])) 
{

	require('../../h/postgres_cmp.php');

	$results = array();
	$query = $_POST['q'].'%'; // add % for LIKE query later

	$selectQ = 'SELECT p_name FROM products WHERE  UPPER(p_name) LIKE UPPER(:query)';
	
	try
	{

		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':query', $query, PDO::PARAM_STR);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		foreach ($res as $key => $value) 
		{
			$results[] = $value[0];
		}
		echo json_encode($results);
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}
	$pgc = NULL;
}

else if ( isset($_POST['product']) && isset($_POST['view']) ) 
{

	require('../../h/postgres_cmp.php');

	$prod = $_POST['product'];
	$view = $_POST['view'];
	$resMachines = array();

	$selectQ = 'SELECT allowed_machines FROM products WHERE UPPER(p_name) = UPPER(:product) LIMIT 1';
	
	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':product', $prod, PDO::PARAM_STR);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		$resMachines = $res;
		
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}


	$viewStart = 0;
	$selectQ = 'SELECT SUM(machine_count) FROM cm_machine_views WHERE view_order < :view_order';
	
	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':view_order', $view, PDO::PARAM_INT);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ( !empty($res) ){
			if ( $res[0][0] != '' ){
				$viewStart = $res[0][0];
			}
			else {
				$viewStart = 0;
			}
		}
		else {
			$viewStart = 0;
		}

		if ( empty($resMachines) )
		{
			echo '[]';
		}
		else
		{
			if ( strlen($resMachines[0][0]) > 2 )
			{
				$infoArr = json_decode($resMachines[0][0], true);
				$infoArr["viewStart"] = $viewStart;
				echo json_encode($infoArr);
			}
			else {
				echo json_encode(["viewStart" => $viewStart]);
			}

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