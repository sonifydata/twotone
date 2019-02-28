export default function formatTime(t, minUnits = 2, secondsPrecision = 1) {
	t = Math.floor(t / secondsPrecision) * secondsPrecision;
	const components = [
		Math.floor(t / 3600), // hours
		Math.floor(t / 60) % 60, // minutes
		t % 60 // seconds
	];

	while (components[0] === 0 && components.length > minUnits) {
		components.shift();
	}

	const strings = components.map((v, i) => i && v < 10 ? '0' + v : String(v));

	// correct for weird JS float precision issues
	if (secondsPrecision < 1 && secondsPrecision > 0) {
		const decimalPlaces = Math.max(0, Math.min(20, Math.ceil(Math.log10(1 / secondsPrecision))));
		const lastIndex = strings.length - 1;
		if (strings[lastIndex].length > decimalPlaces) {
			strings[lastIndex] = components[lastIndex].toFixed(decimalPlaces);
		}
	}

	return strings.join(':');
}