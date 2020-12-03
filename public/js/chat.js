const socket = io()

// Elements
const $messageForm = document.querySelector('#msg-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.getElementById('send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // Visible height 
    const visibleHeight = $messages.offsetHeight

    // Height of the messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg, name) => {
    const html = Mustache.render(messageTemplate,{ 
            msg: msg.text, 
            createdAt: moment(msg.createdAt).format('hh:mm:ss a'),
            username: msg.username
        })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
            url: message.url, 
            createdAt: moment(message.createdAt).format('hh:mm:ss a'),
            username: message.username
        })
    $messages.insertAdjacentHTML('beforeend', html)

    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {room, users})
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    //disable
    let msg = e.target.elements.message.value
    socket.emit("sendMessage", msg, (err) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(err)
            return console.log(err)

        console.log("Message delivered !")
    })
})


$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by your browser.')
    // disable
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location Shared !")
            // enable
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
 
socket.emit("join", { username, room }, (err) => {
    if(err){
        alert(err)
        location.href = "/"
    }
})