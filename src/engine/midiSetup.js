
import { store } from '../store';
import { WebMidi } from 'webmidi';
import { debounce } from 'debounce';

export async function webMidiCheck() {
	if (WebMidi.enabled) {
		store.setState({webMidiAvailable: true});
		return true;
	}
	if (!('requestMIDIAccess' in navigator)) {
		alert(
			`	WebMIDI is not available in this browser!
			
			Please try using Chrome, Edge or 
			the Jazz plug in for FireFox.
			
			TwoTone MIDI functions will be disabled`)
		store.setState({webMidiAvailable: false});
		return false;
	} else {
		console.log('🙌🏻 YES, happy days! This browser supports WebMIDI!');
		console.log('Using WebMidi ' + WebMidi.version);
		const enabled = await enableWebMidi();
		if (enabled) {
			store.setState({webMidiAvailable: enabled});
			store.setState({midiOutPorts: getMidiOutputNames()});
			return true;
		} else {
			return false;
		}
	}
}

export function enableWebMidi() {

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
	store.setState( { webMidiAvailable: WebMidi.enabled });
}

export function getMidiOutputs() {
	return store.getState().webMidiAvailable ? WebMidi.outputs : [];
}

export function getOutputByName(portName) {
	return WebMidi.getOutputByName(portName);
}

export function getMidiOutputNames() {
	const outs = [];
	getMidiOutputs().forEach(o => outs.push(o.name));
	return outs;
}

export function getCurrentMidiOutput() {
	let o;
	try {
		o = getOutputByName(store.getState().midiOutPort);
	} catch (e) {
		o = undefined;
	}
	return o;
}

export function getWebMidiTime() {
	return WebMidi.time;
}

export function scheduleMidiNoteEvent(
	{	keyEvent = 'on',
		schedulingTime = 0,
		noteValue = 'C3',
		duration = Infinity,
		velocity = 0.8,
		channel } = {}) {
	const options = {time: schedulingTime, duration: duration, attack: velocity, release: 0};

	if (channel === undefined) {
		return;
	}
	const output = getOutputByName(store.getState().midiOutPort);
	if (output === undefined) {
		return;
	}

	const sendChannel = output.channels[channel];
	const noteOnFunc = () => sendChannel.playNote(noteValue, options);
	const noteOffFunc = () => sendChannel.stopNote(noteValue, options);

	switch (keyEvent) {
		case 'on':
			debounce(noteOnFunc(), 100);
			break;
		case 'off':
			debounce (noteOffFunc(), 50);
			break;
		default:
			debounce.clear();
	}
}

export function allNotesOff() {
	const { webMidiAvailable } = store.getState();
	if (webMidiAvailable) {
		const { midiOutPort } = store.getState();
		if (midiOutPort) {
			getCurrentMidiOutput().sendAllNotesOff();
		}
	}
}

