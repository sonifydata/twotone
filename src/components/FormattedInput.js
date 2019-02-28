import React from 'react';

// import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';

// const styles = () => ({
// 	root: {
// 		pointerEvents: 'none'
// 	}
// });

const Def = class FormattedInput extends React.Component {
	static propTypes = {
		onChange: PropTypes.func,
		format: PropTypes.func,
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number
		])
	}

	state = {
		// value: '',
		// formattedValue: '',
		editing: false
	}

	input = null

	removeListeners = () => {
		if (this.input) {
			this.input.removeEventListener('focus', this.onFocusChange);
			this.input.removeEventListener('blur', this.onFocusChange);
		}
	}

	onRef = input => {
		this.removeListeners();
		this.input = input;
		if (this.input) {
			this.input.addEventListener('focus', this.onFocusChange);
			this.input.addEventListener('blur', this.onFocusChange);
		}


		const editing = input && input === document.activeElement;
		this.setState({ editing });
	}

	onFocusChange = () => {
		const editing = this.input && this.input === document.activeElement;
		this.setState({ editing });
	}

	componentWillUnmount() {
		this.removeListeners();
	}

	handleChange = e => {
		if (this.props.onChange) {
			this.props.onChange(e.target.value, e);
		}
		// this.setState({ value: e.target.value })
	}

	render() {
		const {
			format,
			value,
			...props
		} = this.props;

		return <Input
			{...props}
			inputRef={this.onRef}
			onChange={this.handleChange}
			value={this.state.editing || !format ? value : format(value)}
		/>;
	}
};

// const FormattedInput = withStyles(styles)(Def);
const FormattedInput = Def;
export default FormattedInput;