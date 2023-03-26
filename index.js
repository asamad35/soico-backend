require("dotenv").config();
const app = require("./app");
const connectWithDb = require("./config");
connectWithDb();
console.log(process.env.PROD, "aaaaaaaaaaaaaaaaaaaaa");
// socket
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { updateLatestMessage } = require("./controllers/chatController");
const io = new Server(server, {
  cors: {
    origin:
      process.env.PROD === "false"
        ? "http://localhost:5173"
        : "https://socio-plus.netlify.app",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("a user connected", { socketID: socket.id });

  // - calling

  socket.on("callInvitation", ({ selectedChatId, from, to }) => {
    const targetUser = onlineUsers.find((el) => el._id === to._id);
    const userWhoCalled = onlineUsers.find((el) => el._id === from._id);

    // do not connect if user is offline
    if (!targetUser) {
      io.to(userWhoCalled.socketID).emit("cantConnect", {
        calledUser: to,
        message: "is offline.",
      });
      return;
    }

    // do not connect if user is busy
    if (targetUser.inChat) {
      io.to(userWhoCalled.socketID).emit("leaveChannel");
      io.to(userWhoCalled.socketID).emit("cantConnect", {
        calledUser: to,
        message: "is busy.",
      });
      return;
    }

    // join call for userWhoCalled
    io.to(userWhoCalled.socketID).emit("canConnect");

    // set userWhoCalled to busy state
    onlineUsers.forEach((user) => {
      const condition = userWhoCalled._id === user._id;
      if (condition) {
        user.inChat = true;
      }
    });

    console.log(onlineUsers, "user who called");

    console.log("target User", { selectedChatId, from, to });

    // send invitation to target user
    io.to(targetUser.socketID).emit("callInvitation", {
      selectedChatId,
      from,
      to,
    });
  });

  socket.on("callAccepted", ({ from, to }) => {
    console.log([from, to], "array");

    // setting both users to busy state
    const bothUsers = onlineUsers.filter((user) =>
      [from, to].some((obj) => obj._id === user._id)
    );

    onlineUsers.forEach((user) => {
      const condition = bothUsers.find(
        (targetUser) => targetUser._id === user._id
      );
      if (condition) {
        user.inChat = true;
      }
    });

    console.log(onlineUsers, "both users after connection");
  });

  socket.on("callEnded", ({ from, to }) => {
    // setting both users to free state

    const bothUsers = onlineUsers.filter((user) =>
      [from, to]?.some((obj) => obj?._id === user?._id)
    );

    onlineUsers.forEach((user) => {
      const condition = bothUsers.find(
        (targetUser) => targetUser._id === user._id
      );
      if (condition) {
        user.inChat = false;
      }
    });
    console.log(onlineUsers, "both users after call end");

    const targetUser = onlineUsers.find((el) => el._id === to._id);
    if (!targetUser) return;

    io.to(targetUser.socketID).emit("callEnded", { from, to });
    io.to(targetUser.socketID).emit("leaveChannel");
  });

  socket.on("callRejected", ({ from, to }) => {
    // setting both users to free state
    const bothUsers = onlineUsers.filter((user) =>
      [from, to]?.some((obj) => obj?._id === user?._id)
    );

    onlineUsers.forEach((user) => {
      const condition = bothUsers.find(
        (targetUser) => targetUser._id === user._id
      );
      if (condition) {
        user.inChat = false;
      }
    });
    console.log(onlineUsers, "both users after call rejected");

    const targetUser = onlineUsers.find((el) => el._id === to._id);
    if (!targetUser) return;

    io.to(targetUser.socketID).emit("callRejected", { from, to });
    io.to(targetUser.socketID).emit("leaveChannel");
  });

  // - calling end

  // add user to list of online users
  socket.on("new-user", (user) => {
    onlineUsers.push({
      ...user,
      socketID: socket.id,
      inChat: false,
      tabSwitched: false,
    });
    // console.log({ userId, socketID: socket.id });
    io.emit("onlineUsersList", onlineUsers);
  });

  // user joining room based on chat id
  socket.on("chatSelected", ({ loggedUser, selectedChat }) => {
    socket.join(selectedChat._id);
    // console.log(
    //   "user " + loggedUser._id + " joined the room " + selectedChat._id
    // );
  });

  socket.on("newMessage", (message) => {
    console.log({ message });
    updateLatestMessage({ onlineUsers, message, socket, io });
    socket.to(message.chat).emit("updateMessages", message);
  });

  socket.on("typing", (selectedChat) => {
    console.log("startTyping");
    socket.to(selectedChat._id).emit("userIsTyping");
  });

  socket.on("stoppedTyping", (selectedChat) => {
    console.log("stoppedTyping");
    socket.to(selectedChat._id).emit("userStoppedTyping");
  });

  // user leaving room based on chat id
  socket.on("leaveRoom", ({ loggedUser, selectedChat }) => {
    socket.leave(selectedChat._id);
  });

  // handling tabswitch

  socket.on("tabSwitched", ({ tabSwitched }) => {
    // update user in onlineUsers by socket id
    onlineUsers.forEach((user) => {
      if (user.socketID === socket.id) {
        user.tabSwitched = tabSwitched;
      }
    });

    // console.log(onlineUsers, "abcd");

    io.emit("onlineUsersList", onlineUsers);
  });

  socket.on("disconnecting", () => {
    // remove user from online list
    onlineUsers = onlineUsers.filter((el) => {
      // console.log(el.socketID, socket.id);
      return el.socketID !== socket.id;
    });
    // console.log({ onlineUsers });
    io.emit("onlineUsersList", onlineUsers);

    console.log("socket disconnected");
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
