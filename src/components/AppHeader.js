/* global DEBUG, APP_TITLE, APP_WEBSITE_URL */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'unistore/react';
import { actions, store } from '../store';
import { createConfirmation } from 'react-confirm';
import logEvent from '../util/analytics';
import * as midi from '../engine/midiSetup'
import MidiPortSelector from './MidiPortSelector';
/*
Theme/Style stuff
*/
import withStyles from '@material-ui/core/styles/withStyles';
/*
Material UI components
*/
import Typography from '@material-ui/core/Typography';
import IconButton from './IconButton';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import SettingsMidiGo from '@material-ui/icons/SettingsInputSvideo'; 
import SettingsMidiNo from '@material-ui/icons/SettingsInputSvideoTwoTone'; 
import SpreadsheetIcon from '@material-ui/icons/List';
import ConfirmationDialog from './ConfirmationDialog';

import twoToneLogo from '../images/two-tone-logo.svg';


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
	titleText: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		cursor: 'pointer'
	},
	logo: {
		height: 48,
		marginRight: theme.spacing.unit
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


const Def = class AppHeader extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		resetState: PropTypes.func.isRequired,
		setConfig: PropTypes.func.isRequired,
		selectDataSource: PropTypes.func.isRequired,
		dataSource: PropTypes.object,
		onDataToggle: PropTypes.func,
		midiOutPort: PropTypes.string,
		midiOutPorts: PropTypes.object,
		midiPortSelector: PropTypes.func.isRequired,
	}

	componentDidMount() {
		midi.webMidiCheck();
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
			onDataToggle,
		} = this.props;

		const { webMidiAvailable, midiOutPort } = store.getState();

		const logo = <img src={twoToneLogo} alt={APP_TITLE} className={classes.logo}/>;

		return <React.Fragment>
			<Typography className={classes.title} variant="h6" color="inherit" component="h1">
				{APP_WEBSITE_URL ? <a href={APP_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
					{logo}
				</a> : logo}
				{dataSource ?
					<React.Fragment>
						<span className={classes.titleText} onClick={selectDataSource}>
							{dataSource.metadata.title}
						</span>
						<IconButton label="Select Data Source" color="inherit" onClick={selectDataSource} data-tour-id="upload-data">
							<EditIcon/>
						</IconButton>
					</React.Fragment> : null
				}
			</Typography>

			<React.Fragment>
				<span data-tour-id="midiout-feature" >
					<IconButton  aria-label={(webMidiAvailable ? "Open MIDI Settings" : "WebMIDI is not available")} label={ midiOutPort || (webMidiAvailable ? "Open MIDI Settings" : "WebMIDI is not available")  }  color="inherit" onClick={this.handleChangeMidiPort} >
						{ (store.getState().webMidiAvailable) ? <SettingsMidiGo/> : <SettingsMidiNo/> }
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