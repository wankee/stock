'use strict'

let vm = new Vue({
    el: '#div-container',
    data: {
        trades: [],
        totalBalance: 0
    },
    methods: {
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
    vm.trades = data.trades;
    let res = {balance: 0};

    for (let row of data.trades) {
        let code = row.code;
        // console.log(typeof row.balance)
        let total = currency(res.balance).add(currency(row.balance))
        res.balance = total.value;
    }

    vm.totalBalance = res.balance;
}).fail(function (jqXHR, textStatus) {
    alert('Error: ' + jqXHR.status);
});

// $.getJSON('/api/statistics').done(function (data) {
//     console.log(data)
// }).fail(function (jqXHR, textStatus) {
//     alert('Error: ' + jqXHR.status);
// });

$('#product-form').submit(function (e) {
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
    }).done(function (r) {
        console.log(r);
        vm.trades.push(r);
    }).fail(function (jqXHR, textStatus) {
        // Not 200:
        alert('Error: ' + jqXHR.status);
    });
});
