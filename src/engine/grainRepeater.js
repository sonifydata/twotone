import bufferSource from '../soundq/src/sources/buffer';
import repeater from '../soundq/src/sources/repeater';
import compose from '../soundq/src/patches/compose';
import panner from '../soundq/src/patches/panner';
import trapezoid from '../soundq/src/patches/trapezoid';

const grain = compose([trapezoid, panner]);

export default function (buffer, grainPatchOptions) {
	const grainRepeater = repeater(bufferSource(buffer), grain, grainPatchOptions);
	const sequencer = repeater(grainRepeater); // todo: add envelope, options
	return sequencer;
}
