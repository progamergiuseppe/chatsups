const socket = io();

document.getElementById("join").addEventListener("click", () => {
  const room = document.getElementById("room").value;
  const username = document.getElementById("username").value;

  if (room && username) {
    socket.emit("joinRoom", { room, username }); // Ensure you're sending an object with room and username
    document.getElementById("room-name").textContent = `Room: ${room}`;
    document.getElementById("login-section").classList.remove("active");
    document.getElementById("chat-section").style.display = "block";
    setTimeout(() => {
      document.getElementById("chat-section").classList.add("active");
    }, 10);
  }
});

document.getElementById("send").addEventListener("click", () => {
  const room = document.getElementById("room").value;
  const message = document.getElementById("message").value;

  if (message) {
    const username = document.getElementById("username").value; // Get username from input
    socket.emit("chatMessage", { room, message, username });
    document.getElementById("message").value = "";
  }
});

document.getElementById("clear-chat").addEventListener("click", () => {
  document.getElementById("messages").innerHTML = "";
});

socket.on("message", (data) => {
  const messages = document.getElementById("messages");
  messages.innerHTML += `
        <div>
            <strong>${data.username}:</strong> ${data.message} 
            <span class="message-time">${data.time}</span>
        </div>`;
  messages.scrollTop = messages.scrollHeight;
});

socket.on("userCount", (count) => {
  const userCountDisplay = document.getElementById("user-count");
  userCountDisplay.textContent = `Users in room: ${count}`;
});
