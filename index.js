import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import {connectDB} from './loaders/db/index.js';
import { router } from './routes/index.js'
import bodyParser from 'body-parser';
import { Notification } from './models/notification.js';
dotenv.config();
connectDB()
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React app URL
    methods: ["GET", "POST"],
	allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
});
const corsOptions = {
	origin: '*',  
	methods: 'GET,POST,PUT,DELETE',  
	allowedHeaders: 'Content-Type,Authorization',  
  };
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
console.log('process.env.PORT', process.env.PORT)

const users = {}; // Store connected users

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins with their userID
  // socket.on("register", (userID) => {
	// console.log('userID', userID)
  //   users[userID] = socket.id;
  //   console.log(`User ${userID} registered with socket ID: ${socket.id}`);
  // });

  // // Admin sends notification
  // socket.on("send_notification", async ({ message, recipient }) => {
  //   const newNotification = new Notification({ message, recipient });
  //   await newNotification.save();

  //   // Send to a specific user
  //   if (recipient !== "all" && users[recipient]) {
  //     io.to(users[recipient]).emit("receive_notification", message);
  //   } else {
  //     // Send to all users
  //     io.emit("receive_notification", message);
  //   }
  // });

  // socket.on("disconnect", () => {
  //   console.log("User disconnected:", socket.id);
  //   Object.keys(users).forEach((userID) => {
  //     if (users[userID] === socket.id) delete users[userID];
  //   });
  // });


  // NEW with admin and user

  console.log("A user connected:", socket.id);

  // User/Admin registers their socket connection
  socket.on("register", (userID) => {
    users[userID] = socket.id;
    console.log(`User ${userID} registered with socket ID: ${socket.id}`);
  });

  // User sends notification to Admin
  socket.on("send_notification_to_admin", async ({ message, senderID, senderName, scheduleID }) => {
    console.log(`Notification from ${senderName} (${senderID}) to Admin: ${message}`);

    const newNotification = new Notification({ message, recipient: "admin", senderID, senderName, scheduleID });
    await newNotification.save();

    const adminSocketId = users["admin"];
    if (adminSocketId) {
      io.to(adminSocketId).emit("receive_notification", { message, senderID, senderName, scheduleID });
    } else {
      console.log("Admin is offline, notification saved in DB.");
    }
  });

  // Admin sends notification to a specific user or all users
  socket.on("send_notification_to_user", async ({ message, recipient, scheduleID }) => {
    console.log(`Admin sent a notification to ${recipient}: ${message}`);

    const newNotification = new Notification({ message, recipient: recipient, scheduleID });
    await newNotification.save();

    if (recipient === "all") {
      io.emit("receive_notification", { message, sender: "Admin", scheduleID });
    } else if (users[recipient]) {
      io.to(users[recipient]).emit("receive_notification", { message, sender: "Admin",scheduleID });
    } else {
      console.log(`User ${recipient} is offline, notification saved.`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    Object.keys(users).forEach((userID) => {
      if (users[userID] === socket.id) delete users[userID];
    });
  });
});

app.use('/api/', router);

const PORT = process.env.PORT || 5001;
console.log('PORT', PORT)
server.listen(PORT, () => {
	console.log('Server is listening on port ', PORT);
});
// app.listen(PORT, () => {
// 	console.log('Server is listening on port ', 5001);
// });
