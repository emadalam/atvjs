import _ from 'lodash';
import LZString from 'lz-string';

const lib = {
	/**
	 * Sets a value for the given key in the localStorage (supports storing object values).
	 * Uses [LZString Compression]{@link external:LZString} to store significantly large amount of data.
	 *
	 * @inner
	 * @alias module:settings.set
	 * 
	 * @param {String} key 				The key
	 * @param {Object|String} val 		The value to store
	 */
	set(key, val) {
		// convert all values to string for proper compression
		if (!_.isUndefined(val)) {
			val = JSON.stringify(val);
			console.log(`Setting key: ${key} with value: ${val}`);
			localStorage.setItem(key, LZString.compress(val));
		} else {
			this.remove(key);
		}
	},
	/**
	 * Returns a value for the specified key
	 * 
	 * @inner
	 * @alias module:settings.get
	 *
	 * @param  {String} key 		The key
	 * @return {Object|String}     	The stored value
	 */
	get(key) {
		let item = localStorage.getItem(key);
		let val;
		
		if (!_.isUndefined(item)) {
			item = LZString.decompress(item);
		}
		try {
			val = JSON.parse(item);
		} catch (ex) {
			val = item;
		}
		return val;
	},
	/**
	 * Removes the given key(s) from the localStorage.
	 *
	 * @inner
	 * @alias module:settings.remove
	 * 
	 * @param  {String|Array} keys 		The key(s) to remove.
	 */
	remove(keys) {
		if (!_.isArray(keys)) {
			keys = [keys];
		}
		_.each(keys, (key) => {
			console.log(`Unsetting key: ${key}`);
			localStorage.removeItem(key);
		});
	}
};

_.assign(Settings, lib);

/**
 * A Settings class instance provides access settings information for Apple TV device.
 * @external Settings
 * @see https://developer.apple.com/documentation/tvmljs/settings
 */

/**
 * LZ-based compression algorithm for JavaScript
 * @external LZString
 * @see https://github.com/pieroxy/lz-string/
 */

/**
 * A wrapper for the Apple TV settings object that has getters and setters using localstorage.
 * The settings are persisted even on app exits and relaunch.
 *
 * @module settings
 * @extends external:Settings
 *
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default Settings;