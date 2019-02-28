// import { MAX_ROW_DURATION } from '../../constants';

export default function setDataSourceId(state, dataSourceId) {
	if (dataSourceId === state.dataSourceId) {
		return null;
	}
	return {
		dataSourceId,
		tracks: [],
		speechTitle: '',
		rowDuration: 1,
		currentTime: 0,
		paused: true,
		tracksVolume: 1,
		newProject: true
	};
}

