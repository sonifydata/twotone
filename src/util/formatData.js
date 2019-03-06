const intlNumberFormat = new Intl.NumberFormat();

const identity = v => v;

const boolean = v => v ? 'true' : 'false';

const number = v => intlNumberFormat.format(v);

const exponential = v => v !== null && v !== undefined && v.toExponential ?
	v.toExponential(2) :
	v;

/*
Dates and times are all stored in UTC time zone.
They will be converted to local time zone for display
*/
const datetime = v => {
	const d = new Date(v);
	const tzOffset = d.getTimezoneOffset();
	d.setTime(d.getTime() + tzOffset * 60 * 1000);

	return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
};

const time = v => {
	const d = new Date(v);
	const tzOffset = d.getTimezoneOffset();
	d.setTime(d.getTime() + tzOffset * 60 * 1000);

	return d.toLocaleTimeString();
};

const date = v => {
	const d = new Date(v);
	const tzOffset = d.getTimezoneOffset();
	d.setTime(d.getTime() + tzOffset * 60 * 1000);

	return d.toLocaleDateString();
};

export default function formatData(field) {
	if (!field) {
		return identity;
	}

	if (field.type === 'int') {
		if (field.min >= 1000 && field.max < 3000) {
			// probably a year
			return identity;
		}
		return number;
	}

	if (field.type === 'float') {
		const rangeMax = Math.max(Math.abs(field.min), field.max);
		return rangeMax > 1e10 || rangeMax < 0.01 ?
			exponential : // todo: millions, billions, trillions?
			number;
	}

	if (field.type === 'boolean') {
		return boolean;
	}

	if (field.type === 'datetime') {
		// check stored timezone against current timezone and adjust
		if (field.showDate && !field.showTime) {
			return date;
		}

		if (field.showTime && !field.showDate) {
			return time;
		}

		const min = new Date(field.min);
		const max = new Date(field.max);
		const range = max - min;

		return range < 24 * 60 * 60 * 1000 ?
			time :
			datetime;
	}

	return identity;
}