/* global COMMIT_HASH, DEBUG, DEBUG_SERVICE_WORKER, APP_TITLE */

import reportError from './util/reportError';
import './util/analytics';

/*
From BRIAN: Temporarily override toFixed
We're seeing a lot of errors logged, but don't have an exact file and line.
I think it's somewhere in a dependency. This override should force better logging.

Seems to be this issue:
https://github.com/react-component/slider/issues/533

I'll leave this in here for at least a few days to see if it goes away.
*/
const nativeToFixed = Number.prototype.toFixed;
// eslint-disable-next-line no-extend-native
Number.prototype.toFixed = function (digits = 0) {
	try {
		const n = Number(this);
		const str = nativeToFixed.call(n, digits);
		return str;
	} catch (e) {
		reportError(e, 1);
		throw e;
	}
};

import React from 'react';
import ReactDOM from 'react-dom';

// service worker related... see below
import onNewServiceWorker from './util/onNewServiceWorker';

import './index.css';
import './extraStyles.css';
import Main from './components/Main';

if (DEBUG) {
	const Promise = require('bluebird');
	window.Promise = Promise;

	// Configure
	Promise.config({
		longStackTraces: true,
		warnings: true // note, run node with --trace-warnings to see full stack traces for warnings
	});
}

console.log(`${APP_TITLE} (build ${COMMIT_HASH})`);

if (window.ga) {
	window.ga('set', {
		appName: APP_TITLE,
		appVersion: COMMIT_HASH
	});
	window.addEventListener('error', reportError);
	window.addEventListener('unhandledrejection', reportError);

	const ReportingObserver = self.ReportingObserver;
	if (typeof ReportingObserver !== 'undefined') {
		const observer = new ReportingObserver((reports/*, observer*/) => {
			for (const report of reports) {
				console.log('ReportingObserver', report);
			}
		}, {
			buffered: true
		});

		observer.observe();
	}
}

const rootEl = document.getElementById('root');

let upgradeReady = false;
let render = () => {};

if (module.hot) {
	const { AppContainer } = require('react-hot-loader');
	render = () => {
		ReactDOM.render(<AppContainer><Main upgradeReady={upgradeReady} onError={reportError}/></AppContainer>, rootEl);
	};

	render();
	module.hot.accept('./components/Main', render);
} else {
	render = () => {
		ReactDOM.render(<Main upgradeReady={upgradeReady} onError={reportError}/>, rootEl);
	};
	render();
}
/**
 *
 * From CAV: removed all this event listener stuff until I understand what it is there for
 * seems to have been a cause for the failing deployment symptoms according to a rather emotional
 * exchange with Netlify support https://answers.netlify.com/t/trying-forms-on-react-deploy/50391/26
 *
 * The removal of serviceWorker seems to have affected performance involving audio loading and export
 * looking into this
 *
 * 14th March 22
 * getting some weird behaviour on deploy, so putting this service worker stuff back in
 *
 */


if (!module.hot || DEBUG_SERVICE_WORKER) {
	if ('serviceWorker' in navigator) {
		if (DEBUG) {
			navigator.serviceWorker.addEventListener('message', evt => {
				console.log('serviceWorker message', evt);
			});

			navigator.serviceWorker.addEventListener('controllerchange', evt => {
				console.log('controllerchange', evt);
			});
		}

		// Use the window load event to keep the page load performant
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('/sw.js').then(reg => {
				// check once an hour
				setInterval(() => reg.update(), 1000 * 60 * 60);

				onNewServiceWorker(reg, () => {
					upgradeReady = true;
					render();
				});

				if (DEBUG) {
					if (reg.installing) {
						console.log('Service worker installing');
					} else if (reg.waiting) {
						console.log('Service worker installed');
					} else if (reg.active) {
						console.log('Service worker active');
					}

					reg.addEventListener('updatefound', () => {
						// If updatefound is fired, it means that there's
						// a new service worker being installed.
						const installingWorker = reg.installing;
						console.log('A new service worker is being installed:',
							installingWorker);

						// You can listen for changes to the installing service worker's
						// state via installingWorker.onstatechange
						if (installingWorker) {
							installingWorker.addEventListener('statechange', evt => {
								console.log('service worker statechange', evt);
							});
						}
					});
				}
			}).catch(error => {
				if (DEBUG) {
					console.log('Service worker registration failed', error);
				}
			});
		});
	}
} else if (navigator.serviceWorker) {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		for (const registration of registrations) {
			registration.unregister();
		}
	});
}
