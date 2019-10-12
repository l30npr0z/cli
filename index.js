import fs from 'fs-extra';
import path from 'path';
import pinyin from 'node-pinyin';

export function getInput(args) {
	return {
		target: args.target || 'serve', //打包目标
		resource: args.resource || '', //资源版号
		upload: args.upload || false, //是否上传
		version: args.version || '', //打包版本
		mode: args.mode || 'development', //打包模式
	};
}
export function dirToJson(DirPath) {
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
export function build(args, cli, project) {
	let input = getInput(args.input);
	delete args.input;
	let dynamic = {};
	dynamic.buildAt = Date.now();
	dynamic.name = pinyin(project.name, { style: 'toneWithNumber' }).join('');
	dynamic.resourceMap = dirToJson('./resource');
	if (project.qiniu && input.resource) dynamic.assetsUrl = `${project.qiniu.Url}/${project.qiniu.Path}/${dynamic.name}/${input.resource}`;
	return cli(project, input, dynamic);
}
