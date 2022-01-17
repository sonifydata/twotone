export default (options, ...args) =>
	typeof options === 'function' ?
		options(...args) :
		options;