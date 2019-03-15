const metrics = {
	sampleRate: 1,
	bitRate: 2,
	duration: 3,
	importFileSize: 4
};

const dimensions = {
	exportFormat: 1,
	importFileType: 2,
	standalone: 3
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

/*
Events we want to log every time

Log progressive web app installation status so we have context
for evaluating performance and reliability of offline support
*/
window.addEventListener('appinstalled', () => {
	logEvent('A2HS', 'install');
});

window.addEventListener('beforeinstallprompt', e => {
	logEvent('A2HS', 'prompt', e.platforms && e.platforms.join(',') || null);
	e.userChoice.then(choiceResult => {
		logEvent('A2HS', choiceResult.outcome);
	});
});

const standalone = !!window.matchMedia && !!window.matchMedia('(display-mode: standalone)').matches ||
	!!window.navigator.standalone; // safari

ga('set', `dimension${dimensions.standalone}`, standalone);
