import audioNodeSource from './node';

export default function bufferSourceFactory(buffer) {
	if (!buffer.getChannelData || !buffer.sampleRate) {
		throw new Error('Buffer source requires an AudioBuffer');
	}

	return function bufferSource(controller) {
		const {
			context
		} = controller;

		let bufferSourceNode = null;
		let nodeSource = null;

		let submitted = false;
		let startTime = Infinity;
		let stopTime = Infinity;

		let startOptions = {};

		return {
			done() {
				return !nodeSource || nodeSource.done && nodeSource.done();
			},
			start(time, opts) {
				startTime = time;
				stopTime = Infinity;
				startOptions = opts || {};
			},
			stop(time) {
				stopTime = time;
				if (nodeSource) {
					nodeSource.stop(stopTime);
				}
			},
			finish() {
				submitted = false;
				startTime = Infinity;
				if (nodeSource && nodeSource.finish) {
					nodeSource.finish();
				}
				nodeSource = null;
			},
			request(untilTime) {
				if (untilTime > startTime && !submitted) {
					const loop = !!startOptions.loop;
					const loopStart = startOptions.loopStart || 0;
					const loopEnd = startOptions.loopEnd || 0;
					const playbackRate = startOptions.playbackRate > 0 ? startOptions.playbackRate : 1;

					// create bufferSourceNode and start nodeSource
					bufferSourceNode = context.createBufferSource();
					bufferSourceNode.buffer = buffer;
					bufferSourceNode.loop = loop;
					bufferSourceNode.loopStart = loopStart;
					bufferSourceNode.loopEnd = loopEnd;
					bufferSourceNode.playbackRate.value = playbackRate;
					nodeSource = audioNodeSource(bufferSourceNode)(controller);

					const start = Math.max(startTime, context.currentTime);
					const offset = startOptions.offset || 0;
					nodeSource.start(start, offset);
					nodeSource.stop(loop ? stopTime : Math.min(stopTime, start + buffer.duration / playbackRate));

					submitted = true;

					return nodeSource.request(untilTime);
				}

				return null;
			},
			startEvent(soundEvent) {
				return nodeSource.startEvent && nodeSource.startEvent(soundEvent) || null;
			},
			stopEvent(soundEvent) {
				if (nodeSource) {
					nodeSource.stopEvent(soundEvent);
				}
			},
			finishEvent(soundEvent) {
				if (nodeSource && nodeSource.finishEvent) {
					nodeSource.finishEvent(soundEvent);
				}
			}
		};
	};
}