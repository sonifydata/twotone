import React from 'react';
import PropTypes from 'prop-types';

/*
Borrowed from
https://gist.github.com/JobLeonard/987731e86b473d42cd1885e70eed616a
and modified
*/
const Def = class CanvasEnhancer extends React.Component {
	static propTypes = {
		paint: PropTypes.func.isRequired,
		clear: PropTypes.bool,
		loop: PropTypes.bool,
		className: PropTypes.string,
		style: PropTypes.object
	}

	static defaultProps = {
		clear: true
	}

	state = {
		width: 0,
		height: 0,
		ratio: window.devicePixelRatio
	}

	canvas = null
	view = null
	frameId = 0

	onCanvasRef = ref => {
		this.canvas = ref;
	}

	onViewRef = ref => {
		this.view = ref;
		this.resize();
	}

	// Make sure we get a sharp canvas on Retina displays
	// as well as adjust the canvas on zoomed browsers
	// Does NOT scale; painter functions decide how to handle
	// window.devicePixelRatio on a case-by-case basis
	resize = () => {
		const view = this.view && this.view.parentElement;
		if (!view) {
			return;
		}

		const ratio = window.devicePixelRatio || 1;
		const width = Math.round(view.clientWidth * ratio);
		const height = Math.round(view.clientHeight * ratio);
		if (this.state.width !== width || this.state.height !== height || this.state.ratio !== ratio) {
			this.setState({ width, height, ratio });
		}
	}

	componentDidUpdate(prevProps) {
		this.resize();
		if (!prevProps.loop) {
			this.draw();
		}
	}

	componentWillUnmount() {
		cancelAnimationFrame(this.frameId);
		clearTimeout(this.timeout);
	}

	// Relies on a ref to a DOM element, so only call
	// when canvas element has been rendered!
	draw = () => {
		if (this.state) {
			const { width, height, ratio } = this.state;
			const canvas = this.canvas;
			const context = canvas.getContext('2d');

			// store width, height and ratio in context for paint functions
			context.width = width;
			context.height = height;
			context.pixelRatio = ratio;

			// should we clear the canvas every redraw?
			if (this.props.clear) {
				context.clearRect(0, 0, canvas.width, canvas.height);
			}

			this.props.paint(context);
		}

		// is the provided paint function an animation? (not entirely sure about this API)
		if (this.props.loop) {
			this.frameId = requestAnimationFrame(this.draw);
		}
	}

	render() {
		// The way canvas interacts with CSS layouting is a bit buggy
		// and inconsistent across browsers. To make it dependent on
		// the layout of the parent container, we only render it after
		// mounting, after CSS layouting is done.
		const canvas = this.state ?
			<canvas
				ref={this.onCanvasRef}
				width={this.state.width}
				height={this.state.height}
				style={{
					width: this.state.width / this.state.ratio,
					height: this.state.height / this.state.ratio
				}} /> :
			null;

		return (
			<div
				ref={this.onViewRef}
				className={this.props.className}
				style={{
					display: 'contents',
					...this.props.style
				}}>
				{canvas}
			</div>
		);
	}
};

const CanvasEnhancer = Def;
export default CanvasEnhancer;
