<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="Janis Mateuss" content=""/>
		<meta name="description" content="Planning"/>
		<meta name="viewport" content="width=device-width, user-scalable=no"/><!-- "position: fixed" fix for Android 2.2+ -->
		<link rel="icon" href="css/images/logo.ico" type="image/ico" />
		<link rel="stylesheet" href="css/style.css" type="text/css" media="screen"/>
		<link rel="stylesheet" media="screen" href="bootstrap/css/bootstrap.min.css">
    	<link href="datepicker/jquery.datepick.css" rel="stylesheet" media="screen">
    	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
		<title><?php echo $title; ?></title>
	</head>

	<body>

<nav class="navbar navbar-default navbar-fixed-top" id="mainNavBar">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="index.php">Sākums</a>
    </div>
    <div>
      <ul class="nav navbar-nav">
        <li><a href="products.php"><span class="glyphicon glyphicon-th-list"></span> Produkti</a></li>
        <li><a href="calendar.php"><span class="glyphicon glyphicon-calendar"></span> Kalendārs</a></li>
      </ul>
    </div>
    <div class='btn-toolbar pull-right' style="margin-top: 5px;">
      <div class='btn-group'>
        <button type="button" class="btn btn-danger" id="undo-gen-prod-bttn"><span class="glyphicon glyphicon-circle-arrow-left"></span> Atcelt</button>
        <button type="button" class="btn btn-success" id="save-bttn"><span class="glyphicon glyphicon-floppy-save"></span> Saglabāt</button>
      </div>
    </div>
  </div>
</nav>