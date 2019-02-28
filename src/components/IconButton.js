import React from 'react';

// import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

// const styles = theme => ({
// 	root: {
// 	}
// });

const Def = class FancyIconButton extends React.Component {
	static propTypes = {
		classes: PropTypes.object,
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		onClick: PropTypes.func,
		component: PropTypes.func,
		label: PropTypes.string
	}

	state = {
		open: false
	}

	handleTooltipClose = () => {
		this.setState({ open: false });
	}

	handleTooltipOpen = () => {
		this.setState({ open: true });
	}

	onClick = event => {
		event.stopPropagation();
		if (this.props.onClick) {
			this.props.onClick(event);
		}
	}

	render() {
		const {
			// classes,
			children,
			component,
			label,
			...otherProps
		} = this.props;

		const C = component || IconButton;
		const buttonContent = <C aria-label={label || null} {...otherProps} onClick={this.onClick}>
			{children}
		</C>;

		if (!label) {
			return buttonContent;
		}

		return <Tooltip
			enterDelay={50}
			leaveDelay={300}
			onClose={this.handleTooltipClose}
			onOpen={this.handleTooltipOpen}
			open={this.state.open}
			placement="bottom"
			title={label}
		>
			<span>{buttonContent}</span>
		</Tooltip>;
	}
};

// const IB = withStyles(styles)(Def);
const FancyIconButton = Def;
export default FancyIconButton;