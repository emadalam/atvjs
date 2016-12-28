import Navigation from './navigation';
import Menu from './menu';

// element level attribute that will be used for link to another pages
const hrefAttribute = 'data-href-page';
const hrefOptionsAttribute = 'data-href-page-options';
const hrefPageReplaceAttribute = 'data-href-page-replace';
const modalCloseBtnAttribute = 'data-alert-dissmiss';
const menuItemReloadAttribute = 'reloadOnSelect';

/**
 * Page level default handlers.
 *
 * @type {Object}
 * @property {Object} select All the handlers associated to the select event.
 */
let handlers = {
    select: {
        /**
         * A handler to allow declaring anchors to other pages in the TVML templates.
         *
         * @example <caption>A typical usage would be something like:</caption>
         *     <TVML TEMPLATE>
         *         ...
         *
         *         <lockup data-href-page="details" data-href-page-options="{id: 'MOVIE_ID'}">
         *             ...
         *         </lockup>
         *
         *         ...
         *     </END TEMPLATE>
         *     which will navigate to the details page with the provided options object
         *
         * @private
         * @param  {Event} e    The event passed while this handler is invoked.
         */
        onLinkClick(e) {
            let element = e.target;
            let page = element.getAttribute(hrefAttribute);
            let replace = element.getAttribute(hrefPageReplaceAttribute);

            if (!page) return;

            let options = element.getAttribute(hrefOptionsAttribute);
            options = options || "{}";

            // try to make the options object
            try {
                options = JSON.parse(options);
            } catch (ex) {
                console.warn(`Invalid value for the page options (${hrefOptionsAttribute}=${options}) in the template.`);
                options = {};
            }

            Navigation.navigate(page, options, replace); // perform navigation
        },
        /**
         * A handler that will allow declaring modal dismiss button in the TVML alert templates.
         *
         * @example <caption>A typical usage would be something like:</caption>
         *          
         *          <TVML ALERT TEMPLATE>
         *              
         *              ...
         *
         *              <button data-alert-dissmiss="close">
         *                  <text>Cancel</text>
         *              </button>
         *              
         *              ...
         *              
         *          </END TEMPLATE>
         *
         * @private
         * @param  {Event} e    The event passed while this handler was invoked
         */
        onModalCloseBtnClick(e) {
            let element = e.target;
            let closeBtn = element.getAttribute(modalCloseBtnAttribute);

            if (closeBtn) {
                console.log('close button clicked within the modal, dismissing modal...');
                Navigation.dismissModal();
            }
        },
        /**
         * Handler for menu navigation
         *
         * @private
         * @param  {Event} e    The event passed while this handler was invoked
         */
        onMenuItemSelect(e) {
            let element = e.target;
            let menuId = element.getAttribute('id');
            let elementType = element.nodeName.toLowerCase();
            let page = element.page;

            if (elementType === 'menuitem') {
                // no need to proceed if the page is already loaded or there is no page definition present
                if ((!element.pageDoc || element.getAttribute(menuItemReloadAttribute)) && page) {
                    // set a loading message intially to the menuitem
                    Menu.setDocument(Navigation.getLoaderDoc(Menu.getLoadingMessage()), menuId)
                    // load the page
                    page().then((doc) => {
                        // if there is a document loaded, assign it to the menuitem
                        if (doc) {
                            // assign the pageDoc to disable reload everytime
                            element.pageDoc = doc;
                            Menu.setDocument(doc, menuId);
                        }
                        // dissmiss any open modals
                        Navigation.dismissModal();
                    }, (error) => {
                        // if there was an error loading the page, set an error page to the menu item
                        Menu.setDocument(Navigation.getErrorDoc(error), menuId);
                        // dissmiss any open modals
                        Navigation.dismissModal();
                    });
                }
            }
        }
    }
};

/**
 * Sets the default handlers options
 *
 * @param {Object} cfg The configuration object {defaults}
 */
function setOptions(cfg = {}) {
    console.log('setting handler options...', cfg);
    // override the default options
    _.defaultsDeep(handlers, cfg.handlers);
}

/**
 * Iterates over the events configuration and add event listeners to the document.
 *
 * @example
 *     {
 *         events: {
 *             'scroll': function(e) { // do the magic here },
 *             'select listItemLockup title': 'onTitleSelect',
 *             'someOtherEvent': ['onTitleSelect', function(e) { // some other magic }, ...]
 *         },
 *         onTitleSelect: function(e) {
 *             // do the magic here
 *         }
 *     }
 * 
 * @todo Implement querySelectorAll polyfill (it doesn't seem to exist on the xml document)
 * 
 * @param {Document} doc            The document to add the listeners on.
 * @param {Object} cfg              The page object configuration.
 * @param {Boolean} [add=true]      Whether to add or remove listeners. Defaults to true (add)
 */
function setListeners(doc, cfg = {}, add = true) {
    if (!doc || !(doc instanceof Document)) {
        return;
    }

    let listenerFn = doc.addEventListener;
    if (!add) {
        listenerFn = doc.removeEventListener;
    }
    if (_.isObject(cfg.events)) {
        let events = cfg.events;
        
        _.each(events, (fns, e) => {
            let [ev, selector] = e.split(' ');
            let elements = null;
            if (!_.isArray(fns)) { // support list of event handlers
                fns = [fns];
            }
            if (selector) {
                selector = e.substring(e.indexOf(' ') + 1); // everything after space
                elements = _.attempt(() => doc.querySelectorAll(selector)); // catch any errors while document selection
            } else {
                elements = [doc];
            }
            elements = _.isError(elements) ? [] : elements;
            _.each(fns, (fn) => {
                fn = _.isString(fn) ? cfg[fn] : fn; // assume the function to be present on the page configuration obeject
                if (_.isFunction(fn)) {
                    console.log((add ? 'adding' : 'removing') + ' event on documents...', ev, elements);
                    _.each(elements, (el) => listenerFn.call(el, ev, (e) => fn.call(cfg, e))); // bind to the original configuration object
                }
            });
        })
    }
}

/**
 * Syntactical sugar to {setListeners} with add=true
 *
 * @param {Document} doc        The document to add the listeners on.
 * @param {Object} cfg          The page object configuration.
 */
function addListeners(doc, cfg) {
    setListeners(doc, cfg, true);
}

/**
 * Syntactical sugar to {setListeners} with add=false
 *
 * @param {Document} doc        The document to add the listeners on.
 * @param {Object} cfg          The page object configuration.
 */
function removeListeners(doc, cfg) {
    setListeners(doc, cfg, false);
}

/**
 * Iterates over the list of page level default handlers and set/unset listeners on the provided document.
 *
 * @private
 * @param {Document} doc            The document to set/unset listeners on.
 * @param {Boolean} [add=true]      Whether to add or remove listeners. Defaults to true (add)
 */
function setDefaultHandlers(doc, add = true) {
    if (!doc || !(doc instanceof Document)) {
        return;
    }

    let listenerFn = doc.addEventListener;
    if (!add) {
        listenerFn = doc.removeEventListener;
    }

    // iterate over all the handlers and add it as an event listener on the doc
    for (let name in handlers) {
        for (let key in handlers[name]) {
            listenerFn.call(doc, name, handlers[name][key]);
        }
    }
}

/**
 * Syntactical sugar to {setDefaultHandlers} with add=true
 *
 * @param {Document} doc        The document to add the listeners on.
 */
function addDefaultHandlers(doc) {
    setDefaultHandlers(doc, true);
}

/**
 * Syntactical sugar to {setDefaultHandlers} with add=false
 *
 * @param {Document} doc        The document to add the listeners on.
 */
function removeDefaultHandlers(doc) {
    setDefaultHandlers(doc, false);
}

/**
 * Sets/unsets the event handlers as per the event configuration.
 * Also adds/removes the default page level handlers.
 * 
 * @param {Document}  doc           The page document.
 * @param {Obejct}  cfg             Page configuration object
 * @param {Boolean} [add=true]      Whether to add or remove the handlers
 */
function setHandlers(doc, cfg, add = true) {
    if (add) {
        addDefaultHandlers(doc);
        addListeners(doc, cfg);    
    } else {
        removeDefaultHandlers(doc);
        removeListeners(doc, cfg);
    }
}

/**
 * Syntactical sugar to {setHandlers} with add=true
 *
 * @param {Document} doc        The document to add the listeners on.
 * @param {Object} cfg          Page configuration object
 */
function addHandlers(doc, cfg) {
    setHandlers(doc, cfg, true);
}

/**
 * Syntactical sugar to {setHandlers} with add=false
 *
 * @param {Document} doc        The document to add the listeners on.
 * @param {Object} cfg          Page configuration object
 */
function removeHandlers(doc, cfg) {
    setHandlers(doc, cfg, false);
}

/**
 * A minimalistic Event handling library for Apple TV applications
 *
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default {
    /**
     * @type {setOptions}
     */
    setOptions: setOptions,
    /**
     * Adds an event listener to the document with event configuration options.
     * @type {addListener}
     */
    addListeners: addListeners,
    /**
     * Removes previously added listeners from the document having event configuration options.
     * @type {[type]}
     */
    removeListeners: removeListeners,
    /**
     * Adds all the event listeners from the document including the default ones.
     * @type {addHandlers}
     */
    addAll: addHandlers,
    /**
     * Removes all the event listeners from the document including the default ones.
     * @type {removeHandlers}
     */
    removeAll: removeHandlers
};