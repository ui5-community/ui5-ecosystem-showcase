sap.ui.define((function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var cmis$1 = {};

	var cmis = {};

	(function(self) {

	  if (self.fetch) {
	    return
	  }

	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  };

	  if (support.arrayBuffer) {
	    var viewClasses = [
	      '[object Int8Array]',
	      '[object Uint8Array]',
	      '[object Uint8ClampedArray]',
	      '[object Int16Array]',
	      '[object Uint16Array]',
	      '[object Int32Array]',
	      '[object Uint32Array]',
	      '[object Float32Array]',
	      '[object Float64Array]'
	    ];

	    var isDataView = function(obj) {
	      return obj && DataView.prototype.isPrototypeOf(obj)
	    };

	    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
	      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	    };
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name);
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value);
	    }
	    return value
	  }

	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift();
	        return {done: value === undefined, value: value}
	      }
	    };

	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      };
	    }

	    return iterator
	  }

	  function Headers(headers) {
	    this.map = {};

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value);
	      }, this);
	    } else if (Array.isArray(headers)) {
	      headers.forEach(function(header) {
	        this.append(header[0], header[1]);
	      }, this);
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name]);
	      }, this);
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name);
	    value = normalizeValue(value);
	    var oldValue = this.map[name];
	    this.map[name] = oldValue ? oldValue+','+value : value;
	  };

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)];
	  };

	  Headers.prototype.get = function(name) {
	    name = normalizeName(name);
	    return this.has(name) ? this.map[name] : null
	  };

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  };

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = normalizeValue(value);
	  };

	  Headers.prototype.forEach = function(callback, thisArg) {
	    for (var name in this.map) {
	      if (this.map.hasOwnProperty(name)) {
	        callback.call(thisArg, this.map[name], name, this);
	      }
	    }
	  };

	  Headers.prototype.keys = function() {
	    var items = [];
	    this.forEach(function(value, name) { items.push(name); });
	    return iteratorFor(items)
	  };

	  Headers.prototype.values = function() {
	    var items = [];
	    this.forEach(function(value) { items.push(value); });
	    return iteratorFor(items)
	  };

	  Headers.prototype.entries = function() {
	    var items = [];
	    this.forEach(function(value, name) { items.push([name, value]); });
	    return iteratorFor(items)
	  };

	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true;
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result);
	      };
	      reader.onerror = function() {
	        reject(reader.error);
	      };
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsArrayBuffer(blob);
	    return promise
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader();
	    var promise = fileReaderReady(reader);
	    reader.readAsText(blob);
	    return promise
	  }

	  function readArrayBufferAsText(buf) {
	    var view = new Uint8Array(buf);
	    var chars = new Array(view.length);

	    for (var i = 0; i < view.length; i++) {
	      chars[i] = String.fromCharCode(view[i]);
	    }
	    return chars.join('')
	  }

	  function bufferClone(buf) {
	    if (buf.slice) {
	      return buf.slice(0)
	    } else {
	      var view = new Uint8Array(buf.byteLength);
	      view.set(new Uint8Array(buf));
	      return view.buffer
	    }
	  }

	  function Body() {
	    this.bodyUsed = false;

	    this._initBody = function(body) {
	      this._bodyInit = body;
	      if (!body) {
	        this._bodyText = '';
	      } else if (typeof body === 'string') {
	        this._bodyText = body;
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body;
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body;
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString();
	      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	        this._bodyArrayBuffer = bufferClone(body.buffer);
	        // IE 10-11 can't handle a DataView body.
	        this._bodyInit = new Blob([this._bodyArrayBuffer]);
	      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	        this._bodyArrayBuffer = bufferClone(body);
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8');
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type);
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	      }
	    };

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this);
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyArrayBuffer) {
	          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      };

	      this.arrayBuffer = function() {
	        if (this._bodyArrayBuffer) {
	          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
	        } else {
	          return this.blob().then(readBlobAsArrayBuffer)
	        }
	      };
	    }

	    this.text = function() {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return readBlobAsText(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as text')
	      } else {
	        return Promise.resolve(this._bodyText)
	      }
	    };

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      };
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    };

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase();
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {};
	    var body = options.body;

	    if (input instanceof Request) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url;
	      this.credentials = input.credentials;
	      if (!options.headers) {
	        this.headers = new Headers(input.headers);
	      }
	      this.method = input.method;
	      this.mode = input.mode;
	      if (!body && input._bodyInit != null) {
	        body = input._bodyInit;
	        input.bodyUsed = true;
	      }
	    } else {
	      this.url = String(input);
	    }

	    this.credentials = options.credentials || this.credentials || 'omit';
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers);
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET');
	    this.mode = options.mode || this.mode || null;
	    this.referrer = null;

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body);
	  }

	  Request.prototype.clone = function() {
	    return new Request(this, { body: this._bodyInit })
	  };

	  function decode(body) {
	    var form = new FormData();
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=');
	        var name = split.shift().replace(/\+/g, ' ');
	        var value = split.join('=').replace(/\+/g, ' ');
	        form.append(decodeURIComponent(name), decodeURIComponent(value));
	      }
	    });
	    return form
	  }

	  function parseHeaders(rawHeaders) {
	    var headers = new Headers();
	    rawHeaders.split(/\r?\n/).forEach(function(line) {
	      var parts = line.split(':');
	      var key = parts.shift().trim();
	      if (key) {
	        var value = parts.join(':').trim();
	        headers.append(key, value);
	      }
	    });
	    return headers
	  }

	  Body.call(Request.prototype);

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {};
	    }

	    this.type = 'default';
	    this.status = 'status' in options ? options.status : 200;
	    this.ok = this.status >= 200 && this.status < 300;
	    this.statusText = 'statusText' in options ? options.statusText : 'OK';
	    this.headers = new Headers(options.headers);
	    this.url = options.url || '';
	    this._initBody(bodyInit);
	  }

	  Body.call(Response.prototype);

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  };

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''});
	    response.type = 'error';
	    return response
	  };

	  var redirectStatuses = [301, 302, 303, 307, 308];

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  };

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request = new Request(input, init);
	      var xhr = new XMLHttpRequest();

	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	        };
	        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options));
	      };

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'));
	      };

	      xhr.open(request.method, request.url, true);

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true;
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob';
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value);
	      });

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	    })
	  };
	  self.fetch.polyfill = true;
	})(typeof self !== 'undefined' ? self : commonjsGlobal);

	var browser = {};

	browser.atob = self.atob.bind(self);
	browser.btoa = self.btoa.bind(self);

	/**
	 *
	 *
	 * @author Jerry Bendy <jerry@icewingcc.com>
	 * @licence MIT
	 *
	 */

	(function(self) {

	    var nativeURLSearchParams = self.URLSearchParams ? self.URLSearchParams : null,
	        isSupportObjectConstructor = nativeURLSearchParams && (new nativeURLSearchParams({a: 1})).toString() === 'a=1',
	        // There is a bug in safari 10.1 (and earlier) that incorrectly decodes `%2B` as an empty space and not a plus.
	        decodesPlusesCorrectly = nativeURLSearchParams && (new nativeURLSearchParams('s=%2B').get('s') === '+'),
	        __URLSearchParams__ = "__URLSearchParams__",
	        prototype = URLSearchParamsPolyfill.prototype,
	        iterable = !!(self.Symbol && self.Symbol.iterator);

	    if (nativeURLSearchParams && isSupportObjectConstructor && decodesPlusesCorrectly) {
	        return;
	    }


	    /**
	     * Make a URLSearchParams instance
	     *
	     * @param {object|string|URLSearchParams} search
	     * @constructor
	     */
	    function URLSearchParamsPolyfill(search) {
	        search = search || "";

	        // support construct object with another URLSearchParams instance
	        if (search instanceof URLSearchParams || search instanceof URLSearchParamsPolyfill) {
	            search = search.toString();
	        }

	        this [__URLSearchParams__] = parseToDict(search);
	    }


	    /**
	     * Appends a specified key/value pair as a new search parameter.
	     *
	     * @param {string} name
	     * @param {string} value
	     */
	    prototype.append = function(name, value) {
	        appendTo(this [__URLSearchParams__], name, value);
	    };

	    /**
	     * Deletes the given search parameter, and its associated value,
	     * from the list of all search parameters.
	     *
	     * @param {string} name
	     */
	    prototype.delete = function(name) {
	        delete this [__URLSearchParams__] [name];
	    };

	    /**
	     * Returns the first value associated to the given search parameter.
	     *
	     * @param {string} name
	     * @returns {string|null}
	     */
	    prototype.get = function(name) {
	        var dict = this [__URLSearchParams__];
	        return name in dict ? dict[name][0] : null;
	    };

	    /**
	     * Returns all the values association with a given search parameter.
	     *
	     * @param {string} name
	     * @returns {Array}
	     */
	    prototype.getAll = function(name) {
	        var dict = this [__URLSearchParams__];
	        return name in dict ? dict [name].slice(0) : [];
	    };

	    /**
	     * Returns a Boolean indicating if such a search parameter exists.
	     *
	     * @param {string} name
	     * @returns {boolean}
	     */
	    prototype.has = function(name) {
	        return name in this [__URLSearchParams__];
	    };

	    /**
	     * Sets the value associated to a given search parameter to
	     * the given value. If there were several values, delete the
	     * others.
	     *
	     * @param {string} name
	     * @param {string} value
	     */
	    prototype.set = function set(name, value) {
	        this [__URLSearchParams__][name] = ['' + value];
	    };

	    /**
	     * Returns a string containg a query string suitable for use in a URL.
	     *
	     * @returns {string}
	     */
	    prototype.toString = function() {
	        var dict = this[__URLSearchParams__], query = [], i, key, name, value;
	        for (key in dict) {
	            name = encode(key);
	            for (i = 0, value = dict[key]; i < value.length; i++) {
	                query.push(name + '=' + encode(value[i]));
	            }
	        }
	        return query.join('&');
	    };

	    // There is a bug in Safari 10.1 and `Proxy`ing it is not enough.
	    var forSureUsePolyfill = !decodesPlusesCorrectly;
	    var useProxy = (!forSureUsePolyfill && nativeURLSearchParams && !isSupportObjectConstructor && self.Proxy);
	    /*
	     * Apply polifill to global object and append other prototype into it
	     */
	    self.URLSearchParams = useProxy ?
	        // Safari 10.0 doesn't support Proxy, so it won't extend URLSearchParams on safari 10.0
	        new Proxy(nativeURLSearchParams, {
	            construct: function(target, args) {
	                return new target((new URLSearchParamsPolyfill(args[0]).toString()));
	            }
	        }) :
	        URLSearchParamsPolyfill;


	    var USPProto = self.URLSearchParams.prototype;

	    USPProto.polyfill = true;

	    /**
	     *
	     * @param {function} callback
	     * @param {object} thisArg
	     */
	    USPProto.forEach = USPProto.forEach || function(callback, thisArg) {
	        var dict = parseToDict(this.toString());
	        Object.getOwnPropertyNames(dict).forEach(function(name) {
	            dict[name].forEach(function(value) {
	                callback.call(thisArg, value, name, this);
	            }, this);
	        }, this);
	    };

	    /**
	     * Sort all name-value pairs
	     */
	    USPProto.sort = USPProto.sort || function() {
	        var dict = parseToDict(this.toString()), keys = [], k, i, j;
	        for (k in dict) {
	            keys.push(k);
	        }
	        keys.sort();

	        for (i = 0; i < keys.length; i++) {
	            this.delete(keys[i]);
	        }
	        for (i = 0; i < keys.length; i++) {
	            var key = keys[i], values = dict[key];
	            for (j = 0; j < values.length; j++) {
	                this.append(key, values[j]);
	            }
	        }
	    };

	    /**
	     * Returns an iterator allowing to go through all keys of
	     * the key/value pairs contained in this object.
	     *
	     * @returns {function}
	     */
	    USPProto.keys = USPProto.keys || function() {
	        var items = [];
	        this.forEach(function(item, name) {
	            items.push([name]);
	        });
	        return makeIterator(items);
	    };

	    /**
	     * Returns an iterator allowing to go through all values of
	     * the key/value pairs contained in this object.
	     *
	     * @returns {function}
	     */
	    USPProto.values = USPProto.values || function() {
	        var items = [];
	        this.forEach(function(item) {
	            items.push([item]);
	        });
	        return makeIterator(items);
	    };

	    /**
	     * Returns an iterator allowing to go through all key/value
	     * pairs contained in this object.
	     *
	     * @returns {function}
	     */
	    USPProto.entries = USPProto.entries || function() {
	        var items = [];
	        this.forEach(function(item, name) {
	            items.push([name, item]);
	        });
	        return makeIterator(items);
	    };


	    if (iterable) {
	        USPProto[self.Symbol.iterator] = USPProto[self.Symbol.iterator] || USPProto.entries;
	    }


	    function encode(str) {
	        var replace = {
	            '!': '%21',
	            "'": '%27',
	            '(': '%28',
	            ')': '%29',
	            '~': '%7E',
	            '%20': '+',
	            '%00': '\x00'
	        };
	        return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, function(match) {
	            return replace[match];
	        });
	    }

	    function decode(str) {
	        return decodeURIComponent(str.replace(/\+/g, ' '));
	    }

	    function makeIterator(arr) {
	        var iterator = {
	            next: function() {
	                var value = arr.shift();
	                return {done: value === undefined, value: value};
	            }
	        };

	        if (iterable) {
	            iterator[self.Symbol.iterator] = function() {
	                return iterator;
	            };
	        }

	        return iterator;
	    }

	    function parseToDict(search) {
	        var dict = {};

	        if (typeof search === "object") {
	            for (var i in search) {
	                if (search.hasOwnProperty(i)) {
	                    var str = typeof search [i] === 'string' ? search [i] : JSON.stringify(search [i]);
	                    appendTo(dict, i, str);
	                }
	            }

	        } else {
	            // remove first '?'
	            if (search.indexOf("?") === 0) {
	                search = search.slice(1);
	            }

	            var pairs = search.split("&");
	            for (var j = 0; j < pairs.length; j++) {
	                var value = pairs [j],
	                    index = value.indexOf('=');

	                if (-1 < index) {
	                    appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));

	                } else {
	                    if (value) {
	                        appendTo(dict, decode(value), '');
	                    }
	                }
	            }
	        }

	        return dict;
	    }

	    function appendTo(dict, name, value) {
	        if (name in dict) {
	            dict[name].push('' + value);
	        } else {
	            dict[name] = ['' + value];
	        }
	    }

	})(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : (typeof window !== 'undefined' ? window : commonjsGlobal));

	(function (exports) {
		var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
		    var extendStatics = Object.setPrototypeOf ||
		        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
		        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
		    return function (d, b) {
		        extendStatics(d, b);
		        function __() { this.constructor = d; }
		        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
		    };
		})();
		Object.defineProperty(exports, "__esModule", { value: true });

		var isomorphic_base64_1 = browser;
		(function (cmis) {
		    var Buffer = commonjsGlobal['Buffer'];
		    var Options = (function () {
		        function Options() {
		            this.succinct = true;
		        }
		        return Options;
		    }());
		    var HTTPError = (function (_super) {
		        __extends(HTTPError, _super);
		        function HTTPError(response) {
		            var _this = _super.call(this, response.statusText) || this;
		            _this.response = response;
		            return _this;
		        }
		        return HTTPError;
		    }(Error));
		    cmis.HTTPError = HTTPError;
		    var CmisSession = (function () {
		        function CmisSession(url) {
		            this.options = { succinct: true };
		            this.url = url;
		        }
		        CmisSession.prototype.setProperties = function (options, properties) {
		            var i = 0;
		            for (var id in properties) {
		                options['propertyId[' + i + ']'] = id;
		                var propertyValue = properties[id];
		                if (propertyValue !== null && propertyValue !== undefined) {
		                    if (Object.prototype.toString.apply(propertyValue) == '[object Array]') {
		                        var multiProperty = propertyValue;
		                        for (var j = 0; j < multiProperty.length; j++) {
		                            options['propertyValue[' + i + '][' + j + ']'] = multiProperty[j];
		                        }
		                    }
		                    else {
		                        options['propertyValue[' + i + ']'] = propertyValue;
		                    }
		                }
		                i++;
		            }
		        };
		        CmisSession.prototype.setPolicies = function (options, policies) {
		            for (var i = 0; i < policies.length; i++) {
		                options['policy[' + i + ']'] = policies[i];
		            }
		        };
		        CmisSession.prototype.setACEs = function (options, ACEs, action) {
		            var i = 0;
		            for (var id in ACEs) {
		                options[action + 'ACEPrincipal[' + i + ']'] = id;
		                var ace = ACEs[id];
		                for (var j = 0; j < ace.length; j++) {
		                    options[action + 'ACEPermission[' + i + '][' + j + ']'] = ACEs[id][j];
		                }
		                i++;
		            }
		        };
		        CmisSession.prototype.setSecondaryTypeIds = function (options, secondaryTypeIds, action) {
		            for (var i = 0; i < secondaryTypeIds.length; i++) {
		                options[action + 'SecondaryTypeId[' + i + ']'] = secondaryTypeIds[i];
		            }
		        };
		        CmisSession.prototype.http = function (method, url, options, multipartData) {
		            var _this = this;
		            var body = {};
		            for (var k in this.options) {
		                if (this.options[k] != null && this.options[k] !== undefined) {
		                    body[k] = this.options[k];
		                }
		            }
		            for (var k in options) {
		                if (options[k] != null && options[k] !== undefined) {
		                    body[k] = options[k];
		                }
		            }
		            var auth;
		            if (this.username && this.password) {
		                auth = 'Basic ' + isomorphic_base64_1.btoa(this.username + ":" + this.password);
		            }
		            else if (this.token) {
		                auth = "Bearer " + this.token;
		            }
		            var cfg = { method: method, headers: {} };
		            if (auth) {
		                cfg.headers['Authorization'] = auth;
		            }
		            else {
		                cfg.credentials = 'include';
		            }
		            if (multipartData) {
		                var formData = new FormData();
		                var content = multipartData.content;
		                if ('string' == typeof content) {
		                    if (typeof (Blob) !== 'undefined')
		                        content = new Blob([content]);
		                }
		                else if (typeof (Buffer) !== 'undefined') {
		                    content = new Buffer(content);
		                }
		                formData.append('content', content, multipartData.mimeTypeExtension ? multipartData.filename + '.' + multipartData.mimeTypeExtension : multipartData.filename);
		                for (var k in body) {
		                    formData.append(k, '' + body[k]);
		                }
		                if (this.charset) {
		                    formData.append('_charset_', this.charset);
		                }
		                cfg.body = formData;
		            }
		            else {
		                var usp = new URLSearchParams();
		                for (var k in body) {
		                    usp.set(k, body[k]);
		                }
		                if (method !== 'GET') {
		                    cfg.body = usp.toString();
		                    cfg.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		                }
		                else {
		                    url = url + "?" + usp.toString();
		                }
		            }
		            var response = fetch(url, cfg).then(function (res) {
		                if (res.status < 200 || res.status > 299) {
		                    throw new HTTPError(res);
		                }
		                return res;
		            });
		            if (this.errorHandler) {
		                response.catch(function (err) { return _this.errorHandler(err); });
		            }
		            return response;
		        };
		        CmisSession.prototype.get = function (url, options) {
		            return this.http('GET', url, options);
		        };
		        CmisSession.prototype.post = function (url, options, multipartData) {
		            return this.http('POST', url, options, multipartData);
		        };
		        CmisSession.prototype.setToken = function (token) {
		            this.token = token;
		            return this;
		        };
		        CmisSession.prototype.setCredentials = function (username, password) {
		            this.username = username;
		            this.password = password;
		            return this;
		        };
		        CmisSession.prototype.setCharset = function (charset) {
		            this.charset = charset;
		            return this;
		        };
		        CmisSession.prototype.setErrorHandler = function (handler) {
		            this.errorHandler = handler;
		        };
		        CmisSession.prototype.loadRepositories = function () {
		            var _this = this;
		            return this.get(this.url, this.options).then(function (res) {
		                return res.json().then(function (data) {
		                    for (var repo in data) {
		                        _this.defaultRepository = data[repo];
		                        break;
		                    }
		                    _this.repositories = data;
		                    return;
		                });
		            });
		        };
		        CmisSession.prototype.getRepositoryInfo = function () {
		            return this.get(this.defaultRepository.repositoryUrl, { cmisselector: 'repositoryInfo' })
		                .then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getTypeChildren = function (typeId, includePropertyDefinitions, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'typeChildren';
		            o.typeId = typeId;
		            o.includePropertyDefinitions = includePropertyDefinitions;
		            return this.get(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getTypeDescendants = function (typeId, depth, includePropertyDefinitions) {
		            return this.get(this.defaultRepository.repositoryUrl, {
		                cmisselector: 'typeDescendants',
		                typeId: typeId,
		                includePropertyDefinitions: includePropertyDefinitions,
		                depth: depth
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getTypeDefinition = function (typeId) {
		            return this.get(this.defaultRepository.repositoryUrl, {
		                cmisselector: 'typeDefinition',
		                typeId: typeId,
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getCheckedOutDocs = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'checkedOut';
		            return this.get(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.query = function (statement, searchAllVersions, options) {
		            if (searchAllVersions === void 0) { searchAllVersions = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisaction = 'query';
		            o.statement = statement;
		            o.searchAllVersions = searchAllVersions;
		            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.createType = function (type) {
		            return this.post(this.defaultRepository.repositoryUrl, {
		                cmisaction: 'createType',
		                type: JSON.stringify(type)
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.updateType = function (type) {
		            return this.post(this.defaultRepository.repositoryUrl, {
		                cmisaction: 'updateType',
		                type: JSON.stringify(type)
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.deleteType = function (typeId) {
		            return this.post(this.defaultRepository.repositoryUrl, {
		                cmisaction: 'deleteType',
		                typeId: JSON.stringify(typeId)
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getObjectByPath = function (path, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'object';
		            var sp = path.split('/');
		            for (var i = sp.length - 1; i >= 0; i--) {
		                sp[i] = encodeURIComponent(sp[i]);
		            }
		            return this.get(this.defaultRepository.rootFolderUrl + sp.join('/'), o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getObject = function (objectId, returnVersion, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'object';
		            o.objectId = objectId;
		            o.returnVersion = returnVersion;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.createFolder = function (parentId, name, type, policies, addACEs, removeACEs) {
		            if (type === void 0) { type = 'cmis:folder'; }
		            if (policies === void 0) { policies = []; }
		            if (addACEs === void 0) { addACEs = {}; }
		            if (removeACEs === void 0) { removeACEs = {}; }
		            var options = new Options();
		            options.objectId = parentId;
		            options.repositoryId = this.defaultRepository.repositoryId;
		            options.cmisaction = 'createFolder';
		            var properties = {
		                'cmis:name': name,
		                'cmis:objectTypeId': type
		            };
		            this.setProperties(options, properties);
		            this.setPolicies(options, policies);
		            this.setACEs(options, addACEs, 'add');
		            this.setACEs(options, removeACEs, 'remove');
		            return this.post(this.defaultRepository.rootFolderUrl, options).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getChildren = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'children';
		            o.objectId = objectId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getDescendants = function (folderId, depth, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'descendants';
		            if (depth) {
		                o.depth = depth;
		            }
		            o.objectId = folderId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getFolderTree = function (folderId, depth, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'folderTree';
		            if (depth) {
		                o.depth = depth;
		            }
		            o.objectId = folderId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getFolderParent = function (folderId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'parent';
		            o.objectId = folderId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getParents = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'parents';
		            o.objectId = objectId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getAllowableActions = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'allowableActions';
		            o.objectId = objectId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getProperties = function (objectId, returnVersion, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'properties';
		            o.objectId = objectId;
		            o.returnVersion = returnVersion;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.updateProperties = function (objectId, properties, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'update';
		            this.setProperties(options, properties);
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.moveObject = function (objectId, sourceFolderId, targetFolderId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'move';
		            o.targetFolderId = targetFolderId;
		            o.sourceFolderId = sourceFolderId;
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.createDocument = function (parentId, content, input, mimeTypeExtension, versioningState, policies, addACEs, removeACEs, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            if ('string' == typeof input) {
		                input = {
		                    'cmis:name': input
		                };
		            }
		            var properties = input || {};
		            if (!properties['cmis:objectTypeId']) {
		                properties['cmis:objectTypeId'] = 'cmis:document';
		            }
		            if (versioningState) {
		                o.versioningState = versioningState;
		            }
		            o.objectId = parentId;
		            this.setProperties(o, properties);
		            if (policies) {
		                this.setPolicies(o, policies);
		            }
		            if (addACEs) {
		                this.setACEs(o, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(o, removeACEs, 'remove');
		            }
		            o.repositoryId = this.defaultRepository.repositoryId;
		            o.cmisaction = 'createDocument';
		            return this.post(this.defaultRepository.rootFolderUrl, o, {
		                content: content,
		                filename: properties['cmis:name'],
		                mimeTypeExtension: mimeTypeExtension
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.bulkUpdateProperties = function (objectIds, properties, addSecondaryTypeIds, removeSecondaryTypeIds) {
		            if (properties === void 0) { properties = {}; }
		            if (addSecondaryTypeIds === void 0) { addSecondaryTypeIds = []; }
		            if (removeSecondaryTypeIds === void 0) { removeSecondaryTypeIds = []; }
		            var options = new Options();
		            for (var i = objectIds.length - 1; i >= 0; i--) {
		                options['objectId[' + i + ']'] = objectIds[i];
		            }
		            options.objectIds = objectIds;
		            this.setProperties(options, properties);
		            this.setSecondaryTypeIds(options, addSecondaryTypeIds, 'add');
		            this.setSecondaryTypeIds(options, removeSecondaryTypeIds, 'remove');
		            options.cmisaction = 'bulkUpdate';
		            return this.post(this.defaultRepository.repositoryUrl, options).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getContentStream = function (objectId, download, streamId) {
		            if (download === void 0) { download = 'inline'; }
		            var options = new Options();
		            options.cmisselector = 'content';
		            options.objectId = objectId;
		            options.download = download;
		            return this.get(this.defaultRepository.rootFolderUrl, options);
		        };
		        CmisSession.prototype.createDocumentFromSource = function (parentId, sourceId, content, input, mimeTypeExtension, versioningState, policies, addACEs, removeACEs, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            if ('string' == typeof input) {
		                input = {
		                    'cmis:name': input
		                };
		            }
		            var properties = input || {};
		            if (!properties['cmis:objectTypeId']) {
		                properties['cmis:objectTypeId'] = 'cmis:document';
		            }
		            if (versioningState) {
		                o.versioningState = versioningState;
		            }
		            o.objectId = parentId;
		            this.setProperties(o, properties);
		            if (policies) {
		                this.setPolicies(o, policies);
		            }
		            if (addACEs) {
		                this.setACEs(o, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(o, removeACEs, 'remove');
		            }
		            o.repositoryId = this.defaultRepository.repositoryId;
		            o.sourceId = sourceId;
		            o.cmisaction = 'createDocumentFromSource';
		            var multipartData = null;
		            if (content) {
		                multipartData = {
		                    content: content,
		                    filename: properties['cmis:name'],
		                    mimeTypeExtension: mimeTypeExtension
		                };
		            }
		            return this.post(this.defaultRepository.rootFolderUrl, o, multipartData).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getContentStreamURL = function (objectId, download, streamId) {
		            if (download === void 0) { download = 'inline'; }
		            var options = new Options();
		            options.cmisselector = 'content';
		            options.objectId = objectId;
		            options.download = download;
		            options.streamId = streamId;
		            var usp = new URLSearchParams();
		            for (var k in options) {
		                if (options[k] != null && options[k] !== undefined) {
		                    usp.append(k, options[k]);
		                }
		            }
		            for (var k in this.options) {
		                if (!usp.has(k) && this.options[k] != null && this.options[k] !== undefined) {
		                    usp.append(k, this.options[k]);
		                }
		            }
		            return this.defaultRepository.rootFolderUrl + "?" + usp.toString();
		        };
		        CmisSession.prototype.getRenditions = function (objectId, options) {
		            if (options === void 0) { options = {
		                renditionFilter: '*'
		            }; }
		            var o = options;
		            o.cmisselector = 'renditions';
		            o.objectId = objectId;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.checkOut = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'checkOut';
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.cancelCheckOut = function (objectId) {
		            var options = new Options();
		            options.objectId = objectId;
		            options.cmisaction = 'cancelCheckOut';
		            return this.post(this.defaultRepository.rootFolderUrl, options);
		        };
		        CmisSession.prototype.checkIn = function (objectId, major, input, content, mimeTypeExtension, comment, policies, addACEs, removeACEs, options) {
		            if (major === void 0) { major = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            if ('string' == typeof input) {
		                input = {
		                    'cmis:name': input
		                };
		            }
		            var properties = input || {};
		            if (comment) {
		                o.checkinComment = comment;
		            }
		            o.major = major;
		            o.objectId = objectId;
		            this.setProperties(o, properties);
		            if (policies) {
		                this.setPolicies(o, policies);
		            }
		            if (addACEs) {
		                this.setACEs(o, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(o, removeACEs, 'remove');
		            }
		            o.cmisaction = 'checkIn';
		            return this.post(this.defaultRepository.rootFolderUrl, o, {
		                content: content,
		                mimeTypeExtension: mimeTypeExtension,
		                filename: properties['cmis:name']
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getObjectOfLatestVersion = function (versionSeriesId, options) {
		            if (options === void 0) { options = { major: false }; }
		            var o = options;
		            o.cmisselector = 'object';
		            o.objectId = versionSeriesId;
		            o.versionSeriesId = versionSeriesId;
		            o.major = options.major;
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.setContentStream = function (objectId, content, overwriteFlag, filename, options) {
		            if (overwriteFlag === void 0) { overwriteFlag = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.overwriteFlag = overwriteFlag;
		            o.cmisaction = 'setContent';
		            return this.post(this.defaultRepository.rootFolderUrl, o, {
		                content: content,
		                filename: filename
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.appendContentStream = function (objectId, content, isLastChunk, filename, options) {
		            if (isLastChunk === void 0) { isLastChunk = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'appendContent';
		            o.isLastChunk = isLastChunk;
		            return this.post(this.defaultRepository.rootFolderUrl, o, {
		                content: content,
		                filename: filename
		            }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.deleteContentStream = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'deleteContent';
		            return this.post(this.defaultRepository.rootFolderUrl, o);
		        };
		        CmisSession.prototype.getAllVersions = function (versionSeriesId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.versionSeriesId = versionSeriesId;
		            o.cmisselector = 'versions';
		            return this.get(this.defaultRepository.rootFolderUrl, o);
		        };
		        CmisSession.prototype.getAppliedPolicies = function (objectId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisselector = 'policies';
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getACL = function (objectId, onlyBasicPermissions) {
		            if (onlyBasicPermissions === void 0) { onlyBasicPermissions = false; }
		            var options = new Options();
		            options.objectId = objectId;
		            options.onlyBasicPermissions = onlyBasicPermissions;
		            options.cmisselector = 'acl';
		            return this.get(this.defaultRepository.rootFolderUrl, options).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.deleteObject = function (objectId, allVersions) {
		            if (allVersions === void 0) { allVersions = false; }
		            var options = new Options();
		            options.repositoryId = this.defaultRepository.repositoryId;
		            options.cmisaction = 'delete';
		            options.objectId = objectId;
		            options.allVersions = allVersions;
		            return this.post(this.defaultRepository.rootFolderUrl, options);
		        };
		        CmisSession.prototype.deleteTree = function (objectId, allVersions, unfileObjects, continueOnFailure) {
		            if (allVersions === void 0) { allVersions = false; }
		            if (continueOnFailure === void 0) { continueOnFailure = false; }
		            var options = new Options();
		            options.repositoryId = this.defaultRepository.repositoryId;
		            options.cmisaction = 'deleteTree';
		            options.objectId = objectId;
		            options.allVersions = !!allVersions;
		            if (unfileObjects) {
		                options.unfileObjects = unfileObjects;
		            }
		            options.continueOnFailure = continueOnFailure;
		            return this.post(this.defaultRepository.rootFolderUrl, options);
		        };
		        CmisSession.prototype.getContentChanges = function (changeLogToken, includeProperties, includePolicyIds, includeACL, options) {
		            if (includeProperties === void 0) { includeProperties = false; }
		            if (includePolicyIds === void 0) { includePolicyIds = false; }
		            if (includeACL === void 0) { includeACL = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.cmisselector = 'contentChanges';
		            if (changeLogToken) {
		                o.changeLogToken = changeLogToken;
		            }
		            o.includeProperties = includeProperties;
		            o.includePolicyIds = includePolicyIds;
		            o.includeACL = includeACL;
		            return this.get(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.createRelationship = function (properties, policies, addACEs, removeACEs, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            this.setProperties(o, properties);
		            if (policies) {
		                this.setPolicies(o, policies);
		            }
		            if (addACEs) {
		                this.setACEs(o, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(o, removeACEs, 'remove');
		            }
		            o.cmisaction = 'createRelationship';
		            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.createPolicy = function (folderId, properties, policies, addACEs, removeACEs, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = folderId;
		            this.setProperties(o, properties);
		            if (policies) {
		                this.setPolicies(o, policies);
		            }
		            if (addACEs) {
		                this.setACEs(o, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(o, removeACEs, 'remove');
		            }
		            o.cmisaction = 'createPolicy';
		            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.createItem = function (folderId, properties, policies, addACEs, removeACEs, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = folderId;
		            this.setProperties(o, properties);
		            if (policies) {
		                this.setPolicies(o, policies);
		            }
		            if (addACEs) {
		                this.setACEs(o, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(o, removeACEs, 'remove');
		            }
		            o.cmisaction = 'createItem';
		            return this.post(this.defaultRepository.repositoryUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getLastResult = function () {
		            return this.post(this.defaultRepository.repositoryUrl, { cmisaction: 'lastResult' }).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.addObjectToFolder = function (objectId, folderId, allVersions, options) {
		            if (allVersions === void 0) { allVersions = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'addObjectToFolder';
		            o.allVersions = allVersions;
		            o.folderId = folderId;
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.removeObjectFromFolder = function (objectId, folderId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.cmisaction = 'removeObjectFromFolder';
		            o.folderId = folderId;
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.getObjectRelationships = function (objectId, includeSubRelationshipTypes, relationshipDirection, typeId, options) {
		            if (includeSubRelationshipTypes === void 0) { includeSubRelationshipTypes = false; }
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.includeSubRelationshipTypes = includeSubRelationshipTypes;
		            o.relationshipDirection = relationshipDirection || 'either';
		            if (typeId) {
		                o.typeId = typeId;
		            }
		            o.cmisselector = 'relationships';
		            return this.get(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.applyPolicy = function (objectId, policyId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.policyId = policyId;
		            o.cmisaction = 'applyPolicy';
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.removePolicy = function (objectId, policyId, options) {
		            if (options === void 0) { options = {}; }
		            var o = options;
		            o.objectId = objectId;
		            o.policyId = policyId;
		            o.cmisaction = 'removePolicy';
		            return this.post(this.defaultRepository.rootFolderUrl, o).then(function (res) { return res.json(); });
		        };
		        CmisSession.prototype.applyACL = function (objectId, addACEs, removeACEs, propagation) {
		            var options = new Options();
		            options.objectId = objectId;
		            options.cmisaction = 'applyACL';
		            options.propagation = propagation;
		            if (addACEs) {
		                this.setACEs(options, addACEs, 'add');
		            }
		            if (removeACEs) {
		                this.setACEs(options, removeACEs, 'remove');
		            }
		            return this.post(this.defaultRepository.rootFolderUrl, options).then(function (res) { return res.json(); });
		        };
		        return CmisSession;
		    }());
		    cmis.CmisSession = CmisSession;
		})(exports.cmis || (exports.cmis = {}));
		
	} (cmis));

	(function (exports) {
		var cmis$1 = cmis.cmis;
		for (var ex in cmis$1){
		    exports[ex] = cmis$1[ex];
		} 
	} (cmis$1));

	try { Object.defineProperty(cmis$1, "__" + "esModule", { value: true }); } catch (ex) {}

	return cmis$1;

}));
