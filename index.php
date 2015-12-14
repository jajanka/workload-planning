<?php
session_start(); // Starting Session
if ( isset($_SESSION['login_user']) ){
	header("location: planning.php");
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="Janis Mateuss" content="planning"/>
		<meta name="viewport" content="width=device-width, user-scalable=no"/><!-- "position: fixed" fix for Android 2.2+ -->
		<link rel="icon" href="css/images/logo.ico" type="image/ico" />
		<link rel="stylesheet" href="css/style.css" type="text/css" media="screen"/>
		<link rel="stylesheet" media="screen" href="bootstrap/css/bootstrap.min.css">
		<title>Login · Culimeta</title>
	</head>

	<body>
<?php

$error=''; // Variable To Store Error Message
if (isset($_POST['submit'])) 
{
	if (empty($_POST['username']) || empty($_POST['password'])) 
	{
		$error = "Lietotājs vai parole ir nepareizi.";
	}
	else
	{
		// Establishing Connection with Server by passing server_name, user_id and password as a parameter
		require('../h/postgres_cmp.php');
		// Define $username and $password
		$username = $_POST['username'];
		$password = hash("sha512", $_POST['password']);

		$selectQ = "SELECT uid FROM cm_users WHERE username = :username AND password = :password";

		try
		{
			$pdo = $pgc->prepare($selectQ);
			$pdo->bindValue(':username', $username);
			$pdo->bindValue(':password', $password);
			$pdo->execute();
			$res = $pdo->fetchAll(PDO::FETCH_ASSOC);

			if ($pdo->rowCount() == 1)
			{
				$_SESSION['login_user'] = $username; // Initializing Session
				header("location: planning.php"); // Redirecting To Other Page
			}
			else
			{
				$error = "Lietotājs vai parole ir nepareizi.";
			}
		}
		catch(PDOException $e)
		{
		    $pgc = NULL;
		    die('error in gc function => ' . $e->getMessage());
		}

		$pgc = NULL;
	}
}
?>
	  <div class="wrapper">
	    <form class="form-signin" method="POST" action="">   
	    <?php 
	    	if ( strlen($error) > 0 ) {
		    	echo '<div class="alert alert-danger">
			  	<strong>Kļūda!</strong> '.$error.'</div>';
			}
		?>
	      <div id="login-logo" style="height: 50px; width: 100%">
	  	    <img src="css/images/logoLogin.png" style="float: right; margin-bottom: 20px;">
	  	  </div>
    
	      <h2 class="form-signin-heading">Ielogoties</h2>
	      <input type="text" class="form-control" name="username" placeholder="Lietotājs" required="" autofocus="" />
	      <input type="password" class="form-control" name="password" placeholder="Parole" required=""/>      
	      <label class="checkbox">
	        <!-- <input type="checkbox" value="remember-me" id="rememberMe" name="rememberMe"> Remember me-->
	      </label> 
	      <button class="btn btn-lg btn-primary btn-block" type="submit" name="submit">Login</button>   
	    </form>
	  </div>

	</body>

</html>