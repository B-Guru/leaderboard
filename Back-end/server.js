const express = require("express");
const app = express();
let http = require("http").Server(app);
let io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
const path = require("path");

// firebase section
const admin = require("firebase-admin");
var serviceAccount = require("./api/routes/admin.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://leaderboard-322ca-default-rtdb.firebaseio.com",
  authDomain: "leaderboard-322ca-default-rtdb.firebaseapp.com",
});

app.use(cors());
app.use(express.json());

var db = admin.database();

// detecting data from firebase realtime database
var userRef = db.ref("player");

io.on("connection", (socket) => {
  console.log(`A user connected with socket id ${socket.id}`);
  socket.join("public");
});

userRef.on("child_changed", function (snap) {
  io.to("public").emit("changePlayer", snap.val());
});

require("dotenv").config();

const port = process.env.PORT;

// all routes
const userRouter = require("./api/routes/RouteModel");

app.use("/user", userRouter);

app.use("/", express.static(path.resolve(__dirname, "./dist")));

app.get("*", function (req, res) {
  res.sendFile(path.resolve(__dirname, "./dist/index.html"));
  res.end();
});

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
