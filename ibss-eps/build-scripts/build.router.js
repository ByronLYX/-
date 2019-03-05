var path = require( 'path' ),
  fs = require( 'fs' ),
  config = require( './build.config.js' ),
  utils = require( './build.utils.js' );

function getControllers( parent, paths ) {
  var parentStat = fs.statSync( parent );
  if ( !parentStat.isDirectory ) {
    return;
  }

  var children = fs.readdirSync( parent );
  if ( !children ) {
    return;
  }
  children.forEach( function ( child, i ) {
    var childPath = path.join( parent, child );
    var childControllerJs = path.join( childPath, config.names.controllerJs );
    var childStat = fs.statSync( childPath );
    if ( childStat.isDirectory() ) {
      if ( fs.existsSync( childControllerJs ) ) {
        paths.push( childControllerJs );
      }
      getControllers( childPath, paths );
    }
  } );
}

function generateRouters() {
  var controllers = [], routers = [];
  getControllers( config.dirs.views, controllers );
  controllers.forEach( function ( controller, i ) {
    var controllerPath = path.dirname( controller );
    var url = utils.unixify( controllerPath.replace( config.dirs.views, '' ) );
    var name = utils.generateRouteName( url );
    routers.push( {
      path: controller,
      name: name,
      url: url
    } );
  } );
  return routers;
}

module.exports = generateRouters( config.dirs.views );
