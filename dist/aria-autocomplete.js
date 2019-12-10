// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"kTsq":[function(require,module,exports) {
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (el.matches(s)) {
        return el;
      }

      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);

    return null;
  };
}
},{}],"lTk1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trimString = trimString;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.cleanString = cleanString;
exports.isPrintableKey = isPrintableKey;
exports.mergeObjects = mergeObjects;
exports.dispatchEvent = dispatchEvent;
exports.setElementState = setElementState;
exports.processSourceArray = processSourceArray;
var REGEX_TRIM = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
/**
 * trim string helper
 * @param {string} theString
 */

function trimString(theString) {
  return theString == null ? '' : (theString + '').replace(REGEX_TRIM, '');
}
/**
 * add class(es) to element
 * @param {Element} element - element to add class(es) to
 * @param {String} classes - space delimitted class(es) to add
 */


function addClass(element, classes) {
  var currentValue = trimString(element.getAttribute && element.getAttribute('class'));
  var current = ' ' + currentValue + ' ';
  var finalValue = '';

  for (var i = 0, cs = classes.split(' '), l = cs.length; i < l; i += 1) {
    if (cs[i] !== '' && current.indexOf(' ' + cs[i] + ' ') === -1) {
      finalValue += ' ' + cs[i];
    }
  }

  if (currentValue !== (finalValue = trimString(currentValue + finalValue))) {
    element.setAttribute('class', finalValue);
  }
}
/**
 * remove class(es) from element
 * @param {Element} element - element to add class(es) to
 * @param {String} classes - space delimitted class(es) to remove
 */


function removeClass(element, classes) {
  var currentValue = trimString(element.getAttribute && element.getAttribute('class'));
  var finalValue = ' ' + currentValue + ' ';

  for (var i = 0, cs = classes.split(' '), l = cs.length; i < l; i += 1) {
    finalValue = finalValue.replace(' ' + cs[i] + ' ', ' ');
  }

  if (currentValue !== (finalValue = trimString(finalValue))) {
    element.setAttribute('class', finalValue);
  }
} // regex constants used for string cleaning


var REGEX_AMPERSAND = /&/g;
var REGEX_DUPE_WHITESPACE = /\s\s+/g;
var REGEX_MAKE_SAFE = /[.*+?^${}()|[\]\\]/g;
var REGEX_TO_IGNORE = /[\u2018\u2019',:\u2013-]/g;
/**
 * @description clean string of some characters, and make safe for regex searching
 * @param {String} theString
 * @returns {String}
 */

function cleanString(theString) {
  theString = theString.replace(REGEX_TO_IGNORE, ''); // ignore quotes, commas, colons, and hyphens

  theString = theString.replace(REGEX_AMPERSAND, 'and'); // treat & and 'and' as the same

  theString = theString.replace(REGEX_MAKE_SAFE, '\\$&'); // make safe for regex searching

  theString = theString.replace(REGEX_DUPE_WHITESPACE, ' '); // ignore duplicate whitespace

  return trimString(theString.toLowerCase()); // case insensitive
}
/**
 * @description check if keycode is for a printable/width-affecting character
 * @param {Number} keyCode
 * @returns {Boolean}
 */


function isPrintableKey(keyCode) {
  return keyCode >= 48 && keyCode <= 57 || // 0-9
  keyCode >= 65 && keyCode <= 90 || // a-z
  keyCode >= 96 && keyCode <= 111 || // numpad 0-9, numeric operators
  keyCode >= 186 && keyCode <= 222 || // semicolon, equal, comma, dash, etc.
  keyCode === 32 || // space
  keyCode === 8 || // backspace
  keyCode === 46 // delete
  ;
}
/**
 * @description merge objects together to generate a new one
 * @param {Object} args - objects to merge together
 * @returns {Object}
 */


function mergeObjects() {
  var n = {};

  for (var i = 0, l = arguments.length; i < l; i += 1) {
    var o = i < 0 || arguments.length <= i ? undefined : arguments[i];

    for (var p in o) {
      if (o.hasOwnProperty(p) && typeof o[p] !== 'undefined') {
        n[p] = o[p];
      }
    }
  }

  return n;
}
/**
 * @description dispatch event helper
 * @param {Element} element
 * @param {String} event
 */


function dispatchEvent(element, event) {
  if ('createEvent' in document) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(event, true, true);
    element.dispatchEvent(e);
  } else {
    element.fireEvent('on' + event);
  }
}
/**
 * @description set element option or checkbox to specified state and trigger change event
 * @param {Element} element
 * @param {Boolean} selected
 * @param {(AriaAutocomplete|Object)} instance
 */


function setElementState(element, selected, instance) {
  selected = !!selected;

  if (element) {
    // handle checkbox
    if (element.nodeName === 'INPUT' && typeof element.checked === 'boolean' && element.checked !== selected) {
      element.checked = selected;
      dispatchEvent(element, 'change');
    } // handle dropdown option


    if (element.nodeName === 'OPTION' && element.selected !== selected) {
      element.selected = selected; // ensure change event only fires once for dropdown

      if (instance.elementChangeEventTimer) {
        clearTimeout(instance.elementChangeEventTimer);
      }

      instance.elementChangeEventTimer = setTimeout(function () {
        dispatchEvent(element.closest('select'), 'change');
      }, 1);
    }
  }
}
/**
 * @description process an array of strings or objects to ensure needed props exist
 * @param {(String|Object)[]} sourceArray
 * @param {Object=} mapping - value and label mapping used in object cases
 * @param {Boolean=} setCleanedLabel - defaults to true
 * @returns {Array}
 */


function processSourceArray(sourceArray) {
  var mapping = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var setCleanedLabel = arguments.length > 2 ? arguments[2] : undefined;
  var toReturn = [];
  var mapValue = mapping['value'];
  var mapLabel = mapping['label'];

  for (var i = 0, l = sourceArray.length; i < l; i += 1) {
    var result = {};
    var entry = sourceArray[i]; // handle array of strings

    if (typeof entry === 'string') {
      result.value = result.label = entry;
    } // handle array of objects - ensure value and label exist, and maintain any other properties
    else {
        result = entry;
        var value = result[mapValue] || result.value || result.label;
        var label = result[mapLabel] || result.label || result.value;
        result.value = (value || '').toString();
        result.label = (label || '').toString();
      } // whether to set a cleaned label for static source filtering (in filter method)


    if (setCleanedLabel !== false) {
      result.cleanedLabel = cleanString(result.label);
    }

    toReturn.push(result);
  }

  return toReturn;
}
},{}],"c8cM":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("./closest-polyfill");

var _helpers = require("./helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var appIndex = 0;
var DEFAULT_OPTIONS = {
  /**
   * @description string for async endpoint, array of strings, array of objects with value and label, or function
   * @type {String|String[]|Object[]|Function}
   */
  source: '',

  /** @description properties to use for label and value when using an Array of Objects as source */
  sourceMapping: {},

  /** @description input delay before running a search */
  delay: 100,

  /** @description min number of characters to run a search (includes spaces) */
  minLength: 1,

  /** @description max number of results to render */
  maxResults: 9999,

  /** @description whether to render a button that triggers showing all options */
  showAllButton: true,

  /** @description confirm selection when blurring off of the control */
  confirmOnBlur: true,

  /** @description whether to allow multiple items to be selected */
  multiple: false,

  /** @description max number of items that can be selected */
  maxItems: 9999,

  /** @description if element is an input, and in multiple mode, character that separates the values */
  multipleSeparator: ',',

  /** @description placeholder text to show in generated input */
  placeholder: 'Type to search...',

  /** @description text to show (and announce) if no results found */
  noResultsText: 'No results',

  /** @description class name to add to list */
  listClassName: '',

  /** @description class name to add to input */
  inputClassName: '',

  /** @description class name to add to component wrapper */
  wrapperClassName: 'form-control',

  /** @description string to use in front of main classes that are used */
  cssNameSpace: 'aria-autocomplete',

  /** @description when source is a string, param to use when adding input value */
  asyncQueryParam: 'q',

  /** @description when source is a string, param to use when adding results limit */
  asyncMaxResultsParam: 'limit',

  /** @description in multi mode, screen reader text used for element deletion - prepended to label */
  srDeleteText: 'delete',

  /** @description in multi mode, screen reader text announced after deletion - appended to label */
  srDeletedText: 'deleted',

  /** @description screen reader text announced after selection - appended to label */
  srSelectedText: 'selected',

  /** @description screen reader explainer added to the list element via aria-label attribute */
  srExplanatoryText: 'Search suggestions',

  /** @description screen reader description used for main input when empty */
  srAssistiveText: 'When autocomplete results are available use up and down arrows to review and enter to select. ' + 'Touch device users, explore by touch or with swipe gestures.',

  /** @description screen reader announcement after results are rendered */
  srResultsText: function srResultsText(length) {
    return "".concat(length, " ").concat(length === 1 ? 'result' : 'results', " available.");
  },

  /** @description callback after async call completes - can be used to format the results */
  onAsyncSuccess: undefined,
  //  to needed format (onResponse can also be used for this)

  /** @description callback prior to rendering - can be used to format the results */
  onResponse: undefined,
  // before response is processed and rendered - can be used to modify results

  /** @description callback before search is performed - can be used to affect search value */
  onSearch: undefined,

  /** @description callback after selection is made */
  onSelect: undefined,

  /** @description callback when main script processing and initial rendering has finished */
  onReady: undefined,

  /** @description callback when list area closes */
  onClose: undefined,

  /** @description callback when list area opens */
  onOpen: undefined
};

var AriaAutocomplete =
/*#__PURE__*/
function () {
  /**
   * @param {Element} element
   * @param {Object=} options
   */
  function AriaAutocomplete(element, options) {
    _classCallCheck(this, AriaAutocomplete);

    // fail silently if no list provided
    if (!element) {
      return;
    } // if instance already exists on the list element, do not re-initialise


    if (element.ariaAutocomplete) {
      return element.ariaAutocomplete;
    }

    appIndex += 1;
    this.element = element;
    this.elementIsInput = element.nodeName === 'INPUT';
    this.elementIsSelect = element.nodeName === 'SELECT'; // ids used for DOM queries and accessibility attributes e.g. aria-controls

    this.ids = {};
    this.ids.ELEMENT = element.id;
    this.ids.PREFIX = "".concat(element.id || '', "aria-autocomplete-").concat(appIndex);
    this.ids.LIST = "".concat(this.ids.PREFIX, "-list");
    this.ids.INPUT = "".concat(this.ids.PREFIX, "-input");
    this.ids.BUTTON = "".concat(this.ids.PREFIX, "-button");
    this.ids.OPTION = "".concat(this.ids.PREFIX, "-option");
    this.ids.WRAPPER = "".concat(this.ids.PREFIX, "-wrapper");
    this.ids.OPTION_SELECTED = "".concat(this.ids.OPTION, "-selected");
    this.ids.OPTION_SELECTED = "".concat(this.ids.OPTION, "-selected");
    this.ids.SR_ASSISTANCE = "".concat(this.ids.PREFIX, "-sr-assistance");
    this.ids.SR_ANNOUNCEMENTS = "".concat(this.ids.PREFIX, "-sr-announcements"); // always have an id on the original element for caching state

    if (!this.ids.ELEMENT) {
      this.ids.ELEMENT = "".concat(this.ids.PREFIX, "-element");
      this.element.setAttribute('id', this.ids.ELEMENT);
    } // vars defined later - elements


    this.list;
    this.input;
    this.wrapper;
    this.showAll;
    this.srAnnouncements; // vars defined later - non elements

    this.xhr;
    this.term;
    this.async;
    this.source;
    this.menuOpen;
    this.multiple;
    this.selected;
    this.disabled;
    this.filtering;
    this.cssNameSpace;
    this.forceShowAll;
    this.filteredSource; // filtered source items to render

    this.currentListHtml;
    this.currentSelectedIndex; // for storing index of currently focused option
    // timers

    this.filterTimer;
    this.announcementTimer;
    this.componentBlurTimer;
    this.elementChangeEventTimer;
    this.options = (0, _helpers.mergeObjects)(DEFAULT_OPTIONS, options);
    this.init();
  }
  /**
   * trigger callbacks included in component options
   * @param {String} name
   * @param {Array=} args
   */


  _createClass(AriaAutocomplete, [{
    key: "triggerOptionCallback",
    value: function triggerOptionCallback(name, args) {
      if (typeof this.options[name] === 'function') {
        return this.options[name].apply(this.wrapper, args);
      }
    }
    /**
     * @description show element with CSS only - if none provided, set list state to visible
     * @param {Element=} element
     */

  }, {
    key: "show",
    value: function show(element) {
      if (typeof element !== 'undefined') {
        var toRemove = "".concat(this.cssNameSpace, "--hide hide hidden");
        (0, _helpers.removeClass)(element, toRemove);
        return element.removeAttribute('hidden');
      }

      this.input.setAttribute('aria-expanded', 'true');

      if (this.showAll) {
        var expanded = (!!this.forceShowAll).toString();
        this.showAll.setAttribute('aria-expanded', expanded);
      }

      if (!this.menuOpen) {
        this.show(this.list);
        this.menuOpen = true;
        this.triggerOptionCallback('onOpen', [this.list]);
      }
    }
    /**
     * @description hide element with CSS only - if none provided, set list state to hidden
     * @param {Element=} element
     */

  }, {
    key: "hide",
    value: function hide(element) {
      if (typeof element !== 'undefined') {
        (0, _helpers.addClass)(element, "".concat(this.cssNameSpace, "--hide hide hidden"));
        return element.setAttribute('hidden', 'hidden');
      }

      this.currentSelectedIndex = -1;
      this.input.setAttribute('aria-expanded', 'false');

      if (this.showAll) {
        this.showAll.setAttribute('aria-expanded', 'false');
      }

      if (this.menuOpen) {
        this.hide(this.list);
        this.menuOpen = false;
        this.triggerOptionCallback('onClose', [this.list]);
      }
    }
    /**
     * @description enable autocomplete (e.g. when under maxItems selected)
     */

  }, {
    key: "enable",
    value: function enable() {
      if (this.disabled) {
        this.disabled = false;
        this.input.disabled = false;
        var n = this.cssNameSpace;
        (0, _helpers.removeClass)(this.input, "".concat(n, "__input--disabled disabled"));
        (0, _helpers.removeClass)(this.wrapper, "".concat(n, "__wrapper--disabled disabled"));

        if (this.showAll) {
          this.showAll.setAttribute('tabindex', '0');
          (0, _helpers.removeClass)(this.showAll, "".concat(n, "__show-all--disabled disabled"));
        }
      }
    }
    /**
     * @description disable autocomplete (e.g. when maxItems selected)
     */

  }, {
    key: "disable",
    value: function disable() {
      if (!this.disabled) {
        this.disabled = true;
        this.input.disabled = true;
        var n = this.cssNameSpace;
        (0, _helpers.addClass)(this.input, "".concat(n, "__input--disabled disabled"));
        (0, _helpers.addClass)(this.wrapper, "".concat(n, "__wrapper--disabled disabled"));

        if (this.showAll) {
          this.showAll.setAttribute('tabindex', '-1');
          (0, _helpers.addClass)(this.showAll, "".concat(n, "__show-all--disabled disabled"));
        }
      }
    }
    /**
     * @description check if current input value is contained in a selection of options
     * @param {String} query - string to use - checks input value otherwise
     * @param {Array} options - array of objects with value and label properties
     * @param {String=} prop - prop to check against in options array - defaults to 'label'
     * @returns {Number} index of array entry that matches, or -1 if none found
     */

  }, {
    key: "isQueryContainedIn",
    value: function isQueryContainedIn(query, options, prop) {
      query = (0, _helpers.trimString)(query || this.input.value).toLowerCase();

      if (query) {
        prop = prop || 'label';

        for (var i = 0, l = options.length; i < l; i += 1) {
          if ((0, _helpers.trimString)(options[i][prop]).toLowerCase() === query) {
            return i;
          }
        }
      }

      return -1;
    }
    /**
     * @description make a screen reader announcement
     * @param {String} text
     * @param {Number=} delay
     */

  }, {
    key: "announce",
    value: function announce(text, delay) {
      var _this = this;

      if (!text || !this.srAnnouncements) {
        return;
      } // in immediate case, do not user timer


      if (delay === 0) {
        return this.srAnnouncements.textContent = text;
      }

      delay = typeof delay === 'number' ? delay : 400;

      if (this.announcementTimer) {
        clearTimeout(this.announcementTimer);
      }

      this.announcementTimer = setTimeout(function () {
        _this.srAnnouncements.textContent = text;
      }, delay);
    }
    /**
     * @todo: implement this!
     */

  }, {
    key: "buildMultiSelected",
    value: function buildMultiSelected() {}
    /**
     * @description set the aria-describedby attribute on the input
     */

  }, {
    key: "setInputDescription",
    value: function setInputDescription() {
      var exists = this.input.getAttribute('aria-describedby');
      var current = (0, _helpers.trimString)(exists || '');
      var describedBy = current.replace(this.ids.SR_ASSISTANCE, '');

      if (this.input.value.length === 0) {
        describedBy = describedBy + ' ' + this.ids.SR_ASSISTANCE;
      } // set or remove attribute, but only if necessary


      if (describedBy = (0, _helpers.trimString)(describedBy)) {
        if (describedBy !== current) {
          this.input.setAttribute('aria-describedby', describedBy);
        }
      } else if (exists) {
        this.input.removeAttribute('aria-describedby');
      }
    }
    /**
     * @description reset classes and aria-selected attribute for all visible filtered options
     */

  }, {
    key: "resetOptionAttributes",
    value: function resetOptionAttributes() {
      var cssName = this.cssNameSpace;
      var nodes = this.list.childNodes;
      var l = nodes.length;

      while (l--) {
        (0, _helpers.removeClass)(nodes[l], "".concat(cssName, "__option--focused focused focus"));
        nodes[l].setAttribute('aria-selected', 'false');
      }
    }
    /**
     * @description move focus to correct option, or to input (on up and down arrows)
     * @param {Event} event
     * @param {Number} index
     */

  }, {
    key: "setOptionFocus",
    value: function setOptionFocus(event, index) {
      // set aria-selected to false and remove focused class
      this.resetOptionAttributes(); // if negative index, or no options available, focus on input

      var options = this.list.childNodes;

      if (index < 0 || !options || !options.length) {
        this.currentSelectedIndex = -1; // focus on input, only if event was from another element

        if (event && event.target !== this.input) {
          this.input.focus();
        }

        return;
      } // down arrow on/past last option, focus on last item


      if (index >= options.length) {
        this.currentSelectedIndex = options.length - 1;
        this.setOptionFocus(event, this.currentSelectedIndex);
        return;
      } // if option found, focus...


      var toFocus = options[index];

      if (toFocus && typeof toFocus.getAttribute('tabindex') === 'string') {
        this.currentSelectedIndex = index;
        var toAdd = "".concat(this.cssNameSpace, "__option--focused focused focus");
        (0, _helpers.addClass)(toFocus, toAdd);
        toFocus.setAttribute('aria-selected', 'true');
        toFocus.focus();
        return;
      } // reset index just in case


      this.currentSelectedIndex = -1;
    }
    /**
     * @description set values and dispatch events based on any DOM elements in the selected array
     */

  }, {
    key: "setSourceElementValues",
    value: function setSourceElementValues() {
      var valToSet = [];

      for (var i = 0, l = this.selected.length; i < l; i += 1) {
        var entry = this.selected[i];
        valToSet.push(entry.value);
        (0, _helpers.setElementState)(entry.element, true, this); // element processing
      } // set original input value


      if (this.elementIsInput) {
        var valToSetString = valToSet.join(this.options.multipleSeparator);

        if (valToSetString !== this.element.value) {
          this.element.value = valToSetString;
          (0, _helpers.dispatchEvent)(this.element, 'change');
        }
      } // included in case of multi-select mode used with a <select> element as the source


      if (!this.selected.length && this.elementIsSelect) {
        this.element.value = '';
      } // set disabled state as needed


      if (this.multiple && this.selected.length >= this.options.maxItems) {
        return this.disable();
      }

      this.enable();
    }
    /**
     * @description select option from the list by index
     * @param {Event} event
     * @param {Number} index
     * @param {Boolean} focusAfterSelection
     */

  }, {
    key: "handleOptionSelect",
    value: function handleOptionSelect(event, index, focusAfterSelection) {
      // defensive check for proper index, that the filteredSource exists, and not exceed max items option
      if (typeof index !== 'number' || index < 0 || this.multiple && this.selected.length >= this.options.maxItems || !this.filteredSource.length || !this.filteredSource[index]) {
        return;
      } // generate new object from the selected item in case of varying original source

      /** @todo: confirm if a new object actually needs to be generated */


      var option = (0, _helpers.mergeObjects)(this.filteredSource[index]); // detect if selected option is already in selected array

      var l = this.selected.length;
      var alreadySelected = false;

      while (l--) {
        if (this.selected[l].value === option.value) {
          alreadySelected = true;
          break;
        }
      }

      this.input.value = this.multiple ? '' : option.label; // reset selected array in single select mode

      if (!alreadySelected && !this.multiple) {
        this.selected = [];
      } // (re)set values of any DOM elements based on selected array


      if (!alreadySelected) {
        this.selected.push(option);
        this.setSourceElementValues();
        this.buildMultiSelected(option); // rebuild multi-selected if needed
      }

      this.triggerOptionCallback('onSelect', [option]);
      this.announce("".concat(option.label, " ").concat(this.options.srSelectedText), 0); // return focus to input

      if (!this.disabled && focusAfterSelection !== false) {
        this.input.focus();
      } // close menu after option selection, and after returning focus to input


      this.hide();
    }
    /**
     * @description remove selected entries from results if in multiple mode
     * @param {Array} results
     * @returns {Array}
     */

  }, {
    key: "removeSelectedFromResults",
    value: function removeSelectedFromResults(results) {
      if (!this.multiple || !this.selected.length) {
        return results;
      }

      var toReturn = [];

      resultsLoop: for (var i = 0, l = results.length; i < l; i += 1) {
        var selected = this.selected;
        var result = results[i];

        for (var j = 0, k = selected.length; j < k; j += 1) {
          var labelMatch = result.label === selected[j].label;

          if (labelMatch && result.value === selected[j].value) {
            continue resultsLoop;
          }
        }

        toReturn.push(thisResult);
      }

      return toReturn;
    }
    /**
     * @description final filtering and render for list options, and render
     * @param {Array} results
     */

  }, {
    key: "setListOptions",
    value: function setListOptions(results) {
      var toShow = [];
      var optionId = this.ids.OPTION;
      var cssName = this.cssNameSpace;
      var mapping = this.options.sourceMapping; // if in multiple mode, exclude items already in the selected array

      var updated = this.removeSelectedFromResults(results); // allow callback to alter the response before rendering

      var callback = this.triggerOptionCallback('onResponse', updated); // now commit to setting the filtered source

      this.filteredSource = callback ? (0, _helpers.processSourceArray)(callback, mapping) : updated;
      var length = this.filteredSource.length; // build up the list html

      var maxResults = this.options.maxResults;

      for (var i = 0; i < length && i < maxResults; i += 1) {
        toShow.push("<li tabindex=\"-1\" aria-selected=\"false\" role=\"option\" class=\"".concat(cssName, "__option\" id=\"").concat(optionId, "--").concat(i, "\" aria-posinset=\"").concat(i + 1, "\" aria-setsize=\"").concat(length, "\">").concat(this.filteredSource[i].label, "</li>"));
      } // set has-results or no-results class on the list element


      if (toShow.length) {
        (0, _helpers.addClass)(this.list, "".concat(cssName, "__list--has-results"));
        (0, _helpers.removeClass)(this.list, "".concat(cssName, "__list--no-results"));
      } else {
        (0, _helpers.removeClass)(this.list, "".concat(cssName, "__list--has-results"));
        (0, _helpers.addClass)(this.list, "".concat(cssName, "__list--no-results"));
      } // no results text handling


      var announce;
      var noText = this.options.noResultsText;

      if (!toShow.length && typeof noText === 'string' && noText.length) {
        announce = noText;
        var optionClass = "".concat(cssName, "__option");
        toShow.push("<li class=\"".concat(optionClass, " ").concat(optionClass, "--no-results\">").concat(noText, "</li>"));
      } // remove loading class(es) and reset variables


      this.cancelFilterPrep(); // announce to screen reader

      if (!announce) {
        announce = this.triggerOptionCallback('srResultsText', [length]);
      }

      this.announce(announce); // render the list, only if we have to
      // time taken for string comparison is worth it to not have to re-parse and re-render the list

      var newListHtml = toShow.join('');

      if (this.currentListHtml !== newListHtml) {
        this.currentListHtml = newListHtml;
        /** @todo: test innerHTML vs insertAdjacentHtml performance in old IE */

        this.list.innerHTML = newListHtml;
      } else {
        // if list html matches, and not re-rendered, clear aria-selected and focus classes
        this.resetOptionAttributes();
      } // if toShow array is empty, make sure not to render the menu


      if (!toShow.length) {
        this.hide();
        return;
      }

      this.show(); // reset forceShowAll must be after .show()
      // aria-expanded attribute on showAllButton is controlled in .show() method

      this.forceShowAll = false;
    }
    /**
     * @description trigger async call for options to render
     * @param {String} value
     * @param {Boolean=} canCancel
     */

  }, {
    key: "handleAsync",
    value: function handleAsync(value) {
      var _this2 = this;

      var canCancel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var options = this.options;
      var mapping = options.mapping;
      var xhr = new XMLHttpRequest();
      var encode = encodeURIComponent;
      var isShowAll = this.forceShowAll;
      var limit = this.selected.length + options.maxResults;
      var limitParam = "".concat(encode(options.asyncMaxResultsParam), "=").concat(limit);
      var queryParam = "".concat(encode(options.asyncQueryParam), "=").concat(encode(value));
      var params = "".concat(queryParam, "&").concat(limitParam);
      var url = this.source + (/\?/.test(this.source) ? '&' : '?') + params; // abort any current call first

      if (this.xhr) {
        this.xhr.abort();
      }

      xhr.open('GET', url);

      xhr.onload = function () {
        _this2.forceShowAll = isShowAll; // return forceShowAll to previous state before the options render

        var callback = _this2.triggerOptionCallback('onAsyncSuccess', [xhr]);

        var source = callback || xhr.responseText;
        var items = (0, _helpers.processSourceArray)(source, mapping, false);

        _this2.setListOptions(items);
      };

      xhr.send(); // allow the creation of an uncancellable call to use on first load

      if (canCancel !== false) {
        this.xhr = xhr;
      }
    }
    /**
     * @description trigger filtering using a value
     * @param {String} value
     */

  }, {
    key: "filter",
    value: function filter(value) {
      // fail silently if no value is provided
      if (typeof value === 'undefined') {
        this.cancelFilterPrep();
        return;
      }

      var forceShowAll = this.forceShowAll;
      var callbackResponse = this.triggerOptionCallback('onSearch', [value]);
      var toReturn = []; // allow onSearch callback to affect the searched value
      // only permitted when not a forceShowAll case

      if (!forceShowAll && typeof callbackResponse === 'string') {
        value = callbackResponse;
      } // store search term - used for comparison in filterPrep


      this.term = value; // async handling

      if (this.async) {
        this.handleAsync(value); // set show all to false immediately as may be used in other places

        this.forceShowAll = false;
        return;
      } // handle the source as a function


      if (typeof this.source === 'function') {
        toReturn = this.source.call(this.wrapper, this.term);
        this.setListOptions(toReturn);
        return;
      } // if empty string, show all


      if (!value) {
        forceShowAll = true;
      } // existing list handling


      if (this.source && this.source.length) {
        if (!forceShowAll) {
          value = (0, _helpers.cleanString)(value);
        }

        for (var i = 0, l = this.source.length; i < l; i += 1) {
          var entry = this.source[i];

          if (forceShowAll || entry.cleanedLabel.search(value) !== -1) {
            toReturn.push({
              element: entry.element,
              staticSourceIndex: i,
              label: entry.label,
              value: entry.value
            });
          }
        }
      }

      this.setListOptions(toReturn);
    }
    /**
     * @description cancel filter timer and remove loading classes
     */

  }, {
    key: "cancelFilterPrep",
    value: function cancelFilterPrep() {
      if (this.filterTimer) {
        clearTimeout(this.filterTimer);
      }

      var nameSpace = this.cssNameSpace;
      (0, _helpers.removeClass)(this.wrapper, "".concat(nameSpace, "__wrapper--loading loading"));
      (0, _helpers.removeClass)(this.input, "".concat(nameSpace, "__input--loading loading"));
      this.filtering = false;
    }
    /**
     * @description checks before filtering, and set filter timer
     * @param {Event} e
     * @param {Boolean=} doValueOverrideCheck - whether to check input value against selected item(s)
     * @param {Boolean=} runNow
     */

  }, {
    key: "filterPrep",
    value: function filterPrep(e) {
      var _this3 = this;

      var doValueOverrideCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var runNow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var forceShowAll = this.forceShowAll;
      var delay = forceShowAll || runNow ? 0 : this.options.delay; // clear timers

      this.filtering = true;
      this.cancelFilterPrep();
      this.filterTimer = setTimeout(function () {
        var value = _this3.input.value; // treat as empty search if...
        // forceShowAll, or in single mode and selected item label matches current value

        if (forceShowAll || value === '' || doValueOverrideCheck && !_this3.multiple && _this3.selected.length && (0, _helpers.trimString)(_this3.selected[0].label) === (0, _helpers.trimString)(value)) {
          value = '';
        } // handle aria-describedby


        _this3.setInputDescription();

        if (!forceShowAll && value.length < _this3.options.minLength) {
          _this3.hide();

          return;
        } // try catch used due to permissions issues in some cases


        var modifier;

        try {
          var keydown = e && e.type === 'keydown';
          modifier = keydown && (e.altKey || e.ctrlKey || e.metaKey); // allow shift key, just in case...
        } catch (e) {} // if value to use matches last used search term, do nothing


        var equalVals = value === _this3.term; // prevent search being run again with the same value

        if (!equalVals || equalVals && !_this3.menuOpen && !modifier) {
          var n = _this3.cssNameSpace;
          (0, _helpers.addClass)(_this3.wrapper, "".concat(n, "__wrapper--loading loading"));
          (0, _helpers.addClass)(_this3.input, "".concat(n, "__input--loading loading"));
          _this3.currentSelectedIndex = -1;

          _this3.filter(value);
        }
      }, delay);
    }
    /**
     * @description trigger filter prep in showAll mode
     * @param {Event} event
     */

  }, {
    key: "filterPrepShowAll",
    value: function filterPrepShowAll(event) {
      event.preventDefault();
      this.forceShowAll = true;
      this.filterPrep(event, false, true);
    }
    /**
     * @description blur behaviour for hiding list and removing focus class(es)
     * @param {Event} event
     * @param {Boolean} force - fire instantly and force blurring out of the component
     */

  }, {
    key: "handleComponentBlur",
    value: function handleComponentBlur(event, force) {
      var _this4 = this;

      var delay = force ? 0 : 100;

      if (this.componentBlurTimer) {
        clearTimeout(this.componentBlurTimer);
      } // use a timeout to ensure this blur fires after other focus events
      // and in case the user focuses back in immediately


      this.componentBlurTimer = setTimeout(function () {
        // do nothing if blurring to an element within the list
        var activeElem = document.activeElement; // exception for show all button

        /** @todo: exception for selected items */

        if (!force && !(_this4.showAll && _this4.showAll === activeElem)) {
          // must base this on the wrapper to allow scrolling the list in IE
          if (_this4.wrapper.contains(activeElem)) {
            return;
          }
        }

        var isQueryIn = _this4.isQueryContainedIn.bind(_this4); // cancel any running async call


        if (_this4.xhr) {
          _this4.xhr.abort();
        } // confirmOnBlur behaviour


        if (!force && _this4.options.confirmOnBlur && _this4.menuOpen) {
          // if blurring from an option (currentSelectedIndex > -1), select it
          var toUse = _this4.currentSelectedIndex;

          if (typeof toUse !== 'number' || toUse === -1) {
            // otherwise check for exact match between current input value and available items
            toUse = isQueryIn('', _this4.filteredSource);
          }

          _this4.handleOptionSelect({}, toUse, false);
        }

        var n = _this4.cssNameSpace;
        (0, _helpers.removeClass)(_this4.wrapper, "".concat(n, "__wrapper--focused focused focus"));
        (0, _helpers.removeClass)(_this4.input, "".concat(n, "__input--focused focused focus"));

        _this4.cancelFilterPrep();

        _this4.hide(); // in single select case, if current value and chosen value differ, clear selected and input value


        if (!_this4.multiple && isQueryIn('', _this4.selected) === -1) {
          var isInputOrDdl = _this4.elementIsInput || _this4.elementIsSelect;

          if (isInputOrDdl && _this4.element.value !== '') {
            _this4.element.value = '';
            (0, _helpers.dispatchEvent)(_this4.element, 'change');
          }

          _this4.input.value = '';
          _this4.selected = [];
        }
      }, delay);
    }
    /**
     * @description enter keydown for selections
     * @param {Event} event
     */

  }, {
    key: "handleEnterKey",
    value: function handleEnterKey(event) {
      /** @todo: if in multiple mode, and event target was a selected item, remove it */
      if (this.multiple) {}

      if (this.disabled) {
        return;
      }

      if (this.showAll && event.target === this.showAll) {
        this.filterPrepShowAll(event);
        return;
      }

      if (this.menuOpen) {
        event.preventDefault();

        if (this.currentSelectedIndex > -1) {
          this.handleOptionSelect(event, this.currentSelectedIndex);
        }
      } // if enter keypress was from the filter input, trigger search immediately


      if (event.target === this.input) {
        this.filterPrep(event, false, true);
      }
    }
    /**
     * @description down arrow usage - option focus, or search all
     * @param {Event} event
     */

  }, {
    key: "handleDownArrowKey",
    value: function handleDownArrowKey(event) {
      event.preventDefault(); // if closed, and text is long enough, run search

      if (!this.menuOpen) {
        this.forceShowAll = this.options.minLength < 1;

        if (this.forceShowAll || this.input.value.length >= this.options.minLength) {
          this.filterPrep(event);
        }
      } // move focus to downward option


      if (this.menuOpen && !this.filtering) {
        var current = this.currentSelectedIndex;

        if (typeof current !== 'number' || current < 0) {
          this.setOptionFocus(event, 0);
        } else {
          this.setOptionFocus(event, current + 1);
        }
      }
    }
    /**
     * @description up arrow usage - option focus, or return focus to input
     * @param {Event} event
     */

  }, {
    key: "handleUpArrowKey",
    value: function handleUpArrowKey(event) {
      event.preventDefault();
      var usable = !this.disabled && this.menuOpen;

      if (usable && typeof this.currentSelectedIndex === 'number') {
        this.setOptionFocus(event, this.currentSelectedIndex - 1);
      }
    }
    /**
     * @description standard keydown handling (excluding enter, up, down, escape)
     * @param {Event} event
     */

  }, {
    key: "handleKeyDownDefault",
    value: function handleKeyDownDefault(event) {
      var targetIsInput = event.target === this.input; // on space, if focus state is on any other item, treat as enter

      if (event.keyCode === 32 && !targetIsInput) {
        this.handleEnterKey(event);
      }

      if (this.disabled) {
        return;
      } // on backspace, if using empty input in multiple mode, delete last selected entry


      var selectedLength = this.selected && this.selected.length;

      if (targetIsInput && this.multiple && selectedLength && event.keyCode === 8 && this.input.value === '') {
        var lastSelectedLabel = this.selected[selectedLength - 1].label;
        var announcement = "".concat(lastSelectedLabel, " ").concat(this.options.srDeletedText);
        this.announce(announcement, 0);
        this.selected.pop();
        this.buildMultiSelected();
        return;
      } // any printable character not on input, return focus to input


      var focusInput = !targetIsInput && (0, _helpers.isPrintableKey)(event.keyCode);

      if (focusInput) {
        this.input.focus();
      } // trigger filtering - done here, instead of using input event, due to IE9 issues


      if (focusInput || targetIsInput) {
        this.filterPrep(event);
      }
    }
    /**
     * @description component keydown handling
     * @param {Event} event
     */

  }, {
    key: "prepKeyDown",
    value: function prepKeyDown(event) {
      switch (event.keyCode) {
        case 13:
          // on enter
          this.handleEnterKey(event);
          break;

        case 27:
          // on escape
          this.handleComponentBlur(event, true);
          break;

        case 38:
          // on up
          this.handleUpArrowKey(event);
          break;

        case 40:
          // on down
          this.handleDownArrowKey(event);
          break;

        default:
          this.handleKeyDownDefault(event);
          break;
      }
    }
    /**
     * @description bind component events to generated elements
     */

  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this5 = this;

      // when focus is moved outside of the component, close everything
      this.wrapper.addEventListener('focusout', function (event) {
        _this5.handleComponentBlur(event, false);
      }); // set wrapper focus state

      this.wrapper.addEventListener('focusin', function (event) {
        var toAdd = "".concat(_this5.cssNameSpace, "__wrapper--focused focused focus");
        (0, _helpers.addClass)(_this5.wrapper, toAdd);

        if (!_this5.list.contains(event.target)) {
          _this5.currentSelectedIndex = -1;
        }
      }); // handle all keydown events inside the component

      this.wrapper.addEventListener('keydown', function (event) {
        _this5.prepKeyDown(event);
      }); // if clicking directly on the wrapper, move focus to the input

      this.wrapper.addEventListener('click', function (event) {
        if (event.target === _this5.wrapper) {
          _this5.input.focus();
        }
      }); // when blurring out of input, check current value against selected one and clear if needed

      this.input.addEventListener('blur', function () {
        var toRemove = "".concat(_this5.cssNameSpace, "__input--focused focused focus");
        (0, _helpers.removeClass)(_this5.input, toRemove);
      }); // trigger filter on input event as well as keydown (covering bases)

      this.input.addEventListener('input', function (event) {
        _this5.filterPrep(event);
      }); // when specifically clicking on input, if menu is closed, and value is long enough, search

      this.input.addEventListener('click', function (event) {
        var open = _this5.menuOpen;

        if (!open && _this5.input.value.length >= _this5.options.minLength) {
          _this5.filterPrep(event, true);
        }
      }); // when focusing on input, reset selected index and trigger search handling

      this.input.addEventListener('focusin', function () {
        var toAdd = "".concat(_this5.cssNameSpace, "__input--focused focused focus");
        (0, _helpers.addClass)(_this5.input, toAdd);

        if (!_this5.disabled && !_this5.menuOpen) {
          _this5.filterPrep(event, true);
        }
      }); // show all button click

      if (this.showAll) {
        this.showAll.addEventListener('click', function (event) {
          _this5.filterPrepShowAll(event);
        });
      } // clear any current focus position when hovering into the list


      this.list.addEventListener('mouseenter', function (event) {
        _this5.resetOptionAttributes();
      }); // trigger options selection

      this.list.addEventListener('click', function (event) {
        if (event.target !== _this5.list) {
          var childNodes = _this5.list.childNodes;

          if (childNodes.length) {
            var nodeIndex = [].indexOf.call(childNodes, event.target);

            _this5.handleOptionSelect(event, nodeIndex);
          }
        }
      });
    }
    /**
     * @description set starting source array based on child checkboxes
     */

  }, {
    key: "prepListSourceCheckboxes",
    value: function prepListSourceCheckboxes() {
      this.multiple = true; // force multiple in this case
      // reset source and use checkboxes

      this.source = [];
      var elements = this.element.querySelectorAll('input[type="checkbox"]');

      for (var i = 0, l = elements.length; i < l; i += 1) {
        var checkbox = elements[i]; // must have a value other than empty string

        if (!checkbox.value) {
          continue;
        }

        var toPush = {
          element: checkbox,
          value: checkbox.value
        }; // label searching

        var label = checkbox.closest('label');

        if (!label && checkbox.id) {
          label = document.querySelector('[for="' + checkbox.id + '"]');
        }

        if (label) {
          toPush.label = label.textContent;
        } // if no label so far, re-use value


        if (!toPush.label) {
          toPush.label = toPush.value;
        }

        toPush.cleanedLabel = (0, _helpers.cleanString)(toPush.label);
        this.source.push(toPush); // add to selected if applicable

        if (checkbox.checked) {
          this.selected.push(toPush);
        }
      }
    }
    /**
     * @description set starting source array based on <select> options
     */

  }, {
    key: "prepListSourceDdl",
    value: function prepListSourceDdl() {
      this.multiple = this.element.multiple; // force multiple to match select
      // reset source and use options

      this.source = [];
      var options = this.element.querySelectorAll('option');

      for (var i = 0, l = options.length; i < l; i += 1) {
        var option = options[i]; // must have a value other than empty string

        if (!option.value) {
          continue;
        }

        var toPush = {
          element: option,
          value: option.value,
          label: option.textContent
        };
        toPush.cleanedLabel = (0, _helpers.cleanString)(toPush.label);
        this.source.push(toPush); // add to selected if applicable

        if (option.selected) {
          this.selected.push(toPush);
        }
      }
    }
    /**
     * @description adjust starting source array to format needed, and set selected
     */

  }, {
    key: "prepListSourceArray",
    value: function prepListSourceArray() {
      var mapping = this.options.sourceMapping;
      this.source = (0, _helpers.processSourceArray)(this.source, mapping); // build up selected array if starting element was an input, and had a value

      if (this.elementIsInput && this.element.value) {
        var value = this.element.value; // account for multiple mode

        var multiple = this.options.multiple;
        var separator = this.options.multipleSeparator;
        var valueArr = multiple ? value.split(separator) : [value];

        for (var i = 0, l = valueArr.length; i < l; i += 1) {
          var val = valueArr[i];
          var isQueryIn = this.isQueryContainedIn; // make sure it is not already in the selected array

          var isInSelected = isQueryIn(val, this.selected, 'value') > -1; // but is in the source array (check via 'value', not 'label')

          if (!isInSelected) {
            var indexInSource = isQueryIn(val, this.source, 'value');

            if (indexInSource > -1) {
              this.selected.push(this.source[indexInSource]);
            }
          }
        }
      }
    }
    /**
     * @description adjust set sources to needed format
     */

  }, {
    key: "prepListSource",
    value: function prepListSource() {
      this.async = false; // allow complete control over the source handling via custom function

      if (typeof this.source === 'function') {
        return;
      } // string source - treat as async endpoint


      if (typeof this.source === 'string' && this.source.length) {
        return this.async = true;
      } // array source - copy array


      if (Array.isArray(this.source) && this.source.length) {
        return this.prepListSourceArray();
      } // dropdown source


      if (this.elementIsSelect) {
        return this.prepListSourceDdl();
      } // checkboxlist source


      if (this.element.querySelector('input[type="checkbox"]')) {
        this.prepListSourceCheckboxes();
      }
    }
    /**
     * @description set input starting states - aria attributes, disabled state, starting value
     */

  }, {
    key: "setInputStartingStates",
    value: function setInputStartingStates() {
      // update corresponding label to now focus on the new input
      var label = document.querySelector('[for="' + this.ids.ELEMENT + '"]');

      if (label) {
        label.ariaAutocompleteOriginalFor = this.ids.ELEMENT;
        label.setAttribute('for', this.ids.INPUT);
      } // update aria-describedby and aria-labelledby attributes if present


      var describedBy = this.element.getAttribute('aria-describedby');

      if (describedBy) {
        this.input.setAttribute('aria-describedby', describedBy);
      }

      var labelledBy = this.element.getAttribute('aria-labelledby');

      if (labelledBy) {
        this.input.setAttribute('aria-labelledby', labelledBy);
      } // if selected item(s) already exists


      if (this.selected.length) {
        // for multi select variant, set selected items
        if (this.multiple) {
          this.buildMultiSelected();
        } // for single select variant, set value to match
        else {
            this.input.value = this.selected[0].label || '';
          }
      } // setup input description - done here in case value is affected above


      this.setInputDescription(); // disable the control if the invoked element was disabled

      if (!!this.element.disabled) {
        this.disable();
      }
    }
    /**
     * @description build and insert component html structure
     */

  }, {
    key: "setHtml",
    value: function setHtml() {
      var o = this.options;
      var cssName = this.cssNameSpace;
      var showAll = this.options.showAll;
      var explainerText = o.srExplanatoryText;
      var listClass = o.listClassName ? " ".concat(o.listClassName) : '';
      var inputClass = o.inputClassName ? " ".concat(o.inputClassName) : '';
      var wrapperClass = o.wrapperClassName ? " ".concat(o.wrapperClassName) : '';
      var explainer = explainerText ? " aria-label=\"".concat(explainerText, "\"") : '';

      if (showAll) {
        wrapperClass += " ".concat(cssName, "__wrapper--show-all");
      }

      var newHtml = ["<div id=\"".concat(this.ids.WRAPPER, "\" class=\"").concat(cssName, "__wrapper").concat(wrapperClass, "\">")]; // add input

      newHtml.push("<input type=\"text\" autocomplete=\"off\" aria-expanded=\"false\" aria-autocomplete=\"list\" role=\"combobox\" id=\"".concat(this.ids.INPUT, "\" placeholder=\"").concat(this.options.placeholder, "\" aria-owns=\"").concat(this.ids.LIST, "\" aria-placeholder=\"").concat(this.options.placeholder, "\" class=\"").concat(cssName, "__input").concat(inputClass, "\" />")); // button to show all available options

      if (showAll) {
        newHtml.push("<span role=\"button\" aria-label=\"Show all\" class=\"".concat(cssName, "__show-all\" tabindex=\"0\" id=\"").concat(this.ids.BUTTON, "\" aria-expanded=\"false\"></span>"));
      } // add the list holder


      newHtml.push("<ul id=\"".concat(this.ids.LIST, "\" class=\"").concat(cssName, "__list").concat(listClass, "\" role=\"listbox\" hidden=\"hidden\"").concat(explainer, "></ul>")); // add the screen reader assistance element

      newHtml.push("<span class=\"sr-only ".concat(cssName, "__sr-only ").concat(cssName, "__sr-assistance\" id=\"").concat(this.ids.SR_ASSISTANCE, "\">").concat(this.options.srAssistiveText, "</span>")); // add element for added screen reader announcements

      newHtml.push("<span class=\"sr-only ".concat(cssName, "__sr-only ").concat(cssName, "__sr-announcements\" id=\"").concat(this.ids.SR_ANNOUNCEMENTS, "\" aria-live=\"polite\" aria-atomic=\"true\"></span>")); // close all and append

      newHtml.push("</div>");
      this.element.insertAdjacentHTML('afterend', newHtml.join(''));
    }
    /**
     * @todo: refresh method for use after changing options, source, etc.
     */

  }, {
    key: "refresh",
    value: function refresh() {
      var options = (0, _helpers.mergeObjects)(this.options); // store new object from existing options

      /** @todo: soft destroy in this case */

      this.destroy();
      this.options = options;
      this.init();
    }
    /**
     * @description destroy component
     */

  }, {
    key: "destroy",
    value: function destroy() {
      // return original label 'for' attribute back to element id
      var label = document.querySelector('[for="' + this.ids.INPUT + '"]');

      if (label && label.ariaAutocompleteOriginalFor) {
        label.setAttribute('for', label.ariaAutocompleteOriginalFor);
        delete label.ariaAutocompleteOriginalFor;
      } // remove the whole wrapper and set all instance properties to null to clean up DOMNode references


      this.element.parentNode.removeChild(this.wrapper);

      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          this[i] = null;
        }
      }

      delete this.element.ariaAutocomplete; // re-show original element

      this.show(this.element);
    }
    /**
     * @description do it!!
     */

  }, {
    key: "init",
    value: function init() {
      this.selected = []; // set these internally so that the component has to be properly refreshed to change them

      this.source = this.options.source;
      this.multiple = this.options.multiple;
      this.cssNameSpace = this.options.cssNameSpace; // create html structure

      this.setHtml(); // additional app variables

      this.list = document.getElementById(this.ids.LIST);
      this.input = document.getElementById(this.ids.INPUT);
      this.wrapper = document.getElementById(this.ids.WRAPPER);
      this.showAll = document.getElementById(this.ids.BUTTON);
      this.srAnnouncements = document.getElementById(this.ids.SR_ANNOUNCEMENTS); // hide element and list manually

      this.hide(this.list); // pass in the list so that the onClose is not triggered

      this.hide(this.element); // set internal source array, from static elements if necessary

      this.prepListSource(); // set starting states for input - must be after source has been defined

      this.setInputStartingStates(); // bind all necessary events

      this.bindEvents();
      /** @todo: handling of initial value in async case - other cases handled in setInputStartingStates */

      /** @todo: store api on original element */

      this.element.ariaAutocomplete = {}; // fire onready callback

      this.triggerOptionCallback('onReady');
    }
  }]);

  return AriaAutocomplete;
}();
/**
 * @description expose specific function rather than the AriaAutocomplete class
 * @param {Element} elem
 * @param {Object} options
 * @returns {Object}
 */


function expose(elem, options) {
  var autocomplete = new AriaAutocomplete(elem, options);
  return autocomplete.api;
}

window['AriaAutocomplete'] = expose;
var _default = expose;
exports.default = _default;
},{"./closest-polyfill":"kTsq","./helpers":"lTk1"}]},{},["c8cM"], null)
//# sourceMappingURL=/aria-autocomplete.js.map