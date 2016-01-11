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
        columns = $('#table2 tbody tr:nth-child(n+1):nth-child(-n+26) td:nth-child('+i+')');
        $.each( columns, function() {
            node = this;
        })
    };
    d = new Date();
    endTime = d.getTime() - start;
    console.log('[Test] Loop through columns obtained with CSS selector : '+endTime+'s');
}
