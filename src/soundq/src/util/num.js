export default function num(n, alt) {
	n = parseFloat(n);
	return isNaN(n) ? alt : n;
}
