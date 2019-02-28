const capitalizeRegex = /^(\w)(\w*)/i;
export default function capitalize(str) {
	return str.replace(capitalizeRegex, (match, first, rest) => first.toUpperCase() + rest.toLowerCase());
}
