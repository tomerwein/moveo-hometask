import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import fs from "fs";


const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(cors());

var numberOfConnectedUsers = 0;

app.get('/code-dictionary', (req, res) => {
  fs.readFile('./src/db/code_dic.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading code dictionary file');
    }
    
    res.json(JSON.parse(data));
  });
});

app.get('/solution-dictionary', (req, res) => {
  fs.readFile('./src/db/code_dic.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading solution dictionary file');
    }
    res.json(JSON.parse(data));
  });
});

io.on("connection", (socket) => {
  console.log("New client connected");
  numberOfConnectedUsers++;

  socket.on("code change", (newCode) => {
    socket.broadcast.emit("code update", newCode);
  });

  const role = numberOfConnectedUsers > 1 ? "student" : "mentor";
  console.log(role);
  socket.emit("assign role", { isMentorUser: role === "mentor" });
  io.emit("count users", { numberOfConnectedUsers });

  socket.on("disconnect", () => {
    numberOfConnectedUsers--;
    console.log("Client disconnected");
    io.emit("count users", { numberOfConnectedUsers });
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
