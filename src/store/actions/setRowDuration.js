import { MAX_ROW_DURATION } from '../../constants';

export default function setRowDuration(state, val) {
	const rowDuration = Math.max(0.2, Math.min(val, MAX_ROW_DURATION));
	return { rowDuration };
}

