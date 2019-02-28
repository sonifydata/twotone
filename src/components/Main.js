import React from 'react';
import PropTypes from 'prop-types';

import Theme from './Theme';
import AppLoader from './AppLoader';
import AppLoadFailure from './AppLoadFailure';

import asyncComponent from './asyncComponent';
import { loadRequirements } from '../util/loadRequirements';
const StoreApp = asyncComponent(
	() => loadRequirements().then(({StoreApp}) => StoreApp),
	{
		load: AppLoader,
		fail: AppLoadFailure
	}
);

const Def = class Main extends React.Component {
	componentDidCatch(error) {
		if (this.props.onError) {
			this.props.onError(error);
		}
	}

	render() {
		return <Theme>
			<StoreApp {...this.props}/>
		</Theme>;
	}
};

Def.propTypes = {
	onError: PropTypes.func
};

const Main = Def;
export default Main;