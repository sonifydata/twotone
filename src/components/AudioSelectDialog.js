import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'unistore/react';
import { actions } from '../store';
import { createConfirmation } from 'react-confirm';
import logEvent from '../util/analytics';
import { sampleIdRegex } from '../util/regex';
import loadMediaRecorder from '../util/loadMediaRecorder';
import isMobile from 'ismobilejs';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AssetSelectDialog from './AssetSelectDialog';
import TimeIcon from '@material-ui/icons/AccessTime';
import AlbumCover from './AlbumCover';
// import AudioMenuItem from './AudioMenuItem';
import ConfirmationDialog from './ConfirmationDialog';
import DeleteIcon from '@material-ui/icons/Delete';

import RecordAudioDialog from './RecordAudioDialog';
import MicIcon from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import IconButton from './IconButton';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import * as audioLibrary from '../assets/audioLibrary';
import getAudioMetadata from '../util/metadata';
import { MAX_AUDIO_FILE_SIZE } from '../constants';
import formatTime from '../util/formatTime';
import { extensions, formats } from '../util/media/audioFormats';

const confirm = createConfirmation(ConfirmationDialog);

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
		flexDirection: 'column'
	},
	tableSection: {
		display: 'block'
	},
	tableHead: {
		'& > tr > th': {
			fontWeight: 'bold',
			color: theme.palette.text.primary
		}
	},
	tableBody: {
		overflowY: 'scroll',
		flex: 1
	},
	tr: {
		display: 'grid',
		gridTemplateColumns: '42fr 60px 32fr 26fr 48px',
		height: 36,
		alignItems: 'center',
		'& > th, & > td': {
			display: 'flex',
			minWidth: 0,
			alignItems: 'center',
			height: 32,
			padding: `2px ${theme.spacing.unit}px`,

			'& > p': {
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
				overflow: 'hidden'
			}
		},
		'& > $colTitle': {
			paddingLeft: 0
		}
	},
	textCell: {
		textAlign: 'left'
	},
	bodyRow: {
		cursor: 'pointer'
	},
	colDuration: {
		'& > svg': {
			width: 16,
			height: 16
		}
	},
	colDelete: {
		justifyContent: 'center'
	},
	colTitle: {
		'& > p:not(:first-child)': {
			paddingLeft: theme.spacing.unit
		}
	},
	recordAudio: {
		flex: 0.5,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		'& > *': {
			margin: theme.spacing.unit
		}
	},
	em: {
		color: theme.palette.text.primary
	},
	dropZone: {
		display: 'flex',
		flexDirection: 'column'
	}
});

const justExtensions = extensions.map(ext => ext.replace(/^(\.[a-z0-9]+).*/, '$1'));
const uniqueExtensions = Array.from(new Set([].concat(...justExtensions)));
const fileAcceptTypeString = [
	...formats,
	...uniqueExtensions
].join(', ');

const uploadRequirements = [
	`File types supported: ${extensions.join(', ')}`,
	`Maximum file size: ${Math.round(MAX_AUDIO_FILE_SIZE / (1024 * 1024) * 100) / 100}MB`
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

const Def = class AudioSelectDialog extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		onClose: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
		open: PropTypes.bool.isRequired,
		defaultSelectedId: PropTypes.string,
		blockPlayback: PropTypes.func.isRequired,
		releasePlayback: PropTypes.func.isRequired
	}

	playBlockClaim = Symbol()

	state = {
		loading: true,
		recording: false,
		assets: [],
		canRecordAudio: false
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

	onRecord = () => {
		this.setState({
			recording: true
		});
	}

	onStopRecord = () => {
		this.setState({
			recording: false
		});
	}

	onSelect = () => {
		const { selectedId } = this.state;
		if (selectedId && this.props.onSelect) {
			const matchSample = sampleIdRegex.exec(selectedId);
			if (matchSample) {
				logEvent('audiosource', 'sample', matchSample[1] || '');
			}
			this.props.onSelect(selectedId);
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

	deleteItem = async id => {
		const audioSourceDetails = await audioLibrary.getItemMetadata(id);
		if (!audioSourceDetails) {
			return;
		}

		const title = audioSourceDetails.metadata.title;

		const confirmation = <React.Fragment>Are you sure you want to delete <em className={this.props.classes.em}>{title}</em>? This cannot be undone.</React.Fragment>;
		confirm({ confirmation, options: {
			no: 'Cancel',
			yes: 'Delete'
		} }).then(() => {
			// delete data source
			audioLibrary.deleteItem(id);

			if (id === this.props.defaultSelectedId && this.props.onSelect) {
				this.props.onSelect('');
			}

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

	assetsUpdated = assets => {
		const sorted = [...assets].sort(assetSort);
		this.setState({
			loading: false,
			assets: sorted
		});
	}

	componentDidUpdate() {
		if (this.props.open) {
			this.props.blockPlayback(this.playBlockClaim);
		} else {
			this.props.releasePlayback(this.playBlockClaim);
		}
	}

	componentDidMount() {
		if (this.props.open) {
			this.props.blockPlayback(this.playBlockClaim);
		}

		loadMediaRecorder().then(mr => {
			this.setState({ canRecordAudio: !!mr });
		});

		audioLibrary.subscribe(this.assetsUpdated);
		if (this.props.defaultSelectedId) {
			this.setState({
				selectedId: this.props.defaultSelectedId
			});
		}
	}

	componentWillUnmount() {
		audioLibrary.unsubscribe(this.assetsUpdated);
		this.props.releasePlayback(this.playBlockClaim);
	}

	render() {
		const {
			assets,
			selectedId,
			loading,
			recording,
			canRecordAudio
		} = this.state;

		if (recording) {
			return <RecordAudioDialog onClose={this.onStopRecord}/>;
		}

		const {
			classes,
			...props
		} = this.props;

		const recordAudio = canRecordAudio ? <div className={classes.recordAudio}>
			<IconButton
				component={Fab}
				color="secondary"
				label="Record"
				onClick={this.onRecord}
			>
				<MicIcon />
			</IconButton>
		</div> : null;

		return <AssetSelectDialog
			{...props}
			assetLibrary={audioLibrary}
			getFileData={getAudioMetadata}
			title="Select Audio Source"
			accept={fileAcceptTypeString}
			type="audio"
			loading={loading}
			disabled={!selectedId}
			onSelect={this.onSelect}
			onUpload={this.onUpload}
			importContent={recordAudio}
			dropZone={<div className={classes.dropZone}>{dropZoneContent}</div>}
		>
			<Table className={classes.table}>
				<TableHead className={classNames(classes.tableSection, classes.tableHead)}>
					<TableRow className={classes.tr}>
						<TableCell className={classes.colTitle}><Typography>Name</Typography></TableCell>
						<TableCell align="right" className={classes.colDuration}><TimeIcon height={16}/></TableCell>
						<TableCell className={classes.colArtist}><Typography>Artist</Typography></TableCell>
						<TableCell className={classes.colAlbum}><Typography>Album</Typography></TableCell>
						<TableCell/>
					</TableRow>
				</TableHead>
				<TableBody className={classNames(classes.tableSection, classes.tableBody)}>{assets.map(({id, ...assetData}) => {
					const { title, duration, artist = '', album = '' } = assetData.metadata;
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
						<TableCell className={classNames(classes.textCell, classes.colTitle)} title={title}>
							<AlbumCover id={id}/>
							<Typography color={textColor}>{title}</Typography>
						</TableCell>
						<TableCell align="right" className={classes.colDuration}><Typography color={textColor}>{formatTime(duration, 2)}</Typography></TableCell>
						<TableCell className={classNames(classes.textCell, classes.colArtist)} title={artist}><Typography color={textColor}>{artist}</Typography></TableCell>
						<TableCell className={classNames(classes.textCell, classes.colAlbum)} title={album}><Typography color={textColor}>{album}</Typography></TableCell>
						{/* add genre? */}
						<TableCell className={classes.colDelete}>
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

const AudioSelectDialog = withStyles(styles)(
	connect([], actions)(Def)
);
export default AudioSelectDialog;