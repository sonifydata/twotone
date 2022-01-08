/* global DEBUG, APP_TITLE, APP_WEBSITE_URL */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'unistore/react';
import { actions } from '../store';
import { createConfirmation } from 'react-confirm';
import logEvent from '../util/analytics';
import * as midi from '../engine/midiSetup'
/*
Theme/Style stuff
*/
import withStyles from '@material-ui/core/styles/withStyles';
import classNames from 'classnames'
/*
Material UI components
*/
import Typography from '@material-ui/core/Typography';
import IconButton from './IconButton';
import EditIcon from '@material-ui/icons/Edit';
import HelpIcon from '@material-ui/icons/Help';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import SettingsInputSvideoIcon from '@material-ui/icons/SettingsInputSvideo'; 
import SpreadsheetIcon from '@material-ui/icons/List';
import ConfirmationDialog from './ConfirmationDialog';

import twoToneLogo from '../images/two-tone-logo.svg';
import MidiPortSelector from './MidiPortSelector';

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
console.log(styles);

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
		midiPortSelector: PropTypes.func.isRequired
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

	handleChangeMidiPort =  () => {
			logEvent('midi', 'ports');
			this.setState({
				activeDialog: 'midi'
			});
	}

	render() {
		const {
			classes,
			dataSource,
			selectDataSource,
			selectMidiPort,
			onDataToggle,
			midiOutPort,
			midiOutPorts
		} = this.props;

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

		{ midi.webMidiCheck() ?
			<React.Fragment>
				<IconButton label="MIDI Settings" color="inherit" onClick={this.handleChangeMidiPort} >
					<SettingsInputSvideoIcon/>
				</IconButton>
				<MidiPortSelector/>
			</React.Fragment> : null
		}

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
		'dataSource','midiOutPort','midiOutPorts'
	], actions)(Def)
);
export default AppHeader;