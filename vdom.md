# vdom起步

> 说明：完全参照`snabbdom`实现，包括配置、构建过程及使用的开发语言。是1:1复刻版本。

## 初始化项目
1. 进入到`VDom`目录下，运行`npm init`,生成`package.json`文件。
2. 按照`snabbdom`的`package.json`中依赖包安装依赖。

## 几个依赖包的说明

### `release-it`

这个包是自动化版本控制及包发布相关的工具。可以配置为执行`git`相关命令时触发，比如`commit、tag、push`等。发布`npm`包的时候也可以使用此工具进行管理。

> Generic CLI tool to automate versioning and package publishing related tasks.

### `@release-it/conventional-changelog`

这个包和`release-it`配合使用，记录更新日志。

### `cross-env`

这个包的作用是抹平命令行脚本在平台之间的差异性。这个包处在维护阶段，不会继续更新。最新的包是`cross-env-shell`。

## `TypesSript`相关

### 安装

将`TypesSript`安装为本地依赖即可。所使用的版本是`4.6.3`。 除此之外，还需要安装若干相关库。
- `@types/chai`，和`TypesSript`相关的断言库。
- `@types/lodash.shuffle`,为`TypesSript`提供功能的`lodash.shuffle`库。
- `@types/mocha`,为`TypesSript`提供功能的`mocha`库。
- `karma-typescript`,测试库
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`,解析`ESTree`的工具。

### 配置

`TypesSript`不能直接运行在浏览器环境，需要编译转换成`JavaScript`。在这个过程中需要使用配置文件来提供转换选项。

`TypesSript`有两种方式配置文件，`tsconfig.json` 和`jsconfig.json`，选择其中任何一种都可以。本项目使用 `tsconfig.json`。具体编译选项如下：

```tsconfig.json
	{
		"compilerOptions": {
			"removeComments": false,
			"sourceMap": true,
			
			"declaration": true,
			"strict": true,
			"strictFunctionTypes": false,
			"moduleResolution": "node",
			"target": "es6",
			
			"outDir": "build"
		},
		"include": ["./src/index.ts"]
	}

```
编译选项说明:

- `declaration`,为你工程中的每个 `TypeScript` 或 `JavaScript` 文件生成 `.d.ts` 文件。 这些 `.d.ts `文件是描述模块外部 `API` 的类型定义文件。 像 `TypeScript` 这样的哦你根据可以通过 `.d.ts `文件为非类型化的代码提供 `intellisense` 和精确的类型。

- `moduleResolution`,指定模块解析策略：'node' 。
- `strictFunctionTypes`,开启后表示对参数进行更严格的检查策略。
- `include`,相对配置文件的路径，找到数组中的项进行编译

### 编译

`TypesSript`使用`tsc`编译。在本工程中，配置在`package.json`的脚本段，使用`npm run build` 进行编译。

```
	"scripts":{
		"build" : "tsc && npm run bundle:cjs",
		"bundle:cjs": "rollup build/index.js --format cjs --file build/vdom.cjs.js"
	}
```


## 代码及版本管理相关

### 安装

需要安装`release-it`、`commithelper`、`@release-it/conventional-changelog`、`husky`、`conventional-changelog-angular`。

### 配置及执行

1. `release-it`的配置，需要在`package.json`文件中添加配置段，也可以在项目根目录下新建配置文件，在`package.json`配置如：

```
	"release-it": {
		"git": {
			"commitMessage": "chore(release): v${version}"
		},
		"github": {
			"release": true
		},
		"plugins": {
			"@release-it/conventional-changelog": {
				"preset": "angular",
				"infile": "CHANGELOG.md"
			}
		}
	},
```

> `release-it`在 `release`的时候起作用，`release`配置在脚本段中，使用`npm run release`执行发布。
```
	"scripts":{
		"release":"npm run test && release-it"
	}
```

2. `commithelper`的作用是是提交代码时的信息规范化，有提示和检查两种功能。通过回答问题的方式填写提交信息，并在在提交阶段检查提交信息是否规范。 `commithelper`的配置，需要在`package.json`文件中添加配置段：

```
	"commithelper": {
		"scopeOverrides": {
			"chore": [
				"tools",
				"refactor",
				"release",
				"test",
				"deps",
				"docs",
				"examples"
			]
		}
  	}
```

> `commithelper` 的执行需要在`package.json`的脚本段中添加`npm`命令：
```
	"scripts":{
		"prepare":"husky install"
	}
```
`husky`是一个产生`git hook`的库，当提交代码的时候执行一些指令。
当执行`npm run prepare`的时候，终端会提示：`husky - Git hooks installed`,这样会在项目的根目录下产生一个`.husky`的目录，手动在下边添加四个文件。分别是`.gitignore`、`commit-msg`、`pre-commit`和`prepare-commit-msg`。有了这些文件，就可以在文件中和`commithelper`产生关联了。
`commit-msg`中的脚本是：
```
	#!/bin/sh
	. "$(dirname "$0")/_/husky.sh"

	./node_modules/.bin/commithelper check --file $1 --fix
```
就是在执行`git commit`的时候检查提交信息是否符合规范。

`pre-commit`中的脚本是：
```
	#!/bin/sh
	. "$(dirname "$0")/_/husky.sh"

	./node_modules/.bin/lint-staged

```
就是在`git commit`之前，使用`lint-staged`检查代码的规范性。

`prepare-commit-msg`中的脚本是：
```
	#!/bin/sh
	. "$(dirname "$0")/_/husky.sh"

	exec < /dev/tty && ./node_modules/.bin/commithelper prompt --file $1
```
同样，通过问答的方式填写提交信息，并检查。