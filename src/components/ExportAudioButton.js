import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';

import asyncComponent from './asyncComponent';
const ExportAudioDialog = asyncComponent(() => import('./ExportAudioDialog'), {
	defer: true
});
// import ExportAudioDialog from './ExportAudioDialog';

import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit * 2
	},
	leftIcon: {
		marginRight: theme.spacing.unit
	}
});

const Def = class ExportAudioButton extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		classes: PropTypes.object,
		loading: PropTypes.bool,
		disabled: PropTypes.bool,
		audioLoaded: PropTypes.bool
	}

	state = {
		open: false
	}

	exportAudio = () => {
		this.setState({
			open: true
		});
	}

	onClose = () => {
		this.setState({
			open: false
		});
	}

	render() {
		const {
			classes,
			disabled,
			loading,
			audioLoaded
		} = this.props;

		const { open } = this.state;

		return <React.Fragment>
			<Button
				disabled={disabled || loading || !audioLoaded}
				variant="contained"
				color="secondary"
				onClick={this.exportAudio}
				className={classes.button}
				data-tour-id="export-audio"
			>
				<SaveIcon className={classes.leftIcon} />
				Export
			</Button>
			{open && <ExportAudioDialog open={true} onClose={this.onClose}/>}
		</React.Fragment>;
	}
};

const ExportAudioButton = withStyles(styles)(
	connect([
		'loading',
		'disabled',
		'audioLoaded'
	], actions)(Def)
);
// const ExportAudio = Def;
export default ExportAudioButton;