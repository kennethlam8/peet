async function backToHome() {
    window.location.href = `/?activeTab=2`
}


let search = new URLSearchParams(window.location.search)
let userId = search.get('userId')
console.log(userId)

async function fetchUserProfile() {
    let res = await fetch(`/users/${userId}`)
    let user = (await res.json()).data
    console.log(user)


    document.querySelector('#profile-img').src = "/assets/img/user/" + user.image
    document.querySelector('#username').innerText = user.username

}

let chatWithBtnElem = document.querySelector('#chat-with-btn')
chatWithBtnElem.addEventListener('click', chatWithUser)

async function chatWithUser(){
    if (!userId){
        return
    }
        let res = await fetch(`/chatWithUserId?userId=${userId}`)
        if (res.ok){
            window.location.href = '/page3.html'
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

        console.log('id = ', id)
        if (Number(userId) === id){
            document.querySelector('#logout-button').innerHTML = `
            <div class="like">
            <button" onclick='logout()' class="btn">Logout</button>
        </div>`
        }
    }



}

async function logout(){
    let res  = await fetch('/logout')
    if (res.ok){
        window.location.href  = '/login/login.html'
    }
}

fetchUserProfile()
getMe()
