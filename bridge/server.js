const express = require("express");
const sharp = require("sharp");
const fs = require('fs')
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let latestData = null;

app.get('/pixels', async (req, res) => {
    const image = await sharp('image.jpg')
        .resize(100, 100)
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
