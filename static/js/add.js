/* global bootstrap: false */

(function() {
    'use strict'

    $(function() {
        $('#submit-form').submit(function(e) {
            e.preventDefault();
            var
                trade = {
                    code: $(this).find('input[name=code]').val(),
                    name: $(this).find('input[name=name]').val(),
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
    });

    // Tooltip and popover demos
    document.querySelectorAll('.tooltip-demo')
        .forEach(function(tooltip) {
            new bootstrap.Tooltip(tooltip, {
                selector: '[data-bs-toggle="tooltip"]'
            })
        })

    document.querySelectorAll('[data-bs-toggle="popover"]')
        .forEach(function(popover) {
            new bootstrap.Popover(popover)
        })

    document.querySelectorAll('.toast')
        .forEach(function(toastNode) {
            var toast = new bootstrap.Toast(toastNode, {
                autohide: false
            })

            toast.show()
        })

    // Disable empty links and submit buttons
    document.querySelectorAll('[href="#"], [type="submit"]')
        .forEach(function(link) {
            link.addEventListener('click', function(event) {
                event.preventDefault()
            })
        })

    function setActiveItem() {
        var hash = window.location.hash

        if (hash === '') {
            return
        }

        var link = document.querySelector('.bd-aside a[href="' + hash + '"]')

        if (!link) {
            return
        }

        var active = document.querySelector('.bd-aside .active')
        var parent = link.parentNode.parentNode.previousElementSibling

        link.classList.add('active')

        if (parent.classList.contains('collapsed')) {
            parent.click()
        }

        if (!active) {
            return
        }

        var expanded = active.parentNode.parentNode.previousElementSibling

        active.classList.remove('active')

        if (expanded && parent !== expanded) {
            expanded.click()
        }
    }

    setActiveItem()
    window.addEventListener('hashchange', setActiveItem)
})()