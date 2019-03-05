var config = require( './build.config.js' );

process.env.release = true;
console.log( '=== Release: ' + process.env.release );
console.log( '=== Release Cdn: ' + process.env.release_cdn );

var webpack = require( 'webpack' ),
  cleanWebpackPlugin = require( 'clean-webpack-plugin' ),
  htmlWebpackPlugin = require( 'html-webpack-plugin' ),
  copyWebpackPlugin = require( 'copy-webpack-plugin' );

var entries = {
  'common': config.paths.commonJs,
  'app': config.paths.appJs
};

var plugins = [
  new cleanWebpackPlugin( [ config.names.dist ], {
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
    chunks: [ 'common', 'app' ],
    chunksSortMode: function ( a, b ) {
      return a.names[ 0 ] > b.names[ 0 ] ? -1 : 1;
    }
  } ),
  new webpack.optimize.UglifyJsPlugin( {
    compress: {
      warnings: false,
      properties: true,
      sequences: true,
      dead_code: true,
      conditionals: true,
      comparisons: true,
      evaluate: true,
      booleans: true,
      unused: true,
      loops: true,
      hoist_funs: true,
      cascade: true,
      if_return: true,
      join_vars: true,
      drop_console: true,
      drop_debugger: true,
      unsafe: true,
      hoist_vars: true,
      negate_iife: true,
      side_effects: true
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
    loader: 'app-loader?md5=true!ng-annotate!babel?presets[]=es2015',
    exclude: /node_modules/
  },
  {
    test: /views.*\.js$/,
    loader: 'views-loader!ng-annotate!babel?presets[]=es2015',
    exclude: /node_modules/
  },
  {
    test: /\.js$/,
    loader: 'ng-annotate!babel?presets[]=es2015',
    exclude: /node_modules/
  },
  {
    test: /\.css$/,
    loader: 'style!css',
  },
  {
    test: /\.less$/,
    loader: 'style!css!less',
  },
  {
    test: /\.(png|jpg|jpeg|gif|webp|svg)$/,
    loader: 'url-loader?name=images/[name].[ext]&limit=8192'
  },
  {
    test: /\.(ttf|otf|woff|woff2|eot)$/,
    loader: 'url-loader?name=fonts/[name].[ext]'
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
    path: config.dirs.dist,
    filename: config.names.js + '/[name].js',
    publicPath: process.env.release_cdn || ''
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
  plugins: plugins
};


module.exports = config;
