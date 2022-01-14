/**
 * Contextual pop up menu in a 4x4 grid for selecting midi channel
 * by CAV
 **/

import * as React from 'react';
import Menu from '@material-ui/core/Menu';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'unistore/react';
import { store } from '../store'
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from './IconButton';
import FiberSmartRecordOutlined from '@material-ui/icons/FiberSmartRecordOutlined';


const styles = (theme) => ({
    root: {
        color: 'antiquewhite',
        flex: 0.2,
        margin: theme.spacing.unit
    }
});

store.setState( { contextMenu: null, midiChannel: -1 });


const Def = class MidiChannelSelector extends React.Component {

        handleContextMenu = (event) => {
            event.preventDefault();
            if (store.getState().contextMenu === null) {
                store.setState({ contextMenu: {mouseX: event.clientX - 2, mouseY: event.clientY - 4} } );
            }
        }

         handleClose = (e) => {
            store.setState( { contextMenu: null} );
             e.bubbles = false;
        };

         handleChange = (e) => {
            store.setState({midiChannel: e.target.value} );
            this.handleClose(e);
        };

        handleOpen = (event) => {
            if (store.getState().contextMenu === null) {
                store.setState({ contextMenu: {mouseX: event.clientX - 2, mouseY: event.clientY - 4} } );
            }
        };

         render() {
            const { classes } = this.props;
             const {contextMenu } = store.getState();
             const circleNumbers = [...Array(17).keys()];
             const channels = [...Array(16).keys()].filter((e, i) => i % 4 == 0);
             return (<React.Fragment>

                         <div onContextMenu={this.handleContextMenu} style={{cursor: 'context-menu'}}>
                             <IconButton label="Select Midi Channel" color='primary' onClick={this.handleOpen}>
                                 <FiberSmartRecordOutlined />
                             </IconButton>

                             <Menu
                                 style={{opacity: 0.9}}
                                 key='mdiomenu'
                                 open={contextMenu !== null}
                                 onClose={this.handleClose}
                                 anchorReference="anchorPosition"
                                 anchorPosition={
                                     contextMenu !== null
                                         ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
                                         : undefined
                                 }
                             >
                                 <InputLabel id="canal" style={{fontSize: 12, fontWeight: 'bold'}}>Midi
                                     Channel</InputLabel>
                                 {
                                     channels.map(i =>
                                         <Grid container spacing={8} columns={4}>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     style={{fontSize: 14}}
                                                     onClick={this.handleChange}
                                                     key={i}
                                                     value={i + 1}>{circleNumbers[i + 1]}
                                                 </MenuItem>
                                             </Grid>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     style={{fontSize: 14}}
                                                     onClick={this.handleChange}
                                                     key={i+4}
                                                     value={i + 2}>{circleNumbers[i + 2]}
                                                 </MenuItem>
                                             </Grid>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     style={{fontSize: 14}}
                                                     onClick={this.handleChange}
                                                     key={i+8}
                                                     value={i + 3}>{circleNumbers[i + 3]}
                                                 </MenuItem>
                                             </Grid>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     style={{fontSize: 14}}
                                                     onClick={this.handleChange}
                                                     key={i + 12}
                                                     value={i + 4}>{circleNumbers[i + 4]}
                                                 </MenuItem>
                                             </Grid>
                                         </Grid>
                                     )
                                 }
                             </Menu>
                         </div>
                 </React.Fragment>
             );
         }
};

const MidiChannelSelector =
    connect([ 'midiOutPort', 'midiChannel', 'contextMenu'])(withStyles(styles)(Def));
export default MidiChannelSelector;
