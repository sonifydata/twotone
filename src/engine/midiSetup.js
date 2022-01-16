import { store } from '../store';
import { WebMidi } from 'webmidi';

export async function webMidiCheck() {
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
		channel = 1 } = {}) {
	//todo: allow the notes to get scheduled even though the port is offline
	const output = getOutputByName(store.getState().midiOutPort);

	if (output === undefined) {
		return;
	}

	const sendChannel = output.channels[channel];

	switch (keyEvent) {
		case 'on':
			sendChannel.playNote(noteValue, {time: schedulingTime, duration: duration, attack: velocity});
			break;
		case 'off':
			sendChannel.stopNote(noteValue, {time: schedulingTime, duration: duration, attack: velocity});
			break;
	}
}

export function sendMidiNoteEvent(
	{	keyEvent = 'on',
		noteValue = 'C3',
		duration = 500,
		velocity = 0.8,
		channel = 1 } = {}) {

	channel = Math.max(1, channel);
	const output = getOutputByName(store.getState().midiOutPort);

	if (output === undefined) {
		return;
	}
	const sendChannel = output.channels[channel];

	switch (keyEvent) {
		case 'on':
			sendChannel.playNote(noteValue, {duration: duration, attack: velocity});
			break;
		case 'off':
			sendChannel.stopNote(noteValue, {duration: duration, attack: velocity});
			break;
	}
}


