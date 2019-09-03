/* global DEBUG */
import XLSX from 'xlsx';
import {
	MAX_DATA_FILE_SIZE,
	UPLOAD_ROW_LIMIT,
	MAX_STRING_VALUES
} from '../../constants';
import { fileExt } from '../regex';
import parseCurrency from 'parsecurrency';
import serializeError from 'serialize-error';

const rABS = false; // true: readAsBinaryString ; false: readAsArrayBuffer

const numRegex = /^-?([0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?$)/i;
const percentRegex = /^-?([0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?%$)/i;
const booleanRegex = /^(false|true|yes|no)$/i;
const falseRegex = /^(false|no)$/i;
const dateFields = /(d|yy)/i;
const timeFields = /h|ss|AM|PM/i;

function parseNumber(val) {
	if (numRegex.test(val)) {
		return parseFloat(val);
	}

	if (percentRegex.test(val)) {
		return parseFloat(val) / 100;
	}

	const currency = parseCurrency(val);
	if (currency) {
		return currency.value;
	}

	return val;
}

function toDate(val) {
	let date = val instanceof Date ? val : new Date(val);
	if (isNaN(date.getTime())) {
		date = new Date('1970-01-01 ' + val);
	}

	// store all dates as UTC
	date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);

	return date;
}

const typeTests = {
	boolean: cell => cell.t === 'b' || cell.v === true || cell.v === false || booleanRegex.test(cell.w || cell.v),

	datetime: cell => cell.t === 'd' ||
		isNaN(parseNumber(cell.w || cell.v)) && /*cell.t === 'n' &&*/ (!isNaN(Date.parse(cell.w || cell.v)) || !isNaN(Date.parse('1970-01-01 ' + (cell.w || cell.v)))),

	int: cell => {
		const n = parseNumber(cell.v || cell.w);
		return !isNaN(n) && Math.floor(n) === n && n <= Number.MAX_SAFE_INTEGER && n >= Number.MIN_SAFE_INTEGER;
	},

	float: cell => {
		const n = parseNumber(cell.v || cell.w);
		return !isNaN(n);
	}
};

const identity = v => v;

/*
datetime conversion uses a different function than `toDate`
we've already done the time zone adjustment once, so we
don't want to do it again when normalizing
*/
const conversions = {
	boolean: val => val ? 1 : 0,
	datetime: val => new Date(val),
	int: val => parseInt(val, 10),
	float: parseFloat
};

const sortCallbacks = {};
Object.keys(conversions).forEach(type => {
	const convert = conversions[type];
	sortCallbacks[type] = (a, b) => {
		return convert(a) - convert(b);
	};
});

function readWorksheet(worksheet) {
	/*
	To do:
	- consolidate values
	- determine which columns have only one value
	- save a whole bunch of metadata
		https://github.com/SheetJS/js-xlsx#workbook-file-properties
	*/
	let minCol = Infinity;
	let minRow = Infinity;
	const rows = [];
	for (const cell in worksheet) {
		if (Object.prototype.hasOwnProperty.call(worksheet, cell) && cell.charAt(0) !== '!') {
			const c = XLSX.utils.decode_cell(cell);
			const row = c.r;
			const col = c.c;

			minCol = Math.min(col, minCol);
			minRow = Math.min(row, minRow);

			if (!rows[row]) {
				rows[row] = [];
			}
			rows[row][col] = worksheet[cell];
		}
	}

	// re-align to zero
	if (minRow > 0) {
		rows.splice(0, minRow);
	}
	if (minCol > 0) {
		rows.forEach(row => row.splice(0, minCol));
	}

	// remove all blank/empty rows
	for (let i = rows.length - 1; i >= 0; i--) {
		if (!rows[i]) {
			rows.splice(i, 1);
		}
	}

	// for now assume there is always a header row
	const fields = rows.shift().map(cell => ({
		name: cell.w || cell.v,
		types: ['float', 'int', 'datetime', 'boolean'],
		type: 'string'
	}));

	// throw out any rows beyond our fixed limit
	if (rows.length > UPLOAD_ROW_LIMIT) {
		rows.length = UPLOAD_ROW_LIMIT;
	} else if (!rows.length || !fields.length) {
		// const e = new Error('No data found.');
		// e.useMessage = true;
		// throw e;
		return null;
	}

	// Clear out empty columns
	for (let i = fields.length - 1; i >= 0; i--) {
		const field = fields[i];
		let noRowsFound = true;
		if (!field) {
			for (let j = 0; noRowsFound && j < rows.length; j++) {
				const row = rows[j];
				if (row && row[i] !== undefined) {
					noRowsFound = false;
				}
			}

			if (noRowsFound) {
				// completely empty column. skip it
				fields.splice(i, 1);
				rows.forEach(row => {
					row.splice(i, 1);
				});
			} else {
				// just missing a name
				fields[i] = {
					name: 'Column ' + (i + 1),
					types: ['float', 'int', 'datetime', 'boolean'],
					type: 'string'
				};
			}
		}
	}

	fields.forEach((field, i) => {
		let min = Infinity;
		let max = -Infinity;
		let dateMin = Infinity;
		let dateMax = -Infinity;
		for (let r = 0; r < rows.length; r++) {
			const row = rows[r];
			if (row) {
				const cell = row[i];
				if (cell) {
					for (let j = field.types.length - 1; j >= 0; j--) {
						const type = field.types[j];
						if (!typeTests[type](cell)) {
							field.types.splice(j, 1);
						} else if (cell.z && !field.format) {
							field.format = cell.z;
						}
					}

					if (field.types.indexOf('datetime') >= 0) {
						const d = toDate(cell.w || cell.v);
						dateMax = Math.max(dateMax, d);
						dateMin = Math.min(dateMin, d);
					}

					const numVal = parseNumber(cell.v || cell.w);
					if (numVal > max) {
						max = numVal;
					}
					if (numVal < min) {
						min = numVal;
					}

					if (!field.types.length) {
						break;
					}
				}
			}
		}

		if (field.types.length) {
			field.type = field.types.pop();
		}

		if (field.type === 'datetime') {
			field.showDate = !!(field.format && dateFields.test(field.format));
			field.showTime = !!(field.format && timeFields.test(field.format));
			min = dateMin;
			max = dateMax;
		}

		if (field.type !== 'string' && field.type !== 'boolean' && min < Infinity && max > -Infinity) {
			field.min = min;
			field.max = max;
			field.scale = 1 / (max - min || 1);
		}
		delete field.types;
	});

	// save just values
	fields.forEach((field, col) => {
		rows.forEach(row => {
			const cell = row[col];
			if (!cell) {
				return;
			}

			if (field.type === 'datetime') {
				row[col] = toDate(cell.w || cell.v).toGMTString();
			} else if (field.type === 'string') {
				row[col] = cell.w !== undefined ? cell.w : (cell.v || '').toString();
			} else if (field.type === 'boolean') {
				row[col] = !falseRegex.test(cell.v) && !!cell.v;
			} else if (field.type === 'int' || field.type === 'float' || !isNaN(cell.v)) {
				// JSON.stringify doesn't like Infinity
				const val = parseNumber(cell.v || cell.w);
				row[col] = Math.min(Math.max(val, -Number.MAX_VALUE), Number.MAX_VALUE);
			} else {
				row[col] = cell.v;
			}
		});
	});

	// normalize
	fields.forEach((field, col) => {
		const valueSet = new Set();
		rows.forEach(row => {
			valueSet.add(row[col]);
		});
		const sortFn = sortCallbacks[field.type];
		const values = [...valueSet].sort(sortFn);

		if (field.type === 'string') {
			field.values = values;
		} else {
			// find increment
			let minStep = Infinity;
			const convert = conversions[field.type] || identity;
			for (let i = 1; i < values.length; i++) {
				const prev = convert(values[i - 1]);
				const val = convert(values[i]);
				const step = val - prev;
				minStep = Math.min(minStep, step);
			}

			field.step = minStep < Infinity ?
				Math.pow(10, Math.floor(Math.log10(minStep))) :
				1;
		}
	});
	const normalized = rows.map(row => row.map((val, col) => {
		const field = fields[col];
		if (!field) {
			return null;
		}
		if (field.type === 'string') {
			return field.values.indexOf(val) / (field.values.length - 1);
		}

		const convert = conversions[field.type];
		if (convert) {
			val = convert(val);
		}

		if (val < field.min || val > field.max) {
			console.warn('Error converting value', field, val);
		}
		return (val - field.min) * field.scale;
	}));
	fields.forEach(field => {
		if (field.type !== 'string' || field.values && field.values.length > MAX_STRING_VALUES) {
			delete field.values;
		}
	});

	if (!rows || !rows.length || !fields.length) {
		return null;
	}

	return {
		fields,
		rows,
		normalized
		// todo: file name or whatever. some request id or something?
	};
}

function readFile(message) {
	const { file, id } = message.data;

	if (file.size > MAX_DATA_FILE_SIZE) {
		postMessage({
			id,
			error: 'File is too big: ' + file.size
		});
		return;
	}

	const reader = new FileReader();
	reader.onload = e => {
		let data = e.target.result;
		if (!rABS) {
			data = new Uint8Array(data);
		}

		// let rows = null;
		// let fields = null;
		let error = null;
		try {
			const workbook = XLSX.read(data, {
				cellDates: true,
				cellNF: true,
				raw: ['text/csv', 'text/plain'].indexOf(file.type) >= 0,
				dateNF: 'm/d/yy h:mm',
				// cellFormula: false,
				cellHTML: false,
				type: rABS ? 'binary' : 'array',
				sheetRows: UPLOAD_ROW_LIMIT + 100 // allow for some padding at the top
			});

			/*
			todo: Filter more properly to make sure there's at least a single header
			and a single row after it
			*/
			const sheetNames = workbook.SheetNames
				.filter(name => Object.keys(workbook.Sheets[name]).length > 2 && workbook.Sheets[name]['!ref']);

			/*
			todo: only getting one sheet!
			*/

			const sheets = [];
			sheetNames.forEach(sheetName => {
				const worksheet = workbook.Sheets[sheetName];
				const sheetData = readWorksheet(worksheet);
				if (sheetData) {
					// todo: set appropriate title/name based on worksheet, only if more than one
					sheets.push({
						sheetName,
						fields: sheetData.fields.length,
						rows: sheetData.rows.length,
						data: new Blob([JSON.stringify(sheetData)], {
							type: 'application/json'
						})
					});
				}
			});

			const props = workbook.Props || {};
			Object.keys(props).forEach(key => {
				if (props[key] === undefined) {
					delete props[key];
				}
			});

			const numSheets = sheets.length;
			if (!numSheets) {
				const error = new Error('No data found in spreadsheet.');
				error.code = 'empty';
				throw error;
			}

			postMessage({
				id,
				sheets: sheets.map(sheet => ({
					title: file.name.replace(fileExt, '') +
						(numSheets > 1 ? ` - ${sheet.sheetName}` : ''),
					props,
					...sheet
				}))
			});
			return;
		} catch (e) {
			error = e;
			console.warn('Error reading spreadsheet.', e);
		}

		postMessage({
			id,
			error: serializeError(error)
		});
	};
	if (rABS) {
		reader.readAsBinaryString(file);
	} else {
		reader.readAsArrayBuffer(file);
	}
}

onmessage = function (message) { // eslint-disable-line no-undef
	if (message.data.file) {
		// uploaded new file
		readFile(message);
	} else if (DEBUG) {
		console.warn('UploadWorker: Message received from main script', message.data);
	}
};
