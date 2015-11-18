<?php

if (isset($_POST['getInfo']))
	if ($_POST['getInfo'])
{
	{
		require('../../h/postgres_cmp.php');

		$selectQ = "SELECT pid, allowed_machines FROM products";

		try
		{
			$pdo = $pgc->prepare($selectQ);
			$pdo->execute();
			$res = $pdo->fetchAll(PDO::FETCH_NUM);
			$infoArr = array();

			foreach ($res as $key => $value) {
			    # if json is not empty then place it in array
			  	if ($value[1] != "") {
			  		$infoArr["".$value[0].""] = $value[1];
			  	}
			}	
			echo json_encode($infoArr);
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}

		$pdo = NULL;
		$pgc = NULL;
	}
}

?>