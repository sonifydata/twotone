export default context => {
	const panner = context.createStereoPanner();

	return {
		node: panner,
		start(startTime, releaseTime, stopTime, options = {}) {
			const {
				pan,
				panSpread
			} = options;

			/*
			Currently, pan is set randomly within the range set by the pan parameter.
			Alternatively, the pan parameter could set the width of the range and we'd
			randomly choose either left or right for each grain. This is how Reason does
			it and would result in a more pronounced effect.
			*/
			const randomPan = (Math.random() - 0.5) * 2 * (panSpread || 0);
			const panVal = Math.max(-1, Math.min(1, (pan || 0) + randomPan));
			panner.pan.setValueAtTime(panVal, startTime);
		}
	};
};
