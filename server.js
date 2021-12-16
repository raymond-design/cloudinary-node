require("dotenv").config();

const { Readable } = require("stream");
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const app = express();
const multerSingle = multer();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const port = process.env.PORT || 3000;

const bufferUpload = async (buffer) => {
  return new Promise((resolve, reject) => {
    const writeStream = cloudinary.uploader.upload_stream((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
    const readStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
    readStream.pipe(writeStream);
  });
};

app.use(express.static('public'))

app.post("/upload", multerSingle.single("image"), async (req, res) => {
  const { buffer } = req.file;
  try {
    const { secure_url } = await bufferUpload(buffer);
    date = new Date();
    console.log("Successful upload at: ", date);
    res.status(200).send(`Successfully uploaded, url: ${secure_url}`);
  } catch (error) {
    console.log(error);
    res.send("Something went wrong please try again later..");
  }
});

app.listen(port, () => {
  console.log("Server is up and running at PORT", port);
});