const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const dataSchema = new Schema({
  title: String,
  body: String,
  image: {
    data: Buffer,
    contentType: String,
  },
});

const Blog = mongoose.model("Blog", dataSchema);

module.exports = { Blog };
