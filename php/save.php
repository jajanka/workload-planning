<?php

if (isset($_POST['json'])) // 
{
	require_once('../../h/postgres_cmp.php');
	// accept JSON parameter (and Un-quote string if needed)
	$p = stripslashes($_POST['json']);
	// decode JSON object
	$arr = json_decode($p);

	$q = 'INSERT INTO plan (p_date,machine,e_shift,product,record_time) 
			VALUES (:p_date, :machine, :e_shift, :product, :record_time)';

	for ($i=0; $i < count($arr); $i++) { 

		$plan_tile_id = explode('/', $arr[$i][0]);

		try
		{
			$pdo = $pgc->prepare($q);
			$pdo->bindValue(':p_date', $plan_tile_id[0]);
			$pdo->bindValue(':machine', $plan_tile_id[1]);
			$pdo->bindValue(':e_shift', $plan_tile_id[2], PDO::PARAM_INT);
			$pdo->bindValue(':product', $arr[$i][1], PDO::PARAM_STR);
			$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
			$pdo->execute();
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}
	}

	// for demo purpose only return accepted JSON data
	//print_r($arr);
}
?>