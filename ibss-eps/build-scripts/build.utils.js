module.exports = {
  unixify: function ( path ) {
    return path.replace( /\\/g, '/' );
  },

  generateRouteName: function ( relativePath ) {
    var unixifyPath = this.unixify( relativePath );
    if ( unixifyPath.startsWith( '\/' ) ) {
      unixifyPath = unixifyPath.substr( 1 );
    }
    return unixifyPath.replace( /\//g, '.' );
  },

  generateStateName: function ( routeName ) {
    return routeName.replace( /\./g, '' );
  }
};
