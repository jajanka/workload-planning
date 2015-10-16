<?php

if (isset($_POST['startDate']) && isset($_POST['endDate']))
{
	require_once('../../h/postgres_cmp.php');

	//$sequance = trim($_POST['sequance']);
	$q = "SELECT p_date, machine, e_shift, product FROM plan WHERE p_date >= :startDate AND p_date <= :endDate";

	try
	{
		$pdo = $pgc->prepare($q);
		$pdo->bindValue(':startDate', $_POST['startDate']);
		$pdo->bindValue(':endDate', $_POST['endDate']);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_ASSOC);

		if ($pdo->rowCount() > 0)
		{
			echo json_encode($res);
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