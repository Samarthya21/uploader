const net = require("net")
const fs = require("node:fs/promises")
const server = net.createServer(() => {})

server.on("connection",(socket)=>{
    console.log("New conncetion");
    let fileHandle, fileWriteStream;
    //writing to the destination file
    socket.on("data",async (data) =>{
        //If filehandle is not open. Opening file only once not every time when the chunk is received
        if(!fileHandle){
        socket.pause(); //no longer receiving data from client
        
        const indexofDivider = data.indexOf("-------");
        const fileName=data.subarray(10,indexofDivider).toString("utf-8");

        
        fileHandle = await fs.open(`storage/${fileName} ` , "w");
        fileWriteStream = fileHandle.createWriteStream();
        //writting to destination file
        fileWriteStream.write(data.subarray(indexofDivider+7));

        socket.resume();//resuming data from the client
        fileWriteStream.on("drain",()=>{
            socket.resume();
        })
        }
        //Filehandle already opened
        //This else will run many many times
        else{
            if(!fileWriteStream.write(data)){
                socket.pause();
            }
            fileWriteStream.write(data);
        }
         
    });
    //this end event happens when client.js file ends the socket
    socket.on("end",()=>{
       
        fileHandle.close();
        fileHandle=undefined;
        fileWriteStream=undefined;
        console.log("connection ended");
    });
});
server.listen(5050,"::1",() =>{
    console.log("Uploader server opened on", server.address());
})