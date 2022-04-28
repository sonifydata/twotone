/* global DEBUG */
/* eslint camelcase: 0, no-underscore-dangle: 0 */
import PouchDB from 'pouchdb';
import createStore from 'unistore';
import equal from 'fast-deep-equal';
import objectMap from '../util/objectMap';
import * as actionFunctions from './actions';
import {
	getItemMetadata as getDataSource,
	getAttachment as getData,
	subscribe as subscribeDataSource
} from '../assets/dataLibrary';
// import defaultProject from './default-project.json';
import createTrack from './actions/createTrack';

const persistentKeys = [
	'dataSourceId',
	'tracks',
	'rowDuration',
	'speechTitle',
	'speechTitleEnabled',
	'speechLanguage',
	'speechGender',
	'speechVoiceId',
	'tracksVolume',
	'config',
	'newProject'
];

const defaultState = Object.assign({
	newProject: true,
	loading: true,
	canPlay: true,
	dataSourceId: '',
	dataSource: null,
	data: null,
	tracks: [],
	rowDuration: 1,
	currentTime: 0,
	currentRow: 0,
	paused: true,
	speechTitle: '',
	speechTitleEnabled: true,
	speechLanguage: '',
	speechGender: '',
	speechVoiceId: '',
	tracksVolume: 1,
	webMidiAvailable: false,
	midiOutPort: '',
	midiOutPorts: [],
	activeDialog: ''
}/*, defaultProject*/);

const initialState = {
	...defaultState,
	config: {
		showWelcome: true,
		showData: false,
		showTour: true
	}
};

const db = new PouchDB('app-state', {
	storage: 'persistent',
	auto_compaction: true //!DEBUG
});

if (navigator.storage && navigator.storage.persist) {
	navigator.storage.persist().then(persistent => {
		if (persistent) {
			console.log('Storage will not be cleared except by explicit user action');
		} else {
			console.log('Storage may be cleared by the UA under storage pressure.');
		}
	});
}

export const store = DEBUG ?
	require('unistore/devtools')(createStore(initialState)) :
	createStore(initialState);

// todo: move to another file?
let pendingDataSourceId = '';
async function loadDataSource(state) {
	const { dataSourceId } = state;
	let { dataSource } = state;
	if (!dataSourceId) {
		store.setState({
			dataSource: null,
			loading: false
		});
		return;
	}

	if (pendingDataSourceId === dataSourceId) {
		return;
	}

	pendingDataSourceId = dataSourceId;
	dataSource = await getDataSource(dataSourceId);
	if (dataSource && pendingDataSourceId === dataSourceId) {
		/*
		Load actual data
		*/
		const data = await getData(dataSourceId, 'data');
		if (pendingDataSourceId !== dataSourceId) {
			return;
		} else { console.log( data )}

		/*
		auto-configure project
		- create one track
		*/
		const newState = {
			...state,
			dataSource,
			data,
			loading: false,
			newProject: false
		};
		if (state.newProject && (!state.tracks || !state.tracks.length)) {
			Object.assign(newState, createTrack(newState));
		}

		store.setState(newState);
	}
	if (pendingDataSourceId === dataSourceId) {
		pendingDataSourceId = '';
	}
}

subscribeDataSource(() => loadDataSource(store.getState()));

/*
- save what we need to pouchdb
- todo: probably separate this into its own module?
*/
let persistentState = initialState;
const stateRevisions = new Map();

async function stateChanged(state) {
	// detect changes
	const bulkOps = [];
	persistentKeys.forEach(key => {
		const prev = persistentState[key];
		const val = state[key];
		if (equal(prev, val)) {
			return;
		}

		const op = {
			_id: key,
			val
		};

		const rev = stateRevisions.get(key);
		if (rev) {
			op._rev = rev;
		}
		bulkOps.push(op);
	});

	const oldDataSourceId = persistentState.dataSourceId;
	persistentState = state;

	if (bulkOps.length) {
		/*
		Ignore conflicts, just use the latest value
		This MIGHT become an issue for changing complex data structures
		*/
		const result = await db.bulkDocs(bulkOps);
		result.forEach(op => {
			if (op.ok) {
				stateRevisions.set(op.id, op.rev);
			} else if (op.name !== 'conflict') {
				console.error(op.message, op.id, op);
			}
		});
	}

	if (!!state.dataSourceId !== !!state.dataSource || state.dataSourceId !== oldDataSourceId) {
		// todo: reset speech field and all track filter fields
		// and currentTime
		// actually, reset MOST of the state to default
		await loadDataSource(state);
	}
}

async function restoreState() {
	const newState = {};
	const savedStateData = await db.allDocs({
		keys: persistentKeys,
		include_docs: true
	});

	savedStateData.rows.forEach(({ error, key, doc }) => {
		if (error) {
			return;
		}

		const { _rev, val } = doc;
		stateRevisions.set(key, _rev);
		newState[key] = val;
		if (DEBUG) {console.log('State change: '+newState[key]);}
	});

	store.setState(newState);
	await loadDataSource(store.getState());
	store.subscribe(stateChanged);
}

restoreState();

/*
todo:
https://github.com/developit/unistore/issues/3
*/
export const actions = store => objectMap({
	resetState: () => ({...defaultState}),
	...actionFunctions
}, action => (state, ...args) => {
	const result = action(state, ...args);
	if (result instanceof Promise) {
		result.then(newState => store.setState(newState));
	} else if (result) {
		store.setState(result);
	}
});
