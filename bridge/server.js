const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);const express = require("express");

const sharp = require("sharp");
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const { flushCompileCache } = require("module");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/datareqeust', async (req, res) => {
  const ImageName = req.query.img;
  if (!ImageName) return res.status(400).send("no specified img");

  const image = await sharp(`imgs/${ImageName}`)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

  const { info } = image;
  const { width, height } = info;

  res.json({ Ratio: height / width })
})

app.get('/frame', async (req, res) => {
  const video = req.query.vid;
  const time = req.query.t || 0;
  const width = parseInt(req.query.w);
  const height = parseInt(req.query.h);

  // if (!video) return res.status(400).send("Missing ?file=video.mp4");
  // if (!width || !height) return res.status(400).send("Missing or invalid ?w=&h=");

  const tmpPath = tmp.tmpNameSync({ postfix: '.png' });

  await new Promise((resolve, reject) => {
    ffmpeg(path.join('vid', video))
      .on('end', resolve)
      .on('error', reject)
      .screenshots({
        timestamps: [time],
        filename: path.basename(tmpPath),
        folder: path.dirname(tmpPath),
        size: `${width}x${height}`
      });
  });

  const { data, info } = await sharp(tmpPath)
    .resize(width, height)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = [];

  for (let i = 0; i < width * height * 3; i+=3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    pixels.push((r << 16) | (g << 8) | b);
  }

  res.json({
    pixels: pixels
  });

  fs.unlink(tmpPath, () => {});
});

app.get('/pixels', async (req, res) => {
    const ImageName = req.query.img;
    if (!ImageName) return res.status(400).send("no specified img");

    const image = await sharp(`imgs/${ImageName}`)
        .resize(parseInt(req.query.w), parseInt(req.query.h))
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { data, info } = image;
    const { width, height } = info;

    const pixels = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 3;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            row.push([r, g, b]);
        }
        pixels.push(row);
    }

    res.json({ width, height, pixels });
});

app.get("/", (req, res) => {
  res.send("status: online");
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
