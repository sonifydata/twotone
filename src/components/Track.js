import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'unistore/react';
import { actions } from '../store';
import { createConfirmation } from 'react-confirm';
import { SortableHandle as sortableHandle } from 'react-sortable-hoc';
import logEvent from '../util/analytics';

/*
Theme/Style stuff
*/
import withStyles from '@material-ui/core/styles/withStyles';
import { lighten, darken } from '@material-ui/core/styles/colorManipulator';

/*
Material UI components
*/
import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmationDialog from './ConfirmationDialog';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import IconButton from './IconButton';
import TrackBarChart from './TrackBarChart';
import DraggableIcon from '@material-ui/icons/DragIndicator';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import TrackControls from './TrackControls';

import trackTypes from './util/trackTypes';

const confirm = createConfirmation(ConfirmationDialog);

const styles = (theme) => ({
	root: {
		margin: theme.spacing.unit,
		display: 'flex'
	},
	expansionPanel: {
		flex: 1,

		// undo paper
		margin: 0,
		borderRadius: 0,
		boxShadow: 'none',
		backgroundColor: 'transparent',
		'&:first-child': {
			borderRadius: 0
		},
		overflowX: 'hidden'
	},
	expansionPanelSummary: {
		paddingRight: 0
	},
	expanded: {
		'& $main': {
			margin: '12px 0' // same as not expanded
		},
		'& $expandIcon': {
			transform: 'rotate(180deg)'
		}
	},
	main: {
		flex: 1,
		flexDirection: 'column',
		'& > :last-child': {
			paddingRight: 0
		},
		overflowX: 'hidden'
	},
	sortHandle: {
		display: 'flex',
		alignItems: 'center',
		backgroundColor: theme.palette.type !== 'dark' ?
			darken(theme.palette.background.paper, 0.05) :
			lighten(theme.palette.background.paper, 0.05),
		borderRadius: `0 ${theme.spacing.unit / 2}px ${theme.spacing.unit / 2}px 0`,
		cursor: 'grab'
	},
	expandIcon: {
		position: 'initial',
		top: 'auto',
		left: 'auto',
		transform: 'initial',
		alignSelf: 'start',
		marginTop: 12
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		'&:last-child': {
			paddingRight: theme.spacing.unit
		}
	},
	details: {
		flexDirection: 'column'
	},
	formControl: {
		margin: theme.spacing.unit,
		minWidth: 120
	},
	barChart: {
		overflow: 'hidden',
		'&:last-child': {
			padding: 0
		}
	},
	actionButtons: {
		flexShrink: 1,
		textAlign: 'right',
		whiteSpace: 'nowrap'
	}
});

const DragHandle = sortableHandle(({className}) => <div className={className}><DraggableIcon/></div>);

const Def = class Track extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		track: PropTypes.object.isRequired,
		data: PropTypes.object,
		setTrack: PropTypes.func.isRequired,
		nodeRef: PropTypes.func,
		sortIndex: PropTypes.number.isRequired
	}

	deleteTrack = evt => {
		evt.stopPropagation();

		const { track, setTrack } = this.props;
		const { id } = track;

		// todo: include track type and/or name
		const confirmation = <React.Fragment>Are you sure you want to delete this track? This cannot be undone.</React.Fragment>;
		confirm({ confirmation, options: {
			no: 'Cancel',
			yes: 'Delete'
		} }).then(() => {
			logEvent('track', 'delete', track.type);
			setTrack(null, id);
		}, () => {
			console.log('Delete track canceled');
		});
	}

	handleToggleMuted = () => {
		const { track, setTrack } = this.props;
		setTrack(Object.assign({}, track, {
			muted: !track.muted
		}), track.id);
	}

	render() {
		const {
			classes,
			track,
			sortIndex,
			data
		} = this.props;

		const typeDef = trackTypes[track.type];
		const hasIntensity = !!typeDef.hasIntensity;
		const TypeIcon = typeDef.icon;
		const TypeHeaderControl = typeDef.headerControl || null;
		const TypeControls = typeDef.controls || null;

		const barchartField = hasIntensity && track.intensityField > -1 ?
			track.intensityField :
			track.filterField;

		return <div ref={ref => this.props.nodeRef(ref, track.id)} id={'track-' + sortIndex}>
			<Paper className={classes.root} elevation={1} id={'track-' + track.id}>
				<ExpansionPanel classes={{root: classes.expansionPanel}}>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						classes={{
							root: classes.expansionPanelSummary,
							content: classes.main,
							expanded: classes.expanded,
							expandIcon: classes.expandIcon
						}}
						IconButtonProps={{
							'data-tour-id': 'track-advanced'
						}}
					>
						<div className={classes.header} data-tour-id={'track-control-header-' + sortIndex}>
							<Tooltip title={typeDef.name}>
								<TypeIcon color="action"/>
							</Tooltip>
							{/*<Typography variant="subtitle1" component="h2">{typeDef.name}</Typography>*/}
							{TypeHeaderControl && <TypeHeaderControl track={track}/>}
							<span className={classes.actionButtons} style={{
								flexGrow: !TypeHeaderControl ? 1 : null
							}}>
								<IconButton label="Toggle Mute Track" className={classes.volumeButton} onClick={this.handleToggleMuted}>
									{ track.muted ? <VolumeOffIcon color="disabled" /> : <VolumeUpIcon color="action" /> }
								</IconButton>
								<IconButton onClick={this.deleteTrack} label="Delete Track">
									<DeleteIcon/>
								</IconButton>
							</span>
						</div>
						{barchartField > -1 ?
							<TrackBarChart
								classes={{root: classes.barChart}}
								data={data}
								fieldIndex={barchartField}
								filterField={track.filterField}
								filterValues={track.filterValues}
								min={track.filterRange && track.filterRange[0] || 0}
								max={track.filterRange ? track.filterRange[1] : 1}
								disabled={!!track.muted}
							/> :
							null
						}
						{TypeControls && <TypeControls track={track}/>}
					</ExpansionPanelSummary>
					<ExpansionPanelDetails className={classes.details}>
						<TrackControls track={track}/>
					</ExpansionPanelDetails>
				</ExpansionPanel>
				<DragHandle className={classes.sortHandle}/>
			</Paper>
		</div>;
	}
};

const Track = withStyles(styles)(
	connect(['data'], actions)(Def)
);
export default Track;