export function paste(e) {
  e.preventDefault()
  navigator.clipboard.readText()
  .then(text => {
    let el = document.getElementById('url-input')
    el.value = text
    el.select()
    document.getElementById('submit-button').focus()
    setTimeout(() => {
      if( el.classList.contains('is-invalid') ){
        el.select()
      }
    }, 500)
  })
}