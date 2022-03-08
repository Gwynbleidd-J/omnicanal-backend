console.log('connection success with index.html');
// const socket = io.connect('http://192.168.1.108:3002', { forceNew: true });
// const socket = io.connect('http://192.168.1.114:3002', { forceNew: true });
const socket = io.connect('http://201.149.34.171:3022', { forceNew: true });

//Esto puede funcionar si el cliente de SocketIO está en una direccion diferente del index.
//const socket = io("https://server-domain.com/admin");


socket.on('connect', () => {
    console.log('socket connected to server', socket.id);
})

//////Codigo SocketIO ////////////
socket.on('message', (data) => {
    console.log("**************\nSe recibe data en el cliente web:" + data)
    console.log(data);
    //dataParsed = JSON.parse(data);
    DataFromServer(data);
})


socket.on('socket-disconnect', (data) => {
    console.log(data);
})


////////Codigo Javascript ///////////
let form = document.getElementById('form')
let message = document.getElementById('message_text');


form.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('client-message', {
        message: message.value,
        clientPlatformIdentifier: socket.id,
        transmitter: 'c',
        messagePlatformId: ''
    });
    DataToServer(message);
})

function DataToServer(message) { //GET
    let p = document.createElement('p');
    p.classList.add('paragraf', 'p-client')
    p.innerHTML += `${message.value}`;
    document.getElementById('messages').appendChild(p);
    document.getElementById('message_text').focus();
    document.getElementById('message_text').value = '';
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}




function DataFromServer(message) { //GET
    let p = document.createElement('p');
    p.classList.add('paragraf', 'p-server');
    // let div = document.getElementById('agent');
    p.innerHTML += `${message.message}`;
    document.getElementById('messages').appendChild(p);
    document.getElementById('message_text').focus();
    document.getElementById('message_text').value = '';
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}