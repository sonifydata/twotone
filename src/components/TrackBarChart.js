import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

import BarChart from './BarChart';

const styles = () => ({
	root: {
		height: 80
	}
});

const Def = class TrackBarChart extends React.Component {
	static propTypes = {
		classes: PropTypes.object,
		theme: PropTypes.object,
		currentRow: PropTypes.number,
		disabled: PropTypes.bool
		// data: PropTypes.object,
		// fieldIndex: PropTypes.number,
		// min: PropTypes.number,
		// max: PropTypes.number
	}

	render() {
		const {
			classes,
			currentRow,
			theme,
			disabled,
			...props
		} = this.props;

		const { palette } = theme;
		const paletteType = palette.type;
		const disabledGrey = paletteType === 'dark' ? 600 : 300;

		const colors = disabled ? {
			main: palette.grey[500],
			selected: palette.grey[500],
			disabled: palette.grey[disabledGrey],
			disabledSelected: palette.grey[disabledGrey]
		} : {
			main: paletteType === 'dark' ?
				palette.primary.dark :
				palette.primary.light,
			selected: palette.secondary.main,
			disabled: palette.grey[disabledGrey],
			disabledSelected: palette.grey[500]
		};

		return <BarChart
			className={classes.root}
			rowIndex={currentRow}
			colors={colors}
			{...props}
		/>;
	}
};

// const TrackBarChart = withStyles(styles)(Def);
const TrackBarChart = withStyles(styles, { withTheme: true })(
	connect(['data', 'currentRow'], actions)(Def)
);
export default TrackBarChart;