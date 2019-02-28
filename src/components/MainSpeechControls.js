/* global SPEECH_API_KEY */
import MainSpeechControlsExists from './MainSpeechControlsExists';
import MainSpeechControlsMissing from './MainSpeechControlsMissing';

if (!SPEECH_API_KEY) {
	console.warn('Unable to generate speech without a Google Speech API key');
}

const MainSpeechControls = SPEECH_API_KEY ? MainSpeechControlsExists : MainSpeechControlsMissing;
export default MainSpeechControls;