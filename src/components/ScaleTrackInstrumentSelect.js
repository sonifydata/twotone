import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import { connect } from 'unistore/react';
import { store, actions } from '../store';
import num from '../util/num';

import { DEFAULT_INSTRUMENT } from '../constants';

import MenuItem from '@material-ui/core/MenuItem';
import WideSelect from './WideSelect';
import MidiChannelSelector from './MidiChannelSelector'


const styles = () => ({
	dataSource: {
		flex: 0.6
	},
	instrument: {
		flex: 0.4
	}
});

const Def = class ScaleTrackInstrumentSelect extends React.Component {

	static propTypes = {
		classes: PropTypes.object.isRequired,
		track: PropTypes.object.isRequired,
		setTrack: PropTypes.func.isRequired,
		data: PropTypes.object
	}

	handleChangeIntensityField = event => {
		const intensityField = event.target.value >= 0 ? num(event.target.value, -1) : -1;
		const { track, setTrack } = this.props;
		setTrack(Object.assign({}, track, {
			intensityField
		}), track.id);
	}

	handleChangeConfig = evt => {
		const { setTrack } = this.props;
		const oldTrack = this.props.track || {};
		const oldConfig = oldTrack.config || {};
		const oldScaleConfig = oldConfig.scale || {};
		const oldMidiChannel = oldConfig.midiChannel || {};

		const { name, value } = evt.target;

		const { midiChannel } = store.getState();

		const scale = {
			...oldScaleConfig
		};
		scale[name] = value;

		const config = {
			...oldConfig,
			scale, midiChannel
		};

		const track = {
			...oldTrack,
			config
		};

		setTrack(track, track.id);
	}

	render() {
		const {
			classes,
			track,
			data
		} = this.props;

		const config = track.config && track.config.scale || {};
		const instrument = config.instrument || DEFAULT_INSTRUMENT;

		// todo: support non-numeric fields
		const fields = !data || !data.fields ?
			[] :
			data.fields
				.map(({name, type, max, min}, i) => ({name, type, min, max, i}))
				.filter(({type, max, min}) => type !== 'string' && max !== min);


		return <React.Fragment>
			<WideSelect
				label="Data Source"
				value={track.intensityField > -1 ? track.intensityField : ''}
				onChange={this.handleChangeIntensityField}
				name="intensity-field"
				id={'intensity-field-' + track.id}
				classes={{
					root: classes.dataSource
				}}
			>
				<MenuItem value="">
					<em>None</em>
				</MenuItem>
				{fields
					.map( ( {name, i} ) =>
						<MenuItem value={i} key={i}>{name}</MenuItem>)
				}
			</WideSelect>
			<WideSelect
				label="Instrument"
				name="track-instrument"
				id={'track-instrument-' + track.id}
				value={instrument}
				onChange={this.handleChangeConfig}
				inputProps={{
					name: 'instrument'
				}}
				classes={{
					root: classes.instrument
				}}
			>
				{/* todo: get this list from somewhere */}
				<MenuItem value="piano">Piano</MenuItem>
				<MenuItem value="organ">Church Organ</MenuItem>
				<MenuItem value="mandolin">Mandolin</MenuItem>
				<MenuItem value="marimba">Marimba</MenuItem>
				<MenuItem value="bass">Double Bass</MenuItem>
				<MenuItem value="electricGuitar">Electric Guitar</MenuItem>
				<MenuItem value="harp">Harp</MenuItem>
				<MenuItem value="violin">Violin</MenuItem>
				<MenuItem value="trumpet">Trumpet</MenuItem>
				<MenuItem value="glockenspiel">Glockenspiel</MenuItem>
				<MenuItem value="midiOut">Midi Out</MenuItem>
			</WideSelect>
			{ instrument == "midiOut" ? <MidiChannelSelector/> : null }
		</React.Fragment>;
	}
};

const ScaleTrackInstrumentSelect = 
	connect(['data'], actions)(withStyles(styles)(Def));
export default ScaleTrackInstrumentSelect;