
Highcharts.setOptions({
    lang: {
        rangeSelectorZoom: ''
    }
});

$.getJSON('/api/thsdayhot').done(function (response) {
    if (response.code !== 0) {
        alert('读取股票数据失败！');
        return false;
    }
    let data = response.data;
    var ohlc = [],
        volume = [],
        dataLength = data.length,
        // set the allowed units for data grouping
        groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]],
        i = 0;

    console.log("length:" + dataLength);
    for (i; i < dataLength; i += 1) {
        console.log(typeof data[i][1]);
        console.log(typeof data[i][1].toFixed(2));
        ohlc.push([
            data[i][0], // the date
            parseFloat(data[i][1].toFixed(2)), // open
            parseFloat(data[i][2].toFixed(2)), // high
            parseFloat(data[i][3].toFixed(2)), // low
            parseFloat(data[i][4].toFixed(2)) // close
        ]);
        volume.push([
            data[i][0], // the date
            data[i][5] // the volume
        ]);
    }
    // create the chart
    var chart = Highcharts.stockChart('container', {
        rangeSelector: {
            selected: 1,
            inputDateFormat: '%Y-%m-%d'
        },
        title: {
            text: '平安银行历史股价'
        },
        xAxis: {
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%m-%d',
                week: '%m-%d',
                month: '%y-%m',
                year: '%Y'
            }
        },
        tooltip: {
            split: false,
            shared: true,
        },
        yAxis: [{
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: '股价'
            },
            height: '65%',
            resize: {
                enabled: true
            },
            lineWidth: 2
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: '成交量'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],
        series: [{
            type: 'candlestick',
            name: '平安银行',
            color: 'green',
            lineColor: 'green',
            upColor: 'red',
            upLineColor: 'red',
            tooltip: {
            },
            navigatorOptions: {
                color: Highcharts.getOptions().colors[0]
            },
            data: ohlc,
            dataGrouping: {
                units: groupingUnits
            },
            id: 'sz'
        }, {
            type: 'column',
            data: volume,
            yAxis: 1,
            dataGrouping: {
                units: groupingUnits
            }
        }]
    });
}).fail(function (jqXHR, textStatus) {
    alert('Error: ' + jqXHR.status);
});