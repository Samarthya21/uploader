const net = require("net");
const fs = require("node:fs/promises");
const path=require("path")
const socket = net.createConnection({host: "::1", port: 5050 }, async () =>{
    const filePath= process.argv[2];
    const fileName= path.basename(filePath);
    const fileHandle = await fs.open(filePath,"r");
    const fileReadStream = fileHandle.createReadStream();
    //writing to socket means sending that data to the server
    socket.write(`filename: ${fileName}-------`);
    
    //reading from the source file
    fileReadStream.on("data",(data) => {
       if(!socket.write(data)){ 
        fileReadStream.pause();
        
       }
    });
    socket.on("drain",()=>{
        fileReadStream.resume();
    })

    fileReadStream.on("end",()=>{
        console.log("File was successfully uploaded");
        socket.end(); 
    });
});
//process is an object 
// for example if you console.log(process.argv)
// and write node client.js in terminal 
//An array with 2 elements first being path of node and other path of client.js
//if you write another thing after that it will also store that as next element of the array
