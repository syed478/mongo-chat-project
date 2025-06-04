// Connect to your deployed server on Render
const socket = io('https://mongo-chat-project.onrender.com');

// Select DOM elements
const messages = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const fileInput = document.getElementById('file-input');

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let fileUrl = null;

  // Upload file if selected
  if (fileInput.files[0]) {
    const data = new FormData();
    data.append('file', fileInput.files[0]);

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      fileUrl = result.fileUrl;
    } catch (err) {
      console.error('File upload failed:', err);
      return;
    }
  }

  // Create message object
  const msg = {
    sender: 'User',
    text: input.value.trim(),
    fileUrl
  };

  // Prevent empty messages
  if (!msg.text && !fileUrl) return;

  // Send message via Socket.IO
  socket.emit('chat message', msg);

  // Reset inputs
  input.value = '';
  fileInput.value = '';
});

// Listen for incoming messages
socket.on('chat message', (msg) => {
  const div = document.createElement('div');
  div.classList.add('mb-2');

  // Display sender and text
  div.innerHTML = `<strong>${msg.sender}</strong>: ${msg.text || ''}`;

  // Display file (image or link)
  if (msg.fileUrl) {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(msg.fileUrl);
    if (isImage) {
      div.innerHTML += `<br><img src="${msg.fileUrl}" style="max-width: 200px; border-radius: 8px;" />`;
    } else {
      div.innerHTML += `<br><a href="${msg.fileUrl}" download>Download File</a>`;
    }
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
