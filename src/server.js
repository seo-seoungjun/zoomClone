import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function FindPublicRooms() {
  const {
    sockets: {
      adapter: { rooms, sids },
    },
  } = wsServer;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countUsers(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

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
    const users = countUsers(roomName);
    done(users);
    soket.to(roomName).emit("enterRoom", soket.nickName, users);
    wsServer.sockets.emit("open_room", FindPublicRooms());
  });
  soket.on("new_message", (message, room, done) => {
    soket.to(room).emit("new_message", message, soket.nickName);
    done();
  });
  soket.on("disconnecting", () => {
    soket.rooms.forEach((room) =>
      soket.to(room).emit("left_room", soket.nickName, countUsers(room) - 1)
    );
  });
  soket.on("disconnect", () => {
    wsServer.sockets.emit("open_room", FindPublicRooms());
  });
});

httpServer.listen(env.PORT, handleListen);
