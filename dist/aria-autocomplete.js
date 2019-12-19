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
},{}],"MBeS":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trimString = trimString;
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.cleanString = cleanString;
exports.isPrintableKey = isPrintableKey;
exports.mergeObjects = mergeObjects;
exports.dispatchEvent = dispatchEvent;
exports.setElementState = setElementState;
exports.processSourceArray = processSourceArray;
exports.htmlToElement = htmlToElement;
exports.setCss = setCss;
exports.transferStyles = transferStyles;
exports.searchVarPropsFor = searchVarPropsFor;
exports.removeDuplicatesAndLabel = removeDuplicatesAndLabel;

/**
 * @description trim string helper
 * @param {string} theString
 */
function trimString(theString) {
  return theString == null ? '' : (theString + '').trim();
}
/**
 * @description check if element has class
 * @param {Element} element - element to check class on
 * @param {String} className
 * @returns {Boolean}
 */


function hasClass(element, className) {
  var e = element;
  var cur = trimString(e.getAttribute && e.getAttribute('class'));
  return " ".concat(cur, " ").indexOf(" ".concat(className, " ")) > -1;
}
/**
 * @description add class(es) to element
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
 * @description remove class(es) from element
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
var REGEX_TO_IGNORE = /[\u2018\u2019',:\u2013-]/g;
var REGEX_MAKE_SAFE = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
/**
 * @description clean string of some characters, and make safe for regex searching
 * @param {String} theString
 * @param {Boolean=} makeSafeForRegex
 * @returns {String}
 */

function cleanString(theString) {
  var makeSafeForRegex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  theString = trimString(theString).toLowerCase() // case insensitive
  .replace(REGEX_TO_IGNORE, '') // ignore quotes, commas, colons, and hyphens
  .replace(REGEX_AMPERSAND, 'and') // treat & and 'and' as the same
  .replace(REGEX_DUPE_WHITESPACE, ' '); // ignore duplicate whitespace
  // make safe for regex searching

  if (makeSafeForRegex) {
    theString = theString.replace(REGEX_MAKE_SAFE, '\\$&');
  }

  return theString;
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
    var htmlEvents = document.createEvent('HTMLEvents');
    htmlEvents.initEvent(event, true, true);
    element.dispatchEvent(htmlEvents);
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
        // generate new object to not modify original
        result = mergeObjects(entry);
        var value = result[mapValue] || result.value || result.label;
        var label = result[mapLabel] || result.label || result.value;
        result.value = (value || '').toString();
        result.label = (label || '').toString();
      } // whether to set a cleaned label for static source filtering (in filter method)


    if (setCleanedLabel !== false) {
      result.ariaAutocompleteCleanedLabel = cleanString(result.label);
    }

    toReturn.push(result);
  }

  return toReturn;
}

var DIV = document.createElement('div');
/**
 * @description convert HTML string into an element
 * @param {String} html
 * @returns {Element}
 */

function htmlToElement(html) {
  DIV.innerHTML = trimString(html);
  return DIV.firstChild;
}
/**
 * @description set styles on an element
 * @param {Element} element
 * @param {Object} s
 */


function setCss(element, s) {
  if (!element) {
    return;
  }

  for (var i in s) {
    var style = typeof s[i] === 'number' ? s[i] + 'px' : s[i];
    element.style[i] = style + ''; // force to be a string
  }
}
/**
 * @description transfer styles from one Element to another
 * @param {Element} from
 * @param {Element} to
 * @param {Array=} properties
 */


function transferStyles(from, to, properties) {
  if (!from || !to) {
    return;
  }

  var fromStyles = getComputedStyle(from);
  var styles = {};

  if (properties && properties.length) {
    for (var i = 0, l = properties.length; i < l; i += 1) {
      styles[properties[i]] = fromStyles[properties[i]];
    }
  } else {
    styles = fromStyles;
  }

  setCss(to, styles);
}
/**
 * @description search String or Array for another string - partial match
 * @param {String|Array} prop
 * @param {String} regexSafeQuery
 * @param {String=} name
 */


var searchPropFor = function searchPropFor(prop, regexSafeQuery, name) {
  if (typeof prop === 'string') {
    if (name !== 'ariaAutocompleteCleanedLabel') {
      prop = cleanString(prop, false);
    }

    return prop.search(regexSafeQuery) !== -1;
  } else if (Array.isArray(prop)) {
    for (var i = 0, l = prop.length; i < l; i += 1) {
      if (searchPropFor(prop[i], regexSafeQuery)) {
        return true;
      }
    }
  }

  return false;
};
/**
 * @description check through object's String or String[] properties for query match
 * @param {Object} obj
 * @param {String[]} props
 * @param {String} query
 * @param {Boolean=} makeQuerySafe
 * @returns {Boolean}
 */


function searchVarPropsFor(obj, props, query) {
  var makeQuerySafe = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (makeQuerySafe) {
    query = cleanString(query, true);
  }

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      var proceed = false; // check if obj property is a string, and if property name is in props Array

      if (typeof obj[i] === 'string') {
        // use while loop instead of indexOf for performance in older browsers
        var l = props.length;

        while (l--) {
          if (props[l] === i) {
            proceed = true;
            break;
          }
        }
      } else {
        // if not a string, only allow Arrays otherwise
        proceed = Array.isArray(obj[i]);
      }

      if (proceed && searchPropFor(obj[i], query, i)) {
        return true;
      }
    }
  }

  return false;
}
/**
 * @description remove duplicate array entries, and `label`
 * @param {Array} arr
 * @returns {String[]}
 */


function removeDuplicatesAndLabel(arr) {
  // remove `label` (we will be using `ariaAutocompleteCleanedLabel`) and duplicates from props array
  var result = [];

  for (var i = 0, l = arr.length; i < l; i += 1) {
    if (typeof arr[i] !== 'string') {
      continue;
    }

    var str = trimString(arr[i]);
    var proceed = str !== 'label';
    var j = result.length;

    while (proceed && j--) {
      if (result[j] === str) {
        proceed = false;
      }
    }

    if (proceed) {
      result.push(str);
    }
  }

  return result;
}
},{}],"KnPF":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _autocompleteHelpers = require("./autocomplete-helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @description storage for element used to detect value width
 */
var testSpan;
/**
 * @description set an input element to autogrow based on its value
 * @param {Element} input
 */

var AutoGrow =
/*#__PURE__*/
function () {
  function AutoGrow(input) {
    _classCallCheck(this, AutoGrow);

    this.input = input;
    this.currentString;
    this.eventHandler;
    this.currentWidth;
    this.init();
  }
  /**
   * @description trigger an autogrow check
   */


  _createClass(AutoGrow, [{
    key: "trigger",
    value: function trigger() {
      this.checkAndSet.call(this);
    }
    /**
     * @description get current user selection from within the input
     */

  }, {
    key: "getInputSelection",
    value: function getInputSelection() {
      var result = {};

      if ('selectionStart' in this.input) {
        result.start = this.input.selectionStart;
        result.length = this.input.selectionEnd - result.start;
      } else if (document.selection) {
        this.input.focus();
        var selection = document.selection.createRange();
        var selectionLength = selection.text.length;
        selection.moveStart('character', -this.input.value.length);
        result.start = selection.text.length - selectionLength;
        result.length = selectionLength;
      }

      return result;
    }
    /**
     * @description measure the pixel width of a string in an input
     * @param {String} str
     * @returns {Number}
     */

  }, {
    key: "measureString",
    value: function measureString(str) {
      if (!str) {
        this.currentString = str;
        return 0;
      } // check for matching string
      // risky, as styles could change between checks, but better for performance


      if (str === this.currentString) {
        return this.currentWidth;
      }

      if (!testSpan) {
        testSpan = document.createElement('span');
        (0, _autocompleteHelpers.setCss)(testSpan, {
          position: 'absolute',
          top: -99999,
          left: -99999,
          width: 'auto',
          padding: 0,
          whiteSpace: 'pre'
        });
        document.body.appendChild(testSpan);
      }

      testSpan.textContent = str;
      this.currentString = str;
      (0, _autocompleteHelpers.transferStyles)(this.input, testSpan, ['letterSpacing', 'fontSize', 'fontFamily', 'fontWeight', 'textTransform']);
      return testSpan.offsetWidth || testSpan.clientWidth;
    }
    /**
     * @description check the current input value and set width
     * @param {Event} event
     */

  }, {
    key: "checkAndSet",
    value: function checkAndSet() {
      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (event.metaKey || event.altKey) {
        return;
      }

      var value = this.input.value;

      if (event.type && event.type.toLowerCase() === 'keydown') {
        var keyCode = event.keyCode;
        var keyCodeIsDelete = keyCode === 46;
        var keyCodeIsBackspace = keyCode === 8; // delete or backspace

        if (keyCodeIsDelete || keyCodeIsBackspace) {
          var selection = this.getInputSelection();

          if (selection.length) {
            value = value.substring(0, selection.start) + value.substring(selection.start + selection.length);
          } else if (keyCodeIsBackspace && selection.start) {
            value = value.substring(0, selection.start - 1) + value.substring(selection.start + 1);
          } else if (keyCodeIsDelete && selection.start !== undefined) {
            value = value.substring(0, selection.start) + value.substring(selection.start + 1);
          }
        } // any other width affecting character
        else if ((0, _autocompleteHelpers.isPrintableKey)(keyCode)) {
            var character = String.fromCharCode(keyCode);

            if (event.shiftKey) {
              character = character.toUpperCase();
            } else {
              character = character.toLowerCase();
            }

            value += character;
          }
      }

      var placeholder;

      if (!value && (placeholder = this.input.getAttribute('placeholder'))) {
        value = placeholder;
      }

      var width = this.measureString(value) + 4;

      if (width !== this.currentWidth) {
        this.currentWidth = width;
        this.input.style.width = "".concat(width, "px");
      }
    }
    /**
     * @description destroy the autogrow behaviour
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.input.removeEventListener('blur', this.eventHandler);
      this.input.removeEventListener('input', this.eventHandler);
      this.input.removeEventListener('keyup', this.eventHandler);
      this.input.removeEventListener('keydown', this.eventHandler);
      this.input = null;
    }
    /**
     * @description initialise the autogrow behaviour and bind events
     */

  }, {
    key: "init",
    value: function init() {
      this.checkAndSet();
      this.eventHandler = this.checkAndSet.bind(this);
      this.input.addEventListener('blur', this.eventHandler);
      this.input.addEventListener('input', this.eventHandler);
      this.input.addEventListener('keyup', this.eventHandler);
      this.input.addEventListener('keydown', this.eventHandler);
    }
  }]);

  return AutoGrow;
}();

exports.default = AutoGrow;
},{"./autocomplete-helpers":"MBeS"}],"c8cM":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("./closest-polyfill");

var _autogrow = _interopRequireDefault(require("./autogrow"));

var _autocompleteHelpers = require("./autocomplete-helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var appIndex = 0;
var DEFAULT_OPTIONS = {
  /**
   * @description Give the autocomplete a name to be included in form submissions
   * (Instead of using this option, I would advise initialising the autocomplete on
   * an existing input that will be submitted, to also use any existing validation;
   * this approach is also compatible with the control in multiple mode)
   */
  name: '',

  /**
   * @type {String | String[] | Object[] | Function}
   * @description Specify source. See examples file for more specific usage.
   * @example ['Afghanistan', 'Albania', 'Algeria', ...more]
   * @example (query, render) => render(arrayToUse)
   */
  source: '',

  /**
   * @description Properties to use for label and value
   * when source is an Array of Objects
   */
  sourceMapping: {},

  /**
   * @type {String[]}
   * @description Additional properties to use when searching for a match.
   * `label` will always be used
   */
  alsoSearchIn: [],

  /**
   * @description Input delay after typing before running a search
   */
  delay: 100,

  /**
   * @description Minimum number of characters to run a search (includes spaces)
   */
  minLength: 1,

  /**
   * @description Maximum number of results to render. Also used with async endpoint
   */
  maxResults: 9999,

  /**
   * @description Render a control that triggers showing all options.
   * Runs a search with an empty query: '', and maxResults of 9999
   */
  showAllControl: false,

  /**
   * Confirm currently active selection when blurring off of the control. If
   * no active selection, will compare current input value against available labels
   */
  confirmOnBlur: true,

  /**
   * @description Allow multiple items to be selected
   */
  multiple: false,

  /**
   * @description Adjust input width to match its value.
   * Experimental, and a performance hit
   */
  autoGrow: false,

  /**
   * @description Maximum number of items that can be selected
   */
  maxItems: 9999,

  /**
   * @description If initialised element is an input, and in multiple mode,
   * character that separates the selected values e.g. "GLP,ZWE"
   */
  multipleSeparator: ',',

  /**
   * @description If input is empty and in multiple mode,
   * delete last selected item on backspace
   */
  deleteOnBackspace: false,

  /**
   * @description In async mode, parameter to use when adding the input value
   * to the endpoint String. e.g. https://some-endpoint?q=norway&limit=9999
   */
  asyncQueryParam: 'q',

  /**
   * @description In async mode, parameter to use when adding results limit
   * to the endpoint String. e.g. https://some-endpoint?q=norway&limit=9999
   */
  asyncMaxResultsParam: 'limit',

  /**
   * @description Placeholder text to show in generated input
   */
  placeholder: '',

  /**
   * @description Text to show (and announce to screen readers) if no results found.
   * If empty, the list of options will remain hidden when there are no results
   */
  noResultsText: 'No results',

  /**
   * @description String to prepend to classes for BEM naming
   * e.g. aria-autocomplete__input
   */
  cssNameSpace: 'aria-autocomplete',

  /**
   * @description Custom class name to add to the options list holder
   */
  listClassName: '',

  /**
   * @description Custom class name to add to the generated input
   */
  inputClassName: '',

  /**
   * @description Custom class name to add to the component wrapper
   */
  wrapperClassName: '',

  /**
   * @description In multiple mode, screen reader text used for element deletion.
   * Prepended to option label in aria-label attribute e.g. 'delete Canada'
   */
  srDeleteText: 'delete',

  /**
   * @description Screen reader text announced after deletion.
   * Apended to option label e.g. 'Canada deleted'
   */
  srDeletedText: 'deleted',

  /**
   * @description Value for aria-label attribute on the show all control
   */
  srShowAllText: 'Show all',

  /**
   * @description Screen reader text announced after confirming a selection.
   * Appended to option label e.g. 'Canada selected'
   */
  srSelectedText: 'selected',

  /**
   * @description Screen reader explainer added to the list element
   * via aria-label attribute
   */
  srListLabelText: 'Search suggestions',

  /**
   * @description Screen reader description announced when the input receives focus.
   * Only announced when input is empty
   */
  srAssistiveText: 'When results are available use up and down arrows to review and ' + 'enter to select. Touch device users, explore by touch or with swipe gestures.',

  /**
   * @description Screen reader announcement after results are rendered
   */
  srResultsText: function srResultsText(length) {
    return "".concat(length, " ").concat(length === 1 ? 'result' : 'results', " available.");
  },

  /**
   * @description Callback before async call is made - receives the URL.
   * Can be used to format the endpoint URL by returning a String
   */
  onAsyncPrep: undefined,

  /**
   * @description Callback after async call completes - receives the xhr object.
   * Can be used to format the results by returning an Array
   */
  onAsyncSuccess: undefined,

  /**
   * @description Callback prior to rendering - receives the options that are going
   * to render. Can be used to format the results by returning an Array
   */
  onResponse: undefined,

  /**
   * @description Callback before a search is performed - receives the input value.
   * Can be used to alter the search value by returning a String
   */
  onSearch: undefined,

  /**
   * @description Callback after selection is made -
   * receives an object with the option details
   */
  onConfirm: undefined,

  /**
   * @description Callback after an autocomplete selection is deleted.
   * Fires in single-select mode when selection is deleted automatically.
   * Fires in multi-select mode when selected is deleted by user action
   */
  onDelete: undefined,

  /**
   * @description Callback when main script processing and initial rendering has finished
   */
  onReady: undefined,

  /**
   * @description Callback when list area closes - receives the list holder element
   */
  onClose: undefined,

  /**
   * @description Callback when list area opens - receives the list holder element
   */
  onOpen: undefined
};
/**
 * @param {Element} element
 * @param {Object=} options
 */

var AriaAutocomplete =
/*#__PURE__*/
function () {
  function AriaAutocomplete(element, options) {
    _classCallCheck(this, AriaAutocomplete);

    // fail silently if no list provided
    if (!element) {
      return;
    } // if instance already exists on the list element, do not re-initialise


    if (element.ariaAutocomplete && element.ariaAutocomplete.open) {
      return {
        api: element.ariaAutocomplete
      };
    } // vars defined later - related explicitly to core initialising params


    this.options;
    this.element;
    this.elementIsInput;
    this.elementIsSelect; // vars defined later - elements

    this.list;
    this.input;
    this.wrapper;
    this.showAll;
    this.srAnnouncements; // vars defined later - non elements

    this.ids;
    this.xhr;
    this.term;
    this.async;
    this.source;
    this.menuOpen;
    this.multiple;
    this.selected;
    this.disabled;
    this.autoGrow;
    this.filtering;
    this.cssNameSpace;
    this.forceShowAll;
    this.filteredSource; // filtered source items to render

    this.currentListHtml;
    this.inputPollingValue;
    this.currentSelectedIndex; // for storing index of currently focused option
    // document click

    this.documentClick;
    this.documentClickBound; // timers

    this.filterTimer;
    this.pollingTimer;
    this.announcementTimer;
    this.componentBlurTimer;
    this.elementChangeEventTimer; // storage for autoGrow class

    this.AutoGrowInput; // get going!

    this.init(element, options);
  }
  /**
   * trigger callbacks included in component options
   * @param {String} name
   * @param {Array=} args
   * @param {Any=} args
   */


  _createClass(AriaAutocomplete, [{
    key: "triggerOptionCallback",
    value: function triggerOptionCallback(name, args, context) {
      context = typeof context === 'undefined' ? this.api : context;

      if (typeof this.options[name] === 'function') {
        return this.options[name].apply(context, args);
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
        (0, _autocompleteHelpers.removeClass)(element, toRemove);
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

        if (!this.documentClickBound) {
          this.documentClickBound = true;
          document.addEventListener('click', this.documentClick);
        }
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
        (0, _autocompleteHelpers.addClass)(element, "".concat(this.cssNameSpace, "--hide hide hidden"));
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
        (0, _autocompleteHelpers.removeClass)(this.input, "".concat(n, "__input--disabled disabled"));
        (0, _autocompleteHelpers.removeClass)(this.wrapper, "".concat(n, "__wrapper--disabled disabled"));

        if (this.showAll) {
          this.showAll.setAttribute('tabindex', '0');
          (0, _autocompleteHelpers.removeClass)(this.showAll, "".concat(n, "__show-all--disabled disabled"));
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
        (0, _autocompleteHelpers.addClass)(this.input, "".concat(n, "__input--disabled disabled"));
        (0, _autocompleteHelpers.addClass)(this.wrapper, "".concat(n, "__wrapper--disabled disabled"));

        if (this.showAll) {
          this.showAll.setAttribute('tabindex', '-1');
          (0, _autocompleteHelpers.addClass)(this.showAll, "".concat(n, "__show-all--disabled disabled"));
        }
      }
    }
    /**
     * @description trigger input resizing if autogrow is enabled
     */

  }, {
    key: "triggerAutoGrow",
    value: function triggerAutoGrow() {
      if (this.autoGrow && this.AutoGrowInput) {
        this.AutoGrowInput.trigger();
      }
    }
    /**
     * @description set input value to specific string, and related component vars
     * @param {String} value
     * @param {Boolean=} setPollingValue
     */

  }, {
    key: "setInputValue",
    value: function setInputValue(value) {
      var setPollingValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.input.value = this.term = value;

      if (setPollingValue) {
        this.inputPollingValue = value;
      }
    }
    /**
     * @description check if current input value is contained in a selection of options
     * @param {Array} options - array of objects with value and label properties
     * @param {String=} query - string to use - checks input value otherwise
     * @param {String=} prop - prop to check against in options array - defaults to 'label'
     * @returns {Number} index of array entry that matches, or -1 if none found
     */

  }, {
    key: "indexOfQueryIn",
    value: function indexOfQueryIn(options) {
      var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.input.value;
      var prop = arguments.length > 2 ? arguments[2] : undefined;
      query = (0, _autocompleteHelpers.trimString)(query).toLowerCase();

      if (query) {
        prop = prop || 'label';

        for (var i = 0, l = options.length; i < l; i += 1) {
          if ((0, _autocompleteHelpers.trimString)(options[i][prop]).toLowerCase() === query) {
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
     * @description check if element is a selected element in the DOM
     * @param {Element} element
     * @returns {Boolean}
     */

  }, {
    key: "isSelectedElem",
    value: function isSelectedElem(element) {
      return this.multiple && element.ariaAutocompleteSelectedOption && (0, _autocompleteHelpers.hasClass)(element, "".concat(this.cssNameSpace, "__selected"));
    }
    /**
     * @description get DOM elements for selected items
     * @returns {Element[]}
     */

  }, {
    key: "getSelectedElems",
    value: function getSelectedElems() {
      var n = this.wrapper.childNodes;
      var a = [];

      for (var i = 0, l = n.length; i < l; i += 1) {
        if (this.isSelectedElem(n[i])) {
          a.push(n[i]);
        }
      }

      return a;
    }
    /**
     * @description remove object from selected
     * @param {Object} entry
     */

  }, {
    key: "removeEntryFromSelected",
    value: function removeEntryFromSelected(entry) {
      var index = this.selected.indexOf(entry);

      if (index === -1) {
        // value check, in case explicit object reference did not work
        for (var i = 0, l = this.selected.length; i < l; i += 1) {
          if (this.selected[i].value === entry.value) {
            index = i;
            break;
          }
        }
      } // set element state, dispatch change event, set selected array,
      // trigger callback, build selected, and do screen reader announcement


      if (index > -1 && this.selected[index]) {
        var option = (0, _autocompleteHelpers.mergeObjects)(this.selected[index]);
        var label = option.label;
        (0, _autocompleteHelpers.setElementState)(option.element, false, this);
        this.selected.splice(index, 1);
        this.triggerOptionCallback('onDelete', [option]);
        this.buildMultiSelected();
        this.announce("".concat(label, " ").concat(this.options.srDeletedText), 0);
      }
    }
    /**
     * @description re-build the html showing the selected items
     * note: there are a lot of loops here - could affect performance
     */

  }, {
    key: "buildMultiSelected",
    value: function buildMultiSelected() {
      // only do anything in multiple mode
      if (!this.multiple) {
        return;
      } // disable or enable as needed


      if (this.multiple && this.selected.length >= this.options.maxItems) {
        this.disable();
      } else {
        this.enable();
      } // no elements, and none selected, do nothing


      var currentSelectedElems = this.getSelectedElems();

      if (!this.selected.length && !currentSelectedElems.length) {
        return;
      } // cycle through existing elements, and remove any not in the selected array


      var current = [];
      var i = currentSelectedElems.length;

      while (i--) {
        var option = currentSelectedElems[i].ariaAutocompleteSelectedOption;
        var l = this.selected.length;
        var isInSelected = false;

        while (l--) {
          var selected = this.selected[l];

          if (selected === option || selected.value === option.value) {
            isInSelected = true;
            break;
          }
        }

        if (isInSelected) {
          current.push(currentSelectedElems[i]);
        } else {
          this.wrapper.removeChild(currentSelectedElems[i]);
        }
      } // cycle through selected array, and add elements for any not represented by one


      var deleteText = this.options.srDeleteText;
      var fragment = document.createDocumentFragment();
      var selectedClass = "".concat(this.cssNameSpace, "__selected");

      for (var _i = 0, _l = this.selected.length; _i < _l; _i += 1) {
        var _selected = this.selected[_i];
        var _l2 = current.length;
        var isInDom = false;

        while (_l2--) {
          var _option = current[_l2].ariaAutocompleteSelectedOption;

          if (_option === _selected || _option.value === _selected.value) {
            isInDom = true;
            break;
          }
        }

        if (!isInDom) {
          var label = _selected.label;
          var span = (0, _autocompleteHelpers.htmlToElement)("<span role=\"button\" class=\"".concat(selectedClass, "\" ") + "tabindex=\"0\" aria-label=\"".concat(deleteText, " ").concat(label, "\">") + "".concat(label, "</span>"));
          span.ariaAutocompleteSelectedOption = _selected;
          fragment.appendChild(span);
        }
      }

      if (fragment.childNodes && fragment.childNodes.length) {
        this.wrapper.insertBefore(fragment, this.list);
      } // set ids on elements


      var ids = []; // get selected elements again, as some may have been added or removed

      var nowSelectedElems = this.getSelectedElems();

      for (var _i2 = 0, _l3 = nowSelectedElems.length; _i2 < _l3; _i2 += 1) {
        var id = "".concat(this.ids.OPTION_SELECTED, "-").concat(_i2);

        nowSelectedElems[_i2].setAttribute('id', id);

        ids.push(id);
      }

      ids.push(this.ids.LIST); // set input aria-owns

      this.input.setAttribute('aria-owns', ids.join(' ')); // in autogrow mode, hide the placeholder if there are selected items

      if (this.autoGrow && this.options.placeholder) {
        var toSet = this.selected.length ? '' : this.options.placeholder;
        this.input.setAttribute('placeholder', toSet);
      }
    }
    /**
     * @description set the aria-describedby attribute on the input
     */

  }, {
    key: "setInputDescription",
    value: function setInputDescription() {
      var exists = this.input.getAttribute('aria-describedby');
      var current = (0, _autocompleteHelpers.trimString)(exists || '');
      var describedBy = current.replace(this.ids.SR_ASSISTANCE, '');

      if (this.input.value.length === 0) {
        describedBy = describedBy + ' ' + this.ids.SR_ASSISTANCE;
      } // set or remove attribute, but only if necessary


      if (describedBy = (0, _autocompleteHelpers.trimString)(describedBy)) {
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
        (0, _autocompleteHelpers.removeClass)(nodes[l], "".concat(cssName, "__option--focused focused focus"));
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
        (0, _autocompleteHelpers.addClass)(toFocus, toAdd);
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
        (0, _autocompleteHelpers.setElementState)(entry.element, true, this); // element processing
      } // set original input value


      if (this.elementIsInput) {
        var valToSetString = valToSet.join(this.options.multipleSeparator);

        if (valToSetString !== this.element.value) {
          this.element.value = valToSetString;
          (0, _autocompleteHelpers.dispatchEvent)(this.element, 'change');
        }
      } // included in case of multi-select mode used with a <select> element as the source


      if (!this.selected.length && this.elementIsSelect) {
        this.element.value = '';
      }
    }
    /**
     * @description select option from the list by index
     * @param {Event} event
     * @param {Number} index
     * @param {Boolean=} focusAfterSelection
     */

  }, {
    key: "handleOptionSelect",
    value: function handleOptionSelect(event, index) {
      var focusAfterSelection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      // defensive check for proper index, that the filteredSource exists, and not exceed max items option
      if (typeof index !== 'number' || index < 0 || this.multiple && this.selected.length >= this.options.maxItems || !this.filteredSource.length || !this.filteredSource[index]) {
        return;
      } // generate new object from the selected item in case the original source gets altered


      var option = (0, _autocompleteHelpers.mergeObjects)(this.filteredSource[index]); // detect if selected option is already in selected array

      var l = this.selected.length;
      var alreadySelected = false;

      while (l--) {
        if (this.selected[l].value === option.value) {
          alreadySelected = true;
          break;
        }
      }

      this.setInputValue(this.multiple ? '' : option.label, true);
      this.triggerAutoGrow(); // reset selected array in single select mode

      if (!alreadySelected && !this.multiple) {
        this.selected = [];
      } // (re)set values of any DOM elements based on selected array


      if (!alreadySelected) {
        this.selected.push(option);
        this.setSourceElementValues();
        this.buildMultiSelected(); // rebuild multi-selected if needed
      }

      this.triggerOptionCallback('onConfirm', [option]);
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

        toReturn.push(result);
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
      var toShow = []; // now commit to setting the filtered source

      var mapping = this.options.sourceMapping; // if in multiple mode, exclude items already in the selected array

      var updated = this.removeSelectedFromResults(results); // allow callback to alter the response before rendering

      var callback = this.triggerOptionCallback('onResponse', updated);
      this.filteredSource = callback ? (0, _autocompleteHelpers.processSourceArray)(callback, mapping) : updated; // build up the list html

      var optionId = this.ids.OPTION;
      var cssName = this.cssNameSpace;
      var length = this.filteredSource.length;
      var maxResults = this.forceShowAll ? 9999 : this.options.maxResults;

      for (var i = 0; i < length && i < maxResults; i += 1) {
        toShow.push("<li tabindex=\"-1\" aria-selected=\"false\" role=\"option\" class=\"".concat(cssName, "__option\" ") + "id=\"".concat(optionId, "--").concat(i, "\" aria-posinset=\"").concat(i + 1, "\" ") + "aria-setsize=\"".concat(length, "\">").concat(this.filteredSource[i].label, "</li>"));
      } // set has-results or no-results class on the list element


      if (toShow.length) {
        (0, _autocompleteHelpers.addClass)(this.list, "".concat(cssName, "__list--has-results"));
        (0, _autocompleteHelpers.removeClass)(this.list, "".concat(cssName, "__list--no-results"));
      } else {
        (0, _autocompleteHelpers.removeClass)(this.list, "".concat(cssName, "__list--has-results"));
        (0, _autocompleteHelpers.addClass)(this.list, "".concat(cssName, "__list--no-results"));
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
        this.currentListHtml = newListHtml; // innerHTML vs insertAdjacentHtml performance in old IE ?

        this.list.innerHTML = newListHtml;
      } else {
        // if list html matches, and not re-rendered, clear aria-selected and focus classes
        this.resetOptionAttributes();
      } // if toShow array is empty, make sure not to render the menu


      if (!toShow.length) {
        this.hide();
        this.forceShowAll = false;
        return;
      }

      this.show(); // reset forceShowAll must be after .show()
      // aria-expanded attribute on showAllControl is controlled in .show() method

      this.forceShowAll = false;
    }
    /**
     * @description trigger async call for options to render
     * @param {String} value
     * @param {Boolean=} isFirstCall
     */

  }, {
    key: "handleAsync",
    value: function handleAsync(value) {
      var _this2 = this;

      var isFirstCall = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      // abort any current call first
      if (this.xhr) {
        this.xhr.abort();
      }

      var xhr = new XMLHttpRequest();
      var encode = encodeURIComponent;
      var isShowAll = this.forceShowAll;
      var unlimited = isShowAll || isFirstCall;
      var context = isFirstCall ? null : this.api;
      var baseAmount = this.multiple ? this.selected.length : 0;
      var ampersandOrQuestionMark = /\?/.test(this.source) ? '&' : '?';
      var url = this.source + ampersandOrQuestionMark + "".concat(encode(this.options.asyncQueryParam), "=").concat(encode(value), "&") + "".concat(encode(this.options.asyncMaxResultsParam), "=") + "".concat(unlimited ? 9999 : baseAmount + this.options.maxResults);
      url = this.triggerOptionCallback('onAsyncPrep', [url], context) || url;
      xhr.open('GET', url);

      xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
          if (xhr.status === 200) {
            // return forceShowAll to previous state before the options render
            _this2.forceShowAll = isShowAll;

            var callbackResponse = _this2.triggerOptionCallback('onAsyncSuccess', [value, xhr], context);

            var mapping = _this2.options.sourceMapping;
            var source = callbackResponse || xhr.responseText;
            var items = (0, _autocompleteHelpers.processSourceArray)(source, mapping, false);

            if (isFirstCall) {
              _this2.prepSelectedFromArray(items);

              _this2.setInputStartingStates(false);
            } else {
              _this2.setListOptions(items);
            }
          }
        }
      }; // allow the creation of an uncancellable call to use on first load


      if (!isFirstCall) {
        this.xhr = xhr;
      }

      xhr.send();
    }
    /**
     * @description trigger filtering using a value
     * @param {String} value
     */

  }, {
    key: "filter",
    value: function filter(value) {
      var _this3 = this;

      // fail silently if no value is provided
      if (typeof value !== 'string') {
        this.cancelFilterPrep();
        return;
      } // allow onSearch callback to affect the searched value
      // only permitted when not a forceShowAll case


      var forceShowAll = this.forceShowAll;
      var callbackResponse = this.triggerOptionCallback('onSearch', [value]);

      if (!forceShowAll && typeof callbackResponse === 'string') {
        value = callbackResponse;
      } // store search term - used for comparison in filterPrep


      this.term = this.inputPollingValue = value; // async handling

      if (this.async) {
        this.handleAsync(value); // set show all to false immediately as may be used in other places

        this.forceShowAll = false;
        return;
      } // handle the source as a function


      if (typeof this.source === 'function') {
        this.source.call(this.api, this.term, function (response) {
          var mapping = _this3.options.sourceMapping;
          var result = (0, _autocompleteHelpers.processSourceArray)(response, mapping);

          _this3.setListOptions(result);
        });
        return;
      } // if empty string, show all


      if (!value) {
        forceShowAll = true;
      } // existing list handling


      var toReturn = [];

      if (this.source && this.source.length) {
        var check = ['ariaAutocompleteCleanedLabel'];

        if (!forceShowAll) {
          value = (0, _autocompleteHelpers.cleanString)(value, true);
          var searchIn = this.options.alsoSearchIn;

          if (Array.isArray(searchIn) && searchIn.length) {
            check = (0, _autocompleteHelpers.removeDuplicatesAndLabel)(check.concat(searchIn));
          }
        }

        for (var i = 0, l = this.source.length; i < l; i += 1) {
          var entry = this.source[i];

          if (forceShowAll || (0, _autocompleteHelpers.searchVarPropsFor)(entry, check, value)) {
            toReturn.push(entry);
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
      (0, _autocompleteHelpers.removeClass)(this.wrapper, "".concat(nameSpace, "__wrapper--loading loading"));
      (0, _autocompleteHelpers.removeClass)(this.input, "".concat(nameSpace, "__input--loading loading"));
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
      var _this4 = this;

      var doValueOverrideCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var runNow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var forceShowAll = this.forceShowAll;
      var delay = forceShowAll || runNow ? 0 : this.options.delay; // clear timers

      this.cancelFilterPrep();
      this.filtering = true;
      this.filterTimer = setTimeout(function () {
        var value = _this4.input.value; // treat as empty search if...
        // forceShowAll, or in single mode and selected item label matches current value

        if (forceShowAll || value === '' || doValueOverrideCheck && !_this4.multiple && _this4.selected.length && (0, _autocompleteHelpers.trimString)(_this4.selected[0].label) === (0, _autocompleteHelpers.trimString)(value)) {
          value = '';
        } // handle aria-describedby


        _this4.setInputDescription();

        _this4.inputPollingValue = value; // set polling value, even if search criteria not met

        if (!forceShowAll && value.length < _this4.options.minLength) {
          _this4.hide();

          return;
        } // try catch used due to permissions issues in some cases


        var modifier;

        try {
          var keydown = e && e.type === 'keydown';
          modifier = keydown && (e.altKey || e.ctrlKey || e.metaKey); // allow shift key, just in case...
        } catch (e) {} // prevent search being run again with the same value


        var equalVals = value === '' ? false : value === _this4.term;

        if (!equalVals || equalVals && !_this4.menuOpen && !modifier) {
          var n = _this4.cssNameSpace;
          (0, _autocompleteHelpers.addClass)(_this4.wrapper, "".concat(n, "__wrapper--loading loading"));
          (0, _autocompleteHelpers.addClass)(_this4.input, "".concat(n, "__input--loading loading"));
          _this4.currentSelectedIndex = -1;

          _this4.filter(value);
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
      var _this5 = this;

      if (this.disabled) {
        return;
      } // need to use a timer, as the wrapper focus out will fire after the click event


      if (this.showAllPrepTimer) {
        clearTimeout(this.showAllPrepTimer);
      }

      this.showAllPrepTimer = setTimeout(function () {
        if (_this5.componentBlurTimer) {
          clearTimeout(_this5.componentBlurTimer);
        }

        event.preventDefault();
        _this5.forceShowAll = true;

        _this5.filterPrep(event, false, true);
      });
    }
    /**
     * @description blur behaviour for hiding list and removing focus class(es)
     * @param {Event} event
     * @param {Boolean=} force - fire instantly and force blurring out of the component
     */

  }, {
    key: "handleComponentBlur",
    value: function handleComponentBlur(event) {
      var _this6 = this;

      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.componentBlurTimer) {
        clearTimeout(this.componentBlurTimer);
      } // use a timeout to ensure this blur fires after other focus events
      // and in case the user focuses back in immediately


      var delay = force ? 0 : 100;
      this.componentBlurTimer = setTimeout(function () {
        // do nothing if blurring to an element within the list
        var activeElem = document.activeElement;

        if (!force && activeElem && !(_this6.showAll && _this6.showAll === activeElem) && // exception for show all button
        !activeElem.ariaAutocompleteSelectedOption // exception for selected items
        ) {
            // must base this on the wrapper to allow scrolling the list in IE
            if (_this6.wrapper.contains(activeElem)) {
              return;
            }
          } // cancel any running async call


        if (_this6.xhr) {
          _this6.xhr.abort();
        } // confirmOnBlur behaviour


        var isQueryIn = _this6.indexOfQueryIn.bind(_this6);

        if (!force && _this6.options.confirmOnBlur && _this6.menuOpen) {
          // if blurring from an option (currentSelectedIndex > -1), select it
          var toUse = _this6.currentSelectedIndex;

          if (typeof toUse !== 'number' || toUse === -1) {
            // otherwise check for exact match between current input value and available items
            toUse = isQueryIn(_this6.filteredSource);
          }

          _this6.handleOptionSelect({}, toUse, false);
        }

        _this6.cancelFilterPrep();

        _this6.hide(); // in single select case, if current value and chosen value differ, clear selected and input value


        if (!_this6.multiple && isQueryIn(_this6.selected) === -1) {
          var inputOrDdl = _this6.elementIsInput || _this6.elementIsSelect;

          if (inputOrDdl && _this6.element.value !== '') {
            _this6.element.value = '';
            (0, _autocompleteHelpers.dispatchEvent)(_this6.element, 'change');
          }

          if (_this6.selected.length) {
            _this6.removeEntryFromSelected(_this6.selected[0]);
          }

          _this6.setInputValue('', true);
        }

        if (_this6.multiple) {
          _this6.setInputValue('', true);
        } // trigger input resizing


        _this6.triggerAutoGrow(); // unbind document click


        if (_this6.documentClickBound) {
          _this6.documentClickBound = false;
          document.removeEventListener('click', _this6.documentClick);
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
      // if in multiple mode, and event target was a selected item, remove it
      if (this.isSelectedElem(event.target)) {
        var option = event.target.ariaAutocompleteSelectedOption;
        return this.removeEntryFromSelected(option);
      }

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
        event.preventDefault();
        return this.handleEnterKey(event);
      }

      if (this.disabled) {
        return;
      } // on backspace, if using empty input in multiple mode, delete last selected entry


      var selectedLength = this.selected && this.selected.length;

      if (this.options.deleteOnBackspace && this.input.value === '' && event.keyCode === 8 && selectedLength && targetIsInput && this.multiple) {
        this.removeEntryFromSelected(this.selected[selectedLength - 1]);
        return;
      } // any printable character not on input, return focus to input


      var printableKey = (0, _autocompleteHelpers.isPrintableKey)(event.keyCode);
      var focusInput = !targetIsInput && printableKey;

      if (focusInput) {
        this.input.focus();
      } // trigger filtering - done here, instead of using input event, due to IE9 issues


      if (focusInput || targetIsInput && printableKey) {
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
     * @description cancel checking for input value changes from external causes
     */

  }, {
    key: "cancelPolling",
    value: function cancelPolling() {
      if (this.pollingTimer) {
        clearTimeout(this.pollingTimer);
      }
    }
    /**
     * @description start checking for input value changes from causes that bypass event detection
     */

  }, {
    key: "startPolling",
    value: function startPolling() {
      var _this7 = this;

      // check if input value does not equal last searched term
      if (!this.filtering && this.input.value !== this.inputPollingValue) {
        this.filterPrep({});
      }

      this.pollingTimer = setTimeout(function () {
        _this7.startPolling();
      }, 200);
    }
    /**
     * @description bind component events to generated elements
     */

  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this8 = this;

      // when focus is moved outside of the component, close everything
      this.wrapper.addEventListener('focusout', function (event) {
        _this8.handleComponentBlur(event, false);
      }); // reset selected index

      this.wrapper.addEventListener('focusin', function (event) {
        if (!_this8.list.contains(event.target)) {
          _this8.currentSelectedIndex = -1;
        }
      }); // handle all keydown events inside the component

      this.wrapper.addEventListener('keydown', function (event) {
        _this8.prepKeyDown(event);
      }); // if clicking directly on the wrapper, move focus to the input

      this.wrapper.addEventListener('click', function (event) {
        if (event.target === _this8.wrapper) {
          _this8.input.focus();

          return;
        }

        if (_this8.isSelectedElem(event.target)) {
          var option = event.target.ariaAutocompleteSelectedOption;

          _this8.removeEntryFromSelected(option);
        }
      });
      var wrapperFocusClasses = "".concat(this.cssNameSpace, "__wrapper--focused focused focus");
      var inputFocusClasses = "".concat(this.cssNameSpace, "__input--focused focused focus"); // when blurring out of input, remove classes

      this.input.addEventListener('blur', function () {
        (0, _autocompleteHelpers.removeClass)(_this8.wrapper, wrapperFocusClasses);
        (0, _autocompleteHelpers.removeClass)(_this8.input, inputFocusClasses);

        _this8.cancelPolling();
      }); // trigger filter on input event as well as keydown (covering bases)

      this.input.addEventListener('input', function (event) {
        _this8.filterPrep(event);
      }); // when specifically clicking on input, if menu is closed, and value is long enough, search

      this.input.addEventListener('click', function (event) {
        var open = _this8.menuOpen;

        if (!open && _this8.input.value.length >= _this8.options.minLength) {
          _this8.filterPrep(event, true);
        }
      }); // when focusing on input, reset selected index and trigger search handling

      this.input.addEventListener('focusin', function () {
        (0, _autocompleteHelpers.addClass)(_this8.wrapper, wrapperFocusClasses);
        (0, _autocompleteHelpers.addClass)(_this8.input, inputFocusClasses);

        _this8.startPolling();

        if (!_this8.disabled && !_this8.menuOpen) {
          _this8.filterPrep(event, true);
        }
      }); // show all button click

      if (this.showAll) {
        this.showAll.addEventListener('click', function (event) {
          _this8.filterPrepShowAll(event);
        });
      } // clear any current focus position when hovering into the list


      this.list.addEventListener('mouseenter', function (event) {
        _this8.resetOptionAttributes();
      }); // trigger options selection

      this.list.addEventListener('click', function (event) {
        if (event.target !== _this8.list) {
          var childNodes = _this8.list.childNodes;

          if (childNodes.length) {
            var nodeIndex = [].indexOf.call(childNodes, event.target);

            _this8.handleOptionSelect(event, nodeIndex);
          }
        }
      }); // setup input autogrow behaviour

      if (this.autoGrow) {
        this.AutoGrowInput = new _autogrow.default(this.input);
      }
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

        toPush.ariaAutocompleteCleanedLabel = (0, _autocompleteHelpers.cleanString)(toPush.label);
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
        toPush.ariaAutocompleteCleanedLabel = (0, _autocompleteHelpers.cleanString)(toPush.label);
        this.source.push(toPush); // add to selected if applicable

        if (option.selected) {
          this.selected.push(toPush);
        }
      }
    }
    /**
     * @description build up selected array if starting element was an input, and had a value
     * @param {Object[]} source
     */

  }, {
    key: "prepSelectedFromArray",
    value: function prepSelectedFromArray(source) {
      var value = this.elementIsInput && this.element.value;

      if (value && source && source.length) {
        // account for multiple mode
        var multiple = this.options.multiple;
        var separator = this.options.multipleSeparator;
        var valueArr = multiple ? value.split(separator) : [value];

        for (var i = 0, l = valueArr.length; i < l; i += 1) {
          var val = valueArr[i];
          var isQueryIn = this.indexOfQueryIn; // make sure it is not already in the selected array

          var isSelected = isQueryIn(this.selected, val, 'value') > -1; // but is in the source array (check via 'value', not 'label')

          if (!isSelected) {
            var indexInSource = isQueryIn(source, val, 'value');

            if (indexInSource > -1) {
              this.selected.push(source[indexInSource]);
            }
          }
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
      this.source = (0, _autocompleteHelpers.processSourceArray)(this.source, mapping);
      this.prepSelectedFromArray(this.source);
    }
    /**
     * @description trigger source string endpoint to generate selected array
     */

  }, {
    key: "prepListSourceAsync",
    value: function prepListSourceAsync() {
      this.async = true;

      if (this.elementIsInput && this.element.value) {
        this.handleAsync(this.element.value, true);
      }
    }
    /**
     * @description process source function to generate selected array
     */

  }, {
    key: "prepListSourceFunction",
    value: function prepListSourceFunction() {
      var _this9 = this;

      if (this.elementIsInput && this.element.value) {
        this.source.call(undefined, this.element.value, function (response) {
          _this9.prepSelectedFromArray((0, _autocompleteHelpers.processSourceArray)(response, _this9.options.sourceMapping));

          _this9.setInputStartingStates(false);
        });
      }
    }
    /**
     * @description adjust set sources to needed format
     */

  }, {
    key: "prepListSource",
    value: function prepListSource() {
      // allow complete control over the source handling via custom function
      if (typeof this.source === 'function') {
        return this.prepListSourceFunction();
      } // string source - treat as async endpoint


      if (typeof this.source === 'string' && this.source.length) {
        return this.prepListSourceAsync();
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
     * @param {Boolean=} setAriaAttrs
     */

  }, {
    key: "setInputStartingStates",
    value: function setInputStartingStates() {
      var setAriaAttrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (setAriaAttrs) {
        // update corresponding label to now focus on the new input
        if (this.ids.ELEMENT) {
          var label = document.querySelector('[for="' + this.ids.ELEMENT + '"]');

          if (label) {
            label.ariaAutocompleteOriginalFor = this.ids.ELEMENT;
            label.setAttribute('for', this.ids.INPUT);
          }
        } // update aria-describedby and aria-labelledby attributes if present


        var describedBy = this.element.getAttribute('aria-describedby');

        if (describedBy) {
          this.input.setAttribute('aria-describedby', describedBy);
        }

        var labelledBy = this.element.getAttribute('aria-labelledby');

        if (labelledBy) {
          this.input.setAttribute('aria-labelledby', labelledBy);
        }
      } // if selected item(s) already exists


      if (this.selected.length) {
        // for multi select variant, set selected items
        if (this.multiple) {
          this.buildMultiSelected();
        } // for single select variant, set value to match
        else {
            this.setInputValue(this.selected[0].label || '', true);
            this.triggerAutoGrow();
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
      var wrapperClass = o.wrapperClassName ? " ".concat(o.wrapperClassName) : '';
      var newHtml = ["<div id=\"".concat(this.ids.WRAPPER, "\" class=\"").concat(cssName, "__wrapper").concat(wrapperClass, "\">")]; // add input

      var name = o.name ? " ".concat(o.name) : "";
      var inputClass = o.inputClassName ? " ".concat(o.inputClassName) : '';
      newHtml.push("<input type=\"text\" autocomplete=\"off\" aria-expanded=\"false\" aria-autocomplete=\"list\" " + "role=\"combobox\" id=\"".concat(this.ids.INPUT, "\" placeholder=\"").concat(o.placeholder, "\" ") + "aria-owns=\"".concat(this.ids.LIST, "\" aria-placeholder=\"").concat(o.placeholder, "\" ") + "class=\"".concat(cssName, "__input").concat(inputClass, "\"").concat(name, " />")); // button to show all available options

      if (o.showAllControl) {
        newHtml.push("<span role=\"button\" aria-label=\"".concat(o.srShowAllText, "\" class=\"").concat(cssName, "__show-all\" ") + "tabindex=\"0\" id=\"".concat(this.ids.BUTTON, "\" aria-expanded=\"false\"></span>"));
      } // add the list holder


      var explainerText = o.srListLabelText;
      var listClass = o.listClassName ? " ".concat(o.listClassName) : '';
      var explainer = explainerText ? " aria-label=\"".concat(explainerText, "\"") : '';
      newHtml.push("<ul id=\"".concat(this.ids.LIST, "\" class=\"").concat(cssName, "__list").concat(listClass, "\" role=\"listbox\" ") + "hidden=\"hidden\"".concat(explainer, "></ul>")); // add the screen reader assistance element

      newHtml.push("<span class=\"sr-only ".concat(cssName, "__sr-only ").concat(cssName, "__sr-assistance\" ") + "id=\"".concat(this.ids.SR_ASSISTANCE, "\">").concat(o.srAssistiveText, "</span>")); // add element for added screen reader announcements

      newHtml.push("<span class=\"sr-only ".concat(cssName, "__sr-only ").concat(cssName, "__sr-announcements\" ") + "id=\"".concat(this.ids.SR_ANNOUNCEMENTS, "\" aria-live=\"polite\" aria-atomic=\"true\"></span>")); // close all and append

      newHtml.push("</div>");
      this.element.insertAdjacentHTML('afterend', newHtml.join(''));
    }
    /**
     * @description generate api object to expose on the element
     */

  }, {
    key: "generateApi",
    value: function generateApi() {
      var _this10 = this;

      this.api = {
        open: function open() {
          return _this10.show.call(_this10);
        },
        close: function close() {
          return _this10.hide.call(_this10);
        },
        filter: function filter(val) {
          return _this10.filter.call(val);
        }
      };
      var a = ['options', 'destroy', 'enable', 'disable', 'input', 'wrapper', 'list', 'selected'];

      var _loop = function _loop(i, l) {
        _this10.api[a[i]] = typeof _this10[a[i]] === 'function' ? function () {
          return _this10[a[i]].call(_this10);
        } : _this10[a[i]];
      };

      for (var i = 0, l = a.length; i < l; i += 1) {
        _loop(i, l);
      } // store api on original element


      this.element.ariaAutocomplete = this.api;
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
      } // remove the document click if still bound


      if (this.documentClickBound) {
        document.removeEventListener('click', this.documentClick);
      } // destroy autogrow behaviour and events


      if (this.autoGrow && this.AutoGrowInput) {
        this.AutoGrowInput.destroy();
      } // remove the whole wrapper


      this.element.parentNode.removeChild(this.wrapper);
      delete this.element.ariaAutocomplete; // re-show original element

      this.show(this.element); // set all instance properties to null to clean up DOMNode references

      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          this[i] = null;
        }
      }
    }
    /**
     * @description initialise AriaAutocomplete
     * @param {Element} element
     * @param {Object=} options
     */

  }, {
    key: "init",
    value: function init(element, options) {
      // ids used for DOM queries and accessibility attributes e.g. aria-controls
      appIndex += 1;
      this.ids = {};
      this.ids.ELEMENT = element.id;
      this.ids.PREFIX = "".concat(element.id || '', "aria-autocomplete-").concat(appIndex);
      this.ids.LIST = "".concat(this.ids.PREFIX, "-list");
      this.ids.INPUT = "".concat(this.ids.PREFIX, "-input");
      this.ids.BUTTON = "".concat(this.ids.PREFIX, "-button");
      this.ids.OPTION = "".concat(this.ids.PREFIX, "-option");
      this.ids.WRAPPER = "".concat(this.ids.PREFIX, "-wrapper");
      this.ids.OPTION_SELECTED = "".concat(this.ids.OPTION, "-selected");
      this.ids.SR_ASSISTANCE = "".concat(this.ids.PREFIX, "-sr-assistance");
      this.ids.SR_ANNOUNCEMENTS = "".concat(this.ids.PREFIX, "-sr-announcements");
      this.selected = [];
      this.element = element;
      this.elementIsInput = element.nodeName === 'INPUT';
      this.elementIsSelect = element.nodeName === 'SELECT';
      this.options = (0, _autocompleteHelpers.mergeObjects)(DEFAULT_OPTIONS, options); // set these internally so that the component has to be properly destroyed to change them

      this.source = this.options.source;
      this.multiple = this.options.multiple;
      this.autoGrow = this.options.autoGrow;
      this.cssNameSpace = this.options.cssNameSpace;
      this.documentClick = this.handleComponentBlur.bind(this); // create html structure

      this.setHtml(); // additional app variables

      this.list = document.getElementById(this.ids.LIST);
      this.input = document.getElementById(this.ids.INPUT);
      this.wrapper = document.getElementById(this.ids.WRAPPER);
      this.showAll = document.getElementById(this.ids.BUTTON);
      this.srAnnouncements = document.getElementById(this.ids.SR_ANNOUNCEMENTS); // set internal source array, from static elements if necessary

      this.prepListSource(); // set any further classes on component wrapper based on options

      var wrapperClass = '';

      if (this.options.showAllControl) {
        wrapperClass += " ".concat(this.cssNameSpace, "__wrapper--show-all");
      }

      if (this.autoGrow) {
        wrapperClass += " ".concat(this.cssNameSpace, "__wrapper--autogrow");
      }

      if (this.multiple) {
        wrapperClass += " ".concat(this.cssNameSpace, "__wrapper--multiple");
      }

      if (wrapperClass) {
        (0, _autocompleteHelpers.addClass)(this.wrapper, wrapperClass);
      } // hide element and list manually


      this.hide(this.list); // pass in the list so that the onClose is not triggered

      this.hide(this.element); // generate api object to expose

      this.generateApi(); // set starting states for input - must be after source has been defined

      this.setInputStartingStates(); // bind all necessary events

      this.bindEvents(); // fire onready callback

      this.triggerOptionCallback('onReady', [this.wrapper]);
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


window['AriaAutocomplete'] = function (elem, options) {
  return new AriaAutocomplete(elem, options).api;
};

var _default = function _default(elem, options) {
  return new AriaAutocomplete(elem, options).api;
};

exports.default = _default;
},{"./closest-polyfill":"kTsq","./autogrow":"KnPF","./autocomplete-helpers":"MBeS"}]},{},["c8cM"], null)
//# sourceMappingURL=/aria-autocomplete.js.map