<?php
// Establishing Connection with Server by passing server_name, user_id and password as a parameter
require('../h/postgres_cmp.php');

session_start();// Starting Session
// Storing Session
$user_check = $_SESSION['login_user'];
// SQL Query To Fetch Complete Information Of User
$selectQ = "SELECT uid FROM cm_users WHERE username = :username";

try
{
	$pdo = $pgc->prepare($selectQ);
	$pdo->bindValue(':username', $user_check);
	$pdo->execute();
	$res = $pdo->fetchAll(PDO::FETCH_NUM);

	if ($pdo->rowCount() != 1)
	{
		$pgc = NULL;
		header("location: index.php"); // Redirecting To Other Page
	}
}
catch(PDOException $e)
{
    $pgc = NULL;
    die('error in gc function => ' . $e->getMessage());
}

$pgc = NULL;

?>