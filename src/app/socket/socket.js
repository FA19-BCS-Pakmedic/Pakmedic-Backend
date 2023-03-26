const { Server } = require("socket.io");

const Message = require("../models").message;

const IP = require("../utils/configs").ipConf;

const giftedChatMessages = (messages, sender, receiver) => {
  let giftedMessages;

  giftedMessages = messages.map((message) => {
    const isSentByCurrentUser =
      message.sender.toString() === sender._id.toString();
    return {
      _id: message._id,
      text: message.message,
      createdAt: message.createdAt,
      user: {
        _id: message.sender._id,
        name: isSentByCurrentUser ? sender.name : receiver.name,
        avatar: isSentByCurrentUser
          ? getAvatarLink(sender)
          : getAvatarLink(receiver),
      },
      sent: true,
      received: true,
    };
  });

  return giftedMessages;
};

const giftedChatMessage = (message, sender, receiver) => {
  const isSentByCurrentUser =
    message.sender.toString() === sender._id.toString();
  return {
    _id: message._id,
    text: message.message,
    createdAt: message.createdAt,
    user: {
      _id: message.sender._id,
      name: isSentByCurrentUser ? sender.name : receiver.name,
      avatar: isSentByCurrentUser
        ? getAvatarLink(sender)
        : getAvatarLink(receiver),
    },
    sent: true,
    received: true,
  };
};

const getAvatarLink = (user) => {
  return `${IP}${user.avatar ? user.avatar : "default.png"}`; //TODO: REPLACE THE LINK AND FILE NAME WITH ENV VARIABLES
};

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    //one on one chat events

    //event for joining the room to send the user the entire chat with the specific roomId from database
    socket.on("join room", async (data) => {
      socket.join(data.roomID);

      //get all the messages from the database with the roomId
      const messages = await (
        await Message.find({ roomID: data.roomID })
      ).reverse();

      console.log("room in join room event", data.roomID, messages);

      // call a method to convert all the messages in a specific format for gifted chat library
      const sender = data.sender;
      const receiver = data.receiver;

      const giftedMessages = giftedChatMessages(messages, sender, receiver);

      socket.emit("room joined", {
        messages: giftedMessages,
      });
    });

    socket.on("leave", (data) => {
      console.log(data.user + "left the room : " + data.room);
      socket.leave(data.room);
    });

    socket.on("message", async (data) => {
      const message = new Message({
        sender: data.sender._id,
        receiver: data.receiver._id,
        message: data.message[0].text,
        roomID: data.room,
      });

      await message.save();

      const giftedMessage = giftedChatMessage(
        message,
        data.sender,
        data.receiver
      );

      console.log("room in message event", data.room);

      // console.log("room users", io.in(data.room));

      io.to(data.room).emit("new message", giftedMessage);
    });

    // // Listen for message read events
    // socket.on("message read", async (data) => {
    //   // Update the isRead flag in the message document
    //   await Message.findOneAndUpdate(
    //     { _id: data.messageId },
    //     { isRead: true },
    //     (err) => {
    //       if (err) throw err;
    //     }
    //   );
    // });

    // Listen for typing events
    socket.on("typing", (data) => {
      socket.broadcast.to(data.room).emit("user typing", { user: data.user });
    });

    socket.on("leave room", (data) => {
      socket.leave(data.room);
      console.log("user left the room", data.room);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
