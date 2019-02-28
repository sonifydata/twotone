import toId from 'to-id';
import AssetLibrary from './AssetLibrary';
import sampleSounds from '../audio';
import decodeAudioBuffer from '../util/media/decodeAudioBuffer';
import readFileAsArrayBuffer from '../util/readFileAsArrayBuffer';

import { MAX_AUDIO_FILE_SIZE } from '../constants';

function fetchAudioBuffer(url) {
	return fetch(url)
		.then(response => response.arrayBuffer())
		.then(decodeAudioBuffer);
}

export function getItemId(item) {
	if (!item.id) {
		const {
			metadata = {},
			fileName,
			type,
			size,
			lastModified
		} = item;

		const {
			title = fileName,
			artist,
			album
		} = metadata;

		const id = [
			title,
			artist || '',
			album || '',
			fileName,
			type || '',
			size,
			lastModified
		].map(String).map(toId).join(':');
		return id;
	}

	return item.id;
}

const subscriptions = new Set();
let audioLibrary = null;
let metadata = [];
let loadPromise = null;

function getAudioLibrary() {
	if (!audioLibrary) {
		audioLibrary = new AssetLibrary({
			name: 'audio-assets',
			maxFileSize: MAX_AUDIO_FILE_SIZE,
			data: sampleSounds
		});

		loadPromise = new Promise(resolve => {
			audioLibrary.on('load', () => {
				updateSubscriptions();
				resolve(audioLibrary);
			});
		});

		audioLibrary.on('add', updateSubscriptions);
		audioLibrary.on('delete', updateSubscriptions);
	}
	return audioLibrary;
}

function loadAudioLibrary() {
	getAudioLibrary();
	return loadPromise;
}

export function add(item) {
	item.id = getItemId(item);
	getAudioLibrary().add(item);
}

export function deleteItem(item) {
	getAudioLibrary().delete(item);
}

// export function getMetadata() {
// 	metadata = getAudioLibrary().assets();
// 	return metadata; // todo: sort
// }

export async function getItemMetadata(id) {
	const lib = await loadAudioLibrary();
	return lib.metadata(id);
}

export async function getAttachment(id, key) {
	const lib = await loadAudioLibrary();
	return lib.attachment(id, key);
}

export async function getAudioBuffer(id) {
	const attachment = await getAttachment(id, 'audio');
	if (typeof attachment === 'string') {
		return fetchAudioBuffer(attachment);
	}

	if (attachment instanceof Blob) {
		const fileBuffer = await readFileAsArrayBuffer(attachment);
		return decodeAudioBuffer(fileBuffer);
	}

	return null;
}

export function subscribe(callback) {
	subscriptions.add(callback);
	if (getAudioLibrary().loaded) {
		callback(metadata);
	}
}

export function unsubscribe(callback) {
	subscriptions.delete(callback);
}

function updateSubscriptions() {
	metadata = getAudioLibrary().assets(); // todo: copy(?) and sort
	subscriptions.forEach(callback => callback(metadata));
}