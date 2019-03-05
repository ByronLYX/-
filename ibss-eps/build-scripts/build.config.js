var path = require( 'path' );

var root = path.join( __dirname, ".." ),
  // 构建过程中用到的变量名，谨慎修改，会影响最终的页面实现
  arguments = {
    // window 全局变量名, 所有 window 变量在该命名空间下
    ibss: 'IBSS',
    // 静态资源前缀
    assetsPrefix: 'ASSETS_PREFIX',
    // 各模块默认 HTML 模板文件缓存的 window 全局变量名
    templates: 'templates',
    // 自动生成的路由临时变量，最终会打包进 app.js
    states: 'states',
    // 自定义的菜单临时变量，最终会打包进 app.js
    menus: 'menus'
  },
  prefixes = {
    // 模块 js 文件前缀
    views: 'views.'
  },
  suffixes = {
    // 自动生成的路由 Controller 名称后缀
    controller: 'Ctrl'
  },
  names = {
    // 代码源目录
    src: 'src',
    // 代码开发构建目录
    build: 'build',
    // 代码上线构建目录
    dist: 'dist',
    // 代码构建相关脚本
    buildScripts: 'build-scripts',
    // 项目通用文件目录，该目录下的 $indexJs 文件会当作一个 webpack 构建入口
    common: 'common',
    // 项目通用资源目录，该目录会被完全复制至构建目录
    assets: 'assets',
    // 项目模块页面目录
    views: 'views',
    // 项目公共框架目录
    commonFrame: 'common-frame',
    // 项目公共组件目录
    commonComponents: 'common-components',
    // 项目输出 js 目录
    js: 'js',
    // 默认 index 脚本名称
    indexJs: 'index.js',
    // 默认公共框架脚本名称
    frameJs: 'index.js',
    // 默认项目入口文件名称
    appJs: 'app.js',
    // 默认菜单文件名称
    menuJs: 'menus.js',
    // 默认项目模板文件名称
    indexHtml: 'index.html',
    // 默认项目路由文件名称
    controllerJs: 'controller.js'
  },
  dirs = {
    root: root,
    src: path.join( root, names.src ),
    build: path.join( root, names.build ),
    dist: path.join( root, names.dist ),
    buildScripts: path.join( root, names.buildScripts ),
    frame: path.join( root, names.src, names.commonFrame ),
    common: path.join( root, names.src, names.common ),
    assets: path.join( root, names.src, names.assets ),
    assetsBuild: path.join( root, names.build, names.assets ),
    assetsDist: path.join( root, names.dist, names.assets ),
    views: path.join( root, names.src, names.views )
  },
  paths = {
    frameJs: path.join( dirs.frame, names.src, names.frameJs ),
    commonJs: path.join( dirs.common, names.indexJs ),
    appJs: path.join( dirs.src, names.appJs ),
    menuJs: path.join( dirs.src, names.menuJs ),
    index: path.join( dirs.src, names.indexHtml ),
    viewsLoader: path.join( dirs.buildScripts, 'loader.views.js' ),
    appLoader: path.join( dirs.buildScripts, 'loader.app.js' ),
    manifestLoader: path.join( dirs.buildScripts, 'loader.manifest.js' )
  };

module.exports = {
  arguments: arguments,
  prefixes: prefixes,
  suffixes: suffixes,
  names: names,
  dirs: dirs,
  paths: paths
};
