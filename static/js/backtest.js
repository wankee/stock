'use strict'

import * as utils from './utils.js';

let vm = new Vue({
    el: '#div-container',
    data: {
        trades: [],
        totalBalance: 0,
        currentStocks: [],
        clearedStocks: [],
        stockHistory: [],
        activeTabIndex: 1
    },
    methods: {
        selectTag: function (index) {
            this.activeTabIndex = index
        },

        showDetail: function (data) {
            this.stockHistory = data.history
            this.activeTabIndex = 3
        },

        getDateString: function (date) {
            return moment(date).format('YYYY年MM月DD日')
        },

        deleteProduct: function (id) {
            let that = this;
            let reqId = id;
            // AJAX提交JSON:
            $.ajax({
                type: 'delete',
                dataType: 'json',
                url: '/api/trades/' + id
            }).done(function (r) {
                console.log(r);
                var i;
                for (i = 0; i < that.trades.length; i++) {
                    if (that.trades[i].id === reqId) {
                        that.trades.splice(i, 1);
                        return;
                    }
                }
            }).fail(function (jqXHR, textStatus) {
                // Not 200:
                alert('Error: ' + jqXHR.status);
            });
        }
    }
});

$.getJSON('/api/trades').done(function (data) {

}).fail(function (jqXHR, textStatus) {
    alert('Error: ' + jqXHR.status);
});


Highcharts.setOptions({
    lang: {
        rangeSelectorZoom: ''
    }
});
const SERIES_NAME_CASH = "现金";
const SERIES_NAME_MARKET_VALUE = "市值";
const SERIES_NAME_TOTAL_ASSETS = "总资产";

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
    let marketValue = new Array();
    let totalAssets = new Array();

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


        let hold = data[i][8];
        let val = data[i][7];
        vm.currentStocks = hold;
        vm.totalBalance = val;

        cash[i] = { x: data[i][0], y: data[i][6], tradeDetail: data[i][9] };
        marketValue[i] = { x: data[i][0], y: val, tradeDetail: data[i][9] };
        totalAssets[i] = { x: data[i][0], y: currency(data[i][6]).add(val).value, hold: hold, tradeDetail: data[i][9] };

    }




    // vm.trades = data.trades;
    // let total;
    // let result = [];
    // let codes = [];

    // for (let row of data.trades) {

    //     // console.log(typeof row.balance)
    //     total = currency(total).add(row.balance)
    //     let contains = true;
    //     let el = null;
    //     for (let res of result) {
    //         if (row.code === res.code && row.name === res.name) {
    //             el = res;
    //             break;
    //         } else if ((row.code === res.code && row.name !== res.name) ||
    //             (row.code !== res.code && row.name == res.name)) {
    //             alert("有代码与名称不同的记录");
    //             console.log(result)
    //             console.log(row)
    //         }
    //     }

    //     if (el === null) {
    //         el = {
    //             code: row.code,
    //             name: row.name,
    //             startDate: row.date,
    //             endDate: row.date,
    //             containDays: 0,
    //             shares: new Number(row.shares),
    //             count: 0,
    //             history: []
    //         }
    //         result.push(el);
    //     }

    //     let time = new Date(row.date).getTime()
    //     let startTime = new Date(el.startDate).getTime()
    //     let endTime = new Date(el.endDate).getTime()

    //     if (time < startTime) el.startDate = row.date
    //     if (time > endTime) el.endDate = row.date

    //     el.containDays = (new Date(el.endDate).getTime() - new Date(el.startDate).getTime()) / (1000 * 3600 * 24)
    //     el.shares += new Number(row.shares);
    //     if (new Number(row.shares) != 0) el.count++;
    //     el.balance = currency(el.balance).add(row.balance).value;
    //     el.history.push(row);
    // }
    // console.log(result);

    // let sum = currency(0);
    // let current = []
    // let cleared = []
    // result.forEach(i => {
    //     sum = sum.add(i.balance)
    //     if (i.shares > 0) current.push(i)
    //     else cleared.push(i)
    // })
    // console.log(sum.value);
    // console.log(current);
    // console.log(cleared);

    // vm.totalBalance = total;
    // vm.currentStocks = current;
    // vm.clearedStocks = cleared;



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

                        // vm.clearedStocks = cleared;
                        vm.totalBalance = 0
                        if (point.series.name === SERIES_NAME_TOTAL_ASSETS && point.point.hold) {
                            vm.currentStocks = point.point.hold;

                            // console.log(point.point.detail);
                            for (let hold of point.point.hold) {
                                
                                console.log(hold);
                                // if (point.series.name === SERIES_NAME_CASH) {
                                //     str += '<br>' + detail[1] + ' ' + detail[2];
                                // } else
                                    vm.totalBalance += hold.curValue;
                                    // str += '<br>' + detail.code + ' ' + detail.name + ' ' + detail.shares;
                            }
                            console.log(vm.totalBalance);

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
        }, {
            turboThreshold: 0,
            name: SERIES_NAME_TOTAL_ASSETS,
            data: totalAssets
        }]
    })
}).fail(function (jqXHR, textStatus) {
    alert('Error: ' + jqXHR.status);
});