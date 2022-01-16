/**
 * Contextual pop up menu in a 4x4 grid for selecting midi channel
 * by CAV
 **/

import * as React from 'react';
import Menu from '@material-ui/core/Menu';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'unistore/react';
import { store } from '../store'
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from './IconButton';
import FiberSmartRecordOutlined from '@material-ui/icons/FiberSmartRecordOutlined';
import {SvgIcon} from "@material-ui/core";


const styles = (theme) => ({
    root: {
        color: 'antiquewhite',
        flex: 0.2,
        margin: theme.spacing.unit,
    },
    numberBox: {
        fontSize: 14,
        padding: 10,
        display: 'flex',
        justifyContent: 'center'
    }
});

const ChannelInCircle = ({ fill, digit }) => (

    <svg viewBox='0 0 15px 15px' fill={ fill }>
        <circle cx='50%' cy='50%' r='50%'/>
        <circle cx='50%' cy='50%' r='40%' fill='white'/>
        <text x='50%' y='70%' textAnchor='middle' fontSize='16px' fill='black'>{digit}</text>
    </svg>

);

store.setState( { contextMenu: null });


const Def = class MidiChannelSelector extends React.Component {

    state = {
        midiChannelAnchorEl: null,
        midiChannel: this.props.getMidiChannel
    };

    componentDidMount() {
        this.setState(  {midiChannel:this.props.getMidiChannel} );
    }

    handleClose = () => {
        this.setState( { midiChannelAnchorEl: null} );
    };

    /**
     * This handler stops the click through to track controls
     * and passes the choice up to parent for linking into
     * track config
     * @param e is a click event containing new midi channel choice
     */


    handleChange= (event) => {
        event.stopPropagation();
        this.setState(  {midiChannel: event.currentTarget.value} );
        this.props.handleChannelChange( event.currentTarget );
        this.handleClose();
    };



    /**
     * Button opens 16 channel menu
     * @param event
     */
    handleClick = (event) => {
        this.setState( { midiChannelAnchorEl: event.currentTarget });
    };


         render() {
             //todo: introduce some midi status checks before attempting to change channels
            const { classes } = this.props;
             const { midiChannelAnchorEl } = this.state;
             const { midiChannel } = this.state;
             const channels = [...Array(16).keys()].filter((e, i) => i % 4 == 0);
             return (<React.Fragment>

                         <div style={{cursor: 'context-menu'}}>
                             <IconButton
                                 aria-owns={midiChannelAnchorEl ? 'midi-channel-menu' : undefined}
                                 aria-haspopup="true"
                                 label="Select Midi Channel" color='primary' onClick={this.handleClick}>
                                 <SvgIcon><ChannelInCircle fill='cyan' digit={midiChannel}/></SvgIcon>
                             </IconButton>

                             <Menu
                                 id='midi-channel-menu'
                                 key={'popUpCm'}
                                 anchorEl={midiChannelAnchorEl}
                                 open={Boolean (midiChannelAnchorEl)}
                                 onClose={this.handleClose}
                                 style = {{
                                         opacity: 0.9,
                                     }}
                             >
                                 <InputLabel key={'mc_popUpTitle'} id="canal" style={{fontSize: 12, fontWeight: 'bold'}}>Midi
                                     Channel</InputLabel>
                                 {
                                     channels.map(i =>
                                         <Grid container key={'mc_grid_'+i} className={classes.root} spacing={8} columns={4}>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     name = 'midiChannel'
                                                     className = {classes.numberBox}
                                                     key={i+100}
                                                     onClick={this.handleChange}
                                                     value={i + 1}>{i+1}
                                                 </MenuItem>
                                             </Grid>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     name = 'midiChannel'
                                                     className = {classes.numberBox}
                                                     key={i+200}
                                                     onClick={this.handleChange}
                                                     value={i + 2}>{i+2}
                                                 </MenuItem>
                                             </Grid>
                                             <Grid item xs={2}>
                                                 <MenuItem
                                                     name = 'midiChannel'
                                                     className = {classes.numberBox}
                                                     key={i+300}
                                                     onClick={this.handleChange}
                                                     value={i + 3}>{i+3}
                                                 </MenuItem>
                                             </Grid>
                                             <Grid item xs={2} >
                                                 <MenuItem
                                                     name = 'midiChannel'
                                                     className = {classes.numberBox}
                                                     key={i+400}
                                                     onClick={this.handleChange}
                                                     value={i + 4}>{i+4}
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
