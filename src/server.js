import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";

const env = process.env;
const app = express();

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);
app.use("/public", express.static(`${__dirname}/public`));
app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.redirect("index"));

const handleListen = () =>
  console.log(`Listening to http://localhost:${env.PORT}`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (soket) => {
  soket["nickName"] = "익명";
  soket.onAny((event) => {
    console.log(`soket event: ${event}`);
  });
  soket.on("submitNickName", (nickName) => {
    soket.nickName = nickName;
  });
  soket.on("submitRoomName", (roomName, done) => {
    soket.join(roomName);
    console.log(soket.rooms);
    done();
    soket.to(roomName).emit("enterRoom", soket.nickName);
  });
  soket.on("new_message", (message, room, done) => {
    soket.to(room).emit("new_message", message, soket.nickName);
    done();
  });
  soket.on("disconnecting", () => {
    soket.rooms.forEach((room) =>
      soket.to(room).emit("left_room", soket.nickName)
    );
  });
});

httpServer.listen(env.PORT, handleListen);
