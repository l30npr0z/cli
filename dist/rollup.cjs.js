'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs-extra'));
var path = _interopDefault(require('path'));
var pinyin = _interopDefault(require('node-pinyin'));

function getInput(args) {
	return {
		target: args.target || 'serve', //打包目标
		resource: args.resource || '', //资源版号
		upload: args.upload || false, //是否上传
		version: args.version || '', //打包版本
		mode: args.mode || 'development', //打包模式
	};
}
function dirToJson(DirPath) {
	let Res = {};
	fs.readdirSync(DirPath).forEach(FileName => {
		if (FileName.indexOf('.') == 0) return;
		let FilePath = path.join(DirPath, FileName);
		let Stats = fs.statSync(FilePath);
		if (Stats.isDirectory()) {
			if (!Res[FileName]) Res[FileName] = {};
			if (typeof Res[FileName] == 'string') Res[FileName] = { _: Res[FileName] };
			Object.assign(Res[FileName], dirToJson(FilePath));
		}
		if (Stats.isFile()) {
			let Ext = path.extname(FilePath);
			let Name = path.basename(FilePath, Ext);
			if (Ext && Name) {
				if (!Res[Name]) Res[Name] = Ext.substring(1);
				if (typeof Res[Name] == 'object') Res[Name]._ = Ext.substring(1);
			}
		}
	});
	return Res;
}
function build(args, cli, project) {
	let input = getInput(args.input);
	delete args.input;
	let dynamic = {};
	dynamic.buildAt = Date.now();
	dynamic.name = pinyin(project.name, { style: 'toneWithNumber' }).join('');
	dynamic.resourceMap = dirToJson('./resource');
	if (project.qiniu && input.resource) dynamic.assetsUrl = `${project.qiniu.Url}/${project.qiniu.Path}/${dynamic.name}/${input.resource}`;
	return cli(project, input, dynamic);
}

exports.build = build;
exports.dirToJson = dirToJson;
exports.getInput = getInput;
