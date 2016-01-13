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
		$selectQ = "SELECT p_date, machine, e_shift, product, kg, fixed_position FROM $plan WHERE p_date >= :startDate AND p_date <= :endDate
					ORDER BY p_date, e_shift, machine";
		$selectCalendarQ = "SELECT week_day, shift1, shift2, shift3 FROM calendar WHERE week_day >= :startDate AND week_day <= :endDate AND 
							(shift1 = true OR shift2 = true OR shift3 = true)";

		$output = array();
		$productArr = array();
		$productGroups = array();
		$currentColumn = array();
		$validationCounter = 0;
		$group = 0;

		$prevDate = '0';
		$prevShift = -1;
		$prevColumn = array();
		try
		{
			$pdo = $pgc->prepare($selectQ);
			$pdo->bindValue(':startDate', $_POST['startDate']);
			$pdo->bindValue(':endDate', $_POST['endDate']);
			$pdo->execute();
			$res = $pdo->fetchAll(PDO::FETCH_ASSOC);

			if ($pdo->rowCount() > 0)
			{
				foreach ($res as $key => $value) 
				{
					// if chages to the next col (either shift is different or (shift is the same but different date))
					if ( $prevShift != $value['e_shift'] || ($prevShift == $value['e_shift'] && $prevDate != $value['p_date']) )
					{
						$prevColumn = $currentColumn;
						$currentColumn = array();
					}	
					// if this product is not in previous or in this column then star a new groupId
					if ( !array_key_exists($value['product'], $prevColumn) && !array_key_exists($value['product'], $currentColumn) )
					{
						$group++;
						$productGroups[$value['product']] = $group;
					}

					$prevShift = $value['e_shift'];
					$prevDate = $value['p_date'];
					$currentColumn[$value['product']] = true;
					
					$value['groupId'] = $productGroups[$value['product']];
					$productArr[] = $value;
				}

				$validationCounter++;
				$output['products'] = $productArr;
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