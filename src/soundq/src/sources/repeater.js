/*
todo:
- need test case for request when no currently scheduled events have a stopTime yet
- may need to make scheduleAhead run async in certain cases
*/

/*
todo:
Each source instance needs a `parent` object
- with start/release/stop times
- point to parent source
- set of prop values
- parent may be a shot or it may be another source that created it
- parent will have its own coarse-level callbacks (finish)
- repeater should not need any event-level callbacks
*/

import num from '../util/num';
import computeOptions from '../util/computeOptions';

const DEFAULT_INTERVAL = 0.1;
const DEFAULT_DURATION = 1;
const cancelProperties = ['interval', 'duration', 'playbackRate'];
const SUB_PROPS_PREFIX = 'source.';
const SUB_PROPS_LEN = SUB_PROPS_PREFIX.length;

/*
todo: find a better place to pass patchOptions
*/
export default function (sourceDef, patchDef, patchOptions) {
	if (typeof sourceDef !== 'function') {
		throw new Error('Repeater requires a source definition function');
	}

	if (patchDef && typeof patchDef !== 'function') {
		throw new Error('Repeater patch definition needs to be a function');
	}

	return function repeater(controller) {

		const sourceRefs = new Set();
		const sourceRefsByEvent = new Map();
		const patches = new Map();
		const { context } = controller;

		let latestStartTime = -Infinity;
		let lastCompletedStartTime = -Infinity;
		let startOptions = undefined;
		let startTime = Infinity;
		let releaseTime = Infinity;
		let stopTime = Infinity;

		function startPatch(patch, props, sourceRef, shot) {
			if (!patch.start) {
				return;
			}

			const startOpts = {...props};
			delete startOpts.duration;
			delete startOpts.interval;

			const { startTime, releaseTime, stopTime } = sourceRef;
			/*
			todo: pass sourceRef index to options
			*/
			patch.start(startTime, releaseTime, stopTime, Object.assign(startOpts, computeOptions(
				patchOptions,
				{ startTime, releaseTime, stopTime },
				shot
			)));
		}

		function freeSourceRef(sourceRef) {
			const { source } = sourceRef;
			if (source.finish) {
				source.finish();
			}
			sourceRefs.delete(sourceRef);
			controller.freeSource(source);

			// clean up patch
			const patch = patches.get(sourceRef);
			if (patch) {
				controller.freePatch(patch);
				patches.delete(sourceRef);
			}
		}

		function stopSound(sourceRef, time) {
			sourceRef.startTime = Math.min(sourceRef.startTime, time);
			sourceRef.releaseTime = Math.min(sourceRef.releaseTime, time);
			sourceRef.stopTime = time;
			if (sourceRef.source.stop) {
				sourceRef.source.stop(time);
			}

			if (sourceRef.startTime >= time) {
				sourceRef.events.forEach(id => {
					controller.revoke(id);
				});
			}
		}

		function stopFutureSounds(time) {
			// stop and free any sources that haven't started yet

			// need to recalculate latestStartTime, since next intervals may
			// be added before we're done cleaning up
			let minStartTime = -Infinity;
			const stoppableRefs = new Set();
			sourceRefs.forEach(sourceRef => {
				if (sourceRef.startTime < time) {
					minStartTime = Math.max(latestStartTime, sourceRef.startTime);
				} else {
					stoppableRefs.add(sourceRef);
				}
			});

			if (minStartTime > 0) {
				latestStartTime = minStartTime;
			} else {
				latestStartTime = lastCompletedStartTime;
			}

			stoppableRefs.forEach(sourceRef => {
				stopSound(sourceRef, time);
			});
		}

		return {
			done() {
				const done = context.currentTime >= releaseTime && !sourceRefs.size;
				return done;
			},
			request(untilTime, parentController) {
				const {
					duration,
					interval,
					...restProps
				} = this.props;

				const intervalVal = num(interval, DEFAULT_INTERVAL);
				const past = context.currentTime - latestStartTime;
				const skipIntervals = Math.max(1, Math.ceil(past / intervalVal));

				// todo: maxTime should account for duration
				// todo: allow for some randomness added to startTime here
				const eventStartTime = latestStartTime + skipIntervals * intervalVal;
				const maxTime = Math.min(untilTime, releaseTime, stopTime);
				if (eventStartTime < maxTime) {

					latestStartTime = eventStartTime;

					// each event has start, release (Infinity?) and stop(Infinity?) time
					// todo: get release from options?

					const eventStopTime = Math.min(
						eventStartTime + num(duration, DEFAULT_DURATION),
						stopTime
					);
					const eventReleaseTime = eventStopTime;

					const source = controller.getSource(sourceDef);
					source.shot = this.shot;

					const sourceRef = {
						startTime: eventStartTime,
						releaseTime: eventReleaseTime,
						stopTime: eventStopTime,
						source,
						events: new Set(),

						// useful for debugging
						name: sourceDef.name
					};

					for (const key in this.props) {
						if (Object.prototype.hasOwnProperty.call(this.props, key) && key.startsWith(SUB_PROPS_PREFIX)) {
							const k = key.substr(SUB_PROPS_LEN);
							const val = this.props[key];
							source.set(k, val);
						}
					}

					// optionally use a function to compute options passed to each event
					/*
					todo: pass sourceRef index to options
					- track count index of played events
					- track and reset alongside latestStartTime
					- this should keep things aligned if tempo changes mid-stream
					*/
					source.start(eventStartTime, Object.assign(restProps, computeOptions(startOptions, sourceRef, this.shot)));
					if (source.release) {
						source.release(eventReleaseTime);
					}
					if (source.stop) {
						source.stop(eventStopTime);
					}

					sourceRefs.add(sourceRef);
				}

				const anyEventsSubmitted = [];
				const useController = parentController || controller;
				sourceRefs.forEach(sourceRef => {
					if (sourceRef.startTime <= maxTime && sourceRef.stopTime > context.currentTime) {
						const event = sourceRef.source.request(untilTime, useController);
						if (event && event.length && event.forEach) {
							event.forEach(id => {
								sourceRefsByEvent.set(id, sourceRef);
								sourceRef.events.add(id);
								anyEventsSubmitted.push(id);
							});
						} else if (event && typeof event === 'object') {
							const id = useController.submit(event);
							sourceRefsByEvent.set(id, sourceRef);
							sourceRef.events.add(id);
							anyEventsSubmitted.push(id);
						} else if (typeof event === 'number') {
							sourceRefsByEvent.set(event, sourceRef);
							sourceRef.events.add(event);
							anyEventsSubmitted.push(event);
						} else if (event) {
							console.warn('Unrecognized response', event);
						}
					}
				});
				return anyEventsSubmitted.length && parentController ? anyEventsSubmitted : !!anyEventsSubmitted.length;
			},
			startEvent(soundEvent) {
				const sourceRef = sourceRefsByEvent.get(soundEvent.id);

				let patch = patches.get(sourceRef);
				if (patchDef && !patch) {
					patch = controller.getPatch(patchDef);
					patches.set(sourceRef, patch);
					if (patch && patch.start) {
						startPatch(patch, this.props, sourceRef, {startTime, releaseTime, stopTime});
					}

				}
				if (sourceRef && sourceRef.source.startEvent) {
					const soundEventConfig = sourceRef.source.startEvent(soundEvent);

					if (soundEventConfig && patch && patch.input) {
						soundEventConfig.output.connect(patch.input);
						return {
							output: patch.output
						};
					}
					return soundEventConfig;
				}
				return null;
			},
			stopEvent(soundEvent) {
				const sourceRef = sourceRefsByEvent.get(soundEvent.id);
				if (sourceRef && sourceRef.source.stopEvent) {
					const patch = patches.get(soundEvent.id);
					if (patch && patch.start) {
						startPatch(patch, this.props, sourceRef, {startTime, releaseTime, stopTime});
					}

					sourceRef.source.stopEvent(soundEvent);
				}
			},
			finishEvent(soundEvent) {
				const sourceRef = sourceRefsByEvent.get(soundEvent.id);
				if (sourceRef) {
					const { source, startTime, stopTime } = sourceRef;
					if (source.finishEvent) {
						source.finishEvent(soundEvent);
					}

					lastCompletedStartTime = Math.max(startTime, lastCompletedStartTime);

					sourceRef.events.delete(soundEvent.id);
					sourceRefsByEvent.delete(soundEvent.id);
					if (!sourceRef.events.size && (stopTime <= context.currentTime || source.done && source.done())) {
						freeSourceRef(sourceRef);
					}
				}
			},
			set(key) {
				/*
				todo: undo most of these?
				Can they be done in a wrapper source?
				*/
				const needsReset = startTime < Infinity && cancelProperties.indexOf(key) >= 0;
				if (needsReset) {
					stopFutureSounds(context.currentTime);
				}

				if (key.startsWith(SUB_PROPS_PREFIX)) {
					const k = key.substr(SUB_PROPS_LEN);
					sourceRefs.forEach(sourceRef => {
						sourceRef.source.set(k, this.props[key]);
					});
				}

				if (needsReset) {
					controller.schedule();
				}
			},
			start(time, opts) {
				// start this whole thing
				startOptions = opts;
				startTime = time;
				latestStartTime = startTime - num(controller.get('interval'), DEFAULT_INTERVAL);
				lastCompletedStartTime = latestStartTime;
				releaseTime = Infinity;
			},
			release(time) {
				releaseTime = time;

				// revoke anything that hasn't started before this time
				stopFutureSounds(releaseTime);

				// release anything that has started but hasn't stopped
				sourceRefs.forEach(sourceRef => {
					if (sourceRef.releaseTime > time && sourceRef.source.release) {
						sourceRef.source.release(time);
					}
					if (sourceRef.startTime > time) {
						stopSound(sourceRef, time);
					}
				});
			},
			stop(time) {
				if (time < releaseTime) {
					releaseTime = time;
				}
				stopTime = time;
				sourceRefs.forEach(sourceRef => {
					if (sourceRef.stopTime > stopTime) {
						stopSound(sourceRef, stopTime);
					}
				});
			},
			finish() {
				startTime = Infinity;
				releaseTime = Infinity;
				stopTime = Infinity;
				stopFutureSounds(0);
				lastCompletedStartTime = -Infinity;
				startOptions = undefined;
			},
			destroy() {
				this.finish();
			}
		};
	};
}