import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';
import {
	SortableContainer as sortableContainer,
	SortableElement as sortableElement
} from 'react-sortable-hoc';

/*
Material UI components
*/
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';

import Track from './Track';

const styles = theme => ({
	root: {
		position: 'absolute',
		top: 0,
		width: '100%',
		height: '100%',
		// overflowY: 'scroll',
		'& > div': {
			// make room to scroll so add button doesn't cover track controls
			paddingBottom: 64
		}
	},
	sortingHelper: {
		'& > *': {
			boxShadow: theme.shadows[5]
		}
	}
});

const SortableTrack = sortableElement(props => <Track {...props}/>);

const SortableTrackList = sortableContainer((props) => {
	const {items, nodeRef} = props;
	return <div>
		{items.map((track, i) =>
			<SortableTrack
				key={track.id || i}
				index={i}
				sortIndex={i}
				track={track}
				nodeRef={nodeRef}
			/>
		)}
	</div>;
});

const Def = class TrackList extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
		reorderTrack: PropTypes.func.isRequired
	}

	trackRefs = new Map()

	onTrackRef = (node, id) => {
		this.trackRefs.set(id, node);
	}

	onSortEnd = ({oldIndex, newIndex}) => {
		this.props.reorderTrack(oldIndex, newIndex);
	}

	componentDidUpdate(prevProps) {
		const { tracks } = this.props;
		if (tracks) {
			const prevTrackIds = new Set((prevProps.tracks || []).map(track => track.id));

			let newTrackId = '';
			tracks.forEach(track => {
				if (prevTrackIds.has(track.id)) {
					prevTrackIds.delete(track.id);
				} else if (!newTrackId) {
					newTrackId = track.id;
				}
			});
			prevTrackIds.forEach(id => this.trackRefs.delete(id));

			if (newTrackId) {
				const node = this.trackRefs.get(newTrackId);
				if (node) {
					try {
						// block: 'nearest' throws error in some older browsers
						// e.g. Firefox < 58
						node.scrollIntoView({
							behavior: 'smooth',
							block: 'nearest'
						});
					} catch (e) {
						node.scrollIntoView();
					}
				}
			}
		}
	}

	render() {
		const { classes, tracks } = this.props;

		return <div className={classes.root}>
			<SortableTrackList
				items={tracks}
				nodeRef={this.onTrackRef}
				onSortEnd={this.onSortEnd}
				useDragHandle={true}
				lockToContainerEdges={true}
				lockAxis="y"
				helperClass={classes.sortingHelper}
			/>
		</div>;
	}
};

const TrackList = withStyles(styles)(
	connect('tracks', actions)(Def)
);
export default TrackList;
