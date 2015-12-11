<?php

if ( isset($_POST['view']) )
{
	require_once('../../h/postgres_cmp.php');

	//$sequance = trim($_POST['sequance']);
	$selectQ = "SELECT machine_count FROM cm_machine_views WHERE view_order = :view";

	$view = $_POST['view'];

	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindValue(':view', $view);
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