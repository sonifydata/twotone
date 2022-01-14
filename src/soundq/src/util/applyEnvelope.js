// https://en.wikipedia.org/wiki/Synthesizer#Attack_Decay_Sustain_Release_(ADSR)_envelope

import num from './num';

const DEFAULT_RELEASE = 0.4; // 0?
const DEFAULT_ATTACK = 0.1;
const DEFAULT_DECAY = 0.2;
const DEFAULT_SUSTAIN = 0.6;

export default function applyEnvelope(param, startTime = 0, releaseTime = Infinity, stopTime = Infinity, options = {}) {
	const gain = num(options.gain, 1);
	const start = (options.start || 0) * gain; // value
	const release = num(options.release, DEFAULT_RELEASE); // time
	const attack = num(options.attack, DEFAULT_ATTACK); // time
	const decay = num(options.decay, DEFAULT_DECAY); // time
	const sustain = num(options.sustain, DEFAULT_SUSTAIN) * gain; // value

	releaseTime = Math.max(0, Math.min(releaseTime, stopTime - release));

	const peakTime = Math.max(0, Math.min(startTime + attack, releaseTime));
	const attackDuration = peakTime - startTime;

	const peak = num(options.peak, param.defaultValue) * gain * Math.min(1, attack ? attackDuration / attack : 1);

	const startSustainTime = Math.min(peakTime + decay, releaseTime);

	if (peakTime > startTime) {
		param.setValueAtTime(start, startTime);
	}
	if (startSustainTime > peakTime) {
		param.linearRampToValueAtTime(peak, peakTime);
	}
	param.linearRampToValueAtTime(sustain, startSustainTime);

	if (releaseTime < Infinity) {
		param.setValueAtTime(sustain, releaseTime);
	}

	stopTime = Math.min(stopTime, releaseTime + release);
	if (stopTime < Infinity) {
		param.linearRampToValueAtTime(0, stopTime);
	}
}