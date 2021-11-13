import http from "http";
//import WebSocket from "ws";
//import SocketIO from "socket.io"
import {Server} from "socket.io"
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/")); //catchall url

const httpServer = http.createServer(app);
//const wss = new WebSocket.Server({server});
//const wsServer = SocketIO(httpServer);
const wsServer = new Server(httpServer,{
    cors:{
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

//in memory adapter -> DB adpater, adapter enables your servers communicate each other
//All sockets have private room => iterate map and check key
//sid means socket id
function publicRooms(){ 
    const{
        sockets: {
            adapter: {sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key)=>{  
        if(sids.get(key)== undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size; //optional chaining
}

wsServer.on("connection", (socket)=>{
    socket["nickname"] =  "Anonymous";
    socket.onAny((event)=>{
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach((room)=>{
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1);
        });
    });
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("nickname", (nickname)=>{socket["nickname"] = nickname});
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
});

/* *** sever using only webSockets, not SocketIO ***
const sockets = [];

wss.on("connection", (socket)=>{
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser ✅");
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));
    socket.on("message", (msg)=>{
        const message = JSON.parse(msg);
        switch (message.type){
            case "new_message":
                sockets.forEach((aSocekt)=>
                    aSocekt.send(`${socket.nickname}: ${message.payload}`)
                );
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    });
});
*/

const handleListen = () => console.log(`Listenign on https://localhost:3000`)
httpServer.listen(3000, handleListen); //port num 3000
