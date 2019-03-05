var config = require( './build.config.js' );

var webpack = require( 'webpack' ),
  cleanWebpackPlugin = require( 'clean-webpack-plugin' ),
  htmlWebpackPlugin = require( 'html-webpack-plugin' ),
  copyWebpackPlugin = require( 'copy-webpack-plugin' );

var entries = {
  'frame': config.paths.frameJs,
  'common': config.paths.commonJs,
  'app': config.paths.appJs
};

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new cleanWebpackPlugin( [ config.names.build ], {
    root: config.dirs.root,
    verbose: true,
    dry: false
  } ),
  new copyWebpackPlugin( [
    { from: config.dirs.assets, to: config.names.assets }
  ] ),
  new htmlWebpackPlugin( {
    filename: config.names.indexHtml,
    template: config.paths.index,
    inject: 'body',
    chunks: [ 'frame', 'common', 'app' ],
    chunksSortMode: function ( a, b ) {
      return a.names[ 0 ] > b.names[ 0 ] ? -1 : 1;
    }
  } )
];

var routers = require( './build.router.js' );

routers.forEach( function ( item, i ) {
  entries[ config.prefixes.views + item.name ] = item.path;
} );

var loaders = [
  {
    test: /app.js$/,
    loader: 'app-loader!babel?presets[]=es2015',
    exclude: /node_modules/
  },
  {
    test: /views.*\.js$/,
    loader: 'views-loader!babel?presets[]=es2015',
    exclude: /node_modules/
  },
  {
    test: /\.js$/,
    loader: 'babel?presets[]=es2015',
    exclude: /node_modules/
  },
  {
    test: /\.less$/,
    loader: 'style!css!autoprefixer!less',
  },
  {
    test: /\.css$/,
    loader: 'style!css!autoprefixer',
  },
  {
    test: /\.(png|jpg|jpeg|gif|webp|svg)\??.*$/,
    loader: 'url-loader?name=styles/images/[name].[hash:8].[ext]'
  },
  {
    test: /\.(ttf|otf|woff|woff2|eot)\??.*$/,
    loader: 'url-loader?name=fonts/[name].[hash:8].[ext]'
  },
  {
    test: /\.html$/,
    loader: 'raw'
  }
];

var config = {
  target: 'web',
  cache: true,
  entry: entries,
  output: {
    path: config.dirs.build,
    filename: config.names.js + '/[name].js'
  },
  module: {
    loaders: loaders
  },
  resolveLoader: {
    alias: {
      "views-loader": config.paths.viewsLoader,
      "app-loader": config.paths.appLoader
    }
  },
  resolve: {
    alias: {
      "common": config.dirs.common,
      "assets": config.dirs.assets
    }
  },
  plugins: plugins,
  devServer: {
    contentBase: config.dirs.build,
    outputPath: config.dirs.build,
    inline: true,
    open: true,
    progress: true,
    colors: true,
    watchOptions: {
      // 默认监听时间，影响多久查看一次项目源码的变化，从而刷新浏览器页面
      poll: 500
    },
    // 默认监听端口
    port: 9010,
    // 代理设置
    proxy: require( './build.proxy.js' )
  }
};


module.exports = config;
