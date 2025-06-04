const socket = io();
const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const fileInput = document.getElementById('file-input');

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
    sender: 'User', // You can customize sender name
    text: input.value,
    fileUrl,
  };

  socket.emit('chat message', msg);
  input.value = '';
  fileInput.value = '';
});

socket.on('chat message', (msg) => {
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
});
