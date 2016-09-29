// external libraries
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
     * Internal alias to lodash library
     * @type {https://github.com/lodash/lodash}
     */
    _: _,
    /**
     * Internal alias to lz-string compression library
     * @type {https://github.com/pieroxy/lz-string/}
     */
    LZString: LZString,
    /**
     * Ajax wrapper using Promises
     * @type {./ajax.js}
     */
    Ajax: Ajax,
    /**
     * Page level navigation methods.
     * @type {./navigation.js}
     */
    Navigation: Navigation,
    /**
     * Page Creation
     * @type {./page.js}
     */
    Page: Page,
    /**
     * A minimalistic parser wrapper using the builtin DOMParser
     * @type {./parser.js}
     */
    Parser: Parser,
    /**
     * Basic event handling including some default ones
     * @type {./handler.js}
     */
    Handler: Handler,
    /**
     * Apple TV settings object with some basic helpers
     * @type {./settings.js}
     */
    Settings: Settings,
    /**
     * TVML menu template creation with few utility methods
     * @type {./menu.js}
     */
    Menu: Menu
};

/**
 * Iterates over each libraries and call setOptions with the relevant options.
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
    onLaunch(options = {}, fn) {
        libs.launchOptions = options;
        console.log('launching application...');
        fn(options);
    },
    onError(options = {}, fn) {
        console.log('an error occurred in the application...')
        fn(options);
    },
    onResume(options = {}, fn) {
        console.log('resuming application...');
        fn(options);
    },
    onSuspend(options = {}, fn) {
        console.log('suspending application...');
        fn(options);
    },
    onExit(options = {}, fn) {
        console.log('exiting application...');
        fn(options);
    },
    onReload(options = {}, fn) {
        console.log('reloading application...');
        fn(options);
    }
};

/**
 * Iterates over each supported handler types and attach it on the Apple TV App object.
 *
 * @param  {Object} cfg 	All configuration options relevant to the App.
 */
function initAppHandlers (cfg = {}) {
	_.each(handlers, (handler, name) => App[name] = _.partial(handler, _, (_.isFunction(cfg[name])) ? cfg[name] : _.noop));
}

/**
 * Starts the Apple TV application after applying the relevant configuration options
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
 * A minimalistic JavaScript SDK for Apple TV application development.
 * It assumes the code is run in an environment where TVJS is present (or at least mocked).
 *
 * @author eMAD <emad.alam@yahoo.com>
 */
module.exports = libs;
