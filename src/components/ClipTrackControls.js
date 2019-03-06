import React from 'react';
// import classNames from 'classnames';
import { connect } from 'unistore/react';
import { actions } from '../store';
import { getItemMetadata } from '../assets/audioLibrary';
import { DEFAULT_CLIP_PLAY_MODE } from '../constants';

/*
Material UI components
*/
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import WideSelect from './WideSelect';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import AlbumCover from './AlbumCover';
import EditIcon from '@material-ui/icons/Edit';
import AudioSelectDialog from './AudioSelectDialog';

const styles = theme => ({
	root: {
		display: 'flex',
		alignItems: 'center',
		margin: `${theme.spacing.unit}px 0`
	},
	title: {
		flex: 1,
		display: 'inline-flex',
		minWidth: 0,
		whiteSpace: 'nowrap',
		'& > span': {
			overflow: 'hidden',
			textOverflow: 'ellipsis'
		}
	},
	audioEditIcon: {
		display: 'none',
		width: 32,
		height: 32,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		color: 'white'
	},
	selectAudioButton: {
		position: 'relative',
		marginRight: theme.spacing.unit,
		width: 32,
		height: 32,
		cursor: 'pointer',
		'& > *': {
			position: 'absolute',
			top: 0,
			left: 0
		},
		'&:hover > $audioEditIcon': {
			display: 'initial'
		}/*,
		'&:hover > $albumCover': {
			// display: 'none'
		}*/
	},
	playMode: {
		minWidth: 75
	}
});


const Def = class ClipTrackControls extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		track: PropTypes.object.isRequired,
		data: PropTypes.object,
		setTrack: PropTypes.func.isRequired
	}

	state = {
		editing: false,
		audioId: '',
		clipName: ''
	}

	audioId = ''

	async loadClipMetadata(audioId) {
		if (audioId === this.audioId) {
			// Data for this id is already loading
			return;
		}
		this.audioId = audioId;

		const clipInfo = await getItemMetadata(audioId);
		if (!clipInfo) {
			this.setState({
				clipName: ''
			});
			return;
		}
		const { title, artist, album } = clipInfo.metadata;
		const clipName = [
			title || clipInfo.fileName,
			artist,
			album
		].filter(n => !!n).join(' - ');

		this.setState({ clipName });
	}

	static getDerivedStateFromProps(props, state) {
		const track = props.track || {};
		const audioId = track.config && track.config.clip && track.config.clip.audioId || '';
		if (audioId !== state.audioId) {
			return {
				clipName: '',
				audioId
			};
		}

		// No state update necessary
		return null;
	}

	componentDidMount() {
		const track = this.props.track || {};
		const audioId = track.config && track.config.clip && track.config.clip.audioId || '';
		this.loadClipMetadata(audioId);
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.clipName || prevState.audioId !== this.state.audioId) {
			const track = this.props.track || {};
			const audioId = track.config && track.config.clip && track.config.clip.audioId || '';
			this.loadClipMetadata(audioId);
		}
	}

	componentWillUnmount() {
		this.audioId = '';
	}

	closeSelectAudioDialog = () => {
		this.setState({
			editing: false
		});
	}

	selectAudio = evt => {
		evt.stopPropagation();
		this.setState({
			editing: true
		});
	}

	modifiedTrackConfig = (oldTrack, name, value) => {
		const oldConfig = oldTrack.config || {};
		const oldClipConfig = oldConfig.clip || {};

		const clip = {
			...oldClipConfig
		};
		clip[name] = value;

		const config = {
			...oldConfig,
			clip
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

	handleChangeAudioSource = audioId => {
		const { setTrack } = this.props;
		const oldTrack = this.props.track || {};
		const track = this.modifiedTrackConfig(oldTrack, 'audioId', audioId);
		setTrack(track, track.id);
	}

	render() {
		const {
			classes,
			track
		} = this.props;

		const config = track.config && track.config.clip || {};

		const { clipName } = this.state;

		/*
		todo:
		- WaveForm (given audio id)
		*/
		return <React.Fragment>
			<div className={classes.root}>
				<div className={classes.selectAudioButton} onClick={this.selectAudio}>
					<AlbumCover
						id={config.audioId || ''}
					/>
					<EditIcon className={classes.audioEditIcon}/>
				</div>
				<Typography className={classes.title} variant="subtitle1" onClick={this.selectAudio}>
					<span>{
						!config.audioId ?
							'Click to select an audio file' :
							clipName || '[audio file]'
					}</span>
				</Typography>
				<WideSelect
					label="Play mode"
					name="playbackMode"
					id={'track-playback-mode-' + track.id}
					value={config.playbackMode || DEFAULT_CLIP_PLAY_MODE}
					onChange={this.handleChangeConfig}
					inputProps={{
						name: 'playbackMode'
					}}
					classes={{
						root: classes.playMode
					}}
				>
					<MenuItem value="loop">Loop</MenuItem>
					<MenuItem value="active">Active sections</MenuItem>
					<MenuItem value="row">Once per row</MenuItem>
				</WideSelect>
			</div>
			{this.state.editing ? <AudioSelectDialog
				open={true}
				onClose={this.closeSelectAudioDialog}
				defaultSelectedId={config.audioId}
				onSelect={this.handleChangeAudioSource}
			/> : null}
		</React.Fragment>;
	}
};

const ClipTrackControls = withStyles(styles)(
	connect(['data'], actions)(Def)
);
export default ClipTrackControls;