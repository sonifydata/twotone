import { store } from '../store';
import { WebMidi } from 'webmidi';


async function webMidiCheck() {
	if (WebMidi.enabled) {
		return true;
	}
	if (!('requestMIDIAccess' in navigator)) {
		console.log('☹️ WebMIDI is not supported in this browser.');
		return false;
	} else {
		console.log('🙌🏻 YES, happy days! This browser supports WebMIDI!');
		console.log('Using WebMidi ' + WebMidi.version);
		const enabled = await enableWebMidi();
		store.setState({webMidiAvailable: enabled});
		store.setState({midiOutPorts: getMidiOutputNames() });
		return true;
	}
}

function enableWebMidi() {

	WebMidi
		.enable()
		.then(onWebMidiEnabled)
		.catch(err => {
			alert('⚠️ There was a problem initialising MIDI features\n' + err);
			return Promise.resolve(false);
		});
	return Promise.resolve(true);
}

function onWebMidiEnabled() {
	console.log('🎛 WebMidi enabled: ' + WebMidi.enabled);
	// Inputs
	WebMidi.inputs.forEach(input => console.log('⬅︎ MIDI In: \n' + input.manufacturer, input.name));
	// Outputs
	WebMidi.outputs.forEach(output => console.log('⮕ MIDI Out: \n' + output.manufacturer, output.name));
}

function getMidiOutputs() {
	return store.getState().webMidiAvailable ? WebMidi.outputs : [];
}

function getOutputByName(portName) {
	return WebMidi.getOutputByName(portName);
}

function getMidiOutputNames() {
	const outs = [];
	getMidiOutputs().forEach(o => outs.push(o.name));
	return outs;
}


export function playMidiNote(noteValue, dur = 1.0, velocity = 0.5, channel = 1) {
	const output = getOutputByName(store.getState().midiOutPort);
	if (output === undefined) {
		return;
	}
	const sendChannel = output.channels[channel];
	sendChannel.playNote(noteValue, {duration: dur, attack: velocity});

}



export { webMidiCheck, enableWebMidi, getMidiOutputs, getMidiOutputNames, getOutputByName };


