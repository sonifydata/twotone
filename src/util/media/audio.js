import Worker from '!worker-loader!./audio.worker.js';
import decodeAudioBuffer from './decodeAudioBuffer';
import readFileAsArrayBuffer from '../readFileAsArrayBuffer';

function getMediaInfo(element, file) {
	const {
		size,
		lastModified,
		name: fileName,
		type
	} = file;

	const info = {
		size,
		lastModified,
		fileName,
		type
	};

	return new Promise((resolve/*, reject*/) => {
		const worker = new Worker();
		worker.postMessage({ file });
		worker.onmessage = event => {
			worker.terminate();
			resolve(Object.assign(info, event.data));
		};
	});
}

export default function loadAudio(file) {
	return new Promise(resolve => {
		// todo: cache/ memoize this?
		const audio = document.createElement('audio');
		if (!file.size || !audio.canPlayType(file.type)) {
			resolve(null);
			return;
		}

		const url = URL.createObjectURL(file);
		const clean = () => {
			audio.onloadedmetadata = null;
			audio.onerror = null;
			audio.src = '';
			URL.revokeObjectURL(url);
		};
		audio.onloadedmetadata = async () => {
			const info = await getMediaInfo(audio, file);

			let duration = audio.duration;
			if (duration >= Infinity) {
				const fileBuffer = await readFileAsArrayBuffer(file);
				const buffer = await decodeAudioBuffer(fileBuffer);
				duration = buffer.duration;
			}
			info.metadata.duration = duration;
			clean();
			resolve(info);
		};
		audio.onerror = () => {
			clean();
			resolve(null);
		};
		audio.src = url;
		audio.load();
	});
}