const soket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

soket.addEventListener("open", () => {
  console.log("connected to server ✅");
});

soket.addEventListener("close", () => {
  console.log("disconnected from the server ❌");
});

function makeMessage(type, payload) {
  const message = {
    type,
    payload,
  };
  return JSON.stringify(message);
}

function handelMessageSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  soket.send(makeMessage("new_message", input.value));
  input.value = "";
}
function handelNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  soket.send(makeMessage("nickname", input.value));
  input.value = "";
}

soket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

messageForm.addEventListener("submit", handelMessageSubmit);
nickForm.addEventListener("submit", handelNickSubmit);
