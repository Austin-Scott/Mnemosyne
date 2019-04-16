
//Taken from: https://stackoverflow.com/a/17147973
jQuery(document).ready(function ($) {
    $('.clickable-row').click(function () {
        window.location = $(this).data('href')
    })
    $('#pendingTaskTable').DataTable({
        order: [[4, 'desc']]
    })
})