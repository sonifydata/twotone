import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import { connect } from 'unistore/react';
import { actions, store } from '../store';

import MenuItem from '@material-ui/core/MenuItem';
import WideSelect from './WideSelect';

import * as midi from '../engine/midiSetup'; 

const styles = () => ({
	ports: {
		width: 200
	},
	instrument: {
		flex: 0.4
	}
});

const Def = class MidiPortSelector extends React.Component {


	static propTypes = {		
		classes: PropTypes.object.isRequired,
		data: PropTypes.object,
		midiOutPorts: PropTypes.arrayOf.string, // cav added
		midiOutPort: PropTypes.string
	}
	

	componentDidMount() {
		// maybe don't need to check WebMidi so often
		//midi.webMidiCheck();
	}

	componentDidUpdate() {
		this.props.setMidiOutPorts(midi.getMidiOutputNames());
	}

	handleChangeMidiPort = (event) => {
		this.props.setOutputPortByIndex( event.target.value );
		console.log( "midi port changed to: " + event.target.value);
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
		<WideSelect
			label = {midiOutPort}
			value = "port"
			onChange = { this.handleChangeMidiPort }
			name = "midiOut"
			id= { 'midi-output' }
			classes={{ 
				root: classes.ports 
			}}
		>
			<MenuItem value='-1'>
				<em>None</em>
			</MenuItem>
				{ Object.entries(fields)
					.map( (port, i)  => ( 
						<MenuItem key={port[1].id + '_'+(i.toString())} value={i}> {i} {port[1].id} </MenuItem>
				))}
		</WideSelect>
	</React.Fragment>
	}
};

const MidiPortSelector = 
	connect(['midiOutPort', 'midiOutPorts'], actions)(withStyles(styles)(Def));

export default MidiPortSelector;