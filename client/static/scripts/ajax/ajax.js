/**
 * 
 * @param {String} url 
 * @param {Object} data 
 * @param {(data:Object)=>void} onSuccess 
 * @param {()=>Boolean} onError 
 */
function post(url, data, onSuccess, onError) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: (data, status) => {
            if (status == 'success') {
                onSuccess(data)
            } else {
                showModal('Error', `Something went wrong. Please try again in a little bit.<br />More info:<br />data: ${JSON.stringify(data)} status: ${status}`)
            }
        },
        error: (jqXHR, status) => {
            if(typeof onError == 'function') {
                if(onError()==false) {
                    return
                }
            }
            if (status == 'timeout') {
                showModal('Error', 'The server took too long to respond. Please try again in a little bit.')
                return
            }
            showModal('Error', `Your request was unable to be completed: ${status}`)
        },
        dataType: 'json',
        timeout: 10000
    })
}

/**
 * 
 * @param {String} buttonID 
 * @param {String} buttonLoadingText 
 * @param {String} url 
 * @param {Object} data 
 * @param {(data:Object)=>void} onSuccess 
 * @param {()=>Boolean} onError 
 */
function postFromButton(buttonID, buttonLoadingText, url, data, onSuccess, onError) {

    let button = document.getElementById(buttonID)
    let initialValue = button.value
    button.value = buttonLoadingText
    button.setAttribute('disabled', 'true')

    post(url, data, (data)=>{
        button.value = initialValue
        button.removeAttribute('disabled')

        onSuccess(data)
    }, ()=>{
        button.value = initialValue
        button.removeAttribute('disabled')

        if(typeof onError == 'function') {
            return onError()
        }

        return true
    })

}