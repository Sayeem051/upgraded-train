const socket = io()

const userInfo=Qs.parse(location.search, {ignoreQueryPrefix: true})

const $form = document.querySelector("#message_form")
const $formInput=$form.querySelector('input')
const $formSubmit=$form.querySelector('button')
const messages=document.querySelector('#messages')

const message_template=document.querySelector('#message_template').innerHTML
const location_template=document.querySelector('#location_template').innerHTML
const sidebar_template=document.querySelector('#sidebar_template').innerHTML

const autoScroll=()=>{
  /*
  get last message
  get its height+margin
  get scroller height
  get container height
  get users current position
  use conditional logic to scroll or not
  */
 //last message
 const $newMessage=messages.lastElementChild

 //get message height
 const messageStyles=getComputedStyle($newMessage)
 const newMessageMargin=parseInt(messageStyles.marginBottom)
 const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

 //get scroller height
 const visibleHeight=messages.offsetHeight

 //container height
 const containerHeight=messages.scrollHeight

 //current pos
 const scrollOffset=messages.scrollTop+visibleHeight

 if(scrollOffset>=containerHeight-newMessageHeight){
   messages.scrollTop=messages.scrollHeight
 }

}

socket.on("message", (message) => {
  const html=Mustache.render(message_template, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('hh:mm a')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

$form.addEventListener("submit", (event) => {
  event.preventDefault()
  
  $formSubmit.setAttribute('disabled', 'disabled')
  
  const $formInput = event.target.elements.message
  socket.emit("sendMessage", $formInput.value)
  
  $formSubmit.removeAttribute('disabled')
  $formInput.value=''
  $formInput.focus()
})

const $location=document.getElementById('send_loc')

$location.addEventListener("click", (e) => {
  e.preventDefault()
  if (!navigator.geolocation) {
    return alert(`This Browser doesn't Support Geolocation Services`)
  }
  $location.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {latitude: position.coords.latitude, longitude: position.coords.longitude}, ()=>{
    })
  })
  $location.removeAttribute('disabled')
})

socket.on('usersList', ({room, users})=>{
  const html=Mustache.render(sidebar_template, {room, users})
  document.querySelector('#sidebar').innerHTML=html
})

socket.on('locationMessage', url=>{
  const html=Mustache.render(location_template, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('hh:mm a')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.emit('join', userInfo, (error)=>{
  if(error){
    alert(error)
    location.href='/'
  }
})