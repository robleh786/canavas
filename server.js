const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const mongoURL = 'mongodb://localhost:27017';
const dbName = 'canvasDB';


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
    console.log('A user connected');

    
    socket.on('draw', (data) => {
        
        saveToMongo(data);

       
        io.emit('draw', data);

        
        socket.emit('json', data);
    });

    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


MongoClient.connect(mongoURL, (err, client) => {
    if (err) throw err;

    const db = client.db(dbName);
    db.createCollection('drawings');

    console.log('Connected to MongoDB');
});


function saveToMongo(data) {
    MongoClient.connect(mongoURL, (err, client) => {
        if (err) throw err;

        const db = client.db(dbName);
        const collection = db.collection('drawings');

        collection.insertOne(data, (err, result) => {
            if (err) throw err;
            console.log('Drawing data saved to MongoDB');
            client.close();
        });
    });
}


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});