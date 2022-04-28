import React from 'react';
// import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { connect } from 'unistore/react';
import { actions } from '../store';
import formatData from '../util/formatData';

import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

/*
Material UI components
*/
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import MuiTable from 'mui-virtualized-table';

const styles = theme => ({
	root: {
		height: 'calc(100vh)',
		width: '99%',  // CAV: fixes the flickering scroll bars bug
		// table header
		'& .topRightGrid': {
			backgroundColor: theme.palette.background.default
		},
		'& .bottomLeftGrid': {
			backgroundColor: theme.palette.background.paper
		}
	},
	cell: {
		boxSizing: 'border-box',
		borderBottomColor: theme.palette.divider,

		'&.selected': {
			backgroundColor: theme.palette.action.selected
		}
	},

	hidden: {
		 width: 0,
		 display: 'none'
	}
});

const Def = class DataTable extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		data: PropTypes.object,
		setCurrentRow: PropTypes.func.isRequired,
		currentRow: PropTypes.number
	}

	// tableElement = null;
	// rowGroupElement = null

	// /*
	// extremely ugly hack until we replace MuiTable
	// */
	// getTableRef = ref => {
	// 	this.tableElement = ReactDOM.findDOMNode(ref);
	// }

	// componentDidUpdate() {
	// 	const rowGroupElements = this.tableElement.querySelectorAll('[role="rowgroup"]');
	// 	this.rowGroupElement = rowGroupElements[rowGroupElements.length - 1];
	// 	console.log('rowGroupElement', this.rowGroupElement);
	// }

	onCellClick = (column, data) => {
		console.log('cell click', column, data);
		const index = data[0];
		this.props.setCurrentRow(index);
	}

	render() {
		const {
			classes,
			currentRow
		} = this.props;

		/*
		todo: pre-process data only once, when we get new props
		*/
		const columns = this.props.data.fields.map((field, i) => {
			const formatFn = formatData(field);
			const index = i + 1;
			return {
				name: index,
				header: field.name,
				minWidth: 180,
				cell(row) {
					const val = row[index];
					return formatFn(val);
				}
			};
		});
		const data = this.props.data.rows.map((row, i) => [
			i,
			...row
		]);
		columns.unshift({
			name: 0,
			header: '#',
			width: 1,
			minWidth: 0
		});

		const selectedRow = data[currentRow];

		return <div className={classes.root}>
			<AutoSizer>
				{({ width, height }) =>
					<MuiTable
						data={data}
						columns={columns}
						width={width}
						maxHeight={height}
						rowHeight={28}
						includeHeaders={true}
						fixedRowCount={1}
						fixedColumnCount={1}
						onCellClick={this.onCellClick}
						ref={null && this.getTableRef}
						cellProps={(cellInfo, row) => ({
							className: classNames({
								selected: selectedRow === row,
								[classes.cell]: true,
								[classes.hidden]: cellInfo.name === -1
							})
						})}
					/>
				}
			</AutoSizer>
		</div>;
	}
};

const DataTable = withStyles(styles)(
	connect(['currentRow'], actions)(Def)
);
export default DataTable;
