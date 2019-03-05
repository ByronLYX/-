var routers = require( './build.router.js' ),
  config = require( './build.config.js' ),
  utils = require( './build.utils.js' );

var cdn = process.env.release_cdn || '';
const TEMPLATE_STATE = "{name:'#StateName#',url:'#RouteUrl#',templateProvider:function(){return window." + config.arguments.templates + "['#RouteName#'];},controller:'#StateName#" + config.suffixes.controller + "',resolve:{loadController:['$ocLazyLoad',function($ocLazyLoad){return $ocLazyLoad.load('" + cdn + config.names.js + "/views.#RouteName#.js');}]}}";
const PLACEHOLDER_STATE_NAME = /#StateName#/g;
const PLACEHOLDER_ROUTE_NAME = /#RouteName#/g;
const PLACEHOLDER_ROUTE_URL = /#RouteUrl#/g;

module.exports = function ( source ) {
  this.cacheable();
  var states = [];
  routers.forEach( function ( router ) {
    var stateName = utils.generateStateName( router.name );
    console.log( '=== app-loader {RouteName: ' + router.name + ', RouteUrl: ' + router.url + ', StateName: ' + stateName + ' }' );
    states.push( TEMPLATE_STATE.replace( PLACEHOLDER_ROUTE_NAME, router.name ).replace( PLACEHOLDER_ROUTE_URL, router.url ).replace( PLACEHOLDER_STATE_NAME, stateName ) );
  } );
  var statesJs = 'var ' + config.arguments.states + '=[' + states.join( ',' ) + '];';
  var menusJs = process.env.release ? '' : 'var ' + config.arguments.menus + '=require("./menus.js");';
  var globalJs = 'window.' + config.arguments.ibss + '=window.' + config.arguments.ibss + '||{};window.' + config.arguments.ibss + '.' + config.arguments.assetsPrefix + '="' + (process.env.release_cdn || './') + '";';
  console.log( '=== app-loader { StatesJs: ' + statesJs + ', MenusJs: ' + menusJs + ', GlobalJs: ' + globalJs + ' }' );
  return globalJs + statesJs + menusJs + source;
}
