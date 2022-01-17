import bufferSource from './buffer';

const MAX_INTERVAL = 96;

function findDifference(midiNote, buffers) {
	for (let interval = 0; interval < MAX_INTERVAL; interval++) {
		if (buffers.has(midiNote + interval)) {
			return -interval;
		}
		if (buffers.has(midiNote - interval)) {
			return interval;
		}
	}
	return NaN;
}

function intervalToFrequencyRatio(interval) {
	return Math.pow(2, interval / 12);
}

export default function samplerSourceFactory(bufferTable) {
	if (!bufferTable || typeof bufferTable !== 'object') {
		throw new Error('Sampler source requires a table of buffers');
	}

	const bufferDefs = new Map();
	for (const k in bufferTable) {
		if (Object.prototype.hasOwnProperty.call(bufferTable, k)) {
			bufferDefs.set(parseFloat(k), bufferSource(bufferTable[k]));
		}
	}

	// todo: set up gainEnvelope patch
	// or let this happen outside

	return function samplerSource(controller) {
		const {
			context
		} = controller;

		let source = null;

		let submitted = false;
		let startTime = Infinity;
		let stopTime = Infinity;

		let midiNote = -1;

		return {
			done() {
				return !source || source.done && source.done();
			},
			start(time, options = {}) {
				startTime = time;
				stopTime = Infinity;
				midiNote = options.note || 60;

			},
			stop(time) {
				stopTime = time;
				if (source) {
					source.stop(stopTime);

				}
			},
			release() {
				// do nothing
			},
			finish() {
				submitted = false;
				startTime = Infinity;
				if (source && source.finish) {
					source.finish();
					controller.freeSource(source);
				}
				source = null;
			},
			request(untilTime) {
				if (untilTime > startTime && !submitted) {

					const difference = findDifference(midiNote, bufferDefs);
					if (isNaN(difference)) {
						return null;
					}

					const closestNote = midiNote - difference;
					const sourceDef = bufferDefs.get(closestNote);
					const buffer = bufferTable[closestNote];
					source = controller.getSource(sourceDef);

					const playbackRate = intervalToFrequencyRatio(difference);

					const start = Math.max(startTime, context.currentTime);

					source.start(start, {
						playbackRate,
						offset: Math.max(0, context.currentTime - startTime)
					});
					source.stop(Math.min(stopTime, start + buffer.duration / playbackRate));

					submitted = true;

					return source.request(untilTime);
				}

				return null;
			},
			startEvent(soundEvent) {

				return source.startEvent && source.startEvent(soundEvent) || null;
			},
			stopEvent(soundEvent) {
				if (source) {
					source.stopEvent(soundEvent);
				}
			},
			finishEvent(soundEvent) {
				if (source && source.finishEvent) {
					source.finishEvent(soundEvent);
				}
			}
		};
	};
}