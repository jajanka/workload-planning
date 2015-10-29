<?php
$a = $_GET['q'];
//echo json_encode(['Alabama', 'Alaska', 'Arizona']);
if (isset($_GET['q'])) 
{

	require('../../h/postgres_cmp.php');

	$results = array();
	$query = $_GET['q'].'%'; // add % for LIKE query later

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
?>