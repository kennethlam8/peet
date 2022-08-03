async function fetchChatList() {
    let res = await fetch('/chat_lists')
    let users = await res.json()
    console.log(JSON.stringify(users))

    document.querySelector('.contact-table-scroll table tbody').innerHTML = ''
    for (let user of users) {

        document.querySelector('.contact-table-scroll table tbody').innerHTML += /*HTML*/`
            <tr onclick=clickOnChatListUser(${user.id})>
                <td><img src='/assets/img/user/${user.image}' alt="" class="profile-image rounded-circle"></td>
                <td>${user.username}<br> <small>${user.lastContent}</small></td>
                <td><small>${user.time}</small></td>
            </tr>
            ` }
}


async function clickOnChatListUser(userId) {
    let res = await fetch(`/message/${userId}`)
    let {messages, userInfo } = await res.json()
    let chatMessagesContainerElem = document.querySelector('.message-table-scroll table tbody')
    chatMessagesContainerElem.innerHTML = ''
    for (let message of messages) {
        chatMessagesContainerElem.innerHTML += /*HTML*/
            `
        <tr>
          <td>
            <p class="${!message.isSelf ? 'bg-primary' : 'bg-success'} p-2 mt-2 mr-5 shadow-sm text-white float-${!message.isSelf ? 'left' : 'right'} rounded">${message.content}</p>
          </td>
          <td>
            <p class="p-1 mt-2 mr-3 shadow-sm"><small>${message.timeLabel}</small></p>
          </td>
        </tr>       
         `
    }

    //update header
    updateChatMessageBoxHeader(userInfo)

    // add target userId into message input tag
    document.querySelector('#chat-input-box').setAttribute('toId', userId)

    // Auto scroll to bottom
    let messageTableElem = document.querySelector('.message-table-scroll')
    messageTableElem.scrollTop = messageTableElem.scrollHeight;
}


function updateChatMessageBoxHeader(userInfo){
  let {username, image} = userInfo

  
  document.querySelector('.contact .name').innerText = username
  document.querySelector('.contact .profile-image').src = `/assets/img/user/${image}`

}



async function sendMessage() {
    const toUserId = document.querySelector('#chat-input-box').getAttribute('toid')
    const content = document.querySelector('#chat-input-box').value
    if (!toUserId) {
        console.log('Select jor user sin')
        return
    }
    if (!content) {
        console.log('Content should not empty')
        return
    }
    console.log("sending msg: ", content)
    let res = await fetch('/message', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, toUserId })
    })

    if (res.ok) {
        console.log('success end message')
        document.querySelector('#chat-input-box').value = ''
        clickOnChatListUser(toUserId)
    } else {
        document.querySelector('#chat-input-box').value = 'Error '
    }

}

document.querySelector('#sendMessage')
    .addEventListener('click', async (event) => {
        event.preventDefault()

        await sendMessage()
        fetchChatList()


    })



document.querySelector('#message-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    console.log("submiting")
    await sendMessage()
    fetchChatList()
})



fetchChatList()


const socket = io.connect();
socket.on('new-message', (data) => {
    fetchChatList()
    let currentUserId = document.querySelector('#chat-input-box').getAttribute('toId')


    let { from, content } = data
    alertify.success(`
    <img class='profile-image rounded-circle' src='/assets/img/user/${from.img}'>
    ${from.userName} said :${content} `);
    if (from.id === Number(currentUserId)) {
        // clickOnChatListUser(currentUserId)

        newContentBubble = /*HTML*/
            `
    <tr>
      <td>
        <p class="bg-primary p-2 mt-2 mr-5 shadow-sm text-white float-left rounded">${content}</p>
      </td>
      <td>
        <p class="p-1 mt-2 mr-3 shadow-sm"><small>TIME</small></p>
      </td>
    </tr>       
     `

        document.querySelector('.message-table-scroll table tbody').innerHTML += newContentBubble

    }



})