<?php

if (isset($_POST['kg']) && isset($_POST['prod'])) 
{
	require('../../h/postgres_cmp.php');

	$kg = $_POST['kg'];
	$prod = $_POST['prod'];
	$res = '';

	$selectQ = 'SELECT weigth, m_speed, efficiency_percentage FROM products WHERE p_name = UPPER(:product) LIMIT 1';
	
	try
	{

		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':product', $prod, PDO::PARAM_STR);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ($pdo->rowCount() > 0)
		{
			/*
			1 => C - weigth
			0 => B - m_speed
			2 => L - efficiency_percentage
			$kg => G ... G = D * 7.5 jeb $kg_h * 7.5 (viena mainaa ir D * 7.5 kg sarazojamie )
			$kg_h => D
			$resultCount => J
			*/
			$kg_h = number_format($res[0][1] * 60 * $res[0][0] / 1000 / 1000 * $res[0][2] / 100, 3); 
			$resultCount = round( number_format( (($kg / $kg_h) / 7.5), 2) );

			$kg_per_shift =  number_format( $kg_h * 7.5 , 2 );
			$kg_per_shift = (float)str_replace(',', '', $kg_per_shift);

			$kg_last_shit_reminder = $kg_per_shift;

			if ( $kg_per_shift * $resultCount > $kg ) 
				$kg_last_shit_reminder -= ( $kg_per_shift * $resultCount ) - $kg; 

			else if ( $kg_per_shift * $resultCount < $kg ) 
				$kg_last_shit_reminder -= ( $kg_per_shift * $resultCount ) - $kg; 

			$kg_last_shit_reminder = (float)str_replace(',', '', $kg_last_shit_reminder);

			$finalResults = array(
			    "shifts" => $resultCount,
			    "kgPerShift" => $kg_per_shift,
			    "kgLastShift" => $kg_last_shit_reminder
			);

			echo json_encode( $finalResults );
		}
		else {
			echo '';
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