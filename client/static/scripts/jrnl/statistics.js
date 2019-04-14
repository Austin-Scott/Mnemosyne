
var monthChart = null
var monthChartOffset = 0

var yearChart = null
var yearChartOffset = 0

var yearsChart = null
var yearsChartOffset = 0

var chartData = null

//Returns a month of daily word counts in format understandable to chart.js
function monthData(data) {
    let now = new Date()

    let result = []

    now.setDate(now.getDate() + (30 * (monthChartOffset - 1)) + 1)

    for (let i = 0; i < 30; i++) {
        let year = now.getFullYear()
        let month = now.getMonth() + 1
        let day = now.getDate()

        let words = 0
        if (year in data.byYear && month in data.byYear[year].byMonth && day in data.byYear[year].byMonth[month].byDay) {
            words = data.byYear[year].byMonth[month].byDay[day].totalWordCount
        }
        result.push({ x: new Date(year, month - 1, day), y: words })

        now.setDate(day + 1)
    }
    return result
}
function updateMonthChart() {
    if (chartData !== null && monthChart !== null) {
        updateChart(monthChart, monthData(chartData))
    }
}

//Returns a year of monthly word counts in chart.js data format
function yearData(data) {
    let now = new Date()

    let result = []

    now.setMonth(now.getMonth() + (12 * (yearChartOffset - 1) + 1))

    for (let i = 0; i < 12; i++) {
        let year = now.getFullYear()
        let month = now.getMonth() + 1

        let words = 0
        if (year in data.byYear && month in data.byYear[year].byMonth) {
            words = data.byYear[year].byMonth[month].totalWordCount
        }
        result.push({ x: new Date(year, month - 1), y: words })

        now.setMonth(month)
    }
    return result
}
function updateYearChart() {
    if (chartData !== null && yearChart !== null) {
        updateChart(yearChart, yearData(chartData))
    }
}

//Returns 10 years of annual word count totals in chart.js format
function tenYearsData(data) {
    let now = new Date()

    let result = []

    now.setFullYear(now.getFullYear() + (10 * (yearsChartOffset - 1)) + 1)

    for (let i = 0; i < 10; i++) {
        let year = now.getFullYear()

        let words = 0
        if (year in data.byYear) {
            words = data.byYear[year].totalWordCount
        }
        result.push({ x: new Date(year, 0), y: words })

        now.setFullYear(year + 1)
    }
    return result
}
function updateYearsChart() {
    if (chartData !== null && yearsChart !== null) {
        updateChart(yearsChart, tenYearsData(chartData))
    }
}

//Creates a new chart.js line chart given a canvas context, a title, time axis granularity (day, month, year), and data to plot
function createChart(context, title, timeLabel, data) {
    return new Chart(context, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Total Word Count',
                    backgroundColor: '#5BC0DE',
                    borderColor: '#5BC0DE',
                    showLine: true,
                    fill: false,
                    data: data
                }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title
            },
            yAxisID: 'Words written',
            xAxisID: timeLabel,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: timeLabel
                    }
                }]
            }
        }
    })
}

//updates an already existing chart with new data
function updateChart(chart, newData) {
    chart.data.datasets[0].data = newData
    chart.update()
}

//Requests statistics from the server via AJAX
function statistics() {
    let button = document.getElementById('statisticsButton')
    let initialValue = button.value
    button.value = 'Retrieving...'
    button.setAttribute('disabled', 'true')

    $.ajax({
        type: 'GET',
        url: '/jrnlAPI/statistics',
        success: (data, status) => {
            button.value = 'Refresh'
            button.removeAttribute('disabled')
            if (status == 'success') {
                let innerHTML = '<h5>All time totals:</h5>'
                innerHTML += `<ul><li>Characters: ${data.totalCharacterCount}</li><li>Words: ${data.totalWordCount}</li><li>Entries: ${data.totalEntryCount}</li><li>Average words per entry: ${(data.totalWordCount / data.totalEntryCount).toFixed(2)}</li></ul>`
                document.getElementById('statsArea').innerHTML = innerHTML

                chartData = data

                if (monthChart == null) {
                    monthChart = createChart($('#monthCanvas'), 'Words written per day', 'day', monthData(data))
                } else {
                    updateMonthChart()
                }
                if (yearChart == null) {
                    yearChart = createChart($('#yearCanvas'), 'Words written per month', 'month', yearData(data))
                } else {
                    updateYearChart()
                }
                if (yearsChart == null) {
                    yearsChart = createChart($('#yearsCanvas'), 'Words written per year', 'year', tenYearsData(data))
                } else {
                    updateYearsChart()
                }

                return
            }
            showModal('Error', `Something went wrong. Please try again in a little bit.<br />More info:<br />data: ${JSON.stringify(data)} status: ${status}`)
        },
        error: (jqXHR, status) => {
            button.value = initialValue
            button.removeAttribute('disabled')

            if (status == 'timeout') {
                showModal('Error', 'The server took too long to respond. Please try again in a little bit.')
                return
            }
            showModal('Error', `Your request was unable to be completed: ${status}`)
        },
        dataType: 'json',
        timeout: 20000
    })
}