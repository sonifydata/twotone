const spaces = /[\t\n\s]+/g;
export default str => str && str.trim().replace(spaces, ' ') || '';