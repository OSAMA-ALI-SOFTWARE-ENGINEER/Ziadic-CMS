// Drop this script into your legacy page (e.g., include as <script src="/listing-submit-adapter.js"></script>)
// It intercepts a form with id="listing-form" and submits to the backend API endpoint as multipart/form-data.
(function () {
    const formId = 'listing-form'
    // resolve backend: prefer explicit global, otherwise localhost artisan default or same origin
    const resolvedBackend = window.__BACKEND_URL__ || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : '')
    const endpoint = resolvedBackend + '/api/public/submit-listing'

    function $(sel) { return document.querySelector(sel) }
    const form = document.getElementById(formId)
    if (!form) return console.warn('[Listing Adapter] No form with id="' + formId + '" found.')

    form.addEventListener('submit', async function (e) {
        e.preventDefault()
        const submitBtn = form.querySelector('[type=submit]')
        if (submitBtn) submitBtn.disabled = true

        const fd = new FormData(form)

        try {
            const res = await fetch(endpoint, { method: 'POST', body: fd, credentials: 'include' })
            const data = await res.json()
            if (!res.ok) {
                const msg = (data && (data.message || JSON.stringify(data))) || 'Submission failed'
                alert('Error: ' + msg)
            } else {
                // success - show thank-you / redirect
                if (window.SUBMISSION_SUCCESS_REDIRECT) {
                    window.location.href = window.SUBMISSION_SUCCESS_REDIRECT
                } else if (window.SUBMISSION_SUCCESS_MESSAGE) {
                    alert(window.SUBMISSION_SUCCESS_MESSAGE)
                } else {
                    alert('Thank you — your submission was received and is pending review.')
                }
                form.reset()
            }
        } catch (err) {
            console.error(err)
            alert('Network error submitting form: ' + err.message)
        } finally {
            if (submitBtn) submitBtn.disabled = false
        }
    })
})()
