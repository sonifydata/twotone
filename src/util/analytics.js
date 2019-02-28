const metrics = {
	sampleRate: 1,
	bitRate: 2,
	duration: 3,
	importFileSize: 4
};

const dimensions = {
	exportFormat: 1,
	importFileType: 2
};

const ga = self.ga;

export default function logEvent(category, action, data = null) {
	ga('send', 'event', category, action, data);
}

export function logMetricsEvent(category, action, config) {
	const data = {};

	Object.keys(metrics).forEach(key => {
		const val = config[key];
		if (val !== undefined) {
			const saveKey = 'metric' + metrics[key];
			data[saveKey] = val;
		}
	});
	Object.keys(dimensions).forEach(key => {
		const val = config[key];
		if (val !== undefined) {
			const saveKey = 'dimension' + dimensions[key];
			data[saveKey] = val;
		}
	});
	logEvent(category, action, data);
}

export function logExportEvent(config, action = 'save') {
	logMetricsEvent('export', action, config);
}