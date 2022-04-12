const soket = io();

const RoomForm = document.querySelector("#welcome");
const enterRoomBtn = RoomForm.querySelector("button");
const room = document.querySelector("#room");
const nickNameForm = document.querySelector("#name");

let roomName;

room.hidden = true;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom() {
  RoomForm.hidden = true;
  nickNameForm.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName}`;
}

function handleRoomNameSubmit(e) {
  e.preventDefault();
  const input = RoomForm.querySelector("input");
  roomName = input.value;
  soket.emit("submitRoomName", roomName, showRoom);
  input.value = "";
}

function handleNickNameSubmit(e) {
  e.preventDefault();
  const input = nickNameForm.querySelector("input");
  const nickName = input.value;
  soket.emit("submitNickName", nickName);
  input.value = "";
}

function handleMesaageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("input");
  const message = input.value;
  input.value = "";
  soket.emit("new_message", message, roomName, () => {
    addMessage(`you: ${message}`);
  });
}

nickNameForm.addEventListener("submit", handleNickNameSubmit);
RoomForm.addEventListener("submit", handleRoomNameSubmit);
room.addEventListener("submit", handleMesaageSubmit);

soket.on("new_message", (message, nickName) => {
  addMessage(`${nickName}: ${message}`);
});

soket.on("enterRoom", (nickName) => {
  addMessage(`${nickName} join room`);
});

soket.on("left_room", (nickName) => {
  addMessage(`${nickName} left room`);
});
