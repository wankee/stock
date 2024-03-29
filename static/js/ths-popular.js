Highcharts.setOptions({
    lang: {
        rangeSelectorZoom: ''
    }
});

let querystr = window.location.href.split('?')[1];
let urlSearch = new URLSearchParams('?' + querystr);
let pop = parseInt(urlSearch.get('pop'));
console.log(pop);
$.getJSON('/api/thsdayhot?pop=' + pop).done(function (response) {
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

    console.log("Data length:" + dataLength);
    console.log(data);
    for (i; i < dataLength; i += 1) {
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
            text: '热门前三'
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
            name: '热门前三',
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