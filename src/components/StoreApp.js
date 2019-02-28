import React from 'react';
import { Provider } from 'unistore/react';
import { store } from '../store';

import App from './App';

const Def = props =>
	<Provider store={store}>
		<App {...props}/>
	</Provider>;

const StoreApp = Def;
export default StoreApp;
