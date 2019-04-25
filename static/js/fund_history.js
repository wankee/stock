function format(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

function calucChangeInDay(data, timestamp, start) {
    let index = start,
        change = currency(0),
        detail = new Array();

    for (let i = start; i < data.length; i++) {
        // console.log(i + " " + timestamp + " " + data[i][0] + " ");
        if (data[i][0] > timestamp) break;
        if (data[i][0] === timestamp) {
            // console.log(timestamp + " " + data[i][0] + " " + data[i][1]);
            index = i + 1;
            change = change.add(data[i][1]);
            detail.push(data[i]);
            // console.log("change " + change);
        }
    }
    return {
        index: index,
        change: change,
        detail: detail
    }
}

$.getJSON(window.location.origin + '/api/fund_history', function (data) {
    console.log(data);
    var cash = new Array();
    var date = new Array();
    date[0] = new Date(data[0][0]);
    date[0].setDate(date[0].getDate());

    // console.log(date);
    var now = new Date("2019-04-22");
    // console.log(now);
    // console.log(now - date[0]);
    var days = (now - date[0]) / 1000 / 3600 / 24;
    // console.log(days);

    var d1 = new Array();
    var d2 = new Array();
    // console.log(d1);
    var search_index = 0;

    for (let i = 0; i < days; i++) {
        if (i != 0) {
            date[i] = new Date(date[i - 1]);
            date[i].setDate(date[i - 1].getDate() + 1);
        }

        let change = currency(0);
        let detail = [];
        // console.log(i + " search:" + search_index);
        if (search_index < data.length) {
            let ob = calucChangeInDay(data, date[i].getTime(), search_index);
            search_index = ob.index;
            change = ob.change;
            detail = ob.detail;
        }

        if (i === 0) {
            cash[0] = change;
        } else {
            cash[i] = cash[i - 1].add(change);
        }
        // console.log(i + " cash:" + cash[i]);
        d1[i] = { x: date[i].getTime(), y: cash[i].value, detail: detail };
        d2[i] = [date[i].getTime(), i];
    }

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
                return ['<b>' + format(new Date(this.x)) + '</b>'].concat(
                    this.points.map(function (point) {
                        // console.log(point);
                        let str = '';
                        if (point.point.detail) {
                            // console.log(point.point.detail);
                            for (dt of point.point.detail) {
                                // console.log(dt);
                                str += '<br>' + dt[1] + ' ' + dt[2];
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
            name: "现金",
            data: d1
        }, {
            name: "test",
            data: d2
        }]
    })
});