import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import { connect } from 'unistore/react';
import { actions, store } from '../store';

import MenuItem from '@material-ui/core/MenuItem';
import WideSelectMidi from './WideSelectMidi';

import * as midi from '../engine/midiSetup';


const styles = () => ({
	midiPortsListStyles: {
		flex: 0.2
	}
})


let { midiOutPorts, midiOutPort, webMidiAvailable } = store.getState();


const Def = class MidiPortSelector extends React.Component {



	static propTypes = {
		classes: PropTypes.object.isRequired,
		data: PropTypes.object,
		midiOutPorts: PropTypes.arrayOf.string, // cav added
		midiOutPort: PropTypes.string
	};


	handleChangeMidiPort = (event) => {

		const midiPortSelected = event.target.value >= 0 ? event.target.value: -1;
		webMidiAvailable = store.getState().webMidiAvailable;
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

		store.setState( { midiPortSelectToggle: false } );
	}


	render() {
		const {
			midiOutPort,
			midiOutPorts,
			classes,
		} = this.props;

		if (!midiOutPorts || midiOutPorts.length <= 0) { return null; }

		const fields = Object.fromEntries(midiOutPorts.map((port, i) => [ i, {id: port}]));

		return <React.Fragment>
			<WideSelectMidi
				onClose = { this.handleClose }
				onChange = { this.handleChangeMidiPort }
				label = { midiOutPort || 'Set Midi Destination' }
				value = { midiOutPort }
				id = 'midi-menu'
				classes={{
					root: classes.midiPortsListStyles
				}}>
				{ Object.entries(fields)
					.map( (port, i)  =>
						<MenuItem key={port[1].id + '_'+i.toString()}
								  value={i}
								  aria-label={'Port ' + i.toString()}
								  dense={true}
						> {port[1].id} </MenuItem>
					)}
			</WideSelectMidi>
		</React.Fragment>
	}
};

const MidiPortSelector =
	connect(['midiOutPort', 'midiOutPorts'], actions)(withStyles(styles)(Def));
export default MidiPortSelector;
