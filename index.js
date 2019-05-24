#!/usr/bin/env node

const colors = require('colors');
if (process.argv[2] != 'build') {
	console.log('操作不存在'.red.bold);
	process.exit(0);
}
const fs = require('fs-extra');
const path = require('path');
const pinyin = require('node-pinyin');
// const clone = require('git-clone-promise');
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const question = quest => new Promise(resolve => readline.question(quest, target => resolve(target)));

let GlobalConfig = {
	ChineseName: '', //中文名
	EnglishName: '', //英文名
	BasePath: '', //游戏发布路径
	ProjectPath: '', //游戏发布项目路径
	ExampleUrl: '', //模版地址
	MoveOldPath: '', //冲突项目移动位置
};
//设置项目名称
let SetName = function() {
	return question('输入项目名称：'.bold.red).then(name => {
		if (!name) return Promise.reject('***********未获得项目名称***********'.bold.green);
		GlobalConfig.ChineseName = name;
		GlobalConfig.EnglishName = pinyin(name, { style: 'toneWithNumber' }).join('');
	});
};
//设置游戏发布路径
let SetBasePath = function() {
	let basePath = process.cwd();
	GlobalConfig.BasePath = path.join(basePath, GlobalConfig.ChineseName);
	if (path.dirname(GlobalConfig.BasePath) != basePath) return Promise.reject('***********无法使用该名称***********'.bold.green);
	GlobalConfig.ProjectPath = path.join(GlobalConfig.BasePath, 'project');
};
//获取游戏发布模版
let SetExamplePath = function() {
	return question(('请输入模版Git地址'.red + '(空则使用默认模版)'.cyan).bold).then(ExampleUrl => {
		if (!ExampleUrl) ExampleUrl = 'https://github.com/i-canvas/example.git';
		if (!ExampleUrl) return Promise.reject('***********未获得模版地址***********'.bold.green);
		GlobalConfig.ExampleUrl = ExampleUrl;
	});
};
//确定发布配置
let SureConfig = function() {
	console.log('项目名称：'.bold.green, GlobalConfig.ChineseName);
	console.log('项目英文名称：'.bold.green, GlobalConfig.EnglishName);
	console.log('项目基础路径：'.bold.green, GlobalConfig.BasePath);
	console.log('项目部署路径：'.bold.green, GlobalConfig.ProjectPath);
	console.log('使用模版地址：'.bold.green, GlobalConfig.ExampleUrl);
};
//游戏目录覆盖模式
let SetMoveOldProjectDir = function() {
	var index = 0;
	var newpath = GlobalConfig.ProjectPath;
	while (fs.pathExistsSync(newpath)) newpath = path.join(newpath, '../project_' + ++index);
	if (newpath != GlobalConfig.ProjectPath) {
		GlobalConfig.MoveOldPath = newpath;
		console.log('将移动旧的project子目录到'.bold.green, GlobalConfig.MoveOldPath);
	}
};
//最后确认
let SureExecute = function() {
	return question(('开始部署？'.red + '(确定['.cyan + 'Y*'.blue + ']/取消['.cyan + 'N'.blue + '])'.cyan).bold).then(check => {
		if (check && check.toUpperCase() != 'Y') return Promise.reject('**********已取消，停止部署**********'.bold.green);
	});
};
//游戏模版下载中转位置
let HandleExamplePath = path.join(__dirname, 'example');
let HandleExamplePathFilter = path.join(__dirname, 'example/.git');
let HandleExamplePathNoFilter = path.join(__dirname, 'example/.gitignore');
//下载游戏模版
let DownloadExample = function() {
	return Promise.resolve(console.log('正在下载模版...', GlobalConfig.ExampleUrl))
		.then(() => fs.remove(HandleExamplePath))
		.then(() => {
			return new Promise((resolve, reject) => {
				let Args = ['clone'];
				Args.push('--depth', '1');
				let Url = GlobalConfig.ExampleUrl.split('#');
				if (Url[1]) Args.push('-b', Url[1]);
				Args.push('--', Url[0], HandleExamplePath);
				require('child_process')
					.spawn('git', Args)
					.on('close', function(status) {
						status == 0 ? resolve() : reject();
					});
			});
		})
		.catch(e => Promise.reject('**********模版下载失败**********'.bold.green));
};
//重命名旧的游戏项目
let ExecuteMoveOld = function() {
	if (GlobalConfig.MoveOldPath) return fs.move(GlobalConfig.ProjectPath, GlobalConfig.MoveOldPath);
};
//复制游戏模版到游戏目录
let ExecuteCopyExample = function() {
	return fs.copy(HandleExamplePath, GlobalConfig.ProjectPath, {
		filter: function(from, to) {
			if (from === HandleExamplePathNoFilter) return true;
			return from.indexOf(HandleExamplePathFilter) != 0;
		},
	});
};
//补充游戏配置
let ExecuteHandlebars = function() {
	let BuildJsonPath = path.join(GlobalConfig.ProjectPath, 'webpack/build.json');
	let Content = Object.assign(require(BuildJsonPath), {
		ChineseName: GlobalConfig.ChineseName,
		EnglishName: GlobalConfig.EnglishName,
	});
	return fs.writeJson(BuildJsonPath, Content, { spaces: 4 });
};

Promise.resolve(console.log('--------------准备部署--------------'.bold.green))
	.then(() => SetName())
	.then(() => SetBasePath())
	.then(() => SetExamplePath())
	.then(() => SureConfig())
	.then(() => SetMoveOldProjectDir())
	.then(() => SureExecute())
	.then(() => DownloadExample())
	.then(() => ExecuteMoveOld())
	.then(() => ExecuteCopyExample())
	.then(() => ExecuteHandlebars())
	.then(() => console.log('--------------部署完毕--------------'.bold.green))
	.catch(e => console.log(e))
	.then(() => process.exit(0))
	.catch(() => process.exit(0));
