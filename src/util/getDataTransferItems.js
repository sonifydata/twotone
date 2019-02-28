/*
Only Chrome can read directories
todo: we might be able to detect directories but not read them on other browsers.
If this happens, advise the user to import by clicking to bring up a dialog box,
which should allow folders, maybe?
https://github.com/doochik/check-if-i-drop-folder/blob/master/check-if-i-drop-folder.js
*/
export function getEntryAsFile(entry) {
	return new Promise((resolve, reject) => {
		entry.file(resolve, reject);
	});
}

export function readDirectoryEntries(directory) {
	return new Promise((resolve, reject) => {
		const dirReader = directory.createReader();
		dirReader.readEntries(resolve, reject);
	});
}

export async function traverseFileTree(entry, destination = [], path = '') {
	if (entry.isFile) {
		// Get file
		const file = await getEntryAsFile(entry);
		if (file) {
			destination.push(file);
		}
	} else if (entry.isDirectory) {
		// Get folder contents
		const entries = await readDirectoryEntries(entry);
		for (let i = 0; i < entries.length; i++) {
			destination = await traverseFileTree(entries[i], destination, path + entry.name + '/');
		}
	}

	return destination;
}

export default async function getDataTransferItems(event) {
	let files = [];
	if (event.dataTransfer) {
		const dt = event.dataTransfer;
		if (dt.items && dt.items.length) {
			// During the drag even the dataTransfer.files is null
			// but Chrome implements some drag store, which is accesible via dataTransfer.items
			const items = Array.from(dt.items);
			if (items.length && items[0].webkitGetAsEntry) {
				const entries = items.map(item => item.webkitGetAsEntry());
				for (let i = 0; i < entries.length; i++) {
					files = await traverseFileTree(entries[i], files);
				}
			} else {
				files = items.map(item => item.getAsFile());
			}
		} else if (dt.files && dt.files.length) {
			files = Array.from(dt.files);
		}
	} else if (event.target && event.target.files) {
		files = Array.from(event.target.files);
	}
	// Convert from DataTransferItemsList to the native Array
	// return Array.prototype.slice.call(dataTransferItemsList);
	return files;
}

