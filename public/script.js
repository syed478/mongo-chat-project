const socket = io('https://mongo-chat-project.onrender.com');
const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const fileInput = document.getElementById('file-input');

// Ask for user name
const sender = prompt("Enter your name:") || "User";

// Request notification permissions
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Display message
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

// Send message
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

  const msg = { sender, text: input.value, fileUrl };
  socket.emit('chat message', msg);
  input.value = '';
  fileInput.value = '';
});

// Show full chat history
socket.on('chat history', (history) => {
  history.forEach(msg => addMessage(msg));
});

// Show new message
socket.on('chat message', (msg) => {
  addMessage(msg);
  if (msg.sender !== sender && Notification.permission === "granted") {
    new Notification(`New message from ${msg.sender}`, {
      body: msg.text || "Sent a file",
      icon: 'https://img.icons8.com/color/96/chat--v1.png'
    });
  }
});
