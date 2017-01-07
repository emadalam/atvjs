import _ from 'lodash';
import Parser from './parser';

// base menu string for initial document creation
const docStr = '<document><menuBarTemplate><menuBar></menuBar></menuBarTemplate></document>';

// indicate whether the menu was created
let created = false;

// few private instances
let doc;
let menuBarEl;
let menuBarFeature;
let itemsCache = {};

// default menu options
let defaults = {
    attributes: {},
    items: []
};

/**
 * Sets the default menu options
 *
 * @param {Object} cfg The configuration object {defaults}
 */
function setOptions(cfg = {}) {
    console.log('setting menu options...', cfg);
    // override the default options
    _.assign(defaults, cfg);
}

/**
 * Iterates and sets attributes to an element.
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
 * @return {Promise}		Promise with instance of the created menu document.
 */
function get() {
    if (!created) {
        return create();
    }
    return Promise.resolve(doc);
}

/**
 * Adds menu item to the menu document.
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
 * @param  {Object} cfg 		Menu related configurations
 * @return {Promise<Document>}     		Promise with created menu document
 */
function create(cfg = {}) {
    if (created) {
        console.warn('An instance of menu already exists, skipping creation...');
        return Promise.resolve(doc);
    }
    // defaults
    _.assign(defaults, cfg);
    
    console.log('creating menu...', defaults);

    return Parser.dom(docStr)
        .then(function (res) {
            doc = res;
            menuBarEl = (doc.getElementsByTagName('menuBar')).item(0);
            menuBarFeature = menuBarEl && menuBarEl.getFeature('MenuBarDocument');
            // set attributes to the menubar element
            setAttributes(menuBarEl, defaults.attributes);
            // add all items to the menubar
            _.each(defaults.items, (item) => addItem(item));
            // indicate done
            created = true;
            return doc;
        });
}

/**
 * Associate a document to the menuitem (using the menuitem's unique id).
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
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default {
    get created() { return created; },
    set created(val) { },
    setOptions: setOptions,
    create: create,
    get: get,
    setDocument: setDocument,
    setSelectedItem: setSelectedItem,
    getLoadingMessage() {
    	return (_.isFunction(defaults.loadingMessage) ? defaults.loadingMessage() : defaults.loadingMessage);
    },
    getErrorMessage(){
        return (_.isFunction(defaults.errorMessage) ? defaults.errorMessage() : defaults.errorMessage);
    }
};