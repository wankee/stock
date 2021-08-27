/* global bootstrap: false */
'use strict'
// (function () {
//     'use strict'
//
//     $(function () {
import {simpleDebounce} from './utils.js';
// import simpleDebounce = require('./utils');

let vue = new Vue({
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
        dividend: "",
        submitTime: 0,
        isSubmitting: false
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
                total_price: this.totalPrice === "" ? 0 : this.totalPrice.value,
                total_fee: this.totalFee === "" ? 0 : this.totalFee.value,
                commission: this.commission,
                fees: this.fees,
                stamp_duty: this.stampDuty,
                transfer_tax: this.transferTax,
                dividend_tax: this.dividendTax,
                dividend: this.dividend,
                balance: this.balance === "" ? 0 : this.balance.value
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
    let cur = new Date().getTime();
    if (cur - vue.submitTime < 300) return false;

    vue.submitTime = cur;

    // e.preventDefault();
    let trade = {
        date: vue.date,
        code: vue.code,
        name: vue.name,
        price: vue.price,
        shares: vue.shares,
        total_price: vue.totalPrice === "" ? 0 : vue.totalPrice.value,
        total_fee: vue.totalFee === "" ? 0 : vue.totalFee.value,
        commission: vue.commission,
        fees: vue.fees,
        stamp_duty: vue.stampDuty,
        transfer_tax: vue.transferTax,
        dividend_tax: vue.dividendTax,
        dividend: vue.dividend,
        balance: vue.balance === "" ? 0 : vue.balance.value
    };
    console.log(trade)

    vue.isSubmitting = true;
    // AJAX提交JSON:
    $.ajax({
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        url: '/api/trades',
        data: JSON.stringify(trade)
    }).done(function (r) {
        vue.price = "";
        vue.shares = "";
        vue.commission = "";
        vue.fees = "";
        vue.stampDuty = "";
        vue.transferTax = "";
        vue.dividendTax = "";
        vue.dividend = "";
        vue.isSubmitting = false;
        console.log(r);
    }).fail(function (jqXHR, textStatus) {
        vue.isSubmitting = false;
        // Not 200:
        alert('Error: ' + jqXHR.status + ',Message' + textStatus);
    });
    return false
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