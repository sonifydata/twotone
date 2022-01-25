import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';

/*
Material UI components
*/
import withStyles from '@material-ui/core/styles/withStyles';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';


function blockClick(event) {
	event.stopPropagation();
}
function handleClose(event) {
	console.log(event);
}

const styles = theme => ({
	root: {
		margin: theme.spacing.unit,
	}
});

const Def = ({name, id, label, children, classes, ...props}) =>

	<FormControl className={classes.root} >
		<InputLabel htmlFor={id}>{label}</InputLabel>
		<Select
			{...props}
			onClick={blockClick}
			name={label}
			input = {<Input id='midiOutUI' />}
			autoWidth={true}
		>
			{children}
		</Select>
	</FormControl>;


Def.propTypes = {
	classes: PropTypes.object.isRequired,
	name: PropTypes.string,
	id: PropTypes.string,
	label: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.node
	]),
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

const WideSelectMidi = withStyles(styles)(Def);
export default WideSelectMidi;
