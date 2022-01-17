// deprecating the VUMeter.. CAV

import React from 'react';
import { connect } from 'unistore/react';
import liveEngine from '../engine/live';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

const styles = theme => ({
	root: {
		position: 'relative',
		height: theme.spacing.unit
	},
	meter: {
		height: '100%',
		position: 'absolute',
		left: 0,
		top: 0,

		'--width': 0,
		'--bgScale': 1,
		backgroundImage: 'linear-gradient(to left, red 1%, rgb(255, 255, 0) 16%, lime 45%, rgb(0, 136, 0) 100%)',
		backgroundSize: 'var(--bgScale) 100%',
		width: 'var(--width)'
	}
});

const MIN_DECIBELS = -50;
const MAX_DECIBELS = -1;
const DECIBELS_RANGE = MAX_DECIBELS - MIN_DECIBELS;
const SMOOTHING = 0.8;
const INV_SMOOTHING = 1 - SMOOTHING;

const Def = class VUMeter extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		paused: PropTypes.bool,
		backgroundColor: PropTypes.string
	}

	frameId = 0
	analyser = null
	parentElement = null
	meter = null
	previous = 0

	onRef = ref => {
		if (!ref) {
			return;
		}

		if (this.parentElement !== ref.parentElement) {
			this.parentElement = ref.parentElement;
			this.forceUpdate();
		}
		this.meter = ref.firstElementChild;
	}

	update = () => {
		const {
			analyser,
			sampleBuffer
		} = this;

		/*
		Best description I found for how to make a VU Meter from AnalyserNode
		https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode
		*/

		analyser.getByteTimeDomainData(sampleBuffer);

		// Compute peak instantaneous power over the interval.
		let peakInstantaneousPower = 0;
		for (let i = 0; i < sampleBuffer.length; i++) {
			const val = (sampleBuffer[i] - 128) / 128;
			const power = val * val;
			peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
		}
		const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);

		/*
		Ideally, smoothing values would be stored in state, but
		React is weird with animations like this
		*/
		const peak = Math.max(0, Math.min(1, (peakInstantaneousPowerDecibels - MIN_DECIBELS) / DECIBELS_RANGE));
		const width = peak * INV_SMOOTHING + this.previous * SMOOTHING;
		this.previous = width;
		if (this.meter) {
			this.meter.style.setProperty('--width', width * 100 + '%');
			this.meter.style.setProperty('--bgScale', 100 / (width > 0 ? width : 1) + '%');
		}

		cancelAnimationFrame(this.frameId);
		this.frameId = requestAnimationFrame(this.update);
	}

	componentDidMount() {
		const analyser = liveEngine.analyser;
		const sampleBuffer = new Uint8Array(analyser.frequencyBinCount);
		this.analyser = analyser;
		this.sampleBuffer = sampleBuffer;

		if (!this.props.paused) {
			this.update();
		}
	}

	componentDidUpdate() {
		cancelAnimationFrame(this.frameId);
		this.update();
	}

	componentWillUnmount() {
		cancelAnimationFrame(this.frameId);
	}

	render() {
		const {
			classes
		} = this.props;

		let backgroundColor = this.props.backgroundColor || '';
		let parent = this.parentElement;
		while (parent && (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)')) {
			const parentStyle = window.getComputedStyle(parent);
			backgroundColor = parentStyle.getPropertyValue('background-color');
			parent = parent.parentElement;
		}

		return <div className={classes.root} ref={this.onRef} style={{
			backgroundColor
		}}>
			<div className={classes.meter}/>
		</div>;
	}
};

const VUMeter = withStyles(styles)(
	connect(['paused'])(Def)
);

export default VUMeter;