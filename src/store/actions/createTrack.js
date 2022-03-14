import { DEFAULT_TRACK_TYPE } from '../../constants';

const instrumentKeys = ['piano', 'bass', 'organ', 'electricGuitar', 'mandolin', 'marimba', 'glockenspiel', 'harp', 'trumpet' ];

const trackTypes = {
	scale: {
		hasIntensity: true
	}
};

const configTrack = {
	scale(state, trackData) {
		let lastTrackConfig = null;
		const availableInstruments = new Set(instrumentKeys);

		state.tracks.forEach(track => {
			if (track.type === 'scale') {
				const config = track.config && track.config.scale;
				if (config) {
					lastTrackConfig = config;
					const instrument = config.instrument || '';
					availableInstruments.delete(instrument);
				}
			}
		});

		const instrument = instrumentKeys.find(inst => !availableInstruments.size || availableInstruments.has(inst));
		const providedConfig = trackData && trackData.config;
		const providedScaleConfig = providedConfig && trackData.config.scale;
		const scaleConfig = Object.assign({
			...lastTrackConfig,
			instrument
		}, providedScaleConfig);

		const config = {
			...providedConfig,
			scale: scaleConfig
		};

		return {
			config
		};
	}
};

export default function createTrack(state, type = DEFAULT_TRACK_TYPE, trackData) {
	const tracks = [...state.tracks];

	const id = `track:${type}@${Date.now()}`;

	const numericFieldIndexes = state.data.fields
		.map(({name, type, max, min}, i) => ({name, type, min, max, i}))
		.filter(({type, max, min}) => type !== 'string' && max !== min)
		.map(({i}) => i);

	const typeDef = trackTypes[type] || {};
	const hasIntensity = !!typeDef.hasIntensity;

	// select data field
	const availableFields = new Set(numericFieldIndexes);
	state.tracks.forEach(track => {
		const intensityField = track.intensityField;
		availableFields.delete(intensityField);
	});
	const intensityField = availableFields.size ?
		numericFieldIndexes.find(i => availableFields.has(i)) :
		numericFieldIndexes.length ? numericFieldIndexes[numericFieldIndexes.length - 1] : -1;
	console.log('numericFieldIndexes.length ' + numericFieldIndexes.length)

	// type-specific track configuration
	const getConfig = configTrack[type];
	const autoTrackData = getConfig ? getConfig(state, trackData) : null;

	// guard against more Tracks than data fields
	if (tracks.length < numericFieldIndexes.length) {
		const newTrack = {
			intensityField: hasIntensity && intensityField === undefined ? -1 : intensityField,
			filterField: -1,
			...trackData,
			...autoTrackData,
			type,
			id,
			midiChannel: 1
		};

		tracks.push(newTrack);
	} else {
		alert( 'There are no more data columns in the set.')
	}
	return {
		tracks
	};
}
