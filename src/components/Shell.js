import React from 'react';
import PropTypes from 'prop-types';

/*
Theme/Style stuff
*/
import withStyles from '@material-ui/core/styles/withStyles';

/*
Material UI components
*/
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		backgroundColor: theme.palette.background.default
	},
	title: {
		flex: 1
	},
	appBar: {
	},
	'@media (max-height: 445px)': {
		appBar: {
			minHeight: 48
		}
	}
});

const Def = class Shell extends React.Component {
	static propTypes = {
		classes: PropTypes.object.isRequired,
		theme: PropTypes.object.isRequired,
		children: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node
		]),
		title: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node,
			PropTypes.string
		]),
		header: PropTypes.oneOfType([
			PropTypes.arrayOf(PropTypes.node),
			PropTypes.node,
			PropTypes.string
		])
	}

	render() {
		const {
			classes,
			header,
			children
		} = this.props;

		const title = typeof this.props.title !== 'string' || !this.props.title ?
			this.props.title :
			<Typography variant="h6" color="inherit" className={classes.title} component="h1">
				{this.props.title}
			</Typography>;

		return <div className={classes.root}>
			<AppBar position="static">
				<Toolbar className={classes.appBar}>
					{title}
					{header}
				</Toolbar>
			</AppBar>
			{children}
			<footer className={classes.footer}></footer>
		</div>;
	}
};

const Shell = withStyles(styles, { withTheme: true })(Def);
export default Shell;
