const layers = [
	// low
	// {
	// 	rate: 0.25,
	// 	opts: {
	// 		length: 1.8,
	// 		crossFade: 0.9,
	// 		pitch: -12,
	// 		transpose: Math.pow(2, -12 / 12),
	// 		spread: 0
	// 	}
	// },
	{
		rate: 1,
		opts: {
			length: 1.4,
			crossFade: 0.7,
			pitch: 0,
			transpose: Math.pow(2, 0 / 12)
		}
	},
	{
		rate: 2,
		opts: {
			length: 0.47,
			crossFade: 0.33,
			pitch: 0,
			transpose: Math.pow(2, 0 / 12)
		}
	},
	{
		rate: 4,
		opts: {
			length: 0.08,
			crossFade: 0.25,
			pitch: -5,
			transpose: Math.pow(2, -5 / 12)
		}
	},

	// mid-range
	{
		rate: 1,
		opts: {
			length: 2.5,
			crossFade: 0.1,
			pitch: 0,
			transpose: Math.pow(2, 0 / 12)
		}
	},
	{
		rate: 2,
		opts: {
			length: 0.47,
			crossFade: 0.1,
			pitch: -12,
			transpose: Math.pow(2, -12 / 12)
		}
	},
	{
		rate: 4,
		opts: {
			length: 0.15,
			crossFade: 0.1,
			pitch: 7,
			transpose: Math.pow(2, 7 / 12)
		}
	},

	// high
	{
		rate: 6,
		opts: {
			length: 0.15,
			crossFade: 0.1,
			pitch: 12,
			transpose: Math.pow(2, 12 / 12)
		}
	}
];

export default layers;