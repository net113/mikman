$(function () {
    $('#txtcustom').hide();
    $('#cbvsat').parent().hide();

    $('input[name=target]').change(function () {
        if ($(this).val() == "customstore") {
            $('#txtcustom').show();
            $('#txtcustom').val('');

        } else {
            $('#txtcustom').hide();

        }

    });

    $('input[name=tiperb]').change(function () {
        if ($(this).val() == "ip_router") {
            $('#cbfiber').parent().show();
            $('#cbvsat').parent().hide();
            $('#cbvsat').attr('checked', false);
            // $('#cbbackup').parent().show();
        } else {
            $('#cbfiber').parent().show();
            $('#cbvsat').parent().show();
            // $('#cbbackup').parent().hide();
            // $('#cbbackup').attr('checked', false);
        }

    });

    $('#btnproses').click(function () {

        let tiperb = $('input[name=tiperb]:checked').val();
        let target = $('input[name=target]:checked').val();
        let cbFO = $('#cbfiber').prop("checked");
        let cbVsat = $('#cbvsat').prop("checked");
        let rbmode = $('input[name=mode]:checked').val();
        //let cbBackup = $('#cbbackup').prop("checked");
        let query, strTarget, strTipe;
        if (target != "allstore") {
            let listtoko = $("#txtcustom").val();
            listtoko = listtoko.replace(/,/g, "','");
            listtoko = "'" + listtoko + "'";
            strTarget = "kodetoko IN (" + listtoko + ") AND ";
        } else {
            strTarget = "";
        }
        if (tiperb == "ip_router") {
            if (cbFO) {
                strTipe = (cbVsat ? "tipe_koneksi_secondary!='VSAT'" : "tipe_koneksi_primary!='VSAT' AND tipe_koneksi_secondary!='VSAT'");
            } else {
                strTipe = (cbVsat ? "tipe_koneksi_primary='VSAT' AND tipe_koneksi_secondary!='VSAT" : alert("Please Choose Connection Type"));
            }
        } else {
            if (cbFO) {
                strTipe = (cbVsat ? "kodetoko!='T1SH'" : "tipe_koneksi_primary!='VSAT'");
            } else {
                strTipe = (cbVsat ? "tipe_koneksi_primary='VSAT' " : alert("Please Choose Connection Type"));
            }
        }
        query = "select kodetoko," + tiperb + " from master_ip join tb_toko on kodetoko=kdtk where " + strTarget + strTipe;
        console.log(query);
        $("table").empty();
        $.ajax({
            type: "POST",
            url: "action.php",
            dataType: "json",
            async: true,
            data: {
                aksi: "getData",
                aq: query
            },
            error: function (err) {
                console.log("AJAX ambil list toko :" + JSON.stringify(err, null, 2));
            },
            beforeSend: function () {

            },
            success: function (hasil) {
                const pb = document.getElementById('pbproses');
                pb.setAttribute('aria-valuemax', hasil.length);
                let sukses = 0;
                let gagal = 0;


                if ($('input[name=mode]:checked').val() == "view") {
                    let aksi;
                    if (tiperb == "ip_router") {
                        $('table').append('<thead><th>KDTK</th><th>IP</th><th>MODEL</th><th>IDENTITY</th><th>DISTANCE0</th><th>DISTANCE1</th><th>DISTANCE2</th><th>USER</th></thead><tbody></tbody>');

                        aksi = "getConfig"
                    } else {
                        $('table').append('<thead><th>KDTK</th><th>IP</th><th>USER</th><th>IDENTITY</th><th>SSID</th><th>MAC ADDRESS</th><th>BOARD</th></thead><tbody></tbody>');

                        aksi = "getConfigWDCP"

                    }
                    for (let i = 0; i < hasil.length; i++) {
                        var hosts = hasil.length;
                        var hostsDone = 0;

                        let kdtk = hasil[i]['kodetoko'];
                        let ip = hasil[i][tiperb];
                        $.ajax({
                            type: "POST",
                            url: "action.php",
                            dataType: 'json',
                            async: true,
                            data: {
                                aksi: aksi,
                                ip: ip
                            },
                            beforeSend: function () {},
                            error: function (err2) {
                                console.log("AJAX mikrotik cekrouter: " + ip + JSON.stringify(err2, null, 2));
                                var markup = "<tr><td>" + kdtk + "</td><td>" + ip + "</td><td>Not Connected</td><td></td><td></td><td></td><td></td></tr>";
                                $("table tbody").append(markup);
                                gagal++;
                                hostsDone++;
                                $('.progress-bar').css('width', hostsDone / hosts * 100 + '%').attr('aria-valuenow', hostsDone);
                                $('.status').html('Berhasil : ' + sukses + ' Gagal :' + gagal);
                            },
                            success: function (hasil2) {
                                var markup;
                                if (aksi == "getConfig") {
                                    markup = "<tr><td>" + kdtk + "</td><td>" + hasil2['ip_rb'] + "</td><td>" + hasil2['board'] + "</td><td>" + hasil2['id'] + "</td><td>" + hasil2['1'] + "</td><td>" + hasil2['2'] + "</td><td>" + hasil2['3'] + "</td><td>" + hasil2['user'] + "</td></tr>";

                                } else {
                                    markup = "<tr><td>" + kdtk + "</td><td>" + hasil2['ip_rb'] + "</td><td>" + hasil2['user'] + "</td><td>" + hasil2['id'] + "</td><td>" + hasil2['ssid'] + "</td><td>" + hasil2['mac'] + "</td><td>" + hasil2['board'] + "</td></tr>";

                                }

                                (hasil2['board'] === 'Unable Connect') ? gagal++ : sukses++;
                                $("table tbody").append(markup.replace(/undefined/g, ''));
                                hostsDone++;
                                $('.progress-bar').css('width', hostsDone / hosts * 100 + '%').attr('aria-valuenow', hostsDone);
                                $('.status').html('Berhasil : ' + sukses + ' Gagal :' + gagal);

                            }
                        });
                    }
                } else {
                    $('table').append('<thead><th>KDTK</th><th>IP</th><th>DOWN SCRIPT</th><th>RUN SCRIPT</th><th>REM SCRIPT</th> </thead><tbody></tbody>');
                    for (let i = 0; i < hasil.length; i++) {
                        var hosts = hasil.length;
                        var hostsDone = 0;
                        let kdtk = hasil[i]['kodetoko'];
                        let ip = hasil[i]['ip_router_edc'];
                        $.ajax({
                            type: "POST",
                            url: "action.php",
                            dataType: 'json',
                            async: true,
                            data: {
                                aksi: "executeScript",
                                ip: ip
                            },
                            beforeSend: function () {},
                            error: function (err2) {
                                console.log("AJAX mikrotik cekrouter: " + ip + JSON.stringify(err2, null, 2));
                                var markup = "<tr><td>" + kdtk + "</td><td>" + ip + "</td><td>Not Connected</td><td></td><td></td></tr>";
                                $("table tbody").append(markup);
                                gagal++;
                                hostsDone++;
                                $('.progress-bar').css('width', hostsDone / hosts * 100 + '%').attr('aria-valuenow', hostsDone);
                                $('.status').html('Berhasil : ' + sukses + ' Gagal :' + gagal);
                            },
                            success: function (hasil2) {
                                var markup = "<tr><td>" + kdtk + "</td><td>" + hasil2['ip_rb'] + "</td><td>" + hasil2['down_script'] + "</td><td>" + hasil2['run_script'] + "</td><td>" + hasil2['rem_script'] + "</td></tr>";

                                (hasil2['down_script'] === 'Gagal') ? gagal++ : sukses++;
                                $("table tbody").append(markup.replace(/undefined/g, ''));
                                hostsDone++;
                                $('.progress-bar').css('width', hostsDone / hosts * 100 + '%').attr('aria-valuenow', hostsDone);
                                $('.status').html
                            }
                        });
                    }
                }
            }



        });

    });

}) //tutup on ready


function getConfig(kdtk, ipaddress) {


}