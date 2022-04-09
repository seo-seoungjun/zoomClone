import express from "express";
import http from "http";
import WebSocket from "ws";
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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sokets = [];

wss.on("connection", (soket) => {
  // console.log(soket);
  sokets.push(soket);
  soket["nickname"] = "Anonnymous";
  console.log("connected to Browser ✅");
  soket.on("close", () => {
    console.log("disconnect from the browser ❌");
  });
  soket.on("message", (message) => {
    const { type, payload } = JSON.parse(message.toString("utf-8"));
    switch (type) {
      case "new_message":
        sokets.forEach((aSoket) => {
          aSoket.send(`${soket.nickname}: ${payload}`);
        });
      case "nickname":
        soket["nickname"] = payload;
    }
  });
});

server.listen(env.PORT, handleListen);
