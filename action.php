<?php
require 'routeros_api.class.php';
define('DB_NAMA','db_edp');
define('DB_USER','root');
define('DB_HOST','192.168.32.215');
define('DB_PASS','12345ui');
define('RB_USER','edp');
define('RB_PASS','@stinet69r');
define('RB_PASSWDCP','wifi69r');
$ip = $_POST['ip'];

mysql_select_db(DB_NAMA, mysql_connect(DB_HOST,DB_USER,DB_PASS)) or die("Gagal koneksi ke server MySQL " . mysql_error());

switch($_POST['aksi']){
    case 'getData':
    $query = $_POST['aq'];
    $SQL = mysql_query($query);
    $i=0;
    $result = array();
    while($row= mysql_fetch_assoc($SQL)){
        foreach($row as $key => $value){
            $result[$i][$key] = $value;
        }
        $i++;
    }

    echo json_encode($result);

    break;

    case 'getConfig':
    $API = new routeros_api();
		$hasil = array();
		$API->debug = false;
		$API->attempts = 5;
		$API->timeout = 5;
		if ($API->connect($ip, RB_USER, RB_PASS)) {
			$ARRAY = $API->comm("/system/identity/print");
			$hasil['ip_rb'] = $ip;
			$hasil['id'] =  $ARRAY['0']['name'];
			$param = array("?dst-address" => "0.0.0.0/0");
			$ARRAY = $API->comm("/ip/route/print", $param);
			$num = count($ARRAY);
			for ($i = 0; $i < $num; $i++) {
				$hasil[$ARRAY[$i]['distance']] = $ARRAY[$i]['gateway'];
			}
			$ARRAY2 = $API->comm('/user/print');
			foreach ($ARRAY2 as $usr) {
				$user .= $usr['name'] . '|';
			}
			/*for ($s=0; $s < count($ARRAY2); $s++) { 
			        	$user .= $ARRAY2[$s]['name'] .'|';
			        }*/
			$hasil['user'] = $user;
			$hasil['board'] =  $API->comm('/system/routerboard/print')[0]['model'];

			$API->disconnect();
		} else {
			$hasil['ip_rb'] = $ip;
			$hasil['board'] = 'Unable Connect';
		}
		echo json_encode($hasil);
    break;

    case 'executeScript':
    $API = new routeros_api();
    $hasil = array();
    $API->debug = false;
    if ($API->connect($ip, RB_USER, RB_PASSWDCP)) {
        $hasil['ip_rb'] = $ip;
        $param = array(
            'url' => 'http://192.168.32.6/hapus.rsc',
            'mode' => 'http', 'dst-path' => 'script_ros.rsc'
        );
        if ($API->comm("/tool/fetch", $param)) {
            $hasil['down_script'] = 'ok';
        }
        $param2 = array('file-name' => 'script_ros.rsc');
        if ($API->comm("/import", $param2)) {
            $hasil['run_script'] = 'ok';
        }
        $param3 = array('file-name' => 'script_ros.rsc');
        if ($API->comm("/file/remove", $param3)) {
            $hasil['rem_script'] = 'ok';
        }
    } else {
        $hasil['ip_rb'] = $ip;
        $hasil['down_script'] = 'Gagal';
    }
    echo json_encode($hasil);

    break;


    case 'getConfigWDCP':
    $API = new routeros_api();
		$hasil = array();
		$API->debug = false;
		$API->attempts = 5;
		$API->timeout = 5;
		if ($API->connect($ip, RB_USER, RB_PASSWDCP)) {
			$ARRAY = $API->comm("/system/identity/print");
			$hasil['ip_rb'] = $ip;
			$hasil['id'] =  $ARRAY['0']['name'];
			// $param = array("?dst-address" => "0.0.0.0/0");
			// $ARRAY = $API->comm("/ip/route/print", $param);
			// $num = count($ARRAY);
			// for ($i = 0; $i < $num; $i++) {
			// 	$hasil[$ARRAY[$i]['distance']] = $ARRAY[$i]['gateway'];
			// }
			$ARRAY2 = $API->comm('/user/print');
			foreach ($ARRAY2 as $usr) {
				$user .= 'name='. $usr['name'] . ',group='.$usr['group'] .';';
            }
            $ARRAY3 = $API->comm('/interface/wireless/print');
			foreach ($ARRAY3 as $ssid) {
				$ssids .= 'ssid='. $ssid['ssid'] . '-default-authentication='.$ssid['default-authentication'] .'-disabled='.$ssid['disabled'] .';';
            }
            $ARRAY4 = $API->comm('/interface/wireless/access-list/print');
			foreach ($ARRAY4 as $mac) {
				$macs .=  $mac['mac-address'] . ';';
			}
			/*for ($s=0; $s < count($ARRAY2); $s++) { 
			        	$user .= $ARRAY2[$s]['name'] .'|';
			        }*/
            $hasil['user'] = $user;
            $hasil['ssid'] = $ssids;
            $hasil['mac'] = $macs;
			$hasil['board'] =  $API->comm('/system/routerboard/print')[0]['model'];

			$API->disconnect();
		} else {
			$hasil['ip_rb'] = $ip;
			$hasil['board'] = 'Unable Connect';
		}
		echo json_encode($hasil);
    break;
}
?>

