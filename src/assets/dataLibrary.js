import toId from 'to-id';
import AssetLibrary from './AssetLibrary';
import sampleData from '../data';

import { MAX_DATA_FILE_SIZE } from '../constants';

export function getItemId(item) {
	if (!item.id) {
		const {
			metadata,
			fileName,
			type,
			size,
			lastModified
		} = item;

		const {
			sheetName,
			fields,
			rows
		} = metadata;

		const id = [
			fileName,
			sheetName,
			fields,
			rows,
			type || '',
			size,
			lastModified
		].map(String).map(toId).join(':');
		return id;
	}
	return item.id;
}

const subscriptions = new Set();
let dataLibrary = null;
let metadata = [];
let loadPromise = null;

function getDataLibrary() {
	if (!dataLibrary) {
		dataLibrary = new AssetLibrary({
			name: 'data-assets',
			maxFileSize: MAX_DATA_FILE_SIZE,
			data: sampleData
		});

		loadPromise = new Promise(resolve => {
			dataLibrary.on('load', () => {
				updateSubscriptions();
				resolve(dataLibrary);
			});
		});

		dataLibrary.on('add', updateSubscriptions);
		dataLibrary.on('delete', updateSubscriptions);
	}
	return dataLibrary;
}

function loadDataLibrary() {
	getDataLibrary();
	return loadPromise;
}

export function add(item) {
	item.id = getItemId(item);
	getDataLibrary().add(item);
}

export function deleteItem(item) {
	getDataLibrary().delete(item);
}

// export function getMetadata() {
// 	return metadata; // todo: sort
// }

export async function getItemMetadata(id) {
	const lib = await loadDataLibrary();
	return lib.metadata(id);
}

export async function getAttachment(id, key) {
	const lib = await loadDataLibrary();
	const a = await lib.attachment(id, key);
	if (a instanceof Blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener('loadend', () => {
				const json = reader.result;
				resolve(JSON.parse(json));
			});
			reader.addEventListener('error', reject);
			reader.readAsText(a);
		});
	}

	return a;
}

export function subscribe(callback) {
	subscriptions.add(callback);
	if (getDataLibrary().loaded) {
		callback(metadata);
	}
}

export function unsubscribe(callback) {
	subscriptions.delete(callback);
}

function updateSubscriptions() {
	metadata = getDataLibrary().assets(); // todo: copy(?) and sort
	subscriptions.forEach(callback => callback(metadata));
}