#!/usr/bin/env node

const colors = require('colors');
if (process.argv[2] == 'build') {
	require('../src/build.js');
} else if (process.argv[2] == 'help') {
	require('../src/help.js');
} else {
	console.log('操作不存在'.red.bold);
	process.exit(0);
}
