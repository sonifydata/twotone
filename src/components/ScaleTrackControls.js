import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';
import {
	DEFAULT_SCALE_RANGE,
	DEFAULT_START_OCTAVE,
	DEFAULT_KEY,
	DEFAULT_MODE,
	DEFAULT_INSTRUMENT,
	DEFAULT_ARPEGGIO_MODE
} from '../constants';
import num from '../util/num';
import { modes, keys } from '../../src/soundq/src/util/scales';
import { instruments as samplerInstruments } from '../engine/types/scale/samplerInstruments';
import synthInstruments from '../engine/types/scale/synthInstruments';
import capitalize from '../util/capitalize';

/*
Material UI components
*/
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
// import Slider from './Slider';

const instruments = {
	...samplerInstruments,
	...synthInstruments
};

const styles = theme => ({
	root: {
		// display: 'flex',
		// alignItems: 'flex-end'
	},
	keyControlGroup: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		margin: theme.spacing.unit,
		minWidth: 70,
		'& > label': {
			whiteSpace: 'nowrap'
		}
	},
	slider: {
		width: 120
	}
});

const octaveRangeOptions = range => Array.from(Array(range), (n, i) => {
	const octaves = i + 1;
	const label = i ? `${octaves} Octaves` : '1 Octave';
	return <MenuItem value={octaves} key={octaves}>{label}</MenuItem>;
});

const octaveOptions = (note, min, max) => Array.from(Array(1 + max - min), (n, i) => {
	const value = i + min;
	const label = note + value;
	return <MenuItem value={value} key={value}>{label}</MenuItem>;
});

const Def = class ScaleTrackControls extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		track: PropTypes.object.isRequired,
		data: PropTypes.object,
		setTrack: PropTypes.func.isRequired
	}

	modifiedTrackConfig = (oldTrack, name, value) => {
		const oldConfig = oldTrack.config || {};
		const oldScaleConfig = oldConfig.scale || {};

		const scale = {
			...oldScaleConfig,
			[name]: value
		};

		const config = {
			...oldConfig,
			scale
		};

		const track = {
			...oldTrack,
			config
		};
		return track;
	}

	handleChangeConfig = evt => {
		const { setTrack } = this.props;
		const oldTrack = this.props.track || {};
		const { name, value } = evt.target;
		const track = this.modifiedTrackConfig(oldTrack, name, value);
		setTrack(track, track.id);
	}

	handleChangeStartOctave = evt => {
		const startOctave = evt.target.value;

		const { setTrack } = this.props;
		const oldTrack = this.props.track || {};
		const track = this.modifiedTrackConfig(oldTrack, 'startOctave', startOctave);

		setTrack(track, track.id);
	}

	handleChangeScaleRange = evt => {
		const octaves = evt.target.value;
		const scaleRange = octaves * 7 + 1; // inclusive

		const { setTrack } = this.props;
		const oldTrack = this.props.track || {};
		const track = this.modifiedTrackConfig(oldTrack, 'scaleRange', scaleRange);

		setTrack(track, track.id);
	}


	render() {
		const {
			classes,
			track
		} = this.props;

		const config = track.config && track.config.scale || {};
		const scaleRange = num(config.scaleRange, DEFAULT_SCALE_RANGE);
		const tempoFactor = num(config.tempoFactor, 1);
		const arpeggioMode = config.arpeggioMode === undefined ? DEFAULT_ARPEGGIO_MODE : config.arpeggioMode || '';
		const key = config.key || DEFAULT_KEY;
		const mode = config.mode || DEFAULT_MODE;
		const { minOctave, maxOctave } = instruments[config.instrument] || instruments[DEFAULT_INSTRUMENT];
		const startOctave = num(config.startOctave, DEFAULT_START_OCTAVE);
		const scaleRangeOctaves = Math.max(1, Math.min(maxOctave - minOctave + 1, Math.floor(scaleRange / 7)));
		const effectiveMaxOctave = maxOctave - scaleRangeOctaves + 1;
		const configStartOctave = Math.max(minOctave, Math.min(effectiveMaxOctave, startOctave));
		const maxOctaveRange = 1 + maxOctave - minOctave;

		return <div className={classes.root}>
			<FormControl className={classes.keyControlGroup}>
				<InputLabel htmlFor={'track-key-' + track.id}>Key</InputLabel>
				<Select
					value={key}
					onChange={this.handleChangeConfig}
					inputProps={{
						name: 'key',
						id: 'track-key-' + track.id
					}}
				>
					{keys.map(key => <MenuItem value={key} key={key}>{key}</MenuItem>)}
				</Select>
				<Select
					value={mode}
					onChange={this.handleChangeConfig}
					inputProps={{
						name: 'mode',
						id: 'track-mode'
					}}
				>
					{modes.map(m => <MenuItem value={m} key={m}>{capitalize(m)}</MenuItem>)}
				</Select>
			</FormControl>
			{maxOctaveRange > 1 ? <FormControl className={classes.keyControlGroup}>
				<InputLabel htmlFor={'track-scale-range-' + track.id}>Scale Range</InputLabel>
				<Select
					value={Math.min(maxOctaveRange, scaleRangeOctaves)}
					onChange={this.handleChangeScaleRange}
					inputProps={{
						name: 'track-scale-range',
						id: 'track-scale-range-' + track.id
					}}
				>
					{octaveRangeOptions(maxOctaveRange)}
				</Select>
			</FormControl> : null}
			<FormControl className={classes.keyControlGroup}>
				<InputLabel htmlFor={'track-start-octave-' + track.id}>Start Octave</InputLabel>
				<Select
					value={startOctave >= 0 ? configStartOctave : -1}
					disabled={effectiveMaxOctave <= minOctave}
					onChange={this.handleChangeStartOctave}
					inputProps={{
						name: 'track-start-octave',
						id: 'track-start-octave-' + track.id
					}}
				>
					<MenuItem value={-1} key={-1}>Auto</MenuItem>
					{octaveOptions(key, minOctave, effectiveMaxOctave)}
				</Select>
			</FormControl>
			<FormControl className={classes.keyControlGroup}>
				<InputLabel htmlFor={'track-tempo-factor-' + track.id}>Track Tempo</InputLabel>
				<Select
					value={tempoFactor}
					onChange={this.handleChangeConfig}
					inputProps={{
						name: 'tempoFactor',
						id: 'track-tempo-factor-' + track.id
					}}
				>
					<MenuItem value={1}>1x</MenuItem>
					<MenuItem value={2}>2x</MenuItem>
					<MenuItem value={3}>3x</MenuItem>
					<MenuItem value={4}>4x</MenuItem>
					<MenuItem value={6}>6x</MenuItem>
					<MenuItem value={8}>8x</MenuItem>
					<MenuItem value={9}>9x</MenuItem>
					<MenuItem value={12}>12x</MenuItem>
				</Select>
			</FormControl>
			{tempoFactor > 1 ? <FormControl className={classes.keyControlGroup}>
				<InputLabel shrink htmlFor={'track-arpeggio-mode-' + track.id}>Arpeggio</InputLabel>
				<Select
					value={arpeggioMode}
					onChange={this.handleChangeConfig}
					displayEmpty
					inputProps={{
						name: 'arpeggioMode',
						id: 'track-arpeggio-mode-' + track.id
					}}
				>
					<MenuItem value=""><em>None</em></MenuItem>
					<MenuItem value="ascending">Ascending</MenuItem>
					<MenuItem value="descending">Descending</MenuItem>
					{/*<MenuItem value="random">Random</MenuItem>*/}
				</Select>
			</FormControl> : null}

		</div>;
	}
};

const ScaleTrackControls = withStyles(styles)(
	connect(['data'], actions)(Def)
);
export default ScaleTrackControls;
