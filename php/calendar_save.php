<?php
session_start();
# Example 1
# date_range("2014-01-01", "2014-01-20", "+1 day", "m/d/Y");

function date_range($first, $last, $step = '+1 day', $output_format = 'd/m/Y' ) {

    $dates = array();
    $current = strtotime($first);
    $last = strtotime($last);

    while( $current <= $last ) {

        $dates[] = date($output_format, $current);
        $current = strtotime($step, $current);
    }

    return $dates;
}


if ( isset($_POST['year']) && is_numeric($_POST['year']) && $_SESSION['login_user'] == 'admin' )
{
	require('../../h/postgres_cmp.php');

	$year = $_POST['year'];
	$start_date = (string)$year."-01-01";
	$end_date = (string)$year."-12-31";

	$insertQ = 'INSERT INTO calendar (week_day, shift1, shift2, shift3, record_time) 
			VALUES (:week_day, :shift1, :shift2, :shift3, :record_time)';
	$selectQ = "SELECT week_day FROM calendar WHERE week_day = :startDate";

	$new_year = true;
	try
	{
		$pdo = $pgc->prepare($selectQ);
		$pdo->bindValue(':startDate', $start_date );
		$pdo->execute();
		$res = $pdo->fetchAll(PDO::FETCH_NUM);

		if ($pdo->rowCount() > 0)
		{
			$new_year = false;
		}
	}
	catch(PDOException $e)
	{
	    $pgc = NULL;
	    die('error in gc function => ' . $e->getMessage());
	}

	if ($new_year)
	{
		$dates = date_range($start_date, $end_date, "+1 day", "Y-m-d");
		foreach ($dates as $key => $value) 
		{
			try {
				// if day is saturtday then second and third shift is free
				if ( date('N', strtotime($value)) == 6) {
					$pdo = $pgc->prepare($insertQ);
					$pdo->bindValue(':week_day', $value);
					$pdo->bindValue(':shift1', false, PDO::PARAM_BOOL);
					$pdo->bindValue(':shift2', true, PDO::PARAM_BOOL);
					$pdo->bindValue(':shift3', true, PDO::PARAM_BOOL);
					$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
					$pdo->execute();
				}
				// if day is sunday then all shifts are free
				else if ( date('N', strtotime($value)) == 7) {
					$pdo = $pgc->prepare($insertQ);
					$pdo->bindValue(':week_day', $value);
					$pdo->bindValue(':shift1', true, PDO::PARAM_BOOL);
					$pdo->bindValue(':shift2', true, PDO::PARAM_BOOL);
					$pdo->bindValue(':shift3', true, PDO::PARAM_BOOL);
					$pdo->bindValue(':record_time', date("Y-m-d H:i:s", strtotime(date('Y-m-d H:i:s')) - 60*60*2)." +00:00");
					$pdo->execute();
				}
				else {
					// in workdays no free shifts
					$pdo = $pgc->prepare($insertQ);
					$pdo->bindValue(':week_day', $value);
					$pdo->bindValue(':shift1', false, PDO::PARAM_BOOL);
					$pdo->bindValue(':shift2', false, PDO::PARAM_BOOL);
					$pdo->bindValue(':shift3', false, PDO::PARAM_BOOL);
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
		echo $year.'.gads tika veiksmīgi pievienots.';
	}
	else {
		echo $year.'.gads jau eksistē.';
	}

	$pdo = NULL;
	$pgc = NULL;
}
else if (isset($_POST['update']) && $_SESSION['login_user'] == 'admin') 
{
	require('../../h/postgres_cmp.php');

	$dates = json_decode($_POST['update'], true);

	$updateQ = 'UPDATE calendar SET shift1 = :shift1, shift2 = :shift2, shift3 = :shift3, record_time = :record_time 
				WHERE week_day = :week_day';

	foreach ($dates as $key => $value) 
	{
		try {
				// in workdays no free shifts
				$pdo = $pgc->prepare($updateQ);
				$pdo->bindValue(':week_day', $key);
				$pdo->bindValue(':shift1', $value['shift1'], PDO::PARAM_BOOL);
				$pdo->bindValue(':shift2', $value['shift2'], PDO::PARAM_BOOL);
				$pdo->bindValue(':shift3', $value['shift3'], PDO::PARAM_BOOL);
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
