<?php

if (isset($_POST['modalP']) && is_numeric($_POST['tableP'])) 
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
		$curDay = 1;
		foreach ($res as $key => $value) {
 $curDay++;
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