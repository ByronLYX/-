# IBSS Common Archetype

## Install
1. cd $root
2. npm install
3. git submodule init
4. git submodule update --remote

## Bin
1. npm run dev 
> 打包文件并且进行监听，文件默认生成在 $root/build/ 文件夹内，每次生成会清空目标文件夹
2. npm run start
> 启动 node express web 服务器，构建文件存放在内存中，可以自动刷新修改内容 
3. npm run release
> 打包上线文件，文件默认生成在 $root/dist/ 文件夹内，每次生成会清空目标文件夹
4. npm run update
> 更新全部子模块

## Configurations
#### Build Configurations
    构建配置文件为 **$root/build-scripts/build.config.js**，具体说明查看配置文件注释
#### Webpack-dev-server Configurations
    配置文件为 **$root/build-scripts/webpack.build.js**，具体说明查看 config.devServer 注释，代理配置文件为 **$root/build-scripts/build.proxy.js**，具体说明查看配置文件注释
#### Menus Configurations
    配置文件为 **$root/src/menus.js**，具体设置参考文件内容
#### Project Configurations
    配置文件为 **$root/src/config.js**，标准 angular service 
    写法

## Usage
#### Create Project
    npm run create -- /path/to/project
    git init
    git submodule add -b master git@git.firstshare.cn:ibss-fe/ibss-common-frame.git src/common-frame
    git submodule add -b master git@git.firstshare.cn:ibss-fe/ibss-common-components.git src/common-components
#### Add New Module/Page

    默认在 **$root/views/** 目录下添加目录，如果需要生成页面路由的，在目录下增加 controller.js 文件，并且保证在目录下存在index.html 模板文件，这个操作会生成一个名为从 views 目录下直到当前目录的相对路径的路由，并且生成一个对应的 Controller 名称。

> 例如： 在 index 模块中新增一个名为 m1 的二级模块
>
>    1. 新建 $root/views/index/m1/index.html
>    2. 新建 $root/views/index/m1/controller.js
>    3. 按需添加相应的其他文件
>
> 最终会生成以下路由: /index/m1, Controller 名称为 indexm1Ctrl

**注意：** 文件 controller.js 的首个 controller 名称会被强制替换，确保 controller.js 文件的首个 controller 定义为路由定义

## Build Scripts Description
+ build.config.js
> 构建配置文件
+ build.proxy.js
> webpack-dev-server 代理配置文件
+ build.router.js
> 扫描自动生成路由脚本
+ build.utils.js
> 构建常用工具
+ loader.app.js
> 注入自动生成的路由脚本至 app.js
+ loader.views.js
> 注入模块模板文件至相应的 controller.js
+ plugin.manifest.js
> 生成 hash manifest 文件
+ plugin.replacement.js
> 上线时替换动态加载的 controller.js hash 文件至 app.js
+ webpack.build.js
> 开发构建配置文件
+ webpack.release.js
> 上线构建配置文件
