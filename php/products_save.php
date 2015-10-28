<?php

if (isset($_POST['upsert']) && isset($_POST['del'])) 
{
	require('../../h/postgres_cmp.php');

	$upsert = json_decode($_POST['upsert'], true);
	$del = json_decode($_POST['del'], true);

	
	$insertQ = "INSERT INTO products (p_name, weigth, m_speed, efficiency_percentage, allowed_machines, record_time) 
			VALUES (:p_name, :weigth, :m_speed, :efficiency_percentage, :allowed_machines, :record_time)";
	$updateQ = "UPDATE products SET p_name = :p_name, weigth = :weigth, m_speed = :m_speed, 
			efficiency_percentage = :efficiency_percentage, allowed_machines = :allowed_machines, 
			record_time = :record_time WHERE pid = :pid";
	$deleteQ = "DELETE FROM products WHERE pid = :pid";
	//print_r($del);
	try
	{
		foreach ($del as $key => $value) 
		{ // delete records
			$pdo = $pgc->prepare($deleteQ);
			$pdo->bindValue(':pid', $value, PDO::PARAM_INT);
			$pdo->execute();
		}	
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}

	try
	{
		foreach ($upsert as $key => $value) 
		{
			if ($value['status'] == 'moded') 
			{
				$pdo = $pgc->prepare($updateQ);
				$pdo->bindValue(':p_name', $value['name'], PDO::PARAM_STR);
				$pdo->bindValue(':weigth', $value['weight'], PDO::PARAM_INT);
				$pdo->bindValue(':m_speed', $value['m_min'], PDO::PARAM_INT);
				$pdo->bindValue(':efficiency_percentage', $value['eff'], PDO::PARAM_INT);
				$pdo->bindValue(':allowed_machines', json_encode($value['modal']));
				$pdo->bindValue(':pid', $value['pid'], PDO::PARAM_INT);
				$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
				$pdo->execute();
			}
			else if ($value['status'] == 'new') 
			{
				$pdo = $pgc->prepare($insertQ);
				$pdo->bindValue(':p_name', $value['name'], PDO::PARAM_STR);
				$pdo->bindValue(':weigth', $value['weight'], PDO::PARAM_INT);
				$pdo->bindValue(':m_speed', $value['m_min'], PDO::PARAM_INT);
				$pdo->bindValue(':efficiency_percentage', $value['eff'], PDO::PARAM_INT);
				$pdo->bindValue(':allowed_machines', json_encode($value['modal']));
				$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
				$pdo->execute();
			}
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