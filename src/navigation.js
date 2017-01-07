import _ from 'lodash';
import Page from './page';
import Parser from './parser';
import Menu from './menu';

// few private variables
let menuDoc = null;
let loaderDoc = null;
let errorDoc = null;
let modalDoc = null;

/**
 * Default options.
 *
 * @type {Object}
 */
let defaults = {
    templates: {
        status: {}
    }
};

/**
 * Sets the default options for navigation.
 *
 * @param {Object} cfg The configuration object {defaults}
 */
function setOptions(cfg = {}) {
    console.log('setting navigation options...', cfg);
    // override the default options
    _.assign(defaults, cfg);
}

/**
 * Get a loader document.
 *
 * @param  {String} message         Loading message
 * @return {Promise}               Promise with a newly created loader document
 */
function getLoaderDoc(message) {
    let tpl = defaults.templates.loader;
    let str = (tpl && tpl({message: message})) || '<document></document>';

    return Parser.dom(str);
}

/**
 * Get an error document.
 *
 * @param  {Object|String} message          Error page configuration or error message
 * @return {Document}                       A newly created error document
 */
function getErrorDoc(message) {
    let cfg = {};
    if (_.isPlainObject(message)) {
        cfg = message;
        if (cfg.status && !cfg.template && defaults.templates.status[cfg.status]) {
            cfg.template = defaults.templates.status[cfg.status];
        }
    } else {
        cfg.template = defaults.templates.error || (() => '<document></document>');
        cfg.data = {message: message};
    }

    return Page.makeDom(cfg);
}

/**
 * Gets the topmost document from the navigationDocument stack
 *
 * @return {Document} The document
 */
function getLastDocumentFromStack() {
    let docs = navigationDocument.documents;
    return docs[docs.length - 1];
}

/**
 * Initializes the menu document if present
 *
 * @private
 * @return {Promise}           Promise with boolean invocation result
 */
function initMenu() {
    let menuCfg = defaults.menu;

    // no configuration given and neither the menu created earlier
    // no need to proceed
    if (!menuCfg && !Menu.created) {
        return Promise.resolve(false);
    }

    // set options to create menu
    if (menuCfg) {
        Menu.setOptions(menuCfg);
    }

    return Menu.get()
        .then(function (res) {
            menuDoc = res;
            Page.prepareDom(res);
            return res;
        });
}

/**
 * Helper function to perform navigation after applying the page level default handlers
 *
 * @param  {Object} cfg         The configurations
 * @return {Promise}           The created document
 */
function show(cfg = {}) {
    if (_.isFunction(cfg)) {
        cfg = {
            template: cfg
        };
    }

    // no template exists, cannot proceed
    if (!cfg.template) {
        console.warn('No template found!');
        return Promise.resolve(null);
    }
    if (getLastDocumentFromStack() && cfg.type === 'modal') { // show as a modal if there is something on the navigation stack
        return presentModal(cfg);
    } else { // no document on the navigation stack, show as a document
        return Page.makeDom(cfg)
            .then(function (res) {
                cleanNavigate(res)
            });
    }
}

/**
 * Shows a loading page if a loader template exists.
 * Also applies any default handlers and caches the document for later use.
 *
 * @param  {Object|Function} cfg    The configuration options or the template function
 * @return {Promise}               The created loader document.
 */
function showLoading(cfg = {}) {
    if (_.isString(cfg)) {
        cfg = {
            data: {
                message: cfg
            }
        };
    }
    // use default loading template if not passed as a configuration
    _.defaultsDeep(cfg, {
        template: defaults.templates.loader,
        type: 'modal'
    });

    console.log('showing loader... options:', cfg);

    // return promise with cache the doc for later use
    return show(cfg);
}

/**
 * Shows the error page using the existing error template.
 * Also applies any default handlers and caches the document for later use.
 *
 * @param  {Object|Function|Boolean} cfg    The configuration options or the template function or boolean to hide the error
 * @return {Promise}                       The created error document.
 */
function showError(cfg = {}) {
    if (_.isBoolean(cfg) && !cfg && errorDoc) { // hide error
        navigationDocument.removeDocument(errorDoc);
        return Promise.resolve(null);
    }
    if (_.isString(cfg)) {
        cfg = {
            data: {
                message: cfg
            }
        };
    }
    // use default error template if not passed as a configuration
    _.defaultsDeep(cfg, {
        template: defaults.templates.error
    });

    console.log('showing error... options:', cfg);

    // return promise with cache the doc for later use
    return show(cfg);
}

/**
 * Pushes a given document to the navigation stack after applying all the default page level handlers.
 *
 * @private
 * @param  {Document} doc       The document to push to the navigation stack
 */
function pushDocument(doc) {
    if (!(doc instanceof Document)) {
        console.warn('Cannot navigate to the document.', doc);
        return;
    }
    navigationDocument.pushDocument(doc);
}

/**
 * Replaces a document on the navigation stack with the provided new document.
 * Also adds the page level default handlers to the new document and removes the existing handlers from the document that is to be replaced.
 *
 * @private
 * @param  {Document} doc               The document to push
 * @param  {Document} docToReplace      The document to replace
 */
function replaceDocument(doc, docToReplace) {
    if (!(doc instanceof Document) || !(docToReplace instanceof Document)) {
        console.warn('Cannot replace document.');
        return;
    }
    navigationDocument.replaceDocument(doc, docToReplace);
}

/**
 * Performs a navigation by checking the existing document stack to see if any error or loader page needs to be replaced from the current stack
 *
 * @param   {Document} doc              The document that needs to be pushed on to the navigation stack
 * @param   {Boolean} [replace=false]   Whether to replace the last document from the navigation stack
 * @return  {Document}                  The current document on the stack
 */
function cleanNavigate(doc, replace = false) {
    let navigated = false;
    let docs = navigationDocument.documents;
    let last = getLastDocumentFromStack();

    if (!replace && (!last || last !== loaderDoc && last !== errorDoc)) {
        pushDocument(doc);
    } else if (last && last === loaderDoc || last === errorDoc) { // replaces any error or loader document from the current document stack
        console.log('replacing current error/loader...');
        replaceDocument(doc, last);
        loaderDoc = null;
        errorDoc = null;
    }
    // determine the current document on the navigation stack
    last = replace && getLastDocumentFromStack();
    // if replace is passed as a param and there is some document on the top of stack
    if (last) {
        console.log('replacing current document...');
        replaceDocument(doc, last);
    }

    // dismisses any modal open modal
    _.delay(dismissModal, 2000);

    return docs[docs.length - 1];
}

/**
 * Navigates to the menu page if it exists
 *
 * @return {Promise}      Returns a Promise that resolves upon successful navigation.
 */
function navigateToMenuPage() {

    console.log('navigating to menu...');

    if (!menuDoc) {
        return initMenu().then(function (res) {
            if (!res) {
                console.warn('No menu configuration exists, cannot navigate to the menu page.');
                throw new Error('No menu configuration exists, cannot navigate to the menu page.')
            } else {
                cleanNavigate(res);
                return res;
            }
        })
    }

    return new Promise((resolve, reject) => {
        cleanNavigate(menuDoc);
        resolve(menuDoc);
    });
}

/**
 * Navigates to the provided page if it exists in the list of available pages.
 *
 * @param  {String} page        Name of the previously created page.
 * @param  {Object} options     The options that will be passed on to the page during runtime.
 * @param  {Boolean} replace    Replace the previous page.
 * @return {Promise}            Returns a Promise that resolves upon successful navigation.
 */
function navigate(page, options, replace) {
    let p = Page.get(page);

    if (_.isBoolean(options)) {
        replace = options;
    } else {
        options = options || {};
    }

    if (_.isBoolean(options.replace)) {
        replace = options.replace;
    }

    console.log('navigating... page:', page, ':: options:', options);

    // return a promise that resolves if there was a navigation that was performed
    return new Promise((resolve, reject) => {
        if (!p) {
            console.error(page, 'page does not exist!');
            let tpl = defaults.templates.status['404'];
            if (tpl) {
                return showError({
                    template: tpl,
                    title: '404',
                    message: 'The requested page cannot be found!'
                });
            } else {
                reject();
            }
        }
        else {
            p(options).then(function (doc) {
                // support suppressing of navigation since there is no dom available (page resolved with empty document)
                if (doc) {
                    // if page is a modal, show as modal window
                    if (p.type === 'modal') {
                        // defer to avoid clashes with any ongoing process (tvmlkit weird behavior -_-)
                        // todo: think about defer, maybe it is redundant part?
                        return presentModal(doc)
                    } else { // navigate
                        // defer to avoid clashes with any ongoing process (tvmlkit weird behavior -_-)
                        _.defer(cleanNavigate, doc, replace);
                        // resolve promise
                        resolve(doc);
                    }
                }
            })
                .catch(function (error) {
                    // something went wrong during the page execution
                    // warn and set the status to 500
                    if (error instanceof Error) {
                        console.error(`There was an error in the page code. ${error}`);
                        error.status = '500';
                    }
                    // try showing a status level error page if it exists
                    let statusLevelErrorTpls = defaults.templates.status;
                    let tpl = statusLevelErrorTpls[error.status];
                    if (tpl) {
                        return showError(_.defaults({
                            template: tpl
                        }, error.response));
                    } else {
                        console.warn('No error handler present in the page or navigation default configurations.', error);
                        reject(error);
                    }
                });
        }
    });
}

/**
 * Shows a modal. Closes the previous modal before showing a new modal.
 *
 * @param  {Document|String|Object} modal       The TVML string/document representation of the modal window or a configuration object to create modal from
 * @return {Promise}                           Promise with created modal document
 */
function presentModal(modal) {
    let doc = modal; // assume a document object is passed
    if (_.isString(modal)) { // if a modal document string is passed
        return Parser.dom(modal)
            .then(function (res) {
                doc = res;
                navigationDocument.presentModal(doc);
                modalDoc = doc;
                return doc;
            })
    } else if (_.isPlainObject(modal)) { // if a modal page configuration is passed
        return Page.makeDom(modal)
            .then(function (res) {
                doc = res;
                navigationDocument.presentModal(doc);
                modalDoc = doc;
                return doc;
            })
    }
    else {
        navigationDocument.presentModal(doc);
        modalDoc = doc;
        return Promise.resolve(doc);
    }
}

/**
 * Dismisses the current modal window.
 *
 */
function dismissModal() {
    navigationDocument.dismissModal();
    modalDoc = null;
}

/**
 * Clears the navigation stack.
 *
 */
function clear() {
    loaderDoc = null;
    modalDoc = null;
    navigationDocument.clear();
}

/**
 * Pops the recent document or pops all document before the provided document.
 *
 * @param  {Document} [doc]     The document until which we need to pop.
 */
function pop(doc) {
    if (doc instanceof Document) {
        _.defer(() => navigationDocument.popToDocument(doc));
    } else {
        _.defer(() => navigationDocument.popDocument());
    }
}

/**
 * Goes back in history.
 *
 */
function back() {
    if (getLastDocumentFromStack()) {
        pop();
    }
}

/**
 * Removes the current active document from the stack.
 *
 */
function removeActiveDocument() {
    let doc = getActiveDocument();
    doc && navigationDocument.removeDocument(doc);
}

/**
 * A minimalistic Navigation library for Apple TV applications
 *
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default {
    get currentDocument() {
        return getLastDocumentFromStack();
    },
    set currentDocument(doc) {
    },
    get activeDocument() {
        return getActiveDocument();
    },
    set activeDocument(doc) {
    },
    /**
     * @type {setOptions}
     */
    setOptions: setOptions,
    /**
     * @type {navigate}
     */
    navigate: navigate,
    /**
     * @type {navigateToMenuPage}
     */
    navigateToMenuPage: navigateToMenuPage,
    /**
     * @type {getLoaderDoc}
     */
    getLoaderDoc: getLoaderDoc,
    /**
     * @type {getErrorDoc}
     */
    getErrorDoc: getErrorDoc,
    /**
     * @type {showLoading}
     */
    showLoading: showLoading,
    /**
     * @type {showError}
     */
    showError: showError,
    /**
     * @type {presentModal}
     */
    presentModal: presentModal,
    /**
     * @type {dismissModal}
     */
    dismissModal: dismissModal,
    /**
     * @type {clear}
     */
    clear: clear,
    /**
     * @type {back}
     */
    back: back,
    /**
     * @type {pop}
     */
    pop: pop,
    /**
     * @type {removeActiveDocument}
     */
    removeActiveDocument: removeActiveDocument,
    /**
     * @type {replaceDocument}
     */
    replaceDocument: replaceDocument
};
