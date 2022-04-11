import React from 'react';
import Dropzone from 'react-dropzone';
import { fileAccepted } from 'react-dropzone/dist/es/utils';
import isMobile from 'ismobilejs';
import classNames from 'classnames';
import reportError from '../util/reportError';
import { logMetricsEvent } from '../util/analytics';
import { fileExt as extRegex } from '../util/regex';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';

const styles = theme => ({
	dialog: {
		minWidth: '60%',
		maxWidth: '90%',
		// minHeight: '60%',
		maxHeight: '90%',
		margin: 0
	},
	'@media (max-width: 445px)': {
		dialog: {
			width: 400,
			maxWidth: '100%'
		}
	},
	'@media (max-width: 400px)': {
		dialog: {
			width: '100%'
		}
	},
	'@media (max-height: 445px)': {
		dialog: {
			height: 400,
			maxHeight: '100%'
		}
	},
	'@media (max-height: 400px)': {
		dialog: {
			height: '100%'
		}
	},
	dialogContent: {
		display: 'flex',
		flexDirection: 'column'
	},
	dialogActions: {
		flex: '0 0 0%'
	},
	importSection: {
		flexGrow: 0.4,
		flexShrink: 0,
		display: 'flex',
		flexDirection: 'row'
	},
	dropZone: {
		border: `2px dashed ${theme.palette.divider}`,
		cursor: 'pointer',
		minHeight: theme.spacing.unit * 4,
		padding: theme.spacing.unit,

		flex: 1,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',

		userSelect: 'none'
	},
	dropzoneAccepted: {
		border: `2px dashed ${theme.palette.primary.main}`
	},
	dropZoneRejected: {
		border: `2px dashed ${theme.palette.error.main}`
	}
});

const Def = class AssetSelectDialog extends React.Component {

	static propTypes = {
		classes: PropTypes.object.isRequired,
		assetLibrary: PropTypes.object.isRequired,
		getFileData: PropTypes.func.isRequired,
		open: PropTypes.bool.isRequired,
		disabled: PropTypes.bool,
		cancelable: PropTypes.bool,
		loading: PropTypes.bool.isRequired,
		title: PropTypes.string.isRequired,
		type: PropTypes.string,
		accept: PropTypes.string.isRequired,
		maxSize: PropTypes.number.isRequired,
		onClose: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
		onUpload: PropTypes.func.isRequired,
		id: PropTypes.string,
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		importContent: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		dropZone: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node,
			PropTypes.string
		])
	}

	static defaultProps = {
		open: false,
		title: 'Select Asset',
		accept: '*/*',
		maxSize: 0,
		dropZone: isMobile.any ?
			<Typography>Click to upload file</Typography> :
			<Typography>Drag and drop files here or click to browse</Typography>,
		cancelable: true,
		importContent: null
	}

	state = {
		processing: false,
		progress: 0,
		errorMessage: ''
	}

	onCloseSnackbar = () => {
		this.setState({
			errorMessage: ''
		});
	}

	onDrop = async (acceptedFiles, rejectedFiles) => {
		const { assetLibrary, getFileData } = this.props;
		const assets = [];
		const files = new Set();

		this.setState({
			processing: true,
			progress: 0,
			errorMessage: ''
		});

		let errorMessage = '';
		if (rejectedFiles.length) {
			const file = rejectedFiles[0];
			if (this.props.accept && !fileAccepted(file, this.props.accept)) {
				errorMessage = `Unsupported file type.`;
			} else if (file.size > this.props.maxSize) {
				errorMessage = `File is too big.`;
			} else {
				errorMessage = `Error importing file.`;
			}
			errorMessage += ` (${file.name})`;
		}

		for (let i = 0; i < acceptedFiles.length && !errorMessage; i++) {
			const file = acceptedFiles[i];
			try {
				let assetData = await getFileData(file);
				if (assetData) {
					if (!Array.isArray(assetData)) {
						assetData = [assetData];
					}
					for (let j = 0; j < assetData.length; j++) {
						const asset = assetData[j];
						const id = assetLibrary.getItemId(asset);
						const exists = await assetLibrary.getItemMetadata(id);
						if (!exists) {
							asset.imported = Date.now();
							await assetLibrary.add(asset);
							assets.push(asset);

							files.add(file);
						}
					}
					this.setState({
						progress: i / acceptedFiles.length
					});
				}
			} catch (e) {
				const errorText = e.code === 'empty' ?
					'No data found in file.' :
					'Error reading file.';
				errorMessage = `${errorText} (${file.name})`;
				reportError(e);
			}
		}

		files.forEach(file => {
			let importFileType = file.type;
			if (!importFileType) {
				const match = extRegex.exec(file.fileName || '');
				importFileType = match && match[1] || 'unknown';
			}
			logMetricsEvent('import', this.props.type || 'file', {
				importFileSize: file.size,
				importFileType
			});
		});

		if (!errorMessage && this.props.onUpload && assets.length) {
			this.props.onUpload(assets);
		}

		this.setState({
			processing: false,
			progress: 0,
			errorMessage
		});
	}

	render() {
		const {
			classes,
			open,
			loading,
			disabled,
			onClose,
			dropZone,
			children,
			importContent
		} = this.props;

		const {
			processing,
			progress,
			errorMessage
		} = this.state;

		const showProgress = processing || loading;

		const id = this.props.id || 'select-dialog';



		return <Dialog
			id={id}
			aria-labelledby={id + '-title'}
			open={open !== false}
			keepMounted={true}
			onClose={onClose}
			disableBackdropClick={false}
			classes={{
				paper: classes.dialog
			}}
		>
			{ showProgress ?
				<React.Fragment>
					<DialogTitle id={id + '-title'}>Loading...</DialogTitle>
					<DialogContent><LinearProgress
						variant={processing ? 'determinate' : 'indeterminate'}
						value={progress * 100}
					/></DialogContent>
				</React.Fragment>
				:
				<React.Fragment>
					<DialogTitle id={id + '-title'}>{this.props.title}</DialogTitle>
					<DialogContent classes={{root: classes.dialogContent}}>
						{children}
						<div className={classes.importSection}>
							<Dropzone
								accept={this.props.accept}
								onDrop={this.onDrop}
								onDragEnter={null}
								minSize={1}
								maxSize={this.props.maxSize || Infinity}
								multiple={true}
								id={id + '-dropzone'}
							>
								{({getRootProps, getInputProps, isDragAccept, isDragReject}) =>
									<div
										{...getRootProps()}
										className={classNames(classes.dropZone, {
											[classes.dropZoneRejected]: isDragReject,
											[classes.dropzoneAccepted]: isDragAccept
										})}
									>
										{dropZone}
										<input {...getInputProps()} />
									</div>
								}
							</Dropzone>
							{importContent}
						</div>
						<DialogActions className={classes.dialogActions}>
							{this.props.cancelable ? <Button onClick={onClose} color="primary">Cancel</Button> : null}
							{this.props.onSelect ? <Button onClick={this.props.onSelect} color="primary" disabled={!!disabled}>Select</Button> : null}
						</DialogActions>
					</DialogContent>
				</React.Fragment>
			}
			<Snackbar
				message={errorMessage}
				open={!!errorMessage}
				autoHideDuration={3000}
				onClose={this.onCloseSnackbar}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left'
				}}
			/>
		</Dialog>;
	}
};

const AssetSelectDialog = withStyles(styles)(Def);
export default AssetSelectDialog;
