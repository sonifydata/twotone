import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import { connect } from 'unistore/react';
import { actions, store } from '../store';

import MenuItem from '@material-ui/core/MenuItem';
import WideSelectMidi from './WideSelectMidi';

import * as midi from '../engine/midiSetup';

let styles = () => ({
	midiPortsListStyles: {
		flex: 0.4
	}
})


let { midiOutPorts, midiOutPort } = store.getState();

const Def = class MidiPortSelector extends React.Component {


	static propTypes = {		
		classes: PropTypes.object.isRequired,
		data: PropTypes.object,
		midiOutPorts: PropTypes.arrayOf.string, // cav added
		midiOutPort: PropTypes.string
	};


	componentDidMount() {

	}

	componentDidUpdate() {

	}

	handleChangeMidiPort = (event) => {
		const midiPortSelected = event.target.value >= 0 ? event.target.value: -1;
		const { webMidiAvailable } = store.getState();
		if (!webMidiAvailable) { return }
		else {
			const l =  midi.getMidiOutputNames();
			store.setState({ midiOutPorts: l } );
		}

		midiOutPorts  = store.getState().midiOutPorts;
			if (midiOutPorts.length > 0) {
				midiOutPort = midiOutPorts[midiPortSelected];
				store.setState( {midiOutPort: midiOutPort}  );
			}
	}

	render() {
		const {
			midiOutPort,
			midiOutPorts,
			classes,
		} = this.props;

		if (!midiOutPorts || midiOutPorts.length <= 0) { return null; }

		const fields = Object.fromEntries(
		  midiOutPorts.map((port, i) => [ i, {
		    id: port
		  }])
		);
		
	return <React.Fragment>
		<WideSelectMidi
			onChange = { this.handleChangeMidiPort }
			label = { midiOutPort || 'Set Midi Destination' }
			value ={midiOutPort}
			id = ''
			classes={{
				root: classes.midiPortsListStyles
			}}>
				{ Object.entries(fields)
					.map( (port, i)  => ( 
						<MenuItem key={port[1].id + '_'+(i.toString())} value={i}> {i} {port[1].id} </MenuItem>
				))}
		</WideSelectMidi>
	</React.Fragment>
	}
};

const MidiPortSelector = 
	connect(['midiOutPort', 'midiOutPorts'], actions)(withStyles(styles)(Def));
export default MidiPortSelector;