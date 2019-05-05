
//Taken from: https://stackoverflow.com/a/17147973
jQuery(document).ready(function ($) {
    $('#allTimersTable').DataTable({
        order: [[0, 'desc']] //asc
    })
    // $('#activeTimersTable').DataTable({
    //     order: [[2, 'desc']]
    // })
})