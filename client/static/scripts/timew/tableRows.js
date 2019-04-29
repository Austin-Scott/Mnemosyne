
//Taken from: https://stackoverflow.com/a/17147973
jQuery(document).ready(function ($) {
    $('.clickable-row').click(function () {
        window.location = $(this).data('href')
    })
    $('#allTimersTable').DataTable({
        order: [[0, 'asc']]
    })
    $('#activeTimersTable').DataTable({
        order: [[2, 'desc']]
    })
})