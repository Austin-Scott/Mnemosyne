
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
        showModal(`Recent entries`, printEntries(data.entries, tags))
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

function printEntries(entries, tags) {
    let result = []
    entries.forEach((entry) => {
        result.push(
            `<p class="h4">${processTags(entry.title, tags)}</p>` +
            `<p><small>${entry.date + '&nbsp;' + entry.time}</small></p>` +
            `<p>${processTags(entry.body, tags)}</p>`
        )
    })
    return result.reverse().join('<hr/>')
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
                document.getElementById('searchResults').innerHTML = printEntries(entries, tags)
                //TODO: Add map code here
                resolve(data)
                return
            }
        })
    })
}