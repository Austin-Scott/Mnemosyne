/**
 * @brief sends a post request to the API to end a timer
 *        that has the input tags.
 * @param {string} tags An string encoding an array of tags
 */
function endTimer(tags) {
  alert(`endTask entered. Tags = ${tags}`)
  // turning the string into an array
  let tagsArr = tags.split(', ')
  // make a request to the API to end the task selected
  $.ajax({
    type: 'POST',
    url: '/timewAPI/stop',
    data: {
      args: tagsArr
    },
    success: (success, stdout, stderr) => {
      location.reload()
    },
    error: (httpRequest, error) => {
      alert(`Error connecting to API:\n${error}`)
    },
    dataType: 'json',
    timeout: 10000
  })
}

/**
 * @brief sends a post request to the API to start a timer
 * @return none
 */
function startTimer() {
  let tagsInput = document.getElementById('timew-tags')
  let tagsStr = tagsInput.value
  let tags = tagsStr.split(',')
  tags.forEach((element) => {
    // Cleaning the input of whitespace
    element.trim()
    // Input doesn't need to be sanitized because that
    // is monitored server side, but that would go here.
  })
  $.ajax({
    type: 'POST',
    url: '/timewAPI/start',
    data: {
      args: tags
    },
    success: (success, stdout, stderr) => {
      location.reload()
    },
    error: (httpRequest, error) => {
      alert(`Error connecting to API:\n${error}`)
    },
    dataType: 'json',
    timeout: 10000
  })
}