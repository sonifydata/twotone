import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'unistore/react';
import { actions , store } from '../store';
import formatData from '../util/formatData';
import formatTime from '../util/formatTime';

/*
Material UI components
*/
import withStyles from '@material-ui/core/styles/withStyles';
import Slider from './Slider';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import Play from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import IconButton from './IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';

import ExportAudioButton from './ExportAudioButton';
import DurationControl from './DurationControl';

const styles = theme => ({
	root: {
		display: 'flex',
		alignItems: 'center',
		position: 'relative',
		padding: `${theme.spacing.unit}px 0`,
		maxWidth: '100%'
	},
	offscreen: {
		position: 'absolute',
		left: '-101vw',
		top: 0,
		width: 1,
		height: 1,
		overflow: 'hidden',
		border: 0
	},
	playPauseButton: {
		margin: theme.spacing.unit
	},
	main: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden'
	},
	progress: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: -5,
		zIndex: 1300
	},
	progressSlider: {
		cursor: 'pointer'
	},
	additional: {
		display: 'flex',
		alignItems: 'center'
	},
	meta: {
		flex: 1,
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		overflow: 'hidden'
	},
	loading: {
		color: theme.palette.grey[500]
	},
	time: {
		marginRight: theme.spacing.unit * 3,
		whiteSpace: 'nowrap'
	},
	skip: {},
	rewind: {},
	'@media (max-width: 494px)': {
		skip: {
			display: 'none'
		}
	},
	'@media (max-width: 440px)': {
		rewind: {
			display: 'none'
		},
		meta: {
			display: 'none'
		}
	}
});

const labelTypes = ['string', 'datetime'];
const controlElementTypes = [HTMLInputElement, HTMLButtonElement];

const Def = class PlayControls extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		disabled: PropTypes.bool,
		loading: PropTypes.bool,
		audioLoaded: PropTypes.bool,
		paused: PropTypes.bool,
		pause: PropTypes.func.isRequired,
		play: PropTypes.func.isRequired,
		setCurrentTime: PropTypes.func.isRequired,
		setCurrentRow: PropTypes.func.isRequired,
		duration: PropTypes.number,
		currentTime: PropTypes.number,
		currentRow: PropTypes.number,
		data: PropTypes.object
	}

	rewindBeginning = () => {
		this.props.setCurrentTime(0);
	}

	skipPrevious = () => {
		// go back to current row if we're far enough in
		const currentRow = Math.floor(this.props.currentRow - 0.3);
		this.props.setCurrentRow(currentRow);
	}

	skipNext = () => {
		this.props.setCurrentRow(this.props.currentRow + 1);
	}

	keyPress = evt => {
		if (evt.keyCode === 32 && store.getState().activeDialog === '' && !controlElementTypes.find(E => evt.target instanceof E)) {
			const { pause, play, paused } = this.props;
			if (paused) {
				play();
			} else {
				pause();
			}
		}
	}

	componentDidMount() {
		document.addEventListener('keypress', this.keyPress, false);
	}

	componentWillUnmount() {
		document.removeEventListener('keypress', this.keyPress, false);
	}

	render() {
		const {
			classes,
			disabled,
			loading,
			audioLoaded,
			paused,
			pause,
			play,
			setCurrentTime,
			duration,
			currentTime,
			currentRow,
			data
		} = this.props;


		const roundedDuration = Math.round(duration || 0);
		const minTimeUnits = roundedDuration < 3600 ? 2 : 3;

		// todo: set this once when props change
		const hasDataLabel = currentRow !== undefined && !!data && !!data.fields;
		let labelFieldIndexes = hasDataLabel && data.fields
			.map((field, index) => index)
			.filter(index => labelTypes.indexOf(data.fields[index].type) >= 0);

		const useNumeric = labelFieldIndexes && !labelFieldIndexes.length;
		if (useNumeric) {
			labelFieldIndexes = Object.keys(data.fields);
		}

		const row = hasDataLabel && data.rows[currentRow];
		const labelValues = hasDataLabel && row && labelFieldIndexes
			.map(index => formatData(data.fields[index])(row[index]))
			.filter(val => !!val);

		const maxLength = useNumeric ? 1 : 5;
		if (labelValues) {
			labelValues.length = Math.min(labelValues.length, maxLength);
		}

		let dataLabel = hasDataLabel && '#' + (currentRow + 1);
		if (dataLabel && labelValues && labelValues.length) {
			dataLabel += ': ' + labelValues.join(', ');
		}

		return <div className={classes.root} id="play-controls">
			<h2 id="player-a11y-header" className={classes.offscreen} aria-describedby="currently-playing-title">Player controls</h2>
			<div className={classes.progress}>
				<Slider
					className={classes.progressSlider}
					min={0}
					max={duration || 1}
					step={0.000001}
					value={currentTime}
					tipFormatter={v => formatTime(v, minTimeUnits)}
					onChange={setCurrentTime}
					disabled={disabled}
				/>
			</div>
			<div className={classes.playPauseButton} data-tour-id="play-button">
				{ !loading || audioLoaded ?
					paused || disabled ?
						<IconButton
							component={Fab}
							color="primary"
							disabled={disabled || !audioLoaded}
							label="Play"
							onClick={play}
						>
							<Play />
						</IconButton> :
						<IconButton
							component={Fab}
							color="primary"
							label="Pause"
							onClick={pause}
						>
							<Pause />
						</IconButton> :
					<CircularProgress size={56}  classes={{colorPrimary: classes.loading}}/>
				}
			</div>
			<div className={classes.main}>
				<div className={classes.additional}>
					<IconButton disabled={disabled} className={classes.rewind} label="Rewind" onClick={this.rewindBeginning}>
						<SkipPrevious />
					</IconButton>
					<IconButton disabled={disabled} className={classes.skip} label="Skip Previous Row" onClick={this.skipPrevious}>
						<NavigateBefore />
					</IconButton>
					<IconButton disabled={disabled} className={classes.skip} label="Skip Next Row" onClick={this.skipNext}>
						<NavigateNext />
					</IconButton>
					<Typography className={classes.meta}>{dataLabel}</Typography>
					<DurationControl/>
					<Typography className={classes.time}>{duration ? formatTime(currentTime, minTimeUnits) : '-'} / {duration ? formatTime(duration, minTimeUnits) : '-'}</Typography>
				</div>
			</div>
			<ExportAudioButton/>
		</div>;
	}
};

const PlayControls = withStyles(styles)(
	connect(['duration', 'currentTime', 'currentRow', 'paused', 'audioLoaded', 'data'], actions)(Def)
);
export default PlayControls;
