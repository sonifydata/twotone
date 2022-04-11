import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';
import { createConfirmation } from 'react-confirm';
import logEvent from '../util/analytics';
import { sampleIdRegex } from '../util/regex';
import { MAX_DATA_FILE_SIZE, UPLOAD_ROW_LIMIT } from '../constants';
import isMobile from 'ismobilejs';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import WelcomeDialog from './WelcomeDialog';
import AssetSelectDialog from './AssetSelectDialog';
import SpreadsheetIcon from '@material-ui/icons/List';
// import AudioMenuItem from './AudioMenuItem';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from './IconButton';
import ConfirmationDialog from './ConfirmationDialog';
import CheckIcon from '@material-ui/icons/Check';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import * as dataLibrary from '../assets/dataLibrary';
import parseSpreadSheet from '../util/data';

const confirm = createConfirmation(ConfirmationDialog);

const fileAcceptTypes = [
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.oasis.opendocument.spreadsheet',
	'text/csv',
	'text/plain',
	'.ods',
	'.fods',
	'.txt',
	'.dsv',
	'.csv',
	'.xls',
	'.xlsx'
];
const fileAcceptTypeString = fileAcceptTypes.join(', ');

function assetSort(a, b) {
	const aTitle = a.metadata.title.toLowerCase();
	const bTitle = b.metadata.title.toLowerCase();
	if (aTitle !== bTitle) {
		return aTitle > bTitle ? 1 : -1;
	}

	if (a.permanent !== b.permanent) {
		return b.permanent - a.permanent;
	}

	return a.lastModified - b.lastModified;
}

const styles = theme => ({
	table: {
		display: 'flex',
		flexDirection: 'column',
		overflowY: 'scroll',
		flex: 2
	},
	tableSection: {
		display: 'block'
	},
	tr: {
		// todo: don't use a table or grid if only one column
		display: 'grid',
		gridTemplateColumns: '1fr auto',
		height: 'auto',
		'& > th, & > td': {
			minHeight: 32,
			padding: `2px 0`,
			textIndent: theme.spacing.unit / 2
		}
	},
	deleteCell: {
		maxHeight: 32,
		display: 'flex',
		alignItems: 'center'
	},
	bodyRow: {
		cursor: 'pointer'
	},
	spreadsheetIcon: {
		paddingRight: theme.spacing.unit,
		width: 32,
		height: 32
	},
	colDuration: {
		'& > svg': {
			width: 16,
			height: 16
		}
	},
	colTitle: {
		display: 'flex',
		alignItems: 'center',
		'& > svg, & > img': {
			float: 'left'
		}
	},
	dataTitle: {
		flex: 1,
		textOverflow: 'ellipsis'
	},
	em: {
		color: theme.palette.text.primary
	},
	dropZone: {
		display: 'flex',
		flexDirection: 'column'
	}
});

const uploadRequirements = [
	'File types supported: .xls, .xlsx, .csv, .ods',
	`Column headers are required to detect fields.`,
	`Maximum file size: ${Math.round(MAX_DATA_FILE_SIZE / (1024 * 1024) * 100) / 100}MB`,
	`Up to ${UPLOAD_ROW_LIMIT} rows of data`
].map((text, i) =>
	<ListItem key={i} dense>
		<ListItemIcon><CheckIcon /></ListItemIcon>
		<ListItemText primary={text} />
	</ListItem>);

const dropZoneContent = <React.Fragment>
	<Typography>
		{isMobile.any ?
			'Click to upload file' :
			'Drag and drop files here or click to browse'}
	</Typography>
	<List dense>{uploadRequirements}</List>
</React.Fragment>;

const Def = class DataSelectDialog extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		onClose: PropTypes.func.isRequired,
		config: PropTypes.object.isRequired,
		setConfig: PropTypes.func.isRequired,
		dataSourceId: PropTypes.string,
		setDataSourceId: PropTypes.func.isRequired
	}

	state = {
		loading: true,
		assets: []
	}

	getStarted = () => {
		this.props.setConfig({
			showWelcome: false
		});
	}

	handleClickListItem = selectedId => {
		this.setState({
			selectedId
		});
	}

	handleDoubleClickListItem = selectedId => {
		this.setState({
			selectedId
		}, this.onSelect);
	}

	deleteItem = async id => {
		const { dataSourceId } = this.props;
		const dataSourceDetails = await dataLibrary.getItemMetadata(id);
		if (!dataSourceDetails) {
			return;
		}

		const title = dataSourceDetails.metadata.title;
		const resetWarning = dataSourceId !== id ? '' :
			'This will reset your work. ';
		const confirmation = <React.Fragment>Are you sure you want to delete <em className={this.props.classes.em}>{title}</em>? {resetWarning}This cannot be undone.</React.Fragment>;
		confirm({ confirmation, options: {
			no: 'Cancel',
			yes: 'Delete Data Source'
		} }).then(() => {
			// clear project source if it matches
			if (dataSourceId === id) {
				this.props.setDataSourceId('');
			}

			// delete data source
			dataLibrary.deleteItem(id);

			const selectedId = this.state.selectedId === id ? '' : this.state.selectedId;
			this.setState({
				selectedId
			});
		});
	}

	onDelete = (id, evt) => {
		evt.stopPropagation();
		this.deleteItem(id);
	}

	setDataSourceId = id => {
		const matchSample = sampleIdRegex.exec(id);
		if (matchSample) {
			logEvent('datasource', 'sample', matchSample[1] || '');
		} else {
			logEvent('datasource', 'upload', id);
		}
		this.props.setDataSourceId(id);
	}

	onSelect = () => {
		const id = this.state.selectedId;
		const { dataSourceId } = this.props;
		if (!dataSourceId) {
			this.setDataSourceId(id);
		} else if (id !== dataSourceId) {
			const confirmation = <React.Fragment>Changing data source will reset your work. This cannot be undone. Are you sure you want to proceed?</React.Fragment>;
			confirm({ confirmation, options: {
				no: 'Cancel',
				yes: 'Change Data Source'
			} }).then(() => {
				this.setDataSourceId(id);
			});
		}
		this.props.onClose();
	}

	onUpload = newAssets => {
		if (newAssets.length) {
			const selectedId = newAssets[0].id;
			if (selectedId) {
				this.setState({ selectedId });
			}
		}
	}

	assetsUpdated = assets => {
		const sorted = [...assets].sort(assetSort);
		this.setState({
			loading: false,
			assets: sorted
		});
	}

	componentDidMount() {
		dataLibrary.subscribe(this.assetsUpdated);
		if (this.props.dataSourceId) {
			this.setState({
				selectedId: this.props.dataSourceId
			});
		}
	}

	componentWillUnmount() {
		dataLibrary.unsubscribe(this.assetsUpdated);
	}

	render() {
		const {
			classes,
			config,
			...props
		} = this.props;

		if (config.showWelcome) {
			return <WelcomeDialog onClose={this.getStarted}/>;
		}

		const {
			assets,
			selectedId,
			loading
		} = this.state;

		return <AssetSelectDialog
			id="data-select"
			{...props}
			assetLibrary={dataLibrary}
			getFileData={parseSpreadSheet}
			title="Select Data Source"
			type="spreadsheet"
			accept={fileAcceptTypeString}
			maxSize={MAX_DATA_FILE_SIZE}
			loading={loading}
			disabled={!selectedId}
			onSelect={this.onSelect}
			onUpload={this.onUpload}
			dropZone={<div className={classes.dropZone}>{dropZoneContent}</div>}
		>
			<Typography variant="subtitle1">Pick a data source by choosing a sample or uploading a spreadsheet of your own.</Typography>
			<Table className={classes.table}>
				<TableBody className={classNames(classes.tableSection, classes.tableBody)}>{assets.map(({id, ...assetData}) => {
					const { title } = assetData.metadata;
					const isNew = assetData.recentlyAdded ? ' NEW ▶︎ ' : '';
					const rowCount = assetData.metadata.rows || null;
					const selected = id === selectedId;
					const textColor = selected ?
						'secondary' :
						assetData.permanent ? 'textSecondary' : 'default';
					return <TableRow
						key={id}
						selected={selected}
						className={classNames(classes.tr, classes.bodyRow)}
						onClick={() => this.handleClickListItem(id)}
						onDoubleClick={() => this.handleDoubleClickListItem(id)}
					>
						<TableCell className={classes.colTitle} title={title}>
							<SpreadsheetIcon className={classes.spreadsheetIcon}/>{isNew}
							<Typography className={classes.dataTitle} color={textColor}>{title}</Typography>
							<Typography variant="caption">{rowCount} rows</Typography>
						</TableCell>
						<TableCell className={classes.deleteCell}>
							{!assetData.permanent ? <IconButton onClick={evt => this.onDelete(id, evt)} label="Delete">
								<DeleteIcon/>
							</IconButton> : null}
						</TableCell>
					</TableRow>;
				})}</TableBody>
			</Table>
		</AssetSelectDialog>;
	}
};

const DataSelectDialog = withStyles(styles)(
	connect(['config', 'dataSourceId'], actions)(Def)
);
export default DataSelectDialog;
