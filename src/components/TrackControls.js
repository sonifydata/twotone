import React from 'react';
// import classNames from 'classnames';
import { connect } from 'unistore/react';
import { actions } from '../store';
import num from '../util/num';
import formatData from '../util/formatData';

/*
Material UI components
*/
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Slider, { Range } from './Slider';
import IconButton from './IconButton';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';

import trackTypes from './util/trackTypes';

const styles = theme => ({
	controlsCategory: {
		display: 'flex',
		flexDirection: 'row'
	},
	formControl: {
		margin: theme.spacing.unit,
		minWidth: 120
	},
	volumeControl: {
		display: 'inline-flex',
		alignItems: 'center',
		marginTop: theme.spacing.unit * 2
	},
	volumeButton: {
		height: theme.spacing.unit * 4,
		width: theme.spacing.unit * 4,
		'& > span': {
			// hack to fix vertical alignment
			marginTop: -8
		}
	},
	sliderContainer: {
		marginTop: 16,
		minHeight: '1.1875em',
		padding: [[6, 0, 4, 8]]
	},
	slider: {
		width: 300,
		display: 'inline-block'
	}
});

// step is adjusted until bug in rc-slider is fixed
// https://github.com/react-component/slider/issues/533
function rcSliderStepHack(val) {
	return Math.round(val * 10e18) / 10e18;
}

const Def = class TrackControls extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		track: PropTypes.object.isRequired,
		data: PropTypes.object,
		setTrack: PropTypes.func.isRequired
	}

	handleChangeVolume = val => {
		const { track, setTrack } = this.props;
		setTrack(Object.assign({}, track, {
			volume: val
		}), track.id);
	}

	handleToggleMuted = () => {
		const { track, setTrack } = this.props;
		setTrack(Object.assign({}, track, {
			muted: !track.muted
		}), track.id);
	}

	handleChangeFilterField = event => {
		const filterField = event.target.value >= 0 ? num(event.target.value, -1) : -1;
		const { track, setTrack } = this.props;

		// clear filter values if field changes
		const filterValues = filterField !== track.filterField ? [] : track.filterValues;

		setTrack(Object.assign({}, track, {
			filterField,
			filterValues
		}), track.id);
	}

	handleChangeFilterRange = filterRange => {
		const { track, setTrack } = this.props;

		// workaround for rc-slider bug (see below)
		// todo: remove when bug is fixed
		filterRange[0] = Math.max(0, filterRange[0]);
		filterRange[1] = Math.min(1, filterRange[1]);

		setTrack(Object.assign({}, track, {
			filterRange
		}), track.id);
	}

	handleChangeFilterSelect = event => {
		const filterValues = event.target.value || [];
		const { track, setTrack } = this.props;

		setTrack(Object.assign({}, track, {
			filterValues
		}), track.id);
	}

	render() {
		const {
			classes,
			track,
			data
		} = this.props;

		const typeDef = trackTypes[track.type];
		const hasIntensity = !!typeDef.hasIntensity;
		const TypeControls = typeDef.advanced || null;

		const hasFilterField = track.filterField >= 0 &&
			track.filterField < data.fields.length &&
			typeof track.filterField === 'number';
		const filterFieldIndex = !hasIntensity || hasFilterField ?
			track.filterField :
			track.intensityField;

		const filterField = filterFieldIndex >= 0 && data ? data.fields[filterFieldIndex] : null;

		const filterMin = filterField && filterField.type === 'datetime' ?
			filterField.min :
			num(filterField && filterField.min, 0);
		const filterMax = filterField && filterField.type === 'datetime' ?
			filterField.max :
			num(filterField && filterField.max, 1);
		const filterRange = filterMax - filterMin;
		const filterStep = filterField && (filterField.step || 0) * filterField.scale;

		// todo: support non-numeric fields
		const fields = !data || !data.fields ?
			[] :
			data.fields
				.map((field, i) => ({...field, i}))
				.filter(({type, max, min, values}) => max !== min || type === 'string' && values && values.length);

		const tipFormatter = formatData(filterField);

		const filterFieldId = 'filter-field-' + track.id;

		return <React.Fragment>
			<div className={classes.controlsCategory}>
				<FormControl className={classes.formControl}>
					<InputLabel htmlFor="track-volume" shrink={true}>Volume</InputLabel>
					<div className={classes.volumeControl}>
						<IconButton label="Toggle Mute Track" className={classes.volumeButton} onClick={this.handleToggleMuted}>
							{ track.muted ? <VolumeOffIcon color="disabled" /> : <VolumeUpIcon color="action" /> }
						</IconButton>
						<Slider
							className={classes.slider}
							min={0}
							max={1}
							step={0.000001}
							disabled={!!track.muted}
							value={track.volume === undefined ? 1 : track.volume}
							tipFormatter={v => (v * 100).toFixed(0) + '%'}
							onChange={this.handleChangeVolume}
						/>
					</div>
				</FormControl>
				<div>
					<FormControl className={classes.formControl}>
						<InputLabel shrink htmlFor={filterFieldId}>Filter by</InputLabel>
						<Select
							value={track.filterField > -1 ? track.filterField : ''}
							onChange={this.handleChangeFilterField}
							name="filter-field"
							input={<Input id={filterFieldId} />}
							displayEmpty
						>
							<MenuItem value="">
								{hasIntensity ? <em>Auto</em> : <em>None</em>}
							</MenuItem>
							{fields
								.map(({name, i}) => <MenuItem value={i} key={i}>{name}</MenuItem>)}
						</Select>
					</FormControl>
				</div>
				<div>
					{filterField && <FormControl className={classes.formControl}>
						{/* todo: style this to make label match */}
						<InputLabel shrink htmlFor="select-field-value">Filter Value</InputLabel>
						{filterField.type === 'string' ?
							<Select
								multiple
								displayEmpty
								value={track.filterValues || []}
								onChange={this.handleChangeFilterSelect}
								input={<Input id="select-field-value" />}
								renderValue={selected => selected && selected.length > 0 && selected.join(', ') || <em>Select Values</em>}
							>
								{filterField.values.map(name =>
									<MenuItem key={name} value={name}>
										<Checkbox checked={track.filterValues && track.filterValues.indexOf(name) > -1} />
										<ListItemText primary={name} />
									</MenuItem>
								)}
							</Select> :
							<div className={classes.sliderContainer}>{/*
							max is set slightly higher than 1 here as a workaround for this bug
							https://github.com/react-component/slider/issues/459
							todo: remove workaround once the bug is fixed
							*/}
							<Range
								className={classes.slider}
								value={track.filterRange || [0, 1]}
								min={0}
								max={1.01}
								step={rcSliderStepHack(filterStep || 0.001)}
								allowCross={false}
								tipFormatter={value => {
									return tipFormatter(value * filterRange + filterMin);
								}}
								onChange={this.handleChangeFilterRange}
							/></div>
						}
					</FormControl>}
				</div>
			</div>
			{TypeControls && <div className={classes.controlsCategory}>
				<TypeControls track={track}/>
			</div>}
		</React.Fragment>;
	}
};

const TrackControls = withStyles(styles)(
	connect(['data'], actions)(Def)
);
export default TrackControls;