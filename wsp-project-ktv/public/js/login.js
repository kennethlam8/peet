function initLoginPage() {
    let loginFormElem = document.querySelector('#login-form')
    if (loginFormElem) {


        loginFormElem.addEventListener('submit', async (e) => {
                e.preventDefault()

                // prepration
                let loginFormObj = {
                    username: loginFormElem.username.value,
                    password: loginFormElem.password.value,
                }

                // fetch request
                let res = await fetch('/login', {
                    method: 'POST',
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(loginFormObj)
                })

                let result = await res.json()

                console.log('result = ', result)
                // loginFormElem.innerText = result.message

                if (res.ok) {
                    loginFormElem.classList.add('success')
                    setTimeout(() => {
                        window.location = '/'
                    }, 1000)
                } else {
                    // loginFormElem.classList.add('error')
                }
            }



        )
    }
}




async function getMe(){
let res = await fetch('/me')
let {data, message, error} = await res.json()
let {username,id } = data

}



initLoginPage()