<!-- 
	Title: atvjs - Apple TV application development framework
	Description: Blazing fast Apple TV application development using pure JavaScript.
	Author: Emad Alam
 -->
 <meta name="keywords" content="tvos, tvml, tvjs, tvml framework, apple tv framework, tvjs framework, apple tv javascript development">

# atvjs

[![Join the chat at https://gitter.im/atvjs/Lobby](https://badges.gitter.im/atvjs/Lobby.svg)](https://gitter.im/atvjs/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Open Source Helpers](https://www.codetriage.com/emadalam/atvjs/badges/users.svg)](https://www.codetriage.com/emadalam/atvjs)

Blazing fast Apple TV application development using pure JavaScript.

<!-- MarkdownTOC depth=4 autolink=true autoanchor=true bracket=round -->

- [Philosophy](#philosophy)
- [What's included](#whats-included)
- [Getting Started](#getting-started)
- [Basic Examples](#basic-examples)
	- [Creating Pages](#creating-pages)
	- [Adding TVML styles to your page](#adding-tvml-styles-to-your-page)
	- [Fetching data from a remote source](#fetching-data-from-a-remote-source)
	- [Creating links to other pages](#creating-links-to-other-pages)
- [Advanced Topics](#advanced-topics)
	- [Event Handling](#event-handling)
	- [Custom options while navigation](#custom-options-while-navigation)
	- [Creating Menu Page](#creating-menu-page)
	- [Application initialization using configuration](#application-initialization-using-configuration)
- [Sample Code](#sample-code)
- [Useful Links](#useful-links)
- [Contributions](#contributions)
- [License](#license)

<!-- /MarkdownTOC -->

<a name="philosophy"></a>
### Philosophy

##### What?
This is a super simple framework for blazing fast [Apple TV](https://developer.apple.com/tvos/) application development using pure JavaScript. It relies on the [tvOS](https://developer.apple.com/tvos/) provided [TVML](https://developer.apple.com/library/prerelease/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/) and [TVJS](https://developer.apple.com/library/prerelease/tvos/documentation/TVMLJS/Reference/TVJSFrameworkReference/) for [Apple TV development](https://developer.apple.com/library/tvos/documentation/General/Conceptual/AppleTV_PG/). However this framework does most of the heavy lifting for you and lets you concentrate on your application logic without worrying about the hassles of complicated architecture for Apple TV development. Build your Apple TV application the same way how you are used to building your SPA applications in JavaScript and let the framework handle the rest for you.

##### Why?
The existing application architecture and sample code provided by apple for building the Apple TV applications using TVML and TVJS appears to be very immature (no offense Apple) and feels more like the web applications of the 90s where each of the page loads separately by sending the request to the back-end which generates your application page markup based on the user interaction and sends the new page back to the browser. This is okay if we were still in the 90s but feels so dumb in this era where we are used to building SPAs with REST APIs and back-end is used just as a data interaction point. Here comes *atvjs* that bridges the gap and lets you use the same architecture that, we as front-end developers, have embraced over the years.

##### How?
You simply create your pages (views) by passing a bunch of configurations (name of the page, template function, url etc) with your desired data (you can either populate data manually using your own ajax requests or pass a url configuration to fetch data from your server). Once the page is created, it is uniquely identifiable using the name. You can navigate to your page anytime in your application using the same name.

<a name="whats-included"></a>
### What's included
- Page, Menu and Modal Creation and Navigation `ATV.Page.create`, `ATV.Menu.create`, `ATV.Navigation.navigate`, `ATV.Navigation.navigateToMenuPage`, `ATV.Navigation.presentModal`
- TVML styling capabilities (both global as well as individual page level)
- Event handling (both global and for individual pages and elements)
- Application level persistent data storage using localStorage with [lz-string compression](https://github.com/pieroxy/lz-string/) `ATV.Settings.set`,  `ATV.Settings.get`, `ATV.Settings.remove`
- Ajax library using JavaScript Promises `ATV.Ajax`, `ATV.Ajax.get`, `ATV.Ajax.post`, `ATV.Ajax.put`, `ATV.Ajax.del`
- Application level publish/subscribe using [PubSubJS](https://github.com/mroderick/PubSubJS) `ATV.subscribe`, `ATV.publish`, `ATV.unsubscribe`
- Application initialization/reload using simple configurations `ATV.start`, `ATV.reload`
- Global error handling
- JavaScript `Promise` and other ES6 Features Polyfill using [babel](https://babeljs.io/docs/usage/polyfill/)
- [lodash](https://lodash.com/) library as `ATV._`

<a name="getting-started"></a>
### Getting Started
`atvjs` is defined as a `UMD` and available as an [npm package](https://www.npmjs.com/package/atvjs). You can either import it as a dependency or download it independently and include in your project.

```
$ npm install --save atvjs
```

You'll then be able to use it as a dependency with your favorite module system.

```javascript
import ATV from 'atvjs';
// or
var ATV = require('atvjs');
```

Or if you have downloaded a copy of `atvjs`, pull the script inside your application after launch.

```javascript
function onEvaluate(success) {
	if (!success) {
		// application failed to load
	}
}

App.onLaunch = function(options) {
	var baseurl = options.BASEURL;
	App.launchOptions = options;
	evaluateScripts([`${baseurl}atv.min.js`, `${baseurl}app.js`], onEvaluate);
};

// then in your app.js you will have the instance of ATV library available
// you can contain your entire application code inside app.js
```

<a name="basic-examples"></a>
### Basic Examples

<a name="creating-pages"></a>
#### Creating Pages
Create pages in your application using the page factory. You will then be able to navigate to these pages using the name of the page.

```javascript
ATV.Page.create({
	name: 'home',
	// use a template function from your favourite templating engine
	// or pass a raw template function
	template(data) {
		return `<document>
					<alertTemplate>
						<title>${data.title}</title>
						<description>${data.description}</description>
					</alertTemplate>
				</document>`;
	},
	// pass some raw data to be applied
	// or a data function that returns the data
	data: {
		title: 'Homepage',
		description: 'This is my super awesome homepage created using atvjs.'
	}
});

// later in your application you can do something like below to navigate to the page
ATV.Navigation.navigate('home');
```

<a name="adding-tvml-styles-to-your-page"></a>
#### Adding TVML styles to your page
You need to define your [TVML styles](https://developer.apple.com/library/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/ITMLStyles.html) as string and pass that as a configuration to your page. It will automatically be added to your page document in the runtime when your page is being navigated.

```javascript
let myPageStyles = `
.text-bold {
	font-weight: bold;
}
.text-white {
	color: rgb(255, 255, 255);
}
`;

ATV.Page.create({
	name: 'home',
	style: myPageStyles,
	template: your_template_function,
	data: your_data
});
```

<a name="fetching-data-from-a-remote-source"></a>
#### Fetching data from a remote source
You can fetch `JSON` content from the remote api by setting the `url` configuration. The data will be fetched using ajax and will be applied to the provided template. You can even run some transformations on the data before applying it to the template

```javascript
ATV.Page.create({
	name: 'home',
	url: 'path/to/your/api/that/returns/json',
	template: your_template_function
});

// or you can transform the response before applying to your template
ATV.Page.create({
	name: 'home',
	url: 'path/to/your/api/that/returns/json',
	template: your_template_function,
	data(response) {
		// transform your response before applying to your template
		let transformedData = someTransformationOfResponse(response);
		return transformedData;
	}
});
```

<a name="creating-links-to-other-pages"></a>
#### Creating links to other pages
You can setup links to other pages directly in your [TVML markup](https://developer.apple.com/library/prerelease/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/) by setting the `data-href-page` attribute with the value of your page name that you want to link to. The framework will take care of the navigation for you. You can also pass options to your page (see topic *[Custom options while navigation](#custom-options-while-navigation)* for details) by setting up the `data-href-page-options` attribute with a JSON value.

```
<document>
	<alertTemplate>
		<title>Example for creating links to other pages</title>
		<description>Select an option</description>
		<button data-href-page="homepage">
			<text>Go To Homepage</text>
		</button>
		<button data-href-page="login" data-href-page-options='{"username": "emadalam", "password": "123456"}'>
			<text>Login</text>
		</button>
	</alertTemplate>
</document>
```

<a name="advanced-topics"></a>
### Advanced Topics

<a name="event-handling"></a>
#### Event Handling
You can define the list of events and their respective handlers as key-value pairs. The handler will be invoked in the current object context and you can access all the methods and properties that exist on the object.

```javascript
ATV.Page.create({
	name: 'mypage',
	template: your_template_function,
	data: your_data,
	events: {
		select: 'onSelect',
		highlight: 'onHighlight'
	},
	// method invoked in the scope of the current object and
	// 'this' will be bound to the object at runtime
	// so you can easily access methods and properties and even modify them at runtime
	onSelect(e) {
		let element = e.target;
		let someCheckForElementType = element.getAttribute('data-my-attribute');
		let someOtherCheckForElementType = element.getAttribute('data-my-other-attribute');

		if (someCheckForElementType) {
			this.doSomethingOnElementType1();
		}

		if (someOtherCheckForElementType) {
			this.doSomethingOnElementType2();
		}
	},
	onHighlight(e) {
		// same as above
	},
	doSomethingOnElementType1() {
		// some awesome action
	},
	doSomethingOnElementType2() {
		// some other awesome action
	}
});
```

<a name="custom-options-while-navigation"></a>
#### Custom options while navigation
You can pass your application state/logic to make reusable dynamic pages that renders a new page each time the navigation is performed. This can be achieved by setting a `ready` method in the configuration that accepts 3 parameters, `options`, `resolve` and `reject`. These parameters are automatically passed to the ready method whenever a navigation to this page is performed. The navigation relies on [JavaScript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), so you'll have to call resolve/reject method after performing your logic.

```javascript
ATV.Page.create({
	name: 'login',
	template: your_template_function,
	// the ready method is called each time the navigation to this page is performed and
	// the options object is passed to the method at runtime
	// use options to pass any dynamic state of your application
	// you can then use this state and populate your data (either using custom ajax or some other logic)
	// once the data is populated, call the resolve method with the data or reject method for failure
	ready(options, resolve, reject) {
		let data = {
			username: options.username,
			password: options.password
		};
		// perform ajax to get the data
		// the ajax method in the library returns an instance of the Promise object
		ATV
			.Ajax
			.post('someURL', {data: data})
			.then((xhr) => {
				// xhr succeeded
				let response = xhr.response;
				// call resolve with the data that will be applied to the template
				// you can even call resolve with false to skip navigation
				resolve({
					name: response.name,
					message: response.message
				});
			}, (xhr) => {
				// xhr failed
				let response = xhr.response;
				reject({
					status: xhr.status,
					message: response.message
				});
			});
	}
});
// later in your application
ATV.Navigation.navigate('login', {username: 'emadalam', password: '123456'});
```

<a name="creating-menu-page"></a>
#### Creating Menu Page
The way menu template is designed in TVJS, you need to first create a menu template with your list of menu items. You then need to create individual documents and set one for each of the menu item. The resultant menu template then needs to be parsed and converted into a document which you can push on the navigation stack. Sounds fancy? NO WAYS! Here comes atvjs for your rescue. All you need is a menu configuration with your items list and the pages that you want to associate. The rest will be taken care by the framework. You can then navigate to the menu page using the provided navigation method. SWEET!

*Note: Menu page is singleton, meaning you cannot create multiple menu pages. It seems logical, as an application at any given state, will have a single menu listing in its entire lifespan.*

```javascript
// create your pages
let SearchPage = ATV.Page.create({/* page configurations */});
let HomePage = ATV.Page.create({/* page configurations */});
let MoviesPage = ATV.Page.create({/* page configurations */});
let TVShowsPage = ATV.Page.create({/* page configurations */});

// create menu page
ATV.Menu.create({
	// any attributes that you want to set on the root level menuBar element of TVML
	attributes: {},
	// array of menu item configurations
	items: [{
		id: 'search',
		name: 'Search',
		page: SearchPage
	}, {
		id: 'homepage',
		name: 'Home',
		page: HomePage,
		attributes: {
			autoHighlight: true // auto highlight on navigate
		}
	}, {
		id: 'movies',
		name: 'Movies',
		page: MoviesPage
	}, {
		id: 'tvshows',
		name: 'TV Shows',
		page: TVShowsPage
	}]
});

// later in your application
ATV.Navigation.navigateToMenuPage();
```

<a name="application-initialization-using-configuration"></a>
#### Application initialization using configuration
You can easily initialize your application by passing all the configurations at once.

```javascript
// create your pages
let SearchPage = ATV.Page.create({/* page configurations */});
let HomePage = ATV.Page.create({/* page configurations */});
let MoviesPage = ATV.Page.create({/* page configurations */});
let TVShowsPage = ATV.Page.create({/* page configurations */});
let LoginPage = ATV.Page.create({/* page configurations */});

// template functions
const loaderTpl = (data) => `<document>
	<loadingTemplate>
		<activityIndicator>
			<title>${data.message}</title>
		</activityIndicator>
	</loadingTemplate>
</document>`;

const errorTpl = (data) => `<document>
	<descriptiveAlertTemplate>
		<title>${data.title}</title>
		<description>${data.message}</description>
	</descriptiveAlertTemplate>
</document>`;

// Global TVML styles
let globalStyles = `
.text-bold {
	font-weight: bold;
}
.text-white {
	color: rgb(255, 255, 255);
}
.dark-background-color {
	background-color: #091a2a;
}
.button {
	background-color: rgba(0, 0, 0, 0.1);
	tv-tint-color: rgba(0, 0, 0, 0.1);
}
`;

// start your application by passing configurations
ATV.start({
	style: globalStyles,
	menu: {
		attributes: {},
		items: [{
			id: 'search',
			name: 'Search',
			page: SearchPage
		}, {
			id: 'homepage',
			name: 'Home',
			page: HomePage,
			attributes: {
				autoHighlight: true // auto highlight on navigate
			}
		}, {
			id: 'movies',
			name: 'Movies',
			page: MoviesPage
		}, {
			id: 'tvshows',
			name: 'TV Shows',
			page: TVShowsPage
		}]
	},
	templates: {
		// loader template
		loader: loaderTpl,
		// global error template
		error: errorTpl,
		// xhr status based error messages
		status: {
			'404': () => errorTpl({
				title: '404',
				message: 'The given page was not found'
			}),
			'500': () => errorTpl({
				title: '500',
				message: 'An unknown error occurred, please try again later!'
			})
		}
	},
	// global event handlers that will be called for each of the pages
	handlers: {
		select: {
			globalSelecthandler(e) {
				let element = e.target;
				let someElementTypeCheck = element.getAttribute('data-my-attribute');

				if (elementTypeCheck) {
					// perform action
				}
			}
		}
	},
	onLaunch(options) {
		// navigate to menu page
		ATV.Navigation.navigateToMenuPage();
		// or you can navigate to previously created page
		// ATV.Navigation.navigate('login');
	}
});
```

<a name="sample-code"></a>
### Sample Code
- [Movie Catalog](https://github.com/emadalam/appletv-demo) (using open [TMDb API](https://developers.themoviedb.org/3/))
- [TVJS App Boilerplate](https://github.com/emadalam/appletv-boilerplate)
- Apple's TVML Catalog sample code [re-written using atvjs](https://github.com/emadalam/tvml-catalog-using-atvjs).

<a name="useful-links"></a>
### Useful Links

- Apple TV Development - [tvOS](https://developer.apple.com/tvos/), [TVJS](https://developer.apple.com/library/tvos/documentation/TVMLJS/Reference/TVJSFrameworkReference/index.html) and [TVML](https://developer.apple.com/library/prerelease/tvos/documentation/LanguagesUtilities/Conceptual/ATV_Template_Guide/index.html)
- Building tvOS Applications - [Tutorial 1](http://josecasanova.com/blog/how-to-build-a-tvos-application-for-apple-tv-tutorial/) and [Tutorial 2](http://www.raywenderlich.com/114886/beginning-tvos-development-with-tvml-tutorial)
- [JavaScript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [ES6 Features](http://es6-features.org)
- [Babel](https://babeljs.io/)

<a name="contributions"></a>
### Contributions

- Fork the project
- Commit your enhancements and bug fixes
- Create a pull request describing the changes

<a name="license"></a>
### License
atvjs is released under the [MIT License](http://opensource.org/licenses/MIT).
