/* global APP_TITLE */
import React from 'react';

import Shell from './Shell';
import LoadFailure from './LoadFailure';

const Def = props =>
	<Shell title={APP_TITLE}>
		<LoadFailure {...props}/>
	</Shell>;

const AppLoadFailure = Def;
export default AppLoadFailure;