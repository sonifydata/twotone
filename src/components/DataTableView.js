import React from 'react';
import { connect } from 'unistore/react';

/*
Material UI components
*/
import DataTable from './DataTable';

const Def = props => props.data && <DataTable {...props}/> || null;

const DataTableView = connect('data')(Def);
export default DataTableView;