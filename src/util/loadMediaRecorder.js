let loadMediaRecorderPromise = null;

export default function loadMediaRecorder() {
	if (!loadMediaRecorderPromise) {
		if (window.MediaRecorder) {
			loadMediaRecorderPromise = Promise.resolve(window.MediaRecorder);
		} else {
			loadMediaRecorderPromise = Promise.resolve(null);

			// disabled for now, since it's not working yet
			// loadMediaRecorderPromise = import('audio-recorder-polyfill').then(mr => {
			// 	window.MediaRecorder = mr && mr.default || mr;
			// 	return window.MediaRecorder;
			// });
		}
	}

	// todo: handle failure to load and retry

	return loadMediaRecorderPromise;
}
