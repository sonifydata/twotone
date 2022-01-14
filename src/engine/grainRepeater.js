import bufferSource from '/src/soundq/src/sources/buffer';
// import granulizer from '/src/soundq/src/sources/granulizer';
import repeater from '/src/soundq/src/sources/repeater';
import compose from '/src/soundq/src/patches/compose';
import panner from '/src/soundq/src/patches/panner';
import trapezoid from '/src/soundq/src/patches/trapezoid';

const grain = compose([trapezoid, panner]);

export default function (buffer, grainPatchOptions) {
	const grainRepeater = repeater(bufferSource(buffer), grain, grainPatchOptions);
	const sequencer = repeater(grainRepeater); // todo: add envelope, options
	return sequencer;
}
