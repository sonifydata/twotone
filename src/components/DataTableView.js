import React from 'react';
import { connect } from 'unistore/react';

/*
Material UI components
*/
import DataTable from './DataTable';

const Def = props => props.data && <DataTable {...props}/>;

const DataTableView = connect('data')(Def);
export default DataTableView;