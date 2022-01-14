export default function grain(context) {
	const gain = context.createGain();
	gain.gain.value = 0;

	const panner = context.createStereoPanner();
	gain.connect(panner);

	// at least 8 samples long
	const minFadeDuration = 8 / context.sampleRate;

	// todo: change crossFade to absolute time values
	// todo: don't set any Infinity times on gain param

	return {
		input: gain,
		output: panner,
		start(startTime, releaseTime, stopTime, options = {}) {
			const {
				amplitude,
				crossFade, // 0-1, factor of length
				pan
			} = options;

			/*
			Currently, pan is set randomly within the range set by the pan parameter.
			Alternatively, the pan parameter could set the width of the range and we'd
			randomly choose either left or right for each grain. This is how Reason does
			it and would result in a more pronounced effect.
			*/
			const randomPan = (Math.random() - 0.5) * 2 * (pan || 0);
			panner.pan.setValueAtTime(randomPan, startTime);

			const length = stopTime - startTime;
			const fadeDuration = Math.max(minFadeDuration, length * crossFade / 2);
			const fadeInTime = startTime + fadeDuration;
			const fadeOutTime = stopTime - fadeDuration;

			gain.gain.setValueAtTime(0.0, startTime);
			gain.gain.linearRampToValueAtTime(amplitude, fadeInTime);
			gain.gain.setValueAtTime(amplitude, fadeOutTime);
			gain.gain.linearRampToValueAtTime(0, stopTime);
		},
		stop() {
			gain.gain.cancelScheduledValues(context.currentTime);
			gain.gain.value = 0;
		},
		destroy() {
		}
	};
}
