import compose from '../../soundq/src/patches/compose';
import trapezoid from '../../soundq/src/patches/trapezoid';
import { getBufferRef, freeBufferRef } from './buffers';
import { DEFAULT_CLIP_PLAY_MODE } from '../../constants';

const CROSS_FADE_TIME = 0.025;
const HALF_CROSS_FADE_TIME = CROSS_FADE_TIME / 2;

export default function clipTrack(soundQ, destination) {
	let bufferRef = null;
	let audioId = '';
	let playbackMode = DEFAULT_CLIP_PLAY_MODE;
	let shot = null;
	let bufferPromise = null;
	let playRanges = [];

	const patch = compose([trapezoid, destination]);

	const me = {
		load(track) {
			const config = track.config && track.config.clip || {};
			if (audioId !== config.audioId) {
				audioId = config.audioId;

				// unload previous bufferRef if exists
				unloadBuffer();
			}

			playbackMode = config.playbackMode;

			// todo: start loading only if not started already
			// todo: return promise
			if (!bufferRef && audioId) {
				bufferRef = getBufferRef(audioId);
				bufferRef.tracks.add(me);
			}

			if (!bufferPromise && bufferRef) {
				const thisRef = bufferRef;
				bufferPromise = new Promise(resolve => {
					bufferRef.promise.then(() => {
						if (bufferRef === thisRef) {
							resolve();
						}
					});
				});
			}

			return bufferPromise;
		},
		loaded() {
			return !audioId || !!(bufferRef && bufferRef.buffer);
		},
		update(track, ranges/*, trackIndex*/) {
			playRanges = ranges;
			const config = track.config && track.config.clip || {};
			playbackMode = config.playbackMode || DEFAULT_CLIP_PLAY_MODE;
		},
		start(contextStartTime) {
			const buffer = bufferRef && bufferRef.buffer;
			if (!buffer) {
				return;
			}

			if (!shot) {
				shot = soundQ.shot(buffer.source, patch);
			}
			const loop = playbackMode === 'loop';
			const currentTime = soundQ.currentTime;
			const duration = this.duration;
			const minRangeTime = Math.max(0, currentTime - contextStartTime);

			const playInstances = playbackMode !== 'row' ?
				playRanges :
				playRanges.reduce((list, [begin, end]) => {
					if (end <= minRangeTime) {
						return list;
					}

					const ranges = [];
					for (let t0 = begin; t0 < end; t0 += this.rowDuration) {
						const t1 = t0 + this.rowDuration;
						if (t1 > minRangeTime) {
							ranges.push([t0, t1]);
						}
					}

					return ranges.length ? list.concat(ranges) : list;
				}, []);

			playInstances.forEach(([begin, end]) => {
				const scaleIn = Math.min(begin, HALF_CROSS_FADE_TIME) / HALF_CROSS_FADE_TIME;
				const scaleOut = Math.min(duration - end, HALF_CROSS_FADE_TIME) / HALF_CROSS_FADE_TIME;

				begin = Math.max(begin, minRangeTime);

				if (end <= begin) {
					return;
				}

				begin = Math.max(0, begin - HALF_CROSS_FADE_TIME);
				end = Math.min(duration, end + HALF_CROSS_FADE_TIME);

				const playEndTime = contextStartTime + end;
				if (playEndTime <= currentTime) {
					return;
				}

				const playStartTime = contextStartTime + begin;
				const late = Math.max(0, currentTime - playStartTime);

				const offset = loop ?
					(begin + late) % buffer.duration :
					late;
				shot.start(playStartTime + late, {
					loop,
					offset
				}, {
					crossFade: CROSS_FADE_TIME,
					scaleIn,
					scaleOut
				});
				shot.stop(contextStartTime + end);
			});
		},
		stop() {
			// clear all shots
			if (shot) {
				shot.stop();
			}
		},
		destroy: unloadBuffer
	};

	function unloadBuffer() {
		if (shot) {
			shot.destroy();
			shot = null;
		}

		if (bufferRef) {
			bufferRef.tracks.delete(me);
			freeBufferRef(bufferRef);
			bufferRef = null;
			bufferPromise = null;
		}
	}

	return me;
}
