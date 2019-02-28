import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../store';
import getVoices, { pickLanguage } from '../engine/speech-voices';
import languageNames from '../util/languageNames';
import { genders } from '../constants';

import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
	root: {
	},
	formControl: {
		margin: theme.spacing.unit,
		minWidth: 120
	},
	controlGroup: {
		display: 'inline-flex',
		flexDirection: 'row',
		alignItems: 'baseline'
	},
	slider: {
		width: 300
	}
});

const sortVoices = (a, b) => {
	const wavenet = a.isWaveNet < b.isWaveNet;
	if (wavenet) {
		return wavenet;
	}

	return a.name > b.name ? 1 : -1;
};

const Def = class SpeechControls extends React.Component {
	static propTypes = {
		classes: PropTypes.object,
		className: PropTypes.string,
		data: PropTypes.object,
		speechTitle: PropTypes.number,
		speechTitleEnabled: PropTypes.bool,
		speechLanguage: PropTypes.string,
		speechGender: PropTypes.string,
		speechVoiceId: PropTypes.string,
		setSpeechTitle: PropTypes.func.isRequired,
		setSpeechTitleEnabled: PropTypes.func.isRequired,
		setSpeechLanguage: PropTypes.func.isRequired,
		setSpeechGender: PropTypes.func.isRequired,
		setSpeechVoiceId: PropTypes.func.isRequired
	}

	state = {
		voicesByLanguage: null
	}

	handleChangeSpeechTitle = event => {
		this.props.setSpeechTitle(event.target.value || '');
	}

	handleChangeSpeechTitleEnabled = event => {
		this.props.setSpeechTitleEnabled(!!event.target.checked);
	}

	handleChangeSpeechLanguage = event => {
		this.props.setSpeechLanguage(event.target.value || '');
	}

	handleChangeSpeechGender = event => {
		this.props.setSpeechGender(event.target.value || '');
	}

	handleChangeSpeechVoiceId = event => {
		this.props.setSpeechVoiceId(event.target.value || '');
	}

	componentDidMount() {
		getVoices().then(({voicesByLanguage}) => {
			this.setState({ voicesByLanguage });
		});
	}

	render() {
		const {
			classes,
			className,

			speechTitle,
			speechTitleEnabled,
			speechLanguage,
			speechGender,
			speechVoiceId
		} = this.props;

		const {
			voicesByLanguage
		} = this.state;

		const languageIds = voicesByLanguage && Array.from(voicesByLanguage.keys()) || [];
		const languages = languageIds.map(code => ({
			code,
			name: languageNames[code] && languageNames[code].englishName || code
		})).sort((a, b) => a.name >= b.name ? 1 : -1);

		// get best available language if missing
		const selectedLanguageCode = pickLanguage(voicesByLanguage, speechLanguage);
		const voicesByGender = voicesByLanguage && voicesByLanguage.get(selectedLanguageCode);

		const availableGenders = voicesByGender ? Array.from(voicesByGender.keys()) : [];
		const gender = voicesByGender && genders.find(g => voicesByGender.has(g) && (!speechGender || speechGender === g)) ||
			availableGenders[0];

		const voices = voicesByGender && voicesByGender.get(gender);
		const voiceIds = voices ? Array.from(voices.keys()) : [];
		const voiceList = voiceIds.map(id => voices.get(id)).sort(sortVoices);
		const selectedVoice = voices && voices.has(speechVoiceId) && speechVoiceId || voiceIds[0];

		return <div className={className} id="SpeechControls" data-tour-id="speech-title">
			<div>
				<div className={classes.controlGroup}>
					<FormControl className={classes.formControl}>
						<FormControlLabel
							control={
								<Switch
									checked={speechTitleEnabled}
									onChange={this.handleChangeSpeechTitleEnabled}
									value="speechTitleEnabled"
									color="primary"
								/>
							}
							label="Speak Title"
						/>
					</FormControl>
					<FormControl className={classes.formControl}>
						<TextField
							id="speechTitle"
							label="Title"
							value={speechTitle}
							onChange={this.handleChangeSpeechTitle}
						/>
					</FormControl>
					{ languages.length ?
						<FormControl className={classes.formControl}>
							<InputLabel htmlFor="speech-language">Language</InputLabel>
							<Select
								value={selectedLanguageCode}
								onChange={this.handleChangeSpeechLanguage}
								inputProps={{
									name: 'speech-language',
									id: 'speech-language'
								}}
							>
								{languages.map(({code, name}) => <MenuItem key={code} value={code}>{name}</MenuItem>)}
							</Select>
						</FormControl> :
						null
					}
					{ availableGenders.length > 1 ?
						<FormControl className={classes.formControl}>
							<InputLabel htmlFor="speech-gender">Gender</InputLabel>
							<Select
								value={gender}
								onChange={this.handleChangeSpeechGender}
								inputProps={{
									name: 'speech-gender',
									id: 'speech-gender'
								}}
							>
								{availableGenders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
							</Select>
						</FormControl> :
						null
					}
					{ voiceList.length > 1 ?
						<FormControl className={classes.formControl}>
							<InputLabel htmlFor="speech-voice">Voice</InputLabel>
							<Select
								value={selectedVoice}
								onChange={this.handleChangeSpeechVoiceId}
								inputProps={{
									name: 'speech-voice',
									id: 'speech-voice'
								}}
							>
								{voiceList.map(({name}) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
							</Select>
						</FormControl> :
						null
					}
				</div>
			</div>
		</div>;
	}
};

const SpeechControls = withStyles(styles)(
	connect([
		'speechTitle',
		'speechTitleEnabled',
		'speechLanguage',
		'speechGender',
		'speechVoiceId'
	], actions)(Def)
);
export default SpeechControls;