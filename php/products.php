<?php

//echo json_encode(['Alabama', 'Alaska', 'Arizona']);
if (isset($_POST['q'])) 
{

	require('../../h/postgres_cmp.php');

	$results = array();
	$query = $_POST['q'].'%'; // add % for LIKE query later

	$selectQ = 'SELECT p_name FROM products WHERE p_name LIKE :query';
	
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

else if (isset($_POST['product'])) 
{

	require('../../h/postgres_cmp.php');

	$prod = $_POST['product'];
	$res = '';

	$selectQ = 'SELECT allowed_machines FROM products WHERE p_name = :product LIMIT 1';
	
	try
	{

		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':product', $prod, PDO::PARAM_STR);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		echo json_encode($res);
		
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}
	$pgc = NULL;
}
?>