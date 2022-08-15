import * as utils from './utils.js';

Highcharts.setOptions({
    lang: {
        rangeSelectorZoom: ''
    }
});
const SERIES_NAME_CASH = "现金";
const SERIES_NAME_MARKET_VALUE = "市值";
let querystr = window.location.href.split('?')[1];
let urlSearch = new URLSearchParams('?' + querystr);
let pop = parseInt(urlSearch.get('pop'));
console.log(pop);
$.getJSON('/api/backtest?pop=' + pop).done(function (response) {
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
    let cash = new Array();

    for (i; i < dataLength; i += 1) {
        console.log(data[i]);

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

        cash[i] = { x: data[i][0], y: data[i][6], detail: data[i][7] };

    }

    // console.log(data);
    let fund = data.fund;
    let trades = data.trades;
    // console.log(fund);
    // let cash = parseFundHistory(fund);
    // let stock = parseTrades(trades)

    Highcharts.stockChart('container', {

        // data: {
        //     csv: csv_data,
        //     // columns: [
        //     //     ["time", 1451616120000, 1451865660000, 1451952060000],
        //     //     ["c", 12, 13, 20],
        //     //     ["b", 15, 14, 6],
        //     //     ["d", 15, 18, 10],
        //     //     ["e", 16, 12, 10]
        //     // ],
        //     endColumn: 3,
        //     endRow: 3
        // },

        // data: {
        //     // enablePolling: true,
        //     csvURL: window.location.origin + '/static/data/fund.csv'
        //     // csv: data
        // },


        rangeSelector: {
            selected: 4
        },
        plotOptions: {
            series: {
                dataGrouping: {
                    dateTimeLabelFormats: {
                        day: ['%Y-%m-%d'],
                        week: ['%Y-%m-%d'],
                        month: ['%Y-%m'],
                        year: ['%Y']
                    }
                }
            }
        },

        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%Y<br/>%m-%d',
                week: '%Y<br/>%m-%d',
                month: '%Y-%m',
                year: '%Y'
            }
        },
        tooltip: {
            formatter: function () {
                return ['<b>' + utils.format(new Date(this.x)) + '</b>'].concat(
                    this.points.map(function (point) {
                        console.log(point);
                        let str = '';
                        if (point.point.detail) {
                            // console.log(point.point.detail);
                            for (let detail of point.point.detail) {
                                // console.log(dt);
                                // if (point.series.name === SERIES_NAME_CASH) {
                                //     str += '<br>' + detail[1] + ' ' + detail[2];
                                // } else if (point.series.name === SERIES_NAME_MARKET_VALUE) {
                                //     str += '<br>' + detail.code + ' ' + detail.name + ' ' + detail.shares;
                                // }
                            }
                        }
                        // console.log(str);
                        return point.series.name + ': ' + point.y + ' ' + str;
                    })
                );
            },
            dateTimeLabelFormats: {
                day: '%Y-%m-%d',
                week: '%Y-%m-%d',
                month: '%Y-%m',
                year: '%Y'
            },
            // pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            // valueDecimals: 2,
            // split: true
        },
        series: [{
            turboThreshold: 0,
            name: SERIES_NAME_CASH,
            data: cash
        }]
    })
}).fail(function (jqXHR, textStatus) {
    alert('Error: ' + jqXHR.status);
});