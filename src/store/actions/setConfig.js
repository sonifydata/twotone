// import { MAX_ROW_DURATION } from '../../constants';

export default function setConfig(state, config) {
	return {
		config: {
			...state.config,
			...config
		}
	};
}
