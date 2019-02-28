const allFormats = {
	'audio/aac': ['.aac'],
	'audio/aiff': ['.aiff'],
	'audio/flac': ['.flac'],
	'audio/mp3': ['.mp3'],
	'audio/mp4': ['.mp4'],
	'audio/mpeg': ['.mpeg'],
	'audio/ogg; codecs=vorbis': ['.ogg (Vorbis)'],
	'audio/ogg; codecs=opus': ['.ogg (Opus)'],
	'audio/wav': ['.wav'],
	'audio/wave': ['.wav'],
	'audio/webm; codecs=vorbis': ['.webm (Vorbis)'],
	'audio/webm; codecs=opus': ['.webm (Opus)'],
	'audio/x-aif': ['.aif'],
	'audio/x-flac': ['.flac'],
	'audio/x-ms-wma': ['.wma'],
	'audio/x-m4a': ['.m4a']
};

const formats = (function () {
	const testElement = document.createElement('video');
	return Object.keys(allFormats).filter(type => !!testElement.canPlayType(type));
})();
const allExtensions = formats.map(type => allFormats[type]);

// flatten and deduplicate
const extensions = Array.from(new Set([].concat(...allExtensions)));
extensions.sort();
export { formats, extensions };