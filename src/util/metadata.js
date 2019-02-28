import audio from './media/audio';

/*
todo:
- fallback to https://www.npmjs.com/package/audio-metadata
	for other formats and missing picture
*/

// todo: make this pluggable
const mediaLoaders = [
	audio
];

/*
todo:
	- audio: get from metadata tags and resize
*/
export default async function getMetadata(file) {
	for (let i = 0; i < mediaLoaders.length; i++) {
		const mediaInfo = await mediaLoaders[i](file);
		if (mediaInfo) {
			return mediaInfo;
		}
	}

	return null;
}