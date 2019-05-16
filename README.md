## 安装Cli工具

```bash
npm install -g @icanvas/cli #安装游戏部署工具
```

## 部署新游戏

#### _建议新建一个"游戏开发"文件夹用来放置所有游戏代码_

前往游戏根目录
```bash
cd 游戏开发
```
执行游戏发布命令
```bash
icanvas build
```
游戏部署逻辑
_注：此例子将[默认模版](./example/README.md)的所有内容拷贝到"游戏开发/新游戏/project"中_
```bash
输入项目名称：新游戏
请输入模版Git地址!(空则使用默认模版)
开始部署？(确定[Y*]/取消[N])
```
前往新的游戏目录并安装游戏插件
```bash
cd 新游戏模版/project #进入游戏开发目录
npm install #安装游戏开发用到的插件
```