'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var path = require('path');
var resolvePathname = _interopDefault(require('resolve-pathname'));
var fetch = _interopDefault(require('node-fetch'));
var debug = _interopDefault(require('debug'));
var marked = _interopDefault(require('marked'));
var Prism = _interopDefault(require('prismjs'));
require('prismjs/components/prism-markup-templating');
var stripIndent = _interopDefault(require('strip-indent'));

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a);}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d);}function d(e){c(e,1);}c();})}

/**
 * Create a cached version of a pure function.
 * @param {*} fn The function call to be cached
 * @void
 */

function cached(fn) {
  var cache = Object.create(null);
  return function (str) {
    var key = isPrimitive(str) ? str : JSON.stringify(str);
    var hit = cache[key];
    return hit || (cache[key] = fn(str));
  };
}

var hasOwn = Object.prototype.hasOwnProperty;

/**
 * Simple Object.assign polyfill
 * @param {Object} to The object to be merged with
 * @returns {Object} The merged object
 */
var merge =
  Object.assign ||
  function (to) {
    var arguments$1 = arguments;

    for (var i = 1; i < arguments.length; i++) {
      var from = Object(arguments$1[i]);

      for (var key in from) {
        if (hasOwn.call(from, key)) {
          to[key] = from[key];
        }
      }
    }

    return to;
  };

/**
 * Check if value is primitive
 * @param {*} value Checks if a value is primitive
 * @returns {Boolean} Result of the check
 */
function isPrimitive(value) {
  return typeof value === 'string' || typeof value === 'number';
}

/**
 * Performs no operation.
 * @void
 */
function noop() {}

/**
 * Check if value is function
 * @param {*} obj Any javascript object
 * @returns {Boolean} True if the passed-in value is a function
 */
function isFn(obj) {
  return typeof obj === 'function';
}

var decode = decodeURIComponent;
var encode = encodeURIComponent;

function parseQuery(query) {
  var res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  // Simple parse
  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');

    res[parts[0]] = parts[1] && decode(parts[1]);
  });

  return res;
}

function stringifyQuery(obj, ignores) {
  if ( ignores === void 0 ) ignores = [];

  var qs = [];

  for (var key in obj) {
    if (ignores.indexOf(key) > -1) {
      continue;
    }

    qs.push(
      obj[key]
        ? ((encode(key)) + "=" + (encode(obj[key]))).toLowerCase()
        : encode(key)
    );
  }

  return qs.length ? ("?" + (qs.join('&'))) : '';
}

var isAbsolutePath = cached(function (path) {
  return /(:|(\/{2}))/g.test(path);
});

var getParentPath = cached(function (path) {
  if (/\/$/g.test(path)) {
    return path;
  }

  var matchingParts = path.match(/(\S*\/)[^/]+$/);
  return matchingParts ? matchingParts[1] : '';
});

var cleanPath = cached(function (path) {
  return path.replace(/^\/+/, '/').replace(/([^:])\/{2,}/g, '$1/');
});

var resolvePath = cached(function (path) {
  var segments = path.replace(/^\//, '').split('/');
  var resolved = [];
  for (var i = 0, len = segments.length; i < len; i++) {
    var segment = segments[i];
    if (segment === '..') {
      resolved.pop();
    } else if (segment !== '.') {
      resolved.push(segment);
    }
  }

  return '/' + resolved.join('/');
});

/**
 * Normalises the URI path to handle the case where Docsify is
 * hosted off explicit files, i.e. /index.html. This function
 * eliminates any path segments that contain `#` fragments.
 *
 * This is used to map browser URIs to markdown file sources.
 *
 * For example:
 *
 * http://example.org/base/index.html#/blah
 *
 * would be mapped to:
 *
 * http://example.org/base/blah.md.
 *
 * See here for more information:
 *
 * https://github.com/docsifyjs/docsify/pull/1372
 *
 * @param {string} path The URI path to normalise
 * @return {string} { path, query }
 */

function normaliseFragment(path) {
  return path
    .split('/')
    .filter(function (p) { return p.indexOf('#') === -1; })
    .join('/');
}

function getPath() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return cleanPath(args.map(normaliseFragment).join('/'));
}

var replaceSlug = cached(function (path) {
  return path.replace('#', '?id=');
});

var cached$1 = {};

function getAlias(path, alias, last) {
  var match = Object.keys(alias).filter(function (key) {
    var re = cached$1[key] || (cached$1[key] = new RegExp(("^" + key + "$")));
    return re.test(path) && path !== last;
  })[0];

  return match
    ? getAlias(path.replace(cached$1[match], alias[match]), alias, path)
    : path;
}

function getFileName(path, ext) {
  return new RegExp(("\\.(" + (ext.replace(/^\./, '')) + "|html)$"), 'g').test(path)
    ? path
    : /\/$/g.test(path)
    ? (path + "README" + ext)
    : ("" + path + ext);
}

var History = function History(config) {
  this.config = config;
};

History.prototype.getBasePath = function getBasePath () {
  return this.config.basePath;
};

History.prototype.getFile = function getFile (path, isRelative) {
    if ( path === void 0 ) path = this.getCurrentPath();

  var ref = this;
    var config = ref.config;
  var base = this.getBasePath();
  var ext = typeof config.ext === 'string' ? config.ext : '.md';

  path = config.alias ? getAlias(path, config.alias) : path;
  path = getFileName(path, ext);
  path = path === ("/README" + ext) ? config.homepage || path : path;
  path = isAbsolutePath(path) ? path : getPath(base, path);

  if (isRelative) {
    path = path.replace(new RegExp(("^" + base)), '');
  }

  return path;
};

History.prototype.onchange = function onchange (cb) {
    if ( cb === void 0 ) cb = noop;

  cb();
};

History.prototype.getCurrentPath = function getCurrentPath () {};

History.prototype.normalize = function normalize () {};

History.prototype.parse = function parse () {};

History.prototype.toURL = function toURL (path, params, currentRoute) {
  var local = currentRoute && path[0] === '#';
  var route = this.parse(replaceSlug(path));

  route.query = merge({}, route.query, params);
  path = route.path + stringifyQuery(route.query);
  path = path.replace(/\.md(\?)|\.md$/, '$1');

  if (local) {
    var idIndex = currentRoute.indexOf('?');
    path =
      (idIndex > 0 ? currentRoute.substring(0, idIndex) : currentRoute) +
      path;
  }

  if (this.config.relativePath && path.indexOf('/') !== 0) {
    var currentDir = currentRoute.substring(
      0,
      currentRoute.lastIndexOf('/') + 1
    );
    return cleanPath(resolvePath(currentDir + path));
  }

  return cleanPath('/' + path);
};

var AbstractHistory = /*@__PURE__*/(function (History) {
  function AbstractHistory(config) {
    History.call(this, config);
    this.mode = 'abstract';
  }

  if ( History ) AbstractHistory.__proto__ = History;
  AbstractHistory.prototype = Object.create( History && History.prototype );
  AbstractHistory.prototype.constructor = AbstractHistory;

  AbstractHistory.prototype.parse = function parse (path) {
    var query = '';

    var queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      query = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);
    }

    return {
      path: path,
      file: this.getFile(path),
      query: parseQuery(query),
    };
  };

  return AbstractHistory;
}(History));

/**
 * Render github corner
 * @param  {Object} data URL for the View Source on Github link
 * @param {String} cornerExternalLinkTarge value of the target attribute of the link
 * @return {String} SVG element as string
 */
function corner(data, cornerExternalLinkTarge) {
  if (!data) {
    return '';
  }

  if (!/\/\//.test(data)) {
    data = 'https://github.com/' + data;
  }

  data = data.replace(/^git\+/, '');
  // Double check
  cornerExternalLinkTarge = cornerExternalLinkTarge || '_blank';

  return (
    "<a href=\"" + data + "\" target=\"" + cornerExternalLinkTarge + "\" class=\"github-corner\" aria-label=\"View source on Github\">" +
    '<svg viewBox="0 0 250 250" aria-hidden="true">' +
    '<path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>' +
    '<path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>' +
    '<path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>' +
    '</svg>' +
    '</a>'
  );
}

/**
 * Renders main content
 * @param {Object} config Configuration object
 * @returns {String} HTML of the main content
 */
function main(config) {
  var name = config.name ? config.name : '';

  var aside =
    '<button class="sidebar-toggle" aria-label="Menu">' +
    '<div class="sidebar-toggle-button">' +
    '<span></span><span></span><span></span>' +
    '</div>' +
    '</button>' +
    '<aside class="sidebar">' +
    (config.name
      ? ("<h1 class=\"app-name\"><a class=\"app-name-link\" data-nosearch>" + (config.logo ? ("<img alt=\"" + name + "\" src=" + (config.logo) + ">") : name) + "</a></h1>")
      : '') +
    '<div class="sidebar-nav"><!--sidebar--></div>' +
    '</aside>';
  return (
    "<main>" + aside +
    '<section class="content">' +
    '<article class="markdown-section" id="main"><!--main--></article>' +
    '</section>' +
    '</main>'
  );
}

/**
 * Cover Page
 * @returns {String} Cover page
 */
function cover() {
  var SL = ', 100%, 85%';
  var bgc =
    'linear-gradient(to left bottom, ' +
    "hsl(" + (Math.floor(Math.random() * 255) + SL) + ") 0%," +
    "hsl(" + (Math.floor(Math.random() * 255) + SL) + ") 100%)";

  return (
    "<section class=\"cover show\" style=\"background: " + bgc + "\">" +
    '<div class="mask"></div>' +
    '<div class="cover-main"><!--cover--></div>' +
    '</section>'
  );
}

/**
 * Render tree
 * @param  {Array} toc Array of TOC section links
 * @param  {String} tpl TPL list
 * @return {String} Rendered tree
 */
function tree(toc, tpl) {
  if ( tpl === void 0 ) tpl = '<ul class="app-sub-sidebar">{inner}</ul>';

  if (!toc || !toc.length) {
    return '';
  }

  var innerHTML = '';
  toc.forEach(function (node) {
    var title = node.title.replace(/(<([^>]+)>)/g, '');
    innerHTML += "<li><a class=\"section-link\" href=\"" + (node.slug) + "\" title=\"" + title + "\">" + (node.title) + "</a></li>";
    if (node.children) {
      innerHTML += tree(node.children, tpl);
    }
  });
  return tpl.replace('{inner}', innerHTML);
}

function helper(className, content) {
  return ("<p class=\"" + className + "\">" + (content.slice(5).trim()) + "</p>");
}

/**
 * Gen toc tree
 * @link https://github.com/killercup/grock/blob/5280ae63e16c5739e9233d9009bc235ed7d79a50/styles/solarized/assets/js/behavior.coffee#L54-L81
 * @param  {Array} toc List of TOC elements
 * @param  {Number} maxLevel Deep level
 * @return {Array} Headlines
 */
function genTree(toc, maxLevel) {
  var headlines = [];
  var last = {};

  toc.forEach(function (headline) {
    var level = headline.level || 1;
    var len = level - 1;

    if (level > maxLevel) {
      return;
    }

    if (last[len]) {
      last[len].children = (last[len].children || []).concat(headline);
    } else {
      headlines.push(headline);
    }

    last[level] = headline;
  });

  return headlines;
}

var cache = {};
var re = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

function lower(string) {
  return string.toLowerCase();
}

function slugify(str) {
  if (typeof str !== 'string') {
    return '';
  }

  var slug = str
    .trim()
    .replace(/[A-Z]+/g, lower)
    .replace(/<[^>]+>/g, '')
    .replace(re, '')
    .replace(/\s/g, '-')
    .replace(/-+/g, '-')
    .replace(/^(\d)/, '_$1');
  var count = cache[slug];

  count = hasOwn.call(cache, slug) ? count + 1 : 0;
  cache[slug] = count;

  if (count) {
    slug = slug + '-' + count;
  }

  return slug;
}

slugify.clear = function () {
  cache = {};
};

/* eslint-disable */

// =============================================================================
// DO NOT EDIT: This file is auto-generated by an /build/emoji.js
// =============================================================================

var emojiData = {
  "baseURL": "https://github.githubassets.com/images/icons/emoji/",
  "data": {
    "100": "unicode/1f4af.png?v8",
    "1234": "unicode/1f522.png?v8",
    "+1": "unicode/1f44d.png?v8",
    "-1": "unicode/1f44e.png?v8",
    "1st_place_medal": "unicode/1f947.png?v8",
    "2nd_place_medal": "unicode/1f948.png?v8",
    "3rd_place_medal": "unicode/1f949.png?v8",
    "8ball": "unicode/1f3b1.png?v8",
    "a": "unicode/1f170.png?v8",
    "ab": "unicode/1f18e.png?v8",
    "abacus": "unicode/1f9ee.png?v8",
    "abc": "unicode/1f524.png?v8",
    "abcd": "unicode/1f521.png?v8",
    "accept": "unicode/1f251.png?v8",
    "accordion": "unicode/1fa97.png?v8",
    "adhesive_bandage": "unicode/1fa79.png?v8",
    "adult": "unicode/1f9d1.png?v8",
    "aerial_tramway": "unicode/1f6a1.png?v8",
    "afghanistan": "unicode/1f1e6-1f1eb.png?v8",
    "airplane": "unicode/2708.png?v8",
    "aland_islands": "unicode/1f1e6-1f1fd.png?v8",
    "alarm_clock": "unicode/23f0.png?v8",
    "albania": "unicode/1f1e6-1f1f1.png?v8",
    "alembic": "unicode/2697.png?v8",
    "algeria": "unicode/1f1e9-1f1ff.png?v8",
    "alien": "unicode/1f47d.png?v8",
    "ambulance": "unicode/1f691.png?v8",
    "american_samoa": "unicode/1f1e6-1f1f8.png?v8",
    "amphora": "unicode/1f3fa.png?v8",
    "anatomical_heart": "unicode/1fac0.png?v8",
    "anchor": "unicode/2693.png?v8",
    "andorra": "unicode/1f1e6-1f1e9.png?v8",
    "angel": "unicode/1f47c.png?v8",
    "anger": "unicode/1f4a2.png?v8",
    "angola": "unicode/1f1e6-1f1f4.png?v8",
    "angry": "unicode/1f620.png?v8",
    "anguilla": "unicode/1f1e6-1f1ee.png?v8",
    "anguished": "unicode/1f627.png?v8",
    "ant": "unicode/1f41c.png?v8",
    "antarctica": "unicode/1f1e6-1f1f6.png?v8",
    "antigua_barbuda": "unicode/1f1e6-1f1ec.png?v8",
    "apple": "unicode/1f34e.png?v8",
    "aquarius": "unicode/2652.png?v8",
    "argentina": "unicode/1f1e6-1f1f7.png?v8",
    "aries": "unicode/2648.png?v8",
    "armenia": "unicode/1f1e6-1f1f2.png?v8",
    "arrow_backward": "unicode/25c0.png?v8",
    "arrow_double_down": "unicode/23ec.png?v8",
    "arrow_double_up": "unicode/23eb.png?v8",
    "arrow_down": "unicode/2b07.png?v8",
    "arrow_down_small": "unicode/1f53d.png?v8",
    "arrow_forward": "unicode/25b6.png?v8",
    "arrow_heading_down": "unicode/2935.png?v8",
    "arrow_heading_up": "unicode/2934.png?v8",
    "arrow_left": "unicode/2b05.png?v8",
    "arrow_lower_left": "unicode/2199.png?v8",
    "arrow_lower_right": "unicode/2198.png?v8",
    "arrow_right": "unicode/27a1.png?v8",
    "arrow_right_hook": "unicode/21aa.png?v8",
    "arrow_up": "unicode/2b06.png?v8",
    "arrow_up_down": "unicode/2195.png?v8",
    "arrow_up_small": "unicode/1f53c.png?v8",
    "arrow_upper_left": "unicode/2196.png?v8",
    "arrow_upper_right": "unicode/2197.png?v8",
    "arrows_clockwise": "unicode/1f503.png?v8",
    "arrows_counterclockwise": "unicode/1f504.png?v8",
    "art": "unicode/1f3a8.png?v8",
    "articulated_lorry": "unicode/1f69b.png?v8",
    "artificial_satellite": "unicode/1f6f0.png?v8",
    "artist": "unicode/1f9d1-1f3a8.png?v8",
    "aruba": "unicode/1f1e6-1f1fc.png?v8",
    "ascension_island": "unicode/1f1e6-1f1e8.png?v8",
    "asterisk": "unicode/002a-20e3.png?v8",
    "astonished": "unicode/1f632.png?v8",
    "astronaut": "unicode/1f9d1-1f680.png?v8",
    "athletic_shoe": "unicode/1f45f.png?v8",
    "atm": "unicode/1f3e7.png?v8",
    "atom": "atom.png?v8",
    "atom_symbol": "unicode/269b.png?v8",
    "australia": "unicode/1f1e6-1f1fa.png?v8",
    "austria": "unicode/1f1e6-1f1f9.png?v8",
    "auto_rickshaw": "unicode/1f6fa.png?v8",
    "avocado": "unicode/1f951.png?v8",
    "axe": "unicode/1fa93.png?v8",
    "azerbaijan": "unicode/1f1e6-1f1ff.png?v8",
    "b": "unicode/1f171.png?v8",
    "baby": "unicode/1f476.png?v8",
    "baby_bottle": "unicode/1f37c.png?v8",
    "baby_chick": "unicode/1f424.png?v8",
    "baby_symbol": "unicode/1f6bc.png?v8",
    "back": "unicode/1f519.png?v8",
    "bacon": "unicode/1f953.png?v8",
    "badger": "unicode/1f9a1.png?v8",
    "badminton": "unicode/1f3f8.png?v8",
    "bagel": "unicode/1f96f.png?v8",
    "baggage_claim": "unicode/1f6c4.png?v8",
    "baguette_bread": "unicode/1f956.png?v8",
    "bahamas": "unicode/1f1e7-1f1f8.png?v8",
    "bahrain": "unicode/1f1e7-1f1ed.png?v8",
    "balance_scale": "unicode/2696.png?v8",
    "bald_man": "unicode/1f468-1f9b2.png?v8",
    "bald_woman": "unicode/1f469-1f9b2.png?v8",
    "ballet_shoes": "unicode/1fa70.png?v8",
    "balloon": "unicode/1f388.png?v8",
    "ballot_box": "unicode/1f5f3.png?v8",
    "ballot_box_with_check": "unicode/2611.png?v8",
    "bamboo": "unicode/1f38d.png?v8",
    "banana": "unicode/1f34c.png?v8",
    "bangbang": "unicode/203c.png?v8",
    "bangladesh": "unicode/1f1e7-1f1e9.png?v8",
    "banjo": "unicode/1fa95.png?v8",
    "bank": "unicode/1f3e6.png?v8",
    "bar_chart": "unicode/1f4ca.png?v8",
    "barbados": "unicode/1f1e7-1f1e7.png?v8",
    "barber": "unicode/1f488.png?v8",
    "baseball": "unicode/26be.png?v8",
    "basecamp": "basecamp.png?v8",
    "basecampy": "basecampy.png?v8",
    "basket": "unicode/1f9fa.png?v8",
    "basketball": "unicode/1f3c0.png?v8",
    "basketball_man": "unicode/26f9-2642.png?v8",
    "basketball_woman": "unicode/26f9-2640.png?v8",
    "bat": "unicode/1f987.png?v8",
    "bath": "unicode/1f6c0.png?v8",
    "bathtub": "unicode/1f6c1.png?v8",
    "battery": "unicode/1f50b.png?v8",
    "beach_umbrella": "unicode/1f3d6.png?v8",
    "bear": "unicode/1f43b.png?v8",
    "bearded_person": "unicode/1f9d4.png?v8",
    "beaver": "unicode/1f9ab.png?v8",
    "bed": "unicode/1f6cf.png?v8",
    "bee": "unicode/1f41d.png?v8",
    "beer": "unicode/1f37a.png?v8",
    "beers": "unicode/1f37b.png?v8",
    "beetle": "unicode/1fab2.png?v8",
    "beginner": "unicode/1f530.png?v8",
    "belarus": "unicode/1f1e7-1f1fe.png?v8",
    "belgium": "unicode/1f1e7-1f1ea.png?v8",
    "belize": "unicode/1f1e7-1f1ff.png?v8",
    "bell": "unicode/1f514.png?v8",
    "bell_pepper": "unicode/1fad1.png?v8",
    "bellhop_bell": "unicode/1f6ce.png?v8",
    "benin": "unicode/1f1e7-1f1ef.png?v8",
    "bento": "unicode/1f371.png?v8",
    "bermuda": "unicode/1f1e7-1f1f2.png?v8",
    "beverage_box": "unicode/1f9c3.png?v8",
    "bhutan": "unicode/1f1e7-1f1f9.png?v8",
    "bicyclist": "unicode/1f6b4.png?v8",
    "bike": "unicode/1f6b2.png?v8",
    "biking_man": "unicode/1f6b4-2642.png?v8",
    "biking_woman": "unicode/1f6b4-2640.png?v8",
    "bikini": "unicode/1f459.png?v8",
    "billed_cap": "unicode/1f9e2.png?v8",
    "biohazard": "unicode/2623.png?v8",
    "bird": "unicode/1f426.png?v8",
    "birthday": "unicode/1f382.png?v8",
    "bison": "unicode/1f9ac.png?v8",
    "black_cat": "unicode/1f408-2b1b.png?v8",
    "black_circle": "unicode/26ab.png?v8",
    "black_flag": "unicode/1f3f4.png?v8",
    "black_heart": "unicode/1f5a4.png?v8",
    "black_joker": "unicode/1f0cf.png?v8",
    "black_large_square": "unicode/2b1b.png?v8",
    "black_medium_small_square": "unicode/25fe.png?v8",
    "black_medium_square": "unicode/25fc.png?v8",
    "black_nib": "unicode/2712.png?v8",
    "black_small_square": "unicode/25aa.png?v8",
    "black_square_button": "unicode/1f532.png?v8",
    "blond_haired_man": "unicode/1f471-2642.png?v8",
    "blond_haired_person": "unicode/1f471.png?v8",
    "blond_haired_woman": "unicode/1f471-2640.png?v8",
    "blonde_woman": "unicode/1f471-2640.png?v8",
    "blossom": "unicode/1f33c.png?v8",
    "blowfish": "unicode/1f421.png?v8",
    "blue_book": "unicode/1f4d8.png?v8",
    "blue_car": "unicode/1f699.png?v8",
    "blue_heart": "unicode/1f499.png?v8",
    "blue_square": "unicode/1f7e6.png?v8",
    "blueberries": "unicode/1fad0.png?v8",
    "blush": "unicode/1f60a.png?v8",
    "boar": "unicode/1f417.png?v8",
    "boat": "unicode/26f5.png?v8",
    "bolivia": "unicode/1f1e7-1f1f4.png?v8",
    "bomb": "unicode/1f4a3.png?v8",
    "bone": "unicode/1f9b4.png?v8",
    "book": "unicode/1f4d6.png?v8",
    "bookmark": "unicode/1f516.png?v8",
    "bookmark_tabs": "unicode/1f4d1.png?v8",
    "books": "unicode/1f4da.png?v8",
    "boom": "unicode/1f4a5.png?v8",
    "boomerang": "unicode/1fa83.png?v8",
    "boot": "unicode/1f462.png?v8",
    "bosnia_herzegovina": "unicode/1f1e7-1f1e6.png?v8",
    "botswana": "unicode/1f1e7-1f1fc.png?v8",
    "bouncing_ball_man": "unicode/26f9-2642.png?v8",
    "bouncing_ball_person": "unicode/26f9.png?v8",
    "bouncing_ball_woman": "unicode/26f9-2640.png?v8",
    "bouquet": "unicode/1f490.png?v8",
    "bouvet_island": "unicode/1f1e7-1f1fb.png?v8",
    "bow": "unicode/1f647.png?v8",
    "bow_and_arrow": "unicode/1f3f9.png?v8",
    "bowing_man": "unicode/1f647-2642.png?v8",
    "bowing_woman": "unicode/1f647-2640.png?v8",
    "bowl_with_spoon": "unicode/1f963.png?v8",
    "bowling": "unicode/1f3b3.png?v8",
    "bowtie": "bowtie.png?v8",
    "boxing_glove": "unicode/1f94a.png?v8",
    "boy": "unicode/1f466.png?v8",
    "brain": "unicode/1f9e0.png?v8",
    "brazil": "unicode/1f1e7-1f1f7.png?v8",
    "bread": "unicode/1f35e.png?v8",
    "breast_feeding": "unicode/1f931.png?v8",
    "bricks": "unicode/1f9f1.png?v8",
    "bride_with_veil": "unicode/1f470-2640.png?v8",
    "bridge_at_night": "unicode/1f309.png?v8",
    "briefcase": "unicode/1f4bc.png?v8",
    "british_indian_ocean_territory": "unicode/1f1ee-1f1f4.png?v8",
    "british_virgin_islands": "unicode/1f1fb-1f1ec.png?v8",
    "broccoli": "unicode/1f966.png?v8",
    "broken_heart": "unicode/1f494.png?v8",
    "broom": "unicode/1f9f9.png?v8",
    "brown_circle": "unicode/1f7e4.png?v8",
    "brown_heart": "unicode/1f90e.png?v8",
    "brown_square": "unicode/1f7eb.png?v8",
    "brunei": "unicode/1f1e7-1f1f3.png?v8",
    "bubble_tea": "unicode/1f9cb.png?v8",
    "bucket": "unicode/1faa3.png?v8",
    "bug": "unicode/1f41b.png?v8",
    "building_construction": "unicode/1f3d7.png?v8",
    "bulb": "unicode/1f4a1.png?v8",
    "bulgaria": "unicode/1f1e7-1f1ec.png?v8",
    "bullettrain_front": "unicode/1f685.png?v8",
    "bullettrain_side": "unicode/1f684.png?v8",
    "burkina_faso": "unicode/1f1e7-1f1eb.png?v8",
    "burrito": "unicode/1f32f.png?v8",
    "burundi": "unicode/1f1e7-1f1ee.png?v8",
    "bus": "unicode/1f68c.png?v8",
    "business_suit_levitating": "unicode/1f574.png?v8",
    "busstop": "unicode/1f68f.png?v8",
    "bust_in_silhouette": "unicode/1f464.png?v8",
    "busts_in_silhouette": "unicode/1f465.png?v8",
    "butter": "unicode/1f9c8.png?v8",
    "butterfly": "unicode/1f98b.png?v8",
    "cactus": "unicode/1f335.png?v8",
    "cake": "unicode/1f370.png?v8",
    "calendar": "unicode/1f4c6.png?v8",
    "call_me_hand": "unicode/1f919.png?v8",
    "calling": "unicode/1f4f2.png?v8",
    "cambodia": "unicode/1f1f0-1f1ed.png?v8",
    "camel": "unicode/1f42b.png?v8",
    "camera": "unicode/1f4f7.png?v8",
    "camera_flash": "unicode/1f4f8.png?v8",
    "cameroon": "unicode/1f1e8-1f1f2.png?v8",
    "camping": "unicode/1f3d5.png?v8",
    "canada": "unicode/1f1e8-1f1e6.png?v8",
    "canary_islands": "unicode/1f1ee-1f1e8.png?v8",
    "cancer": "unicode/264b.png?v8",
    "candle": "unicode/1f56f.png?v8",
    "candy": "unicode/1f36c.png?v8",
    "canned_food": "unicode/1f96b.png?v8",
    "canoe": "unicode/1f6f6.png?v8",
    "cape_verde": "unicode/1f1e8-1f1fb.png?v8",
    "capital_abcd": "unicode/1f520.png?v8",
    "capricorn": "unicode/2651.png?v8",
    "car": "unicode/1f697.png?v8",
    "card_file_box": "unicode/1f5c3.png?v8",
    "card_index": "unicode/1f4c7.png?v8",
    "card_index_dividers": "unicode/1f5c2.png?v8",
    "caribbean_netherlands": "unicode/1f1e7-1f1f6.png?v8",
    "carousel_horse": "unicode/1f3a0.png?v8",
    "carpentry_saw": "unicode/1fa9a.png?v8",
    "carrot": "unicode/1f955.png?v8",
    "cartwheeling": "unicode/1f938.png?v8",
    "cat": "unicode/1f431.png?v8",
    "cat2": "unicode/1f408.png?v8",
    "cayman_islands": "unicode/1f1f0-1f1fe.png?v8",
    "cd": "unicode/1f4bf.png?v8",
    "central_african_republic": "unicode/1f1e8-1f1eb.png?v8",
    "ceuta_melilla": "unicode/1f1ea-1f1e6.png?v8",
    "chad": "unicode/1f1f9-1f1e9.png?v8",
    "chains": "unicode/26d3.png?v8",
    "chair": "unicode/1fa91.png?v8",
    "champagne": "unicode/1f37e.png?v8",
    "chart": "unicode/1f4b9.png?v8",
    "chart_with_downwards_trend": "unicode/1f4c9.png?v8",
    "chart_with_upwards_trend": "unicode/1f4c8.png?v8",
    "checkered_flag": "unicode/1f3c1.png?v8",
    "cheese": "unicode/1f9c0.png?v8",
    "cherries": "unicode/1f352.png?v8",
    "cherry_blossom": "unicode/1f338.png?v8",
    "chess_pawn": "unicode/265f.png?v8",
    "chestnut": "unicode/1f330.png?v8",
    "chicken": "unicode/1f414.png?v8",
    "child": "unicode/1f9d2.png?v8",
    "children_crossing": "unicode/1f6b8.png?v8",
    "chile": "unicode/1f1e8-1f1f1.png?v8",
    "chipmunk": "unicode/1f43f.png?v8",
    "chocolate_bar": "unicode/1f36b.png?v8",
    "chopsticks": "unicode/1f962.png?v8",
    "christmas_island": "unicode/1f1e8-1f1fd.png?v8",
    "christmas_tree": "unicode/1f384.png?v8",
    "church": "unicode/26ea.png?v8",
    "cinema": "unicode/1f3a6.png?v8",
    "circus_tent": "unicode/1f3aa.png?v8",
    "city_sunrise": "unicode/1f307.png?v8",
    "city_sunset": "unicode/1f306.png?v8",
    "cityscape": "unicode/1f3d9.png?v8",
    "cl": "unicode/1f191.png?v8",
    "clamp": "unicode/1f5dc.png?v8",
    "clap": "unicode/1f44f.png?v8",
    "clapper": "unicode/1f3ac.png?v8",
    "classical_building": "unicode/1f3db.png?v8",
    "climbing": "unicode/1f9d7.png?v8",
    "climbing_man": "unicode/1f9d7-2642.png?v8",
    "climbing_woman": "unicode/1f9d7-2640.png?v8",
    "clinking_glasses": "unicode/1f942.png?v8",
    "clipboard": "unicode/1f4cb.png?v8",
    "clipperton_island": "unicode/1f1e8-1f1f5.png?v8",
    "clock1": "unicode/1f550.png?v8",
    "clock10": "unicode/1f559.png?v8",
    "clock1030": "unicode/1f565.png?v8",
    "clock11": "unicode/1f55a.png?v8",
    "clock1130": "unicode/1f566.png?v8",
    "clock12": "unicode/1f55b.png?v8",
    "clock1230": "unicode/1f567.png?v8",
    "clock130": "unicode/1f55c.png?v8",
    "clock2": "unicode/1f551.png?v8",
    "clock230": "unicode/1f55d.png?v8",
    "clock3": "unicode/1f552.png?v8",
    "clock330": "unicode/1f55e.png?v8",
    "clock4": "unicode/1f553.png?v8",
    "clock430": "unicode/1f55f.png?v8",
    "clock5": "unicode/1f554.png?v8",
    "clock530": "unicode/1f560.png?v8",
    "clock6": "unicode/1f555.png?v8",
    "clock630": "unicode/1f561.png?v8",
    "clock7": "unicode/1f556.png?v8",
    "clock730": "unicode/1f562.png?v8",
    "clock8": "unicode/1f557.png?v8",
    "clock830": "unicode/1f563.png?v8",
    "clock9": "unicode/1f558.png?v8",
    "clock930": "unicode/1f564.png?v8",
    "closed_book": "unicode/1f4d5.png?v8",
    "closed_lock_with_key": "unicode/1f510.png?v8",
    "closed_umbrella": "unicode/1f302.png?v8",
    "cloud": "unicode/2601.png?v8",
    "cloud_with_lightning": "unicode/1f329.png?v8",
    "cloud_with_lightning_and_rain": "unicode/26c8.png?v8",
    "cloud_with_rain": "unicode/1f327.png?v8",
    "cloud_with_snow": "unicode/1f328.png?v8",
    "clown_face": "unicode/1f921.png?v8",
    "clubs": "unicode/2663.png?v8",
    "cn": "unicode/1f1e8-1f1f3.png?v8",
    "coat": "unicode/1f9e5.png?v8",
    "cockroach": "unicode/1fab3.png?v8",
    "cocktail": "unicode/1f378.png?v8",
    "coconut": "unicode/1f965.png?v8",
    "cocos_islands": "unicode/1f1e8-1f1e8.png?v8",
    "coffee": "unicode/2615.png?v8",
    "coffin": "unicode/26b0.png?v8",
    "coin": "unicode/1fa99.png?v8",
    "cold_face": "unicode/1f976.png?v8",
    "cold_sweat": "unicode/1f630.png?v8",
    "collision": "unicode/1f4a5.png?v8",
    "colombia": "unicode/1f1e8-1f1f4.png?v8",
    "comet": "unicode/2604.png?v8",
    "comoros": "unicode/1f1f0-1f1f2.png?v8",
    "compass": "unicode/1f9ed.png?v8",
    "computer": "unicode/1f4bb.png?v8",
    "computer_mouse": "unicode/1f5b1.png?v8",
    "confetti_ball": "unicode/1f38a.png?v8",
    "confounded": "unicode/1f616.png?v8",
    "confused": "unicode/1f615.png?v8",
    "congo_brazzaville": "unicode/1f1e8-1f1ec.png?v8",
    "congo_kinshasa": "unicode/1f1e8-1f1e9.png?v8",
    "congratulations": "unicode/3297.png?v8",
    "construction": "unicode/1f6a7.png?v8",
    "construction_worker": "unicode/1f477.png?v8",
    "construction_worker_man": "unicode/1f477-2642.png?v8",
    "construction_worker_woman": "unicode/1f477-2640.png?v8",
    "control_knobs": "unicode/1f39b.png?v8",
    "convenience_store": "unicode/1f3ea.png?v8",
    "cook": "unicode/1f9d1-1f373.png?v8",
    "cook_islands": "unicode/1f1e8-1f1f0.png?v8",
    "cookie": "unicode/1f36a.png?v8",
    "cool": "unicode/1f192.png?v8",
    "cop": "unicode/1f46e.png?v8",
    "copyright": "unicode/00a9.png?v8",
    "corn": "unicode/1f33d.png?v8",
    "costa_rica": "unicode/1f1e8-1f1f7.png?v8",
    "cote_divoire": "unicode/1f1e8-1f1ee.png?v8",
    "couch_and_lamp": "unicode/1f6cb.png?v8",
    "couple": "unicode/1f46b.png?v8",
    "couple_with_heart": "unicode/1f491.png?v8",
    "couple_with_heart_man_man": "unicode/1f468-2764-1f468.png?v8",
    "couple_with_heart_woman_man": "unicode/1f469-2764-1f468.png?v8",
    "couple_with_heart_woman_woman": "unicode/1f469-2764-1f469.png?v8",
    "couplekiss": "unicode/1f48f.png?v8",
    "couplekiss_man_man": "unicode/1f468-2764-1f48b-1f468.png?v8",
    "couplekiss_man_woman": "unicode/1f469-2764-1f48b-1f468.png?v8",
    "couplekiss_woman_woman": "unicode/1f469-2764-1f48b-1f469.png?v8",
    "cow": "unicode/1f42e.png?v8",
    "cow2": "unicode/1f404.png?v8",
    "cowboy_hat_face": "unicode/1f920.png?v8",
    "crab": "unicode/1f980.png?v8",
    "crayon": "unicode/1f58d.png?v8",
    "credit_card": "unicode/1f4b3.png?v8",
    "crescent_moon": "unicode/1f319.png?v8",
    "cricket": "unicode/1f997.png?v8",
    "cricket_game": "unicode/1f3cf.png?v8",
    "croatia": "unicode/1f1ed-1f1f7.png?v8",
    "crocodile": "unicode/1f40a.png?v8",
    "croissant": "unicode/1f950.png?v8",
    "crossed_fingers": "unicode/1f91e.png?v8",
    "crossed_flags": "unicode/1f38c.png?v8",
    "crossed_swords": "unicode/2694.png?v8",
    "crown": "unicode/1f451.png?v8",
    "cry": "unicode/1f622.png?v8",
    "crying_cat_face": "unicode/1f63f.png?v8",
    "crystal_ball": "unicode/1f52e.png?v8",
    "cuba": "unicode/1f1e8-1f1fa.png?v8",
    "cucumber": "unicode/1f952.png?v8",
    "cup_with_straw": "unicode/1f964.png?v8",
    "cupcake": "unicode/1f9c1.png?v8",
    "cupid": "unicode/1f498.png?v8",
    "curacao": "unicode/1f1e8-1f1fc.png?v8",
    "curling_stone": "unicode/1f94c.png?v8",
    "curly_haired_man": "unicode/1f468-1f9b1.png?v8",
    "curly_haired_woman": "unicode/1f469-1f9b1.png?v8",
    "curly_loop": "unicode/27b0.png?v8",
    "currency_exchange": "unicode/1f4b1.png?v8",
    "curry": "unicode/1f35b.png?v8",
    "cursing_face": "unicode/1f92c.png?v8",
    "custard": "unicode/1f36e.png?v8",
    "customs": "unicode/1f6c3.png?v8",
    "cut_of_meat": "unicode/1f969.png?v8",
    "cyclone": "unicode/1f300.png?v8",
    "cyprus": "unicode/1f1e8-1f1fe.png?v8",
    "czech_republic": "unicode/1f1e8-1f1ff.png?v8",
    "dagger": "unicode/1f5e1.png?v8",
    "dancer": "unicode/1f483.png?v8",
    "dancers": "unicode/1f46f.png?v8",
    "dancing_men": "unicode/1f46f-2642.png?v8",
    "dancing_women": "unicode/1f46f-2640.png?v8",
    "dango": "unicode/1f361.png?v8",
    "dark_sunglasses": "unicode/1f576.png?v8",
    "dart": "unicode/1f3af.png?v8",
    "dash": "unicode/1f4a8.png?v8",
    "date": "unicode/1f4c5.png?v8",
    "de": "unicode/1f1e9-1f1ea.png?v8",
    "deaf_man": "unicode/1f9cf-2642.png?v8",
    "deaf_person": "unicode/1f9cf.png?v8",
    "deaf_woman": "unicode/1f9cf-2640.png?v8",
    "deciduous_tree": "unicode/1f333.png?v8",
    "deer": "unicode/1f98c.png?v8",
    "denmark": "unicode/1f1e9-1f1f0.png?v8",
    "department_store": "unicode/1f3ec.png?v8",
    "derelict_house": "unicode/1f3da.png?v8",
    "desert": "unicode/1f3dc.png?v8",
    "desert_island": "unicode/1f3dd.png?v8",
    "desktop_computer": "unicode/1f5a5.png?v8",
    "detective": "unicode/1f575.png?v8",
    "diamond_shape_with_a_dot_inside": "unicode/1f4a0.png?v8",
    "diamonds": "unicode/2666.png?v8",
    "diego_garcia": "unicode/1f1e9-1f1ec.png?v8",
    "disappointed": "unicode/1f61e.png?v8",
    "disappointed_relieved": "unicode/1f625.png?v8",
    "disguised_face": "unicode/1f978.png?v8",
    "diving_mask": "unicode/1f93f.png?v8",
    "diya_lamp": "unicode/1fa94.png?v8",
    "dizzy": "unicode/1f4ab.png?v8",
    "dizzy_face": "unicode/1f635.png?v8",
    "djibouti": "unicode/1f1e9-1f1ef.png?v8",
    "dna": "unicode/1f9ec.png?v8",
    "do_not_litter": "unicode/1f6af.png?v8",
    "dodo": "unicode/1f9a4.png?v8",
    "dog": "unicode/1f436.png?v8",
    "dog2": "unicode/1f415.png?v8",
    "dollar": "unicode/1f4b5.png?v8",
    "dolls": "unicode/1f38e.png?v8",
    "dolphin": "unicode/1f42c.png?v8",
    "dominica": "unicode/1f1e9-1f1f2.png?v8",
    "dominican_republic": "unicode/1f1e9-1f1f4.png?v8",
    "door": "unicode/1f6aa.png?v8",
    "doughnut": "unicode/1f369.png?v8",
    "dove": "unicode/1f54a.png?v8",
    "dragon": "unicode/1f409.png?v8",
    "dragon_face": "unicode/1f432.png?v8",
    "dress": "unicode/1f457.png?v8",
    "dromedary_camel": "unicode/1f42a.png?v8",
    "drooling_face": "unicode/1f924.png?v8",
    "drop_of_blood": "unicode/1fa78.png?v8",
    "droplet": "unicode/1f4a7.png?v8",
    "drum": "unicode/1f941.png?v8",
    "duck": "unicode/1f986.png?v8",
    "dumpling": "unicode/1f95f.png?v8",
    "dvd": "unicode/1f4c0.png?v8",
    "e-mail": "unicode/1f4e7.png?v8",
    "eagle": "unicode/1f985.png?v8",
    "ear": "unicode/1f442.png?v8",
    "ear_of_rice": "unicode/1f33e.png?v8",
    "ear_with_hearing_aid": "unicode/1f9bb.png?v8",
    "earth_africa": "unicode/1f30d.png?v8",
    "earth_americas": "unicode/1f30e.png?v8",
    "earth_asia": "unicode/1f30f.png?v8",
    "ecuador": "unicode/1f1ea-1f1e8.png?v8",
    "egg": "unicode/1f95a.png?v8",
    "eggplant": "unicode/1f346.png?v8",
    "egypt": "unicode/1f1ea-1f1ec.png?v8",
    "eight": "unicode/0038-20e3.png?v8",
    "eight_pointed_black_star": "unicode/2734.png?v8",
    "eight_spoked_asterisk": "unicode/2733.png?v8",
    "eject_button": "unicode/23cf.png?v8",
    "el_salvador": "unicode/1f1f8-1f1fb.png?v8",
    "electric_plug": "unicode/1f50c.png?v8",
    "electron": "electron.png?v8",
    "elephant": "unicode/1f418.png?v8",
    "elevator": "unicode/1f6d7.png?v8",
    "elf": "unicode/1f9dd.png?v8",
    "elf_man": "unicode/1f9dd-2642.png?v8",
    "elf_woman": "unicode/1f9dd-2640.png?v8",
    "email": "unicode/1f4e7.png?v8",
    "end": "unicode/1f51a.png?v8",
    "england": "unicode/1f3f4-e0067-e0062-e0065-e006e-e0067-e007f.png?v8",
    "envelope": "unicode/2709.png?v8",
    "envelope_with_arrow": "unicode/1f4e9.png?v8",
    "equatorial_guinea": "unicode/1f1ec-1f1f6.png?v8",
    "eritrea": "unicode/1f1ea-1f1f7.png?v8",
    "es": "unicode/1f1ea-1f1f8.png?v8",
    "estonia": "unicode/1f1ea-1f1ea.png?v8",
    "ethiopia": "unicode/1f1ea-1f1f9.png?v8",
    "eu": "unicode/1f1ea-1f1fa.png?v8",
    "euro": "unicode/1f4b6.png?v8",
    "european_castle": "unicode/1f3f0.png?v8",
    "european_post_office": "unicode/1f3e4.png?v8",
    "european_union": "unicode/1f1ea-1f1fa.png?v8",
    "evergreen_tree": "unicode/1f332.png?v8",
    "exclamation": "unicode/2757.png?v8",
    "exploding_head": "unicode/1f92f.png?v8",
    "expressionless": "unicode/1f611.png?v8",
    "eye": "unicode/1f441.png?v8",
    "eye_speech_bubble": "unicode/1f441-1f5e8.png?v8",
    "eyeglasses": "unicode/1f453.png?v8",
    "eyes": "unicode/1f440.png?v8",
    "face_exhaling": "unicode/1f62e-1f4a8.png?v8",
    "face_in_clouds": "unicode/1f636-1f32b.png?v8",
    "face_with_head_bandage": "unicode/1f915.png?v8",
    "face_with_spiral_eyes": "unicode/1f635-1f4ab.png?v8",
    "face_with_thermometer": "unicode/1f912.png?v8",
    "facepalm": "unicode/1f926.png?v8",
    "facepunch": "unicode/1f44a.png?v8",
    "factory": "unicode/1f3ed.png?v8",
    "factory_worker": "unicode/1f9d1-1f3ed.png?v8",
    "fairy": "unicode/1f9da.png?v8",
    "fairy_man": "unicode/1f9da-2642.png?v8",
    "fairy_woman": "unicode/1f9da-2640.png?v8",
    "falafel": "unicode/1f9c6.png?v8",
    "falkland_islands": "unicode/1f1eb-1f1f0.png?v8",
    "fallen_leaf": "unicode/1f342.png?v8",
    "family": "unicode/1f46a.png?v8",
    "family_man_boy": "unicode/1f468-1f466.png?v8",
    "family_man_boy_boy": "unicode/1f468-1f466-1f466.png?v8",
    "family_man_girl": "unicode/1f468-1f467.png?v8",
    "family_man_girl_boy": "unicode/1f468-1f467-1f466.png?v8",
    "family_man_girl_girl": "unicode/1f468-1f467-1f467.png?v8",
    "family_man_man_boy": "unicode/1f468-1f468-1f466.png?v8",
    "family_man_man_boy_boy": "unicode/1f468-1f468-1f466-1f466.png?v8",
    "family_man_man_girl": "unicode/1f468-1f468-1f467.png?v8",
    "family_man_man_girl_boy": "unicode/1f468-1f468-1f467-1f466.png?v8",
    "family_man_man_girl_girl": "unicode/1f468-1f468-1f467-1f467.png?v8",
    "family_man_woman_boy": "unicode/1f468-1f469-1f466.png?v8",
    "family_man_woman_boy_boy": "unicode/1f468-1f469-1f466-1f466.png?v8",
    "family_man_woman_girl": "unicode/1f468-1f469-1f467.png?v8",
    "family_man_woman_girl_boy": "unicode/1f468-1f469-1f467-1f466.png?v8",
    "family_man_woman_girl_girl": "unicode/1f468-1f469-1f467-1f467.png?v8",
    "family_woman_boy": "unicode/1f469-1f466.png?v8",
    "family_woman_boy_boy": "unicode/1f469-1f466-1f466.png?v8",
    "family_woman_girl": "unicode/1f469-1f467.png?v8",
    "family_woman_girl_boy": "unicode/1f469-1f467-1f466.png?v8",
    "family_woman_girl_girl": "unicode/1f469-1f467-1f467.png?v8",
    "family_woman_woman_boy": "unicode/1f469-1f469-1f466.png?v8",
    "family_woman_woman_boy_boy": "unicode/1f469-1f469-1f466-1f466.png?v8",
    "family_woman_woman_girl": "unicode/1f469-1f469-1f467.png?v8",
    "family_woman_woman_girl_boy": "unicode/1f469-1f469-1f467-1f466.png?v8",
    "family_woman_woman_girl_girl": "unicode/1f469-1f469-1f467-1f467.png?v8",
    "farmer": "unicode/1f9d1-1f33e.png?v8",
    "faroe_islands": "unicode/1f1eb-1f1f4.png?v8",
    "fast_forward": "unicode/23e9.png?v8",
    "fax": "unicode/1f4e0.png?v8",
    "fearful": "unicode/1f628.png?v8",
    "feather": "unicode/1fab6.png?v8",
    "feelsgood": "feelsgood.png?v8",
    "feet": "unicode/1f43e.png?v8",
    "female_detective": "unicode/1f575-2640.png?v8",
    "female_sign": "unicode/2640.png?v8",
    "ferris_wheel": "unicode/1f3a1.png?v8",
    "ferry": "unicode/26f4.png?v8",
    "field_hockey": "unicode/1f3d1.png?v8",
    "fiji": "unicode/1f1eb-1f1ef.png?v8",
    "file_cabinet": "unicode/1f5c4.png?v8",
    "file_folder": "unicode/1f4c1.png?v8",
    "film_projector": "unicode/1f4fd.png?v8",
    "film_strip": "unicode/1f39e.png?v8",
    "finland": "unicode/1f1eb-1f1ee.png?v8",
    "finnadie": "finnadie.png?v8",
    "fire": "unicode/1f525.png?v8",
    "fire_engine": "unicode/1f692.png?v8",
    "fire_extinguisher": "unicode/1f9ef.png?v8",
    "firecracker": "unicode/1f9e8.png?v8",
    "firefighter": "unicode/1f9d1-1f692.png?v8",
    "fireworks": "unicode/1f386.png?v8",
    "first_quarter_moon": "unicode/1f313.png?v8",
    "first_quarter_moon_with_face": "unicode/1f31b.png?v8",
    "fish": "unicode/1f41f.png?v8",
    "fish_cake": "unicode/1f365.png?v8",
    "fishing_pole_and_fish": "unicode/1f3a3.png?v8",
    "fist": "unicode/270a.png?v8",
    "fist_left": "unicode/1f91b.png?v8",
    "fist_oncoming": "unicode/1f44a.png?v8",
    "fist_raised": "unicode/270a.png?v8",
    "fist_right": "unicode/1f91c.png?v8",
    "five": "unicode/0035-20e3.png?v8",
    "flags": "unicode/1f38f.png?v8",
    "flamingo": "unicode/1f9a9.png?v8",
    "flashlight": "unicode/1f526.png?v8",
    "flat_shoe": "unicode/1f97f.png?v8",
    "flatbread": "unicode/1fad3.png?v8",
    "fleur_de_lis": "unicode/269c.png?v8",
    "flight_arrival": "unicode/1f6ec.png?v8",
    "flight_departure": "unicode/1f6eb.png?v8",
    "flipper": "unicode/1f42c.png?v8",
    "floppy_disk": "unicode/1f4be.png?v8",
    "flower_playing_cards": "unicode/1f3b4.png?v8",
    "flushed": "unicode/1f633.png?v8",
    "fly": "unicode/1fab0.png?v8",
    "flying_disc": "unicode/1f94f.png?v8",
    "flying_saucer": "unicode/1f6f8.png?v8",
    "fog": "unicode/1f32b.png?v8",
    "foggy": "unicode/1f301.png?v8",
    "fondue": "unicode/1fad5.png?v8",
    "foot": "unicode/1f9b6.png?v8",
    "football": "unicode/1f3c8.png?v8",
    "footprints": "unicode/1f463.png?v8",
    "fork_and_knife": "unicode/1f374.png?v8",
    "fortune_cookie": "unicode/1f960.png?v8",
    "fountain": "unicode/26f2.png?v8",
    "fountain_pen": "unicode/1f58b.png?v8",
    "four": "unicode/0034-20e3.png?v8",
    "four_leaf_clover": "unicode/1f340.png?v8",
    "fox_face": "unicode/1f98a.png?v8",
    "fr": "unicode/1f1eb-1f1f7.png?v8",
    "framed_picture": "unicode/1f5bc.png?v8",
    "free": "unicode/1f193.png?v8",
    "french_guiana": "unicode/1f1ec-1f1eb.png?v8",
    "french_polynesia": "unicode/1f1f5-1f1eb.png?v8",
    "french_southern_territories": "unicode/1f1f9-1f1eb.png?v8",
    "fried_egg": "unicode/1f373.png?v8",
    "fried_shrimp": "unicode/1f364.png?v8",
    "fries": "unicode/1f35f.png?v8",
    "frog": "unicode/1f438.png?v8",
    "frowning": "unicode/1f626.png?v8",
    "frowning_face": "unicode/2639.png?v8",
    "frowning_man": "unicode/1f64d-2642.png?v8",
    "frowning_person": "unicode/1f64d.png?v8",
    "frowning_woman": "unicode/1f64d-2640.png?v8",
    "fu": "unicode/1f595.png?v8",
    "fuelpump": "unicode/26fd.png?v8",
    "full_moon": "unicode/1f315.png?v8",
    "full_moon_with_face": "unicode/1f31d.png?v8",
    "funeral_urn": "unicode/26b1.png?v8",
    "gabon": "unicode/1f1ec-1f1e6.png?v8",
    "gambia": "unicode/1f1ec-1f1f2.png?v8",
    "game_die": "unicode/1f3b2.png?v8",
    "garlic": "unicode/1f9c4.png?v8",
    "gb": "unicode/1f1ec-1f1e7.png?v8",
    "gear": "unicode/2699.png?v8",
    "gem": "unicode/1f48e.png?v8",
    "gemini": "unicode/264a.png?v8",
    "genie": "unicode/1f9de.png?v8",
    "genie_man": "unicode/1f9de-2642.png?v8",
    "genie_woman": "unicode/1f9de-2640.png?v8",
    "georgia": "unicode/1f1ec-1f1ea.png?v8",
    "ghana": "unicode/1f1ec-1f1ed.png?v8",
    "ghost": "unicode/1f47b.png?v8",
    "gibraltar": "unicode/1f1ec-1f1ee.png?v8",
    "gift": "unicode/1f381.png?v8",
    "gift_heart": "unicode/1f49d.png?v8",
    "giraffe": "unicode/1f992.png?v8",
    "girl": "unicode/1f467.png?v8",
    "globe_with_meridians": "unicode/1f310.png?v8",
    "gloves": "unicode/1f9e4.png?v8",
    "goal_net": "unicode/1f945.png?v8",
    "goat": "unicode/1f410.png?v8",
    "goberserk": "goberserk.png?v8",
    "godmode": "godmode.png?v8",
    "goggles": "unicode/1f97d.png?v8",
    "golf": "unicode/26f3.png?v8",
    "golfing": "unicode/1f3cc.png?v8",
    "golfing_man": "unicode/1f3cc-2642.png?v8",
    "golfing_woman": "unicode/1f3cc-2640.png?v8",
    "gorilla": "unicode/1f98d.png?v8",
    "grapes": "unicode/1f347.png?v8",
    "greece": "unicode/1f1ec-1f1f7.png?v8",
    "green_apple": "unicode/1f34f.png?v8",
    "green_book": "unicode/1f4d7.png?v8",
    "green_circle": "unicode/1f7e2.png?v8",
    "green_heart": "unicode/1f49a.png?v8",
    "green_salad": "unicode/1f957.png?v8",
    "green_square": "unicode/1f7e9.png?v8",
    "greenland": "unicode/1f1ec-1f1f1.png?v8",
    "grenada": "unicode/1f1ec-1f1e9.png?v8",
    "grey_exclamation": "unicode/2755.png?v8",
    "grey_question": "unicode/2754.png?v8",
    "grimacing": "unicode/1f62c.png?v8",
    "grin": "unicode/1f601.png?v8",
    "grinning": "unicode/1f600.png?v8",
    "guadeloupe": "unicode/1f1ec-1f1f5.png?v8",
    "guam": "unicode/1f1ec-1f1fa.png?v8",
    "guard": "unicode/1f482.png?v8",
    "guardsman": "unicode/1f482-2642.png?v8",
    "guardswoman": "unicode/1f482-2640.png?v8",
    "guatemala": "unicode/1f1ec-1f1f9.png?v8",
    "guernsey": "unicode/1f1ec-1f1ec.png?v8",
    "guide_dog": "unicode/1f9ae.png?v8",
    "guinea": "unicode/1f1ec-1f1f3.png?v8",
    "guinea_bissau": "unicode/1f1ec-1f1fc.png?v8",
    "guitar": "unicode/1f3b8.png?v8",
    "gun": "unicode/1f52b.png?v8",
    "guyana": "unicode/1f1ec-1f1fe.png?v8",
    "haircut": "unicode/1f487.png?v8",
    "haircut_man": "unicode/1f487-2642.png?v8",
    "haircut_woman": "unicode/1f487-2640.png?v8",
    "haiti": "unicode/1f1ed-1f1f9.png?v8",
    "hamburger": "unicode/1f354.png?v8",
    "hammer": "unicode/1f528.png?v8",
    "hammer_and_pick": "unicode/2692.png?v8",
    "hammer_and_wrench": "unicode/1f6e0.png?v8",
    "hamster": "unicode/1f439.png?v8",
    "hand": "unicode/270b.png?v8",
    "hand_over_mouth": "unicode/1f92d.png?v8",
    "handbag": "unicode/1f45c.png?v8",
    "handball_person": "unicode/1f93e.png?v8",
    "handshake": "unicode/1f91d.png?v8",
    "hankey": "unicode/1f4a9.png?v8",
    "hash": "unicode/0023-20e3.png?v8",
    "hatched_chick": "unicode/1f425.png?v8",
    "hatching_chick": "unicode/1f423.png?v8",
    "headphones": "unicode/1f3a7.png?v8",
    "headstone": "unicode/1faa6.png?v8",
    "health_worker": "unicode/1f9d1-2695.png?v8",
    "hear_no_evil": "unicode/1f649.png?v8",
    "heard_mcdonald_islands": "unicode/1f1ed-1f1f2.png?v8",
    "heart": "unicode/2764.png?v8",
    "heart_decoration": "unicode/1f49f.png?v8",
    "heart_eyes": "unicode/1f60d.png?v8",
    "heart_eyes_cat": "unicode/1f63b.png?v8",
    "heart_on_fire": "unicode/2764-1f525.png?v8",
    "heartbeat": "unicode/1f493.png?v8",
    "heartpulse": "unicode/1f497.png?v8",
    "hearts": "unicode/2665.png?v8",
    "heavy_check_mark": "unicode/2714.png?v8",
    "heavy_division_sign": "unicode/2797.png?v8",
    "heavy_dollar_sign": "unicode/1f4b2.png?v8",
    "heavy_exclamation_mark": "unicode/2757.png?v8",
    "heavy_heart_exclamation": "unicode/2763.png?v8",
    "heavy_minus_sign": "unicode/2796.png?v8",
    "heavy_multiplication_x": "unicode/2716.png?v8",
    "heavy_plus_sign": "unicode/2795.png?v8",
    "hedgehog": "unicode/1f994.png?v8",
    "helicopter": "unicode/1f681.png?v8",
    "herb": "unicode/1f33f.png?v8",
    "hibiscus": "unicode/1f33a.png?v8",
    "high_brightness": "unicode/1f506.png?v8",
    "high_heel": "unicode/1f460.png?v8",
    "hiking_boot": "unicode/1f97e.png?v8",
    "hindu_temple": "unicode/1f6d5.png?v8",
    "hippopotamus": "unicode/1f99b.png?v8",
    "hocho": "unicode/1f52a.png?v8",
    "hole": "unicode/1f573.png?v8",
    "honduras": "unicode/1f1ed-1f1f3.png?v8",
    "honey_pot": "unicode/1f36f.png?v8",
    "honeybee": "unicode/1f41d.png?v8",
    "hong_kong": "unicode/1f1ed-1f1f0.png?v8",
    "hook": "unicode/1fa9d.png?v8",
    "horse": "unicode/1f434.png?v8",
    "horse_racing": "unicode/1f3c7.png?v8",
    "hospital": "unicode/1f3e5.png?v8",
    "hot_face": "unicode/1f975.png?v8",
    "hot_pepper": "unicode/1f336.png?v8",
    "hotdog": "unicode/1f32d.png?v8",
    "hotel": "unicode/1f3e8.png?v8",
    "hotsprings": "unicode/2668.png?v8",
    "hourglass": "unicode/231b.png?v8",
    "hourglass_flowing_sand": "unicode/23f3.png?v8",
    "house": "unicode/1f3e0.png?v8",
    "house_with_garden": "unicode/1f3e1.png?v8",
    "houses": "unicode/1f3d8.png?v8",
    "hugs": "unicode/1f917.png?v8",
    "hungary": "unicode/1f1ed-1f1fa.png?v8",
    "hurtrealbad": "hurtrealbad.png?v8",
    "hushed": "unicode/1f62f.png?v8",
    "hut": "unicode/1f6d6.png?v8",
    "ice_cream": "unicode/1f368.png?v8",
    "ice_cube": "unicode/1f9ca.png?v8",
    "ice_hockey": "unicode/1f3d2.png?v8",
    "ice_skate": "unicode/26f8.png?v8",
    "icecream": "unicode/1f366.png?v8",
    "iceland": "unicode/1f1ee-1f1f8.png?v8",
    "id": "unicode/1f194.png?v8",
    "ideograph_advantage": "unicode/1f250.png?v8",
    "imp": "unicode/1f47f.png?v8",
    "inbox_tray": "unicode/1f4e5.png?v8",
    "incoming_envelope": "unicode/1f4e8.png?v8",
    "india": "unicode/1f1ee-1f1f3.png?v8",
    "indonesia": "unicode/1f1ee-1f1e9.png?v8",
    "infinity": "unicode/267e.png?v8",
    "information_desk_person": "unicode/1f481.png?v8",
    "information_source": "unicode/2139.png?v8",
    "innocent": "unicode/1f607.png?v8",
    "interrobang": "unicode/2049.png?v8",
    "iphone": "unicode/1f4f1.png?v8",
    "iran": "unicode/1f1ee-1f1f7.png?v8",
    "iraq": "unicode/1f1ee-1f1f6.png?v8",
    "ireland": "unicode/1f1ee-1f1ea.png?v8",
    "isle_of_man": "unicode/1f1ee-1f1f2.png?v8",
    "israel": "unicode/1f1ee-1f1f1.png?v8",
    "it": "unicode/1f1ee-1f1f9.png?v8",
    "izakaya_lantern": "unicode/1f3ee.png?v8",
    "jack_o_lantern": "unicode/1f383.png?v8",
    "jamaica": "unicode/1f1ef-1f1f2.png?v8",
    "japan": "unicode/1f5fe.png?v8",
    "japanese_castle": "unicode/1f3ef.png?v8",
    "japanese_goblin": "unicode/1f47a.png?v8",
    "japanese_ogre": "unicode/1f479.png?v8",
    "jeans": "unicode/1f456.png?v8",
    "jersey": "unicode/1f1ef-1f1ea.png?v8",
    "jigsaw": "unicode/1f9e9.png?v8",
    "jordan": "unicode/1f1ef-1f1f4.png?v8",
    "joy": "unicode/1f602.png?v8",
    "joy_cat": "unicode/1f639.png?v8",
    "joystick": "unicode/1f579.png?v8",
    "jp": "unicode/1f1ef-1f1f5.png?v8",
    "judge": "unicode/1f9d1-2696.png?v8",
    "juggling_person": "unicode/1f939.png?v8",
    "kaaba": "unicode/1f54b.png?v8",
    "kangaroo": "unicode/1f998.png?v8",
    "kazakhstan": "unicode/1f1f0-1f1ff.png?v8",
    "kenya": "unicode/1f1f0-1f1ea.png?v8",
    "key": "unicode/1f511.png?v8",
    "keyboard": "unicode/2328.png?v8",
    "keycap_ten": "unicode/1f51f.png?v8",
    "kick_scooter": "unicode/1f6f4.png?v8",
    "kimono": "unicode/1f458.png?v8",
    "kiribati": "unicode/1f1f0-1f1ee.png?v8",
    "kiss": "unicode/1f48b.png?v8",
    "kissing": "unicode/1f617.png?v8",
    "kissing_cat": "unicode/1f63d.png?v8",
    "kissing_closed_eyes": "unicode/1f61a.png?v8",
    "kissing_heart": "unicode/1f618.png?v8",
    "kissing_smiling_eyes": "unicode/1f619.png?v8",
    "kite": "unicode/1fa81.png?v8",
    "kiwi_fruit": "unicode/1f95d.png?v8",
    "kneeling_man": "unicode/1f9ce-2642.png?v8",
    "kneeling_person": "unicode/1f9ce.png?v8",
    "kneeling_woman": "unicode/1f9ce-2640.png?v8",
    "knife": "unicode/1f52a.png?v8",
    "knot": "unicode/1faa2.png?v8",
    "koala": "unicode/1f428.png?v8",
    "koko": "unicode/1f201.png?v8",
    "kosovo": "unicode/1f1fd-1f1f0.png?v8",
    "kr": "unicode/1f1f0-1f1f7.png?v8",
    "kuwait": "unicode/1f1f0-1f1fc.png?v8",
    "kyrgyzstan": "unicode/1f1f0-1f1ec.png?v8",
    "lab_coat": "unicode/1f97c.png?v8",
    "label": "unicode/1f3f7.png?v8",
    "lacrosse": "unicode/1f94d.png?v8",
    "ladder": "unicode/1fa9c.png?v8",
    "lady_beetle": "unicode/1f41e.png?v8",
    "lantern": "unicode/1f3ee.png?v8",
    "laos": "unicode/1f1f1-1f1e6.png?v8",
    "large_blue_circle": "unicode/1f535.png?v8",
    "large_blue_diamond": "unicode/1f537.png?v8",
    "large_orange_diamond": "unicode/1f536.png?v8",
    "last_quarter_moon": "unicode/1f317.png?v8",
    "last_quarter_moon_with_face": "unicode/1f31c.png?v8",
    "latin_cross": "unicode/271d.png?v8",
    "latvia": "unicode/1f1f1-1f1fb.png?v8",
    "laughing": "unicode/1f606.png?v8",
    "leafy_green": "unicode/1f96c.png?v8",
    "leaves": "unicode/1f343.png?v8",
    "lebanon": "unicode/1f1f1-1f1e7.png?v8",
    "ledger": "unicode/1f4d2.png?v8",
    "left_luggage": "unicode/1f6c5.png?v8",
    "left_right_arrow": "unicode/2194.png?v8",
    "left_speech_bubble": "unicode/1f5e8.png?v8",
    "leftwards_arrow_with_hook": "unicode/21a9.png?v8",
    "leg": "unicode/1f9b5.png?v8",
    "lemon": "unicode/1f34b.png?v8",
    "leo": "unicode/264c.png?v8",
    "leopard": "unicode/1f406.png?v8",
    "lesotho": "unicode/1f1f1-1f1f8.png?v8",
    "level_slider": "unicode/1f39a.png?v8",
    "liberia": "unicode/1f1f1-1f1f7.png?v8",
    "libra": "unicode/264e.png?v8",
    "libya": "unicode/1f1f1-1f1fe.png?v8",
    "liechtenstein": "unicode/1f1f1-1f1ee.png?v8",
    "light_rail": "unicode/1f688.png?v8",
    "link": "unicode/1f517.png?v8",
    "lion": "unicode/1f981.png?v8",
    "lips": "unicode/1f444.png?v8",
    "lipstick": "unicode/1f484.png?v8",
    "lithuania": "unicode/1f1f1-1f1f9.png?v8",
    "lizard": "unicode/1f98e.png?v8",
    "llama": "unicode/1f999.png?v8",
    "lobster": "unicode/1f99e.png?v8",
    "lock": "unicode/1f512.png?v8",
    "lock_with_ink_pen": "unicode/1f50f.png?v8",
    "lollipop": "unicode/1f36d.png?v8",
    "long_drum": "unicode/1fa98.png?v8",
    "loop": "unicode/27bf.png?v8",
    "lotion_bottle": "unicode/1f9f4.png?v8",
    "lotus_position": "unicode/1f9d8.png?v8",
    "lotus_position_man": "unicode/1f9d8-2642.png?v8",
    "lotus_position_woman": "unicode/1f9d8-2640.png?v8",
    "loud_sound": "unicode/1f50a.png?v8",
    "loudspeaker": "unicode/1f4e2.png?v8",
    "love_hotel": "unicode/1f3e9.png?v8",
    "love_letter": "unicode/1f48c.png?v8",
    "love_you_gesture": "unicode/1f91f.png?v8",
    "low_brightness": "unicode/1f505.png?v8",
    "luggage": "unicode/1f9f3.png?v8",
    "lungs": "unicode/1fac1.png?v8",
    "luxembourg": "unicode/1f1f1-1f1fa.png?v8",
    "lying_face": "unicode/1f925.png?v8",
    "m": "unicode/24c2.png?v8",
    "macau": "unicode/1f1f2-1f1f4.png?v8",
    "macedonia": "unicode/1f1f2-1f1f0.png?v8",
    "madagascar": "unicode/1f1f2-1f1ec.png?v8",
    "mag": "unicode/1f50d.png?v8",
    "mag_right": "unicode/1f50e.png?v8",
    "mage": "unicode/1f9d9.png?v8",
    "mage_man": "unicode/1f9d9-2642.png?v8",
    "mage_woman": "unicode/1f9d9-2640.png?v8",
    "magic_wand": "unicode/1fa84.png?v8",
    "magnet": "unicode/1f9f2.png?v8",
    "mahjong": "unicode/1f004.png?v8",
    "mailbox": "unicode/1f4eb.png?v8",
    "mailbox_closed": "unicode/1f4ea.png?v8",
    "mailbox_with_mail": "unicode/1f4ec.png?v8",
    "mailbox_with_no_mail": "unicode/1f4ed.png?v8",
    "malawi": "unicode/1f1f2-1f1fc.png?v8",
    "malaysia": "unicode/1f1f2-1f1fe.png?v8",
    "maldives": "unicode/1f1f2-1f1fb.png?v8",
    "male_detective": "unicode/1f575-2642.png?v8",
    "male_sign": "unicode/2642.png?v8",
    "mali": "unicode/1f1f2-1f1f1.png?v8",
    "malta": "unicode/1f1f2-1f1f9.png?v8",
    "mammoth": "unicode/1f9a3.png?v8",
    "man": "unicode/1f468.png?v8",
    "man_artist": "unicode/1f468-1f3a8.png?v8",
    "man_astronaut": "unicode/1f468-1f680.png?v8",
    "man_beard": "unicode/1f9d4-2642.png?v8",
    "man_cartwheeling": "unicode/1f938-2642.png?v8",
    "man_cook": "unicode/1f468-1f373.png?v8",
    "man_dancing": "unicode/1f57a.png?v8",
    "man_facepalming": "unicode/1f926-2642.png?v8",
    "man_factory_worker": "unicode/1f468-1f3ed.png?v8",
    "man_farmer": "unicode/1f468-1f33e.png?v8",
    "man_feeding_baby": "unicode/1f468-1f37c.png?v8",
    "man_firefighter": "unicode/1f468-1f692.png?v8",
    "man_health_worker": "unicode/1f468-2695.png?v8",
    "man_in_manual_wheelchair": "unicode/1f468-1f9bd.png?v8",
    "man_in_motorized_wheelchair": "unicode/1f468-1f9bc.png?v8",
    "man_in_tuxedo": "unicode/1f935-2642.png?v8",
    "man_judge": "unicode/1f468-2696.png?v8",
    "man_juggling": "unicode/1f939-2642.png?v8",
    "man_mechanic": "unicode/1f468-1f527.png?v8",
    "man_office_worker": "unicode/1f468-1f4bc.png?v8",
    "man_pilot": "unicode/1f468-2708.png?v8",
    "man_playing_handball": "unicode/1f93e-2642.png?v8",
    "man_playing_water_polo": "unicode/1f93d-2642.png?v8",
    "man_scientist": "unicode/1f468-1f52c.png?v8",
    "man_shrugging": "unicode/1f937-2642.png?v8",
    "man_singer": "unicode/1f468-1f3a4.png?v8",
    "man_student": "unicode/1f468-1f393.png?v8",
    "man_teacher": "unicode/1f468-1f3eb.png?v8",
    "man_technologist": "unicode/1f468-1f4bb.png?v8",
    "man_with_gua_pi_mao": "unicode/1f472.png?v8",
    "man_with_probing_cane": "unicode/1f468-1f9af.png?v8",
    "man_with_turban": "unicode/1f473-2642.png?v8",
    "man_with_veil": "unicode/1f470-2642.png?v8",
    "mandarin": "unicode/1f34a.png?v8",
    "mango": "unicode/1f96d.png?v8",
    "mans_shoe": "unicode/1f45e.png?v8",
    "mantelpiece_clock": "unicode/1f570.png?v8",
    "manual_wheelchair": "unicode/1f9bd.png?v8",
    "maple_leaf": "unicode/1f341.png?v8",
    "marshall_islands": "unicode/1f1f2-1f1ed.png?v8",
    "martial_arts_uniform": "unicode/1f94b.png?v8",
    "martinique": "unicode/1f1f2-1f1f6.png?v8",
    "mask": "unicode/1f637.png?v8",
    "massage": "unicode/1f486.png?v8",
    "massage_man": "unicode/1f486-2642.png?v8",
    "massage_woman": "unicode/1f486-2640.png?v8",
    "mate": "unicode/1f9c9.png?v8",
    "mauritania": "unicode/1f1f2-1f1f7.png?v8",
    "mauritius": "unicode/1f1f2-1f1fa.png?v8",
    "mayotte": "unicode/1f1fe-1f1f9.png?v8",
    "meat_on_bone": "unicode/1f356.png?v8",
    "mechanic": "unicode/1f9d1-1f527.png?v8",
    "mechanical_arm": "unicode/1f9be.png?v8",
    "mechanical_leg": "unicode/1f9bf.png?v8",
    "medal_military": "unicode/1f396.png?v8",
    "medal_sports": "unicode/1f3c5.png?v8",
    "medical_symbol": "unicode/2695.png?v8",
    "mega": "unicode/1f4e3.png?v8",
    "melon": "unicode/1f348.png?v8",
    "memo": "unicode/1f4dd.png?v8",
    "men_wrestling": "unicode/1f93c-2642.png?v8",
    "mending_heart": "unicode/2764-1fa79.png?v8",
    "menorah": "unicode/1f54e.png?v8",
    "mens": "unicode/1f6b9.png?v8",
    "mermaid": "unicode/1f9dc-2640.png?v8",
    "merman": "unicode/1f9dc-2642.png?v8",
    "merperson": "unicode/1f9dc.png?v8",
    "metal": "unicode/1f918.png?v8",
    "metro": "unicode/1f687.png?v8",
    "mexico": "unicode/1f1f2-1f1fd.png?v8",
    "microbe": "unicode/1f9a0.png?v8",
    "micronesia": "unicode/1f1eb-1f1f2.png?v8",
    "microphone": "unicode/1f3a4.png?v8",
    "microscope": "unicode/1f52c.png?v8",
    "middle_finger": "unicode/1f595.png?v8",
    "military_helmet": "unicode/1fa96.png?v8",
    "milk_glass": "unicode/1f95b.png?v8",
    "milky_way": "unicode/1f30c.png?v8",
    "minibus": "unicode/1f690.png?v8",
    "minidisc": "unicode/1f4bd.png?v8",
    "mirror": "unicode/1fa9e.png?v8",
    "mobile_phone_off": "unicode/1f4f4.png?v8",
    "moldova": "unicode/1f1f2-1f1e9.png?v8",
    "monaco": "unicode/1f1f2-1f1e8.png?v8",
    "money_mouth_face": "unicode/1f911.png?v8",
    "money_with_wings": "unicode/1f4b8.png?v8",
    "moneybag": "unicode/1f4b0.png?v8",
    "mongolia": "unicode/1f1f2-1f1f3.png?v8",
    "monkey": "unicode/1f412.png?v8",
    "monkey_face": "unicode/1f435.png?v8",
    "monocle_face": "unicode/1f9d0.png?v8",
    "monorail": "unicode/1f69d.png?v8",
    "montenegro": "unicode/1f1f2-1f1ea.png?v8",
    "montserrat": "unicode/1f1f2-1f1f8.png?v8",
    "moon": "unicode/1f314.png?v8",
    "moon_cake": "unicode/1f96e.png?v8",
    "morocco": "unicode/1f1f2-1f1e6.png?v8",
    "mortar_board": "unicode/1f393.png?v8",
    "mosque": "unicode/1f54c.png?v8",
    "mosquito": "unicode/1f99f.png?v8",
    "motor_boat": "unicode/1f6e5.png?v8",
    "motor_scooter": "unicode/1f6f5.png?v8",
    "motorcycle": "unicode/1f3cd.png?v8",
    "motorized_wheelchair": "unicode/1f9bc.png?v8",
    "motorway": "unicode/1f6e3.png?v8",
    "mount_fuji": "unicode/1f5fb.png?v8",
    "mountain": "unicode/26f0.png?v8",
    "mountain_bicyclist": "unicode/1f6b5.png?v8",
    "mountain_biking_man": "unicode/1f6b5-2642.png?v8",
    "mountain_biking_woman": "unicode/1f6b5-2640.png?v8",
    "mountain_cableway": "unicode/1f6a0.png?v8",
    "mountain_railway": "unicode/1f69e.png?v8",
    "mountain_snow": "unicode/1f3d4.png?v8",
    "mouse": "unicode/1f42d.png?v8",
    "mouse2": "unicode/1f401.png?v8",
    "mouse_trap": "unicode/1faa4.png?v8",
    "movie_camera": "unicode/1f3a5.png?v8",
    "moyai": "unicode/1f5ff.png?v8",
    "mozambique": "unicode/1f1f2-1f1ff.png?v8",
    "mrs_claus": "unicode/1f936.png?v8",
    "muscle": "unicode/1f4aa.png?v8",
    "mushroom": "unicode/1f344.png?v8",
    "musical_keyboard": "unicode/1f3b9.png?v8",
    "musical_note": "unicode/1f3b5.png?v8",
    "musical_score": "unicode/1f3bc.png?v8",
    "mute": "unicode/1f507.png?v8",
    "mx_claus": "unicode/1f9d1-1f384.png?v8",
    "myanmar": "unicode/1f1f2-1f1f2.png?v8",
    "nail_care": "unicode/1f485.png?v8",
    "name_badge": "unicode/1f4db.png?v8",
    "namibia": "unicode/1f1f3-1f1e6.png?v8",
    "national_park": "unicode/1f3de.png?v8",
    "nauru": "unicode/1f1f3-1f1f7.png?v8",
    "nauseated_face": "unicode/1f922.png?v8",
    "nazar_amulet": "unicode/1f9ff.png?v8",
    "neckbeard": "neckbeard.png?v8",
    "necktie": "unicode/1f454.png?v8",
    "negative_squared_cross_mark": "unicode/274e.png?v8",
    "nepal": "unicode/1f1f3-1f1f5.png?v8",
    "nerd_face": "unicode/1f913.png?v8",
    "nesting_dolls": "unicode/1fa86.png?v8",
    "netherlands": "unicode/1f1f3-1f1f1.png?v8",
    "neutral_face": "unicode/1f610.png?v8",
    "new": "unicode/1f195.png?v8",
    "new_caledonia": "unicode/1f1f3-1f1e8.png?v8",
    "new_moon": "unicode/1f311.png?v8",
    "new_moon_with_face": "unicode/1f31a.png?v8",
    "new_zealand": "unicode/1f1f3-1f1ff.png?v8",
    "newspaper": "unicode/1f4f0.png?v8",
    "newspaper_roll": "unicode/1f5de.png?v8",
    "next_track_button": "unicode/23ed.png?v8",
    "ng": "unicode/1f196.png?v8",
    "ng_man": "unicode/1f645-2642.png?v8",
    "ng_woman": "unicode/1f645-2640.png?v8",
    "nicaragua": "unicode/1f1f3-1f1ee.png?v8",
    "niger": "unicode/1f1f3-1f1ea.png?v8",
    "nigeria": "unicode/1f1f3-1f1ec.png?v8",
    "night_with_stars": "unicode/1f303.png?v8",
    "nine": "unicode/0039-20e3.png?v8",
    "ninja": "unicode/1f977.png?v8",
    "niue": "unicode/1f1f3-1f1fa.png?v8",
    "no_bell": "unicode/1f515.png?v8",
    "no_bicycles": "unicode/1f6b3.png?v8",
    "no_entry": "unicode/26d4.png?v8",
    "no_entry_sign": "unicode/1f6ab.png?v8",
    "no_good": "unicode/1f645.png?v8",
    "no_good_man": "unicode/1f645-2642.png?v8",
    "no_good_woman": "unicode/1f645-2640.png?v8",
    "no_mobile_phones": "unicode/1f4f5.png?v8",
    "no_mouth": "unicode/1f636.png?v8",
    "no_pedestrians": "unicode/1f6b7.png?v8",
    "no_smoking": "unicode/1f6ad.png?v8",
    "non-potable_water": "unicode/1f6b1.png?v8",
    "norfolk_island": "unicode/1f1f3-1f1eb.png?v8",
    "north_korea": "unicode/1f1f0-1f1f5.png?v8",
    "northern_mariana_islands": "unicode/1f1f2-1f1f5.png?v8",
    "norway": "unicode/1f1f3-1f1f4.png?v8",
    "nose": "unicode/1f443.png?v8",
    "notebook": "unicode/1f4d3.png?v8",
    "notebook_with_decorative_cover": "unicode/1f4d4.png?v8",
    "notes": "unicode/1f3b6.png?v8",
    "nut_and_bolt": "unicode/1f529.png?v8",
    "o": "unicode/2b55.png?v8",
    "o2": "unicode/1f17e.png?v8",
    "ocean": "unicode/1f30a.png?v8",
    "octocat": "octocat.png?v8",
    "octopus": "unicode/1f419.png?v8",
    "oden": "unicode/1f362.png?v8",
    "office": "unicode/1f3e2.png?v8",
    "office_worker": "unicode/1f9d1-1f4bc.png?v8",
    "oil_drum": "unicode/1f6e2.png?v8",
    "ok": "unicode/1f197.png?v8",
    "ok_hand": "unicode/1f44c.png?v8",
    "ok_man": "unicode/1f646-2642.png?v8",
    "ok_person": "unicode/1f646.png?v8",
    "ok_woman": "unicode/1f646-2640.png?v8",
    "old_key": "unicode/1f5dd.png?v8",
    "older_adult": "unicode/1f9d3.png?v8",
    "older_man": "unicode/1f474.png?v8",
    "older_woman": "unicode/1f475.png?v8",
    "olive": "unicode/1fad2.png?v8",
    "om": "unicode/1f549.png?v8",
    "oman": "unicode/1f1f4-1f1f2.png?v8",
    "on": "unicode/1f51b.png?v8",
    "oncoming_automobile": "unicode/1f698.png?v8",
    "oncoming_bus": "unicode/1f68d.png?v8",
    "oncoming_police_car": "unicode/1f694.png?v8",
    "oncoming_taxi": "unicode/1f696.png?v8",
    "one": "unicode/0031-20e3.png?v8",
    "one_piece_swimsuit": "unicode/1fa71.png?v8",
    "onion": "unicode/1f9c5.png?v8",
    "open_book": "unicode/1f4d6.png?v8",
    "open_file_folder": "unicode/1f4c2.png?v8",
    "open_hands": "unicode/1f450.png?v8",
    "open_mouth": "unicode/1f62e.png?v8",
    "open_umbrella": "unicode/2602.png?v8",
    "ophiuchus": "unicode/26ce.png?v8",
    "orange": "unicode/1f34a.png?v8",
    "orange_book": "unicode/1f4d9.png?v8",
    "orange_circle": "unicode/1f7e0.png?v8",
    "orange_heart": "unicode/1f9e1.png?v8",
    "orange_square": "unicode/1f7e7.png?v8",
    "orangutan": "unicode/1f9a7.png?v8",
    "orthodox_cross": "unicode/2626.png?v8",
    "otter": "unicode/1f9a6.png?v8",
    "outbox_tray": "unicode/1f4e4.png?v8",
    "owl": "unicode/1f989.png?v8",
    "ox": "unicode/1f402.png?v8",
    "oyster": "unicode/1f9aa.png?v8",
    "package": "unicode/1f4e6.png?v8",
    "page_facing_up": "unicode/1f4c4.png?v8",
    "page_with_curl": "unicode/1f4c3.png?v8",
    "pager": "unicode/1f4df.png?v8",
    "paintbrush": "unicode/1f58c.png?v8",
    "pakistan": "unicode/1f1f5-1f1f0.png?v8",
    "palau": "unicode/1f1f5-1f1fc.png?v8",
    "palestinian_territories": "unicode/1f1f5-1f1f8.png?v8",
    "palm_tree": "unicode/1f334.png?v8",
    "palms_up_together": "unicode/1f932.png?v8",
    "panama": "unicode/1f1f5-1f1e6.png?v8",
    "pancakes": "unicode/1f95e.png?v8",
    "panda_face": "unicode/1f43c.png?v8",
    "paperclip": "unicode/1f4ce.png?v8",
    "paperclips": "unicode/1f587.png?v8",
    "papua_new_guinea": "unicode/1f1f5-1f1ec.png?v8",
    "parachute": "unicode/1fa82.png?v8",
    "paraguay": "unicode/1f1f5-1f1fe.png?v8",
    "parasol_on_ground": "unicode/26f1.png?v8",
    "parking": "unicode/1f17f.png?v8",
    "parrot": "unicode/1f99c.png?v8",
    "part_alternation_mark": "unicode/303d.png?v8",
    "partly_sunny": "unicode/26c5.png?v8",
    "partying_face": "unicode/1f973.png?v8",
    "passenger_ship": "unicode/1f6f3.png?v8",
    "passport_control": "unicode/1f6c2.png?v8",
    "pause_button": "unicode/23f8.png?v8",
    "paw_prints": "unicode/1f43e.png?v8",
    "peace_symbol": "unicode/262e.png?v8",
    "peach": "unicode/1f351.png?v8",
    "peacock": "unicode/1f99a.png?v8",
    "peanuts": "unicode/1f95c.png?v8",
    "pear": "unicode/1f350.png?v8",
    "pen": "unicode/1f58a.png?v8",
    "pencil": "unicode/1f4dd.png?v8",
    "pencil2": "unicode/270f.png?v8",
    "penguin": "unicode/1f427.png?v8",
    "pensive": "unicode/1f614.png?v8",
    "people_holding_hands": "unicode/1f9d1-1f91d-1f9d1.png?v8",
    "people_hugging": "unicode/1fac2.png?v8",
    "performing_arts": "unicode/1f3ad.png?v8",
    "persevere": "unicode/1f623.png?v8",
    "person_bald": "unicode/1f9d1-1f9b2.png?v8",
    "person_curly_hair": "unicode/1f9d1-1f9b1.png?v8",
    "person_feeding_baby": "unicode/1f9d1-1f37c.png?v8",
    "person_fencing": "unicode/1f93a.png?v8",
    "person_in_manual_wheelchair": "unicode/1f9d1-1f9bd.png?v8",
    "person_in_motorized_wheelchair": "unicode/1f9d1-1f9bc.png?v8",
    "person_in_tuxedo": "unicode/1f935.png?v8",
    "person_red_hair": "unicode/1f9d1-1f9b0.png?v8",
    "person_white_hair": "unicode/1f9d1-1f9b3.png?v8",
    "person_with_probing_cane": "unicode/1f9d1-1f9af.png?v8",
    "person_with_turban": "unicode/1f473.png?v8",
    "person_with_veil": "unicode/1f470.png?v8",
    "peru": "unicode/1f1f5-1f1ea.png?v8",
    "petri_dish": "unicode/1f9eb.png?v8",
    "philippines": "unicode/1f1f5-1f1ed.png?v8",
    "phone": "unicode/260e.png?v8",
    "pick": "unicode/26cf.png?v8",
    "pickup_truck": "unicode/1f6fb.png?v8",
    "pie": "unicode/1f967.png?v8",
    "pig": "unicode/1f437.png?v8",
    "pig2": "unicode/1f416.png?v8",
    "pig_nose": "unicode/1f43d.png?v8",
    "pill": "unicode/1f48a.png?v8",
    "pilot": "unicode/1f9d1-2708.png?v8",
    "pinata": "unicode/1fa85.png?v8",
    "pinched_fingers": "unicode/1f90c.png?v8",
    "pinching_hand": "unicode/1f90f.png?v8",
    "pineapple": "unicode/1f34d.png?v8",
    "ping_pong": "unicode/1f3d3.png?v8",
    "pirate_flag": "unicode/1f3f4-2620.png?v8",
    "pisces": "unicode/2653.png?v8",
    "pitcairn_islands": "unicode/1f1f5-1f1f3.png?v8",
    "pizza": "unicode/1f355.png?v8",
    "placard": "unicode/1faa7.png?v8",
    "place_of_worship": "unicode/1f6d0.png?v8",
    "plate_with_cutlery": "unicode/1f37d.png?v8",
    "play_or_pause_button": "unicode/23ef.png?v8",
    "pleading_face": "unicode/1f97a.png?v8",
    "plunger": "unicode/1faa0.png?v8",
    "point_down": "unicode/1f447.png?v8",
    "point_left": "unicode/1f448.png?v8",
    "point_right": "unicode/1f449.png?v8",
    "point_up": "unicode/261d.png?v8",
    "point_up_2": "unicode/1f446.png?v8",
    "poland": "unicode/1f1f5-1f1f1.png?v8",
    "polar_bear": "unicode/1f43b-2744.png?v8",
    "police_car": "unicode/1f693.png?v8",
    "police_officer": "unicode/1f46e.png?v8",
    "policeman": "unicode/1f46e-2642.png?v8",
    "policewoman": "unicode/1f46e-2640.png?v8",
    "poodle": "unicode/1f429.png?v8",
    "poop": "unicode/1f4a9.png?v8",
    "popcorn": "unicode/1f37f.png?v8",
    "portugal": "unicode/1f1f5-1f1f9.png?v8",
    "post_office": "unicode/1f3e3.png?v8",
    "postal_horn": "unicode/1f4ef.png?v8",
    "postbox": "unicode/1f4ee.png?v8",
    "potable_water": "unicode/1f6b0.png?v8",
    "potato": "unicode/1f954.png?v8",
    "potted_plant": "unicode/1fab4.png?v8",
    "pouch": "unicode/1f45d.png?v8",
    "poultry_leg": "unicode/1f357.png?v8",
    "pound": "unicode/1f4b7.png?v8",
    "pout": "unicode/1f621.png?v8",
    "pouting_cat": "unicode/1f63e.png?v8",
    "pouting_face": "unicode/1f64e.png?v8",
    "pouting_man": "unicode/1f64e-2642.png?v8",
    "pouting_woman": "unicode/1f64e-2640.png?v8",
    "pray": "unicode/1f64f.png?v8",
    "prayer_beads": "unicode/1f4ff.png?v8",
    "pregnant_woman": "unicode/1f930.png?v8",
    "pretzel": "unicode/1f968.png?v8",
    "previous_track_button": "unicode/23ee.png?v8",
    "prince": "unicode/1f934.png?v8",
    "princess": "unicode/1f478.png?v8",
    "printer": "unicode/1f5a8.png?v8",
    "probing_cane": "unicode/1f9af.png?v8",
    "puerto_rico": "unicode/1f1f5-1f1f7.png?v8",
    "punch": "unicode/1f44a.png?v8",
    "purple_circle": "unicode/1f7e3.png?v8",
    "purple_heart": "unicode/1f49c.png?v8",
    "purple_square": "unicode/1f7ea.png?v8",
    "purse": "unicode/1f45b.png?v8",
    "pushpin": "unicode/1f4cc.png?v8",
    "put_litter_in_its_place": "unicode/1f6ae.png?v8",
    "qatar": "unicode/1f1f6-1f1e6.png?v8",
    "question": "unicode/2753.png?v8",
    "rabbit": "unicode/1f430.png?v8",
    "rabbit2": "unicode/1f407.png?v8",
    "raccoon": "unicode/1f99d.png?v8",
    "racehorse": "unicode/1f40e.png?v8",
    "racing_car": "unicode/1f3ce.png?v8",
    "radio": "unicode/1f4fb.png?v8",
    "radio_button": "unicode/1f518.png?v8",
    "radioactive": "unicode/2622.png?v8",
    "rage": "unicode/1f621.png?v8",
    "rage1": "rage1.png?v8",
    "rage2": "rage2.png?v8",
    "rage3": "rage3.png?v8",
    "rage4": "rage4.png?v8",
    "railway_car": "unicode/1f683.png?v8",
    "railway_track": "unicode/1f6e4.png?v8",
    "rainbow": "unicode/1f308.png?v8",
    "rainbow_flag": "unicode/1f3f3-1f308.png?v8",
    "raised_back_of_hand": "unicode/1f91a.png?v8",
    "raised_eyebrow": "unicode/1f928.png?v8",
    "raised_hand": "unicode/270b.png?v8",
    "raised_hand_with_fingers_splayed": "unicode/1f590.png?v8",
    "raised_hands": "unicode/1f64c.png?v8",
    "raising_hand": "unicode/1f64b.png?v8",
    "raising_hand_man": "unicode/1f64b-2642.png?v8",
    "raising_hand_woman": "unicode/1f64b-2640.png?v8",
    "ram": "unicode/1f40f.png?v8",
    "ramen": "unicode/1f35c.png?v8",
    "rat": "unicode/1f400.png?v8",
    "razor": "unicode/1fa92.png?v8",
    "receipt": "unicode/1f9fe.png?v8",
    "record_button": "unicode/23fa.png?v8",
    "recycle": "unicode/267b.png?v8",
    "red_car": "unicode/1f697.png?v8",
    "red_circle": "unicode/1f534.png?v8",
    "red_envelope": "unicode/1f9e7.png?v8",
    "red_haired_man": "unicode/1f468-1f9b0.png?v8",
    "red_haired_woman": "unicode/1f469-1f9b0.png?v8",
    "red_square": "unicode/1f7e5.png?v8",
    "registered": "unicode/00ae.png?v8",
    "relaxed": "unicode/263a.png?v8",
    "relieved": "unicode/1f60c.png?v8",
    "reminder_ribbon": "unicode/1f397.png?v8",
    "repeat": "unicode/1f501.png?v8",
    "repeat_one": "unicode/1f502.png?v8",
    "rescue_worker_helmet": "unicode/26d1.png?v8",
    "restroom": "unicode/1f6bb.png?v8",
    "reunion": "unicode/1f1f7-1f1ea.png?v8",
    "revolving_hearts": "unicode/1f49e.png?v8",
    "rewind": "unicode/23ea.png?v8",
    "rhinoceros": "unicode/1f98f.png?v8",
    "ribbon": "unicode/1f380.png?v8",
    "rice": "unicode/1f35a.png?v8",
    "rice_ball": "unicode/1f359.png?v8",
    "rice_cracker": "unicode/1f358.png?v8",
    "rice_scene": "unicode/1f391.png?v8",
    "right_anger_bubble": "unicode/1f5ef.png?v8",
    "ring": "unicode/1f48d.png?v8",
    "ringed_planet": "unicode/1fa90.png?v8",
    "robot": "unicode/1f916.png?v8",
    "rock": "unicode/1faa8.png?v8",
    "rocket": "unicode/1f680.png?v8",
    "rofl": "unicode/1f923.png?v8",
    "roll_eyes": "unicode/1f644.png?v8",
    "roll_of_paper": "unicode/1f9fb.png?v8",
    "roller_coaster": "unicode/1f3a2.png?v8",
    "roller_skate": "unicode/1f6fc.png?v8",
    "romania": "unicode/1f1f7-1f1f4.png?v8",
    "rooster": "unicode/1f413.png?v8",
    "rose": "unicode/1f339.png?v8",
    "rosette": "unicode/1f3f5.png?v8",
    "rotating_light": "unicode/1f6a8.png?v8",
    "round_pushpin": "unicode/1f4cd.png?v8",
    "rowboat": "unicode/1f6a3.png?v8",
    "rowing_man": "unicode/1f6a3-2642.png?v8",
    "rowing_woman": "unicode/1f6a3-2640.png?v8",
    "ru": "unicode/1f1f7-1f1fa.png?v8",
    "rugby_football": "unicode/1f3c9.png?v8",
    "runner": "unicode/1f3c3.png?v8",
    "running": "unicode/1f3c3.png?v8",
    "running_man": "unicode/1f3c3-2642.png?v8",
    "running_shirt_with_sash": "unicode/1f3bd.png?v8",
    "running_woman": "unicode/1f3c3-2640.png?v8",
    "rwanda": "unicode/1f1f7-1f1fc.png?v8",
    "sa": "unicode/1f202.png?v8",
    "safety_pin": "unicode/1f9f7.png?v8",
    "safety_vest": "unicode/1f9ba.png?v8",
    "sagittarius": "unicode/2650.png?v8",
    "sailboat": "unicode/26f5.png?v8",
    "sake": "unicode/1f376.png?v8",
    "salt": "unicode/1f9c2.png?v8",
    "samoa": "unicode/1f1fc-1f1f8.png?v8",
    "san_marino": "unicode/1f1f8-1f1f2.png?v8",
    "sandal": "unicode/1f461.png?v8",
    "sandwich": "unicode/1f96a.png?v8",
    "santa": "unicode/1f385.png?v8",
    "sao_tome_principe": "unicode/1f1f8-1f1f9.png?v8",
    "sari": "unicode/1f97b.png?v8",
    "sassy_man": "unicode/1f481-2642.png?v8",
    "sassy_woman": "unicode/1f481-2640.png?v8",
    "satellite": "unicode/1f4e1.png?v8",
    "satisfied": "unicode/1f606.png?v8",
    "saudi_arabia": "unicode/1f1f8-1f1e6.png?v8",
    "sauna_man": "unicode/1f9d6-2642.png?v8",
    "sauna_person": "unicode/1f9d6.png?v8",
    "sauna_woman": "unicode/1f9d6-2640.png?v8",
    "sauropod": "unicode/1f995.png?v8",
    "saxophone": "unicode/1f3b7.png?v8",
    "scarf": "unicode/1f9e3.png?v8",
    "school": "unicode/1f3eb.png?v8",
    "school_satchel": "unicode/1f392.png?v8",
    "scientist": "unicode/1f9d1-1f52c.png?v8",
    "scissors": "unicode/2702.png?v8",
    "scorpion": "unicode/1f982.png?v8",
    "scorpius": "unicode/264f.png?v8",
    "scotland": "unicode/1f3f4-e0067-e0062-e0073-e0063-e0074-e007f.png?v8",
    "scream": "unicode/1f631.png?v8",
    "scream_cat": "unicode/1f640.png?v8",
    "screwdriver": "unicode/1fa9b.png?v8",
    "scroll": "unicode/1f4dc.png?v8",
    "seal": "unicode/1f9ad.png?v8",
    "seat": "unicode/1f4ba.png?v8",
    "secret": "unicode/3299.png?v8",
    "see_no_evil": "unicode/1f648.png?v8",
    "seedling": "unicode/1f331.png?v8",
    "selfie": "unicode/1f933.png?v8",
    "senegal": "unicode/1f1f8-1f1f3.png?v8",
    "serbia": "unicode/1f1f7-1f1f8.png?v8",
    "service_dog": "unicode/1f415-1f9ba.png?v8",
    "seven": "unicode/0037-20e3.png?v8",
    "sewing_needle": "unicode/1faa1.png?v8",
    "seychelles": "unicode/1f1f8-1f1e8.png?v8",
    "shallow_pan_of_food": "unicode/1f958.png?v8",
    "shamrock": "unicode/2618.png?v8",
    "shark": "unicode/1f988.png?v8",
    "shaved_ice": "unicode/1f367.png?v8",
    "sheep": "unicode/1f411.png?v8",
    "shell": "unicode/1f41a.png?v8",
    "shield": "unicode/1f6e1.png?v8",
    "shinto_shrine": "unicode/26e9.png?v8",
    "ship": "unicode/1f6a2.png?v8",
    "shipit": "shipit.png?v8",
    "shirt": "unicode/1f455.png?v8",
    "shit": "unicode/1f4a9.png?v8",
    "shoe": "unicode/1f45e.png?v8",
    "shopping": "unicode/1f6cd.png?v8",
    "shopping_cart": "unicode/1f6d2.png?v8",
    "shorts": "unicode/1fa73.png?v8",
    "shower": "unicode/1f6bf.png?v8",
    "shrimp": "unicode/1f990.png?v8",
    "shrug": "unicode/1f937.png?v8",
    "shushing_face": "unicode/1f92b.png?v8",
    "sierra_leone": "unicode/1f1f8-1f1f1.png?v8",
    "signal_strength": "unicode/1f4f6.png?v8",
    "singapore": "unicode/1f1f8-1f1ec.png?v8",
    "singer": "unicode/1f9d1-1f3a4.png?v8",
    "sint_maarten": "unicode/1f1f8-1f1fd.png?v8",
    "six": "unicode/0036-20e3.png?v8",
    "six_pointed_star": "unicode/1f52f.png?v8",
    "skateboard": "unicode/1f6f9.png?v8",
    "ski": "unicode/1f3bf.png?v8",
    "skier": "unicode/26f7.png?v8",
    "skull": "unicode/1f480.png?v8",
    "skull_and_crossbones": "unicode/2620.png?v8",
    "skunk": "unicode/1f9a8.png?v8",
    "sled": "unicode/1f6f7.png?v8",
    "sleeping": "unicode/1f634.png?v8",
    "sleeping_bed": "unicode/1f6cc.png?v8",
    "sleepy": "unicode/1f62a.png?v8",
    "slightly_frowning_face": "unicode/1f641.png?v8",
    "slightly_smiling_face": "unicode/1f642.png?v8",
    "slot_machine": "unicode/1f3b0.png?v8",
    "sloth": "unicode/1f9a5.png?v8",
    "slovakia": "unicode/1f1f8-1f1f0.png?v8",
    "slovenia": "unicode/1f1f8-1f1ee.png?v8",
    "small_airplane": "unicode/1f6e9.png?v8",
    "small_blue_diamond": "unicode/1f539.png?v8",
    "small_orange_diamond": "unicode/1f538.png?v8",
    "small_red_triangle": "unicode/1f53a.png?v8",
    "small_red_triangle_down": "unicode/1f53b.png?v8",
    "smile": "unicode/1f604.png?v8",
    "smile_cat": "unicode/1f638.png?v8",
    "smiley": "unicode/1f603.png?v8",
    "smiley_cat": "unicode/1f63a.png?v8",
    "smiling_face_with_tear": "unicode/1f972.png?v8",
    "smiling_face_with_three_hearts": "unicode/1f970.png?v8",
    "smiling_imp": "unicode/1f608.png?v8",
    "smirk": "unicode/1f60f.png?v8",
    "smirk_cat": "unicode/1f63c.png?v8",
    "smoking": "unicode/1f6ac.png?v8",
    "snail": "unicode/1f40c.png?v8",
    "snake": "unicode/1f40d.png?v8",
    "sneezing_face": "unicode/1f927.png?v8",
    "snowboarder": "unicode/1f3c2.png?v8",
    "snowflake": "unicode/2744.png?v8",
    "snowman": "unicode/26c4.png?v8",
    "snowman_with_snow": "unicode/2603.png?v8",
    "soap": "unicode/1f9fc.png?v8",
    "sob": "unicode/1f62d.png?v8",
    "soccer": "unicode/26bd.png?v8",
    "socks": "unicode/1f9e6.png?v8",
    "softball": "unicode/1f94e.png?v8",
    "solomon_islands": "unicode/1f1f8-1f1e7.png?v8",
    "somalia": "unicode/1f1f8-1f1f4.png?v8",
    "soon": "unicode/1f51c.png?v8",
    "sos": "unicode/1f198.png?v8",
    "sound": "unicode/1f509.png?v8",
    "south_africa": "unicode/1f1ff-1f1e6.png?v8",
    "south_georgia_south_sandwich_islands": "unicode/1f1ec-1f1f8.png?v8",
    "south_sudan": "unicode/1f1f8-1f1f8.png?v8",
    "space_invader": "unicode/1f47e.png?v8",
    "spades": "unicode/2660.png?v8",
    "spaghetti": "unicode/1f35d.png?v8",
    "sparkle": "unicode/2747.png?v8",
    "sparkler": "unicode/1f387.png?v8",
    "sparkles": "unicode/2728.png?v8",
    "sparkling_heart": "unicode/1f496.png?v8",
    "speak_no_evil": "unicode/1f64a.png?v8",
    "speaker": "unicode/1f508.png?v8",
    "speaking_head": "unicode/1f5e3.png?v8",
    "speech_balloon": "unicode/1f4ac.png?v8",
    "speedboat": "unicode/1f6a4.png?v8",
    "spider": "unicode/1f577.png?v8",
    "spider_web": "unicode/1f578.png?v8",
    "spiral_calendar": "unicode/1f5d3.png?v8",
    "spiral_notepad": "unicode/1f5d2.png?v8",
    "sponge": "unicode/1f9fd.png?v8",
    "spoon": "unicode/1f944.png?v8",
    "squid": "unicode/1f991.png?v8",
    "sri_lanka": "unicode/1f1f1-1f1f0.png?v8",
    "st_barthelemy": "unicode/1f1e7-1f1f1.png?v8",
    "st_helena": "unicode/1f1f8-1f1ed.png?v8",
    "st_kitts_nevis": "unicode/1f1f0-1f1f3.png?v8",
    "st_lucia": "unicode/1f1f1-1f1e8.png?v8",
    "st_martin": "unicode/1f1f2-1f1eb.png?v8",
    "st_pierre_miquelon": "unicode/1f1f5-1f1f2.png?v8",
    "st_vincent_grenadines": "unicode/1f1fb-1f1e8.png?v8",
    "stadium": "unicode/1f3df.png?v8",
    "standing_man": "unicode/1f9cd-2642.png?v8",
    "standing_person": "unicode/1f9cd.png?v8",
    "standing_woman": "unicode/1f9cd-2640.png?v8",
    "star": "unicode/2b50.png?v8",
    "star2": "unicode/1f31f.png?v8",
    "star_and_crescent": "unicode/262a.png?v8",
    "star_of_david": "unicode/2721.png?v8",
    "star_struck": "unicode/1f929.png?v8",
    "stars": "unicode/1f320.png?v8",
    "station": "unicode/1f689.png?v8",
    "statue_of_liberty": "unicode/1f5fd.png?v8",
    "steam_locomotive": "unicode/1f682.png?v8",
    "stethoscope": "unicode/1fa7a.png?v8",
    "stew": "unicode/1f372.png?v8",
    "stop_button": "unicode/23f9.png?v8",
    "stop_sign": "unicode/1f6d1.png?v8",
    "stopwatch": "unicode/23f1.png?v8",
    "straight_ruler": "unicode/1f4cf.png?v8",
    "strawberry": "unicode/1f353.png?v8",
    "stuck_out_tongue": "unicode/1f61b.png?v8",
    "stuck_out_tongue_closed_eyes": "unicode/1f61d.png?v8",
    "stuck_out_tongue_winking_eye": "unicode/1f61c.png?v8",
    "student": "unicode/1f9d1-1f393.png?v8",
    "studio_microphone": "unicode/1f399.png?v8",
    "stuffed_flatbread": "unicode/1f959.png?v8",
    "sudan": "unicode/1f1f8-1f1e9.png?v8",
    "sun_behind_large_cloud": "unicode/1f325.png?v8",
    "sun_behind_rain_cloud": "unicode/1f326.png?v8",
    "sun_behind_small_cloud": "unicode/1f324.png?v8",
    "sun_with_face": "unicode/1f31e.png?v8",
    "sunflower": "unicode/1f33b.png?v8",
    "sunglasses": "unicode/1f60e.png?v8",
    "sunny": "unicode/2600.png?v8",
    "sunrise": "unicode/1f305.png?v8",
    "sunrise_over_mountains": "unicode/1f304.png?v8",
    "superhero": "unicode/1f9b8.png?v8",
    "superhero_man": "unicode/1f9b8-2642.png?v8",
    "superhero_woman": "unicode/1f9b8-2640.png?v8",
    "supervillain": "unicode/1f9b9.png?v8",
    "supervillain_man": "unicode/1f9b9-2642.png?v8",
    "supervillain_woman": "unicode/1f9b9-2640.png?v8",
    "surfer": "unicode/1f3c4.png?v8",
    "surfing_man": "unicode/1f3c4-2642.png?v8",
    "surfing_woman": "unicode/1f3c4-2640.png?v8",
    "suriname": "unicode/1f1f8-1f1f7.png?v8",
    "sushi": "unicode/1f363.png?v8",
    "suspect": "suspect.png?v8",
    "suspension_railway": "unicode/1f69f.png?v8",
    "svalbard_jan_mayen": "unicode/1f1f8-1f1ef.png?v8",
    "swan": "unicode/1f9a2.png?v8",
    "swaziland": "unicode/1f1f8-1f1ff.png?v8",
    "sweat": "unicode/1f613.png?v8",
    "sweat_drops": "unicode/1f4a6.png?v8",
    "sweat_smile": "unicode/1f605.png?v8",
    "sweden": "unicode/1f1f8-1f1ea.png?v8",
    "sweet_potato": "unicode/1f360.png?v8",
    "swim_brief": "unicode/1fa72.png?v8",
    "swimmer": "unicode/1f3ca.png?v8",
    "swimming_man": "unicode/1f3ca-2642.png?v8",
    "swimming_woman": "unicode/1f3ca-2640.png?v8",
    "switzerland": "unicode/1f1e8-1f1ed.png?v8",
    "symbols": "unicode/1f523.png?v8",
    "synagogue": "unicode/1f54d.png?v8",
    "syria": "unicode/1f1f8-1f1fe.png?v8",
    "syringe": "unicode/1f489.png?v8",
    "t-rex": "unicode/1f996.png?v8",
    "taco": "unicode/1f32e.png?v8",
    "tada": "unicode/1f389.png?v8",
    "taiwan": "unicode/1f1f9-1f1fc.png?v8",
    "tajikistan": "unicode/1f1f9-1f1ef.png?v8",
    "takeout_box": "unicode/1f961.png?v8",
    "tamale": "unicode/1fad4.png?v8",
    "tanabata_tree": "unicode/1f38b.png?v8",
    "tangerine": "unicode/1f34a.png?v8",
    "tanzania": "unicode/1f1f9-1f1ff.png?v8",
    "taurus": "unicode/2649.png?v8",
    "taxi": "unicode/1f695.png?v8",
    "tea": "unicode/1f375.png?v8",
    "teacher": "unicode/1f9d1-1f3eb.png?v8",
    "teapot": "unicode/1fad6.png?v8",
    "technologist": "unicode/1f9d1-1f4bb.png?v8",
    "teddy_bear": "unicode/1f9f8.png?v8",
    "telephone": "unicode/260e.png?v8",
    "telephone_receiver": "unicode/1f4de.png?v8",
    "telescope": "unicode/1f52d.png?v8",
    "tennis": "unicode/1f3be.png?v8",
    "tent": "unicode/26fa.png?v8",
    "test_tube": "unicode/1f9ea.png?v8",
    "thailand": "unicode/1f1f9-1f1ed.png?v8",
    "thermometer": "unicode/1f321.png?v8",
    "thinking": "unicode/1f914.png?v8",
    "thong_sandal": "unicode/1fa74.png?v8",
    "thought_balloon": "unicode/1f4ad.png?v8",
    "thread": "unicode/1f9f5.png?v8",
    "three": "unicode/0033-20e3.png?v8",
    "thumbsdown": "unicode/1f44e.png?v8",
    "thumbsup": "unicode/1f44d.png?v8",
    "ticket": "unicode/1f3ab.png?v8",
    "tickets": "unicode/1f39f.png?v8",
    "tiger": "unicode/1f42f.png?v8",
    "tiger2": "unicode/1f405.png?v8",
    "timer_clock": "unicode/23f2.png?v8",
    "timor_leste": "unicode/1f1f9-1f1f1.png?v8",
    "tipping_hand_man": "unicode/1f481-2642.png?v8",
    "tipping_hand_person": "unicode/1f481.png?v8",
    "tipping_hand_woman": "unicode/1f481-2640.png?v8",
    "tired_face": "unicode/1f62b.png?v8",
    "tm": "unicode/2122.png?v8",
    "togo": "unicode/1f1f9-1f1ec.png?v8",
    "toilet": "unicode/1f6bd.png?v8",
    "tokelau": "unicode/1f1f9-1f1f0.png?v8",
    "tokyo_tower": "unicode/1f5fc.png?v8",
    "tomato": "unicode/1f345.png?v8",
    "tonga": "unicode/1f1f9-1f1f4.png?v8",
    "tongue": "unicode/1f445.png?v8",
    "toolbox": "unicode/1f9f0.png?v8",
    "tooth": "unicode/1f9b7.png?v8",
    "toothbrush": "unicode/1faa5.png?v8",
    "top": "unicode/1f51d.png?v8",
    "tophat": "unicode/1f3a9.png?v8",
    "tornado": "unicode/1f32a.png?v8",
    "tr": "unicode/1f1f9-1f1f7.png?v8",
    "trackball": "unicode/1f5b2.png?v8",
    "tractor": "unicode/1f69c.png?v8",
    "traffic_light": "unicode/1f6a5.png?v8",
    "train": "unicode/1f68b.png?v8",
    "train2": "unicode/1f686.png?v8",
    "tram": "unicode/1f68a.png?v8",
    "transgender_flag": "unicode/1f3f3-26a7.png?v8",
    "transgender_symbol": "unicode/26a7.png?v8",
    "triangular_flag_on_post": "unicode/1f6a9.png?v8",
    "triangular_ruler": "unicode/1f4d0.png?v8",
    "trident": "unicode/1f531.png?v8",
    "trinidad_tobago": "unicode/1f1f9-1f1f9.png?v8",
    "tristan_da_cunha": "unicode/1f1f9-1f1e6.png?v8",
    "triumph": "unicode/1f624.png?v8",
    "trolleybus": "unicode/1f68e.png?v8",
    "trollface": "trollface.png?v8",
    "trophy": "unicode/1f3c6.png?v8",
    "tropical_drink": "unicode/1f379.png?v8",
    "tropical_fish": "unicode/1f420.png?v8",
    "truck": "unicode/1f69a.png?v8",
    "trumpet": "unicode/1f3ba.png?v8",
    "tshirt": "unicode/1f455.png?v8",
    "tulip": "unicode/1f337.png?v8",
    "tumbler_glass": "unicode/1f943.png?v8",
    "tunisia": "unicode/1f1f9-1f1f3.png?v8",
    "turkey": "unicode/1f983.png?v8",
    "turkmenistan": "unicode/1f1f9-1f1f2.png?v8",
    "turks_caicos_islands": "unicode/1f1f9-1f1e8.png?v8",
    "turtle": "unicode/1f422.png?v8",
    "tuvalu": "unicode/1f1f9-1f1fb.png?v8",
    "tv": "unicode/1f4fa.png?v8",
    "twisted_rightwards_arrows": "unicode/1f500.png?v8",
    "two": "unicode/0032-20e3.png?v8",
    "two_hearts": "unicode/1f495.png?v8",
    "two_men_holding_hands": "unicode/1f46c.png?v8",
    "two_women_holding_hands": "unicode/1f46d.png?v8",
    "u5272": "unicode/1f239.png?v8",
    "u5408": "unicode/1f234.png?v8",
    "u55b6": "unicode/1f23a.png?v8",
    "u6307": "unicode/1f22f.png?v8",
    "u6708": "unicode/1f237.png?v8",
    "u6709": "unicode/1f236.png?v8",
    "u6e80": "unicode/1f235.png?v8",
    "u7121": "unicode/1f21a.png?v8",
    "u7533": "unicode/1f238.png?v8",
    "u7981": "unicode/1f232.png?v8",
    "u7a7a": "unicode/1f233.png?v8",
    "uganda": "unicode/1f1fa-1f1ec.png?v8",
    "uk": "unicode/1f1ec-1f1e7.png?v8",
    "ukraine": "unicode/1f1fa-1f1e6.png?v8",
    "umbrella": "unicode/2614.png?v8",
    "unamused": "unicode/1f612.png?v8",
    "underage": "unicode/1f51e.png?v8",
    "unicorn": "unicode/1f984.png?v8",
    "united_arab_emirates": "unicode/1f1e6-1f1ea.png?v8",
    "united_nations": "unicode/1f1fa-1f1f3.png?v8",
    "unlock": "unicode/1f513.png?v8",
    "up": "unicode/1f199.png?v8",
    "upside_down_face": "unicode/1f643.png?v8",
    "uruguay": "unicode/1f1fa-1f1fe.png?v8",
    "us": "unicode/1f1fa-1f1f8.png?v8",
    "us_outlying_islands": "unicode/1f1fa-1f1f2.png?v8",
    "us_virgin_islands": "unicode/1f1fb-1f1ee.png?v8",
    "uzbekistan": "unicode/1f1fa-1f1ff.png?v8",
    "v": "unicode/270c.png?v8",
    "vampire": "unicode/1f9db.png?v8",
    "vampire_man": "unicode/1f9db-2642.png?v8",
    "vampire_woman": "unicode/1f9db-2640.png?v8",
    "vanuatu": "unicode/1f1fb-1f1fa.png?v8",
    "vatican_city": "unicode/1f1fb-1f1e6.png?v8",
    "venezuela": "unicode/1f1fb-1f1ea.png?v8",
    "vertical_traffic_light": "unicode/1f6a6.png?v8",
    "vhs": "unicode/1f4fc.png?v8",
    "vibration_mode": "unicode/1f4f3.png?v8",
    "video_camera": "unicode/1f4f9.png?v8",
    "video_game": "unicode/1f3ae.png?v8",
    "vietnam": "unicode/1f1fb-1f1f3.png?v8",
    "violin": "unicode/1f3bb.png?v8",
    "virgo": "unicode/264d.png?v8",
    "volcano": "unicode/1f30b.png?v8",
    "volleyball": "unicode/1f3d0.png?v8",
    "vomiting_face": "unicode/1f92e.png?v8",
    "vs": "unicode/1f19a.png?v8",
    "vulcan_salute": "unicode/1f596.png?v8",
    "waffle": "unicode/1f9c7.png?v8",
    "wales": "unicode/1f3f4-e0067-e0062-e0077-e006c-e0073-e007f.png?v8",
    "walking": "unicode/1f6b6.png?v8",
    "walking_man": "unicode/1f6b6-2642.png?v8",
    "walking_woman": "unicode/1f6b6-2640.png?v8",
    "wallis_futuna": "unicode/1f1fc-1f1eb.png?v8",
    "waning_crescent_moon": "unicode/1f318.png?v8",
    "waning_gibbous_moon": "unicode/1f316.png?v8",
    "warning": "unicode/26a0.png?v8",
    "wastebasket": "unicode/1f5d1.png?v8",
    "watch": "unicode/231a.png?v8",
    "water_buffalo": "unicode/1f403.png?v8",
    "water_polo": "unicode/1f93d.png?v8",
    "watermelon": "unicode/1f349.png?v8",
    "wave": "unicode/1f44b.png?v8",
    "wavy_dash": "unicode/3030.png?v8",
    "waxing_crescent_moon": "unicode/1f312.png?v8",
    "waxing_gibbous_moon": "unicode/1f314.png?v8",
    "wc": "unicode/1f6be.png?v8",
    "weary": "unicode/1f629.png?v8",
    "wedding": "unicode/1f492.png?v8",
    "weight_lifting": "unicode/1f3cb.png?v8",
    "weight_lifting_man": "unicode/1f3cb-2642.png?v8",
    "weight_lifting_woman": "unicode/1f3cb-2640.png?v8",
    "western_sahara": "unicode/1f1ea-1f1ed.png?v8",
    "whale": "unicode/1f433.png?v8",
    "whale2": "unicode/1f40b.png?v8",
    "wheel_of_dharma": "unicode/2638.png?v8",
    "wheelchair": "unicode/267f.png?v8",
    "white_check_mark": "unicode/2705.png?v8",
    "white_circle": "unicode/26aa.png?v8",
    "white_flag": "unicode/1f3f3.png?v8",
    "white_flower": "unicode/1f4ae.png?v8",
    "white_haired_man": "unicode/1f468-1f9b3.png?v8",
    "white_haired_woman": "unicode/1f469-1f9b3.png?v8",
    "white_heart": "unicode/1f90d.png?v8",
    "white_large_square": "unicode/2b1c.png?v8",
    "white_medium_small_square": "unicode/25fd.png?v8",
    "white_medium_square": "unicode/25fb.png?v8",
    "white_small_square": "unicode/25ab.png?v8",
    "white_square_button": "unicode/1f533.png?v8",
    "wilted_flower": "unicode/1f940.png?v8",
    "wind_chime": "unicode/1f390.png?v8",
    "wind_face": "unicode/1f32c.png?v8",
    "window": "unicode/1fa9f.png?v8",
    "wine_glass": "unicode/1f377.png?v8",
    "wink": "unicode/1f609.png?v8",
    "wolf": "unicode/1f43a.png?v8",
    "woman": "unicode/1f469.png?v8",
    "woman_artist": "unicode/1f469-1f3a8.png?v8",
    "woman_astronaut": "unicode/1f469-1f680.png?v8",
    "woman_beard": "unicode/1f9d4-2640.png?v8",
    "woman_cartwheeling": "unicode/1f938-2640.png?v8",
    "woman_cook": "unicode/1f469-1f373.png?v8",
    "woman_dancing": "unicode/1f483.png?v8",
    "woman_facepalming": "unicode/1f926-2640.png?v8",
    "woman_factory_worker": "unicode/1f469-1f3ed.png?v8",
    "woman_farmer": "unicode/1f469-1f33e.png?v8",
    "woman_feeding_baby": "unicode/1f469-1f37c.png?v8",
    "woman_firefighter": "unicode/1f469-1f692.png?v8",
    "woman_health_worker": "unicode/1f469-2695.png?v8",
    "woman_in_manual_wheelchair": "unicode/1f469-1f9bd.png?v8",
    "woman_in_motorized_wheelchair": "unicode/1f469-1f9bc.png?v8",
    "woman_in_tuxedo": "unicode/1f935-2640.png?v8",
    "woman_judge": "unicode/1f469-2696.png?v8",
    "woman_juggling": "unicode/1f939-2640.png?v8",
    "woman_mechanic": "unicode/1f469-1f527.png?v8",
    "woman_office_worker": "unicode/1f469-1f4bc.png?v8",
    "woman_pilot": "unicode/1f469-2708.png?v8",
    "woman_playing_handball": "unicode/1f93e-2640.png?v8",
    "woman_playing_water_polo": "unicode/1f93d-2640.png?v8",
    "woman_scientist": "unicode/1f469-1f52c.png?v8",
    "woman_shrugging": "unicode/1f937-2640.png?v8",
    "woman_singer": "unicode/1f469-1f3a4.png?v8",
    "woman_student": "unicode/1f469-1f393.png?v8",
    "woman_teacher": "unicode/1f469-1f3eb.png?v8",
    "woman_technologist": "unicode/1f469-1f4bb.png?v8",
    "woman_with_headscarf": "unicode/1f9d5.png?v8",
    "woman_with_probing_cane": "unicode/1f469-1f9af.png?v8",
    "woman_with_turban": "unicode/1f473-2640.png?v8",
    "woman_with_veil": "unicode/1f470-2640.png?v8",
    "womans_clothes": "unicode/1f45a.png?v8",
    "womans_hat": "unicode/1f452.png?v8",
    "women_wrestling": "unicode/1f93c-2640.png?v8",
    "womens": "unicode/1f6ba.png?v8",
    "wood": "unicode/1fab5.png?v8",
    "woozy_face": "unicode/1f974.png?v8",
    "world_map": "unicode/1f5fa.png?v8",
    "worm": "unicode/1fab1.png?v8",
    "worried": "unicode/1f61f.png?v8",
    "wrench": "unicode/1f527.png?v8",
    "wrestling": "unicode/1f93c.png?v8",
    "writing_hand": "unicode/270d.png?v8",
    "x": "unicode/274c.png?v8",
    "yarn": "unicode/1f9f6.png?v8",
    "yawning_face": "unicode/1f971.png?v8",
    "yellow_circle": "unicode/1f7e1.png?v8",
    "yellow_heart": "unicode/1f49b.png?v8",
    "yellow_square": "unicode/1f7e8.png?v8",
    "yemen": "unicode/1f1fe-1f1ea.png?v8",
    "yen": "unicode/1f4b4.png?v8",
    "yin_yang": "unicode/262f.png?v8",
    "yo_yo": "unicode/1fa80.png?v8",
    "yum": "unicode/1f60b.png?v8",
    "zambia": "unicode/1f1ff-1f1f2.png?v8",
    "zany_face": "unicode/1f92a.png?v8",
    "zap": "unicode/26a1.png?v8",
    "zebra": "unicode/1f993.png?v8",
    "zero": "unicode/0030-20e3.png?v8",
    "zimbabwe": "unicode/1f1ff-1f1fc.png?v8",
    "zipper_mouth_face": "unicode/1f910.png?v8",
    "zombie": "unicode/1f9df.png?v8",
    "zombie_man": "unicode/1f9df-2642.png?v8",
    "zombie_woman": "unicode/1f9df-2640.png?v8",
    "zzz": "unicode/1f4a4.png?v8"
  }
};

function replaceEmojiShorthand(m, $1, useNativeEmoji) {
  var emojiMatch = emojiData.data[$1];

  var result = m;

  if (emojiMatch) {
    if (useNativeEmoji && /unicode/.test(emojiMatch)) {
      var emojiUnicode = emojiMatch
        .replace('unicode/', '')
        .replace(/\.png.*/, '')
        .split('-')
        .map(function (u) { return ("&#x" + u + ";"); })
        // Separate multi-character emoji with zero width joiner sequence (ZWJ)
        // Hat tip: https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/#emoji-made-up-of-multiple-characters
        .join('&zwj;')
        .concat('&#xFE0E;');
      result = "<span class=\"emoji\">" + emojiUnicode + "</span>";
    } else {
      result = "<img src=\"" + (emojiData.baseURL) + emojiMatch + ".png\" alt=\"" + $1 + "\" class=\"emoji\" loading=\"lazy\">";
    }
  }

  return result;
}

function emojify(text, useNativeEmoji) {
  return (
    text
      // Mark colons in tags
      .replace(
        /<(code|pre|script|template)[^>]*?>[\s\S]+?<\/(code|pre|script|template)>/g,
        function (m) { return m.replace(/:/g, '__colon__'); }
      )
      // Mark colons in comments
      .replace(/<!--[\s\S]+?-->/g, function (m) { return m.replace(/:/g, '__colon__'); })
      // Replace emoji shorthand codes
      .replace(/:([a-z0-9_\-+]+?):/g, function (m, $1) { return replaceEmojiShorthand(m, $1, useNativeEmoji); }
      )
      // Restore colons in tags and comments
      .replace(/__colon__/g, ':')
  );
}

/**
 * Converts a colon formatted string to a object with properties.
 *
 * This is process a provided string and look for any tokens in the format
 * of `:name[=value]` and then convert it to a object and return.
 * An example of this is ':include :type=code :fragment=demo' is taken and
 * then converted to:
 *
 * ```
 * {
 *  include: '',
 *  type: 'code',
 *  fragment: 'demo'
 * }
 * ```
 *
 * @param {string}   str   The string to parse.
 *
 * @return {object}  The original string and parsed object, { str, config }.
 */
function getAndRemoveConfig(str) {
  if ( str === void 0 ) str = '';

  var config = {};

  if (str) {
    str = str
      .replace(/^('|")/, '')
      .replace(/('|")$/, '')
      .replace(/(?:^|\s):([\w-]+:?)=?([\w-%]+)?/g, function (m, key, value) {
        if (key.indexOf(':') === -1) {
          config[key] = (value && value.replace(/&quot;/g, '')) || true;
          return '';
        }

        return m;
      })
      .trim();
  }

  return { str: str, config: config };
}

/**
 * Remove the <a> tag from sidebar when the header with link, details see issue 1069
 * @param {string}   str   The string to deal with.
 *
 * @return {string}   str   The string after delete the <a> element.
 */
function removeAtag(str) {
  if ( str === void 0 ) str = '';

  return str.replace(/(<\/?a.*?>)/gi, '');
}

var imageCompiler = function (ref) {
    var renderer = ref.renderer;
    var contentBase = ref.contentBase;
    var router = ref.router;

    return (renderer.image = function (href, title, text) {
    var url = href;
    var attrs = [];

    var ref = getAndRemoveConfig(title);
    var str = ref.str;
    var config = ref.config;
    title = str;

    if (config['no-zoom']) {
      attrs.push('data-no-zoom');
    }

    if (title) {
      attrs.push(("title=\"" + title + "\""));
    }

    if (config.size) {
      var ref$1 = config.size.split('x');
      var width = ref$1[0];
      var height = ref$1[1];
      if (height) {
        attrs.push(("width=\"" + width + "\" height=\"" + height + "\""));
      } else {
        attrs.push(("width=\"" + width + "\""));
      }
    }

    if (config.class) {
      attrs.push(("class=\"" + (config.class) + "\""));
    }

    if (config.id) {
      attrs.push(("id=\"" + (config.id) + "\""));
    }

    if (!isAbsolutePath(href)) {
      url = getPath(contentBase, getParentPath(router.getCurrentPath()), href);
    }

    if (attrs.length > 0) {
      return ("<img src=\"" + url + "\" data-origin=\"" + href + "\" alt=\"" + text + "\" " + (attrs.join(
        ' '
      )) + " />");
    }

    return ("<img src=\"" + url + "\" data-origin=\"" + href + "\" alt=\"" + text + "\"" + attrs + ">");
  });
};

var highlightCodeCompiler = function (ref) {
    var renderer = ref.renderer;

    return (renderer.code = function (code, lang) {
    if ( lang === void 0 ) lang = 'markup';

    var langOrMarkup = Prism.languages[lang] || Prism.languages.markup;
    var text = Prism.highlight(
      code.replace(/@DOCSIFY_QM@/g, '`'),
      langOrMarkup,
      lang
    );

    return ("<pre v-pre data-lang=\"" + lang + "\"><code class=\"lang-" + lang + "\">" + text + "</code></pre>");
  });
};

var paragraphCompiler = function (ref) {
    var renderer = ref.renderer;

    return (renderer.paragraph = function (text) {
    var result;
    if (/^!&gt;/.test(text)) {
      result = helper('tip', text);
    } else if (/^\?&gt;/.test(text)) {
      result = helper('warn', text);
    } else {
      result = "<p>" + text + "</p>";
    }

    return result;
  });
};

var taskListCompiler = function (ref) {
    var renderer = ref.renderer;

    return (renderer.list = function (body, ordered, start) {
    var isTaskList = /<li class="task-list-item">/.test(
      body.split('class="task-list"')[0]
    );
    var isStartReq = start && start > 1;
    var tag = ordered ? 'ol' : 'ul';
    var tagAttrs = [
      isTaskList ? 'class="task-list"' : '',
      isStartReq ? ("start=\"" + start + "\"") : '' ]
      .join(' ')
      .trim();

    return ("<" + tag + " " + tagAttrs + ">" + body + "</" + tag + ">");
  });
};

var taskListItemCompiler = function (ref) {
    var renderer = ref.renderer;

    return (renderer.listitem = function (text) {
    var isTaskItem = /^(<input.*type="checkbox"[^>]*>)/.test(text);
    var html = isTaskItem
      ? ("<li class=\"task-list-item\"><label>" + text + "</label></li>")
      : ("<li>" + text + "</li>");

    return html;
  });
};

var linkCompiler = function (ref) {
    var renderer = ref.renderer;
    var router = ref.router;
    var linkTarget = ref.linkTarget;
    var linkRel = ref.linkRel;
    var compilerClass = ref.compilerClass;

    return (renderer.link = function (href, title, text) {
    if ( title === void 0 ) title = '';

    var attrs = [];
    var ref = getAndRemoveConfig(title);
    var str = ref.str;
    var config = ref.config;
    linkTarget = config.target || linkTarget;
    linkRel =
      linkTarget === '_blank'
        ? compilerClass.config.externalLinkRel || 'noopener'
        : '';
    title = str;

    if (
      !isAbsolutePath(href) &&
      !compilerClass._matchNotCompileLink(href) &&
      !config.ignore
    ) {
      if (href === compilerClass.config.homepage) {
        href = 'README';
      }

      href = router.toURL(href, null, router.getCurrentPath());
    } else {
      if (!isAbsolutePath(href) && href.slice(0, 2) === './') {
        href =
          document.URL.replace(/\/(?!.*\/).*/, '/').replace('#/./', '') + href;
      }
      attrs.push(href.indexOf('mailto:') === 0 ? '' : ("target=\"" + linkTarget + "\""));
      attrs.push(
        href.indexOf('mailto:') === 0
          ? ''
          : linkRel !== ''
          ? (" rel=\"" + linkRel + "\"")
          : ''
      );
    }

    // special case to check crossorigin urls
    if (
      config.crossorgin &&
      linkTarget === '_self' &&
      compilerClass.config.routerMode === 'history'
    ) {
      if (compilerClass.config.crossOriginLinks.indexOf(href) === -1) {
        compilerClass.config.crossOriginLinks.push(href);
      }
    }

    if (config.disabled) {
      attrs.push('disabled');
      href = 'javascript:void(0)';
    }

    if (config.class) {
      attrs.push(("class=\"" + (config.class) + "\""));
    }

    if (config.id) {
      attrs.push(("id=\"" + (config.id) + "\""));
    }

    if (title) {
      attrs.push(("title=\"" + title + "\""));
    }

    return ("<a href=\"" + href + "\" " + (attrs.join(' ')) + ">" + text + "</a>");
  });
};

var cachedLinks = {};

var compileMedia = {
  markdown: function markdown(url) {
    return {
      url: url,
    };
  },
  mermaid: function mermaid(url) {
    return {
      url: url,
    };
  },
  iframe: function iframe(url, title) {
    return {
      html: ("<iframe src=\"" + url + "\" " + (title || 'width=100% height=400') + "></iframe>"),
    };
  },
  video: function video(url, title) {
    return {
      html: ("<video src=\"" + url + "\" " + (title || 'controls') + ">Not Support</video>"),
    };
  },
  audio: function audio(url, title) {
    return {
      html: ("<audio src=\"" + url + "\" " + (title || 'controls') + ">Not Support</audio>"),
    };
  },
  code: function code(url, title) {
    var lang = url.match(/\.(\w+)$/);

    lang = title || (lang && lang[1]);
    if (lang === 'md') {
      lang = 'markdown';
    }

    return {
      url: url,
      lang: lang,
    };
  },
};

var Compiler = function Compiler(config, router) {
  var this$1 = this;

  this.config = config;
  this.router = router;
  this.cacheTree = {};
  this.toc = [];
  this.cacheTOC = {};
  this.linkTarget = config.externalLinkTarget || '_blank';
  this.linkRel =
    this.linkTarget === '_blank' ? config.externalLinkRel || 'noopener' : '';
  this.contentBase = router.getBasePath();

  var renderer = this._initRenderer();
  this.heading = renderer.heading;
  var compile;
  var mdConf = config.markdown || {};

  if (isFn(mdConf)) {
    compile = mdConf(marked, renderer);
  } else {
    marked.setOptions(
      merge(mdConf, {
        renderer: merge(renderer, mdConf.renderer),
      })
    );
    compile = marked;
  }

  this._marked = compile;
  this.compile = function (text) {
    var isCached = true;
    // eslint-disable-next-line no-unused-vars
    var result = cached(function (_) {
      isCached = false;
      var html = '';

      if (!text) {
        return text;
      }

      if (isPrimitive(text)) {
        html = compile(text);
      } else {
        html = compile.parser(text);
      }

      html = config.noEmoji ? html : emojify(html, config.nativeEmoji);
      slugify.clear();

      return html;
    })(text);

    var curFileName = this$1.router.parse().file;

    if (isCached) {
      this$1.toc = this$1.cacheTOC[curFileName];
    } else {
      this$1.cacheTOC[curFileName] = [].concat( this$1.toc );
    }

    return result;
  };
};

/**
 * Pulls content from file and renders inline on the page as a embedded item.
 *
 * This allows you to embed different file types on the returned
 * page.
 * The basic format is:
 * ```
 * [filename](_media/example.md ':include')
 * ```
 *
 * @param {string} href The href to the file to embed in the page.
 * @param {string} titleTitle of the link used to make the embed.
 *
 * @return {type} Return value description.
 */
Compiler.prototype.compileEmbed = function compileEmbed (href, title) {
  var ref = getAndRemoveConfig(title);
    var str = ref.str;
    var config = ref.config;
  var embed;
  title = str;

  if (config.include) {
    if (!isAbsolutePath(href)) {
      href = getPath(
         '' ,
        getParentPath(this.router.getCurrentPath()),
        href
      );
    }

    var media;
    if (config.type && (media = compileMedia[config.type])) {
      embed = media.call(this, href, title);
      embed.type = config.type;
    } else {
      var type = 'code';
      if (/\.(md|markdown)/.test(href)) {
        type = 'markdown';
      } else if (/\.mmd/.test(href)) {
        type = 'mermaid';
      } else if (/\.html?/.test(href)) {
        type = 'iframe';
      } else if (/\.(mp4|ogg)/.test(href)) {
        type = 'video';
      } else if (/\.mp3/.test(href)) {
        type = 'audio';
      }

      embed = compileMedia[type].call(this, href, title);
      embed.type = type;
    }

    embed.fragment = config.fragment;

    return embed;
  }
};

Compiler.prototype._matchNotCompileLink = function _matchNotCompileLink (link) {
  var links = this.config.noCompileLinks || [];

  for (var i = 0; i < links.length; i++) {
    var n = links[i];
    var re = cachedLinks[n] || (cachedLinks[n] = new RegExp(("^" + n + "$")));

    if (re.test(link)) {
      return link;
    }
  }
};

Compiler.prototype._initRenderer = function _initRenderer () {
  var renderer = new marked.Renderer();
  var ref = this;
    var linkTarget = ref.linkTarget;
    var linkRel = ref.linkRel;
    var router = ref.router;
    var contentBase = ref.contentBase;
  var _self = this;
  var origin = {};

  /**
   * Render anchor tag
   * @link https://github.com/markedjs/marked#overriding-renderer-methods
   * @param {String} text Text content
   * @param {Number} level Type of heading (h<level> tag)
   * @returns {String} Heading element
   */
  origin.heading = renderer.heading = function (text, level) {
    var ref = getAndRemoveConfig(text);
      var str = ref.str;
      var config = ref.config;
    var nextToc = { level: level, title: removeAtag(str) };

    if (/<!-- {docsify-ignore} -->/g.test(str)) {
      str = str.replace('<!-- {docsify-ignore} -->', '');
      nextToc.title = removeAtag(str);
      nextToc.ignoreSubHeading = true;
    }

    if (/{docsify-ignore}/g.test(str)) {
      str = str.replace('{docsify-ignore}', '');
      nextToc.title = removeAtag(str);
      nextToc.ignoreSubHeading = true;
    }

    if (/<!-- {docsify-ignore-all} -->/g.test(str)) {
      str = str.replace('<!-- {docsify-ignore-all} -->', '');
      nextToc.title = removeAtag(str);
      nextToc.ignoreAllSubs = true;
    }

    if (/{docsify-ignore-all}/g.test(str)) {
      str = str.replace('{docsify-ignore-all}', '');
      nextToc.title = removeAtag(str);
      nextToc.ignoreAllSubs = true;
    }

    var slug = slugify(config.id || str);
    var url = router.toURL(router.getCurrentPath(), { id: slug });
    nextToc.slug = url;
    _self.toc.push(nextToc);

    return ("<h" + level + " id=\"" + slug + "\"><a href=\"" + url + "\" data-id=\"" + slug + "\" class=\"anchor\"><span>" + str + "</span></a></h" + level + ">");
  };

  origin.code = highlightCodeCompiler({ renderer: renderer });
  origin.link = linkCompiler({
    renderer: renderer,
    router: router,
    linkTarget: linkTarget,
    linkRel: linkRel,
    compilerClass: _self,
  });
  origin.paragraph = paragraphCompiler({ renderer: renderer });
  origin.image = imageCompiler({ renderer: renderer, contentBase: contentBase, router: router });
  origin.list = taskListCompiler({ renderer: renderer });
  origin.listitem = taskListItemCompiler({ renderer: renderer });

  renderer.origin = origin;

  return renderer;
};

/**
 * Compile sidebar
 * @param {String} text Text content
 * @param {Number} level Type of heading (h<level> tag)
 * @returns {String} Sidebar element
 */
Compiler.prototype.sidebar = function sidebar (text, level) {
  var ref = this;
    var toc = ref.toc;
  var currentPath = this.router.getCurrentPath();
  var html = '';

  if (text) {
    html = this.compile(text);
  } else {
    for (var i = 0; i < toc.length; i++) {
      if (toc[i].ignoreSubHeading) {
        var deletedHeaderLevel = toc[i].level;
        toc.splice(i, 1);
        // Remove headers who are under current header
        for (
          var j = i;
          j < toc.length && deletedHeaderLevel < toc[j].level;
          j++
        ) {
          toc.splice(j, 1) && j-- && i++;
        }

        i--;
      }
    }

    var tree$1 = this.cacheTree[currentPath] || genTree(toc, level);
    html = tree(tree$1, '<ul>{inner}</ul>');
    this.cacheTree[currentPath] = tree$1;
  }

  return html;
};

/**
 * Compile sub sidebar
 * @param {Number} level Type of heading (h<level> tag)
 * @returns {String} Sub-sidebar element
 */
Compiler.prototype.subSidebar = function subSidebar (level) {
  if (!level) {
    this.toc = [];
    return;
  }

  var currentPath = this.router.getCurrentPath();
  var ref = this;
    var cacheTree = ref.cacheTree;
    var toc = ref.toc;

  toc[0] && toc[0].ignoreAllSubs && toc.splice(0);
  toc[0] && toc[0].level === 1 && toc.shift();

  for (var i = 0; i < toc.length; i++) {
    toc[i].ignoreSubHeading && toc.splice(i, 1) && i--;
  }

  var tree$1 = cacheTree[currentPath] || genTree(toc, level);

  cacheTree[currentPath] = tree$1;
  this.toc = [];
  return tree(tree$1);
};

Compiler.prototype.header = function header (text, level) {
  return this.heading(text, level);
};

Compiler.prototype.article = function article (text) {
  return this.compile(text);
};

/**
 * Compile cover page
 * @param {Text} text Text content
 * @returns {String} Cover page
 */
Compiler.prototype.cover = function cover (text) {
  var cacheToc = this.toc.slice();
  var html = this.compile(text);

  this.toc = cacheToc.slice();

  return html;
};

var cached$2 = {};

function walkFetchEmbed(ref, cb) {
  var embedTokens = ref.embedTokens;
  var compile = ref.compile;
  var fetch = ref.fetch;

  var token;
  var step = 0;
  var count = 1;

  if (!embedTokens.length) {
    return cb({});
  }

  while ((token = embedTokens[step++])) {
    // eslint-disable-next-line no-shadow
    var next = (function (token) {
      return function (text) {
        var embedToken;
        if (text) {
          if (token.embed.type === 'markdown') {
            var path = token.embed.url.split('/');
            path.pop();
            path = path.join('/');
            // Resolves relative links to absolute
            text = text.replace(/\[([^[\]]+)\]\(([^)]+)\)/g, function (x) {
              var linkBeginIndex = x.indexOf('(');
              if (x.slice(linkBeginIndex, linkBeginIndex + 2) === '(.') {
                return (
                  x.substring(0, linkBeginIndex) +
                  "(" + (window.location.protocol) + "//" + (window.location.host) + path + "/" +
                  x.substring(linkBeginIndex + 1, x.length - 1) +
                  ')'
                );
              }
              return x;
            });

            // This may contain YAML front matter and will need to be stripped.
            var frontMatterInstalled =
              ($docsify.frontMatter || {}).installed || false;
            if (frontMatterInstalled === true) {
              text = $docsify.frontMatter.parseMarkdown(text);
            }

            embedToken = compile.lexer(text);
          } else if (token.embed.type === 'code') {
            if (token.embed.fragment) {
              var fragment = token.embed.fragment;
              var pattern = new RegExp(
                ("(?:###|\\/\\/\\/)\\s*\\[" + fragment + "\\]([\\s\\S]*)(?:###|\\/\\/\\/)\\s*\\[" + fragment + "\\]")
              );
              text = stripIndent((text.match(pattern) || [])[1] || '').trim();
            }

            embedToken = compile.lexer(
              '```' +
                token.embed.lang +
                '\n' +
                text.replace(/`/g, '@DOCSIFY_QM@') +
                '\n```\n'
            );
          } else if (token.embed.type === 'mermaid') {
            embedToken = [
              { type: 'html', text: ("<div class=\"mermaid\">\n" + text + "\n</div>") } ];
            embedToken.links = {};
          } else {
            embedToken = [{ type: 'html', text: text }];
            embedToken.links = {};
          }
        }

        cb({ token: token, embedToken: embedToken });
        if (++count >= step) {
          cb({});
        }
      };
    })(token);

    if (token.embed.url) {
      {
        fetch(token.embed.url).then(next);
      }
    } else {
      next(token.embed.html);
    }
  }
}

function prerenderEmbed(ref, done) {
  var compiler = ref.compiler;
  var raw = ref.raw; if ( raw === void 0 ) raw = '';
  var fetch = ref.fetch;

  var hit = cached$2[raw];
  if (hit) {
    var copy = hit.slice();
    copy.links = hit.links;
    return done(copy);
  }

  var compile = compiler._marked;
  var tokens = compile.lexer(raw);
  var embedTokens = [];
  var linkRE = compile.Lexer.rules.inline.link;
  var links = tokens.links;

  tokens.forEach(function (token, index) {
    if (token.type === 'paragraph') {
      token.text = token.text.replace(
        new RegExp(linkRE.source, 'g'),
        function (src, filename, href, title) {
          var embed = compiler.compileEmbed(href, title);

          if (embed) {
            embedTokens.push({
              index: index,
              embed: embed,
            });
          }

          return src;
        }
      );
    }
  });

  // keep track of which tokens have been embedded so far
  // so that we know where to insert the embedded tokens as they
  // are returned
  var moves = [];
  walkFetchEmbed({ compile: compile, embedTokens: embedTokens, fetch: fetch }, function (ref) {
    var embedToken = ref.embedToken;
    var token = ref.token;

    if (token) {
      // iterate through the array of previously inserted tokens
      // to determine where the current embedded tokens should be inserted
      var index = token.index;
      moves.forEach(function (pos) {
        if (index > pos.start) {
          index += pos.length;
        }
      });

      merge(links, embedToken.links);

      tokens = tokens
        .slice(0, index)
        .concat(embedToken, tokens.slice(index + 1));
      moves.push({ start: index, length: embedToken.length - 1 });
    } else {
      cached$2[raw] = tokens.concat();
      tokens.links = cached$2[raw].links = links;
      done(tokens);
    }
  });
}

function cwd() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return path.resolve.apply(void 0, [ process.cwd() ].concat( args ));
}

function isExternal(url) {
  var match = url.match(
    /^([^:/?#]+:)?(?:\/\/([^/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/
  );
  if (
    typeof match[1] === 'string' &&
    match[1].length > 0 &&
    match[1].toLowerCase() !== location.protocol
  ) {
    return true;
  }
  if (
    typeof match[2] === 'string' &&
    match[2].length > 0 &&
    match[2].replace(
      new RegExp(
        ':(' + { 'http:': 80, 'https:': 443 }[location.protocol] + ')?$'
      ),
      ''
    ) !== location.host
  ) {
    return true;
  }
  return false;
}

function mainTpl(config) {
  var html = "<nav class=\"app-nav" + (config.repo ? '' : ' no-badge') + "\"><!--navbar--></nav>";

  if (config.repo) {
    html += corner(config.repo);
  }

  if (config.coverpage) {
    html += cover();
  }

  html += main(config);

  return html;
}

var Renderer = function Renderer(ref) {
  var this$1 = this;
  var template = ref.template;
  var config = ref.config;
  var cache = ref.cache;

  this.html = template;
  this.config = config = Object.assign({}, config, {
    routerMode: 'history',
  });
  this.cache = cache;

  this.router = new AbstractHistory(config);
  this.compiler = new Compiler(config, this.router);

  this.router.getCurrentPath = function () { return this$1.url; };
  this._renderHtml(
    'inject-config',
    ("<script>window.$docsify = " + (JSON.stringify(config)) + "</script>")
  );
  this._renderHtml('inject-app', mainTpl(config));

  this.template = this.html;
};

Renderer.prototype._getPath = function _getPath (url) {
  var file = this.router.getFile(url);

  return isAbsolutePath(file) ? file : cwd(("./" + file));
};

Renderer.prototype.renderToString = function renderToString (url) {return __async(function*(){
  this.url = url = this.router.parse(url).path;
  this.isRemoteUrl = isExternal(this.url);
  var ref = this.config;
    var loadSidebar = ref.loadSidebar;
    var loadNavbar = ref.loadNavbar;
    var coverpage = ref.coverpage;

  var mainFile = this._getPath(url);
  this._renderHtml('main', yield this._render(mainFile, 'main'));

  if (loadSidebar) {
    var name = loadSidebar === true ? '_sidebar.md' : loadSidebar;
    var sidebarFile = this._getPath(path.resolve(url, ("./" + name)));
    this._renderHtml('sidebar', yield this._render(sidebarFile, 'sidebar'));
  }

  if (loadNavbar) {
    var name$1 = loadNavbar === true ? '_navbar.md' : loadNavbar;
    var navbarFile = this._getPath(path.resolve(url, ("./" + name$1)));
    this._renderHtml('navbar', yield this._render(navbarFile, 'navbar'));
  }

  if (coverpage) {
    var path$1 = null;
    if (typeof coverpage === 'string') {
      if (url === '/') {
        path$1 = coverpage;
      }
    } else if (Array.isArray(coverpage)) {
      path$1 = coverpage.indexOf(url) > -1 && '_coverpage.md';
    } else {
      var cover = coverpage[url];
      path$1 = cover === true ? '_coverpage.md' : cover;
    }

    var coverFile = this._getPath(path.resolve(url, ("./" + path$1)));

    this._renderHtml('cover', yield this._render(coverFile), 'cover');
  }

  var html = this.html;

  this.html = this.template;

  return html;
}.call(this))};

Renderer.prototype._renderHtml = function _renderHtml (match, content) {
  this.html = this.html.replace(new RegExp(("<!--" + match + "-->"), 'g'), content);

  return this.html;
};

Renderer.prototype._render = function _render (path, type) {return __async(function*(){
    var this$1 = this;

  var html = yield this._loadFile(path);
  var ref = this.config;
    var subMaxLevel = ref.subMaxLevel;
    var maxLevel = ref.maxLevel;
  var tokens;

  switch (type) {
    case 'sidebar':
      html =
        this.compiler.sidebar(html, maxLevel) +
        "<script>window.__SUB_SIDEBAR__ = " + (JSON.stringify(
          this.compiler.subSidebar(subMaxLevel)
        )) + "</script>";
      break;
    case 'cover':
      html = this.compiler.cover(html);
      break;
    case 'main':
      tokens = yield new Promise(function (r) {
        prerenderEmbed(
          {
            fetch: function (url) { return this$1._loadFile(this$1._getPath(url)); },
            compiler: this$1.compiler,
            raw: html,
          },
          r
        );
      });
      html = this.compiler.compile(tokens);
      break;
    case 'navbar':
    case 'article':
    default:
      html = this.compiler.compile(html);
      break;
  }

  return html;
}.call(this))};

Renderer.prototype._loadFile = function _loadFile (filePath) {return __async(function*(){
  debug('docsify')(("load > " + filePath));
  var content;
  try {
    if (isAbsolutePath(filePath)) {
      var res = yield fetch(filePath);
      if (!res.ok) {
        throw Error();
      }

      content = yield res.text();
      this.lock = 0;
    } else {
      content = yield fs.readFileSync(filePath, 'utf8');
      this.lock = 0;
    }

    return content;
  } catch (e) {
    this.lock = this.lock || 0;
    if (++this.lock > 10) {
      this.lock = 0;
      return;
    }

    var fileName = path.basename(filePath);
    var result = yield this._loadFile(
      resolvePathname(("../" + fileName), filePath)
    );

    return result;
  }
}.call(this))};

Renderer.version = '4.12.2';

module.exports = Renderer;
