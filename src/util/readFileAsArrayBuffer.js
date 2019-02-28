export default function readFileAsArrayBuffer(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('loadend', () => {
			const buffer = reader.result;
			resolve(buffer);
		});
		reader.addEventListener('error', reject);
		reader.readAsArrayBuffer(file);
	});
}