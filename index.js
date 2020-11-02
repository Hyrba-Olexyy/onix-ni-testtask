const express = require('express');
const fs = require('fs');
const multer = require('multer');
const Jimp = require('jimp');
const bodyParser = require('body-parser');

const upload = multer({ dest: 'uploads/' });
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/image', upload.single('img'), async (req, res, next) => {
	try {
		const { filename, originalname, path } = req.file;
		const {
			resizeWidth,
			resizeHeigth,
			cropX,
			cropY,
			cropWidth,
			cropHeight,
		} = req.body;

		const fullPath = `${__dirname}/${path}`;
		let img = await Jimp.read(fullPath);
		if (resizeWidth || resizeHeigth) {
			const x = parseInt(resizeWidth, 10) || Jimp.AUTO;
			const y = parseInt(resizeHeigth, 10) || Jimp.AUTO;
			img = await img.resize(x, y);
		}

		if (cropX || cropY || cropHeight || cropWidth) {
			const x = parseInt(cropX, 10) || 0;
			const y = parseInt(cropY, 10) || 0;
			const w = parseInt(cropWidth, 10) || 0;
			const h = parseInt(cropHeight, 10) || 0;
			
			img = await img.crop(x, y, w, h);
		}

		const finalPath = `${__dirname}/transformed/${filename}-${originalname}`;
		await img.write(finalPath);
		const readableStream = fs.createReadStream(finalPath);
		readableStream.pipe(res);
		readableStream.on('end', () => {
			res.status(200).end();
			fs.unlink(fullPath, (error) => {
				if (error) {
					console.log(`Don't removed file with path - ${fullPath}`);
					console.log('error :>> ', error);
				}
			});
			fs.unlink(finalPath, (error) => {
				if (error) {
					console.log(`Don't removed file with path - ${finalPath}`);
					console.log('error :>> ', error);
				}
			});
		});
	} catch (error ) {
		console.log(error);
		res.status(400).json({ error });
	}
});
app.listen(3000, () => {
	console.log('App listen to port 3000');
});
