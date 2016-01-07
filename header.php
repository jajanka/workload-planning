<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="Janis Mateuss" content="planning"/>
		<meta name="viewport" content="width=device-width, user-scalable=no"/><!-- "position: fixed" fix for Android 2.2+ -->
		<link rel="icon" href="css/images/logo.ico" type="image/ico" />
		<link rel="stylesheet" href="css/style.css" type="text/css" media="screen"/>
		<link rel="stylesheet" media="screen" href="bootstrap/css/bootstrap.min.css">
    <link href="datepicker/jquery.datepick.css" rel="stylesheet" media="screen">
    <script src="js/jquery-1.11.3.min.js"></script>
		<title><?php echo $title; ?></title>
	</head>

	<body>
<?php
  $view = '1';
  if ( isset($_GET['view']) ) {
    if ( $_GET['view'] == '1' || $_GET['view'] == '2' ) {
      $view = $_GET['view'];
    }
    else {
      header('Location: planning.php?view=1');
      die();
    }
  }
?>
<nav class="navbar navbar-default navbar-fixed-top" id="mainNavBar">
  <div class="container-fluid">
    <div class="navbar-header">
    <?php 
    echo '<a class="navbar-brand" href="planning.php?view='.$view.'"><span class="glyphicon glyphicon-home"></span></a>';
    ?>
    </div>
    <div>
      <ul class="nav navbar-nav wrapper-nav-option">
        <li><a href="products.php"><span class="glyphicon glyphicon-th"></span> Produkti</a></li>
        <?php

        if ( $_SESSION['login_user'] == 'admin' )
        {
          echo '<li><a href="calendar.php"><span class="glyphicon glyphicon-calendar"></span> Kalendārs</a></li>';
        }
        ?>
      </ul>
    </div>
    <div class="btn-toolbar pull-left">
      <?php 
      $phpself = explode('/',$_SERVER['PHP_SELF']);
      if ( end($phpself) == 'planning.php' || end($phpself) == 'planning' ) 
      {
        echo '<div class="btn-group wrapper-nav-option">';
        if ( $_SESSION['login_user'] == 'admin' )
        {
          echo '<button type="button" class="btn btn-sm btn-default" id="production-bttn"><span class="glyphicon glyphicon-time"></span> Ražošana</button>';
        }

        echo '<button type="button" data-toggle="dropdown" class="btn btn-sm btn-default dropdown-toggle">Skats '.$view.' <span class="caret"></span></button>
                <ul class="dropdown-menu" style="font-size:12px;">
                    <li><a href="?view=1">Skats 1</a></li>
                    <li><a href="?view=2">Skats 2</a></li>
                </ul>';
        echo '</div>';

        if ( $_SESSION['login_user'] == 'admin' )
        {
          echo '<div class="btn-group wrapper-nav-option">';
        	echo '<button style="margin-right: 10px" type="button" class="btn btn-sm btn-danger" id="undo-gen-prod-bttn"><span class="glyphicon glyphicon-circle-arrow-left"></span> <span id="undo-text">Atcelt</span></button>
         		<button type="button" class="btn btn-sm btn-success tooltip-error" id="save-bttn" data-placement="bottom" title=""><span class="glyphicon glyphicon-floppy-save"></span> Saglabāt</button>';
          echo "</div>";
        }
      } 
      else 
      { 
        if ( $_SESSION['login_user'] == 'admin' )
        {
          echo '<div class="btn-group wrapper-nav-option">';
        	echo '<button type="button" class="btn btn-sm btn-success" id="save-bttn"><span class="glyphicon glyphicon-floppy-save"></span> Saglabāt</button>';
          echo "</div>";
        }
      }
      ?>
    </div>
    <div class='btn-toolbar pull-right' style="margin-top: 15px;">
      <a href="logout.php" style="color: #222;">Iziet (<?php echo $_SESSION['login_user']; ?>)</a>
    </div>
  </div>
</nav>
