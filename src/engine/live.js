import AudioDataEngine from './AudioDataEngine';
import { requirements } from '../util/loadRequirements';
const { AudioContext } = requirements.AudioContext;


const context = new AudioContext();
const liveEngine = new AudioDataEngine(context);

export default liveEngine;
