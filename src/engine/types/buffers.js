import bufferSource from '../../soundq/src/sources/buffer';
import {
	getAudioBuffer
} from '../../assets/audioLibrary';

/*
granular synth can use the same code/memory
*/
const allBuffers = new Map();
export function freeBufferRef(bufferRef) {
	const { audioId, tracks } = bufferRef;
	if (!tracks.size) {
		allBuffers.delete(audioId);
	}
}

export function getBufferRef(audioId) {
	let bufferRef = allBuffers.get(audioId);
	if (!bufferRef) {
		bufferRef = {
			audioId,
			tracks: new Set(),
			buffer: null,
			promise: null,
			source: null
		};
		allBuffers.set(audioId, bufferRef);
	}

	if (!bufferRef.promise) {
		bufferRef.promise = getAudioBuffer(audioId).then(buffer => {
			bufferRef.buffer = buffer;
			buffer.source = bufferSource(buffer);
		}).catch(error => {
			throw new Error(`Error decoding stored audio (${audioId}): ${error.message}`);
		});
	}
	return bufferRef;
}
