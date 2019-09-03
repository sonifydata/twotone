/* global DEBUG */
/* eslint camelcase: 0, no-underscore-dangle: 0 */
import PouchDB from 'pouchdb';
import eventEmitter from 'event-emitter';

export default function AssetLibrary(options) {
	const cache = [];
	const assets = new Map();
	// const revisions = new Map(); // do we need this? are we making updates?

	// load up fixed/permanent assets from options
	if (options.data && options.data.length) {
		options.data.forEach(asset => {
			assets.set(asset.id, asset);
			cache.push(asset);
		});
	}

	const db = new PouchDB(options.name, {
		storage: 'persistent',
		auto_compaction: !DEBUG
	});

	eventEmitter(this);

	this.loaded = false;

	this.add = async item => {
		const {
			id,
			attachments,
			...data
		} = item;

		// todo: don't do anything if id already exists

		const options = {
			_id: id,
			_attachments: {},
			data
		};

		for (const k in attachments) {
			if (Object.prototype.hasOwnProperty.call(attachments, k)) {
				const a = attachments[k];
				options._attachments[k] = {
					data: a,
					content_type: a.type
				};
			}
		}

		// const rev = await db.put(options);
		// revisions.set(id, rev);
		await db.put(options);

		Object.keys(attachments).forEach(key => {
			attachments[key] = true;
		});
		const asset = {
			id,
			...data,
			attachments
		};
		assets.set(id, asset);
		cache.push(asset);

		this.emit('add', asset);

		return id;
	};

	this.delete = async id => {
		// todo: we might need to do this even if it's also cached
		const { _rev } = await db.get(id);
		await db.remove(id, _rev);

		const index = cache.findIndex(item => !item.permanent && item.id === id);
		if (index >= 0) {
			assets.delete(id);
			cache.splice(index, 1);
			this.emit('delete');
		}
	};

	this.assets = () => cache;

	this.metadata = id => assets.get(id) || null;

	this.attachment = async (id, key) => {
		const asset = assets.get(id);
		const a = asset && asset.attachments[key];
		if (!a) {
			return null;
		}

		if (a === true) {
			return await db.getAttachment(id, key);
		}

		if (typeof a === 'function') {
			const val = await a();
			return val;
		}

		return a;
	};

	db.allDocs({
		include_docs: true
	}).then(result => {
		result.rows.forEach(row => {
			const { id } = row;
			const { data } = row.doc;
			const attachments = {};
			Object.keys(row.doc._attachments).forEach(key => {
				attachments[key] = true;
			});
			const asset = {
				id,
				...data,
				attachments
			};
			assets.set(id, asset);
			cache.push(asset);
		});

		this.loaded = true;
		this.emit('load');
	});
}
