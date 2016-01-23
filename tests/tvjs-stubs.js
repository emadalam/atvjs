(function(global) {
    var navigationDocument = {
        documents: [],
        pushDocument: function(doc) {
            console.log('pushing document to the navigation stack...', doc);
            this.documents.push(doc);
        },
        popDocument: function() {
            console.log('popping document from the navigation stack...');
            this.documents.pop();
        },
        replaceDocument: function(doc, oldDocument) {
            console.log('replacing document on the navigation stack...', doc, oldDocument);
            this.documents.every(function(d, i) {
                if (d === oldDocument) {
                    this.documents[i] = oldDocument;
                    return false;
                }
                return true;
            }, this);
        },
        popToDocument: function(doc) {
            console.log('popping from the stack until...', doc);
            var reverse = this.documents.reverse();
            var index = this.documents.length - 1;
            this.documents.every(function(d, i) {
                if (d == doc) {
                    index = i;
                    return false;
                }
                return true;
            });
        },
        presentModal: function() {
            console.log('presenting modal...', arguments);
        },
        dismissModal: function() {
            console.log('dismissing modal...', arguments);
        },
        clear: function() {
            this.documents = [];
        }
    };

    var Device = {
        vendorIdentifier: '85E9F26A-506A-4BD8-888B-83C9DDA4A437'
    };

    function loadScript(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }

    function evaluateScripts(scripts) {
        Array.prototype.forEach.call(scripts, loadScript);
    }

    var App = {};
    var Settings = {};

    if (!global.navigationDocument) {
        global.navigationDocument = navigationDocument;
    }
    if (!global.App) {
        global.App = App;
    }
    if (!global.Settings) {
        global.Settings = Settings;
    }
    if (!global.Device) {
        global.Device = Device;
    }
    if (!global.evaluateScripts) {
        global.evaluateScripts = evaluateScripts;
    }


    Element.prototype.getFeature = function() {
        return {
            setDocument: function(doc, element) {
                console.log('setting document...', doc, element);
            },
            setSelectedItem: function(element) {
                console.log('setting selected...', element);
            }
        };
    };

    document.addEventListener("DOMContentLoaded", function(e) {
        if (App.onLaunch) {
            App.onLaunch({
                BASEURL: window.location.origin
            });
        }
    });
})(window);