import { arrayMove } from 'react-sortable-hoc';

export default function reorderTrack(state, oldIndex, newIndex) {
	const tracks = arrayMove(state.tracks, oldIndex, newIndex);

	return {
		tracks
	};
}