import React from 'react';
import classNames from 'classnames';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import FormattedInput from './FormattedInput';
import Slider from  './Slider';

import num from '../util/num';

const identity = v => v;

const styles = theme => ({
	root: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	slider: {
		width: 300,
		marginRight: theme.spacing.unit
	},
	input: {
		width: 80
	},
	inputElement: {
		textAlign: 'right' //todo: RTL text
	}
});

const Def = class InputSlider extends React.Component {
	static propTypes = {
		classes: PropTypes.object,
		className: PropTypes.string,
		value: PropTypes.number.isRequired,
		min: PropTypes.number.isRequired,
		max: PropTypes.number.isRequired,
		step: PropTypes.number.isRequired,
		sliderMin: PropTypes.number,
		sliderMax: PropTypes.number,
		format: PropTypes.func,
		onChange: PropTypes.func,
		inputProps: PropTypes.object,
		disabled: PropTypes.bool.isRequired
	}

	static defaultProps = {
		min: 0,
		max: 100,
		step: 1,
		disabled: false
	}

	state = {
		value: 0
	}

	componentDidMount() {
		const { value } = this.props;
		this.setState({ value });
	}

	componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				value: this.props.value
			});
		}
	}

	handleSliderChange = value => {
		this.setState({ value }, () => {
			if (this.props.onChange) {
				this.props.onChange(value);
			}
		});
	}

	handleInputBlur = evt => {
		let value = parseFloat(evt.target.value);
		const { min, max, step } = this.props;
		if (isNaN(value) || value !== value) {
			return;
		}

		value = Math.max(min, Math.min(max, value));

		if (step > 0) {
			value = Math.round(value / step) * step;
		}

		if (this.props.onChange) {
			this.props.onChange(value);
		}
	}

	handleInputChange = value => {
		this.setState({ value });
	}

	render() {
		const {
			classes,
			className,
			format,
			value,
			inputProps,
			min,
			max,
			step,
			disabled,
			...restProps
		} = this.props;

		/*
		todo: handle RTL text direction, place text input to left
		https://github.com/airbnb/react-with-direction
		*/
		const sliderMin = num(this.props.sliderMin, min);
		const sliderMax = num(this.props.sliderMax, max);

		const sliderValue = Math.min(sliderMax, Math.max(sliderMin, value));

		const inputClasses = {
			input: classes.inputElement
		};
		if (inputProps && inputProps.classes) {
			const {input, ...restClasses} = inputProps.classes;
			inputClasses.input = classNames(classes.inputElement, input);
			Object.assign(inputClasses, restClasses);
		}

		return <div className={classNames(classes.root, className)}>
			<Slider
				className={classes.slider}
				min={min}
				max={max}
				step={step || 0.0000001}
				disabled={disabled}
				tipFormatter={format || identity}
				{...restProps}
				value={sliderValue}
				onChange={this.handleSliderChange}
			/>
			<FormattedInput
				className={classes.input}
				onChange={this.handleInputChange}
				onBlur={this.handleInputBlur}
				value={this.state.value}
				format={format}
				disabled={disabled}
				{...inputProps}
				classes={inputClasses}
			/>
		</div>;
	}
};

const InputSlider = withStyles(styles)(Def);
// const InputSlider = Def;
export default InputSlider;