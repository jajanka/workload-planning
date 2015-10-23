<?php
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

?>