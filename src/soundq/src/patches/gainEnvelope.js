import applyEnvelope from '../util/applyEnvelope';

export default function gainEnvelope(context) {
	const gainNode = context.createGain();
	const gain = gainNode.gain;

	let startTime = -1;
	let releaseTime = Infinity;
	let stopTime = Infinity;
	let options = {};

	return {
		input: gainNode,
		output: gainNode,
		start(start, release, stop, opts = {}) {
			if (startTime !== start || releaseTime !== release || stopTime !== stop || opts !== options) {
				startTime = start;
				releaseTime = release;
				stopTime = stop;
				options = opts;

				const now = context.currentTime;
				if (stopTime < now) {
					console.log('envelope starting late', now, stopTime);
				}
				gain.cancelScheduledValues(context.currentTime);
				applyEnvelope(gain, startTime, releaseTime, stopTime, options);
			}
		},
		reset() {
			gain.cancelScheduledValues(context.currentTime);
		}
	};
}
