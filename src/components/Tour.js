/* global DEBUG, APP_TITLE */
import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';
import logEvent from '../util/analytics';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

import Joyride, { ACTIONS, EVENTS } from 'react-joyride';

const tourStepDefaults = {
	disableBeacon: true
};

const tourSteps = [
	{
		title: 'Select Data',
		content: `Upload your own data or select one of the sample spreadsheets`,
		target: '[data-tour-id="upload-data"]'
	},

	{
		title: 'Audio Track',
		content: `${APP_TITLE} has automatically generated an audio track from your data set. You can change your track's data source or instrument.`,
		// target: '#track-0',
		target: '#track-0 [data-tour-id="track-control-header-0"]'
	},

	{
		title: 'Play Audio',
		content: 'Click the Play button to hear the sound generated from your data.',
		target: '#play-controls [data-tour-id="play-button"]'
	},

	// {
	// 	title: 'Speak Title',
	// 	content: 'Enter a title to automatically generate text-to-speech, toggle to turn speech on or off. Customize settings for language, gender and voice options.',
	// 	target: '[data-tour-id="speech-title"]'
	// },

	{
		title: 'Add Audio Track',
		content: 'Generate another audio track automatically from your data set or upload an audio track of your own.',
		target: '[data-tour-id="add-track"]'
	},

	{
		title: 'Adjust Duration',
		content: 'Adjust your total duration, row duration, or tempo (BPM) to speed up or slow down your composition.',
		target: '[data-tour-id="duration-control"]'
	},

	{
		title: 'Advanced Features',
		content: 'Adjust the volume of your audio track, filter it by data columns or by value, change the key of your musical scale, or adjust octave, scale range and tempo to create an arpeggio.',
		target: '[data-tour-id="track-advanced"]'
	},

	{
		title: 'Export Audio',
		content: 'Export your project to an audio file in MP3 or Waveform (PCM) format.',
		target: '[data-tour-id="export-audio"]'
	},
	{
		title: 'Midi Output',
		content: 'If midi is available in your browser, select which midi output to use. Now choose Midi Out from the track instrument selector and that track will send data as Midi notes',
		target: '[data-tour-id="midiout-feature"]'
	}

].map(step => ({
	...tourStepDefaults,
	...step
}));
const lastStepIndex = tourSteps.length - 1;

const observerConfig = {
	childList: true,
	subtree: true
};

const tipLocale = {
	last: 'Got it!'
};

const styles = () => ({
});

const Def = class Tour extends React.Component {
	static propTypes = {
		// classes: PropTypes.object,
		theme: PropTypes.object.isRequired,
		setConfig: PropTypes.func.isRequired,
		config: PropTypes.object.isRequired,
		run: PropTypes.bool
	}

	state = {
		stepIndex: 0,
		run: true
	}

	observer = null

	joyride = null

	handleJoyrideCallback = tour => {
		const { action, index, type } = tour;

		if (type === EVENTS.TOUR_END || action === EVENTS.TOOLTIP_CLOSE || type === EVENTS.STEP_AFTER && index >= lastStepIndex) {

			logEvent('tour', index >= lastStepIndex ? 'complete' : 'skip', index);

			// Update user preferences with completed tour flag
			this.setState({
				stepIndex: 0,
				run: false
			});
			this.props.setConfig({
				showTour: false
			});
		} else if (type === EVENTS.STEP_AFTER) {
			// Since this is a controlled tour you'll need to update the state to advance the tour
			this.setState({
				stepIndex: index + (action === ACTIONS.PREV ? -1 : 1)
			});
		}
	}

	joyrideRef = ref => {
		this.joyride = ref;
	}


	redraw = () => {
		if (this.joyride) {
			this.joyride.forceUpdate();
		}
	}

	componentDidMount() {
		// todo: disconnect if disabled
		// todo: narrow the scope if we can
		this.observer = new MutationObserver(this.redraw);
		this.observer.observe(document.body, observerConfig);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.config.showTour !== this.props.config.showTour && this.props.config.showTour) {
			// automatically rewind
			this.setState({
				stepIndex: 0
			});
		}
	}

	componentWillUnmount() {
		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	render() {
		const {
			theme
		} = this.props;

		const run = this.props.run !== false && this.state.run;

		const { stepIndex } = this.state;

		const tipStyles = {
			options: {
				primaryColor: theme.palette.primary.main,
				textColor: theme.palette.text.primary,
				arrowColor: theme.palette.background.paper,
				backgroundColor: theme.palette.background.paper,
				overlayColor: 'rgba(0, 0, 0, 0.5)',
				zIndex: 9000 // need to be in front of dialogs
			},
			tooltip: {
				padding: theme.spacing.unit * 2.5
			},
			tooltipContainer: {
				textAlign: 'left'
			},
			tooltipContent: {
				padding: `${theme.spacing.unit}px 0`
			},
			buttonClose: {
				padding: theme.spacing.unit * 2.5
			},
			buttonSkip: {
				paddingLeft: 0
			}
		};

		return <Joyride
			showSkipButton
			continuous
			disableScrollParentFix
			debug={DEBUG}
			run={run}
			steps={tourSteps}
			stepIndex={stepIndex}
			callback={this.handleJoyrideCallback}
			styles={tipStyles}
			locale={tipLocale}
			floaterProps={{
				disableAnimation: true
			}}
			ref={this.joyrideRef}
		/>;
	}
};

const Tour = withStyles(styles, { withTheme: true })(
	connect(['config'], actions)(Def)
);
export default Tour;
