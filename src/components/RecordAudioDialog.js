import React from 'react'; // import classNames from 'classnames';
// import { connect } from 'unistore/react';
// import { actions } from '../store';
import * as audioLibrary from '../assets/audioLibrary';
import getAudioMetadata from '../util/metadata';
import setStateFromEvent from '../util/setStateFromEvent';
import loadMediaRecorder from '../util/loadMediaRecorder';

/*
Material UI components
*/
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';

import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import IconButton from './IconButton';

import ReactMic from 'react-mic-record/src';

const dateFormat = new Intl.DateTimeFormat(navigator.languages, {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric'
});

const styles = theme => ({
	dialog: {
		minWidth: '50%',
		maxWidth: '80%',
		minHeight: '40%',
		maxHeight: '80%'
	},
	formControl: {
		margin: theme.spacing.unit,
		'&:first-child': {
			marginLeft: 0
		}
	},
	recordControls: {
		display: 'flex',
		flexDirection: 'row',
		margin: `${theme.spacing.unit}px 0`
	},
	recordButtonSection: {
		minWidth: 120,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		'& > *': {
			margin: theme.spacing.unit
		}
	},
	audioElement: {
		width: '100%'
	}
});

const autoFileName = () => 'Recorded Audio ' + dateFormat.format(new Date());

let MediaRecorder = window.MediaRecorder;

const Def = class RecordAudioDialog extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		theme: PropTypes.object.isRequired,
		open: PropTypes.bool,
		onClose: PropTypes.func.isRequired
	}

	state = {
		devices: [],
		deviceId: '',
		loaded: false,
		recording: false,
		blob: null,
		blobURL: '',
		fileName: ''
	}

	reactMic = null
	audioElement = null

	onAudioRef = ref => {
		if (this.audioElement) {
			this.audioElement.onerror = null;
		}
		this.audioElement = ref;
		if (ref) {
			this.audioElement.onerror = () => {
				// console.error('audio element error', e);
				throw new Error('Error decoding recorded audio file');
			};
		}
	}

	startRecord = () => {
		if (!this.state.recording && this.reactMic) {
			const { deviceId } = this.state;
			this.reactMic.start({
				audio: {
					exact: {
						deviceId
					}
				}
			});
		}
	}

	stopRecord = () => {
		if (this.state.recording && this.reactMic) {
			this.reactMic.stop();
		}
	}

	onStartRecord = () => {
		this.setState({
			recording: true
		});
	}

	onStopRecord = result => {
		this.cleanBlobURL();
		const blobURL = window.URL.createObjectURL(result.blob);
		this.setState({
			recording: false,
			blob: result.blob,
			blobURL
		});
	}

	onSave = async () => {
		const { blob, fileName } = this.state;
		if (blob) {
			const name = fileName || autoFileName() + '.wav';
			const file = new File([blob], name, {
				type: blob.type
			});
			const asset = await getAudioMetadata(file);
			await audioLibrary.add(asset);
			this.props.onClose();
		}
	}

	cancel = () => {
		if (this.state.recording) {
			this.stopRecord();
		} else if (this.props.onClose) {
			this.props.onClose();
		}
	}

	gotDevices = allDevices => {
		const devices = allDevices.filter(device => device.kind === 'audioinput') || [];
		const deviceId = this.state.deviceId && devices.find(device => device.deviceId === this.state.deviceId) ?
			this.state.deviceId :
			devices.length ? devices[0].deviceId : '';
		this.setState({
			devices,
			deviceId
		});
	}

	updateDeviceList = () => {
		const promise = navigator.mediaDevices.enumerateDevices();
		promise.then(this.gotDevices);
		return promise;
	}

	handleChangeValue = setStateFromEvent(this)

	cleanBlobURL() {
		if (this.state.blobURL) {
			window.URL.revokeObjectURL(this.state.blobURL);
		}
	}

	componentDidMount() {
		/*
		todo: this may trigger a warning if it returns after
		this component has unmounted.
		*/
		Promise.all([
			loadMediaRecorder(),
			this.updateDeviceList()
		]).then(([mr]) => {
			MediaRecorder = mr;
			console.log({MediaRecorder});
			this.setState({
				loaded: true
			});
		});
		if (navigator.mediaDevices.addEventListener) {
			navigator.mediaDevices.addEventListener('devicechange', this.updateDeviceList);
		} else {
			// safari!!
			navigator.mediaDevices.ondevicechange = this.updateDeviceList;
		}
	}

	componentWillUnmount() {
		this.stopRecord();
		this.cleanBlobURL();

		if (navigator.mediaDevices.removeEventListener) {
			navigator.mediaDevices.removeEventListener('devicechange', this.updateDeviceList);
		} else {
			// safari!!
			navigator.mediaDevices.ondevicechange = null;
		}
	}

	render() {
		const {
			classes,
			theme,
			open
		} = this.props;

		const {
			recording,
			devices,
			deviceId,
			loaded,
			blob,
			blobURL
		} = this.state;

		const hasDevices = devices.length > 0;
		const disabled = !hasDevices || !loaded;

		return <Dialog
			open={open !== false}
			onClose={this.close}
			keepMounted={true}
			disableBackdropClick={recording}
			classes={{
				paper: classes.dialog
			}}
			aria-labelledby="record-audio-dialog-title"
			aria-describedby="record-audio-dialog-description"
		>
			<DialogTitle id="record-audio-dialog-title">Record Audio</DialogTitle>
			<DialogContent>
				{/*<DialogContentText id="record-audio-dialog-description">
					Record audio
				</DialogContentText>*/}
				<FormControl className={classes.formControl}>
					<InputLabel htmlFor="record-select-device" shrink={hasDevices && !!deviceId}>Microphone</InputLabel>
					<Select
						value={hasDevices ? deviceId : ''}
						onChange={this.handleChangeValue}
						name="deviceId"
						disabled={disabled}
						inputProps={{
							id: 'record-select-device',
							name: 'deviceId'
						}}
					>
						{hasDevices ?
							devices.map(({deviceId, label}, i) => <MenuItem key={deviceId} value={deviceId}>{label || 'Mic #' + (i + 1)}</MenuItem>) :
							<MenuItem value=""><em>None Available</em></MenuItem>
						}
					</Select>
					<TextField
						id="record-audio-name"
						label="Name"
						name="fileName"
						className={classes.textField}
						value={this.state.fileName}
						onChange={this.handleChangeValue}
						placeholder={autoFileName()}
						margin="normal"
						InputLabelProps={{
							shrink: true
						}}
					/>
				</FormControl>
				<div className={classes.recordControls}>
					<ReactMic
						width={400}
						mimeType="audio/wav"
						ref={ref => this.reactMic = ref}
						save={false} // set to true if you want to save
						className={classes.mic} // provide css class name
						onStartMic={this.updateDeviceList}
						onStart={this.onStartRecord}
						onStop={this.onStopRecord} // callback to execute when audio stops recording
						strokeColor={theme.palette.secondary.main} // sound wave color
						backgroundColor={theme.palette.background.default} // background color
						keepMicOpen={true}
					/>
					{recording ?
						<div className={classes.recordButtonSection}>
							<IconButton
								component={Fab}
								color="secondary"
								label="Stop"
								onClick={this.stopRecord}
							>
								<StopIcon />
							</IconButton>
						</div> :
						<div className={classes.recordButtonSection}>
							<IconButton
								component={Fab}
								color="secondary"
								label="Record"
								onClick={this.startRecord}
								disabled={disabled}
							>
								<MicIcon />
							</IconButton>
						</div>
					}
				</div>
				{!recording && blobURL ?
					<audio controls src={blobURL} className={classes.audioElement} ref={this.onAudioRef}/> :
					null}
				{/*error && <DialogContentText variant="subtitle1" color="error">{error}</DialogContentText>*/}
			</DialogContent>
			<DialogActions>
				<Button onClick={this.cancel} color="secondary">
					Cancel
				</Button>
				<Button onClick={this.onSave} color="secondary"  disabled={recording || !blob}>
					Save
				</Button>
			</DialogActions>
		</Dialog>;
	}
};

const RecordAudioDialog = withStyles(styles, {withTheme: true})(Def);
// const RecordAudioDialog = Def;
export default RecordAudioDialog;
