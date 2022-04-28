/* eslint-disable no-mixed-spaces-and-tabs */
/* global SPEECH_API_KEY */
import eventEmitter from 'event-emitter';
import allOff from 'event-emitter/all-off';

import SoundQ from '../soundq/src/index';
import destination from '../soundq/src/patches/destination';
import num from '../util/num';
import trackTypes from './types';
// import getSpeechBuffer from './speech';
// import bufferSource from '../soundq/src/sources/buffer';
import * as midi from './midiSetup';


function AudioDataEngine(context, options = {}) {

	const me = this;
	const trackRefs = new Map();
	const loadPromises = [];
	let tracks = [];
	let dataRef = null;

	let wantToPlay = false;
	let playing = false;
	let loaded = false;
	let needNewPlayTiming = false;
	let needFilterUpdate = true;

	let duration = 0;
	let rowCount = -1;
	let rowDuration = -1;
	let baselineIntroProgress = 0; // seconds
	let baselineRowIndex = 0;
	let baselineRowProgress = 0; // progress within a row
	let baselineTime = 0;
	let pauseTime = 0;
	let tracksVolume = 1;

	let speechTitle = '';
	let speechVoiceId = '';
	let speechBuffer = null;
	let speechShot = null;

	let playPromise = null;

	/*
	If we can get a reliable 'ended' event out of SoundQ,
	we probably won't need timerNode.
	*/
	let timerNode = null;

	let analyser = null;
	if (options.analyser === true ||
		options.analyser === undefined && !context.startRendering) {

		analyser = context.createAnalyser();
	}

	const mainGain = context.createGain();
	if (analyser) {
		mainGain.connect(analyser);
		analyser.connect(context.destination);
	} else {
		mainGain.connect(context.destination);
	}
	const soundQ = new SoundQ({
		context
	});


	/*
	BRIAN: This is really hacky and should probably be replaced
	*/
	let timeout = 0;
	let emittingTimeUpdate = false;
	function emitTimeUpdate() {
		if (emittingTimeUpdate) {
			return;
		}

		emittingTimeUpdate = true;
		me.emit('timeupdate');
		emittingTimeUpdate = false;

		clearTimeout(timeout);
		if (playing) {
			timeout = requestAnimationFrame(emitTimeUpdate);
		}
	}

	function stopTrack(trackRef) {
		if (trackRef.stop) {
			trackRef.stop.call(me);
			midi.allNotesOff()
		}
	}

	function destroyTrack(id) {
		const trackRef = trackRefs.get(id);
		if (!trackRef) {
			return;
		}
		stopTrack(trackRef);

		if (trackRef.destroy) {
			trackRef.destroy.call(me);
		}

		if (trackRef.gainNode) {
			trackRef.gainNode.disconnect();
		}
		trackRefs.delete(id);
	}

	function stopAllTracks() {
		trackRefs.forEach(stopTrack);
		midi.allNotesOff()
		if (speechShot) {
			speechShot.stop();
		}
	}

	function setTracksGain() {
		// mainGain.gain.setValueAtTime(tracksVolume / (tracks.length || 1), context.currentTime);
		mainGain.gain.setValueAtTime(tracksVolume, context.currentTime);
	}

	function play() {
		if (wantToPlay && loaded && !playing && rowDuration && rowCount) {
			// rewind if at the end
			if (duration - currentTime() < 0.1) {
				me.currentTime = 0;
				midi.allNotesOff();
			}

			const rowsProgress = currentRowsProgress();
			const totalRowsProgress = rowsProgress * rowCount;
			baselineRowIndex = Math.floor(totalRowsProgress);
			baselineRowProgress = totalRowsProgress - baselineRowIndex;
			baselineIntroProgress = currentIntroProgress();
			baselineTime = context.currentTime;
			playing = true;
			needNewPlayTiming = true;

			me.update();
			me.emit('playing');
		}
	}

	function pause() {
		if (playing) {
			playPromise = null;
			playing = false;
			pauseTime = context.currentTime;
			resetTimerNode();
			midi.allNotesOff();
			stopAllTracks();

			me.update();
			me.emit('paused');
		}
	}

	// as a fraction of speech intro section
	function currentIntroProgress() {
		if (!speechBuffer || !me.speechTitleEnabled) {
			return 1;
		}

		const latestContextTime = playing ?
			context.currentTime :
			pauseTime;

		const timeSinceStarted = latestContextTime - baselineTime;
		const introDuration = speechBuffer.duration;
		const progressSinceStarted = timeSinceStarted / introDuration;
		return Math.max(0, Math.min(1, baselineIntroProgress + progressSinceStarted));
	}

	// as a fraction of total rows data section
	function currentRowsProgress() {
		if (rowDuration <= 0 || rowCount <= 0) {
			return 0;
		}

		const introProgress = currentIntroProgress();
		if (introProgress < 1) {
			return 0;
		}

		const latestContextTime = playing ?
			context.currentTime :
			pauseTime;

		const introDuration = me.speechTitleEnabled && speechBuffer && speechBuffer.duration || 0;
		const timeSinceStarted = latestContextTime - baselineTime;
		const timeSinceStartedData = timeSinceStarted - introDuration * (1 - baselineIntroProgress);
		const startProgress = (baselineRowIndex + baselineRowProgress) / rowCount;
		const dataDuration = rowDuration * rowCount;
		const progressSinceDataStarted = timeSinceStartedData / dataDuration;
		return Math.max(0, Math.min(1, startProgress + progressSinceDataStarted));
	}

	function currentTime() {
		 const speechDuration = me.speechTitleEnabled && speechBuffer && speechBuffer.duration || 0;
		const dataDuration = rowDuration * rowCount;
		 return currentIntroProgress() * speechDuration + currentRowsProgress() * dataDuration;
	}

	function resetTimerNode() {
		if (timerNode) {
			//timerNode.onended = null;
			 timerNode.stop();
			timerNode.disconnect();
			timerNode = null;
		}
	}



	function onEnded() {
		resetTimerNode();
		pause();
		wantToPlay = false;
		me.emit('ended');
		me.emit('pause');
	}

	// old speech implementation from Brian
	// const loadSpeechBufferNow = () => {
	// 	const title = speechTitle;
	// 	if (SPEECH_API_KEY && speechTitle && !speechBuffer) {
	// 		getSpeechBuffer(speechTitle, this.speechVoiceId).then(buffer => {
	// 			if (title === speechTitle && speechBuffer !== buffer) {
	// 				if (speechShot) {
	// 					speechShot.destroy();
	// 					speechShot = null;
	// 				}
	// 				speechBuffer = buffer;
	// 				speechShot = soundQ.shot(bufferSource(buffer));
	// 				needNewPlayTiming = true;
	// 				baselineIntroProgress = 0;
	// 				this.update();
	// 			}
	// 		});
	// 	}
	// };
	//const loadSpeechBuffer = debounce(loadSpeechBufferNow, 600);

	eventEmitter(this);

	this.tracks = [];
	this.data = dataRef = { rows: [], fields: [] };
	this.speechTitle = '';
	this.speechTitleEnabled = false;
	this.speechVoiceId = '';
	this.rowDuration = 1;

	this.load = () => {
		const loadPromise = loaded ? Promise.resolve() : new Promise(resolve => {
			this.update();
			loadPromises.push(resolve);
		});
		return loadPromise;
	};

	this.play = () => {
		if (!rowDuration || !rowCount) {
			return playPromise || Promise.reject();
		}

		if (wantToPlay && playPromise) {
			return playPromise;
		}

		wantToPlay = true;
		playPromise = this.load().then(async () => {
			if (context.resume && context.state === 'suspended') {
				try {
					await context.resume();
				} catch (e) {
					if (e.name !== 'InvalidStateError' && e.name !== 'NotSupportedError') {
						throw e;
					}
				}
			}
			play();
		});
		me.emit('play');
		return playPromise;
	};

	this.pause = () => {
		if (wantToPlay) {
			wantToPlay = false;
			pause();
			me.emit('pause');
		}
	};

	this.prev = () => {};
	this.next = () => {};

	/*
	run this any time we make config changes
	- play or pause
	- change number of rows
	- change row duration
	*/
	this.update = () => {
		if (!this.data || dataRef !== this.data) {
			// reset currentTime to 0
			baselineRowIndex = 0;
			baselineRowProgress = 0;
			baselineIntroProgress = 0;
			playing = false;
			baselineTime = 0;
			pauseTime = 0;
			midi.allNotesOff();
			needNewPlayTiming = true;
		}


		const newSpeechTitle = this.speechTitleEnabled && this.speechTitle && this.speechTitle.trim() || '';
		const newSpeechVoiceId = this.speechTitleEnabled && this.speechVoiceId || '';
		if (newSpeechTitle !== speechTitle || newSpeechVoiceId !== speechVoiceId) {
			speechTitle = newSpeechTitle;
			speechVoiceId = newSpeechVoiceId;
			needNewPlayTiming = true;
			speechBuffer = null;
			if (speechShot) {
				speechShot.destroy();
				speechShot = null;
			}
		}

		/*
		Because each track stores its own volume, the track objects
		change whenever we change the volume. This is not super
		efficient, so we may want to store it elsewhere.
		*/
		needFilterUpdate = needFilterUpdate || tracks !== this.tracks || dataRef !== this.data || rowDuration !== this.rowDuration;
		needNewPlayTiming = needNewPlayTiming || needFilterUpdate;
		tracks = this.tracks;
		dataRef = this.data;
		const data = dataRef || { rows: [], fields: [] };

		setTracksGain();

		/*
		load all track resources
		- check if all track resources are loaded
		- if we're currently loaded and they're not, pause
		- load any missing resources
		- resume playing if desired
		- update loading/state along the way
		*/

		//  todo: CAV remove (then maybe replace) all previous non-working speech stuff
		let allLoaded = !SPEECH_API_KEY || !speechTitle || !!speechBuffer;

		const deleteTrackIds = Array.from(trackRefs.keys());
		this.tracks.forEach(track => {
			const { id } = track;
			const type = track.type;

			if (!type || !trackTypes[type]) {
				// nothing to do with this one
				return;
			}

			const index = deleteTrackIds.indexOf(id);
			if (index >= 0) {
				deleteTrackIds.splice(index, 1);
			}

			let trackRef = trackRefs.get(id);
			if (trackRef && trackRef.type !== type) {
				destroyTrack(id);
				trackRef = null;
			}
			if (!trackRef) {
				const gainNode = context.createGain();
				const destPatch = destination(gainNode);

				trackRef = Object.assign({
					gainNode,
					destPatch,
					type,
					playRanges: []
				}, trackTypes[type](soundQ, destPatch));

				trackRef.gainNode.connect(mainGain);
				trackRefs.set(id, trackRef);
			}

			const promise = trackRef.load && trackRef.load.call(me, track);
			const trackNotLoaded = !!trackRef.loaded && !trackRef.loaded.call(me);
			if (promise && trackNotLoaded) {
				promise.then(this.update);
			}

			if (allLoaded && trackNotLoaded) {
				allLoaded = false;
			}
		});

		//todo: remove (then maybe replace) all previous non-working speech stuff

		// if (speechTitle && !speechBuffer) {
		// 	if (wantToPlay) {
		// 		loadSpeechBufferNow();
		// 	} else {
		// 		loadSpeechBuffer();
		// 	}
		// }

		deleteTrackIds.forEach(destroyTrack);

		const needLoadingEvent = loaded !== allLoaded;
		loaded = allLoaded;
		if (!allLoaded) {
			stopAllTracks();
		} else {
			while (loadPromises.length) {
				const resolve = loadPromises.shift();
				resolve();
			}
		}

		const rowsProgress = currentRowsProgress();
		const totalRowsProgress = rowsProgress * rowCount;
		if (rowCount !== data.rows.length || rowDuration !== me.rowDuration) {
			baselineRowIndex = Math.floor(totalRowsProgress);
			baselineRowProgress = totalRowsProgress - baselineRowIndex;
			baselineIntroProgress = this.speechTitleEnabled ? currentIntroProgress() : 0;
			baselineTime = playing ?
				context.currentTime :
				pauseTime;

			rowCount = data.rows.length;
			rowDuration = me.rowDuration;
			needNewPlayTiming = true;
		}

		const speechDuration = this.speechTitleEnabled && speechBuffer && speechBuffer.duration || 0;
		const previousDuration = duration;
		duration = speechDuration + rowCount * rowDuration; // todo: add extra 0.75 second for release

		if (!rowDuration || !rowCount) {
			this.pause();
		}

		const needTimeUpdate = needNewPlayTiming;
		if (playing && allLoaded && needNewPlayTiming) {
			resetTimerNode();

			const startTime = context.currentTime;
			const time = this.currentTime;
			const stopTime = startTime + duration - time;

			if (context.createConstantSource) {
				timerNode = context.createConstantSource();
				timerNode.offset.value = 0;
			} else {
				timerNode = context.createBufferSource();
				const silentBuffer = context.createBuffer(1, 1, context.sampleRate);
				timerNode.buffer = silentBuffer;
				timerNode.loop = true;
			}
			timerNode.connect(context.destination);
			timerNode.onended = onEnded;
			timerNode.start(startTime);
			timerNode.stop(stopTime);

			stopAllTracks();
			midi.allNotesOff();

			const effectStartTime = startTime - time; // relative to context
			const trackStartTime = effectStartTime + speechDuration;

			const d = data.normalized;
			const rows = data.rows;
			tracks.forEach((track, trackIndex) => {
				const { filterRange, filterValues, id } = track;
				const trackRef = trackRefs.get(id);
				const { gainNode } = trackRef;

				const volume = track.muted ? 0 : num(track.volume, 1);
				gainNode.gain.value = volume;

				if (needFilterUpdate && volume > 0) {
					const hasFilterField = track.filterField >= 0 &&
						track.filterField < data.fields.length &&
						typeof track.filterField === 'number';
					const filterField = hasFilterField ?
						track.filterField :
						track.intensityField;
					const filterByString = hasFilterField && data.fields[filterField].type === 'string';

					let playRange = null;
					const playRanges = [];
					if (filterField >= 0) {
						const [lo, hi] = filterRange || [0, 1];
						for (let i = 0, t = 0; i < rowCount; i++, t += rowDuration) {
							const val = filterByString ? rows[i][filterField] : d[i][filterField];
							const passesFilter = filterByString ?
								!filterValues || !filterValues.length || filterValues.indexOf(val) > -1 :
								val >= lo && val <= hi;

							if (passesFilter) {
								// play
								if (!playRange) {
									playRange = [t, Infinity];
									playRanges.push(playRange);
								}
							} else if (playRange) {
								playRange[1] = Math.min(playRange[1], t, duration);
								playRange = null;
							}
						}
						playRange = playRanges[playRanges.length - 1];
						if (playRange) {
							playRange[1] = Math.min(playRange[1], duration);
						}
					} else {
						playRanges.push([0, duration]);
					}
					trackRef.playRanges = playRanges;

					trackRef.update.call(me, track, playRanges, trackIndex)
				}

				const lastRange = trackRef.playRanges[trackRef.playRanges.length - 1] || null;
				if (volume > 0 && trackRef.start && lastRange && lastRange[1] > time) {
					trackRef.start.call(me, trackStartTime);
				}
			});
			needFilterUpdate = false;

			// if (speechShot) {
			// 	speechShot.stop();
			// }
			// if (speechBuffer) {
			// 	const speechOffset = time;
			// 	if (speechOffset < speechDuration) {
			// 		// todo: set volume!
			// 		speechShot.start(effectStartTime, {
			// 			offset: speechOffset
			// 		});
			// 	}
			// }
		}
		needNewPlayTiming = false;

		if (needLoadingEvent) {
			if (loaded) {
				this.emit('loaded');
			} else {
				this.emit('loading');
			}
		}

		if (previousDuration !== duration) {
			this.emit('durationchange');
		}

		if (needTimeUpdate) {
			emitTimeUpdate();
		}
	};

	this.destroy = () => {
		this.pause();
		soundQ.destroy();
		clearTimeout(timeout);
		mainGain.disconnect();
		allOff(this);
		midi.allNotesOff();
	};

	Object.defineProperties(this, {

		currentTime:
			{get: currentTime, set(val) {  if (val !== 0 && (val >= duration || !rowDuration || !rowCount || val < 0)) {
    			/*
                We might want to throw an error here.
                HTMLMediaElement would
                */
    			return;
    		}

    		// adjust for speech at beginning
    		const introDuration = this.speechTitleEnabled && speechBuffer && speechBuffer.duration || 0;
    		const targetIntroProgress = introDuration ?
    			Math.max(0, Math.min(1, val / speechBuffer.duration)) :
    			1;
    		const targetRowProgress = targetIntroProgress < 1 ?
    			0 :
    			(val - targetIntroProgress * introDuration) / rowDuration;
    		baselineRowIndex = Math.floor(targetRowProgress);
    		baselineRowProgress = targetRowProgress - baselineRowIndex;
    		baselineIntroProgress = this.speechTitleEnabled ? targetIntroProgress : 1;
    		baselineTime = playing ?
    			context.currentTime :
    			pauseTime;

    		needNewPlayTiming = true;
    		this.update();
    		}
			},
		currentRow:
    {
    	// adjust for speech at beginning
    	get: () => Math.max(0, Math.min(Math.floor(currentRowsProgress() * rowCount), rowCount - 1)),
    	set(val) {
    		// todo: D.R.Y.
    		if (val >= rowCount) {
    			/*
                We might want to throw an error here.
                HTMLMediaElement would
                */
    			return;
    		}

    		if (val < 0) {
    			baselineIntroProgress = 0;
    			baselineRowIndex = 0;
    			baselineRowProgress = 0;
    		} else {
    			baselineIntroProgress = 1;
    			baselineRowIndex = Math.floor(val);
    			baselineRowProgress = val - baselineRowIndex;
    		}



    		baselineTime = playing ?
    			context.currentTime :
    			pauseTime;

    		needNewPlayTiming = true;
    		this.update();
    	}
    },
		duration:
    {
    	get: () => duration
    },
		paused:
    {
    	get: () => !wantToPlay
    },
		playing:
    {
    	get: () => !playing
    },
		loaded:
    {
    	get: () => loaded
    },

		tracksVolume:
    {
    	get: () => tracksVolume,
    	set(val) {
    		tracksVolume = Math.max(0, val || 0);
    	}
    },
		analyser:
    {
    	get: () => analyser
    }
	});
}

export default AudioDataEngine;
