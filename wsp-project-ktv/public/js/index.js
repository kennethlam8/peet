async function initApp() {


    // let res =  await fetch('/pages/home.html')
    // let homePageHTML = await res.text()
    // document.querySelector('#page1').outerHTML = homePageHTML
    // fetchUsers()
    // setTabEventListener()



    // let mapRes = await fetch('/pages/map.html')
    // let mapPageHTML = await mapRes.text()
    // document.querySelector('#map-page').innerHTML = mapPageHTML    
    // initMap()



    // let chatRes = await fetch('/pages/page3.html')
    // let chatPageHTML = await chatRes.text()
    // document.querySelector('#page3').innerHTML = chatPageHTML    


    getMe()
}




function setTabEventListener() {
    let radios = document.querySelectorAll('input[name=tab-control]')


    for (let radio of radios) {
        radio.addEventListener('click', () => {
            let tabButtons = document.querySelectorAll('.tab-button')
            for (let tabButton of tabButtons) {
                tabButton.classList.remove('active')
            }
            let activeTab = document.querySelector('input[name=tab-control]:checked').value

            tabButtons[activeTab - 1].classList.add('active')
        })

    }
}


async function fetchUsers() {
    let userRes = await fetch('/users')
    let users = await userRes.json()
    let usersContainerElem = document.querySelector('.users-container')
    console.table(users)

    for (let user of users) {
        usersContainerElem.innerHTML += `
                         <div onclick="viewProfile(${user.id})" class="user-container col-sm-6 col-lg-4">
                            <img src="/assets/img/user/${user.image}" class="pig">
                            <div class="name">${user.username}</div>
                        </div>
        `

    }

}


async function getMe() {
    let res = await fetch('/me')

    let {
        data,
        message,
        error
    } = await res.json()

    if (res.ok) {
        let {
            username,
            id
        } = data
        document.querySelector('#footer-profile-img-container').innerHTML = ''
        document.querySelector('#footer-profile-img-container').innerHTML = `<img src="/assets/img/user/${data.image}" >`
        document.querySelector('#footer-login').href = `/pages/profile.html?userId=${id}`
    } else {

        window.location.href = "/login/login.html"
    }
}
// async function logout(){
//     await fetch('/logout',{method: 'POST'})
// }

initApp()
// document.querySelector('#footer-profile-page').innerHTML = ''
// document.querySelector('#footer-profile-page').innerHTML ='./pages/profile.html'