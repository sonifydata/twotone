const specs = [
	{
		key: 'AudioContext',
		load: () => {
			if (window.AudioContext) {
				return Promise.resolve({
					AudioContext,
					OfflineAudioContext
				});
			}

			return import('standardized-audio-context').then(module => {
				const {
					AudioContext,
					OfflineAudioContext
				} = module;
				return {
					AudioContext,
					OfflineAudioContext
				};
			});
		}
	},
	{
		key: 'StoreApp',
		load: () => import('../components/StoreApp')
	}
];

const requirements = {};

let promise = null;
async function load() {
	for (let i = 0; i < specs.length; i++) {
		const {key, load} = specs[i];
		requirements[key] = await load();
	}
	return requirements;
}
function loadRequirements() {
	if (!promise) {
		promise = load();
	}

	return promise;
}

export {
	requirements,
	loadRequirements
};
