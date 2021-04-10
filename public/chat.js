//const socket = io(); //mantiene la conexion al servidor


//si se enviar desde el cliente al servidor se usan los sockets

//on para escuchar
//emit para enviar

let message = document.getElementById('message');
let username = document.getElementById('username');
let btn = document.getElementById('send');
let output = document.getElementById('output');
let actions = document.getElementById('actions');

btn.addEventListener('click', function() {
    socket.emit('chat:message', {
        message: message.value,
        username: username.value
    });
});

message.addEventListener('keypress', () => {
    socket.emit('chat:typing', username.value);
});

socket.on('chat:message', (data) => {
    actions.innerHTML = '';
    output.innerHTML += `<p> 
    <strong>${data.username}</strong>: ${data.message}
    </p>`;
});

socket.on('chat:typing', (data) => {
    actions.innerHTML = `<p><en>${data} is typing a message</en><p>`
});