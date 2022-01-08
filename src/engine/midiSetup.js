import { store } from '../store';
import { Output, WebMidi } from 'webmidi';

async function webMidiCheck() {
	 if (WebMidi.enabled) return (true);
	 if (!("requestMIDIAccess" in navigator)) {
	  console.log('☹️ WebMIDI is not supported in this browser.')
	  return (false);
	} else {
	  console.log('🙌🏻 YES, happy days! This browser supports WebMIDI!');
	  const enabled = await enableWebMidi();
	  store.setState( { webMidiAvailable: enabled } );
	  return (enabled);
	} 
}

function enableWebMidi() {
	
    WebMidi
        .enable()
        .then(onWebMidiEnabled)
        .catch(err => {
        	alert("⚠️ There was a problem initialising MIDI features\n" + err);
        	return (false);
        });	
    return (true);
}

function onWebMidiEnabled() {
    console.log("🎛 WebMidi enabled: " + WebMidi.enabled);
        // Inputs
        WebMidi.inputs.forEach(input => console.log('⬅︎ MIDI In: \n' + input.manufacturer, input.name));
        // Outputs
        WebMidi.outputs.forEach(output => console.log('⮕ MIDI Out: \n' + output.manufacturer, output.name));
}

function getMidiOutputs() {
		return (WebMidi.enabled ? WebMidi.outputs : []);
}

function getOutputByName(currentMidiPort) {
		return (WebMidi.getOutputByName(currentMidiPort));
};

function getMidiOutputNames() {
	const outs = []; 
	getMidiOutputs().forEach( o => outs.push(o.name));
	return outs;
}

export function playMidiNote( noteName = 'C3', duration = 1.0, velocity = 0.5, channel = 1 ) {
	let output = getOutputByName( store.getState().midiOutPort );
	if (output === undefined) return; 
	let sendChannel = output.channels[channel];
	sendChannel.playNote( noteName, {duration: duration});
}

export { webMidiCheck, enableWebMidi, getMidiOutputs, getMidiOutputNames , getOutputByName };


