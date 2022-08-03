//logic of password confirmation
let password = document.querySelector("#reg-password")
  , confirm_password = document.querySelector("#confirm-password");

function validatePassword() {
  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity('');
  }
}

password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;



window.onload = initRegisterPage

function initRegisterPage() {

  let registerFormElem = document.querySelector('#register-form')
  let registerResultElem = document.querySelector('#register-result')
  let registerBtnElem = document.querySelector('#register-btn')
  let signinHereBtnElem = document.querySelector('.signin-here-btn')


  async function register() {
    // let registerFormObj = {
    //   username: registerFormElem.username.value,
    //   email: registerFormElem.email.value,
    //   password: registerFormElem.password.value,
    //   image: registerFormElem.photo.value,
    // }

    const formData = new FormData(registerFormElem)

    let res = await fetch('/user', {
      method: 'POST',
      body: formData
    })


    let result = await res.json()

    console.log('result = ', result)
    registerResultElem.innerText = result.message

    if (res.ok) {
      registerResultElem.classList.add('success')
      setTimeout(() => {
        window.location = '/page1.html'
      }, 2000)
    } else {
      registerResultElem.classList.add('error')
    }
  }


  if (registerFormElem) {

    registerFormElem.addEventListener('submit', async (e) => {

      e.preventDefault();
      if (registerBtnElem.value = "Register") {
        register()
      }
    })
  }
}