import dgram from 'dgram'
export class UDPSocket{
    private port:number;

    public InitUDPServer(){
        this.port = 8005
        const server = dgram.createSocket('udp4');
        server.bind(this.port);


        server.on('message', (message, info) => {
            console.log(`Data received from client: ${message.toString()}`);
            console.log('Received %d bytes from %s:%d\n', message.length, info.address, info.port);


        server.send(message, info.port, 'localhost', (error) =>{
            if(error){
                server.close();
            }else{
                console.log('Data sent')
            }
        });
        });


        server.on('listening', () => {
            let address = server.address();
            let port = address.port;
            let family = address.family;
            let ipaddr = address.address;

            console.log('Server is listening at port' + port);
            console.log('Server ip :' + ipaddr);
            console.log('Server is IP4/IP6 : ' + family);
            console.log('UDP Server started and listening on ' + address.address + ':' + address.port);
        });

        server.on('close', () =>{
            console.log('Socket is closed!');
        })

        server.on('error', (error) => {
            console.log(`UDP Server Error: ${error.message} `);
            server.close();
        })

    }
}