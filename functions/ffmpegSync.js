const ffmpeg = require('fluent-ffmpeg');
module.exports = function ffmpegSync(url, path) {
	return new Promise((resolve, reject)=>{
		ffmpeg(url.replace('.gifv', '.mp4'))
			.outputOption('-vf', 'scale=-1:360:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse,fps=24')
			.save(path)
			.on('end', () => resolve())
			.on('error', (err) => { return reject(new Error(err)); });
	});
};
