const socket = io('https://mongo-chat-project.onrender.com'); // Your deployed backend URL
const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const fileInput = document.getElementById('file-input');

// Prompt for user name
const sender = prompt("Enter your name:") || "User";

// Ask notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission().then(permission => {
    console.log("Notification permission:", permission);
  });
}

// Submit message
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let fileUrl = null;
  if (fileInput.files[0]) {
    const data = new FormData();
    data.append('file', fileInput.files[0]);

    const res = await fetch('/upload', { method: 'POST', body: data });
    const result = await res.json();
    fileUrl = result.fileUrl;
  }

  const msg = {
    sender,
    text: input.value,
    fileUrl
  };

  socket.emit('chat message', msg);
  input.value = '';
  fileInput.value = '';
});

// Show chat history
socket.on('chat history', (msgs) => {
  msgs.forEach(msg => addMessage(msg));
});

// Receive new message
socket.on('chat message', (msg) => {
  addMessage(msg);

  // Show browser notification if sender is not you
  if (msg.sender !== sender && Notification.permission === "granted") {
    const notifOptions = {
      body: msg.text || 'New message received',
      icon: 'https://img.icons8.com/color/96/chat--v1.png'
    };
    new Notification(`Message from ${msg.sender}`, notifOptions);
  }
});

// Render message in UI
function addMessage(msg) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${msg.sender}</strong>: ${msg.text || ''}`;
  if (msg.fileUrl) {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(msg.fileUrl);
    if (isImage) {
      div.innerHTML += `<br><img src="${msg.fileUrl}" style="max-width: 200px;" />`;
    } else {
      div.innerHTML += `<br><a href="${msg.fileUrl}" download>Download File</a>`;
    }
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
