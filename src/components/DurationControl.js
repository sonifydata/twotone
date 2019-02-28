import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'unistore/react';
import { actions } from '../store';
import formatTime from '../util/formatTime';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import InputSlider from './InputSlider';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import IconButton from './IconButton';
import TimeIcon from '@material-ui/icons/AvTimer';

const styles = theme => ({
	button: {
		color: theme.palette.primary.main
	},
	// icon: {
	// },
	popper: {
		zIndex: 10000,
		'& $arrow': {
			bottom: 0,
			left: 0,
			marginBottom: '-0.9em',
			width: '3em',
			height: '1em',
			'&::before': {
				borderWidth: '1em 1em 0 1em',
				borderColor: `${theme.palette.background.paper} transparent transparent transparent`
			}
		}
	},
	arrow: {
		position: 'absolute',
		fontSize: 7,
		width: '3em',
		height: '3em',
		'&::before': {
			content: '""',
			margin: 'auto',
			display: 'block',
			width: 0,
			height: 0,
			borderStyle: 'solid'
		}
	},
	paper: {
		maxWidth: 400,
		overflow: 'auto',
		padding: theme.spacing.unit * 2,
		fontSize: '0.8em'
	},
	formControl: {
		display: 'block',
		margin: theme.spacing.unit
	},
	slider: {
		width: 340
	},
	numberInput: {
		width: 80,
		fontSize: 14
	}
});

const Def = class DurationControl extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		classes: PropTypes.object,
		loading: PropTypes.bool,
		disabled: PropTypes.bool,
		data: PropTypes.object,
		rowDuration: PropTypes.number.isRequired,
		setRowDuration: PropTypes.func.isRequired
	}

	state = {
		open: false,
		anchorEl: null,
		arrowRef: null
	}

	anchorEl = null
	popper = null

	anchorRef = anchorEl => {
		this.anchorEl = anchorEl;
	}

	popperRef = popper => {
		this.popper = popper;
	}

	handleArrowRef = arrowRef => {
		this.setState({
			arrowRef
		});
	}

	onClick = () => {
		this.setState(state => ({
			open: !state.open
		}));
	}

	onClose = ({target}) => {
		// eslint-disable-next-line react/no-find-dom-node
		const popperEl = this.popper && ReactDOM.findDOMNode(this.popper);
		if (!target || !popperEl || !popperEl.contains(target)) {
			this.setState({
				open: false
			});
		}
	}

	setTempo = tempo => {
		this.props.setRowDuration(60 / Math.round(tempo));
	}

	setDuration = duration => {
		const data = this.props.data;
		const rowCount = data && data.rows && data.rows.length || 0;
		if (rowCount) {
			const rowDuration = duration / rowCount;
			this.props.setRowDuration(rowDuration);
		}
	}

	render() {
		const {
			classes,
			disabled,
			loading,
			rowDuration,
			setRowDuration,
			data
		} = this.props;

		const {
			open,
			arrowRef
		} = this.state;

		const rowCount = data && data.rows && data.rows.length || 1;
		const minDuration = Math.max(5, rowCount * 0.2);
		const maxDuration = Math.max(60, rowCount * 8);
		const minRowDuration = minDuration / rowCount;
		const maxRowDuration = maxDuration / rowCount;
		const minTempo = Math.floor(60 / maxRowDuration);
		const maxTempo = Math.ceil(60 / minRowDuration);

		return <ClickAwayListener onClickAway={this.onClose} mouseEvent="onClick">
			<span ref={this.anchorRef} data-tour-id="duration-control">
				<IconButton
					label="Adjust duration"
					className={classes.button}
					disabled={disabled || loading}
					onClick={this.onClick}
				>
					<TimeIcon className={classes.icon} ref={this.anchorRef}/>
				</IconButton>
				<Popper
					placement="top-end"
					className={classes.popper}
					disablePortal={false}
					open={open}
					anchorEl={this.anchorEl}
					ref={this.popperRef}
					modifiers={{
						flip: {
							enabled: true
						},
						preventOverflow: {
							enabled: true,
							boundariesElement: 'scrollParent'
						},
						arrow: {
							enabled: true,
							element: arrowRef
						}
					}}
				>
					<span className={classes.arrow} ref={this.handleArrowRef} />
					<Paper className={classes.paper}>
						<FormControl className={classes.formControl}>
							<Typography id="duration-label">Total Duration (s)</Typography>
							<InputSlider
								className={classes.slider}
								aria-labelledby="duration-label"
								min={minDuration}
								max={maxDuration}
								step={0.000001}
								value={rowDuration * rowCount}
								onChange={this.setDuration}
								format={value => formatTime(value)}
								classes={{
									input: classes.numberInput
								}}
							/>
						</FormControl>
						<FormControl className={classes.formControl}>
							<Typography id="row-duration-label">Row Duration (s)</Typography>
							<InputSlider
								className={classes.slider}
								aria-labelledby="row-duration-label"
								min={minRowDuration}
								max={maxRowDuration}
								step={0.000001}
								value={rowDuration}
								onChange={setRowDuration}
								format={value => formatTime(value, 1, 0.1)}
								classes={{
									input: classes.numberInput
								}}
							/>
						</FormControl>
						<FormControl className={classes.formControl}>
							<Typography id="tempo-label">Master Tempo (BPM)</Typography>
							<InputSlider
								className={classes.slider}
								aria-labelledby="tempo-label"
								min={minTempo}
								max={maxTempo}
								step={1}
								value={60 / rowDuration}
								format={value => Math.round(value)}
								onChange={this.setTempo}
								classes={{
									input: classes.numberInput
								}}
							/>
						</FormControl>
					</Paper>
				</Popper>
			</span>
		</ClickAwayListener>;
	}
};

const DurationControl = withStyles(styles)(
	connect([
		'loading',
		'disabled',
		'rowDuration',
		'data'
	], actions)(Def)
);
// const DurationControl = Def;
export default DurationControl;