/* global DEBUG, APP_TITLE, APP_WEBSITE_URL */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'unistore/react';
import { actions, store } from '../store';
import { createConfirmation } from 'react-confirm';
import logEvent from '../util/analytics';
import * as midi from '../engine/midiSetup'
import MidiPortSelector from './MidiPortSelector';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import IconButton from './IconButton';
import HelpIcon from '@material-ui/icons/Help';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import SettingsMidiGo from '@material-ui/icons/SettingsInputSvideo';
import SettingsMidiNo from '@material-ui/icons/SettingsInputSvideoTwoTone';
import SpreadsheetIcon from '@material-ui/icons/List';
import ConfirmationDialog from './ConfirmationDialog';
import Dialog from '@material-ui/core/Dialog';
import {Slide, SvgIcon} from '@material-ui/core';
import FeedbackForm from './FeedbackForm';
import twoToneLogo from '../images/two-tone-logo.svg';
import formLogo from '../images/svg/FeedbackForm.svg';

const confirm = createConfirmation(ConfirmationDialog);

const styles = theme => ({
	title: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		overflow: 'hidden',
		'& > *': {
			display: 'flex'
		}
	},

	modalStyle: {
		position: 'absolute',
		boxShadow: theme.shadows[5],
		padding: theme.spacing.unit * 4,
		outline: 'none',
		overflow: 'hidden',
		minWidth: 150,
	},
	titleText: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		cursor: 'pointer'

	},
	logo: {
		height: 48,
		marginRight: theme.spacing.unit,
		cursor: 'pointer'
	},
	formIcon: {
		height: 36,
		marginRight: theme.spacing.unit,
		cursor: 'pointer'
	},
	'@media (max-height: 445px)': {
		title: {
			height: 36,
			minHeight: 36
		},
		logo: {
			height: 32
		}
	},
	'@media (max-width: 445px), (max-height: 445px)': {
		titleText: {
			fontSize: '1rem'
		}
	}
});

function Transition(props) {
	return <Slide direction="up" {...props} />;
}

const Def = class AppHeader extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		resetState: PropTypes.func.isRequired,
		setConfig: PropTypes.func.isRequired,
		selectDataSource: PropTypes.func.isRequired,
		dataSource: PropTypes.object,
		onDataToggle: PropTypes.func,
		midiOutPort: PropTypes.string,
		webMidiAvailable: PropTypes.bool.isRequired,
		midiOutPorts: PropTypes.object,
		midiPortSelector: PropTypes.func.isRequired,
		handleForm: PropTypes.func.isRequired,
		handleFormClose: PropTypes.func.isRequired,
		selectMidiPort: PropTypes.func.isRequired
	}

	componentDidMount() {
		midi.webMidiCheck().then(r => console.log('WebMidi check:'+r));
		store.setState( {formOpen: false});
	}

	componentDidUpdate() {

	}

	handleResetData = evt => {
		evt.stopPropagation();

		const confirmation = <React.Fragment>Are you sure you want to reset everything? This cannot be undone.</React.Fragment>;
		confirm({ confirmation, options: {
			no: 'Cancel',
			yes: 'Clear'
		} }).then(() => {
			this.props.resetState();
			return null;
		}).catch(() => {
			if (DEBUG) {
				console.log('Not clearing. Everything is fine.');
			}
		});
	}

	handleForm = evt => {
		evt.stopPropagation();
		store.setState({ formOpen: true, activeDialog: 'form' });
		console.log( 'Form request open...' + store.getState().formOpen);
	}

	handleHelp = () => {
		logEvent('tour', 'request');
		this.props.setConfig({
			showTour: true
		});
	}

	handleChangeMidiPort = () => {
		const status = midi.webMidiCheck();
		const r = store.getState().webMidiAvailable || status;
		if (r) {
			const {midiPortSelectToggle} = store.getState() || true;
			this.props.selectMidiPort();
			store.setState( {midiOutPorts: midi.getMidiOutputNames()});
			store.setState( {midiPortSelectToggle: !midiPortSelectToggle  })
		}
		//logEvent('midi', 'get');

	}

	render() {
		const {
			classes,
			dataSource,
			selectDataSource,
			onDataToggle
		} = this.props;

		const { webMidiAvailable, midiOutPort } = store.getState();
		const logo = <img src={twoToneLogo} alt={APP_TITLE} className={classes.logo}/>;
		const formIcon = <img src={formLogo} alt='send feedback form' className={classes.formIcon}/>;
		return <React.Fragment>
			<Typography className={classes.title} variant="h6" color="inherit" component="h1">
				{APP_WEBSITE_URL ? <a href={APP_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
					{logo}
				</a> : logo}
				<IconButton  label="Support and Feedback" aria-label="Open feedback form" color="inherit" onClick={this.handleForm}>
					{formIcon}
				</IconButton>

				<div style={{flex:0.1}}>⋯</div>

				{dataSource ?
					<React.Fragment>
						<div style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center' }}>
							<IconButton label="Select Data Source" color="inherit" onClick={selectDataSource} data-tour-id="upload-data">
								<SvgIcon>
									<path d="M0 0h24v24H0V0z" fill="none"/>
									<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z"/>
								</SvgIcon>
							</IconButton>
							<span className={classes.titleText} onClick={selectDataSource}>
								{dataSource.metadata.title}
							</span>
						</div>

						<Dialog
							fullWidth = {true}
							maxWidth = 'lg'
							TransitionComponent={Transition}
							open = { store.getState().formOpen || false }
							onClose={this.props.handleFormClose}
							aria-label='Feedback form full screen dialog'
						>
							<FeedbackForm/>
						</Dialog>

					</React.Fragment> : null
				}
			</Typography>

			<React.Fragment>
				<span data-tour-id="midiout-feature" >
					<IconButton  aria-label={(webMidiAvailable ? 'Open MIDI Settings' : 'WebMIDI is not available')}
								 label={ midiOutPort || (webMidiAvailable ? 'Open MIDI Settings' : 'WebMIDI is not available')  }
								 color="inherit" onClick={this.handleChangeMidiPort} >
						{ store.getState().webMidiAvailable ? <SettingsMidiGo/> : <SettingsMidiNo/> }
					</IconButton>
				</span>
				{ store.getState().midiPortSelectToggle ? <MidiPortSelector /> : null }

			</React.Fragment>

			<span className={classes.resetButton}>
				<IconButton label="Reset Project" color="inherit" onClick={this.handleResetData}>
					<DeleteIcon/>
				</IconButton>
			</span>
			<IconButton onClick={this.handleHelp} label="Help" color="inherit">
				<HelpIcon/>
			</IconButton>
			<IconButton onClick={onDataToggle} label="Show Data" color="inherit">
				<SpreadsheetIcon/>
			</IconButton>

		</React.Fragment>;
	}
};

const AppHeader = withStyles(styles)(
	connect([
		'dataSource','midiOutPort','midiOutPorts','webMidiAvailable'
	], actions)(Def)
);
export default AppHeader;
