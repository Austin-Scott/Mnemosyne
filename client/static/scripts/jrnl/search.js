
var timeline = null
var searchSentimentChart=null

//Allows user to search by pressing enter key
$('#searchForm input').keydown(function (e) {
    if (e.keyCode == 13) {
        $('#searchForm').submit();
    }
})

function searchByTagLink(tag) {
    search({ limitByNum: true, num: 10, tags: tag }, true).then(data => {
        let tags = Object.keys(data.tags)
        let result = ['']
        data.entries.forEach((entry) => {
            result.push(
                `<p class="h4">${processTags(entry.title, tags)}</p>` +
                `<p><small>${entry.date + '&nbsp;' + entry.time}</small></p>` +
                `<p>${processTags(entry.body, tags)}</p>`
            )
        })
        showModal(`Recent entries`, result.join('<hr/>'))
    })
}

function processTags(body, tags, links = true) {
    tags.forEach(tag => {
        if(tag == '@_location') {
            body = body.replace(/@_location\s[-\d\.]+\s[-\d\.]+/g, '')
        } else if(tag == '@_time') {
            body = body.replace(/@_time\s\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/g, '')
        } else {
            tag = tag.replace('@', '')
            if(links) {
                body = body.replace(new RegExp(`@(${tag})`, 'ig'), `<a href="javascript:searchByTagLink('@${tag}')">$1</a>`)
            } else {
                body = body.replace(new RegExp(`@(${tag})`, 'ig'), `$1`)
            }
        }
    })

    return body
}

function createCards(entries, tags) {
    let result = ''
    entries.forEach((entry) => {
        result += '<div class="col-lg-3 col-md-4 col-sm-6 col-12"><div class="panel panel-default" style="background-color: #414141">'
        result += `<p class="h4">${processTags(entry.title, tags)}</p>`
        result += `<p><strong>${entry.date + '&nbsp;' + entry.time}</strong></p>`
        result += `<p>${processTags(entry.body, tags)}</p>`
        result += '</div></div>'
    })
    return result
}

//Performs a search of journal entries via AJAX
function search(params, returnResult = false) {

    if(!params) {
        params = {
            terms: document.getElementById('terms').value,
            limitByNum: document.getElementById('limitByNum').checked,
            num: document.getElementById('num').value,
            starred: document.getElementById('starred').checked,
            tags: document.getElementById('tags').value,
            useAnd: document.getElementById('useAnd').checked,
            filterEarlier: document.getElementById('filterEarlier').value,
            filterLater: document.getElementById('filterLater').value
        }
    }

    return new Promise((resolve, reject)=>{
        postFromButton('searchButton', 'Searching...', '/jrnlAPI/search',
        params,
        (data)=>{
            if(!data.success && data.stderr) {
                showModal('Error', data.stderr)
                reject()
                return
            }

            if(returnResult) {
                resolve(data)
                return
            }

            let tags = Object.keys(data.tags)
            let entries = data.entries
            if (entries) {
                document.getElementById('searchResults').innerHTML = createCards(entries, tags)

                let args = {
                    start_at_end: true,
                    default_bg_color: { r: 0, g: 0, b: 0 }
                }

                timeline = new TL.Timeline('timeline-embed', timelineJson(entries, tags), args)

                resolve(data)
                return
            }
        })
    })
}

//Converts JSON data returned from search result into format understanded by timeline.js
function timelineJson(entries, tags) {
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
            text: { headline: processTags(entry.title, tags, false), text: processTags(entry.title + ' ' + entry.body, tags) }
        })
    })
    return result
}