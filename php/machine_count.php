<?php

if ( isset($_POST['view']) )
{
	require_once('../../h/postgres_cmp.php');

	//$sequance = trim($_POST['sequance']);
	$selectQ = "SELECT machine_count FROM cm_machine_views WHERE view_order = :view";

	$view = $_POST['view'];
	$viewArr = array();

	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindValue(':view', $view);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ($pdo->rowCount() > 0)
		{
			$viewArr['count'] = $res[0][0];
		}
		else
		{
			$viewArr['count'] = 0;
		}
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}

	// get machine start point
	$selectQ = 'SELECT SUM(machine_count) FROM cm_machine_views WHERE view_order < :view';
	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindParam(':view', $view, PDO::PARAM_INT);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ( !empty($res) ){
			if ( $res[0][0] != '' ){
				$viewArr["viewStart"] = $res[0][0];
			}
			else {
				$viewArr["viewStart"] = "0";
			}
		}
		else {
			$viewArr["viewStart"] = "0";
		}
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}
	echo json_encode($viewArr);

	$pgc = NULL;
}

else if ( isset($_POST['total']) )
{
	require_once('../../h/postgres_cmp.php');

	//$sequance = trim($_POST['sequance']);
	$selectQ = "SELECT SUM(machine_count) FROM cm_machine_views";

	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ($pdo->rowCount() > 0)
		{
			echo json_encode( array('count' => $res[0][0]) );
		}
		else
		{
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