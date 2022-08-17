const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { Blog } = require("./model/dataSchema");
const fs = require("fs");
const port = process.env.PORT || 5001;
const app = express();

try {
  const connectDb = async () => {
    await mongoose.connect("mongodb://localhost:27017/blog");
    console.log("Successfully connected to db");
  };
  connectDb();
} catch (error) {
  console.log(error);
}
mongoose.connection.on("Successfully connected to db", (err) => {
  console.log(err);
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: fileStorage }).single("image");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  // const result = await Blog.find();
  res.send("Hello Users");
});

app.post("/", upload, async (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  const imagePath = req.file.path;
  console.log(req.file);
  if (title && body && imagePath) {
    const upload = new Blog({
      title: req.body.title,
      body: req.body.body,
      image: {
        data: fs.readFileSync(`images/${req.file.filename}`),
        contentType: "image/png",
      },
    });
    upload
      .save()
      .then((res) => console.log("Uploaded Successfully"))
      .catch((err) => console.log(err));
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.put("/", upload, async (req, res) => {
  console.log("Recieved Put Request");
  let title,
    body,
    imagePath = "";
  if (req.body.title) {
    title = req.body.title;
  } else if (req.body.body) {
    body = req.body.body;
  } else if (req.file.filename) {
    imagePath = req.file.filename;
  }

  const _id = req.body.id;
  try {
    if (title) {
      const result = await Blog.updateOne({ _id }, { $set: { title } });
      console.log(result);
    } else if (body) {
      const result = await Blog.updateOne({ _id }, { $set: { body } });
      console.log(result);
    } else if (imagePath) {
      const result = await Blog.updateOne(
        { _id },
        {
          $set: {
            image: {
              data: fs.readFileSync(`images/${req.file.filename}`),
              contentType: "image/png",
            },
          },
        }
      );
      console.log(result);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.delete("/", async (req, res) => {
  console.log(req.body._id);
  const _id = req.body._id;
  const result = await Blog.deleteOne({ _id });
  console.log(result);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is active on port ${port}`);
});
