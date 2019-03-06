import React from 'react';

// import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

import CanvasEnhancer from './CanvasEnhancer';
import RemountOnResize from './RemountOnResize';

// const styles = theme => ({
// 	root: {
// 	}
// });

const defaultColors = {
	main: 'darkred',
	selected: 'red',
	disabled: 'lightgray',
	disabledSelected: 'gray'
};

const Def = class BarChart extends React.Component {
	static propTypes = {
		// classes: PropTypes.object,
		className: PropTypes.string,
		data: PropTypes.object,
		rowIndex: PropTypes.number,
		fieldIndex: PropTypes.number,
		filterField: PropTypes.number,
		filterValues: PropTypes.arrayOf(PropTypes.string),
		colors: PropTypes.object,
		min: PropTypes.number,
		max: PropTypes.number
	}

	paint = ctx => {
		const {
			data,
			rowIndex,
			fieldIndex,
			min,
			max,
			filterValues,
			colors
		} = this.props;

		/*
		todo: handle missing data
		- no fieldIndex
		- no fields
		- no rows
		*/

		const hasFilterField = this.props.filterField >= 0 &&
			this.props.filterField < data.fields.length &&
			typeof this.props.filterField === 'number';
		const filterField = hasFilterField ?
			this.props.filterField :
			fieldIndex;
		const filterByString = hasFilterField && data.fields[filterField].type === 'string';

		const ratio = window.devicePixelRatio;
		const { width, height } = ctx.canvas;
		const { normalized, rows } = data;
		const rowCount = normalized.length;
		const horizSpacing = width / rowCount;
		const w = Math.max(horizSpacing - ratio, 1);

		const field = data.fields[fieldIndex];
		const zero = field.type === 'int' || field.type === 'float' ?
			Math.max(0, Math.min(1, -field.min * field.scale)) :
			0;
		const y = height * (1 - zero);
		const zeroHeight = zero < 0.5 ? -ratio : ratio;

		const {
			main,
			selected,
			disabled,
			disabledSelected
		} = { ...defaultColors, ...colors };

		/*
		todo: what if more rows than pixels
		*/
		for (let i = 0; i < rowCount; i++) {
			const val = normalized[i][fieldIndex];
			const filterVal = filterByString ?
				rows[i][filterField] :
				normalized[i][filterField];

			if (!isNaN(val)) {
				const passesFilter = filterByString ?
					!filterValues || !filterValues.length || filterValues.indexOf(filterVal) > -1 :
					filterVal >= min && filterVal <= max;

				if (passesFilter) {
					ctx.fillStyle = i === rowIndex ? selected : main;
				} else {
					ctx.fillStyle = i === rowIndex ? disabledSelected : disabled;
				}

				const x = i * horizSpacing;
				const valueHeight = height * (zero - val);
				const h = Math.abs(valueHeight) < ratio ? zeroHeight : valueHeight; // so bar is at least 1px high

				ctx.fillRect(x, y, w, h);
			}
		}
	}

	render() {

		/*
		todo: adjust height
		*/
		return <div className={this.props.className || ''}>
			<RemountOnResize>
				<CanvasEnhancer paint={this.paint}/>
			</RemountOnResize>
		</div>;
	}
};

// const BarChart = withStyles(styles)(Def);
const BarChart = Def;
export default BarChart;