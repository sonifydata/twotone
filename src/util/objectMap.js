const objectMap = (src, fn) => Object.keys(src).reduce((dest, current) => {
	dest[current] = fn(src[current]);
	return dest;
}, {});
export default objectMap;