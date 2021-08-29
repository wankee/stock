'use strict'

let vm = new Vue({
    el: '#div-container',
    data: {
        trades: [],
        totalBalance: 0,
        clearedStocks: []
    },
    methods: {
        deleteProduct: function(id) {
            let that = this;
            let reqId = id;
            // AJAX提交JSON:
            $.ajax({
                type: 'delete',
                dataType: 'json',
                url: '/api/trades/' + id
            }).done(function(r) {
                console.log(r);
                var i;
                for (i = 0; i < that.trades.length; i++) {
                    if (that.trades[i].id === reqId) {
                        that.trades.splice(i, 1);
                        return;
                    }
                }
            }).fail(function(jqXHR, textStatus) {
                // Not 200:
                alert('Error: ' + jqXHR.status);
            });
        }
    }
});

$.getJSON('/api/trades').done(function(data) {
    vm.trades = data.trades;
    let total;
    let result = [];
    let codes = [];

    for (let row of data.trades) {

        // console.log(typeof row.balance)
        total = currency(total).add(row.balance)
        let contains = true;
        let el = null;
        for (let res of result) {
            if (row.code === res.code && row.name === res.name) {
                el = res;
                break;
            } else if ((row.code === res.code && row.name !== res.name) ||
                (row.code !== res.code && row.name == res.name)) {
                alert("有代码与名称不同的记录");
                console.log(result)
                console.log(row)
            }
        }

        if (el === null) {
            el = {
                code: row.code,
                name: row.name
            }
            result.push(el);
        }

        el.startDate = row.date;
        el.endDate = row.date;
        el.balance = currency(el.balance).add(row.balance).value;
        // el.history.push(row);

    }
    console.log(result);
    let sum = currency(0);
    result.forEach(i => sum = sum.add(i.balance))
    console.log(sum.value);

    vm.totalBalance = total;
    vm.clearedStocks = result;
}).fail(function(jqXHR, textStatus) {
    alert('Error: ' + jqXHR.status);
});

// $.getJSON('/api/statistics').done(function (data) {
//     console.log(data)
// }).fail(function (jqXHR, textStatus) {
//     alert('Error: ' + jqXHR.status);
// });

$('#product-form').submit(function(e) {
    e.preventDefault();
    var
        trade = {
            name: $(this).find('input[name=name]').val(),
            code: $(this).find('input[name=manufacturer]').val(),
            price: parseFloat($(this).find('input[name=price]').val())
        };
    // AJAX提交JSON:
    $.ajax({
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        url: '/api/trades',
        data: JSON.stringify(trade)
    }).done(function(r) {
        console.log(r);
        vm.trades.push(r);
    }).fail(function(jqXHR, textStatus) {
        // Not 200:
        alert('Error: ' + jqXHR.status);
    });
});