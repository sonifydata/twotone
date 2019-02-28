/* global APP_TITLE */
import React from 'react';

import Shell from './Shell';
import SectionLoader from './SectionLoader';

const Def = () =>
	<Shell title={APP_TITLE}>
		<SectionLoader/>
	</Shell>;

const AppLoader = Def;
export default AppLoader;