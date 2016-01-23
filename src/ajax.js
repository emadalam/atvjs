/**
 * Default options for the ajax.
 * 
 * @type {Object}
 */
const defaults = {
    responseType: 'json'
};

/**
 * A function to perform ajax requests. It returns promise instead of relying on callbacks.
 * 
 * @param  {String} url                 Resource url
 * @param  {Object} options             Options to apply for the ajax request
 * @param  {String} [method='GET']      Type of HTTP request (defaults to GET)
 * @return {Promise}                    The Promise that resolves on ajax success
 */
function ajax(url, options, method = 'GET') {
    if (typeof url == 'undefined') {
        console.error('No url specified for the ajax.');
        throw new TypeError('A URL is required for making the ajax request.');
    }

    if (typeof options === 'undefined' && typeof url === 'object' && url.url) {
        options = url;
        url = options.url;
    } else if (typeof url !== 'string') {
        console.error('No url/options specified for the ajax.');
        throw new TypeError('Options must be an object for making the ajax request.');
    }

    // default options
    options = Object.assign({}, defaults, options, {method: method});

    console.log(`initiating ajax request... url: ${url}`, ' :: options:', options);

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        // set response type
        if (options.responseType) {
            xhr.responseType = options.responseType;
        }
        // open connection
        xhr.open(
            options.method,
            url,
            typeof options.async === 'undefined' ? true : options.async,
            options.user,
            options.password
        );
        // set headers
        Object.keys(options.headers || {}).forEach(function(name) {
            xhr.setRequestHeader(name, options.headers[name]);
        });
        // listen to the state change
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status >= 200 && xhr.status <= 300) {
                resolve(xhr);
            } else {
                reject(xhr);
            }
        };
        // error handling
        xhr.addEventListener('error', () => reject(xhr));
        xhr.addEventListener('abort', () => reject(xhr));
        // send request
        xhr.send(options.data);
    });
}

Object.assign(ajax, {
    /**
     * Perform an ajax ajax using HTTP GET
     * @param  {string} url         Resource url
     * @param  {Object} options     Ajax options
     * @return {Promise}            The Promise that resolves on ajax success
     */
    get(url, options) {
        return ajax(url, options, 'GET');
    },
    /**
     * Perform an ajax ajax using HTTP POST
     * @param  {string} url         Resource url
     * @param  {Object} options     Ajax options
     * @return {Promise}            The Promise that resolves on ajax success
     */
    post(url, options) {
        return ajax(url, options, 'POST');
    },
    /**
     * Perform an ajax ajax using HTTP PUT
     * @param  {string} url         Resource url
     * @param  {Object} options     Ajax options
     * @return {Promise}            The Promise that resolves on ajax success
     */
    put(url, options) {
        return ajax(url, options, 'PUT');
    },
    /**
     * Perform an ajax ajax using HTTP DELETE
     * @param  {string} url         Resource url
     * @param  {Object} options     Ajax options
     * @return {Promise}            The Promise that resolves on ajax success
     */
    del(url, options) {
        return ajax(url, options, 'DELETE');
    }
});

/**
 * A very minimalistic AJAX implementation that returns promise instead of relying in callbacks.
 *
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default ajax;