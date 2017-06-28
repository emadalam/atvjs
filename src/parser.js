import _ from 'lodash';
const parser = new DOMParser(); // native DOM parser
const xmlPrefix = '<?xml version="1.0" encoding="UTF-8" ?>'; // xml prefix

/**
 * Parses the given XML string or a function and returns a DOM
 *
 * @private
 * 
 * @param  {String|Function} s      The template function or the string
 * @param  {Object} [data]          The data that will be applied to the function
 * @return {Document}               A new Document
 */
function parse(s, data) {
    // if a template function is provided, call the function with data
    s = _.isFunction(s) ? s(data) : s;

    console.log('parsing string...');
    console.log(s);

    // prepend the xml string if not already present
    if (!_.startsWith(s, '<?xml')) {
        s = xmlPrefix + s;
    }

    return parser.parseFromString(s, 'application/xml');
}

/**
 * A minimalistic parsing wrapper library using the native DOMParser
 *
 * @module parser
 *
 * @author eMAD <emad.alam@yahoo.com>
 */
export default {
    /**
     * Parses the given XML string or a function and returns a DOM
     *
     * @param  {String|Function} s      The template function or the string
     * @param  {Object} [data]          The data that will be applied to the function
     * @return {Document}               A new Document
     */
    dom(s, data) {
        return parse(s, data);
    }
};