const socket = io();

const myVideo = document.getElementById('myVideo');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: 'user' },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myVideo.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function hadleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  myStream.get;
  if (!muted) {
    muteBtn.innerText = 'Unmute';
    muted = true;
  } else {
    muteBtn.innerText = 'Mute';
    muted = false;
  }
}

function hadleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = 'Camera off';
    cameraOff = false;
  } else {
    cameraBtn.innerText = 'Camera on';
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener('click', hadleMuteClick);
cameraBtn.addEventListener('click', hadleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector('input');
  socket.emit('join_room', input.value, startMedia);
  roomName = input.value;
  input.value = '';
}

welcomeForm.addEventListener('submit', handleWelcomeSubmit);

// Socket Code

socket.on('welcome', () => {
  console.log('someone joined');
});
