export default function (node) {
	// Safari doesn't implement `AudioScheduledSourceNode`
	if (!node || !node.start) {
		throw new Error('Node source requires an AudioScheduledSourceNode');
	}

	return function audioNode(controller) {
		let started = false;
		let eventId = 0;
		let submitted = false;
		let startTime = Infinity;
		let stopTime = Infinity;
		let offset = 0;
		let done = false;

		function stop(time) {
			stopTime = time;
			if (eventId && stopTime < Infinity) {
				// signal to controller that we're ready to end this event
				// controller will call finishEvent for us
				controller.stop(eventId, stopTime);
			}
		}

		function ended(event) {
			event.currentTarget.onended = null;
			event.currentTarget.disconnect();
			done = true;
			node.onended = null;
			controller.revoke(eventId);
		}

		function stopEvent({ stopTime }) {
			if (started) {
				node.stop(stopTime);
			} else if (submitted) {
				console.log('stopping submitted (but not started) event');
				controller.revoke(eventId);
			}
		}

		return {
			done() {
				return done;
			},
			expired() {
				return submitted;
			},
			request(untilTime) {
				if (untilTime > startTime && !submitted) {
					submitted = true;
					return {
						startTime,
						stopTime
					};
				}
				return null;
			},
			startEvent(sound) {
				const { startTime, stopTime } = sound;
				eventId = sound.id;
				started = true;
				node.onended = ended;
				node.start(startTime, offset);

				if (stopTime < Infinity) {
					stopEvent(sound);
				}

				return {
					output: node
				};
			},
			stopEvent,
			start(time, o) {
				startTime = time;
				stopTime = Infinity;
				offset = o || 0;
			},
			// release: stop,
			stop

			// This has no finishEvent because it cannot be restarted
			// Audio nodes cannot be reused, so you just need to create a new instance
			// node should be disconnected by core code and automatically garbage collected
		};
	};
}