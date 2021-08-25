/* global bootstrap: false */
'use strict'
// (function () {
//     'use strict'
//
//     $(function () {
import {simpleDebounce} from './utils.js';
// import simpleDebounce = require('./utils');

let app = new Vue({
    el: '#submit-form',
    data: {
        date: "",
        code: "",
        name: "",
        price: "",
        shares: "",
        commission: "",
        fees: "",
        stampDuty: "",
        transferTax: "",
        dividendTax: "",
        dividend: ""
    },
    computed: {
        totalPrice: function () {
            let tmp = currency(this.shares).multiply(this.price);
            return tmp.value === 0 ? "" : tmp;
        },
        totalFee: function () {
            let tmp = currency(this.commission).add(this.fees).add(this.stampDuty).add(this.transferTax);
            return tmp.value === 0 ? "" : tmp;
        },
        balance: function () {
            let tmp = currency(0).subtract(this.totalPrice).subtract(this.totalFee).subtract(this.dividendTax).add(this.dividend);
            return tmp.value === 0 ? "" : tmp;
        }
    },
    methods: {
        submit2: simpleDebounce(function (event) {
            if (this.balance.value === 0 || this.balance === "") {
                console.log("收支为0");
                return;
            }
            // e.preventDefault();
            let trade = {
                date: this.date,
                code: this.code,
                name: this.name,
                price: this.price,
                shares: this.shares,
                total_price: this.totalPrice,
                total_fee: this.totalFee,
                commission: this.commission,
                fees: this.fees,
                stamp_duty: this.stampDuty,
                transfer_tax: this.transferTax,
                dividend_tax: this.dividendTax,
                dividend: this.dividend,
                balance: this.balance
            };
            console.log(trade)

            // AJAX提交JSON:
            $.ajax({
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                url: '/api/trades',
                data: JSON.stringify(trade)
            }).done(function (r) {
                console.log(r);
                // vm.trades.push(r);
            }).fail(function (jqXHR, textStatus) {
                // Not 200:
                alert('Error: ' + jqXHR.status + ',Message' + textStatus);
            });
        }, 300)
    }
})

$('#submit-form').submit(function (e) {
    console.log("===>submit");
    e.preventDefault();
    var trade = {
        date: $(this).find('input[id=date]').val(),
        code: $(this).find('input[id=code]').val(),
        name: $(this).find('input[id=name]').val(),
        price: parseFloat($(this).find('input[id=price]').val()),
        shares: parseFloat($(this).find('input[id=shares]').val()),
        total_price: parseFloat($(this).find('input[id=total-price]').val()),
        total_fee: parseFloat($(this).find('input[id=total-fee]').val()),
        commission: parseFloat($(this).find('input[id=commission]').val()),
        fees: parseFloat($(this).find('input[id=fees]').val()),
        stamp_duty: parseFloat($(this).find('input[id=stamp-duty]').val()),
        transfer_tax: parseFloat($(this).find('input[id=transfer-tax]').val()),
        dividend_tax: parseFloat($(this).find('input[id=dividend-tax]').val()),
        dividend: parseFloat($(this).find('input[id=dividend]').val()),
        balance: parseFloat($(this).find('input[id=balance]').val())

    };
    console.log(trade)

    // AJAX提交JSON:
    $.ajax({
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        url: '/api/trades',
        data: JSON.stringify(trade)
    }).done(function (r) {
        console.log(r);
        // vm.trades.push(r);
    }).fail(function (jqXHR, textStatus) {
        // Not 200:
        alert('Error: ' + jqXHR.status + ',Message' + textStatus);
    });
})

//
//     // Tooltip and popover demos
//     document.querySelectorAll('.tooltip-demo')
//         .forEach(function (tooltip) {
//             new bootstrap.Tooltip(tooltip, {
//                 selector: '[data-bs-toggle="tooltip"]'
//             })
//         })
//
//     document.querySelectorAll('[data-bs-toggle="popover"]')
//         .forEach(function (popover) {
//             new bootstrap.Popover(popover)
//         })
//
//     document.querySelectorAll('.toast')
//         .forEach(function (toastNode) {
//             var toast = new bootstrap.Toast(toastNode, {
//                 autohide: false
//             })
//
//             toast.show()
//         })
//
//     // Disable empty links and submit buttons
//     document.querySelectorAll('[href="#"], [type="submit"]')
//         .forEach(function (link) {
//             link.addEventListener('click', function (event) {
//                 event.preventDefault()
//             })
//         })
//
//     function setActiveItem() {
//         var hash = window.location.hash
//
//         if (hash === '') {
//             return
//         }
//
//         var link = document.querySelector('.bd-aside a[href="' + hash + '"]')
//
//         if (!link) {
//             return
//         }
//
//         var active = document.querySelector('.bd-aside .active')
//         var parent = link.parentNode.parentNode.previousElementSibling
//
//         link.classList.add('active')
//
//         if (parent.classList.contains('collapsed')) {
//             parent.click()
//         }
//
//         if (!active) {
//             return
//         }
//
//         var expanded = active.parentNode.parentNode.previousElementSibling
//
//         active.classList.remove('active')
//
//         if (expanded && parent !== expanded) {
//             expanded.click()
//         }
//     }
//
//     setActiveItem()
//     window.addEventListener('hashchange', setActiveItem)
// })()