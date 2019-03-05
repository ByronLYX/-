var path = require( 'path' ),
  config = require( './build.config.js' ),
  utils = require( './build.utils.js' );

const PLACEHOLDER_ROUTE_NAME = /#RouteName#/g;
const PLACEHOLDER_CONTROLLER = /controller[ ]*\([ ]*['"][^'^"]*['"]/;
const PREFIX = "window." + config.arguments.templates + " = window." + config.arguments.templates + " || {};window." + config.arguments.templates + "['#RouteName#'] = require('./index.html');";

module.exports = function ( source ) {
  this.cacheable();
  var resourceName = path.win32.basename( this.resourcePath );
  if ( resourceName != config.names.controllerJs ) {
    return source;
  }
  var relativePath = this.context.replace( config.dirs.views, '' );
  var routeName = utils.generateRouteName( relativePath );
  var controllerName = utils.generateStateName( routeName ) + config.suffixes.controller;
  console.log( '=== views-loader { RouteName: ' + routeName + ', ControllerName: ' + controllerName + ' }' );
  var prefix = PREFIX.replace( PLACEHOLDER_ROUTE_NAME, routeName );
  return prefix + source.replace( PLACEHOLDER_CONTROLLER, 'controller(\'' + controllerName + '\'' );
}
