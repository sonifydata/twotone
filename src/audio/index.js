function audioLoader(formats) {
	const el = document.createElement('audio');
	const audioFormat = formats.find(fmt => !!el.canPlayType(fmt.format));
	return () => Promise.resolve(audioFormat.url);
}

export default [

	{
		id: ':sample:jeff-mcspadden:forest',
		permanent: true,
		size: 303290,
		fileName: 'forest.mp3',
		metadata: {
			title: 'Forest',
			artist: 'Jeff McSpadden',
			duration: 19.488
		},
		attachments: {
			audio: audioLoader([
				{
					format: 'audio/mp3',
					url: require('./forest.mp3')
				}
			])
		}
	},

	// source: https://freesound.org/people/digifishmusic/sounds/94811/
	// Creative Commons
	{
		id: ':sample:digifishmusic:c3-major-piano-scale',
		permanent: true,
		size: 303290,
		fileName: 'c3-major-piano-scale',
		metadata: {
			title: 'C3 Major Scale Piano',
			artist: 'digifishmusic',
			duration: 9.95
		},
		attachments: {
			audio: audioLoader([
				{
					format: 'audio/mp3',
					url: require('./c3-major-piano-scale.mp3')
				}
			])
		}
	},

	// source: http://freemusicarchive.org/music/Kimiko_Ishizaka/The_Open_Goldberg_Variations/KIMIKO_ISHIZAKA_-_Goldberg_Variations_BWV_988_-_01_-_Aria__44k-24b
	// public domain
	{
		id: ':sample:Aria:Kimiko-Ishizaka',
		permanent: true,
		size: 7847216,
		fileName: 'Kimiko_Ishizaka_-_01_-_Aria.mp3',
		metadata: {
			title: 'Aria',
			artist: 'Kimiko Ishizaka',
			album: 'The Open Goldberg Variations',
			track: '1',
			genre: 'Classical',
			duration: 299.546122
		},
		attachments: {
			picture: () => Promise.resolve(require('./Kimiko_Ishizaka_-_The_Open_Goldberg_Variations_-_20120529180117231.jpg')),
			audio: audioLoader([
				{
					format: 'audio/mp3',
					url: require('./Kimiko_Ishizaka_-_01_-_Aria.mp3')
				}
			])
		}
	},

	// source: https://archive.org/details/78_i-dream-of-jeanie-with-the-light-brown-hair_glen-gray-and-the-casa-loma-orchestra-k_gbia0050476a
	{
		id: ':sample:dream-of-jeanie:glen-gray',
		permanent: true,
		size: 5492703,
		fileName: 'I Dream of Jeanie  - Glen Gray And The Casa Loma Orchestra.mp3',
		metadata: {
			title: 'I Dream of Jeanie with the Light Brown Hair',
			artist: 'Glen Gray And The Casa Loma Orchestra; Kenny Sargent; Stephen C. Foster',
			album: 'I Dream of Jeanie with the Light Brown Hair',
			track: '1',
			genre: 'Popular Music',
			duration: 183.312
		},
		attachments: {
			picture: () => Promise.resolve(require('./78_i-dream-of-jeanie-with-the-light-brown-hair_glen-gray-and-the-casa-loma-orchestra-k_gbia0050476a_itemimage.jpg')),
			audio: audioLoader([
				{
					format: 'audio/mp3',
					url: require('./I Dream of Jeanie  - Glen Gray And The Casa Loma Orchestra.mp3')
				}
			])
		}
	}

	/*
	see also:
	- https://archive.org/details/Thunder_339
	*/
];