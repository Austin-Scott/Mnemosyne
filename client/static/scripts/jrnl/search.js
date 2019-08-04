
var timeline = null
var searchSentimentChart=null

//Allows user to search by pressing enter key
$('#searchForm input').keydown(function (e) {
    if (e.keyCode == 13) {
        $('#searchForm').submit();
    }
})

//Performs a search of journal entries via AJAX
function search() {

    postFromButton('searchButton', 'Searching...', '/jrnlAPI/search',
        {
            terms: document.getElementById('terms').value,
            limitByNum: document.getElementById('limitByNum').checked,
            num: document.getElementById('num').value,
            starred: document.getElementById('starred').checked,
            tags: document.getElementById('tags').value,
            useAnd: document.getElementById('useAnd').checked,
            filterEarlier: document.getElementById('filterEarlier').value,
            filterLater: document.getElementById('filterLater').value
        },
        (data)=>{
            if(!data.success && data.stderr) {
                showModal('Error', data.stderr)
                return
            }

            let result = ''
            let entries = data.entries
            if (entries) {
                entries.forEach((entry) => {
                    result += '<div class="col-lg-3 col-md-4 col-sm-6 col-12"><div class="panel panel-default" style="background-color: #414141">'
                    result += `<p class="h4">${entry.title}</p>`
                    result += `<p><strong>${entry.date + '&nbsp;' + entry.time}</strong></p>`
                    result += `<p>${entry.body}</p>`;
                    result += '</div></div>'
                })
                document.getElementById('searchResults').innerHTML = result

                let args = {
                    start_at_end: true,
                    default_bg_color: { r: 0, g: 0, b: 0 }
                }
                timeline = new TL.Timeline('timeline-embed', timelineJson(entries), args)

                return
            }
        })
}

//Converts JSON data returned from search result into format understanded by timeline.js
function timelineJson(entries) {
    let result = { events: [] }
    entries.forEach((entry) => {
        let date = entry.date.split('-')
        let dYear = date[0]
        let dMonth = date[1]
        let dDay = date[2]
        let time = entry.time.split(':')
        let dHour = time[0]
        let dMinute = time[1]
        result.events.push({
            start_date: { year: dYear, month: dMonth, day: dDay, hour: dHour, minute: dMinute },
            text: { headline: entry.title, text: entry.title + ' ' + entry.body }
        })
    })
    return result
}