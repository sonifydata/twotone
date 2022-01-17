import midiOut from './midiOut';

const keyGrid = [
	[1, 2, 3, 'A'],
	[4, 5, 6, 'B'],
	[7, 8, 9, 'C'],
	['*', 0, '#', 'D']
];

const highFrequencies = [1209, 1336, 1477, 1633];
const lowFrequencies = [697, 770, 852, 941];

const keys = {};
keyGrid.forEach((row, r) => {
	const low = lowFrequencies[r];
	row.forEach((k, c) => {
		const high = highFrequencies[c];
		keys[k] = [low, high];
	});
});

export default function dtmf(controller) {
	const sources = [midiOut(controller), midiOut(controller)];
	const eventSources = new Map();

	let key = '';

	let startTime = Infinity;
	let stopTime = Infinity;

	return {
		request(untilTime) {
			if (untilTime > startTime && !eventSources.size && keys[key]) {
				keys[key].forEach((frequency, i) => {
					const source = sources[i];
					source.start(startTime, { frequency });
					source.stop(stopTime);
					const event = source.request(untilTime);
					const id = controller.submit(event);
					eventSources.set(id, source);
				});

				return true;
			}
			return null;
		},
		start(time, options = {}) {
			startTime = time;
			stopTime = Infinity;
			key = options.key || 0;
		},
		stop(time) {
			stopTime = time;
			eventSources.forEach(source => source.stop(stopTime));
		},
		startEvent(sound) {
			const source = eventSources.get(sound.id);
			if (source) {
				return source.startEvent(sound);
			}
			return null;
		},
		stopEvent(sound) {
			const source = eventSources.get(sound.id);
			if (source) {
				source.stopEvent(sound);
			}
		},
		finishEvent(soundEvent) {
			const source = eventSources.get(soundEvent.id);
			if (source && source.finishEvent) {
				source.finishEvent(soundEvent);
			}
		},
		finish() {
			startTime = Infinity;

			eventSources.forEach(source => {
				if (source.finish) {
					source.finish();
				}
			});
			eventSources.clear();
		}
	};
}