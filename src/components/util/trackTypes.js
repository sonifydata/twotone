import ClipTrackControls from '../ClipTrackControls';
import ScaleTrackControls from '../ScaleTrackControls';
import ScaleTrackInstrumentSelect from '../ScaleTrackInstrumentSelect';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import MicIcon from '@material-ui/icons/Mic';

export default {
	clip: {
		name: 'Narration Audio',
		controls: ClipTrackControls,
		icon: MicIcon
	},
	scale: {
		name: 'Musical Scale',
		advanced: ScaleTrackControls,
		headerControl: ScaleTrackInstrumentSelect,
		icon: MusicNoteIcon,
		hasIntensity: true
	}
};