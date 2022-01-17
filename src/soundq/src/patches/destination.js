export default function destination(destNode) {
	return () => ({
		input: destNode,
		output: null
	});
}
