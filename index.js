const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const publicPath = path.join(__dirname, 'edubytes-client', 'build');


connectToMongo();
const app = express();

app.use(cors());
app.use(express.json());

// Log url
let demoLogger = (req, res, next) => {
  console.log(req.url);
  next();
};
app.use(demoLogger);

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/app", require("./routes/blog"));
app.use("/api/app", require("./routes/material"));
app.use("/api/app", require("./routes/ads"));


app.use(express.static(publicPath));
app.get("*", (req, res) => {
   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});



app.listen(process.env.PORT || 5000, () => {
  console.log("Listening to MongoDB")
});