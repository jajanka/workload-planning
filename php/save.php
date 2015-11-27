<?php

if (isset($_POST['upsert']) && isset($_POST['del'])) // 
{
	require('../../h/postgres_cmp.php');
	// accept JSON parameter (and Un-quote string if needed)
	$u = stripslashes($_POST['upsert']);
	$d = stripslashes($_POST['del']);
	// decode JSON object
	$u_arr = json_decode($u, true);
	$d_arr = json_decode($d);
	//print_r($u_arr);
	//print_r($d_arr);

	$selectQ = "SELECT pid FROM plan WHERE p_date = :p_date AND machine = :machine AND e_shift = :e_shift";
	$insertQ = 'INSERT INTO plan (p_date, machine, e_shift, product, kg, record_time) 
			VALUES (:p_date, :machine, :e_shift, :product, :kg, :record_time)';
	$updateQ = 'UPDATE plan SET product = :product, kg = :kg, record_time = :record_time WHERE pid = :pid';
	$deleteQ = 'DELETE FROM plan 
			WHERE p_date = :p_date AND machine = :machine AND e_shift = :e_shift';

	foreach ($u_arr as $key => $val) {	// select, insert, update

		$plan_tile_id = explode('/', $key);
		try
		{
			// select query
			$pdo = $pgc->prepare($selectQ);
			$pdo->bindValue(':p_date', $plan_tile_id[0]);
			$pdo->bindValue(':machine', $plan_tile_id[1]);
			$pdo->bindValue(':e_shift', $plan_tile_id[2], PDO::PARAM_INT);
			$pdo->execute();
			$res = $pdo->fetchAll(PDO::FETCH_NUM);
			$pid = ($pdo->rowCount() > 0 ? $res[0][0] : 0);

			if ($pdo->rowCount() > 0) // if record returned then update the old record
			{
				$pdo = $pgc->prepare($updateQ);
				$pdo->bindValue(':product', $val['product'], PDO::PARAM_STR);
				$pdo->bindValue(':kg', $val['kg']);
				$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
				$pdo->bindValue(':pid', $pid, PDO::PARAM_INT);
				$pdo->execute();
			}
			else // if no records were returned then insert new record in database
			{
				$pdo = $pgc->prepare($insertQ);
				$pdo->bindValue(':p_date', $plan_tile_id[0]);
				$pdo->bindValue(':machine', $plan_tile_id[1]);
				$pdo->bindValue(':e_shift', $plan_tile_id[2], PDO::PARAM_INT);
				$pdo->bindValue(':product', $val['product'], PDO::PARAM_STR);
				$pdo->bindValue(':kg', $val['kg']);
				$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
				$pdo->execute();
			}
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}
	}
	$pdo = NULL;
	$pgc = NULL;

	require('../../h/postgres_cmp.php');
	// delete records from database
	foreach ($d_arr as $key => $val) {

		$plan_tile_id = explode('/', $key);

		try
		{
			$pdo = $pgc->prepare($deleteQ);
			$pdo->bindValue(':p_date', $plan_tile_id[0]);
			$pdo->bindValue(':machine', $plan_tile_id[1]);
			$pdo->bindValue(':e_shift', $plan_tile_id[2], PDO::PARAM_INT);
			$pdo->execute();
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}
	}

	$pdo = NULL;
	$pgc = NULL;
}
?>