export default function passThrough(node) {
	return () => ({
		node
	});
}
