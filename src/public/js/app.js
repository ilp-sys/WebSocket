const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")
const room = document.getElementById("room")

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input")
    value = input.value
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName}`
    const form = room.querySelector("form")
    form.addEventListener("submit", handleMessageSubmit)
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input")
    //event_room이라는 event를 emit
    //socket.io의 마지막 인자로 보내는 함수 -> The server initiate and make fron-end run this function.. Also could send param!
    socket.emit("enter_room", input.value, showRoom)
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", ()=>{
    addMessage("Someone joined!")
});

socket.on("bye", ()=>{
    addMessage("Someone left!")
})

socket.on("new_message", addMessage)