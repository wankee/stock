import * as utils from './utils.js';

function calcuChangeInDay(fund, timestamp, start) {
    let index = start,
        change = currency(0),
        detail = new Array();

    for (let i = start; i < fund.length; i++) {
        // console.log(i + " " + timestamp + " " + data[i][0] + " ");
        if (fund[i][0] > timestamp) break;
        if (fund[i][0] === timestamp) {
            // console.log(timestamp + " " + data[i][0] + " " + data[i][1]);
            index = i + 1;
            change = change.add(fund[i][1]);
            detail.push(fund[i]);
            // console.log("change " + change);
        }
    }
    return {
        index: index,
        change: change,
        detail: detail
    }
}

function parseFundHistory(fund) {
    let cash = new Array();
    let date = new Array();
    date[0] = new Date(fund[0][0]);
    date[0].setDate(date[0].getDate());
    // console.log(date);
    let now = new Date("2019-04-22");
    let days = (now - date[0]) / 1000 / 3600 / 24;
    // console.log(days);
    let res = new Array();
    let search_index = 0;

    for (let i = 0; i < days; i++) {
        if (i != 0) {
            date[i] = new Date(date[i - 1]);
            date[i].setDate(date[i - 1].getDate() + 1);
        }

        let change = currency(0);
        let detail = [];
        // console.log(i + " search:" + search_index);
        if (search_index < fund.length) {
            let ob = calcuChangeInDay(fund, date[i].getTime(), search_index);
            search_index = ob.index;
            change = ob.change;
            detail = ob.detail;
        }

        if (i === 0) {
            cash[0] = change;
        }
        else {
            cash[i] = cash[i - 1].add(change);
        }
        // console.log(i + " cash:" + cash[i]);
        res[i] = { x: date[i].getTime(), y: cash[i].value, detail: detail };
    }
    return res;
}

function calcMarketValue(trade) {
    return currency(trade.price).multiply(trade.shares);
}

function calcuPositionChangeInDay(trades, time, start, position) {
    let index = start,
        detail = new Array();

    for (let i = start; i < trades.length; i++) {
        let trade = trades[i];
        let timestamp = new Date(trade.date).getTime();
        // console.log(i + " " + timestamp + " " + time + " ");
        // console.log(trade);
        if (timestamp > time) break;
        if (timestamp === time) {
            // console.log(timestamp + " " + data[i][0] + " " + data[i][1]);
            index = i + 1;
            detail.push(trade);

            let contains = false;
            for (let pos of position) {
                if (pos[0] === trade.code && pos[1] === trade.name) {
                    contains = true;
                    pos[2] += trade.shares;
                }
            }

            if (!contains) {
                position.push([trade.code, trade.name, trade.shares]);
            }
        }
    }
    return {
        index: index,
        detail: detail
    }
}

function getCurrentPrice(code) {
    return currency(1);
}

function parseTrades(trades) {
    let position = new Array(),
        date = new Array();

    date[0] = new Date(trades[0].date);
    date[0].setDate(date[0].getDate());
    // console.log(date);
    let now = new Date("2019-04-22");
    let days = (now - date[0]) / 1000 / 3600 / 24;
    // console.log(days);
    let res = new Array();
    // console.log(d1);
    let search_index = 0;

    for (let i = 0; i < days; i++) {
        let detail = [];
        if (i === 0) {
            position[i] = new Array();
        } else {
            date[i] = new Date(date[i - 1]);
            date[i].setDate(date[i - 1].getDate() + 1);
            position[i] = Array.from(position[i - 1]);
        }

        // console.log(i + " search:" + search_index);
        if (search_index < trades.length) {
            let ob = calcuPositionChangeInDay(trades, date[i].getTime(), search_index, position[i]);
            search_index = ob.index;
            detail = ob.detail;
        }

        let market_value = currency(0);
        for (let pos of position[i]) {
            market_value = market_value.add(getCurrentPrice(pos[0]).multiply(pos[2]));
        }

        res[i] = { x: date[i].getTime(), y: market_value.value, detail: detail };
    }
    return res;
}
const SERIES_NAME_CASH = "现金";
const SERIES_NAME_MARKET_VALUE = "市值";

$.getJSON(window.location.origin + '/api/trades_fund_history', function (data) {
    // console.log(data);
    let fund = data.fund;
    let trades = data.trades;
    // console.log(fund);
    let cash = parseFundHistory(fund);
    let stock = parseTrades(trades)

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
                                if (point.series.name === SERIES_NAME_CASH) {
                                    str += '<br>' + detail[1] + ' ' + detail[2];
                                } else if (point.series.name === SERIES_NAME_MARKET_VALUE) {
                                    str += '<br>' + detail.code + ' ' + detail.name + ' ' + detail.shares;
                                }
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
        }, {
            turboThreshold: 0,
            name: SERIES_NAME_MARKET_VALUE,
            data: stock
        }]
    })
});