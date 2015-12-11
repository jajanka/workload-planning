<?php

if ( isset($_POST['startDate']) && isset($_POST['endDate']) && isset($_POST['view']) )
{
	// check if posted 1st or 2nd view else exit
	$plan = '';
	if ( $_POST['view'] == '1' ) {
		$plan = 'plan';
	}  
	if ( $_POST['view'] == '2' ) {
		$plan = 'plan2';
	}

	if ( $plan != '' ) 
	{
		require_once('../../h/postgres_cmp.php');

		//$sequance = trim($_POST['sequance']);
		$selectQ = "SELECT p_date, machine, e_shift, product, kg, fixed_position FROM $plan WHERE p_date >= :startDate AND p_date <= :endDate";
		$selectCalendarQ = "SELECT week_day, shift1, shift2, shift3 FROM calendar WHERE week_day >= :startDate AND week_day <= :endDate AND 
							(shift1 = true OR shift2 = true OR shift3 = true)";

		$output = array();
		$validationCounter = 0;

		try
		{
			$pdo = $pgc->prepare($selectQ);
			$pdo->bindValue(':startDate', $_POST['startDate']);
			$pdo->bindValue(':endDate', $_POST['endDate']);
			$pdo->execute();
			$res = $pdo->fetchAll(PDO::FETCH_ASSOC);

			if ($pdo->rowCount() > 0)
			{
				$output['products'] = $res;
				$validationCounter++;
			}
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}

		try
		{
			$pdo = $pgc->prepare($selectCalendarQ);
			$pdo->bindValue(':startDate', $_POST['startDate']);
			$pdo->bindValue(':endDate', $_POST['endDate']);
			$pdo->execute();
			$res = $pdo->fetchAll(PDO::FETCH_ASSOC);

			if ($pdo->rowCount() > 0)
			{
				$output['shifts'] = $res;
				$validationCounter++;
			}
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}

		//if ($validationCounter == 2) {
			echo json_encode($output);
		//}

		$pgc = NULL;
	}
}

?>