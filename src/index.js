// external libraries
import 'babel-polyfill';
import _ from 'lodash';
import PubSub from 'pubsub-js';
import LZString from 'lz-string';

// internal libraries
import Parser from './parser';
import Ajax from './ajax';
import Page from './page';
import Navigation from './navigation';
import Handler from './handler';
import Settings from './settings';
import Menu from './menu';

// all supported configurations for each of the libraries
const configMap = {
	Ajax: [],
	Parser: [],
	Page: ['style'],
	Navigation: ['menu', 'templates'],
	Handler: ['handlers'],
};

// indicate whether the application was started
let started = false;

// all libraries
let libs = {
    /**
     * Internal alias to [lodash]{@link https://github.com/lodash/lodash} library
     * @alias module:ATV._
     */
    _: _,
    /**
     * Internal alias to [lz-string compression]{@link https://github.com/pieroxy/lz-string/} library
     * @alias module:ATV.LZString
     */
    LZString: LZString,
    /**
     * Ajax wrapper using Promises
     * @alias module:ATV.Ajax
     * @type {module:ajax}
     */
    Ajax: Ajax,
    /**
     * Page level navigation methods.
     * @alias module:ATV.Navigation
     * @type {module:navigation}
     */
    Navigation: Navigation,
    /**
     * Page Creation
     * @alias module:ATV.Page
     * @type {module:page}
     */
    Page: Page,
    /**
     * A minimalistic parser wrapper using the builtin DOMParser
     * @alias module:ATV.Parser
     * @type {module:parser}
     */
    Parser: Parser,
    /**
     * Basic event handling including some default ones
     * @alias module:ATV.Handler
     * @type {module:handler}
     */
    Handler: Handler,
    /**
     * Apple TV settings object with some basic helpers
     * @alias module:ATV.Settings
     * @type {module:settings}
     */
    Settings: Settings,
    /**
     * TVML menu template creation with few utility methods
     * @alias module:ATV.Menu
     * @type {module:menu}
     */
    Menu: Menu,
    /**
     * Create a page that can be later used for navigation.
     * This is an alias of ATV.Page.create 
     * @param  {String|Object} name     Name of the page or the configuration options
     * @param  {Object} cfg             Page configuration options
     * @return {Function}               A function that returns promise upon execution
     */
    createPage: Page.create,
    /**
     * Generates a menu from the configuration object.
     * This is an alias of ATV.Menu.create 
     * @param  {Object} cfg 		Menu related configurations
     * @return {Document}     		The created menu document
     */
    createMenu: Menu.create,
    /**
     * Navigates to the provided page if it exists in the list of available pages.
     * This is an alias of ATV.Navigation.navigate 
     * @param  {String} page        Name of the previously created page.
     * @param  {Object} options     The options that will be passed on to the page during runtime.
     * @param  {Boolean} replace    Replace the previous page.
     * @return {Promise}            Returns a Promise that resolves upon successful navigation.
     */
    navigateTo: Navigation.navigate,
    /**
     * Navigates to the menu page if it exists
     * This is an alias of ATV.Navigation.navigateToMenuPage 
     * @return {Promise}      Returns a Promise that resolves upon successful navigation.
     */
    navigateToMenuPage: Navigation.navigateToMenuPage,
    /**
     * Shows a modal. Closes the previous modal before showing a new modal.
     * This is an alias of ATV.Navigation.presentModal 
     * @param  {Document|String|Object} modal       The TVML string/document representation of the modal window or a configuration object to create modal from
     * @return {Document}                           The created modal document
     */
    presentModal: Navigation.presentModal,
    /**
     * Dismisses the current modal window.
     * This is an alias of ATV.Navigation.dismissModal 
     */
    dismissModal: Navigation.dismissModal
};

/**
 * Iterates over each libraries and call setOptions with the relevant options.
 *
 * @private
 *
 * @param  {Object} cfg 	All configuration options relevant to the libraries
 */
function initLibraries(cfg = {}) {
	_.each(configMap, (keys, libName) => {
		let lib = libs[libName];
		let options = {};
		_.each(keys, (key) => options[key] = cfg[key]);
		lib.setOptions && lib.setOptions(options);
	});
}

// all supported Apple TV App level handlers
const handlers = {
    /**
     * App launch event
     *
     * @event onLaunch
     * @alias module:ATV#onLaunch
     */
    onLaunch(options = {}, fn) {
        libs.launchOptions = options;
        console.log('launching application...');
        fn(options);
    },
    /**
     * App error event
     *
     * @event onError
     * @alias module:ATV#onError
     */
    onError(options = {}, fn) {
        console.log('an error occurred in the application...')
        fn(options);
    },
    /**
     * App resume event
     *
     * @event onResume
     * @alias module:ATV#onResume
     */
    onResume(options = {}, fn) {
        console.log('resuming application...');
        fn(options);
    },
    /**
     * App suspend event
     *
     * @event onSuspend
     * @alias module:ATV#onSuspend
     */
    onSuspend(options = {}, fn) {
        console.log('suspending application...');
        fn(options);
    },
    /**
     * App exit event
     *
     * @event onExit
     * @alias module:ATV#onExit
     */
    onExit(options = {}, fn) {
        console.log('exiting application...');
        fn(options);
    },
    /**
     * App reload event
     *
     * @event onReload
     * @alias module:ATV#onReload
     */
    onReload(options = {}, fn) {
        console.log('reloading application...');
        fn(options);
    }
};

/**
 * Iterates over each supported handler types and attach it on the Apple TV App object.
 *
 * @private
 *
 * @param  {Object} cfg 	All configuration options relevant to the App.
 */
function initAppHandlers (cfg = {}) {
	_.each(handlers, (handler, name) => App[name] = _.partial(handler, _, (_.isFunction(cfg[name])) ? cfg[name] : _.noop));
}

/**
 * Starts the Apple TV application after applying the relevant configuration options
 *
 * @example
 * // create your pages
 * let SearchPage = ATV.Page.create({ page configurations });
 * let HomePage = ATV.Page.create({ page configurations });
 * let MoviesPage = ATV.Page.create({ page configurations });
 * let TVShowsPage = ATV.Page.create({ page configurations });
 * let LoginPage = ATV.Page.create({ page configurations });
 *
 * // template functions
 * const loaderTpl = (data) => `<document>
 *     <loadingTemplate>
 *         <activityIndicator>
 *             <title>${data.message}</title>
 *         </activityIndicator>
 *     </loadingTemplate>
 * </document>`;
 *
 * const errorTpl = (data) => `<document>
 *     <descriptiveAlertTemplate>
 *           <title>${data.title}</title>
 *           <description>${data.message}</description>
 *       </descriptiveAlertTemplate>
 *   </document>`;
 *
 * // Global TVML styles
 * let globalStyles = `
 * .text-bold {
 *     font-weight: bold;
 * }
 * .text-white {
 *     color: rgb(255, 255, 255);
 * }
 * .dark-background-color {
 *     background-color: #091a2a;
 * }
 * .button {
 *     background-color: rgba(0, 0, 0, 0.1);
 *     tv-tint-color: rgba(0, 0, 0, 0.1);
 * }
 * `;
 *
 * // start your application by passing configurations
 * ATV.start({
 *     style: globalStyles,
 *     menu: {
 *         attributes: {},
 *         items: [{
 *             id: 'search',
 *             name: 'Search',
 *             page: SearchPage
 *         }, {
 *             id: 'homepage',
 *             name: 'Home',
 *             page: HomePage,
 *             attributes: {
 *                 autoHighlight: true // auto highlight on navigate
 *             }
 *         }, {
 *             id: 'movies',
 *             name: 'Movies',
 *             page: MoviesPage
 *         }, {
 *             id: 'tvshows',
 *             name: 'TV Shows',
 *             page: TVShowsPage
 *         }]
 *     },
 *     templates: {
 *         // loader template
 *         loader: loaderTpl,
 *         // global error template
 *         error: errorTpl,
 *         // xhr status based error messages
 *         status: {
 *             '404': () => errorTpl({
 *                 title: '404',
 *                 message: 'The given page was not found'
 *             }),
 *             '500': () => errorTpl({
 *                 title: '500',
 *                 message: 'An unknown error occurred, please try again later!'
 *             })
 *         }
 *     },
 *     // global event handlers that will be called for each of the pages
 *     handlers: {
 *         select: {
 *             globalSelecthandler(e) {
 *                 let element = e.target;
 *                 let someElementTypeCheck = element.getAttribute('data-my-attribute');
 *
 *                 if (elementTypeCheck) {
 *                     // perform action
 *                 }
 *             }
 *         }
 *     },
 *     onLaunch(options) {
 *         // navigate to menu page
 *         ATV.Navigation.navigateToMenuPage();
 *         // or you can navigate to previously created page
 *         // ATV.Navigation.navigate('login');
 *     }
 * });
 *
 * @inner
 * @alias module:ATV.start
 * @fires onLaunch
 *
 * @param  {Object} cfg 		Configuration options
 */
function start(cfg = {}) {
	if (started) {
		console.warn('Application already started, cannot call start again.');
		return;
	}

    initLibraries(cfg);
	initAppHandlers(cfg);
    // if already bootloaded somewhere
    // immediately call the onLaunch method
    if (cfg.bootloaded) {
        App.onLaunch(App.launchOptions);
    }
	started = true;
}

/**
 * Reloads the application with the provided options and data.
 *
 * @example
 * ATV.reload({when: 'now'}, {customData});
 *
 * @inner
 * @alias module:ATV.reload
 * @fires onReload
 *
 * @param  {Object} [options]           Options value. {when: 'now'} // or 'onResume'
 * @param  {Object} [reloadData]        Custom data that needs to be passed while reloading the app
 */
function reload(options, reloadData) {
    App.onReload(options);
    App.reload(options, reloadData);
}

// add all utility methods
_.assign(libs, PubSub, {
    start: start,
    reload: reload
});

/**
 * Dependency free publish/subscribe for JavaScript.
 * @external pubsub-js
 * @see https://github.com/mroderick/PubSubJS
 */

/**
 * A minimalistic JavaScript SDK for Apple TV application development.
 * It assumes the code is run in an environment where [TVMLKit JS]{@link https://developer.apple.com/documentation/tvmljs} is present (or at least mocked).
 *
 * @module ATV
 * @extends external:pubsub-js
 *
 * @fires onLaunch
 * @fires onError
 * @fires onResume
 * @fires onSuspend
 * @fires onExit
 * @fires onReload
 *
 * @author eMAD <emad.alam@yahoo.com>
 */
module.exports = libs;
