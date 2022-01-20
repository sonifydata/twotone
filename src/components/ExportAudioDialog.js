import React from 'react'; // import classNames from 'classnames';
import { connect } from 'unistore/react';
import { actions } from '../store';
import ExportEngine from '../engine/ExportEngine';
import setStateFromEvent from '../util/setStateFromEvent';
import { saveAs } from 'file-saver';

/*
Material UI components
*/
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

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
	}
});

const canSave = !/(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
	'download' in document.createElementNS('http://www.w3.org/1999/xhtml', 'a');

const bitRates = [
	64,
	128,
	192,
	320
];
const SAMPLE_RATE = 44100;

// mac seems to use 1000, not 1024
const KB_DIVIDER = 1000;

const kbFormat = new Intl.NumberFormat(navigator.language, {
	minimumFractionDigits: 0,
	maximumFractionDigits: 0
});
const mbFormat = new Intl.NumberFormat(navigator.language, {
	minimumFractionDigits: 0,
	maximumFractionDigits: 1
});

function formatFileSize(bytes) {
	if (bytes < 1000) {
		return kbFormat.format(bytes) + 'B';
	}

	if (bytes < 1e6) {
		return kbFormat.format(bytes / KB_DIVIDER) + 'KB';
	}

	return mbFormat.format(bytes / (KB_DIVIDER * KB_DIVIDER)) + 'MB';
}

const Def = class ExportAudioDialog extends React.Component {
	static propTypes = {
		classes: PropTypes.object,
		config: PropTypes.object,
		open: PropTypes.bool,
		dataSource: PropTypes.object,
		onClose: PropTypes.func.isRequired,
		duration: PropTypes.number.isRequired,
		blockPlayback: PropTypes.func.isRequired,
		releasePlayback: PropTypes.func.isRequired,
		setConfig: PropTypes.func.isRequired
	}

	state = {
		exporting: false,
		format: 'mp3',
		bitRate: 128,
		progress: 0,
		error: '',
		downloadURL: ''
	}

	playBlockClaim = Symbol()

	engine = null

	onProgress = () => {
		const progress = this.engine && this.engine.progress || 0;
		this.setState({ progress });
	}

	exportAudio = async () => {
		this.props.blockPlayback(this.playBlockClaim);

		const { format, bitRate } = this.state;
		const engine = new ExportEngine(this.props, {
			format,
			bitRate,
			sampleRate: SAMPLE_RATE
		});
		this.engine = engine;

		this.props.setConfig({
			format,
			bitRate
		});

		engine.on('progress', this.onProgress);
		this.setState({
			error: '',
			exporting: true,
			progress: 0,
			downloadURL: ''
		});

		let error = '';
		let file = null;
		try {
			file = await engine.start();
		} catch (e) {
			console.error('Error exporting audio', e, e.stack);
			error = 'Failed to export audio';
		}

		engine.destroy();
		this.finish(error);

		if (file) {
			if (!error && canSave) {
				saveAs(file, (this.props.dataSource.metadata.title || 'data') + '.' + format);
				if (this.props.onClose) {
					this.props.onClose();
				}
			} else {
				const downloadURL = URL.createObjectURL(file);
				this.setState({
					downloadURL
				});
			}
		}
	}

	finish = error => {
		if (this.engine) {
			this.engine.destroy();
		}

		this.engine = null;
		this.props.releasePlayback(this.playBlockClaim);
		this.setState({
			error: typeof error === 'string' && error ? error : '',
			progress: 0,
			exporting: false
		});
	}

	cancel = () => {
		if (this.state.exporting) {
			this.finish();
		} else if (this.props.onClose) {
			this.props.onClose();
		}
	}

	handleChangeValue = setStateFromEvent(this)

	componentDidMount() {
		const { config } = this.props;
		const { bitRate, format } = config;
		if (bitRate && format) {
			this.setState({
				bitRate,
				format
			});
		}
	}

	componentWillUnmount() {
		this.finish();
	}

	render() {
		const {
			classes,
			duration,
			open
		} = this.props;

		const {
			exporting,
			error,
			progress,
			format,
			bitRate,
			downloadURL
		} = this.state;

		const fileSize = format === 'wav' ?
			4 * SAMPLE_RATE * duration : // 16 bits per sample, 2 channels
			duration * bitRate * 1024 / 8;

		const content = exporting ?
			<div>
				<DialogContentText id="export-audio-dialog-description">
					Exporting project to audio file
				</DialogContentText>
				<LinearProgress
					variant="determinate"
					value={progress * 100}
				/>
			</div> :
			<div>
				<DialogContentText id="export-audio-dialog-description">
					Export project to audio file
				</DialogContentText>
				{error && <DialogContentText variant="subtitle1" color="error">{error}</DialogContentText>}
				<div>
					<FormControl className={classes.formControl}>
						<InputLabel htmlFor="export-format">Format</InputLabel>
						<Select
							value={format}
							onChange={this.handleChangeValue}
							name="format"
							input={<Input id="export-format" />}
						>
							<MenuItem value="mp3">MP3</MenuItem>
							<MenuItem value="wav">Waveform (PCM)</MenuItem>
						</Select>
					</FormControl>
					{ format !== 'wav' && <FormControl className={classes.formControl}>
						<InputLabel htmlFor="export-bit-rate">Bit Rate</InputLabel>
						<Select
							value={bitRate}
							onChange={this.handleChangeValue}
							name="bitRate"
							input={<Input id="export-bit-rate" />}
						>
							{bitRates.map(bitRate => <MenuItem value={bitRate} key={bitRate}>{bitRate} kbps</MenuItem>)}
						</Select>
					</FormControl> }
				</div>
				<DialogContentText id="export-audio-file-size">
					Estimated file size: {formatFileSize(fileSize)}
				</DialogContentText>
				{downloadURL ?
					<DialogContentText id="export-download">
						Export Complete
						<Button
							key="download"
							color="secondary"
							target="_blank"
							variant="contained"
							rel="noopener noreferrer"
							href={downloadURL}>
							Open
						</Button>
					</DialogContentText> :
					null
				}
			</div>;

		return <Dialog
			open={open !== false}
			onClose={this.close}
			keepMounted={true}
			disableBackdropClick={exporting}
			classes={{
				paper: classes.dialog
			}}
			aria-labelledby="export-audio-dialog-title"
			aria-describedby="export-audio-dialog-description"
		>
			<DialogTitle id="export-audio-dialog-title">Export Audio</DialogTitle>
			<DialogContent>
				{content}
			</DialogContent>
			<DialogActions>
				<Button onClick={this.cancel} color="secondary">
					Cancel
				</Button>
				<Button onClick={this.exportAudio} color="secondary"  disabled={exporting}>
					Export
				</Button>
			</DialogActions>
		</Dialog>;
	}
};

const ExportAudioDialog = withStyles(styles)(
	connect([
		'data',
		'tracks',
		'config',
		'rowDuration',
		'duration',
		'dataSource',
		'speechTitle',
		'speechTitleEnabled',
		'speechLanguage',
		'speechGender',
		'speechVoiceId'
	], actions)(Def)
);
// const ExportAudioDialog = Def;
export default ExportAudioDialog;
