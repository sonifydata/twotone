## 📌  As of mid-2023 , development on TwoTone has been paused.

## You can still run the latest MIDI out beta version at https://twotone-midiout-beta.netlify.app/

# TwoTone

[TwoTone](https://twotone.io/) is an open-source web tool for generating music from data. The app is a [Sonify](https://sonify.io) project built with support from Google News Initiative. It was originally developed by Datavized Technologies with support from [Google News Initiative](https://newsinitiative.withgoogle.com) and key advisor [Alberto Cairo](http://www.thefunctionalart.com/).


## How does TwoTone work?

The tool has built-in features to easily create sound from tabular data (e.g. spreadsheets and comma-separated values).

The data uploaded to TwoTone are processed fully in the web browser: no server-side operations or storage is performed. It is also optimized for mobile and designed as a cross-platform Progressive Web App so the tool can be installed on any web connected device.

## Who uses TwoTone?

TwoTone is a playful technology and easy to use, but allows for output to industry-standard formats including live MIDI output enabling  users to apply their compositions for use in professional projects.

The software can be used by journalists, data professionals and researchers as an exploratory tool; or by artists, musicians, media makers and composers as a creative tool. It can also be used to share data with the blind and visually impaired, to help understand data in new ways, totally through the sense of hearing.

## What is TwoTone's goal?

TwoTone explores the potential of turning data into sound, as the primary sense instead of sight, to uncover anomalies and insights through audioscapes rather than a visual chart or graph. In attaching individual time-based data sets and individual columns of data to variables in sound (pitch, volume), the tool can be a useful data communication tool to create a sonic representation of information.

For the user, the experience is "interaction as an instrument." When a selection is made in the dataset it will trigger an audioscape that can be combined with the next interaction to create a realtime composition. Each composition can be recorded and shared easily across web or social channels. The tool therefore allows users to create new and unique pieces of music by exploring a dataset. It is playful but also has practical uses.

## How can your organization benefit from using TwoTone?

TwoTone is designed to be seamlessly integrated into your workflow and used either as a standalone tool for publishing sonification on the web or as a soundtrack builder for multimedia projects. The tool is fully customizable to enable creators to map any data input to the desired audio output.

- Web App:  http://sonify.io/twotone/ (use Google Chrome web browser for best performance)
- Project official page: https://twotone.io 
- Documentation: https://github.com/sonifydata/twotone/
 

## Usage

The easiest way to use TwoTone is by accessing the most updated version on the official app page at [twotone.io](https://twotone.io). However, TwoTone can also run locally on your machine: see the installation instructions below.

First, upload your own data or select one of the sample spreadsheets in the tool. (we've added these to help get you started).

Then, use the following features to customize your data sonification.

1. **Audio Track** - TwoTone will automatically generate an audio track from your data set. You can change your track's data source or instrument.

2. **Play Audio** - Click the Play button to hear the sound generated from your data.

3. **Add Audio Track** - Generate another audio track automatically from your data set or upload an audio track of your own.

4. **Adjust Duration** - Adjust your total duration, row duration, and tempo (BPM) to speed up or slow down your composition.

5. **Advanced Features** - Adjust the volume of your audio track, filter it by data columns or by value, change the key of your musical scale, or adjust octave, scale range and tempo to create an arpeggio.

6. **Export Audio** - Export your project to an audio file in MP3 or Waveform (PCM) format. MP3 Bit Rate export options are 64 kbps, 128 kbps,, 192 kbps, and 320 kbps.

Share your creations with the community [@sonifydata on Twitter](https://twitter.com/sonifydata).

### Creating a Track

A TwoTone composition can have any number of separate tracks, each emitting a different audio representation of one column of data. A new track can be created by hovering or clicking on the "+" button in the lower right corner and selecting a track type. Currently, TwoTone supports two types of tracks:

- **Musical Scale** - Generates a sequence of notes with a pitch corresponding to the data value.

- **Narration Audio** - Plays a recorded or imported audio track, optionally on a loop.

### Editing a Track

All tracks have a few options and operations in common, regardless of their type. Some advanced options are available in the expanded track view, which can be revealed by clicking the expand button at the top right of the track.

#### Re-Order Tracks

Tracks are initially listed in the order they are created. They can be re-sorted by dragging a track's handle on the right side.

#### Delete a Track

A track can be deleted by clicking the trash can icon in the upper right corner of the track frame. There is a confirmation, but track deletion is permanent.

#### Mute a Track

A track can be muted or un-muted by toggling the speaker button in the upper right corner of the track.

#### Volume Adjustment

Every track has a volume slider in the expanded view.

#### Filtering a Track

Any track can be filtered to play or not based on data values. This is a powerful feature that can allow for complex layering of sounds, instruments and rhythms when combined across multiple tracks. See [tutorials](https://twotone.io/tutorials/) for more information and examples.

Filter controls are in the expanded track view. First, select a data column to use as the values to be filtered. Next, use the slider to select a range of values to be played. The values will be displayed in a bar chart to show which sections of the track will be played and which will be silent.

### Advanced Track Controls

Each type of track has different advanced options that can be used to create complex compositions.

#### Narration Audio

This type of track can be used to add narration or background music to a project.

##### Select an Audio File

Click the prompt to select an audio file to be played. Audio files can be imported from device storage or recorded directly from the device's microphone, if one is available.

##### Play Mode

Select an option to determine when and how often the selected audio clip will be played

- **Loop** - The clip will loop on repeat for the duration of the project (assuming the clip is shorter than the project duration). If a filter is applied, the audio will maintain timing with the project's play time, even through silent sections. This is useful for synchronizing music sections without losing the rhythm.

- **Active sections** - When a filter is applied, the clip will play once at the beginning of each non-silent section.

#### Musical Scale

Musical scale tracks create melodies from data and have many options to customize pitch, rhythms and instruments

##### Data Source

Select a column from the source spreadsheet to provide the values that will determine the pitch of each note. Pitches will be spread across a range of octaves, with the lowest value playing the lowest note and the highest value playing the highest note.

##### Select Instrument

A number of built-in musical instruments are provided.

##### Key

Select tonic or root note and the mode of the musical key. All notes in this track will be played in the given key. In most cases, all tracks should be in the same key, though it's not strictly required.

The lowest and highest values will play the tonic note at either end of the given scale.

##### Scale Range

Select how many octaves will comprise the range of notes from lowest to highest. More octaves will result in finer-grained distinction between values. Fewer octaves will allow different tracks to represent different data at opposing ends of the scale, even using the same instrument, like playing left hand and right hand on a piano.

Each instrument will have a different maximum range of octaves depending on how high and low that instrument can play.

##### Start Octave

The entire scale range can be shifted higher or lower within the range of the instrument's available scale. The default *Auto* setting will place the selected scale range in the middle of the instrument's scale.

##### Track Tempo

TwoTone plays one row of data per "beat" as specified in the global project duration setting. For example, a spreadsheet with 100 rows set at 60bpm will play one note for each row every second for 100 seconds, or one minute and 20 seconds (1:20).

The Track Tempo setting is a multiplier of the global tempo that will play more than one note per row for that track, allowing for more complex rhythms.

##### Arpeggio

When multiple notes are played per row, this allows for an [arpeggio](https://en.wikipedia.org/wiki/Arpeggio) of notes. The root of the arpeggio will be the note determined by the value for that row, and all notes will be in the given key.

- **None** - Repeat the same note
- **Ascending** - Notes will be played in order of increasing pitch
- **Descending** - Notes will be played in order of increasing pitch


This setting is only available when Track Tempo is set to more than 1.


## Built With
- [React](https://reactjs.org/)
- [Material UI](https://material-ui.com/)
- [WebMIDI.JS](https://webmidijs.org/)

## Core Team
TwoTone is a Sonify project built with support from Google News Initiative. The app was originally developed by Datavized Technologies with support from [Google News Initiative](https://newsinitiative.withgoogle.com) and key advisor [Alberto Cairo](http://www.thefunctionalart.com/).

If you want to know more about TwoTone, how it works and future developments, write to us at contact@sonify.io. For any specific request or comment we suggest you use Github or send us an email.


## License

This software is licensed under the [MPL 2.0](LICENSE)
