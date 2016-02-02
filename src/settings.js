import _ from 'lodash';
import LZString from 'lz-string';

const lib = {
	/**
	 * Sets a value for the given key in the localStorage (supports storing object values).
	 * 
	 * @param {String} key 				The key
	 * @param {Object|String} val 		The value to store
	 */
	set(key, val) {
		if (_.isPlainObject(val)) {
			val = JSON.stringify(val);
		}
		console.log(`Setting key: ${key} with value: ${val}`);
		localStorage.setItem(key, LZString.compress(val));
	},
	/**
	 * Returns a value for the specified key
	 * 
	 * @param  {String} key 		The key
	 * @return {Object|String}     	The stored value
	 */
	get(key) {
		let item = LZString.decompress(localStorage.getItem(key));
		let val;
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
	 * @param  {String|Array} keys 		The key(s) to remove.
	 */
	remove(keys) {
		if (!_.isArray(keys)) {
			keys = [keys];
		}
		_.each(keys, (key) => localStorage.removeItem(key));
	}
};

_.assign(Settings, lib);

/**
 * A wrapper for the Apple TV settings object that has getters and setters using localstorage
 *
 * @author eMAD <emad.alam@yahoo.com>
 *
 */
export default Settings;