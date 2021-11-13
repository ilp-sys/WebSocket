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
    const input = room.querySelector("#msg input")
    value = input.value
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`You: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input")
    socket.emit("nickname", input.value);
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room: ${roomName}`;
    const nameForm = room.querySelector("#name");
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit)
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

socket.on("welcome",(user, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on("bye", (user, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} "left!"`)
})

socket.on("new_message", addMessage)

socket.on("room_change", (rooms)=>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length == 0){
        return;
    }
    rooms.forEach(room=>{
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});