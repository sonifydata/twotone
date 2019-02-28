import React from 'react';
import classNames from 'classnames';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

/*
Material UI stuff
*/
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';

const styles = (/*theme*/) => ({
	container: {
		// padding: `0 ${theme.spacing.unit * 2}px`
		'& .rc-slider-disabled': {
			backgroundColor: 'transparent'
		}
	}
});

const Handle = Slider.Handle;

function createSliderWithTooltip(Component) {
	return class HandleWrapper extends React.Component {
		static propTypes = {
			classes: PropTypes.object.isRequired,
			className: PropTypes.string,
			theme: PropTypes.object.isRequired,
			marks: PropTypes.object,
			tipFormatter: PropTypes.func,
			handleStyle: PropTypes.arrayOf(PropTypes.object),
			trackStyle: PropTypes.arrayOf(PropTypes.object),
			railStyle: PropTypes.object,
			tipProps: PropTypes.object,
			count: PropTypes.number,
			disabled: PropTypes.bool
		}

		static defaultProps = {
			tipFormatter: value => value,
			handleStyle: [{}],
			trackStyle: [{}],
			tipProps: {}
		}

		state = {
			visibles: {}
		}

		handleTooltipVisibleChange = (index, visible) => {
			this.setState((prevState) => {
				return {
					visibles: {
						...prevState.visibles,
						[index]: visible
					}
				};
			});
		}
		handleWithTooltip = ({ value, dragging, index, disabled, ...restProps }) => {
			const {
				tipFormatter,
				tipProps
			} = this.props;

			const {
				title = tipFormatter(value),
				placement = 'top',
				...restTooltipProps
			} = tipProps;

			// todo: replace prefixCls with className?
			// todo: override tooltipOpen to remove animation

			return (
				<Tooltip
					{...restTooltipProps}
					title={title}
					placement={placement}
					open={!disabled && (this.state.visibles[index] || dragging)}
					key={index}
				>
					<Handle
						{...restProps}
						value={value}
						onMouseEnter={() => this.handleTooltipVisibleChange(index, true)}
						onMouseLeave={() => this.handleTooltipVisibleChange(index, false)}
					/>
				</Tooltip>
			);
		}
		render() {
			const { classes, theme, className, ...otherProps } = this.props;
			const { disabled } = this.props;

			const handleStyle = this.props.handleStyle.map(style => Object.assign({
				backgroundColor: theme.palette.primary.main,
				border: 'none',
				width: 12,
				height: 12
			}, style, disabled ? {
				backgroundColor: theme.palette.grey[500]
			} : null));

			const trackStyle = this.props.trackStyle.map(style => Object.assign({
				backgroundColor: theme.palette.primary.main,
				height: 2
			}, style, disabled ? {
				backgroundColor: theme.palette.action.disabled
			} : null));

			const railStyle = Object.assign({
				height: 2
			}, this.props.railStyle, disabled ? {
				backgroundColor: theme.palette.action.disabledBackground
			} : null);

			const style = {};
			if (this.props.marks) {
				style.marginBottom = 32;
			}

			const rangeCount = this.props.count ||
				Component.defaultProps.count || 0;
			const handleCount = rangeCount + 1;

			for (let i = handleStyle.length; i < handleCount; i++) {
				handleStyle[i] = handleStyle[i - 1];
			}

			const props = {
				...otherProps,
				style,
				trackStyle,
				railStyle,
				handleStyle
			};
			return <div className={classNames(classes.container, className)}>
				<Component
					{...props}
					handle={this.handleWithTooltip}
				/>
			</div>;
		}
	};
}

const Def = withStyles(styles, { withTheme: true })(createSliderWithTooltip(Slider));
export default Def;

const Range = withStyles(styles, { withTheme: true })(createSliderWithTooltip(Slider.Range));
export { Range };