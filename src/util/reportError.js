import ErrorStackParser from 'error-stack-parser';

function errorString(obj) {
	let str = obj.toString();
	if (str === '[object Object]') {
		try {
			str = JSON.stringify(obj);
		} catch (e) { console.log('error in stack parser:'+ e)}
	}

	return str;
}

export default function reportError(event, stackLevel = 0) {
	const error = event.error ||
		event.reason ||
		event.detail && event.detail.reason ||
		event.detail ||
		event;
	console.error(error);

	let message = error && error.message || event.type || 'Undefined error';
	let details = '';
	let errorDetails = null;
	try {
		errorDetails = ErrorStackParser.parse(error);
	} catch (e) { console.log('error in stack parser: '+ e)}

	if (errorDetails && errorDetails.length) {
		const stackTop = errorDetails[Math.min(stackLevel, errorDetails.length - 1)];
		details = [
			stackTop.fileName,
			stackTop.lineNumber,
			stackTop.columnNumber,
			stackTop.functionName
		].filter(val => val !== undefined).join(':');
	} else if (typeof error === 'string') {
		message = error || message;
		details = event.type;
	} else if (event instanceof window.ErrorEvent) {
		details = [
			(event.filename || '').replace(window.location.origin, ''),
			event.lineno,
			event.colno
		].join(':');
	} else if (error && error.toString) {
		details = errorString(error);
	} else {
		console.error('failed to parse error', event);
		details = errorString(event);
	}

	if (window.ga) {
		window.ga('send', 'exception', {
			exDescription: details && details !== message ?
				`${message} [${details}]` :
				message
		});
	}
}
