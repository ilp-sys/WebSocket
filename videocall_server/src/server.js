import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
console.log(__dirname)
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/")); //catchall url

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer)

const handleListen = () => console.log(`Listenign on https://localhost:3000`)
httpServer.listen(3000, handleListen); //port num 3000
