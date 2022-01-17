//MidiActions
import * as midi from '../../engine/midiSetup';


export function midiInit(state)
{
	const webMidiAvailable = midi.webMidiCheck();
	const ports = midi.getMidiOutputNames();
	setMidiOutPorts(state, ports);
	return { webMidiAvailable };
}

export 	function setMidiOutPorts(state, ports) {
	state.midiOutPorts = ports;
	return null;
}

export function setOutputPortByIndex(state , portNumber) {	
	let midiOutPort = '';
	if ( state.midiOutPorts.length>0 ) {
		midiOutPort = state.midiOutPorts[portNumber]; // needs bounds check?
	}
	state.midiOutPort = midiOutPort;
	return { midiOutPort };
}
