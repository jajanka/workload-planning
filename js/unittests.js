function testTableSpeed() 
{
    // -----
    var d = new Date();
    var start = d.getTime();
    var node, columns, endTime;

    for (var i = 1; i < 72; i++) {
        for (var j = 1; j < 27; j++) {
            node = $('#table2 tbody tr:nth-child('+j+') td:nth-child('+i+')');
        };
    };
    d = new Date();
    endTime = d.getTime() - start;
    console.log('[Test] Loop with double array. CSS selector each time : '+endTime+'s');

    // -----
    d = new Date();
    start = d.getTime();
    for (var i = 1; i < 72; i++) {
        columns = $('#table2 tbody tr:nth-child(n+1):nth-child(-n+26) td:nth-child('+i+') div');
        $.each( columns, function() {
            node = this;
            $(this).html($(this).attr('groupid'));
        })
    };
    d = new Date();
    endTime = d.getTime() - start;
    console.log('[Test] Loop through columns obtained with CSS selector : '+endTime+'s');

    // --
    d = new Date();
    start = d.getTime();
    for (var i = 1; i < 72; i++) {
        var a = $('#table2 tr td div[groupid="10"]');
    }
    d = new Date();
    endTime = d.getTime() - start;
    console.log('[Test] CSS selector with attribute "groupid" and long path : '+endTime+'s');

    // --
    d = new Date();
    start = d.getTime();
    for (var i = 1; i < 72; i++) {
        var a = $('div[groupid="10"]');
    }
    d = new Date();
    endTime = d.getTime() - start;
    console.log('[Test] CSS selector with attribute "groupid" and short path : '+endTime+'s');
}
