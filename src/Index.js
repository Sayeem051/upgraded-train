import path from "path"
import http from "http"
import { fileURLToPath } from "url"

import express from "express"
import { Server } from "socket.io"
import funcs from "./Utils/message.js"
import user_func from "./Utils/Users.js"

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const port = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, "../public")))

io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const obj = user_func.addUser({ id: socket.id, ...options })
    if (obj.error) {
      return callback(obj.error)
    }
    socket.join(obj.room)

    socket.emit("message", funcs.generateMessage("Admin", "Welcome!"))
    socket.broadcast
      .to(obj.room)
      .emit(
        "message",
        funcs.generateMessage("Admin", `${obj.username} has joined!`)
      )
    callback()

    io.to(obj.room).emit("usersList", {
      room: obj.room,
      users: user_func.getUsersInRoom(obj.room)
    })
  })

  socket.on("sendMessage", (received) => {
    const user = user_func.getUser(socket.id)

    io.to(user.room).emit(
      "message",
      funcs.generateMessage(user.username, received)
    )
  })

  socket.on("disconnect", () => {
    const user = user_func.removeUser(socket.id)
    if (user) {
      io.to(user.room).emit(
        "message",
        funcs.generateMessage("Admin", `${user.username} has left`)
      )
      io.to(user.room).emit("usersList", {
        room: user.room,
        users: user_func.getUsersInRoom(user.room)
      })
    }
  })

  socket.on("sendLocation", (coordinate, callback) => {
    const user = user_func.getUser(socket.id)
    io.to(user.room).emit(
      "locationMessage",
      funcs.generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coordinate.latitude},${coordinate.longitude}`
      )
    )
    callback()
  })
})

server.listen(port, () => {
  console.log("listening on port " + port)
})
