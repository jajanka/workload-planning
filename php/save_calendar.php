<?php

if (isset($_POST['year']) && is_numeric($_POST['year'])) 
{
	echo $_POST['year'].'PHP';
	
	$insertQ = 'INSERT INTO calendar (day, e_shift, work_day, record_time) 
			VALUES (:day, :e_shift, :work_day, :record_time)';
	//$updateQ = 'UPDATE plan SET product = :product, record_time = :record_time WHERE pid = :pid';

	try
		{
		$pdo = $pgc->prepare($insertQ);
		$pdo->bindValue(':day', $plan_tile_id[0]);
		$pdo->bindValue(':e_shift', $plan_tile_id[1], PDO::PARAM_INT);
		$pdo->bindValue(':work_day', $plan_tile_id[2], PDO::PARAM_INT);
		$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
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
