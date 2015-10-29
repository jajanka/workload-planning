<?php

if (isset($_POST['upsert']) && isset($_POST['del'])) 
{
	require('../../h/postgres_cmp.php');

	$upsert = json_decode($_POST['upsert'], true);
	$del = json_decode($_POST['del'], true);

	$duplicates = array();
	
	$insertQ = "INSERT INTO products (p_name, weigth, m_speed, efficiency_percentage, allowed_machines, record_time) 
			VALUES (:p_name, :weigth, :m_speed, :efficiency_percentage, :allowed_machines, :record_time)";
	$updateQ = "UPDATE products SET p_name = :p_name, weigth = :weigth, m_speed = :m_speed, 
			efficiency_percentage = :efficiency_percentage, allowed_machines = :allowed_machines, 
			record_time = :record_time WHERE pid = :pid";
	$deleteQ = "DELETE FROM products WHERE pid = :pid";
	$selectQ = "SELECT pid FROM products WHERE p_name = :p_name";
	
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
				$pdo = $pgc->prepare($selectQ);
				$pdo->bindValue(':p_name', $value['name'], PDO::PARAM_STR);
				$pdo->execute();

				// if new records is not already in table - bug, hack, smartass or smthng
				if ($pdo->rowCount() < 1)
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
				else 
				{
					$duplicates[] = $value['name'];
				}
			}
		}	
		if ( !empty($duplicates ) )
		{
			echo json_encode($duplicates);
		}
		else {
			echo "1";
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