import _ from 'lodash';
import Parser from './parser';

// base menu string for initial document creation
const docStr = '<document><menuBarTemplate><menuBar></menuBar></menuBarTemplate></document>';

// indicate whether the menu was created
let created = false;

// few private instances
let doc = Parser.dom(docStr);
let menuBarEl = (doc.getElementsByTagName('menuBar')).item(0);
let menuBarTpl = (doc.getElementsByTagName('menuBarTemplate')).item(0);
let menuBarFeature = menuBarEl && menuBarEl.getFeature('MenuBarDocument');
let itemsCache = {};

// default menu options
let defaults = {
    attributes: {},
    rootTemplateAttributes: {},
    items: []
};

/**
 * Sets the default menu options
 *
 * @inner
 * @alias module:menu.setOptions
 *
 * @param {Object} cfg The configuration object
 */
function setOptions(cfg = {}) {
    console.log('setting menu options...', cfg);
    // override the default options
    _.assign(defaults, cfg);
}

/**
 * Iterates and sets attributes to an element.
 *
 * @private
 * 
 * @param {Element} el 			The element to set attributes on
 * @param {Object} attributes 	Attributes key value pairs.
 */
function setAttributes(el, attributes) {
	console.log('setting attributes on element...', el, attributes);
    _.each(attributes, (value, name) => el.setAttribute(name, value));
}

/**
 * Returns instance of the menu document (auto create if not already created)
 *
 * @inner
 * @alias module:menu.get
 * 
 * @return {Document}		Instance of the created menu document.
 */
function get() {
    if (!created) {
        create();
    }
    return doc;
}

/**
 * Adds menu item to the menu document.
 *
 * @private
 * 
 * @param {Object} item 	The configuration realted to the menu item.
 */
function addItem(item = {}) {
    if (!item.id) {
        console.warn('Cannot add menuitem. A unique identifier is required for the menuitem to work correctly.');
        return;
    }
    let el = doc.createElement('menuItem');
    // assign unique id
    item.attributes = _.assign({}, item.attributes, {
        id: item.id
    });
    // add all attributes
    setAttributes(el, item.attributes);
    // add title
    el.innerHTML = `<title>${(_.isFunction(item.name) ? item.name() : item.name)}</title>`;
    // add page reference
    el.page = item.page;
    // appends to the menu
    menuBarEl.insertBefore(el, null);
    // cache for later use
    itemsCache[item.id] = el;

    return el;
}

/**
 * Generates a menu from the configuration object.
 *
 * @example
 * ATV.Menu.create({
 *     attributes: {},  // menuBar attributes
 *     rootTemplateAttributes: {}, // menuBarTemplate attributes
 *     items: [{
 *         id: 'search',
 *         name: 'Search',
 *         page: SearchPage
 *     }, {
 *         id: 'homepage',
 *         name: 'Home',
 *         page: HomePage,
 *         attributes: {
 *             autoHighlight: true // auto highlight on navigate
 *         }
 *     }, {
 *         id: 'movies',
 *         name: 'Movies',
 *         page: MoviesPage
 *     }, {
 *         id: 'tvshows',
 *         name: 'TV Shows',
 *         page: TVShowsPage
 *     }]
 * });
 *
 * @inner
 * @alias module:menu.create
 * 
 * @param  {Object} cfg 		Menu related configurations
 * @return {Document}     		The created menu document
 */
function create(cfg = {}) {
    if (created) {
        console.warn('An instance of menu already exists, skipping creation...');
        return;
    }
    // defaults
    _.assign(defaults, cfg);
    
    console.log('creating menu...', defaults);
    
    // set attributes to the menubar element
    setAttributes(menuBarEl, defaults.attributes);
    // set attributes to the menubarTemplate element
    setAttributes(menuBarTpl, defaults.rootTemplateAttributes);
    // add all items to the menubar
    _.each(defaults.items, (item) => addItem(item));
    // indicate done
    created = true;

    return doc;
}

/**
 * Associate a document to the menuitem (using the menuitem's unique id).
 *
 * @inner
 * @alias module:menu.setDocument
 * 
 * @param {Document} doc        	The document to associate with the menuitem
 * @param {String} menuItemid		The id of the menu item as per the configuration
 */
function setDocument(doc, menuItemid) {
    let menuItem = itemsCache[menuItemid];

    if (!menuItem) {
        console.warn(`Cannot set document to the menuitem. The given id ${menuItemid} does not exist.`);
        return;
    }
    menuBarFeature.setDocument(doc, menuItem);
}

/**
 * Set the given menuitem as active (using the menuitem's unique id).
 *
 * @inner
 * @alias module:menu.setSelectedItem
 * 
 * @param {String} menuItemid 		The id of the menu item as per the configuration
 */
function setSelectedItem(menuItemid) {
    let menuItem = itemsCache[menuItemid];

    if (!menuItem) {
        console.warn(`Cannot select menuitem. The given id ${menuItemid} does not exist.`);
        return;
    }
    menuBarFeature.setSelectedItem(menuItem);
}

/**
 * A very minimalistic library to manage Apple TV menu bars.
 *
 * @module menu
 *
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default {
    /**
     * Whether the menu was already created.
     * @return {Boolean} Created
     */
    get created() { return created; },
    set created(val) { },
    setOptions: setOptions,
    create: create,
    get: get,
    setDocument: setDocument,
    setSelectedItem: setSelectedItem,
    /**
     * Get the menu loading message if provided in the config
     * @return {String} Loading message
     */
    getLoadingMessage() {
    	return (_.isFunction(defaults.loadingMessage) ? defaults.loadingMessage() : defaults.loadingMessage);
    },
    /**
     * Get the menu error message if provided in the config
     * @return {String} Error message
     */
    getErrorMessage(){
        return (_.isFunction(defaults.errorMessage) ? defaults.errorMessage() : defaults.errorMessage);
    }
};