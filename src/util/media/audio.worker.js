import jsmediatags from 'jsmediatags';
import ogg from 'audio-metadata/src/ogg';
import { imageMimeTypeRegex, fileExt } from '../regex';
import readFileAsArrayBuffer from '../readFileAsArrayBuffer';

const oggMimeTypeRegex = /^(audio|application)\/ogg$/i;
const audioMimeTypeRegex = /^(audio|application)\/([a-z0-9-]+)$/i;
const keepTags = ['title', 'artist', 'album', 'genre', 'track', 'year'];

function mdOgg(file) {
	return readFileAsArrayBuffer(file).then(fileBuffer => ogg(fileBuffer));
}

function jsm(file) {
	return new Promise((resolve, reject) => {
		new jsmediatags.Reader(file)
			// .setTagsToRead(tags)
			.read({
				onSuccess(tag) {
					resolve(tag.tags);
				},
				onError: reject
			});
	});
}

const metadataReaders = [
	{
		test: file => oggMimeTypeRegex.test(file.type),
		fn: mdOgg
	},
	{
		test: file => audioMimeTypeRegex.test(file.type),
		fn: jsm
	}
];

async function getAudioMetadata(file) {
	let tags = {};
	for (let i = 0; i < metadataReaders.length; i++) {
		const reader = metadataReaders[i];
		if (reader.test(file)) {
			try {
				const md = await reader.fn(file);
				if (md) {
					tags = md;
					break;
				}
			} catch (e) {
				console.warn('Error reading metadata', file.name, e);
			}
		}
	}

	const { picture } = tags;
	const metadata = {};

	Object.keys(tags).forEach(key => {
		if (keepTags.indexOf(key) >= 0) {
			metadata[key] = tags[key];
		} else if (typeof tags[key] === 'string') {
			metadata[key] = tags[key].trim();
		}
	});

	if (!metadata.title) {
		metadata.title = file.name.replace(fileExt, '');
	}

	const mediaInfo = {
		metadata,
		attachments: {
			audio: file
		}
	};

	/*
	This might be better as a base64 dataURI, since it's a bit smaller.
	Look into it.

	todo:
	- save picture at different resolutions
	- let medium plugin handle this
	  - audio: get from metadata tags and resize
	*/
	if (picture && picture.data && imageMimeTypeRegex.test(picture.format)) {
		const format = picture.format.replace(imageMimeTypeRegex, 'image/$2').toLowerCase();
		// const base64 = window.btoa(picture.data.map(c => String.fromCharCode(c)).join(''));
		// const pictureURI = `data:${format};base64,` + base64;
		const pictureData = new Uint8Array(picture.data);
		mediaInfo.attachments.picture = new Blob([pictureData], { type: format }); // todo: array
	}

	return mediaInfo;
}

self.addEventListener('message', event => {
	if (event.data.file) {
		getAudioMetadata(event.data.file).then(mediaInfo => {
			self.postMessage(mediaInfo);
		});
	}
});