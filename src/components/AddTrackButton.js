import React from 'react';
import classNames from 'classnames';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import AddIcon from '@material-ui/icons/Add';

import trackTypes from './util/trackTypes';

const actions = ['scale', 'clip'].map(key => ({
	icon: trackTypes[key].icon,
	name: trackTypes[key].name,
	key
}));

const styles = () => ({
	root: {
		pointerEvents: 'none'
	}
});

const Def = class AddTrackButton extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		classes: PropTypes.object,
		onClick: PropTypes.func
	}

	static defaultProps = {
	}

	state = {
		open: false
	}

	handleClick = type => () => {
		if (this.props.onClick) {
			this.props.onClick(type);
		}
		this.setState(state => ({
			open: !state.open
		}));
	}

	toggleOpen = () => {
		this.setState({
			open: !this.state.open
		});
	}

	handleOpen = () => {
		this.setState({
			open: true
		});
	}

	handleClose = () => {
		this.setState({
			open: false
		});
	}

	render() {
		const {
			classes,
			className
		} = this.props;

		const { open } = this.state;

		return <div className={classNames(classes.root, className)}>
			<SpeedDial
				ariaLabel="Create new track"
				className={''/*classes.speedDial*/}
				icon={<SpeedDialIcon openIcon={<AddIcon />} />}
				ButtonProps={{
					'data-tour-id': 'add-track'
				}}
				direction="up"
				onBlur={this.handleClose}
				onClick={this.toggleOpen}
				onClose={this.handleClose}
				onFocus={this.handleOpen}
				onMouseEnter={this.handleOpen}
				onMouseLeave={this.handleClose}
				open={open}
			>
				{actions.map(action =>
					<SpeedDialAction
						key={action.key}
						icon={<action.icon/>}
						tooltipTitle={action.name}
						onClick={this.handleClick(action.key)}
					/>
				)}
			</SpeedDial>
		</div>;
	}
};

const AddTrackButton = withStyles(styles)(Def);
// const AddTrackButton = Def;
export default AddTrackButton;