export default {
	input: 'src/rollup/index.js',
	output: [
		{
			file: 'dist/rollup.cjs.js',
			format: 'cjs',
		},
		{
			file: 'dist/rollup.es.js',
			format: 'es',
		},
	],
};
