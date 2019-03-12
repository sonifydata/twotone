import UploadWorker from 'worker-loader!./data.worker.js';

const TERMINATE_TIME = 8000;
const requests = new Map();
let uploadWorker = null;
let nextId = 1;
let timeout = 0;

function terminateWorker() {
	clearTimeout(timeout);
	if (!requests.size) {
		uploadWorker.terminate();
		uploadWorker = null;
	} else {
		timeout = setTimeout(terminateWorker, TERMINATE_TIME);
	}
}

function receive(event) {
	const { id } = event.data;
	const { file, resolve, reject } = requests.get(id);

	requests.delete(id);

	clearTimeout(timeout);
	if (!requests.size) {
		timeout = setTimeout(terminateWorker, TERMINATE_TIME);
	}

	if (event.data.error) {
		const errorMessage = typeof event.data.error === 'string' ?
			event.data.error :
			JSON.stringify(event.data.error);

		const error = new Error('File import error: ' + errorMessage);
		reject(error);
		return;
	}

	const sheets = [];
	const {
		name: fileName,
		type,
		size,
		lastModified
	} = file;
	event.data.sheets.forEach(sheet => {
		const { data, ...metadata } = sheet;
		const attachments = {
			data
		};
		sheets.push({
			fileName,
			type,
			size,
			lastModified,
			metadata,
			attachments
		});
	});
	resolve(sheets);
}

export default function loadSpreadsheet(file) {
	if (!uploadWorker) {
		uploadWorker = new UploadWorker();
		uploadWorker.onmessage = receive;
	}

	return new Promise((resolve, reject) => {
		const id = nextId++;
		requests.set(id, {
			file,
			resolve,
			reject
		});
		uploadWorker.postMessage({
			id,
			file
		});
		clearTimeout(timeout);
	});
}