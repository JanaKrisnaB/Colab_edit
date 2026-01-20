const express= require('express')
const http = require('http')
const websocket=require('ws')
const cors=require('cors')


const app=express();
app.use(cors()) //for backend communication
const server=http.createServer(app);
const wss = new websocket.Server({server});

let document = ""; // content

// event listener
wss.on('connection',(ws)=>{
    console.log('new client conncected');
    // adds to log when a new client connected
    ws.send(JSON.stringify({type:'init',data:document}));
    //document stores current state of document
    // then converted to json which is sent to the client
    //client sending message to server for editing doc
    ws.on('message',(message)=>{
        try{
            const msg=JSON.parse(message); // storing parsed message
            if(msg.type==='update'){
                document=msg.data;
                wss.clients.forEach((client)=>{
                    // broadcasting the update to all connected clients
                    if(client.readyState===websocket.OPEN){
                        // check if client ready to recieve messages
                        client.send(JSON.stringify({type:'update',data:document}));
                        // sending the updated doc
                    }
                });
            }
        } catch(error){
            console.error('Error parsing message:',error);
        }
    });
    ws.on('close',()=>{
        console.log('client disconnected');
    });
});

const port=5000;
server.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
})

