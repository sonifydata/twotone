import React from 'react';
import PropTypes from 'prop-types';

import SpeechControls from './SpeechControls';
import Paper from '@material-ui/core/Paper';

const Def = ({className, ...props}) =>
	<Paper className={className} square elevation={8}>
		<SpeechControls
			{...props}
		/>
	</Paper>;

Def.propTypes = {
	className: PropTypes.string
};

const MainSpeechControls = Def;
export default MainSpeechControls;