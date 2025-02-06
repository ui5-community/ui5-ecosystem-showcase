sap.ui.define((function () { 'use strict';

  function _mergeNamespaces(n, m) {
    m.forEach(function (e) {
      e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
        if (k !== 'default' && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    });
    return Object.freeze(n);
  }

  var luxon$1 = {};

  var hasRequiredLuxon;
  function requireLuxon() {
    if (hasRequiredLuxon) return luxon$1;
    hasRequiredLuxon = 1;
    Object.defineProperty(luxon$1, "__esModule", {
      value: true
    });
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if (("value" in descriptor)) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _extends() {
      _extends = Object.assign ? Object.assign.bind() : function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      return _extends.apply(this, arguments);
    }
    function _inheritsLoose(subClass, superClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;
      _setPrototypeOf(subClass, superClass);
    }
    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }
    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };
      return _setPrototypeOf(o, p);
    }
    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;
      try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
        return true;
      } catch (e) {
        return false;
      }
    }
    function _construct(Parent, args, Class) {
      if (_isNativeReflectConstruct()) {
        _construct = Reflect.construct.bind();
      } else {
        _construct = function _construct(Parent, args, Class) {
          var a = [null];
          a.push.apply(a, args);
          var Constructor = Function.bind.apply(Parent, a);
          var instance = new Constructor();
          if (Class) _setPrototypeOf(instance, Class.prototype);
          return instance;
        };
      }
      return _construct.apply(null, arguments);
    }
    function _isNativeFunction(fn) {
      return Function.toString.call(fn).indexOf("[native code]") !== -1;
    }
    function _wrapNativeSuper(Class) {
      var _cache = typeof Map === "function" ? new Map() : undefined;
      _wrapNativeSuper = function _wrapNativeSuper(Class) {
        if (Class === null || !_isNativeFunction(Class)) return Class;
        if (typeof Class !== "function") {
          throw new TypeError("Super expression must either be null or a function");
        }
        if (typeof _cache !== "undefined") {
          if (_cache.has(Class)) return _cache.get(Class);
          _cache.set(Class, Wrapper);
        }
        function Wrapper() {
          return _construct(Class, arguments, _getPrototypeOf(this).constructor);
        }
        Wrapper.prototype = Object.create(Class.prototype, {
          constructor: {
            value: Wrapper,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
        return _setPrototypeOf(Wrapper, Class);
      };
      return _wrapNativeSuper(Class);
    }
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;
      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }
      return target;
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || (/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/).test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _createForOfIteratorHelperLoose(o, allowArrayLike) {
      var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
      if (it) return (it = it.call(o)).next.bind(it);
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        return function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== undefined) {
        var res = prim.call(input, hint);
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (String )(input);
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    var LuxonError = (function (_Error) {
      _inheritsLoose(LuxonError, _Error);
      function LuxonError() {
        return _Error.apply(this, arguments) || this;
      }
      return LuxonError;
    })(_wrapNativeSuper(Error));
    var InvalidDateTimeError = (function (_LuxonError) {
      _inheritsLoose(InvalidDateTimeError, _LuxonError);
      function InvalidDateTimeError(reason) {
        return _LuxonError.call(this, "Invalid DateTime: " + reason.toMessage()) || this;
      }
      return InvalidDateTimeError;
    })(LuxonError);
    var InvalidIntervalError = (function (_LuxonError2) {
      _inheritsLoose(InvalidIntervalError, _LuxonError2);
      function InvalidIntervalError(reason) {
        return _LuxonError2.call(this, "Invalid Interval: " + reason.toMessage()) || this;
      }
      return InvalidIntervalError;
    })(LuxonError);
    var InvalidDurationError = (function (_LuxonError3) {
      _inheritsLoose(InvalidDurationError, _LuxonError3);
      function InvalidDurationError(reason) {
        return _LuxonError3.call(this, "Invalid Duration: " + reason.toMessage()) || this;
      }
      return InvalidDurationError;
    })(LuxonError);
    var ConflictingSpecificationError = (function (_LuxonError4) {
      _inheritsLoose(ConflictingSpecificationError, _LuxonError4);
      function ConflictingSpecificationError() {
        return _LuxonError4.apply(this, arguments) || this;
      }
      return ConflictingSpecificationError;
    })(LuxonError);
    var InvalidUnitError = (function (_LuxonError5) {
      _inheritsLoose(InvalidUnitError, _LuxonError5);
      function InvalidUnitError(unit) {
        return _LuxonError5.call(this, "Invalid unit " + unit) || this;
      }
      return InvalidUnitError;
    })(LuxonError);
    var InvalidArgumentError = (function (_LuxonError6) {
      _inheritsLoose(InvalidArgumentError, _LuxonError6);
      function InvalidArgumentError() {
        return _LuxonError6.apply(this, arguments) || this;
      }
      return InvalidArgumentError;
    })(LuxonError);
    var ZoneIsAbstractError = (function (_LuxonError7) {
      _inheritsLoose(ZoneIsAbstractError, _LuxonError7);
      function ZoneIsAbstractError() {
        return _LuxonError7.call(this, "Zone is an abstract class") || this;
      }
      return ZoneIsAbstractError;
    })(LuxonError);
    var n = "numeric", s = "short", l = "long";
    var DATE_SHORT = {
      year: n,
      month: n,
      day: n
    };
    var DATE_MED = {
      year: n,
      month: s,
      day: n
    };
    var DATE_MED_WITH_WEEKDAY = {
      year: n,
      month: s,
      day: n,
      weekday: s
    };
    var DATE_FULL = {
      year: n,
      month: l,
      day: n
    };
    var DATE_HUGE = {
      year: n,
      month: l,
      day: n,
      weekday: l
    };
    var TIME_SIMPLE = {
      hour: n,
      minute: n
    };
    var TIME_WITH_SECONDS = {
      hour: n,
      minute: n,
      second: n
    };
    var TIME_WITH_SHORT_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      timeZoneName: s
    };
    var TIME_WITH_LONG_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      timeZoneName: l
    };
    var TIME_24_SIMPLE = {
      hour: n,
      minute: n,
      hourCycle: "h23"
    };
    var TIME_24_WITH_SECONDS = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23"
    };
    var TIME_24_WITH_SHORT_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23",
      timeZoneName: s
    };
    var TIME_24_WITH_LONG_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23",
      timeZoneName: l
    };
    var DATETIME_SHORT = {
      year: n,
      month: n,
      day: n,
      hour: n,
      minute: n
    };
    var DATETIME_SHORT_WITH_SECONDS = {
      year: n,
      month: n,
      day: n,
      hour: n,
      minute: n,
      second: n
    };
    var DATETIME_MED = {
      year: n,
      month: s,
      day: n,
      hour: n,
      minute: n
    };
    var DATETIME_MED_WITH_SECONDS = {
      year: n,
      month: s,
      day: n,
      hour: n,
      minute: n,
      second: n
    };
    var DATETIME_MED_WITH_WEEKDAY = {
      year: n,
      month: s,
      day: n,
      weekday: s,
      hour: n,
      minute: n
    };
    var DATETIME_FULL = {
      year: n,
      month: l,
      day: n,
      hour: n,
      minute: n,
      timeZoneName: s
    };
    var DATETIME_FULL_WITH_SECONDS = {
      year: n,
      month: l,
      day: n,
      hour: n,
      minute: n,
      second: n,
      timeZoneName: s
    };
    var DATETIME_HUGE = {
      year: n,
      month: l,
      day: n,
      weekday: l,
      hour: n,
      minute: n,
      timeZoneName: l
    };
    var DATETIME_HUGE_WITH_SECONDS = {
      year: n,
      month: l,
      day: n,
      weekday: l,
      hour: n,
      minute: n,
      second: n,
      timeZoneName: l
    };
    var Zone = (function () {
      function Zone() {}
      var _proto = Zone.prototype;
      _proto.offsetName = function offsetName(ts, opts) {
        throw new ZoneIsAbstractError();
      };
      _proto.formatOffset = function formatOffset(ts, format) {
        throw new ZoneIsAbstractError();
      };
      _proto.offset = function offset(ts) {
        throw new ZoneIsAbstractError();
      };
      _proto.equals = function equals(otherZone) {
        throw new ZoneIsAbstractError();
      };
      _createClass(Zone, [{
        key: "type",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
      }, {
        key: "name",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
      }, {
        key: "ianaName",
        get: function get() {
          return this.name;
        }
      }, {
        key: "isUniversal",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
      }, {
        key: "isValid",
        get: function get() {
          throw new ZoneIsAbstractError();
        }
      }]);
      return Zone;
    })();
    var singleton$1 = null;
    var SystemZone = (function (_Zone) {
      _inheritsLoose(SystemZone, _Zone);
      function SystemZone() {
        return _Zone.apply(this, arguments) || this;
      }
      var _proto = SystemZone.prototype;
      _proto.offsetName = function offsetName(ts, _ref) {
        var format = _ref.format, locale = _ref.locale;
        return parseZoneInfo(ts, format, locale);
      };
      _proto.formatOffset = function formatOffset$1(ts, format) {
        return formatOffset(this.offset(ts), format);
      };
      _proto.offset = function offset(ts) {
        return -new Date(ts).getTimezoneOffset();
      };
      _proto.equals = function equals(otherZone) {
        return otherZone.type === "system";
      };
      _createClass(SystemZone, [{
        key: "type",
        get: function get() {
          return "system";
        }
      }, {
        key: "name",
        get: function get() {
          return new Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
      }, {
        key: "isUniversal",
        get: function get() {
          return false;
        }
      }, {
        key: "isValid",
        get: function get() {
          return true;
        }
      }], [{
        key: "instance",
        get: function get() {
          if (singleton$1 === null) {
            singleton$1 = new SystemZone();
          }
          return singleton$1;
        }
      }]);
      return SystemZone;
    })(Zone);
    var dtfCache = {};
    function makeDTF(zone) {
      if (!dtfCache[zone]) {
        dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
          hour12: false,
          timeZone: zone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          era: "short"
        });
      }
      return dtfCache[zone];
    }
    var typeToPos = {
      year: 0,
      month: 1,
      day: 2,
      era: 3,
      hour: 4,
      minute: 5,
      second: 6
    };
    function hackyOffset(dtf, date) {
      var formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = (/(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/).exec(formatted), fMonth = parsed[1], fDay = parsed[2], fYear = parsed[3], fadOrBc = parsed[4], fHour = parsed[5], fMinute = parsed[6], fSecond = parsed[7];
      return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
    }
    function partsOffset(dtf, date) {
      var formatted = dtf.formatToParts(date);
      var filled = [];
      for (var i = 0; i < formatted.length; i++) {
        var _formatted$i = formatted[i], type = _formatted$i.type, value = _formatted$i.value;
        var pos = typeToPos[type];
        if (type === "era") {
          filled[pos] = value;
        } else if (!isUndefined(pos)) {
          filled[pos] = parseInt(value, 10);
        }
      }
      return filled;
    }
    var ianaZoneCache = {};
    var IANAZone = (function (_Zone) {
      _inheritsLoose(IANAZone, _Zone);
      IANAZone.create = function create(name) {
        if (!ianaZoneCache[name]) {
          ianaZoneCache[name] = new IANAZone(name);
        }
        return ianaZoneCache[name];
      };
      IANAZone.resetCache = function resetCache() {
        ianaZoneCache = {};
        dtfCache = {};
      };
      IANAZone.isValidSpecifier = function isValidSpecifier(s) {
        return this.isValidZone(s);
      };
      IANAZone.isValidZone = function isValidZone(zone) {
        if (!zone) {
          return false;
        }
        try {
          new Intl.DateTimeFormat("en-US", {
            timeZone: zone
          }).format();
          return true;
        } catch (e) {
          return false;
        }
      };
      function IANAZone(name) {
        var _this;
        _this = _Zone.call(this) || this;
        _this.zoneName = name;
        _this.valid = IANAZone.isValidZone(name);
        return _this;
      }
      var _proto = IANAZone.prototype;
      _proto.offsetName = function offsetName(ts, _ref) {
        var format = _ref.format, locale = _ref.locale;
        return parseZoneInfo(ts, format, locale, this.name);
      };
      _proto.formatOffset = function formatOffset$1(ts, format) {
        return formatOffset(this.offset(ts), format);
      };
      _proto.offset = function offset(ts) {
        var date = new Date(ts);
        if (isNaN(date)) return NaN;
        var dtf = makeDTF(this.name);
        var _ref2 = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date), year = _ref2[0], month = _ref2[1], day = _ref2[2], adOrBc = _ref2[3], hour = _ref2[4], minute = _ref2[5], second = _ref2[6];
        if (adOrBc === "BC") {
          year = -Math.abs(year) + 1;
        }
        var adjustedHour = hour === 24 ? 0 : hour;
        var asUTC = objToLocalTS({
          year: year,
          month: month,
          day: day,
          hour: adjustedHour,
          minute: minute,
          second: second,
          millisecond: 0
        });
        var asTS = +date;
        var over = asTS % 1000;
        asTS -= over >= 0 ? over : 1000 + over;
        return (asUTC - asTS) / (60 * 1000);
      };
      _proto.equals = function equals(otherZone) {
        return otherZone.type === "iana" && otherZone.name === this.name;
      };
      _createClass(IANAZone, [{
        key: "type",
        get: function get() {
          return "iana";
        }
      }, {
        key: "name",
        get: function get() {
          return this.zoneName;
        }
      }, {
        key: "isUniversal",
        get: function get() {
          return false;
        }
      }, {
        key: "isValid",
        get: function get() {
          return this.valid;
        }
      }]);
      return IANAZone;
    })(Zone);
    var _excluded = ["base"], _excluded2 = ["padTo", "floor"];
    var intlLFCache = {};
    function getCachedLF(locString, opts) {
      if (opts === undefined) {
        opts = {};
      }
      var key = JSON.stringify([locString, opts]);
      var dtf = intlLFCache[key];
      if (!dtf) {
        dtf = new Intl.ListFormat(locString, opts);
        intlLFCache[key] = dtf;
      }
      return dtf;
    }
    var intlDTCache = {};
    function getCachedDTF(locString, opts) {
      if (opts === undefined) {
        opts = {};
      }
      var key = JSON.stringify([locString, opts]);
      var dtf = intlDTCache[key];
      if (!dtf) {
        dtf = new Intl.DateTimeFormat(locString, opts);
        intlDTCache[key] = dtf;
      }
      return dtf;
    }
    var intlNumCache = {};
    function getCachedINF(locString, opts) {
      if (opts === undefined) {
        opts = {};
      }
      var key = JSON.stringify([locString, opts]);
      var inf = intlNumCache[key];
      if (!inf) {
        inf = new Intl.NumberFormat(locString, opts);
        intlNumCache[key] = inf;
      }
      return inf;
    }
    var intlRelCache = {};
    function getCachedRTF(locString, opts) {
      if (opts === undefined) {
        opts = {};
      }
      var _opts = opts;
      _opts.base;
      var cacheKeyOpts = _objectWithoutPropertiesLoose(_opts, _excluded);
      var key = JSON.stringify([locString, cacheKeyOpts]);
      var inf = intlRelCache[key];
      if (!inf) {
        inf = new Intl.RelativeTimeFormat(locString, opts);
        intlRelCache[key] = inf;
      }
      return inf;
    }
    var sysLocaleCache = null;
    function systemLocale() {
      if (sysLocaleCache) {
        return sysLocaleCache;
      } else {
        sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
        return sysLocaleCache;
      }
    }
    var weekInfoCache = {};
    function getCachedWeekInfo(locString) {
      var data = weekInfoCache[locString];
      if (!data) {
        var locale = new Intl.Locale(locString);
        data = ("getWeekInfo" in locale) ? locale.getWeekInfo() : locale.weekInfo;
        weekInfoCache[locString] = data;
      }
      return data;
    }
    function parseLocaleString(localeStr) {
      var xIndex = localeStr.indexOf("-x-");
      if (xIndex !== -1) {
        localeStr = localeStr.substring(0, xIndex);
      }
      var uIndex = localeStr.indexOf("-u-");
      if (uIndex === -1) {
        return [localeStr];
      } else {
        var options;
        var selectedStr;
        try {
          options = getCachedDTF(localeStr).resolvedOptions();
          selectedStr = localeStr;
        } catch (e) {
          var smaller = localeStr.substring(0, uIndex);
          options = getCachedDTF(smaller).resolvedOptions();
          selectedStr = smaller;
        }
        var _options = options, numberingSystem = _options.numberingSystem, calendar = _options.calendar;
        return [selectedStr, numberingSystem, calendar];
      }
    }
    function intlConfigString(localeStr, numberingSystem, outputCalendar) {
      if (outputCalendar || numberingSystem) {
        if (!localeStr.includes("-u-")) {
          localeStr += "-u";
        }
        if (outputCalendar) {
          localeStr += "-ca-" + outputCalendar;
        }
        if (numberingSystem) {
          localeStr += "-nu-" + numberingSystem;
        }
        return localeStr;
      } else {
        return localeStr;
      }
    }
    function mapMonths(f) {
      var ms = [];
      for (var i = 1; i <= 12; i++) {
        var dt = DateTime.utc(2009, i, 1);
        ms.push(f(dt));
      }
      return ms;
    }
    function mapWeekdays(f) {
      var ms = [];
      for (var i = 1; i <= 7; i++) {
        var dt = DateTime.utc(2016, 11, 13 + i);
        ms.push(f(dt));
      }
      return ms;
    }
    function listStuff(loc, length, englishFn, intlFn) {
      var mode = loc.listingMode();
      if (mode === "error") {
        return null;
      } else if (mode === "en") {
        return englishFn(length);
      } else {
        return intlFn(length);
      }
    }
    function supportsFastNumbers(loc) {
      if (loc.numberingSystem && loc.numberingSystem !== "latn") {
        return false;
      } else {
        return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn";
      }
    }
    var PolyNumberFormatter = (function () {
      function PolyNumberFormatter(intl, forceSimple, opts) {
        this.padTo = opts.padTo || 0;
        this.floor = opts.floor || false;
        opts.padTo;
        opts.floor;
        var otherOpts = _objectWithoutPropertiesLoose(opts, _excluded2);
        if (!forceSimple || Object.keys(otherOpts).length > 0) {
          var intlOpts = _extends({
            useGrouping: false
          }, opts);
          if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
          this.inf = getCachedINF(intl, intlOpts);
        }
      }
      var _proto = PolyNumberFormatter.prototype;
      _proto.format = function format(i) {
        if (this.inf) {
          var fixed = this.floor ? Math.floor(i) : i;
          return this.inf.format(fixed);
        } else {
          var _fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
          return padStart(_fixed, this.padTo);
        }
      };
      return PolyNumberFormatter;
    })();
    var PolyDateFormatter = (function () {
      function PolyDateFormatter(dt, intl, opts) {
        this.opts = opts;
        this.originalZone = undefined;
        var z = undefined;
        if (this.opts.timeZone) {
          this.dt = dt;
        } else if (dt.zone.type === "fixed") {
          var gmtOffset = -1 * (dt.offset / 60);
          var offsetZ = gmtOffset >= 0 ? "Etc/GMT+" + gmtOffset : "Etc/GMT" + gmtOffset;
          if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
            z = offsetZ;
            this.dt = dt;
          } else {
            z = "UTC";
            this.dt = dt.offset === 0 ? dt : dt.setZone("UTC").plus({
              minutes: dt.offset
            });
            this.originalZone = dt.zone;
          }
        } else if (dt.zone.type === "system") {
          this.dt = dt;
        } else if (dt.zone.type === "iana") {
          this.dt = dt;
          z = dt.zone.name;
        } else {
          z = "UTC";
          this.dt = dt.setZone("UTC").plus({
            minutes: dt.offset
          });
          this.originalZone = dt.zone;
        }
        var intlOpts = _extends({}, this.opts);
        intlOpts.timeZone = intlOpts.timeZone || z;
        this.dtf = getCachedDTF(intl, intlOpts);
      }
      var _proto2 = PolyDateFormatter.prototype;
      _proto2.format = function format() {
        if (this.originalZone) {
          return this.formatToParts().map(function (_ref) {
            var value = _ref.value;
            return value;
          }).join("");
        }
        return this.dtf.format(this.dt.toJSDate());
      };
      _proto2.formatToParts = function formatToParts() {
        var _this = this;
        var parts = this.dtf.formatToParts(this.dt.toJSDate());
        if (this.originalZone) {
          return parts.map(function (part) {
            if (part.type === "timeZoneName") {
              var offsetName = _this.originalZone.offsetName(_this.dt.ts, {
                locale: _this.dt.locale,
                format: _this.opts.timeZoneName
              });
              return _extends({}, part, {
                value: offsetName
              });
            } else {
              return part;
            }
          });
        }
        return parts;
      };
      _proto2.resolvedOptions = function resolvedOptions() {
        return this.dtf.resolvedOptions();
      };
      return PolyDateFormatter;
    })();
    var PolyRelFormatter = (function () {
      function PolyRelFormatter(intl, isEnglish, opts) {
        this.opts = _extends({
          style: "long"
        }, opts);
        if (!isEnglish && hasRelative()) {
          this.rtf = getCachedRTF(intl, opts);
        }
      }
      var _proto3 = PolyRelFormatter.prototype;
      _proto3.format = function format(count, unit) {
        if (this.rtf) {
          return this.rtf.format(count, unit);
        } else {
          return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
        }
      };
      _proto3.formatToParts = function formatToParts(count, unit) {
        if (this.rtf) {
          return this.rtf.formatToParts(count, unit);
        } else {
          return [];
        }
      };
      return PolyRelFormatter;
    })();
    var fallbackWeekSettings = {
      firstDay: 1,
      minimalDays: 4,
      weekend: [6, 7]
    };
    var Locale = (function () {
      Locale.fromOpts = function fromOpts(opts) {
        return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.weekSettings, opts.defaultToEN);
      };
      Locale.create = function create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN) {
        if (defaultToEN === undefined) {
          defaultToEN = false;
        }
        var specifiedLocale = locale || Settings.defaultLocale;
        var localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
        var numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
        var outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
        var weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
        return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
      };
      Locale.resetCache = function resetCache() {
        sysLocaleCache = null;
        intlDTCache = {};
        intlNumCache = {};
        intlRelCache = {};
      };
      Locale.fromObject = function fromObject(_temp) {
        var _ref2 = _temp === undefined ? {} : _temp, locale = _ref2.locale, numberingSystem = _ref2.numberingSystem, outputCalendar = _ref2.outputCalendar, weekSettings = _ref2.weekSettings;
        return Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
      };
      function Locale(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
        var _parseLocaleString = parseLocaleString(locale), parsedLocale = _parseLocaleString[0], parsedNumberingSystem = _parseLocaleString[1], parsedOutputCalendar = _parseLocaleString[2];
        this.locale = parsedLocale;
        this.numberingSystem = numbering || parsedNumberingSystem || null;
        this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
        this.weekSettings = weekSettings;
        this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
        this.weekdaysCache = {
          format: {},
          standalone: {}
        };
        this.monthsCache = {
          format: {},
          standalone: {}
        };
        this.meridiemCache = null;
        this.eraCache = {};
        this.specifiedLocale = specifiedLocale;
        this.fastNumbersCached = null;
      }
      var _proto4 = Locale.prototype;
      _proto4.listingMode = function listingMode() {
        var isActuallyEn = this.isEnglish();
        var hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
        return isActuallyEn && hasNoWeirdness ? "en" : "intl";
      };
      _proto4.clone = function clone(alts) {
        if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
          return this;
        } else {
          return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, validateWeekSettings(alts.weekSettings) || this.weekSettings, alts.defaultToEN || false);
        }
      };
      _proto4.redefaultToEN = function redefaultToEN(alts) {
        if (alts === undefined) {
          alts = {};
        }
        return this.clone(_extends({}, alts, {
          defaultToEN: true
        }));
      };
      _proto4.redefaultToSystem = function redefaultToSystem(alts) {
        if (alts === undefined) {
          alts = {};
        }
        return this.clone(_extends({}, alts, {
          defaultToEN: false
        }));
      };
      _proto4.months = function months$1(length, format) {
        var _this2 = this;
        if (format === undefined) {
          format = false;
        }
        return listStuff(this, length, months, function () {
          var intl = format ? {
            month: length,
            day: "numeric"
          } : {
            month: length
          }, formatStr = format ? "format" : "standalone";
          if (!_this2.monthsCache[formatStr][length]) {
            _this2.monthsCache[formatStr][length] = mapMonths(function (dt) {
              return _this2.extract(dt, intl, "month");
            });
          }
          return _this2.monthsCache[formatStr][length];
        });
      };
      _proto4.weekdays = function weekdays$1(length, format) {
        var _this3 = this;
        if (format === undefined) {
          format = false;
        }
        return listStuff(this, length, weekdays, function () {
          var intl = format ? {
            weekday: length,
            year: "numeric",
            month: "long",
            day: "numeric"
          } : {
            weekday: length
          }, formatStr = format ? "format" : "standalone";
          if (!_this3.weekdaysCache[formatStr][length]) {
            _this3.weekdaysCache[formatStr][length] = mapWeekdays(function (dt) {
              return _this3.extract(dt, intl, "weekday");
            });
          }
          return _this3.weekdaysCache[formatStr][length];
        });
      };
      _proto4.meridiems = function meridiems$1() {
        var _this4 = this;
        return listStuff(this, undefined, function () {
          return meridiems;
        }, function () {
          if (!_this4.meridiemCache) {
            var intl = {
              hour: "numeric",
              hourCycle: "h12"
            };
            _this4.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(function (dt) {
              return _this4.extract(dt, intl, "dayperiod");
            });
          }
          return _this4.meridiemCache;
        });
      };
      _proto4.eras = function eras$1(length) {
        var _this5 = this;
        return listStuff(this, length, eras, function () {
          var intl = {
            era: length
          };
          if (!_this5.eraCache[length]) {
            _this5.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(function (dt) {
              return _this5.extract(dt, intl, "era");
            });
          }
          return _this5.eraCache[length];
        });
      };
      _proto4.extract = function extract(dt, intlOpts, field) {
        var df = this.dtFormatter(dt, intlOpts), results = df.formatToParts(), matching = results.find(function (m) {
          return m.type.toLowerCase() === field;
        });
        return matching ? matching.value : null;
      };
      _proto4.numberFormatter = function numberFormatter(opts) {
        if (opts === undefined) {
          opts = {};
        }
        return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
      };
      _proto4.dtFormatter = function dtFormatter(dt, intlOpts) {
        if (intlOpts === undefined) {
          intlOpts = {};
        }
        return new PolyDateFormatter(dt, this.intl, intlOpts);
      };
      _proto4.relFormatter = function relFormatter(opts) {
        if (opts === undefined) {
          opts = {};
        }
        return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
      };
      _proto4.listFormatter = function listFormatter(opts) {
        if (opts === undefined) {
          opts = {};
        }
        return getCachedLF(this.intl, opts);
      };
      _proto4.isEnglish = function isEnglish() {
        return this.locale === "en" || this.locale.toLowerCase() === "en-us" || new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
      };
      _proto4.getWeekSettings = function getWeekSettings() {
        if (this.weekSettings) {
          return this.weekSettings;
        } else if (!hasLocaleWeekInfo()) {
          return fallbackWeekSettings;
        } else {
          return getCachedWeekInfo(this.locale);
        }
      };
      _proto4.getStartOfWeek = function getStartOfWeek() {
        return this.getWeekSettings().firstDay;
      };
      _proto4.getMinDaysInFirstWeek = function getMinDaysInFirstWeek() {
        return this.getWeekSettings().minimalDays;
      };
      _proto4.getWeekendDays = function getWeekendDays() {
        return this.getWeekSettings().weekend;
      };
      _proto4.equals = function equals(other) {
        return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
      };
      _proto4.toString = function toString() {
        return "Locale(" + this.locale + ", " + this.numberingSystem + ", " + this.outputCalendar + ")";
      };
      _createClass(Locale, [{
        key: "fastNumbers",
        get: function get() {
          if (this.fastNumbersCached == null) {
            this.fastNumbersCached = supportsFastNumbers(this);
          }
          return this.fastNumbersCached;
        }
      }]);
      return Locale;
    })();
    var singleton = null;
    var FixedOffsetZone = (function (_Zone) {
      _inheritsLoose(FixedOffsetZone, _Zone);
      FixedOffsetZone.instance = function instance(offset) {
        return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
      };
      FixedOffsetZone.parseSpecifier = function parseSpecifier(s) {
        if (s) {
          var r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
          if (r) {
            return new FixedOffsetZone(signedOffset(r[1], r[2]));
          }
        }
        return null;
      };
      function FixedOffsetZone(offset) {
        var _this;
        _this = _Zone.call(this) || this;
        _this.fixed = offset;
        return _this;
      }
      var _proto = FixedOffsetZone.prototype;
      _proto.offsetName = function offsetName() {
        return this.name;
      };
      _proto.formatOffset = function formatOffset$1(ts, format) {
        return formatOffset(this.fixed, format);
      };
      _proto.offset = function offset() {
        return this.fixed;
      };
      _proto.equals = function equals(otherZone) {
        return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
      };
      _createClass(FixedOffsetZone, [{
        key: "type",
        get: function get() {
          return "fixed";
        }
      }, {
        key: "name",
        get: function get() {
          return this.fixed === 0 ? "UTC" : "UTC" + formatOffset(this.fixed, "narrow");
        }
      }, {
        key: "ianaName",
        get: function get() {
          if (this.fixed === 0) {
            return "Etc/UTC";
          } else {
            return "Etc/GMT" + formatOffset(-this.fixed, "narrow");
          }
        }
      }, {
        key: "isUniversal",
        get: function get() {
          return true;
        }
      }, {
        key: "isValid",
        get: function get() {
          return true;
        }
      }], [{
        key: "utcInstance",
        get: function get() {
          if (singleton === null) {
            singleton = new FixedOffsetZone(0);
          }
          return singleton;
        }
      }]);
      return FixedOffsetZone;
    })(Zone);
    var InvalidZone = (function (_Zone) {
      _inheritsLoose(InvalidZone, _Zone);
      function InvalidZone(zoneName) {
        var _this;
        _this = _Zone.call(this) || this;
        _this.zoneName = zoneName;
        return _this;
      }
      var _proto = InvalidZone.prototype;
      _proto.offsetName = function offsetName() {
        return null;
      };
      _proto.formatOffset = function formatOffset() {
        return "";
      };
      _proto.offset = function offset() {
        return NaN;
      };
      _proto.equals = function equals() {
        return false;
      };
      _createClass(InvalidZone, [{
        key: "type",
        get: function get() {
          return "invalid";
        }
      }, {
        key: "name",
        get: function get() {
          return this.zoneName;
        }
      }, {
        key: "isUniversal",
        get: function get() {
          return false;
        }
      }, {
        key: "isValid",
        get: function get() {
          return false;
        }
      }]);
      return InvalidZone;
    })(Zone);
    function normalizeZone(input, defaultZone) {
      if (isUndefined(input) || input === null) {
        return defaultZone;
      } else if (input instanceof Zone) {
        return input;
      } else if (isString(input)) {
        var lowered = input.toLowerCase();
        if (lowered === "default") return defaultZone; else if (lowered === "local" || lowered === "system") return SystemZone.instance; else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance; else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
      } else if (isNumber(input)) {
        return FixedOffsetZone.instance(input);
      } else if (typeof input === "object" && ("offset" in input) && typeof input.offset === "function") {
        return input;
      } else {
        return new InvalidZone(input);
      }
    }
    var numberingSystems = {
      arab: "[٠-٩]",
      arabext: "[۰-۹]",
      bali: "[᭐-᭙]",
      beng: "[০-৯]",
      deva: "[०-९]",
      fullwide: "[０-９]",
      gujr: "[૦-૯]",
      hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
      khmr: "[០-៩]",
      knda: "[೦-೯]",
      laoo: "[໐-໙]",
      limb: "[᥆-᥏]",
      mlym: "[൦-൯]",
      mong: "[᠐-᠙]",
      mymr: "[၀-၉]",
      orya: "[୦-୯]",
      tamldec: "[௦-௯]",
      telu: "[౦-౯]",
      thai: "[๐-๙]",
      tibt: "[༠-༩]",
      latn: "\\d"
    };
    var numberingSystemsUTF16 = {
      arab: [1632, 1641],
      arabext: [1776, 1785],
      bali: [6992, 7001],
      beng: [2534, 2543],
      deva: [2406, 2415],
      fullwide: [65296, 65303],
      gujr: [2790, 2799],
      khmr: [6112, 6121],
      knda: [3302, 3311],
      laoo: [3792, 3801],
      limb: [6470, 6479],
      mlym: [3430, 3439],
      mong: [6160, 6169],
      mymr: [4160, 4169],
      orya: [2918, 2927],
      tamldec: [3046, 3055],
      telu: [3174, 3183],
      thai: [3664, 3673],
      tibt: [3872, 3881]
    };
    var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
    function parseDigits(str) {
      var value = parseInt(str, 10);
      if (isNaN(value)) {
        value = "";
        for (var i = 0; i < str.length; i++) {
          var code = str.charCodeAt(i);
          if (str[i].search(numberingSystems.hanidec) !== -1) {
            value += hanidecChars.indexOf(str[i]);
          } else {
            for (var key in numberingSystemsUTF16) {
              var _numberingSystemsUTF = numberingSystemsUTF16[key], min = _numberingSystemsUTF[0], max = _numberingSystemsUTF[1];
              if (code >= min && code <= max) {
                value += code - min;
              }
            }
          }
        }
        return parseInt(value, 10);
      } else {
        return value;
      }
    }
    var digitRegexCache = {};
    function resetDigitRegexCache() {
      digitRegexCache = {};
    }
    function digitRegex(_ref, append) {
      var numberingSystem = _ref.numberingSystem;
      if (append === undefined) {
        append = "";
      }
      var ns = numberingSystem || "latn";
      if (!digitRegexCache[ns]) {
        digitRegexCache[ns] = {};
      }
      if (!digitRegexCache[ns][append]) {
        digitRegexCache[ns][append] = new RegExp("" + numberingSystems[ns] + append);
      }
      return digitRegexCache[ns][append];
    }
    var now = function now() {
      return Date.now();
    }, defaultZone = "system", defaultLocale = null, defaultNumberingSystem = null, defaultOutputCalendar = null, twoDigitCutoffYear = 60, throwOnInvalid, defaultWeekSettings = null;
    var Settings = (function () {
      function Settings() {}
      Settings.resetCaches = function resetCaches() {
        Locale.resetCache();
        IANAZone.resetCache();
        DateTime.resetCache();
        resetDigitRegexCache();
      };
      _createClass(Settings, null, [{
        key: "now",
        get: function get() {
          return now;
        },
        set: function set(n) {
          now = n;
        }
      }, {
        key: "defaultZone",
        get: function get() {
          return normalizeZone(defaultZone, SystemZone.instance);
        },
        set: function set(zone) {
          defaultZone = zone;
        }
      }, {
        key: "defaultLocale",
        get: function get() {
          return defaultLocale;
        },
        set: function set(locale) {
          defaultLocale = locale;
        }
      }, {
        key: "defaultNumberingSystem",
        get: function get() {
          return defaultNumberingSystem;
        },
        set: function set(numberingSystem) {
          defaultNumberingSystem = numberingSystem;
        }
      }, {
        key: "defaultOutputCalendar",
        get: function get() {
          return defaultOutputCalendar;
        },
        set: function set(outputCalendar) {
          defaultOutputCalendar = outputCalendar;
        }
      }, {
        key: "defaultWeekSettings",
        get: function get() {
          return defaultWeekSettings;
        },
        set: function set(weekSettings) {
          defaultWeekSettings = validateWeekSettings(weekSettings);
        }
      }, {
        key: "twoDigitCutoffYear",
        get: function get() {
          return twoDigitCutoffYear;
        },
        set: function set(cutoffYear) {
          twoDigitCutoffYear = cutoffYear % 100;
        }
      }, {
        key: "throwOnInvalid",
        get: function get() {
          return throwOnInvalid;
        },
        set: function set(t) {
          throwOnInvalid = t;
        }
      }]);
      return Settings;
    })();
    var Invalid = (function () {
      function Invalid(reason, explanation) {
        this.reason = reason;
        this.explanation = explanation;
      }
      var _proto = Invalid.prototype;
      _proto.toMessage = function toMessage() {
        if (this.explanation) {
          return this.reason + ": " + this.explanation;
        } else {
          return this.reason;
        }
      };
      return Invalid;
    })();
    var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    function unitOutOfRange(unit, value) {
      return new Invalid("unit out of range", "you specified " + value + " (of type " + typeof value + ") as a " + unit + ", which is invalid");
    }
    function dayOfWeek(year, month, day) {
      var d = new Date(Date.UTC(year, month - 1, day));
      if (year < 100 && year >= 0) {
        d.setUTCFullYear(d.getUTCFullYear() - 1900);
      }
      var js = d.getUTCDay();
      return js === 0 ? 7 : js;
    }
    function computeOrdinal(year, month, day) {
      return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
    }
    function uncomputeOrdinal(year, ordinal) {
      var table = isLeapYear(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex(function (i) {
        return i < ordinal;
      }), day = ordinal - table[month0];
      return {
        month: month0 + 1,
        day: day
      };
    }
    function isoWeekdayToLocal(isoWeekday, startOfWeek) {
      return (isoWeekday - startOfWeek + 7) % 7 + 1;
    }
    function gregorianToWeek(gregObj, minDaysInFirstWeek, startOfWeek) {
      if (minDaysInFirstWeek === undefined) {
        minDaysInFirstWeek = 4;
      }
      if (startOfWeek === undefined) {
        startOfWeek = 1;
      }
      var year = gregObj.year, month = gregObj.month, day = gregObj.day, ordinal = computeOrdinal(year, month, day), weekday = isoWeekdayToLocal(dayOfWeek(year, month, day), startOfWeek);
      var weekNumber = Math.floor((ordinal - weekday + 14 - minDaysInFirstWeek) / 7), weekYear;
      if (weekNumber < 1) {
        weekYear = year - 1;
        weekNumber = weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek);
      } else if (weekNumber > weeksInWeekYear(year, minDaysInFirstWeek, startOfWeek)) {
        weekYear = year + 1;
        weekNumber = 1;
      } else {
        weekYear = year;
      }
      return _extends({
        weekYear: weekYear,
        weekNumber: weekNumber,
        weekday: weekday
      }, timeObject(gregObj));
    }
    function weekToGregorian(weekData, minDaysInFirstWeek, startOfWeek) {
      if (minDaysInFirstWeek === undefined) {
        minDaysInFirstWeek = 4;
      }
      if (startOfWeek === undefined) {
        startOfWeek = 1;
      }
      var weekYear = weekData.weekYear, weekNumber = weekData.weekNumber, weekday = weekData.weekday, weekdayOfJan4 = isoWeekdayToLocal(dayOfWeek(weekYear, 1, minDaysInFirstWeek), startOfWeek), yearInDays = daysInYear(weekYear);
      var ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 7 + minDaysInFirstWeek, year;
      if (ordinal < 1) {
        year = weekYear - 1;
        ordinal += daysInYear(year);
      } else if (ordinal > yearInDays) {
        year = weekYear + 1;
        ordinal -= daysInYear(weekYear);
      } else {
        year = weekYear;
      }
      var _uncomputeOrdinal = uncomputeOrdinal(year, ordinal), month = _uncomputeOrdinal.month, day = _uncomputeOrdinal.day;
      return _extends({
        year: year,
        month: month,
        day: day
      }, timeObject(weekData));
    }
    function gregorianToOrdinal(gregData) {
      var year = gregData.year, month = gregData.month, day = gregData.day;
      var ordinal = computeOrdinal(year, month, day);
      return _extends({
        year: year,
        ordinal: ordinal
      }, timeObject(gregData));
    }
    function ordinalToGregorian(ordinalData) {
      var year = ordinalData.year, ordinal = ordinalData.ordinal;
      var _uncomputeOrdinal2 = uncomputeOrdinal(year, ordinal), month = _uncomputeOrdinal2.month, day = _uncomputeOrdinal2.day;
      return _extends({
        year: year,
        month: month,
        day: day
      }, timeObject(ordinalData));
    }
    function usesLocalWeekValues(obj, loc) {
      var hasLocaleWeekData = !isUndefined(obj.localWeekday) || !isUndefined(obj.localWeekNumber) || !isUndefined(obj.localWeekYear);
      if (hasLocaleWeekData) {
        var hasIsoWeekData = !isUndefined(obj.weekday) || !isUndefined(obj.weekNumber) || !isUndefined(obj.weekYear);
        if (hasIsoWeekData) {
          throw new ConflictingSpecificationError("Cannot mix locale-based week fields with ISO-based week fields");
        }
        if (!isUndefined(obj.localWeekday)) obj.weekday = obj.localWeekday;
        if (!isUndefined(obj.localWeekNumber)) obj.weekNumber = obj.localWeekNumber;
        if (!isUndefined(obj.localWeekYear)) obj.weekYear = obj.localWeekYear;
        delete obj.localWeekday;
        delete obj.localWeekNumber;
        delete obj.localWeekYear;
        return {
          minDaysInFirstWeek: loc.getMinDaysInFirstWeek(),
          startOfWeek: loc.getStartOfWeek()
        };
      } else {
        return {
          minDaysInFirstWeek: 4,
          startOfWeek: 1
        };
      }
    }
    function hasInvalidWeekData(obj, minDaysInFirstWeek, startOfWeek) {
      if (minDaysInFirstWeek === undefined) {
        minDaysInFirstWeek = 4;
      }
      if (startOfWeek === undefined) {
        startOfWeek = 1;
      }
      var validYear = isInteger(obj.weekYear), validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear, minDaysInFirstWeek, startOfWeek)), validWeekday = integerBetween(obj.weekday, 1, 7);
      if (!validYear) {
        return unitOutOfRange("weekYear", obj.weekYear);
      } else if (!validWeek) {
        return unitOutOfRange("week", obj.weekNumber);
      } else if (!validWeekday) {
        return unitOutOfRange("weekday", obj.weekday);
      } else return false;
    }
    function hasInvalidOrdinalData(obj) {
      var validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
      if (!validYear) {
        return unitOutOfRange("year", obj.year);
      } else if (!validOrdinal) {
        return unitOutOfRange("ordinal", obj.ordinal);
      } else return false;
    }
    function hasInvalidGregorianData(obj) {
      var validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
      if (!validYear) {
        return unitOutOfRange("year", obj.year);
      } else if (!validMonth) {
        return unitOutOfRange("month", obj.month);
      } else if (!validDay) {
        return unitOutOfRange("day", obj.day);
      } else return false;
    }
    function hasInvalidTimeData(obj) {
      var hour = obj.hour, minute = obj.minute, second = obj.second, millisecond = obj.millisecond;
      var validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
      if (!validHour) {
        return unitOutOfRange("hour", hour);
      } else if (!validMinute) {
        return unitOutOfRange("minute", minute);
      } else if (!validSecond) {
        return unitOutOfRange("second", second);
      } else if (!validMillisecond) {
        return unitOutOfRange("millisecond", millisecond);
      } else return false;
    }
    function isUndefined(o) {
      return typeof o === "undefined";
    }
    function isNumber(o) {
      return typeof o === "number";
    }
    function isInteger(o) {
      return typeof o === "number" && o % 1 === 0;
    }
    function isString(o) {
      return typeof o === "string";
    }
    function isDate(o) {
      return Object.prototype.toString.call(o) === "[object Date]";
    }
    function hasRelative() {
      try {
        return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
      } catch (e) {
        return false;
      }
    }
    function hasLocaleWeekInfo() {
      try {
        return typeof Intl !== "undefined" && !!Intl.Locale && (("weekInfo" in Intl.Locale.prototype) || ("getWeekInfo" in Intl.Locale.prototype));
      } catch (e) {
        return false;
      }
    }
    function maybeArray(thing) {
      return Array.isArray(thing) ? thing : [thing];
    }
    function bestBy(arr, by, compare) {
      if (arr.length === 0) {
        return undefined;
      }
      return arr.reduce(function (best, next) {
        var pair = [by(next), next];
        if (!best) {
          return pair;
        } else if (compare(best[0], pair[0]) === best[0]) {
          return best;
        } else {
          return pair;
        }
      }, null)[1];
    }
    function pick(obj, keys) {
      return keys.reduce(function (a, k) {
        a[k] = obj[k];
        return a;
      }, {});
    }
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    function validateWeekSettings(settings) {
      if (settings == null) {
        return null;
      } else if (typeof settings !== "object") {
        throw new InvalidArgumentError("Week settings must be an object");
      } else {
        if (!integerBetween(settings.firstDay, 1, 7) || !integerBetween(settings.minimalDays, 1, 7) || !Array.isArray(settings.weekend) || settings.weekend.some(function (v) {
          return !integerBetween(v, 1, 7);
        })) {
          throw new InvalidArgumentError("Invalid week settings");
        }
        return {
          firstDay: settings.firstDay,
          minimalDays: settings.minimalDays,
          weekend: Array.from(settings.weekend)
        };
      }
    }
    function integerBetween(thing, bottom, top) {
      return isInteger(thing) && thing >= bottom && thing <= top;
    }
    function floorMod(x, n) {
      return x - n * Math.floor(x / n);
    }
    function padStart(input, n) {
      if (n === undefined) {
        n = 2;
      }
      var isNeg = input < 0;
      var padded;
      if (isNeg) {
        padded = "-" + ("" + -input).padStart(n, "0");
      } else {
        padded = ("" + input).padStart(n, "0");
      }
      return padded;
    }
    function parseInteger(string) {
      if (isUndefined(string) || string === null || string === "") {
        return undefined;
      } else {
        return parseInt(string, 10);
      }
    }
    function parseFloating(string) {
      if (isUndefined(string) || string === null || string === "") {
        return undefined;
      } else {
        return parseFloat(string);
      }
    }
    function parseMillis(fraction) {
      if (isUndefined(fraction) || fraction === null || fraction === "") {
        return undefined;
      } else {
        var f = parseFloat("0." + fraction) * 1000;
        return Math.floor(f);
      }
    }
    function roundTo(number, digits, towardZero) {
      if (towardZero === undefined) {
        towardZero = false;
      }
      var factor = Math.pow(10, digits), rounder = towardZero ? Math.trunc : Math.round;
      return rounder(number * factor) / factor;
    }
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    function daysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    function daysInMonth(year, month) {
      var modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
      if (modMonth === 2) {
        return isLeapYear(modYear) ? 29 : 28;
      } else {
        return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
      }
    }
    function objToLocalTS(obj) {
      var d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond);
      if (obj.year < 100 && obj.year >= 0) {
        d = new Date(d);
        d.setUTCFullYear(obj.year, obj.month - 1, obj.day);
      }
      return +d;
    }
    function firstWeekOffset(year, minDaysInFirstWeek, startOfWeek) {
      var fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
      return -fwdlw + minDaysInFirstWeek - 1;
    }
    function weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek) {
      if (minDaysInFirstWeek === undefined) {
        minDaysInFirstWeek = 4;
      }
      if (startOfWeek === undefined) {
        startOfWeek = 1;
      }
      var weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
      var weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
      return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
    }
    function untruncateYear(year) {
      if (year > 99) {
        return year;
      } else return year > Settings.twoDigitCutoffYear ? 1900 + year : 2000 + year;
    }
    function parseZoneInfo(ts, offsetFormat, locale, timeZone) {
      if (timeZone === undefined) {
        timeZone = null;
      }
      var date = new Date(ts), intlOpts = {
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      };
      if (timeZone) {
        intlOpts.timeZone = timeZone;
      }
      var modified = _extends({
        timeZoneName: offsetFormat
      }, intlOpts);
      var parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find(function (m) {
        return m.type.toLowerCase() === "timezonename";
      });
      return parsed ? parsed.value : null;
    }
    function signedOffset(offHourStr, offMinuteStr) {
      var offHour = parseInt(offHourStr, 10);
      if (Number.isNaN(offHour)) {
        offHour = 0;
      }
      var offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
      return offHour * 60 + offMinSigned;
    }
    function asNumber(value) {
      var numericValue = Number(value);
      if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue)) throw new InvalidArgumentError("Invalid unit value " + value);
      return numericValue;
    }
    function normalizeObject(obj, normalizer) {
      var normalized = {};
      for (var u in obj) {
        if (hasOwnProperty(obj, u)) {
          var v = obj[u];
          if (v === undefined || v === null) continue;
          normalized[normalizer(u)] = asNumber(v);
        }
      }
      return normalized;
    }
    function formatOffset(offset, format) {
      var hours = Math.trunc(Math.abs(offset / 60)), minutes = Math.trunc(Math.abs(offset % 60)), sign = offset >= 0 ? "+" : "-";
      switch (format) {
        case "short":
          return "" + sign + padStart(hours, 2) + ":" + padStart(minutes, 2);
        case "narrow":
          return "" + sign + hours + (minutes > 0 ? ":" + minutes : "");
        case "techie":
          return "" + sign + padStart(hours, 2) + padStart(minutes, 2);
        default:
          throw new RangeError("Value format " + format + " is out of range for property format");
      }
    }
    function timeObject(obj) {
      return pick(obj, ["hour", "minute", "second", "millisecond"]);
    }
    var monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    function months(length) {
      switch (length) {
        case "narrow":
          return [].concat(monthsNarrow);
        case "short":
          return [].concat(monthsShort);
        case "long":
          return [].concat(monthsLong);
        case "numeric":
          return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        case "2-digit":
          return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        default:
          return null;
      }
    }
    var weekdaysLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
    function weekdays(length) {
      switch (length) {
        case "narrow":
          return [].concat(weekdaysNarrow);
        case "short":
          return [].concat(weekdaysShort);
        case "long":
          return [].concat(weekdaysLong);
        case "numeric":
          return ["1", "2", "3", "4", "5", "6", "7"];
        default:
          return null;
      }
    }
    var meridiems = ["AM", "PM"];
    var erasLong = ["Before Christ", "Anno Domini"];
    var erasShort = ["BC", "AD"];
    var erasNarrow = ["B", "A"];
    function eras(length) {
      switch (length) {
        case "narrow":
          return [].concat(erasNarrow);
        case "short":
          return [].concat(erasShort);
        case "long":
          return [].concat(erasLong);
        default:
          return null;
      }
    }
    function meridiemForDateTime(dt) {
      return meridiems[dt.hour < 12 ? 0 : 1];
    }
    function weekdayForDateTime(dt, length) {
      return weekdays(length)[dt.weekday - 1];
    }
    function monthForDateTime(dt, length) {
      return months(length)[dt.month - 1];
    }
    function eraForDateTime(dt, length) {
      return eras(length)[dt.year < 0 ? 0 : 1];
    }
    function formatRelativeTime(unit, count, numeric, narrow) {
      if (numeric === undefined) {
        numeric = "always";
      }
      if (narrow === undefined) {
        narrow = false;
      }
      var units = {
        years: ["year", "yr."],
        quarters: ["quarter", "qtr."],
        months: ["month", "mo."],
        weeks: ["week", "wk."],
        days: ["day", "day", "days"],
        hours: ["hour", "hr."],
        minutes: ["minute", "min."],
        seconds: ["second", "sec."]
      };
      var lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;
      if (numeric === "auto" && lastable) {
        var isDay = unit === "days";
        switch (count) {
          case 1:
            return isDay ? "tomorrow" : "next " + units[unit][0];
          case -1:
            return isDay ? "yesterday" : "last " + units[unit][0];
          case 0:
            return isDay ? "today" : "this " + units[unit][0];
        }
      }
      var isInPast = Object.is(count, -0) || count < 0, fmtValue = Math.abs(count), singular = fmtValue === 1, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
      return isInPast ? fmtValue + " " + fmtUnit + " ago" : "in " + fmtValue + " " + fmtUnit;
    }
    function stringifyTokens(splits, tokenToString) {
      var s = "";
      for (var _iterator = _createForOfIteratorHelperLoose(splits), _step; !(_step = _iterator()).done; ) {
        var token = _step.value;
        if (token.literal) {
          s += token.val;
        } else {
          s += tokenToString(token.val);
        }
      }
      return s;
    }
    var _macroTokenToFormatOpts = {
      D: DATE_SHORT,
      DD: DATE_MED,
      DDD: DATE_FULL,
      DDDD: DATE_HUGE,
      t: TIME_SIMPLE,
      tt: TIME_WITH_SECONDS,
      ttt: TIME_WITH_SHORT_OFFSET,
      tttt: TIME_WITH_LONG_OFFSET,
      T: TIME_24_SIMPLE,
      TT: TIME_24_WITH_SECONDS,
      TTT: TIME_24_WITH_SHORT_OFFSET,
      TTTT: TIME_24_WITH_LONG_OFFSET,
      f: DATETIME_SHORT,
      ff: DATETIME_MED,
      fff: DATETIME_FULL,
      ffff: DATETIME_HUGE,
      F: DATETIME_SHORT_WITH_SECONDS,
      FF: DATETIME_MED_WITH_SECONDS,
      FFF: DATETIME_FULL_WITH_SECONDS,
      FFFF: DATETIME_HUGE_WITH_SECONDS
    };
    var Formatter = (function () {
      Formatter.create = function create(locale, opts) {
        if (opts === undefined) {
          opts = {};
        }
        return new Formatter(locale, opts);
      };
      Formatter.parseFormat = function parseFormat(fmt) {
        var current = null, currentFull = "", bracketed = false;
        var splits = [];
        for (var i = 0; i < fmt.length; i++) {
          var c = fmt.charAt(i);
          if (c === "'") {
            if (currentFull.length > 0) {
              splits.push({
                literal: bracketed || (/^\s+$/).test(currentFull),
                val: currentFull
              });
            }
            current = null;
            currentFull = "";
            bracketed = !bracketed;
          } else if (bracketed) {
            currentFull += c;
          } else if (c === current) {
            currentFull += c;
          } else {
            if (currentFull.length > 0) {
              splits.push({
                literal: (/^\s+$/).test(currentFull),
                val: currentFull
              });
            }
            currentFull = c;
            current = c;
          }
        }
        if (currentFull.length > 0) {
          splits.push({
            literal: bracketed || (/^\s+$/).test(currentFull),
            val: currentFull
          });
        }
        return splits;
      };
      Formatter.macroTokenToFormatOpts = function macroTokenToFormatOpts(token) {
        return _macroTokenToFormatOpts[token];
      };
      function Formatter(locale, formatOpts) {
        this.opts = formatOpts;
        this.loc = locale;
        this.systemLoc = null;
      }
      var _proto = Formatter.prototype;
      _proto.formatWithSystemDefault = function formatWithSystemDefault(dt, opts) {
        if (this.systemLoc === null) {
          this.systemLoc = this.loc.redefaultToSystem();
        }
        var df = this.systemLoc.dtFormatter(dt, _extends({}, this.opts, opts));
        return df.format();
      };
      _proto.dtFormatter = function dtFormatter(dt, opts) {
        if (opts === undefined) {
          opts = {};
        }
        return this.loc.dtFormatter(dt, _extends({}, this.opts, opts));
      };
      _proto.formatDateTime = function formatDateTime(dt, opts) {
        return this.dtFormatter(dt, opts).format();
      };
      _proto.formatDateTimeParts = function formatDateTimeParts(dt, opts) {
        return this.dtFormatter(dt, opts).formatToParts();
      };
      _proto.formatInterval = function formatInterval(interval, opts) {
        var df = this.dtFormatter(interval.start, opts);
        return df.dtf.formatRange(interval.start.toJSDate(), interval.end.toJSDate());
      };
      _proto.resolvedOptions = function resolvedOptions(dt, opts) {
        return this.dtFormatter(dt, opts).resolvedOptions();
      };
      _proto.num = function num(n, p) {
        if (p === undefined) {
          p = 0;
        }
        if (this.opts.forceSimple) {
          return padStart(n, p);
        }
        var opts = _extends({}, this.opts);
        if (p > 0) {
          opts.padTo = p;
        }
        return this.loc.numberFormatter(opts).format(n);
      };
      _proto.formatDateTimeFromString = function formatDateTimeFromString(dt, fmt) {
        var _this = this;
        var knownEnglish = this.loc.listingMode() === "en", useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", string = function string(opts, extract) {
          return _this.loc.extract(dt, opts, extract);
        }, formatOffset = function formatOffset(opts) {
          if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
            return "Z";
          }
          return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
        }, meridiem = function meridiem() {
          return knownEnglish ? meridiemForDateTime(dt) : string({
            hour: "numeric",
            hourCycle: "h12"
          }, "dayperiod");
        }, month = function month(length, standalone) {
          return knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
            month: length
          } : {
            month: length,
            day: "numeric"
          }, "month");
        }, weekday = function weekday(length, standalone) {
          return knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
            weekday: length
          } : {
            weekday: length,
            month: "long",
            day: "numeric"
          }, "weekday");
        }, maybeMacro = function maybeMacro(token) {
          var formatOpts = Formatter.macroTokenToFormatOpts(token);
          if (formatOpts) {
            return _this.formatWithSystemDefault(dt, formatOpts);
          } else {
            return token;
          }
        }, era = function era(length) {
          return knownEnglish ? eraForDateTime(dt, length) : string({
            era: length
          }, "era");
        }, tokenToString = function tokenToString(token) {
          switch (token) {
            case "S":
              return _this.num(dt.millisecond);
            case "u":
            case "SSS":
              return _this.num(dt.millisecond, 3);
            case "s":
              return _this.num(dt.second);
            case "ss":
              return _this.num(dt.second, 2);
            case "uu":
              return _this.num(Math.floor(dt.millisecond / 10), 2);
            case "uuu":
              return _this.num(Math.floor(dt.millisecond / 100));
            case "m":
              return _this.num(dt.minute);
            case "mm":
              return _this.num(dt.minute, 2);
            case "h":
              return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
            case "hh":
              return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
            case "H":
              return _this.num(dt.hour);
            case "HH":
              return _this.num(dt.hour, 2);
            case "Z":
              return formatOffset({
                format: "narrow",
                allowZ: _this.opts.allowZ
              });
            case "ZZ":
              return formatOffset({
                format: "short",
                allowZ: _this.opts.allowZ
              });
            case "ZZZ":
              return formatOffset({
                format: "techie",
                allowZ: _this.opts.allowZ
              });
            case "ZZZZ":
              return dt.zone.offsetName(dt.ts, {
                format: "short",
                locale: _this.loc.locale
              });
            case "ZZZZZ":
              return dt.zone.offsetName(dt.ts, {
                format: "long",
                locale: _this.loc.locale
              });
            case "z":
              return dt.zoneName;
            case "a":
              return meridiem();
            case "d":
              return useDateTimeFormatter ? string({
                day: "numeric"
              }, "day") : _this.num(dt.day);
            case "dd":
              return useDateTimeFormatter ? string({
                day: "2-digit"
              }, "day") : _this.num(dt.day, 2);
            case "c":
              return _this.num(dt.weekday);
            case "ccc":
              return weekday("short", true);
            case "cccc":
              return weekday("long", true);
            case "ccccc":
              return weekday("narrow", true);
            case "E":
              return _this.num(dt.weekday);
            case "EEE":
              return weekday("short", false);
            case "EEEE":
              return weekday("long", false);
            case "EEEEE":
              return weekday("narrow", false);
            case "L":
              return useDateTimeFormatter ? string({
                month: "numeric",
                day: "numeric"
              }, "month") : _this.num(dt.month);
            case "LL":
              return useDateTimeFormatter ? string({
                month: "2-digit",
                day: "numeric"
              }, "month") : _this.num(dt.month, 2);
            case "LLL":
              return month("short", true);
            case "LLLL":
              return month("long", true);
            case "LLLLL":
              return month("narrow", true);
            case "M":
              return useDateTimeFormatter ? string({
                month: "numeric"
              }, "month") : _this.num(dt.month);
            case "MM":
              return useDateTimeFormatter ? string({
                month: "2-digit"
              }, "month") : _this.num(dt.month, 2);
            case "MMM":
              return month("short", false);
            case "MMMM":
              return month("long", false);
            case "MMMMM":
              return month("narrow", false);
            case "y":
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : _this.num(dt.year);
            case "yy":
              return useDateTimeFormatter ? string({
                year: "2-digit"
              }, "year") : _this.num(dt.year.toString().slice(-2), 2);
            case "yyyy":
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : _this.num(dt.year, 4);
            case "yyyyyy":
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : _this.num(dt.year, 6);
            case "G":
              return era("short");
            case "GG":
              return era("long");
            case "GGGGG":
              return era("narrow");
            case "kk":
              return _this.num(dt.weekYear.toString().slice(-2), 2);
            case "kkkk":
              return _this.num(dt.weekYear, 4);
            case "W":
              return _this.num(dt.weekNumber);
            case "WW":
              return _this.num(dt.weekNumber, 2);
            case "n":
              return _this.num(dt.localWeekNumber);
            case "nn":
              return _this.num(dt.localWeekNumber, 2);
            case "ii":
              return _this.num(dt.localWeekYear.toString().slice(-2), 2);
            case "iiii":
              return _this.num(dt.localWeekYear, 4);
            case "o":
              return _this.num(dt.ordinal);
            case "ooo":
              return _this.num(dt.ordinal, 3);
            case "q":
              return _this.num(dt.quarter);
            case "qq":
              return _this.num(dt.quarter, 2);
            case "X":
              return _this.num(Math.floor(dt.ts / 1000));
            case "x":
              return _this.num(dt.ts);
            default:
              return maybeMacro(token);
          }
        };
        return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
      };
      _proto.formatDurationFromString = function formatDurationFromString(dur, fmt) {
        var _this2 = this;
        var tokenToField = function tokenToField(token) {
          switch (token[0]) {
            case "S":
              return "millisecond";
            case "s":
              return "second";
            case "m":
              return "minute";
            case "h":
              return "hour";
            case "d":
              return "day";
            case "w":
              return "week";
            case "M":
              return "month";
            case "y":
              return "year";
            default:
              return null;
          }
        }, tokenToString = function tokenToString(lildur) {
          return function (token) {
            var mapped = tokenToField(token);
            if (mapped) {
              return _this2.num(lildur.get(mapped), token.length);
            } else {
              return token;
            }
          };
        }, tokens = Formatter.parseFormat(fmt), realTokens = tokens.reduce(function (found, _ref) {
          var literal = _ref.literal, val = _ref.val;
          return literal ? found : found.concat(val);
        }, []), collapsed = dur.shiftTo.apply(dur, realTokens.map(tokenToField).filter(function (t) {
          return t;
        }));
        return stringifyTokens(tokens, tokenToString(collapsed));
      };
      return Formatter;
    })();
    var ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
    function combineRegexes() {
      for (var _len = arguments.length, regexes = new Array(_len), _key = 0; _key < _len; _key++) {
        regexes[_key] = arguments[_key];
      }
      var full = regexes.reduce(function (f, r) {
        return f + r.source;
      }, "");
      return RegExp("^" + full + "$");
    }
    function combineExtractors() {
      for (var _len2 = arguments.length, extractors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        extractors[_key2] = arguments[_key2];
      }
      return function (m) {
        return extractors.reduce(function (_ref, ex) {
          var mergedVals = _ref[0], mergedZone = _ref[1], cursor = _ref[2];
          var _ex = ex(m, cursor), val = _ex[0], zone = _ex[1], next = _ex[2];
          return [_extends({}, mergedVals, val), zone || mergedZone, next];
        }, [{}, null, 1]).slice(0, 2);
      };
    }
    function parse(s) {
      if (s == null) {
        return [null, null];
      }
      for (var _len3 = arguments.length, patterns = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        patterns[_key3 - 1] = arguments[_key3];
      }
      for (var _i = 0, _patterns = patterns; _i < _patterns.length; _i++) {
        var _patterns$_i = _patterns[_i], regex = _patterns$_i[0], extractor = _patterns$_i[1];
        var m = regex.exec(s);
        if (m) {
          return extractor(m);
        }
      }
      return [null, null];
    }
    function simpleParse() {
      for (var _len4 = arguments.length, keys = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        keys[_key4] = arguments[_key4];
      }
      return function (match, cursor) {
        var ret = {};
        var i;
        for (i = 0; i < keys.length; i++) {
          ret[keys[i]] = parseInteger(match[cursor + i]);
        }
        return [ret, null, cursor + i];
      };
    }
    var offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/;
    var isoExtendedZone = "(?:" + offsetRegex.source + "?(?:\\[(" + ianaRegex.source + ")\\])?)?";
    var isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
    var isoTimeRegex = RegExp("" + isoTimeBaseRegex.source + isoExtendedZone);
    var isoTimeExtensionRegex = RegExp("(?:T" + isoTimeRegex.source + ")?");
    var isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
    var isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
    var isoOrdinalRegex = /(\d{4})-?(\d{3})/;
    var extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
    var extractISOOrdinalData = simpleParse("year", "ordinal");
    var sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
    var sqlTimeRegex = RegExp(isoTimeBaseRegex.source + " ?(?:" + offsetRegex.source + "|(" + ianaRegex.source + "))?");
    var sqlTimeExtensionRegex = RegExp("(?: " + sqlTimeRegex.source + ")?");
    function int(match, pos, fallback) {
      var m = match[pos];
      return isUndefined(m) ? fallback : parseInteger(m);
    }
    function extractISOYmd(match, cursor) {
      var item = {
        year: int(match, cursor),
        month: int(match, cursor + 1, 1),
        day: int(match, cursor + 2, 1)
      };
      return [item, null, cursor + 3];
    }
    function extractISOTime(match, cursor) {
      var item = {
        hours: int(match, cursor, 0),
        minutes: int(match, cursor + 1, 0),
        seconds: int(match, cursor + 2, 0),
        milliseconds: parseMillis(match[cursor + 3])
      };
      return [item, null, cursor + 4];
    }
    function extractISOOffset(match, cursor) {
      var local = !match[cursor] && !match[cursor + 1], fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
      return [{}, zone, cursor + 3];
    }
    function extractIANAZone(match, cursor) {
      var zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
      return [{}, zone, cursor + 1];
    }
    var isoTimeOnly = RegExp("^T?" + isoTimeBaseRegex.source + "$");
    var isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
    function extractISODuration(match) {
      var s = match[0], yearStr = match[1], monthStr = match[2], weekStr = match[3], dayStr = match[4], hourStr = match[5], minuteStr = match[6], secondStr = match[7], millisecondsStr = match[8];
      var hasNegativePrefix = s[0] === "-";
      var negativeSeconds = secondStr && secondStr[0] === "-";
      var maybeNegate = function maybeNegate(num, force) {
        if (force === undefined) {
          force = false;
        }
        return num !== undefined && (force || num && hasNegativePrefix) ? -num : num;
      };
      return [{
        years: maybeNegate(parseFloating(yearStr)),
        months: maybeNegate(parseFloating(monthStr)),
        weeks: maybeNegate(parseFloating(weekStr)),
        days: maybeNegate(parseFloating(dayStr)),
        hours: maybeNegate(parseFloating(hourStr)),
        minutes: maybeNegate(parseFloating(minuteStr)),
        seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
        milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
      }];
    }
    var obsOffsets = {
      GMT: 0,
      EDT: -4 * 60,
      EST: -5 * 60,
      CDT: -5 * 60,
      CST: -6 * 60,
      MDT: -6 * 60,
      MST: -7 * 60,
      PDT: -7 * 60,
      PST: -8 * 60
    };
    function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
      var result = {
        year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
        month: monthsShort.indexOf(monthStr) + 1,
        day: parseInteger(dayStr),
        hour: parseInteger(hourStr),
        minute: parseInteger(minuteStr)
      };
      if (secondStr) result.second = parseInteger(secondStr);
      if (weekdayStr) {
        result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
      }
      return result;
    }
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
    function extractRFC2822(match) {
      var weekdayStr = match[1], dayStr = match[2], monthStr = match[3], yearStr = match[4], hourStr = match[5], minuteStr = match[6], secondStr = match[7], obsOffset = match[8], milOffset = match[9], offHourStr = match[10], offMinuteStr = match[11], result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      var offset;
      if (obsOffset) {
        offset = obsOffsets[obsOffset];
      } else if (milOffset) {
        offset = 0;
      } else {
        offset = signedOffset(offHourStr, offMinuteStr);
      }
      return [result, new FixedOffsetZone(offset)];
    }
    function preprocessRFC2822(s) {
      return s.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
    }
    var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/, rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/, ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
    function extractRFC1123Or850(match) {
      var weekdayStr = match[1], dayStr = match[2], monthStr = match[3], yearStr = match[4], hourStr = match[5], minuteStr = match[6], secondStr = match[7], result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      return [result, FixedOffsetZone.utcInstance];
    }
    function extractASCII(match) {
      var weekdayStr = match[1], monthStr = match[2], dayStr = match[3], hourStr = match[4], minuteStr = match[5], secondStr = match[6], yearStr = match[7], result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      return [result, FixedOffsetZone.utcInstance];
    }
    var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
    var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
    var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
    var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
    var extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
    function parseISODate(s) {
      return parse(s, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
    }
    function parseRFC2822Date(s) {
      return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
    }
    function parseHTTPDate(s) {
      return parse(s, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
    }
    function parseISODuration(s) {
      return parse(s, [isoDuration, extractISODuration]);
    }
    var extractISOTimeOnly = combineExtractors(extractISOTime);
    function parseISOTimeOnly(s) {
      return parse(s, [isoTimeOnly, extractISOTimeOnly]);
    }
    var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
    var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
    var extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
    function parseSQL(s) {
      return parse(s, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
    }
    var INVALID$2 = "Invalid Duration";
    var lowOrderMatrix = {
      weeks: {
        days: 7,
        hours: 7 * 24,
        minutes: 7 * 24 * 60,
        seconds: 7 * 24 * 60 * 60,
        milliseconds: 7 * 24 * 60 * 60 * 1000
      },
      days: {
        hours: 24,
        minutes: 24 * 60,
        seconds: 24 * 60 * 60,
        milliseconds: 24 * 60 * 60 * 1000
      },
      hours: {
        minutes: 60,
        seconds: 60 * 60,
        milliseconds: 60 * 60 * 1000
      },
      minutes: {
        seconds: 60,
        milliseconds: 60 * 1000
      },
      seconds: {
        milliseconds: 1000
      }
    }, casualMatrix = _extends({
      years: {
        quarters: 4,
        months: 12,
        weeks: 52,
        days: 365,
        hours: 365 * 24,
        minutes: 365 * 24 * 60,
        seconds: 365 * 24 * 60 * 60,
        milliseconds: 365 * 24 * 60 * 60 * 1000
      },
      quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 91 * 24,
        minutes: 91 * 24 * 60,
        seconds: 91 * 24 * 60 * 60,
        milliseconds: 91 * 24 * 60 * 60 * 1000
      },
      months: {
        weeks: 4,
        days: 30,
        hours: 30 * 24,
        minutes: 30 * 24 * 60,
        seconds: 30 * 24 * 60 * 60,
        milliseconds: 30 * 24 * 60 * 60 * 1000
      }
    }, lowOrderMatrix), daysInYearAccurate = 146097 / 400, daysInMonthAccurate = 146097 / 4800, accurateMatrix = _extends({
      years: {
        quarters: 4,
        months: 12,
        weeks: daysInYearAccurate / 7,
        days: daysInYearAccurate,
        hours: daysInYearAccurate * 24,
        minutes: daysInYearAccurate * 24 * 60,
        seconds: daysInYearAccurate * 24 * 60 * 60,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
      },
      quarters: {
        months: 3,
        weeks: daysInYearAccurate / 28,
        days: daysInYearAccurate / 4,
        hours: daysInYearAccurate * 24 / 4,
        minutes: daysInYearAccurate * 24 * 60 / 4,
        seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000 / 4
      },
      months: {
        weeks: daysInMonthAccurate / 7,
        days: daysInMonthAccurate,
        hours: daysInMonthAccurate * 24,
        minutes: daysInMonthAccurate * 24 * 60,
        seconds: daysInMonthAccurate * 24 * 60 * 60,
        milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
      }
    }, lowOrderMatrix);
    var orderedUnits$1 = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
    var reverseUnits = orderedUnits$1.slice(0).reverse();
    function clone$1(dur, alts, clear) {
      if (clear === undefined) {
        clear = false;
      }
      var conf = {
        values: clear ? alts.values : _extends({}, dur.values, alts.values || ({})),
        loc: dur.loc.clone(alts.loc),
        conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
        matrix: alts.matrix || dur.matrix
      };
      return new Duration(conf);
    }
    function durationToMillis(matrix, vals) {
      var _vals$milliseconds;
      var sum = (_vals$milliseconds = vals.milliseconds) != null ? _vals$milliseconds : 0;
      for (var _iterator = _createForOfIteratorHelperLoose(reverseUnits.slice(1)), _step; !(_step = _iterator()).done; ) {
        var unit = _step.value;
        if (vals[unit]) {
          sum += vals[unit] * matrix[unit]["milliseconds"];
        }
      }
      return sum;
    }
    function normalizeValues(matrix, vals) {
      var factor = durationToMillis(matrix, vals) < 0 ? -1 : 1;
      orderedUnits$1.reduceRight(function (previous, current) {
        if (!isUndefined(vals[current])) {
          if (previous) {
            var previousVal = vals[previous] * factor;
            var conv = matrix[current][previous];
            var rollUp = Math.floor(previousVal / conv);
            vals[current] += rollUp * factor;
            vals[previous] -= rollUp * conv * factor;
          }
          return current;
        } else {
          return previous;
        }
      }, null);
      orderedUnits$1.reduce(function (previous, current) {
        if (!isUndefined(vals[current])) {
          if (previous) {
            var fraction = vals[previous] % 1;
            vals[previous] -= fraction;
            vals[current] += fraction * matrix[previous][current];
          }
          return current;
        } else {
          return previous;
        }
      }, null);
    }
    function removeZeroes(vals) {
      var newVals = {};
      for (var _i = 0, _Object$entries = Object.entries(vals); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _Object$entries[_i], key = _Object$entries$_i[0], value = _Object$entries$_i[1];
        if (value !== 0) {
          newVals[key] = value;
        }
      }
      return newVals;
    }
    var Duration = (function (_Symbol$for) {
      function Duration(config) {
        var accurate = config.conversionAccuracy === "longterm" || false;
        var matrix = accurate ? accurateMatrix : casualMatrix;
        if (config.matrix) {
          matrix = config.matrix;
        }
        this.values = config.values;
        this.loc = config.loc || Locale.create();
        this.conversionAccuracy = accurate ? "longterm" : "casual";
        this.invalid = config.invalid || null;
        this.matrix = matrix;
        this.isLuxonDuration = true;
      }
      Duration.fromMillis = function fromMillis(count, opts) {
        return Duration.fromObject({
          milliseconds: count
        }, opts);
      };
      Duration.fromObject = function fromObject(obj, opts) {
        if (opts === undefined) {
          opts = {};
        }
        if (obj == null || typeof obj !== "object") {
          throw new InvalidArgumentError("Duration.fromObject: argument expected to be an object, got " + (obj === null ? "null" : typeof obj));
        }
        return new Duration({
          values: normalizeObject(obj, Duration.normalizeUnit),
          loc: Locale.fromObject(opts),
          conversionAccuracy: opts.conversionAccuracy,
          matrix: opts.matrix
        });
      };
      Duration.fromDurationLike = function fromDurationLike(durationLike) {
        if (isNumber(durationLike)) {
          return Duration.fromMillis(durationLike);
        } else if (Duration.isDuration(durationLike)) {
          return durationLike;
        } else if (typeof durationLike === "object") {
          return Duration.fromObject(durationLike);
        } else {
          throw new InvalidArgumentError("Unknown duration argument " + durationLike + " of type " + typeof durationLike);
        }
      };
      Duration.fromISO = function fromISO(text, opts) {
        var _parseISODuration = parseISODuration(text), parsed = _parseISODuration[0];
        if (parsed) {
          return Duration.fromObject(parsed, opts);
        } else {
          return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
        }
      };
      Duration.fromISOTime = function fromISOTime(text, opts) {
        var _parseISOTimeOnly = parseISOTimeOnly(text), parsed = _parseISOTimeOnly[0];
        if (parsed) {
          return Duration.fromObject(parsed, opts);
        } else {
          return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
        }
      };
      Duration.invalid = function invalid(reason, explanation) {
        if (explanation === undefined) {
          explanation = null;
        }
        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
        }
        var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
        if (Settings.throwOnInvalid) {
          throw new InvalidDurationError(invalid);
        } else {
          return new Duration({
            invalid: invalid
          });
        }
      };
      Duration.normalizeUnit = function normalizeUnit(unit) {
        var normalized = ({
          year: "years",
          years: "years",
          quarter: "quarters",
          quarters: "quarters",
          month: "months",
          months: "months",
          week: "weeks",
          weeks: "weeks",
          day: "days",
          days: "days",
          hour: "hours",
          hours: "hours",
          minute: "minutes",
          minutes: "minutes",
          second: "seconds",
          seconds: "seconds",
          millisecond: "milliseconds",
          milliseconds: "milliseconds"
        })[unit ? unit.toLowerCase() : unit];
        if (!normalized) throw new InvalidUnitError(unit);
        return normalized;
      };
      Duration.isDuration = function isDuration(o) {
        return o && o.isLuxonDuration || false;
      };
      var _proto = Duration.prototype;
      _proto.toFormat = function toFormat(fmt, opts) {
        if (opts === undefined) {
          opts = {};
        }
        var fmtOpts = _extends({}, opts, {
          floor: opts.round !== false && opts.floor !== false
        });
        return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID$2;
      };
      _proto.toHuman = function toHuman(opts) {
        var _this = this;
        if (opts === undefined) {
          opts = {};
        }
        if (!this.isValid) return INVALID$2;
        var l = orderedUnits$1.map(function (unit) {
          var val = _this.values[unit];
          if (isUndefined(val)) {
            return null;
          }
          return _this.loc.numberFormatter(_extends({
            style: "unit",
            unitDisplay: "long"
          }, opts, {
            unit: unit.slice(0, -1)
          })).format(val);
        }).filter(function (n) {
          return n;
        });
        return this.loc.listFormatter(_extends({
          type: "conjunction",
          style: opts.listStyle || "narrow"
        }, opts)).format(l);
      };
      _proto.toObject = function toObject() {
        if (!this.isValid) return {};
        return _extends({}, this.values);
      };
      _proto.toISO = function toISO() {
        if (!this.isValid) return null;
        var s = "P";
        if (this.years !== 0) s += this.years + "Y";
        if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
        if (this.weeks !== 0) s += this.weeks + "W";
        if (this.days !== 0) s += this.days + "D";
        if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) s += "T";
        if (this.hours !== 0) s += this.hours + "H";
        if (this.minutes !== 0) s += this.minutes + "M";
        if (this.seconds !== 0 || this.milliseconds !== 0) s += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
        if (s === "P") s += "T0S";
        return s;
      };
      _proto.toISOTime = function toISOTime(opts) {
        if (opts === undefined) {
          opts = {};
        }
        if (!this.isValid) return null;
        var millis = this.toMillis();
        if (millis < 0 || millis >= 86400000) return null;
        opts = _extends({
          suppressMilliseconds: false,
          suppressSeconds: false,
          includePrefix: false,
          format: "extended"
        }, opts, {
          includeOffset: false
        });
        var dateTime = DateTime.fromMillis(millis, {
          zone: "UTC"
        });
        return dateTime.toISOTime(opts);
      };
      _proto.toJSON = function toJSON() {
        return this.toISO();
      };
      _proto.toString = function toString() {
        return this.toISO();
      };
      _proto[_Symbol$for] = function () {
        if (this.isValid) {
          return "Duration { values: " + JSON.stringify(this.values) + " }";
        } else {
          return "Duration { Invalid, reason: " + this.invalidReason + " }";
        }
      };
      _proto.toMillis = function toMillis() {
        if (!this.isValid) return NaN;
        return durationToMillis(this.matrix, this.values);
      };
      _proto.valueOf = function valueOf() {
        return this.toMillis();
      };
      _proto.plus = function plus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration), result = {};
        for (var _i2 = 0, _orderedUnits = orderedUnits$1; _i2 < _orderedUnits.length; _i2++) {
          var k = _orderedUnits[_i2];
          if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
            result[k] = dur.get(k) + this.get(k);
          }
        }
        return clone$1(this, {
          values: result
        }, true);
      };
      _proto.minus = function minus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration);
        return this.plus(dur.negate());
      };
      _proto.mapUnits = function mapUnits(fn) {
        if (!this.isValid) return this;
        var result = {};
        for (var _i3 = 0, _Object$keys = Object.keys(this.values); _i3 < _Object$keys.length; _i3++) {
          var k = _Object$keys[_i3];
          result[k] = asNumber(fn(this.values[k], k));
        }
        return clone$1(this, {
          values: result
        }, true);
      };
      _proto.get = function get(unit) {
        return this[Duration.normalizeUnit(unit)];
      };
      _proto.set = function set(values) {
        if (!this.isValid) return this;
        var mixed = _extends({}, this.values, normalizeObject(values, Duration.normalizeUnit));
        return clone$1(this, {
          values: mixed
        });
      };
      _proto.reconfigure = function reconfigure(_temp) {
        var _ref = _temp === undefined ? {} : _temp, locale = _ref.locale, numberingSystem = _ref.numberingSystem, conversionAccuracy = _ref.conversionAccuracy, matrix = _ref.matrix;
        var loc = this.loc.clone({
          locale: locale,
          numberingSystem: numberingSystem
        });
        var opts = {
          loc: loc,
          matrix: matrix,
          conversionAccuracy: conversionAccuracy
        };
        return clone$1(this, opts);
      };
      _proto.as = function as(unit) {
        return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
      };
      _proto.normalize = function normalize() {
        if (!this.isValid) return this;
        var vals = this.toObject();
        normalizeValues(this.matrix, vals);
        return clone$1(this, {
          values: vals
        }, true);
      };
      _proto.rescale = function rescale() {
        if (!this.isValid) return this;
        var vals = removeZeroes(this.normalize().shiftToAll().toObject());
        return clone$1(this, {
          values: vals
        }, true);
      };
      _proto.shiftTo = function shiftTo() {
        for (var _len = arguments.length, units = new Array(_len), _key = 0; _key < _len; _key++) {
          units[_key] = arguments[_key];
        }
        if (!this.isValid) return this;
        if (units.length === 0) {
          return this;
        }
        units = units.map(function (u) {
          return Duration.normalizeUnit(u);
        });
        var built = {}, accumulated = {}, vals = this.toObject();
        var lastUnit;
        for (var _i4 = 0, _orderedUnits2 = orderedUnits$1; _i4 < _orderedUnits2.length; _i4++) {
          var k = _orderedUnits2[_i4];
          if (units.indexOf(k) >= 0) {
            lastUnit = k;
            var own = 0;
            for (var ak in accumulated) {
              own += this.matrix[ak][k] * accumulated[ak];
              accumulated[ak] = 0;
            }
            if (isNumber(vals[k])) {
              own += vals[k];
            }
            var i = Math.trunc(own);
            built[k] = i;
            accumulated[k] = (own * 1000 - i * 1000) / 1000;
          } else if (isNumber(vals[k])) {
            accumulated[k] = vals[k];
          }
        }
        for (var key in accumulated) {
          if (accumulated[key] !== 0) {
            built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
          }
        }
        normalizeValues(this.matrix, built);
        return clone$1(this, {
          values: built
        }, true);
      };
      _proto.shiftToAll = function shiftToAll() {
        if (!this.isValid) return this;
        return this.shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds");
      };
      _proto.negate = function negate() {
        if (!this.isValid) return this;
        var negated = {};
        for (var _i5 = 0, _Object$keys2 = Object.keys(this.values); _i5 < _Object$keys2.length; _i5++) {
          var k = _Object$keys2[_i5];
          negated[k] = this.values[k] === 0 ? 0 : -this.values[k];
        }
        return clone$1(this, {
          values: negated
        }, true);
      };
      _proto.equals = function equals(other) {
        if (!this.isValid || !other.isValid) {
          return false;
        }
        if (!this.loc.equals(other.loc)) {
          return false;
        }
        function eq(v1, v2) {
          if (v1 === undefined || v1 === 0) return v2 === undefined || v2 === 0;
          return v1 === v2;
        }
        for (var _i6 = 0, _orderedUnits3 = orderedUnits$1; _i6 < _orderedUnits3.length; _i6++) {
          var u = _orderedUnits3[_i6];
          if (!eq(this.values[u], other.values[u])) {
            return false;
          }
        }
        return true;
      };
      _createClass(Duration, [{
        key: "locale",
        get: function get() {
          return this.isValid ? this.loc.locale : null;
        }
      }, {
        key: "numberingSystem",
        get: function get() {
          return this.isValid ? this.loc.numberingSystem : null;
        }
      }, {
        key: "years",
        get: function get() {
          return this.isValid ? this.values.years || 0 : NaN;
        }
      }, {
        key: "quarters",
        get: function get() {
          return this.isValid ? this.values.quarters || 0 : NaN;
        }
      }, {
        key: "months",
        get: function get() {
          return this.isValid ? this.values.months || 0 : NaN;
        }
      }, {
        key: "weeks",
        get: function get() {
          return this.isValid ? this.values.weeks || 0 : NaN;
        }
      }, {
        key: "days",
        get: function get() {
          return this.isValid ? this.values.days || 0 : NaN;
        }
      }, {
        key: "hours",
        get: function get() {
          return this.isValid ? this.values.hours || 0 : NaN;
        }
      }, {
        key: "minutes",
        get: function get() {
          return this.isValid ? this.values.minutes || 0 : NaN;
        }
      }, {
        key: "seconds",
        get: function get() {
          return this.isValid ? this.values.seconds || 0 : NaN;
        }
      }, {
        key: "milliseconds",
        get: function get() {
          return this.isValid ? this.values.milliseconds || 0 : NaN;
        }
      }, {
        key: "isValid",
        get: function get() {
          return this.invalid === null;
        }
      }, {
        key: "invalidReason",
        get: function get() {
          return this.invalid ? this.invalid.reason : null;
        }
      }, {
        key: "invalidExplanation",
        get: function get() {
          return this.invalid ? this.invalid.explanation : null;
        }
      }]);
      return Duration;
    })(Symbol.for("nodejs.util.inspect.custom"));
    var INVALID$1 = "Invalid Interval";
    function validateStartEnd(start, end) {
      if (!start || !start.isValid) {
        return Interval.invalid("missing or invalid start");
      } else if (!end || !end.isValid) {
        return Interval.invalid("missing or invalid end");
      } else if (end < start) {
        return Interval.invalid("end before start", "The end of an interval must be after its start, but you had start=" + start.toISO() + " and end=" + end.toISO());
      } else {
        return null;
      }
    }
    var Interval = (function (_Symbol$for) {
      function Interval(config) {
        this.s = config.start;
        this.e = config.end;
        this.invalid = config.invalid || null;
        this.isLuxonInterval = true;
      }
      Interval.invalid = function invalid(reason, explanation) {
        if (explanation === undefined) {
          explanation = null;
        }
        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
        }
        var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
        if (Settings.throwOnInvalid) {
          throw new InvalidIntervalError(invalid);
        } else {
          return new Interval({
            invalid: invalid
          });
        }
      };
      Interval.fromDateTimes = function fromDateTimes(start, end) {
        var builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
        var validateError = validateStartEnd(builtStart, builtEnd);
        if (validateError == null) {
          return new Interval({
            start: builtStart,
            end: builtEnd
          });
        } else {
          return validateError;
        }
      };
      Interval.after = function after(start, duration) {
        var dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(start);
        return Interval.fromDateTimes(dt, dt.plus(dur));
      };
      Interval.before = function before(end, duration) {
        var dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(end);
        return Interval.fromDateTimes(dt.minus(dur), dt);
      };
      Interval.fromISO = function fromISO(text, opts) {
        var _split = (text || "").split("/", 2), s = _split[0], e = _split[1];
        if (s && e) {
          var start, startIsValid;
          try {
            start = DateTime.fromISO(s, opts);
            startIsValid = start.isValid;
          } catch (e) {
            startIsValid = false;
          }
          var end, endIsValid;
          try {
            end = DateTime.fromISO(e, opts);
            endIsValid = end.isValid;
          } catch (e) {
            endIsValid = false;
          }
          if (startIsValid && endIsValid) {
            return Interval.fromDateTimes(start, end);
          }
          if (startIsValid) {
            var dur = Duration.fromISO(e, opts);
            if (dur.isValid) {
              return Interval.after(start, dur);
            }
          } else if (endIsValid) {
            var _dur = Duration.fromISO(s, opts);
            if (_dur.isValid) {
              return Interval.before(end, _dur);
            }
          }
        }
        return Interval.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
      };
      Interval.isInterval = function isInterval(o) {
        return o && o.isLuxonInterval || false;
      };
      var _proto = Interval.prototype;
      _proto.length = function length(unit) {
        if (unit === undefined) {
          unit = "milliseconds";
        }
        return this.isValid ? this.toDuration.apply(this, [unit]).get(unit) : NaN;
      };
      _proto.count = function count(unit, opts) {
        if (unit === undefined) {
          unit = "milliseconds";
        }
        if (!this.isValid) return NaN;
        var start = this.start.startOf(unit, opts);
        var end;
        if (opts != null && opts.useLocaleWeeks) {
          end = this.end.reconfigure({
            locale: start.locale
          });
        } else {
          end = this.end;
        }
        end = end.startOf(unit, opts);
        return Math.floor(end.diff(start, unit).get(unit)) + (end.valueOf() !== this.end.valueOf());
      };
      _proto.hasSame = function hasSame(unit) {
        return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
      };
      _proto.isEmpty = function isEmpty() {
        return this.s.valueOf() === this.e.valueOf();
      };
      _proto.isAfter = function isAfter(dateTime) {
        if (!this.isValid) return false;
        return this.s > dateTime;
      };
      _proto.isBefore = function isBefore(dateTime) {
        if (!this.isValid) return false;
        return this.e <= dateTime;
      };
      _proto.contains = function contains(dateTime) {
        if (!this.isValid) return false;
        return this.s <= dateTime && this.e > dateTime;
      };
      _proto.set = function set(_temp) {
        var _ref = _temp === undefined ? {} : _temp, start = _ref.start, end = _ref.end;
        if (!this.isValid) return this;
        return Interval.fromDateTimes(start || this.s, end || this.e);
      };
      _proto.splitAt = function splitAt() {
        var _this = this;
        if (!this.isValid) return [];
        for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
          dateTimes[_key] = arguments[_key];
        }
        var sorted = dateTimes.map(friendlyDateTime).filter(function (d) {
          return _this.contains(d);
        }).sort(function (a, b) {
          return a.toMillis() - b.toMillis();
        }), results = [];
        var s = this.s, i = 0;
        while (s < this.e) {
          var added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
          results.push(Interval.fromDateTimes(s, next));
          s = next;
          i += 1;
        }
        return results;
      };
      _proto.splitBy = function splitBy(duration) {
        var dur = Duration.fromDurationLike(duration);
        if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
          return [];
        }
        var s = this.s, idx = 1, next;
        var results = [];
        while (s < this.e) {
          var added = this.start.plus(dur.mapUnits(function (x) {
            return x * idx;
          }));
          next = +added > +this.e ? this.e : added;
          results.push(Interval.fromDateTimes(s, next));
          s = next;
          idx += 1;
        }
        return results;
      };
      _proto.divideEqually = function divideEqually(numberOfParts) {
        if (!this.isValid) return [];
        return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
      };
      _proto.overlaps = function overlaps(other) {
        return this.e > other.s && this.s < other.e;
      };
      _proto.abutsStart = function abutsStart(other) {
        if (!this.isValid) return false;
        return +this.e === +other.s;
      };
      _proto.abutsEnd = function abutsEnd(other) {
        if (!this.isValid) return false;
        return +other.e === +this.s;
      };
      _proto.engulfs = function engulfs(other) {
        if (!this.isValid) return false;
        return this.s <= other.s && this.e >= other.e;
      };
      _proto.equals = function equals(other) {
        if (!this.isValid || !other.isValid) {
          return false;
        }
        return this.s.equals(other.s) && this.e.equals(other.e);
      };
      _proto.intersection = function intersection(other) {
        if (!this.isValid) return this;
        var s = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;
        if (s >= e) {
          return null;
        } else {
          return Interval.fromDateTimes(s, e);
        }
      };
      _proto.union = function union(other) {
        if (!this.isValid) return this;
        var s = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;
        return Interval.fromDateTimes(s, e);
      };
      Interval.merge = function merge(intervals) {
        var _intervals$sort$reduc = intervals.sort(function (a, b) {
          return a.s - b.s;
        }).reduce(function (_ref2, item) {
          var sofar = _ref2[0], current = _ref2[1];
          if (!current) {
            return [sofar, item];
          } else if (current.overlaps(item) || current.abutsStart(item)) {
            return [sofar, current.union(item)];
          } else {
            return [sofar.concat([current]), item];
          }
        }, [[], null]), found = _intervals$sort$reduc[0], final = _intervals$sort$reduc[1];
        if (final) {
          found.push(final);
        }
        return found;
      };
      Interval.xor = function xor(intervals) {
        var _Array$prototype;
        var start = null, currentCount = 0;
        var results = [], ends = intervals.map(function (i) {
          return [{
            time: i.s,
            type: "s"
          }, {
            time: i.e,
            type: "e"
          }];
        }), flattened = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, ends), arr = flattened.sort(function (a, b) {
          return a.time - b.time;
        });
        for (var _iterator = _createForOfIteratorHelperLoose(arr), _step; !(_step = _iterator()).done; ) {
          var i = _step.value;
          currentCount += i.type === "s" ? 1 : -1;
          if (currentCount === 1) {
            start = i.time;
          } else {
            if (start && +start !== +i.time) {
              results.push(Interval.fromDateTimes(start, i.time));
            }
            start = null;
          }
        }
        return Interval.merge(results);
      };
      _proto.difference = function difference() {
        var _this2 = this;
        for (var _len2 = arguments.length, intervals = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          intervals[_key2] = arguments[_key2];
        }
        return Interval.xor([this].concat(intervals)).map(function (i) {
          return _this2.intersection(i);
        }).filter(function (i) {
          return i && !i.isEmpty();
        });
      };
      _proto.toString = function toString() {
        if (!this.isValid) return INVALID$1;
        return "[" + this.s.toISO() + " – " + this.e.toISO() + ")";
      };
      _proto[_Symbol$for] = function () {
        if (this.isValid) {
          return "Interval { start: " + this.s.toISO() + ", end: " + this.e.toISO() + " }";
        } else {
          return "Interval { Invalid, reason: " + this.invalidReason + " }";
        }
      };
      _proto.toLocaleString = function toLocaleString(formatOpts, opts) {
        if (formatOpts === undefined) {
          formatOpts = DATE_SHORT;
        }
        if (opts === undefined) {
          opts = {};
        }
        return this.isValid ? Formatter.create(this.s.loc.clone(opts), formatOpts).formatInterval(this) : INVALID$1;
      };
      _proto.toISO = function toISO(opts) {
        if (!this.isValid) return INVALID$1;
        return this.s.toISO(opts) + "/" + this.e.toISO(opts);
      };
      _proto.toISODate = function toISODate() {
        if (!this.isValid) return INVALID$1;
        return this.s.toISODate() + "/" + this.e.toISODate();
      };
      _proto.toISOTime = function toISOTime(opts) {
        if (!this.isValid) return INVALID$1;
        return this.s.toISOTime(opts) + "/" + this.e.toISOTime(opts);
      };
      _proto.toFormat = function toFormat(dateFormat, _temp2) {
        var _ref3 = _temp2 === undefined ? {} : _temp2, _ref3$separator = _ref3.separator, separator = _ref3$separator === undefined ? " – " : _ref3$separator;
        if (!this.isValid) return INVALID$1;
        return "" + this.s.toFormat(dateFormat) + separator + this.e.toFormat(dateFormat);
      };
      _proto.toDuration = function toDuration(unit, opts) {
        if (!this.isValid) {
          return Duration.invalid(this.invalidReason);
        }
        return this.e.diff(this.s, unit, opts);
      };
      _proto.mapEndpoints = function mapEndpoints(mapFn) {
        return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
      };
      _createClass(Interval, [{
        key: "start",
        get: function get() {
          return this.isValid ? this.s : null;
        }
      }, {
        key: "end",
        get: function get() {
          return this.isValid ? this.e : null;
        }
      }, {
        key: "isValid",
        get: function get() {
          return this.invalidReason === null;
        }
      }, {
        key: "invalidReason",
        get: function get() {
          return this.invalid ? this.invalid.reason : null;
        }
      }, {
        key: "invalidExplanation",
        get: function get() {
          return this.invalid ? this.invalid.explanation : null;
        }
      }]);
      return Interval;
    })(Symbol.for("nodejs.util.inspect.custom"));
    var Info = (function () {
      function Info() {}
      Info.hasDST = function hasDST(zone) {
        if (zone === undefined) {
          zone = Settings.defaultZone;
        }
        var proto = DateTime.now().setZone(zone).set({
          month: 12
        });
        return !zone.isUniversal && proto.offset !== proto.set({
          month: 6
        }).offset;
      };
      Info.isValidIANAZone = function isValidIANAZone(zone) {
        return IANAZone.isValidZone(zone);
      };
      Info.normalizeZone = function normalizeZone$1(input) {
        return normalizeZone(input, Settings.defaultZone);
      };
      Info.getStartOfWeek = function getStartOfWeek(_temp) {
        var _ref = _temp === undefined ? {} : _temp, _ref$locale = _ref.locale, locale = _ref$locale === undefined ? null : _ref$locale, _ref$locObj = _ref.locObj, locObj = _ref$locObj === undefined ? null : _ref$locObj;
        return (locObj || Locale.create(locale)).getStartOfWeek();
      };
      Info.getMinimumDaysInFirstWeek = function getMinimumDaysInFirstWeek(_temp2) {
        var _ref2 = _temp2 === undefined ? {} : _temp2, _ref2$locale = _ref2.locale, locale = _ref2$locale === undefined ? null : _ref2$locale, _ref2$locObj = _ref2.locObj, locObj = _ref2$locObj === undefined ? null : _ref2$locObj;
        return (locObj || Locale.create(locale)).getMinDaysInFirstWeek();
      };
      Info.getWeekendWeekdays = function getWeekendWeekdays(_temp3) {
        var _ref3 = _temp3 === undefined ? {} : _temp3, _ref3$locale = _ref3.locale, locale = _ref3$locale === undefined ? null : _ref3$locale, _ref3$locObj = _ref3.locObj, locObj = _ref3$locObj === undefined ? null : _ref3$locObj;
        return (locObj || Locale.create(locale)).getWeekendDays().slice();
      };
      Info.months = function months(length, _temp4) {
        if (length === undefined) {
          length = "long";
        }
        var _ref4 = _temp4 === undefined ? {} : _temp4, _ref4$locale = _ref4.locale, locale = _ref4$locale === undefined ? null : _ref4$locale, _ref4$numberingSystem = _ref4.numberingSystem, numberingSystem = _ref4$numberingSystem === undefined ? null : _ref4$numberingSystem, _ref4$locObj = _ref4.locObj, locObj = _ref4$locObj === undefined ? null : _ref4$locObj, _ref4$outputCalendar = _ref4.outputCalendar, outputCalendar = _ref4$outputCalendar === undefined ? "gregory" : _ref4$outputCalendar;
        return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
      };
      Info.monthsFormat = function monthsFormat(length, _temp5) {
        if (length === undefined) {
          length = "long";
        }
        var _ref5 = _temp5 === undefined ? {} : _temp5, _ref5$locale = _ref5.locale, locale = _ref5$locale === undefined ? null : _ref5$locale, _ref5$numberingSystem = _ref5.numberingSystem, numberingSystem = _ref5$numberingSystem === undefined ? null : _ref5$numberingSystem, _ref5$locObj = _ref5.locObj, locObj = _ref5$locObj === undefined ? null : _ref5$locObj, _ref5$outputCalendar = _ref5.outputCalendar, outputCalendar = _ref5$outputCalendar === undefined ? "gregory" : _ref5$outputCalendar;
        return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
      };
      Info.weekdays = function weekdays(length, _temp6) {
        if (length === undefined) {
          length = "long";
        }
        var _ref6 = _temp6 === undefined ? {} : _temp6, _ref6$locale = _ref6.locale, locale = _ref6$locale === undefined ? null : _ref6$locale, _ref6$numberingSystem = _ref6.numberingSystem, numberingSystem = _ref6$numberingSystem === undefined ? null : _ref6$numberingSystem, _ref6$locObj = _ref6.locObj, locObj = _ref6$locObj === undefined ? null : _ref6$locObj;
        return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
      };
      Info.weekdaysFormat = function weekdaysFormat(length, _temp7) {
        if (length === undefined) {
          length = "long";
        }
        var _ref7 = _temp7 === undefined ? {} : _temp7, _ref7$locale = _ref7.locale, locale = _ref7$locale === undefined ? null : _ref7$locale, _ref7$numberingSystem = _ref7.numberingSystem, numberingSystem = _ref7$numberingSystem === undefined ? null : _ref7$numberingSystem, _ref7$locObj = _ref7.locObj, locObj = _ref7$locObj === undefined ? null : _ref7$locObj;
        return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
      };
      Info.meridiems = function meridiems(_temp8) {
        var _ref8 = _temp8 === undefined ? {} : _temp8, _ref8$locale = _ref8.locale, locale = _ref8$locale === undefined ? null : _ref8$locale;
        return Locale.create(locale).meridiems();
      };
      Info.eras = function eras(length, _temp9) {
        if (length === undefined) {
          length = "short";
        }
        var _ref9 = _temp9 === undefined ? {} : _temp9, _ref9$locale = _ref9.locale, locale = _ref9$locale === undefined ? null : _ref9$locale;
        return Locale.create(locale, null, "gregory").eras(length);
      };
      Info.features = function features() {
        return {
          relative: hasRelative(),
          localeWeek: hasLocaleWeekInfo()
        };
      };
      return Info;
    })();
    function dayDiff(earlier, later) {
      var utcDayStart = function utcDayStart(dt) {
        return dt.toUTC(0, {
          keepLocalTime: true
        }).startOf("day").valueOf();
      }, ms = utcDayStart(later) - utcDayStart(earlier);
      return Math.floor(Duration.fromMillis(ms).as("days"));
    }
    function highOrderDiffs(cursor, later, units) {
      var differs = [["years", function (a, b) {
        return b.year - a.year;
      }], ["quarters", function (a, b) {
        return b.quarter - a.quarter + (b.year - a.year) * 4;
      }], ["months", function (a, b) {
        return b.month - a.month + (b.year - a.year) * 12;
      }], ["weeks", function (a, b) {
        var days = dayDiff(a, b);
        return (days - days % 7) / 7;
      }], ["days", dayDiff]];
      var results = {};
      var earlier = cursor;
      var lowestOrder, highWater;
      for (var _i = 0, _differs = differs; _i < _differs.length; _i++) {
        var _differs$_i = _differs[_i], unit = _differs$_i[0], differ = _differs$_i[1];
        if (units.indexOf(unit) >= 0) {
          lowestOrder = unit;
          results[unit] = differ(cursor, later);
          highWater = earlier.plus(results);
          if (highWater > later) {
            results[unit]--;
            cursor = earlier.plus(results);
            if (cursor > later) {
              highWater = cursor;
              results[unit]--;
              cursor = earlier.plus(results);
            }
          } else {
            cursor = highWater;
          }
        }
      }
      return [cursor, results, highWater, lowestOrder];
    }
    function _diff(earlier, later, units, opts) {
      var _highOrderDiffs = highOrderDiffs(earlier, later, units), cursor = _highOrderDiffs[0], results = _highOrderDiffs[1], highWater = _highOrderDiffs[2], lowestOrder = _highOrderDiffs[3];
      var remainingMillis = later - cursor;
      var lowerOrderUnits = units.filter(function (u) {
        return ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0;
      });
      if (lowerOrderUnits.length === 0) {
        if (highWater < later) {
          var _cursor$plus;
          highWater = cursor.plus((_cursor$plus = {}, _cursor$plus[lowestOrder] = 1, _cursor$plus));
        }
        if (highWater !== cursor) {
          results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
        }
      }
      var duration = Duration.fromObject(results, opts);
      if (lowerOrderUnits.length > 0) {
        var _Duration$fromMillis;
        return (_Duration$fromMillis = Duration.fromMillis(remainingMillis, opts)).shiftTo.apply(_Duration$fromMillis, lowerOrderUnits).plus(duration);
      } else {
        return duration;
      }
    }
    var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
    function intUnit(regex, post) {
      if (post === undefined) {
        post = function post(i) {
          return i;
        };
      }
      return {
        regex: regex,
        deser: function deser(_ref) {
          var s = _ref[0];
          return post(parseDigits(s));
        }
      };
    }
    var NBSP = String.fromCharCode(160);
    var spaceOrNBSP = "[ " + NBSP + "]";
    var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
    function fixListRegex(s) {
      return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
    }
    function stripInsensitivities(s) {
      return s.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
    }
    function oneOf(strings, startIndex) {
      if (strings === null) {
        return null;
      } else {
        return {
          regex: RegExp(strings.map(fixListRegex).join("|")),
          deser: function deser(_ref2) {
            var s = _ref2[0];
            return strings.findIndex(function (i) {
              return stripInsensitivities(s) === stripInsensitivities(i);
            }) + startIndex;
          }
        };
      }
    }
    function offset(regex, groups) {
      return {
        regex: regex,
        deser: function deser(_ref3) {
          var h = _ref3[1], m = _ref3[2];
          return signedOffset(h, m);
        },
        groups: groups
      };
    }
    function simple(regex) {
      return {
        regex: regex,
        deser: function deser(_ref4) {
          var s = _ref4[0];
          return s;
        }
      };
    }
    function escapeToken(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }
    function unitForToken(token, loc) {
      var one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = function literal(t) {
        return {
          regex: RegExp(escapeToken(t.val)),
          deser: function deser(_ref5) {
            var s = _ref5[0];
            return s;
          },
          literal: true
        };
      }, unitate = function unitate(t) {
        if (token.literal) {
          return literal(t);
        }
        switch (t.val) {
          case "G":
            return oneOf(loc.eras("short"), 0);
          case "GG":
            return oneOf(loc.eras("long"), 0);
          case "y":
            return intUnit(oneToSix);
          case "yy":
            return intUnit(twoToFour, untruncateYear);
          case "yyyy":
            return intUnit(four);
          case "yyyyy":
            return intUnit(fourToSix);
          case "yyyyyy":
            return intUnit(six);
          case "M":
            return intUnit(oneOrTwo);
          case "MM":
            return intUnit(two);
          case "MMM":
            return oneOf(loc.months("short", true), 1);
          case "MMMM":
            return oneOf(loc.months("long", true), 1);
          case "L":
            return intUnit(oneOrTwo);
          case "LL":
            return intUnit(two);
          case "LLL":
            return oneOf(loc.months("short", false), 1);
          case "LLLL":
            return oneOf(loc.months("long", false), 1);
          case "d":
            return intUnit(oneOrTwo);
          case "dd":
            return intUnit(two);
          case "o":
            return intUnit(oneToThree);
          case "ooo":
            return intUnit(three);
          case "HH":
            return intUnit(two);
          case "H":
            return intUnit(oneOrTwo);
          case "hh":
            return intUnit(two);
          case "h":
            return intUnit(oneOrTwo);
          case "mm":
            return intUnit(two);
          case "m":
            return intUnit(oneOrTwo);
          case "q":
            return intUnit(oneOrTwo);
          case "qq":
            return intUnit(two);
          case "s":
            return intUnit(oneOrTwo);
          case "ss":
            return intUnit(two);
          case "S":
            return intUnit(oneToThree);
          case "SSS":
            return intUnit(three);
          case "u":
            return simple(oneToNine);
          case "uu":
            return simple(oneOrTwo);
          case "uuu":
            return intUnit(one);
          case "a":
            return oneOf(loc.meridiems(), 0);
          case "kkkk":
            return intUnit(four);
          case "kk":
            return intUnit(twoToFour, untruncateYear);
          case "W":
            return intUnit(oneOrTwo);
          case "WW":
            return intUnit(two);
          case "E":
          case "c":
            return intUnit(one);
          case "EEE":
            return oneOf(loc.weekdays("short", false), 1);
          case "EEEE":
            return oneOf(loc.weekdays("long", false), 1);
          case "ccc":
            return oneOf(loc.weekdays("short", true), 1);
          case "cccc":
            return oneOf(loc.weekdays("long", true), 1);
          case "Z":
          case "ZZ":
            return offset(new RegExp("([+-]" + oneOrTwo.source + ")(?::(" + two.source + "))?"), 2);
          case "ZZZ":
            return offset(new RegExp("([+-]" + oneOrTwo.source + ")(" + two.source + ")?"), 2);
          case "z":
            return simple(/[a-z_+-/]{1,256}?/i);
          case " ":
            return simple(/[^\S\n\r]/);
          default:
            return literal(t);
        }
      };
      var unit = unitate(token) || ({
        invalidReason: MISSING_FTP
      });
      unit.token = token;
      return unit;
    }
    var partTypeStyleToTokenVal = {
      year: {
        "2-digit": "yy",
        numeric: "yyyyy"
      },
      month: {
        numeric: "M",
        "2-digit": "MM",
        short: "MMM",
        long: "MMMM"
      },
      day: {
        numeric: "d",
        "2-digit": "dd"
      },
      weekday: {
        short: "EEE",
        long: "EEEE"
      },
      dayperiod: "a",
      dayPeriod: "a",
      hour12: {
        numeric: "h",
        "2-digit": "hh"
      },
      hour24: {
        numeric: "H",
        "2-digit": "HH"
      },
      minute: {
        numeric: "m",
        "2-digit": "mm"
      },
      second: {
        numeric: "s",
        "2-digit": "ss"
      },
      timeZoneName: {
        long: "ZZZZZ",
        short: "ZZZ"
      }
    };
    function tokenForPart(part, formatOpts, resolvedOpts) {
      var type = part.type, value = part.value;
      if (type === "literal") {
        var isSpace = (/^\s+$/).test(value);
        return {
          literal: !isSpace,
          val: isSpace ? " " : value
        };
      }
      var style = formatOpts[type];
      var actualType = type;
      if (type === "hour") {
        if (formatOpts.hour12 != null) {
          actualType = formatOpts.hour12 ? "hour12" : "hour24";
        } else if (formatOpts.hourCycle != null) {
          if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
            actualType = "hour12";
          } else {
            actualType = "hour24";
          }
        } else {
          actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
        }
      }
      var val = partTypeStyleToTokenVal[actualType];
      if (typeof val === "object") {
        val = val[style];
      }
      if (val) {
        return {
          literal: false,
          val: val
        };
      }
      return undefined;
    }
    function buildRegex(units) {
      var re = units.map(function (u) {
        return u.regex;
      }).reduce(function (f, r) {
        return f + "(" + r.source + ")";
      }, "");
      return ["^" + re + "$", units];
    }
    function match(input, regex, handlers) {
      var matches = input.match(regex);
      if (matches) {
        var all = {};
        var matchIndex = 1;
        for (var i in handlers) {
          if (hasOwnProperty(handlers, i)) {
            var h = handlers[i], groups = h.groups ? h.groups + 1 : 1;
            if (!h.literal && h.token) {
              all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
            }
            matchIndex += groups;
          }
        }
        return [matches, all];
      } else {
        return [matches, {}];
      }
    }
    function dateTimeFromMatches(matches) {
      var toField = function toField(token) {
        switch (token) {
          case "S":
            return "millisecond";
          case "s":
            return "second";
          case "m":
            return "minute";
          case "h":
          case "H":
            return "hour";
          case "d":
            return "day";
          case "o":
            return "ordinal";
          case "L":
          case "M":
            return "month";
          case "y":
            return "year";
          case "E":
          case "c":
            return "weekday";
          case "W":
            return "weekNumber";
          case "k":
            return "weekYear";
          case "q":
            return "quarter";
          default:
            return null;
        }
      };
      var zone = null;
      var specificOffset;
      if (!isUndefined(matches.z)) {
        zone = IANAZone.create(matches.z);
      }
      if (!isUndefined(matches.Z)) {
        if (!zone) {
          zone = new FixedOffsetZone(matches.Z);
        }
        specificOffset = matches.Z;
      }
      if (!isUndefined(matches.q)) {
        matches.M = (matches.q - 1) * 3 + 1;
      }
      if (!isUndefined(matches.h)) {
        if (matches.h < 12 && matches.a === 1) {
          matches.h += 12;
        } else if (matches.h === 12 && matches.a === 0) {
          matches.h = 0;
        }
      }
      if (matches.G === 0 && matches.y) {
        matches.y = -matches.y;
      }
      if (!isUndefined(matches.u)) {
        matches.S = parseMillis(matches.u);
      }
      var vals = Object.keys(matches).reduce(function (r, k) {
        var f = toField(k);
        if (f) {
          r[f] = matches[k];
        }
        return r;
      }, {});
      return [vals, zone, specificOffset];
    }
    var dummyDateTimeCache = null;
    function getDummyDateTime() {
      if (!dummyDateTimeCache) {
        dummyDateTimeCache = DateTime.fromMillis(1555555555555);
      }
      return dummyDateTimeCache;
    }
    function maybeExpandMacroToken(token, locale) {
      if (token.literal) {
        return token;
      }
      var formatOpts = Formatter.macroTokenToFormatOpts(token.val);
      var tokens = formatOptsToTokens(formatOpts, locale);
      if (tokens == null || tokens.includes(undefined)) {
        return token;
      }
      return tokens;
    }
    function expandMacroTokens(tokens, locale) {
      var _Array$prototype;
      return (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, tokens.map(function (t) {
        return maybeExpandMacroToken(t, locale);
      }));
    }
    var TokenParser = (function () {
      function TokenParser(locale, format) {
        this.locale = locale;
        this.format = format;
        this.tokens = expandMacroTokens(Formatter.parseFormat(format), locale);
        this.units = this.tokens.map(function (t) {
          return unitForToken(t, locale);
        });
        this.disqualifyingUnit = this.units.find(function (t) {
          return t.invalidReason;
        });
        if (!this.disqualifyingUnit) {
          var _buildRegex = buildRegex(this.units), regexString = _buildRegex[0], handlers = _buildRegex[1];
          this.regex = RegExp(regexString, "i");
          this.handlers = handlers;
        }
      }
      var _proto = TokenParser.prototype;
      _proto.explainFromTokens = function explainFromTokens(input) {
        if (!this.isValid) {
          return {
            input: input,
            tokens: this.tokens,
            invalidReason: this.invalidReason
          };
        } else {
          var _match = match(input, this.regex, this.handlers), rawMatches = _match[0], matches = _match[1], _ref6 = matches ? dateTimeFromMatches(matches) : [null, null, undefined], result = _ref6[0], zone = _ref6[1], specificOffset = _ref6[2];
          if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
            throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
          }
          return {
            input: input,
            tokens: this.tokens,
            regex: this.regex,
            rawMatches: rawMatches,
            matches: matches,
            result: result,
            zone: zone,
            specificOffset: specificOffset
          };
        }
      };
      _createClass(TokenParser, [{
        key: "isValid",
        get: function get() {
          return !this.disqualifyingUnit;
        }
      }, {
        key: "invalidReason",
        get: function get() {
          return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
        }
      }]);
      return TokenParser;
    })();
    function explainFromTokens(locale, input, format) {
      var parser = new TokenParser(locale, format);
      return parser.explainFromTokens(input);
    }
    function parseFromTokens(locale, input, format) {
      var _explainFromTokens = explainFromTokens(locale, input, format), result = _explainFromTokens.result, zone = _explainFromTokens.zone, specificOffset = _explainFromTokens.specificOffset, invalidReason = _explainFromTokens.invalidReason;
      return [result, zone, specificOffset, invalidReason];
    }
    function formatOptsToTokens(formatOpts, locale) {
      if (!formatOpts) {
        return null;
      }
      var formatter = Formatter.create(locale, formatOpts);
      var df = formatter.dtFormatter(getDummyDateTime());
      var parts = df.formatToParts();
      var resolvedOpts = df.resolvedOptions();
      return parts.map(function (p) {
        return tokenForPart(p, formatOpts, resolvedOpts);
      });
    }
    var INVALID = "Invalid DateTime";
    var MAX_DATE = 8640000000000000;
    function unsupportedZone(zone) {
      return new Invalid("unsupported zone", "the zone \"" + zone.name + "\" is not supported");
    }
    function possiblyCachedWeekData(dt) {
      if (dt.weekData === null) {
        dt.weekData = gregorianToWeek(dt.c);
      }
      return dt.weekData;
    }
    function possiblyCachedLocalWeekData(dt) {
      if (dt.localWeekData === null) {
        dt.localWeekData = gregorianToWeek(dt.c, dt.loc.getMinDaysInFirstWeek(), dt.loc.getStartOfWeek());
      }
      return dt.localWeekData;
    }
    function clone(inst, alts) {
      var current = {
        ts: inst.ts,
        zone: inst.zone,
        c: inst.c,
        o: inst.o,
        loc: inst.loc,
        invalid: inst.invalid
      };
      return new DateTime(_extends({}, current, alts, {
        old: current
      }));
    }
    function fixOffset(localTS, o, tz) {
      var utcGuess = localTS - o * 60 * 1000;
      var o2 = tz.offset(utcGuess);
      if (o === o2) {
        return [utcGuess, o];
      }
      utcGuess -= (o2 - o) * 60 * 1000;
      var o3 = tz.offset(utcGuess);
      if (o2 === o3) {
        return [utcGuess, o2];
      }
      return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
    }
    function tsToObj(ts, offset) {
      ts += offset * 60 * 1000;
      var d = new Date(ts);
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
        second: d.getUTCSeconds(),
        millisecond: d.getUTCMilliseconds()
      };
    }
    function objToTS(obj, offset, zone) {
      return fixOffset(objToLocalTS(obj), offset, zone);
    }
    function adjustTime(inst, dur) {
      var oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3, c = _extends({}, inst.c, {
        year: year,
        month: month,
        day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
      }), millisToAdd = Duration.fromObject({
        years: dur.years - Math.trunc(dur.years),
        quarters: dur.quarters - Math.trunc(dur.quarters),
        months: dur.months - Math.trunc(dur.months),
        weeks: dur.weeks - Math.trunc(dur.weeks),
        days: dur.days - Math.trunc(dur.days),
        hours: dur.hours,
        minutes: dur.minutes,
        seconds: dur.seconds,
        milliseconds: dur.milliseconds
      }).as("milliseconds"), localTS = objToLocalTS(c);
      var _fixOffset = fixOffset(localTS, oPre, inst.zone), ts = _fixOffset[0], o = _fixOffset[1];
      if (millisToAdd !== 0) {
        ts += millisToAdd;
        o = inst.zone.offset(ts);
      }
      return {
        ts: ts,
        o: o
      };
    }
    function parseDataToDateTime(parsed, parsedZone, opts, format, text, specificOffset) {
      var setZone = opts.setZone, zone = opts.zone;
      if (parsed && Object.keys(parsed).length !== 0 || parsedZone) {
        var interpretationZone = parsedZone || zone, inst = DateTime.fromObject(parsed, _extends({}, opts, {
          zone: interpretationZone,
          specificOffset: specificOffset
        }));
        return setZone ? inst : inst.setZone(zone);
      } else {
        return DateTime.invalid(new Invalid("unparsable", "the input \"" + text + "\" can't be parsed as " + format));
      }
    }
    function toTechFormat(dt, format, allowZ) {
      if (allowZ === undefined) {
        allowZ = true;
      }
      return dt.isValid ? Formatter.create(Locale.create("en-US"), {
        allowZ: allowZ,
        forceSimple: true
      }).formatDateTimeFromString(dt, format) : null;
    }
    function _toISODate(o, extended) {
      var longFormat = o.c.year > 9999 || o.c.year < 0;
      var c = "";
      if (longFormat && o.c.year >= 0) c += "+";
      c += padStart(o.c.year, longFormat ? 6 : 4);
      if (extended) {
        c += "-";
        c += padStart(o.c.month);
        c += "-";
        c += padStart(o.c.day);
      } else {
        c += padStart(o.c.month);
        c += padStart(o.c.day);
      }
      return c;
    }
    function _toISOTime(o, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone) {
      var c = padStart(o.c.hour);
      if (extended) {
        c += ":";
        c += padStart(o.c.minute);
        if (o.c.millisecond !== 0 || o.c.second !== 0 || !suppressSeconds) {
          c += ":";
        }
      } else {
        c += padStart(o.c.minute);
      }
      if (o.c.millisecond !== 0 || o.c.second !== 0 || !suppressSeconds) {
        c += padStart(o.c.second);
        if (o.c.millisecond !== 0 || !suppressMilliseconds) {
          c += ".";
          c += padStart(o.c.millisecond, 3);
        }
      }
      if (includeOffset) {
        if (o.isOffsetFixed && o.offset === 0 && !extendedZone) {
          c += "Z";
        } else if (o.o < 0) {
          c += "-";
          c += padStart(Math.trunc(-o.o / 60));
          c += ":";
          c += padStart(Math.trunc(-o.o % 60));
        } else {
          c += "+";
          c += padStart(Math.trunc(o.o / 60));
          c += ":";
          c += padStart(Math.trunc(o.o % 60));
        }
      }
      if (extendedZone) {
        c += "[" + o.zone.ianaName + "]";
      }
      return c;
    }
    var defaultUnitValues = {
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }, defaultWeekUnitValues = {
      weekNumber: 1,
      weekday: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }, defaultOrdinalUnitValues = {
      ordinal: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    };
    var orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"], orderedWeekUnits = ["weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond"], orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
    function normalizeUnit(unit) {
      var normalized = ({
        year: "year",
        years: "year",
        month: "month",
        months: "month",
        day: "day",
        days: "day",
        hour: "hour",
        hours: "hour",
        minute: "minute",
        minutes: "minute",
        quarter: "quarter",
        quarters: "quarter",
        second: "second",
        seconds: "second",
        millisecond: "millisecond",
        milliseconds: "millisecond",
        weekday: "weekday",
        weekdays: "weekday",
        weeknumber: "weekNumber",
        weeksnumber: "weekNumber",
        weeknumbers: "weekNumber",
        weekyear: "weekYear",
        weekyears: "weekYear",
        ordinal: "ordinal"
      })[unit.toLowerCase()];
      if (!normalized) throw new InvalidUnitError(unit);
      return normalized;
    }
    function normalizeUnitWithLocalWeeks(unit) {
      switch (unit.toLowerCase()) {
        case "localweekday":
        case "localweekdays":
          return "localWeekday";
        case "localweeknumber":
        case "localweeknumbers":
          return "localWeekNumber";
        case "localweekyear":
        case "localweekyears":
          return "localWeekYear";
        default:
          return normalizeUnit(unit);
      }
    }
    function guessOffsetForZone(zone) {
      if (!zoneOffsetGuessCache[zone]) {
        if (zoneOffsetTs === undefined) {
          zoneOffsetTs = Settings.now();
        }
        zoneOffsetGuessCache[zone] = zone.offset(zoneOffsetTs);
      }
      return zoneOffsetGuessCache[zone];
    }
    function quickDT(obj, opts) {
      var zone = normalizeZone(opts.zone, Settings.defaultZone);
      if (!zone.isValid) {
        return DateTime.invalid(unsupportedZone(zone));
      }
      var loc = Locale.fromObject(opts);
      var ts, o;
      if (!isUndefined(obj.year)) {
        for (var _i = 0, _orderedUnits = orderedUnits; _i < _orderedUnits.length; _i++) {
          var u = _orderedUnits[_i];
          if (isUndefined(obj[u])) {
            obj[u] = defaultUnitValues[u];
          }
        }
        var invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
        if (invalid) {
          return DateTime.invalid(invalid);
        }
        var offsetProvis = guessOffsetForZone(zone);
        var _objToTS = objToTS(obj, offsetProvis, zone);
        ts = _objToTS[0];
        o = _objToTS[1];
      } else {
        ts = Settings.now();
      }
      return new DateTime({
        ts: ts,
        zone: zone,
        loc: loc,
        o: o
      });
    }
    function diffRelative(start, end, opts) {
      var round = isUndefined(opts.round) ? true : opts.round, format = function format(c, unit) {
        c = roundTo(c, round || opts.calendary ? 0 : 2, true);
        var formatter = end.loc.clone(opts).relFormatter(opts);
        return formatter.format(c, unit);
      }, differ = function differ(unit) {
        if (opts.calendary) {
          if (!end.hasSame(start, unit)) {
            return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
          } else return 0;
        } else {
          return end.diff(start, unit).get(unit);
        }
      };
      if (opts.unit) {
        return format(differ(opts.unit), opts.unit);
      }
      for (var _iterator = _createForOfIteratorHelperLoose(opts.units), _step; !(_step = _iterator()).done; ) {
        var unit = _step.value;
        var count = differ(unit);
        if (Math.abs(count) >= 1) {
          return format(count, unit);
        }
      }
      return format(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
    }
    function lastOpts(argList) {
      var opts = {}, args;
      if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
        opts = argList[argList.length - 1];
        args = Array.from(argList).slice(0, argList.length - 1);
      } else {
        args = Array.from(argList);
      }
      return [opts, args];
    }
    var zoneOffsetTs;
    var zoneOffsetGuessCache = {};
    var DateTime = (function (_Symbol$for) {
      function DateTime(config) {
        var zone = config.zone || Settings.defaultZone;
        var invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
        this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
        var c = null, o = null;
        if (!invalid) {
          var unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
          if (unchanged) {
            var _ref = [config.old.c, config.old.o];
            c = _ref[0];
            o = _ref[1];
          } else {
            var ot = isNumber(config.o) && !config.old ? config.o : zone.offset(this.ts);
            c = tsToObj(this.ts, ot);
            invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
            c = invalid ? null : c;
            o = invalid ? null : ot;
          }
        }
        this._zone = zone;
        this.loc = config.loc || Locale.create();
        this.invalid = invalid;
        this.weekData = null;
        this.localWeekData = null;
        this.c = c;
        this.o = o;
        this.isLuxonDateTime = true;
      }
      DateTime.now = function now() {
        return new DateTime({});
      };
      DateTime.local = function local() {
        var _lastOpts = lastOpts(arguments), opts = _lastOpts[0], args = _lastOpts[1], year = args[0], month = args[1], day = args[2], hour = args[3], minute = args[4], second = args[5], millisecond = args[6];
        return quickDT({
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          second: second,
          millisecond: millisecond
        }, opts);
      };
      DateTime.utc = function utc() {
        var _lastOpts2 = lastOpts(arguments), opts = _lastOpts2[0], args = _lastOpts2[1], year = args[0], month = args[1], day = args[2], hour = args[3], minute = args[4], second = args[5], millisecond = args[6];
        opts.zone = FixedOffsetZone.utcInstance;
        return quickDT({
          year: year,
          month: month,
          day: day,
          hour: hour,
          minute: minute,
          second: second,
          millisecond: millisecond
        }, opts);
      };
      DateTime.fromJSDate = function fromJSDate(date, options) {
        if (options === undefined) {
          options = {};
        }
        var ts = isDate(date) ? date.valueOf() : NaN;
        if (Number.isNaN(ts)) {
          return DateTime.invalid("invalid input");
        }
        var zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
        if (!zoneToUse.isValid) {
          return DateTime.invalid(unsupportedZone(zoneToUse));
        }
        return new DateTime({
          ts: ts,
          zone: zoneToUse,
          loc: Locale.fromObject(options)
        });
      };
      DateTime.fromMillis = function fromMillis(milliseconds, options) {
        if (options === undefined) {
          options = {};
        }
        if (!isNumber(milliseconds)) {
          throw new InvalidArgumentError("fromMillis requires a numerical input, but received a " + typeof milliseconds + " with value " + milliseconds);
        } else if (milliseconds < -864e13 || milliseconds > MAX_DATE) {
          return DateTime.invalid("Timestamp out of range");
        } else {
          return new DateTime({
            ts: milliseconds,
            zone: normalizeZone(options.zone, Settings.defaultZone),
            loc: Locale.fromObject(options)
          });
        }
      };
      DateTime.fromSeconds = function fromSeconds(seconds, options) {
        if (options === undefined) {
          options = {};
        }
        if (!isNumber(seconds)) {
          throw new InvalidArgumentError("fromSeconds requires a numerical input");
        } else {
          return new DateTime({
            ts: seconds * 1000,
            zone: normalizeZone(options.zone, Settings.defaultZone),
            loc: Locale.fromObject(options)
          });
        }
      };
      DateTime.fromObject = function fromObject(obj, opts) {
        if (opts === undefined) {
          opts = {};
        }
        obj = obj || ({});
        var zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
        if (!zoneToUse.isValid) {
          return DateTime.invalid(unsupportedZone(zoneToUse));
        }
        var loc = Locale.fromObject(opts);
        var normalized = normalizeObject(obj, normalizeUnitWithLocalWeeks);
        var _usesLocalWeekValues = usesLocalWeekValues(normalized, loc), minDaysInFirstWeek = _usesLocalWeekValues.minDaysInFirstWeek, startOfWeek = _usesLocalWeekValues.startOfWeek;
        var tsNow = Settings.now(), offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
        if ((containsGregor || containsOrdinal) && definiteWeekDef) {
          throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
        }
        if (containsGregorMD && containsOrdinal) {
          throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
        }
        var useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
        var units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
        if (useWeekData) {
          units = orderedWeekUnits;
          defaultValues = defaultWeekUnitValues;
          objNow = gregorianToWeek(objNow, minDaysInFirstWeek, startOfWeek);
        } else if (containsOrdinal) {
          units = orderedOrdinalUnits;
          defaultValues = defaultOrdinalUnitValues;
          objNow = gregorianToOrdinal(objNow);
        } else {
          units = orderedUnits;
          defaultValues = defaultUnitValues;
        }
        var foundFirst = false;
        for (var _iterator2 = _createForOfIteratorHelperLoose(units), _step2; !(_step2 = _iterator2()).done; ) {
          var u = _step2.value;
          var v = normalized[u];
          if (!isUndefined(v)) {
            foundFirst = true;
          } else if (foundFirst) {
            normalized[u] = defaultValues[u];
          } else {
            normalized[u] = objNow[u];
          }
        }
        var higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid = higherOrderInvalid || hasInvalidTimeData(normalized);
        if (invalid) {
          return DateTime.invalid(invalid);
        }
        var gregorian = useWeekData ? weekToGregorian(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, _objToTS2 = objToTS(gregorian, offsetProvis, zoneToUse), tsFinal = _objToTS2[0], offsetFinal = _objToTS2[1], inst = new DateTime({
          ts: tsFinal,
          zone: zoneToUse,
          o: offsetFinal,
          loc: loc
        });
        if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
          return DateTime.invalid("mismatched weekday", "you can't specify both a weekday of " + normalized.weekday + " and a date of " + inst.toISO());
        }
        if (!inst.isValid) {
          return DateTime.invalid(inst.invalid);
        }
        return inst;
      };
      DateTime.fromISO = function fromISO(text, opts) {
        if (opts === undefined) {
          opts = {};
        }
        var _parseISODate = parseISODate(text), vals = _parseISODate[0], parsedZone = _parseISODate[1];
        return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
      };
      DateTime.fromRFC2822 = function fromRFC2822(text, opts) {
        if (opts === undefined) {
          opts = {};
        }
        var _parseRFC2822Date = parseRFC2822Date(text), vals = _parseRFC2822Date[0], parsedZone = _parseRFC2822Date[1];
        return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
      };
      DateTime.fromHTTP = function fromHTTP(text, opts) {
        if (opts === undefined) {
          opts = {};
        }
        var _parseHTTPDate = parseHTTPDate(text), vals = _parseHTTPDate[0], parsedZone = _parseHTTPDate[1];
        return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
      };
      DateTime.fromFormat = function fromFormat(text, fmt, opts) {
        if (opts === undefined) {
          opts = {};
        }
        if (isUndefined(text) || isUndefined(fmt)) {
          throw new InvalidArgumentError("fromFormat requires an input string and a format");
        }
        var _opts = opts, _opts$locale = _opts.locale, locale = _opts$locale === undefined ? null : _opts$locale, _opts$numberingSystem = _opts.numberingSystem, numberingSystem = _opts$numberingSystem === undefined ? null : _opts$numberingSystem, localeToUse = Locale.fromOpts({
          locale: locale,
          numberingSystem: numberingSystem,
          defaultToEN: true
        }), _parseFromTokens = parseFromTokens(localeToUse, text, fmt), vals = _parseFromTokens[0], parsedZone = _parseFromTokens[1], specificOffset = _parseFromTokens[2], invalid = _parseFromTokens[3];
        if (invalid) {
          return DateTime.invalid(invalid);
        } else {
          return parseDataToDateTime(vals, parsedZone, opts, "format " + fmt, text, specificOffset);
        }
      };
      DateTime.fromString = function fromString(text, fmt, opts) {
        if (opts === undefined) {
          opts = {};
        }
        return DateTime.fromFormat(text, fmt, opts);
      };
      DateTime.fromSQL = function fromSQL(text, opts) {
        if (opts === undefined) {
          opts = {};
        }
        var _parseSQL = parseSQL(text), vals = _parseSQL[0], parsedZone = _parseSQL[1];
        return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
      };
      DateTime.invalid = function invalid(reason, explanation) {
        if (explanation === undefined) {
          explanation = null;
        }
        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
        }
        var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
        if (Settings.throwOnInvalid) {
          throw new InvalidDateTimeError(invalid);
        } else {
          return new DateTime({
            invalid: invalid
          });
        }
      };
      DateTime.isDateTime = function isDateTime(o) {
        return o && o.isLuxonDateTime || false;
      };
      DateTime.parseFormatForOpts = function parseFormatForOpts(formatOpts, localeOpts) {
        if (localeOpts === undefined) {
          localeOpts = {};
        }
        var tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
        return !tokenList ? null : tokenList.map(function (t) {
          return t ? t.val : null;
        }).join("");
      };
      DateTime.expandFormat = function expandFormat(fmt, localeOpts) {
        if (localeOpts === undefined) {
          localeOpts = {};
        }
        var expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
        return expanded.map(function (t) {
          return t.val;
        }).join("");
      };
      DateTime.resetCache = function resetCache() {
        zoneOffsetTs = undefined;
        zoneOffsetGuessCache = {};
      };
      var _proto = DateTime.prototype;
      _proto.get = function get(unit) {
        return this[unit];
      };
      _proto.getPossibleOffsets = function getPossibleOffsets() {
        if (!this.isValid || this.isOffsetFixed) {
          return [this];
        }
        var dayMs = 86400000;
        var minuteMs = 60000;
        var localTS = objToLocalTS(this.c);
        var oEarlier = this.zone.offset(localTS - dayMs);
        var oLater = this.zone.offset(localTS + dayMs);
        var o1 = this.zone.offset(localTS - oEarlier * minuteMs);
        var o2 = this.zone.offset(localTS - oLater * minuteMs);
        if (o1 === o2) {
          return [this];
        }
        var ts1 = localTS - o1 * minuteMs;
        var ts2 = localTS - o2 * minuteMs;
        var c1 = tsToObj(ts1, o1);
        var c2 = tsToObj(ts2, o2);
        if (c1.hour === c2.hour && c1.minute === c2.minute && c1.second === c2.second && c1.millisecond === c2.millisecond) {
          return [clone(this, {
            ts: ts1
          }), clone(this, {
            ts: ts2
          })];
        }
        return [this];
      };
      _proto.resolvedLocaleOptions = function resolvedLocaleOptions(opts) {
        if (opts === undefined) {
          opts = {};
        }
        var _Formatter$create$res = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this), locale = _Formatter$create$res.locale, numberingSystem = _Formatter$create$res.numberingSystem, calendar = _Formatter$create$res.calendar;
        return {
          locale: locale,
          numberingSystem: numberingSystem,
          outputCalendar: calendar
        };
      };
      _proto.toUTC = function toUTC(offset, opts) {
        if (offset === undefined) {
          offset = 0;
        }
        if (opts === undefined) {
          opts = {};
        }
        return this.setZone(FixedOffsetZone.instance(offset), opts);
      };
      _proto.toLocal = function toLocal() {
        return this.setZone(Settings.defaultZone);
      };
      _proto.setZone = function setZone(zone, _temp) {
        var _ref2 = _temp === undefined ? {} : _temp, _ref2$keepLocalTime = _ref2.keepLocalTime, keepLocalTime = _ref2$keepLocalTime === undefined ? false : _ref2$keepLocalTime, _ref2$keepCalendarTim = _ref2.keepCalendarTime, keepCalendarTime = _ref2$keepCalendarTim === undefined ? false : _ref2$keepCalendarTim;
        zone = normalizeZone(zone, Settings.defaultZone);
        if (zone.equals(this.zone)) {
          return this;
        } else if (!zone.isValid) {
          return DateTime.invalid(unsupportedZone(zone));
        } else {
          var newTS = this.ts;
          if (keepLocalTime || keepCalendarTime) {
            var offsetGuess = zone.offset(this.ts);
            var asObj = this.toObject();
            var _objToTS3 = objToTS(asObj, offsetGuess, zone);
            newTS = _objToTS3[0];
          }
          return clone(this, {
            ts: newTS,
            zone: zone
          });
        }
      };
      _proto.reconfigure = function reconfigure(_temp2) {
        var _ref3 = _temp2 === undefined ? {} : _temp2, locale = _ref3.locale, numberingSystem = _ref3.numberingSystem, outputCalendar = _ref3.outputCalendar;
        var loc = this.loc.clone({
          locale: locale,
          numberingSystem: numberingSystem,
          outputCalendar: outputCalendar
        });
        return clone(this, {
          loc: loc
        });
      };
      _proto.setLocale = function setLocale(locale) {
        return this.reconfigure({
          locale: locale
        });
      };
      _proto.set = function set(values) {
        if (!this.isValid) return this;
        var normalized = normalizeObject(values, normalizeUnitWithLocalWeeks);
        var _usesLocalWeekValues2 = usesLocalWeekValues(normalized, this.loc), minDaysInFirstWeek = _usesLocalWeekValues2.minDaysInFirstWeek, startOfWeek = _usesLocalWeekValues2.startOfWeek;
        var settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
        if ((containsGregor || containsOrdinal) && definiteWeekDef) {
          throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
        }
        if (containsGregorMD && containsOrdinal) {
          throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
        }
        var mixed;
        if (settingWeekStuff) {
          mixed = weekToGregorian(_extends({}, gregorianToWeek(this.c, minDaysInFirstWeek, startOfWeek), normalized), minDaysInFirstWeek, startOfWeek);
        } else if (!isUndefined(normalized.ordinal)) {
          mixed = ordinalToGregorian(_extends({}, gregorianToOrdinal(this.c), normalized));
        } else {
          mixed = _extends({}, this.toObject(), normalized);
          if (isUndefined(normalized.day)) {
            mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
          }
        }
        var _objToTS4 = objToTS(mixed, this.o, this.zone), ts = _objToTS4[0], o = _objToTS4[1];
        return clone(this, {
          ts: ts,
          o: o
        });
      };
      _proto.plus = function plus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration);
        return clone(this, adjustTime(this, dur));
      };
      _proto.minus = function minus(duration) {
        if (!this.isValid) return this;
        var dur = Duration.fromDurationLike(duration).negate();
        return clone(this, adjustTime(this, dur));
      };
      _proto.startOf = function startOf(unit, _temp3) {
        var _ref4 = _temp3 === undefined ? {} : _temp3, _ref4$useLocaleWeeks = _ref4.useLocaleWeeks, useLocaleWeeks = _ref4$useLocaleWeeks === undefined ? false : _ref4$useLocaleWeeks;
        if (!this.isValid) return this;
        var o = {}, normalizedUnit = Duration.normalizeUnit(unit);
        switch (normalizedUnit) {
          case "years":
            o.month = 1;
          case "quarters":
          case "months":
            o.day = 1;
          case "weeks":
          case "days":
            o.hour = 0;
          case "hours":
            o.minute = 0;
          case "minutes":
            o.second = 0;
          case "seconds":
            o.millisecond = 0;
            break;
        }
        if (normalizedUnit === "weeks") {
          if (useLocaleWeeks) {
            var startOfWeek = this.loc.getStartOfWeek();
            var weekday = this.weekday;
            if (weekday < startOfWeek) {
              o.weekNumber = this.weekNumber - 1;
            }
            o.weekday = startOfWeek;
          } else {
            o.weekday = 1;
          }
        }
        if (normalizedUnit === "quarters") {
          var q = Math.ceil(this.month / 3);
          o.month = (q - 1) * 3 + 1;
        }
        return this.set(o);
      };
      _proto.endOf = function endOf(unit, opts) {
        var _this$plus;
        return this.isValid ? this.plus((_this$plus = {}, _this$plus[unit] = 1, _this$plus)).startOf(unit, opts).minus(1) : this;
      };
      _proto.toFormat = function toFormat(fmt, opts) {
        if (opts === undefined) {
          opts = {};
        }
        return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID;
      };
      _proto.toLocaleString = function toLocaleString(formatOpts, opts) {
        if (formatOpts === undefined) {
          formatOpts = DATE_SHORT;
        }
        if (opts === undefined) {
          opts = {};
        }
        return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID;
      };
      _proto.toLocaleParts = function toLocaleParts(opts) {
        if (opts === undefined) {
          opts = {};
        }
        return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
      };
      _proto.toISO = function toISO(_temp4) {
        var _ref5 = _temp4 === undefined ? {} : _temp4, _ref5$format = _ref5.format, format = _ref5$format === undefined ? "extended" : _ref5$format, _ref5$suppressSeconds = _ref5.suppressSeconds, suppressSeconds = _ref5$suppressSeconds === undefined ? false : _ref5$suppressSeconds, _ref5$suppressMillise = _ref5.suppressMilliseconds, suppressMilliseconds = _ref5$suppressMillise === undefined ? false : _ref5$suppressMillise, _ref5$includeOffset = _ref5.includeOffset, includeOffset = _ref5$includeOffset === undefined ? true : _ref5$includeOffset, _ref5$extendedZone = _ref5.extendedZone, extendedZone = _ref5$extendedZone === undefined ? false : _ref5$extendedZone;
        if (!this.isValid) {
          return null;
        }
        var ext = format === "extended";
        var c = _toISODate(this, ext);
        c += "T";
        c += _toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
        return c;
      };
      _proto.toISODate = function toISODate(_temp5) {
        var _ref6 = _temp5 === undefined ? {} : _temp5, _ref6$format = _ref6.format, format = _ref6$format === undefined ? "extended" : _ref6$format;
        if (!this.isValid) {
          return null;
        }
        return _toISODate(this, format === "extended");
      };
      _proto.toISOWeekDate = function toISOWeekDate() {
        return toTechFormat(this, "kkkk-'W'WW-c");
      };
      _proto.toISOTime = function toISOTime(_temp6) {
        var _ref7 = _temp6 === undefined ? {} : _temp6, _ref7$suppressMillise = _ref7.suppressMilliseconds, suppressMilliseconds = _ref7$suppressMillise === undefined ? false : _ref7$suppressMillise, _ref7$suppressSeconds = _ref7.suppressSeconds, suppressSeconds = _ref7$suppressSeconds === undefined ? false : _ref7$suppressSeconds, _ref7$includeOffset = _ref7.includeOffset, includeOffset = _ref7$includeOffset === undefined ? true : _ref7$includeOffset, _ref7$includePrefix = _ref7.includePrefix, includePrefix = _ref7$includePrefix === undefined ? false : _ref7$includePrefix, _ref7$extendedZone = _ref7.extendedZone, extendedZone = _ref7$extendedZone === undefined ? false : _ref7$extendedZone, _ref7$format = _ref7.format, format = _ref7$format === undefined ? "extended" : _ref7$format;
        if (!this.isValid) {
          return null;
        }
        var c = includePrefix ? "T" : "";
        return c + _toISOTime(this, format === "extended", suppressSeconds, suppressMilliseconds, includeOffset, extendedZone);
      };
      _proto.toRFC2822 = function toRFC2822() {
        return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
      };
      _proto.toHTTP = function toHTTP() {
        return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
      };
      _proto.toSQLDate = function toSQLDate() {
        if (!this.isValid) {
          return null;
        }
        return _toISODate(this, true);
      };
      _proto.toSQLTime = function toSQLTime(_temp7) {
        var _ref8 = _temp7 === undefined ? {} : _temp7, _ref8$includeOffset = _ref8.includeOffset, includeOffset = _ref8$includeOffset === undefined ? true : _ref8$includeOffset, _ref8$includeZone = _ref8.includeZone, includeZone = _ref8$includeZone === undefined ? false : _ref8$includeZone, _ref8$includeOffsetSp = _ref8.includeOffsetSpace, includeOffsetSpace = _ref8$includeOffsetSp === undefined ? true : _ref8$includeOffsetSp;
        var fmt = "HH:mm:ss.SSS";
        if (includeZone || includeOffset) {
          if (includeOffsetSpace) {
            fmt += " ";
          }
          if (includeZone) {
            fmt += "z";
          } else if (includeOffset) {
            fmt += "ZZ";
          }
        }
        return toTechFormat(this, fmt, true);
      };
      _proto.toSQL = function toSQL(opts) {
        if (opts === undefined) {
          opts = {};
        }
        if (!this.isValid) {
          return null;
        }
        return this.toSQLDate() + " " + this.toSQLTime(opts);
      };
      _proto.toString = function toString() {
        return this.isValid ? this.toISO() : INVALID;
      };
      _proto[_Symbol$for] = function () {
        if (this.isValid) {
          return "DateTime { ts: " + this.toISO() + ", zone: " + this.zone.name + ", locale: " + this.locale + " }";
        } else {
          return "DateTime { Invalid, reason: " + this.invalidReason + " }";
        }
      };
      _proto.valueOf = function valueOf() {
        return this.toMillis();
      };
      _proto.toMillis = function toMillis() {
        return this.isValid ? this.ts : NaN;
      };
      _proto.toSeconds = function toSeconds() {
        return this.isValid ? this.ts / 1000 : NaN;
      };
      _proto.toUnixInteger = function toUnixInteger() {
        return this.isValid ? Math.floor(this.ts / 1000) : NaN;
      };
      _proto.toJSON = function toJSON() {
        return this.toISO();
      };
      _proto.toBSON = function toBSON() {
        return this.toJSDate();
      };
      _proto.toObject = function toObject(opts) {
        if (opts === undefined) {
          opts = {};
        }
        if (!this.isValid) return {};
        var base = _extends({}, this.c);
        if (opts.includeConfig) {
          base.outputCalendar = this.outputCalendar;
          base.numberingSystem = this.loc.numberingSystem;
          base.locale = this.loc.locale;
        }
        return base;
      };
      _proto.toJSDate = function toJSDate() {
        return new Date(this.isValid ? this.ts : NaN);
      };
      _proto.diff = function diff(otherDateTime, unit, opts) {
        if (unit === undefined) {
          unit = "milliseconds";
        }
        if (opts === undefined) {
          opts = {};
        }
        if (!this.isValid || !otherDateTime.isValid) {
          return Duration.invalid("created by diffing an invalid DateTime");
        }
        var durOpts = _extends({
          locale: this.locale,
          numberingSystem: this.numberingSystem
        }, opts);
        var units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = _diff(earlier, later, units, durOpts);
        return otherIsLater ? diffed.negate() : diffed;
      };
      _proto.diffNow = function diffNow(unit, opts) {
        if (unit === undefined) {
          unit = "milliseconds";
        }
        if (opts === undefined) {
          opts = {};
        }
        return this.diff(DateTime.now(), unit, opts);
      };
      _proto.until = function until(otherDateTime) {
        return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
      };
      _proto.hasSame = function hasSame(otherDateTime, unit, opts) {
        if (!this.isValid) return false;
        var inputMs = otherDateTime.valueOf();
        var adjustedToZone = this.setZone(otherDateTime.zone, {
          keepLocalTime: true
        });
        return adjustedToZone.startOf(unit, opts) <= inputMs && inputMs <= adjustedToZone.endOf(unit, opts);
      };
      _proto.equals = function equals(other) {
        return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
      };
      _proto.toRelative = function toRelative(options) {
        if (options === undefined) {
          options = {};
        }
        if (!this.isValid) return null;
        var base = options.base || DateTime.fromObject({}, {
          zone: this.zone
        }), padding = options.padding ? this < base ? -options.padding : options.padding : 0;
        var units = ["years", "months", "days", "hours", "minutes", "seconds"];
        var unit = options.unit;
        if (Array.isArray(options.unit)) {
          units = options.unit;
          unit = undefined;
        }
        return diffRelative(base, this.plus(padding), _extends({}, options, {
          numeric: "always",
          units: units,
          unit: unit
        }));
      };
      _proto.toRelativeCalendar = function toRelativeCalendar(options) {
        if (options === undefined) {
          options = {};
        }
        if (!this.isValid) return null;
        return diffRelative(options.base || DateTime.fromObject({}, {
          zone: this.zone
        }), this, _extends({}, options, {
          numeric: "auto",
          units: ["years", "months", "days"],
          calendary: true
        }));
      };
      DateTime.min = function min() {
        for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
          dateTimes[_key] = arguments[_key];
        }
        if (!dateTimes.every(DateTime.isDateTime)) {
          throw new InvalidArgumentError("min requires all arguments be DateTimes");
        }
        return bestBy(dateTimes, function (i) {
          return i.valueOf();
        }, Math.min);
      };
      DateTime.max = function max() {
        for (var _len2 = arguments.length, dateTimes = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          dateTimes[_key2] = arguments[_key2];
        }
        if (!dateTimes.every(DateTime.isDateTime)) {
          throw new InvalidArgumentError("max requires all arguments be DateTimes");
        }
        return bestBy(dateTimes, function (i) {
          return i.valueOf();
        }, Math.max);
      };
      DateTime.fromFormatExplain = function fromFormatExplain(text, fmt, options) {
        if (options === undefined) {
          options = {};
        }
        var _options = options, _options$locale = _options.locale, locale = _options$locale === undefined ? null : _options$locale, _options$numberingSys = _options.numberingSystem, numberingSystem = _options$numberingSys === undefined ? null : _options$numberingSys, localeToUse = Locale.fromOpts({
          locale: locale,
          numberingSystem: numberingSystem,
          defaultToEN: true
        });
        return explainFromTokens(localeToUse, text, fmt);
      };
      DateTime.fromStringExplain = function fromStringExplain(text, fmt, options) {
        if (options === undefined) {
          options = {};
        }
        return DateTime.fromFormatExplain(text, fmt, options);
      };
      DateTime.buildFormatParser = function buildFormatParser(fmt, options) {
        if (options === undefined) {
          options = {};
        }
        var _options2 = options, _options2$locale = _options2.locale, locale = _options2$locale === undefined ? null : _options2$locale, _options2$numberingSy = _options2.numberingSystem, numberingSystem = _options2$numberingSy === undefined ? null : _options2$numberingSy, localeToUse = Locale.fromOpts({
          locale: locale,
          numberingSystem: numberingSystem,
          defaultToEN: true
        });
        return new TokenParser(localeToUse, fmt);
      };
      DateTime.fromFormatParser = function fromFormatParser(text, formatParser, opts) {
        if (opts === undefined) {
          opts = {};
        }
        if (isUndefined(text) || isUndefined(formatParser)) {
          throw new InvalidArgumentError("fromFormatParser requires an input string and a format parser");
        }
        var _opts2 = opts, _opts2$locale = _opts2.locale, locale = _opts2$locale === undefined ? null : _opts2$locale, _opts2$numberingSyste = _opts2.numberingSystem, numberingSystem = _opts2$numberingSyste === undefined ? null : _opts2$numberingSyste, localeToUse = Locale.fromOpts({
          locale: locale,
          numberingSystem: numberingSystem,
          defaultToEN: true
        });
        if (!localeToUse.equals(formatParser.locale)) {
          throw new InvalidArgumentError("fromFormatParser called with a locale of " + localeToUse + ", " + ("but the format parser was created for " + formatParser.locale));
        }
        var _formatParser$explain = formatParser.explainFromTokens(text), result = _formatParser$explain.result, zone = _formatParser$explain.zone, specificOffset = _formatParser$explain.specificOffset, invalidReason = _formatParser$explain.invalidReason;
        if (invalidReason) {
          return DateTime.invalid(invalidReason);
        } else {
          return parseDataToDateTime(result, zone, opts, "format " + formatParser.format, text, specificOffset);
        }
      };
      _createClass(DateTime, [{
        key: "isValid",
        get: function get() {
          return this.invalid === null;
        }
      }, {
        key: "invalidReason",
        get: function get() {
          return this.invalid ? this.invalid.reason : null;
        }
      }, {
        key: "invalidExplanation",
        get: function get() {
          return this.invalid ? this.invalid.explanation : null;
        }
      }, {
        key: "locale",
        get: function get() {
          return this.isValid ? this.loc.locale : null;
        }
      }, {
        key: "numberingSystem",
        get: function get() {
          return this.isValid ? this.loc.numberingSystem : null;
        }
      }, {
        key: "outputCalendar",
        get: function get() {
          return this.isValid ? this.loc.outputCalendar : null;
        }
      }, {
        key: "zone",
        get: function get() {
          return this._zone;
        }
      }, {
        key: "zoneName",
        get: function get() {
          return this.isValid ? this.zone.name : null;
        }
      }, {
        key: "year",
        get: function get() {
          return this.isValid ? this.c.year : NaN;
        }
      }, {
        key: "quarter",
        get: function get() {
          return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
        }
      }, {
        key: "month",
        get: function get() {
          return this.isValid ? this.c.month : NaN;
        }
      }, {
        key: "day",
        get: function get() {
          return this.isValid ? this.c.day : NaN;
        }
      }, {
        key: "hour",
        get: function get() {
          return this.isValid ? this.c.hour : NaN;
        }
      }, {
        key: "minute",
        get: function get() {
          return this.isValid ? this.c.minute : NaN;
        }
      }, {
        key: "second",
        get: function get() {
          return this.isValid ? this.c.second : NaN;
        }
      }, {
        key: "millisecond",
        get: function get() {
          return this.isValid ? this.c.millisecond : NaN;
        }
      }, {
        key: "weekYear",
        get: function get() {
          return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
        }
      }, {
        key: "weekNumber",
        get: function get() {
          return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
        }
      }, {
        key: "weekday",
        get: function get() {
          return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
        }
      }, {
        key: "isWeekend",
        get: function get() {
          return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
        }
      }, {
        key: "localWeekday",
        get: function get() {
          return this.isValid ? possiblyCachedLocalWeekData(this).weekday : NaN;
        }
      }, {
        key: "localWeekNumber",
        get: function get() {
          return this.isValid ? possiblyCachedLocalWeekData(this).weekNumber : NaN;
        }
      }, {
        key: "localWeekYear",
        get: function get() {
          return this.isValid ? possiblyCachedLocalWeekData(this).weekYear : NaN;
        }
      }, {
        key: "ordinal",
        get: function get() {
          return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
        }
      }, {
        key: "monthShort",
        get: function get() {
          return this.isValid ? Info.months("short", {
            locObj: this.loc
          })[this.month - 1] : null;
        }
      }, {
        key: "monthLong",
        get: function get() {
          return this.isValid ? Info.months("long", {
            locObj: this.loc
          })[this.month - 1] : null;
        }
      }, {
        key: "weekdayShort",
        get: function get() {
          return this.isValid ? Info.weekdays("short", {
            locObj: this.loc
          })[this.weekday - 1] : null;
        }
      }, {
        key: "weekdayLong",
        get: function get() {
          return this.isValid ? Info.weekdays("long", {
            locObj: this.loc
          })[this.weekday - 1] : null;
        }
      }, {
        key: "offset",
        get: function get() {
          return this.isValid ? +this.o : NaN;
        }
      }, {
        key: "offsetNameShort",
        get: function get() {
          if (this.isValid) {
            return this.zone.offsetName(this.ts, {
              format: "short",
              locale: this.locale
            });
          } else {
            return null;
          }
        }
      }, {
        key: "offsetNameLong",
        get: function get() {
          if (this.isValid) {
            return this.zone.offsetName(this.ts, {
              format: "long",
              locale: this.locale
            });
          } else {
            return null;
          }
        }
      }, {
        key: "isOffsetFixed",
        get: function get() {
          return this.isValid ? this.zone.isUniversal : null;
        }
      }, {
        key: "isInDST",
        get: function get() {
          if (this.isOffsetFixed) {
            return false;
          } else {
            return this.offset > this.set({
              month: 1,
              day: 1
            }).offset || this.offset > this.set({
              month: 5
            }).offset;
          }
        }
      }, {
        key: "isInLeapYear",
        get: function get() {
          return isLeapYear(this.year);
        }
      }, {
        key: "daysInMonth",
        get: function get() {
          return daysInMonth(this.year, this.month);
        }
      }, {
        key: "daysInYear",
        get: function get() {
          return this.isValid ? daysInYear(this.year) : NaN;
        }
      }, {
        key: "weeksInWeekYear",
        get: function get() {
          return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
        }
      }, {
        key: "weeksInLocalWeekYear",
        get: function get() {
          return this.isValid ? weeksInWeekYear(this.localWeekYear, this.loc.getMinDaysInFirstWeek(), this.loc.getStartOfWeek()) : NaN;
        }
      }], [{
        key: "DATE_SHORT",
        get: function get() {
          return DATE_SHORT;
        }
      }, {
        key: "DATE_MED",
        get: function get() {
          return DATE_MED;
        }
      }, {
        key: "DATE_MED_WITH_WEEKDAY",
        get: function get() {
          return DATE_MED_WITH_WEEKDAY;
        }
      }, {
        key: "DATE_FULL",
        get: function get() {
          return DATE_FULL;
        }
      }, {
        key: "DATE_HUGE",
        get: function get() {
          return DATE_HUGE;
        }
      }, {
        key: "TIME_SIMPLE",
        get: function get() {
          return TIME_SIMPLE;
        }
      }, {
        key: "TIME_WITH_SECONDS",
        get: function get() {
          return TIME_WITH_SECONDS;
        }
      }, {
        key: "TIME_WITH_SHORT_OFFSET",
        get: function get() {
          return TIME_WITH_SHORT_OFFSET;
        }
      }, {
        key: "TIME_WITH_LONG_OFFSET",
        get: function get() {
          return TIME_WITH_LONG_OFFSET;
        }
      }, {
        key: "TIME_24_SIMPLE",
        get: function get() {
          return TIME_24_SIMPLE;
        }
      }, {
        key: "TIME_24_WITH_SECONDS",
        get: function get() {
          return TIME_24_WITH_SECONDS;
        }
      }, {
        key: "TIME_24_WITH_SHORT_OFFSET",
        get: function get() {
          return TIME_24_WITH_SHORT_OFFSET;
        }
      }, {
        key: "TIME_24_WITH_LONG_OFFSET",
        get: function get() {
          return TIME_24_WITH_LONG_OFFSET;
        }
      }, {
        key: "DATETIME_SHORT",
        get: function get() {
          return DATETIME_SHORT;
        }
      }, {
        key: "DATETIME_SHORT_WITH_SECONDS",
        get: function get() {
          return DATETIME_SHORT_WITH_SECONDS;
        }
      }, {
        key: "DATETIME_MED",
        get: function get() {
          return DATETIME_MED;
        }
      }, {
        key: "DATETIME_MED_WITH_SECONDS",
        get: function get() {
          return DATETIME_MED_WITH_SECONDS;
        }
      }, {
        key: "DATETIME_MED_WITH_WEEKDAY",
        get: function get() {
          return DATETIME_MED_WITH_WEEKDAY;
        }
      }, {
        key: "DATETIME_FULL",
        get: function get() {
          return DATETIME_FULL;
        }
      }, {
        key: "DATETIME_FULL_WITH_SECONDS",
        get: function get() {
          return DATETIME_FULL_WITH_SECONDS;
        }
      }, {
        key: "DATETIME_HUGE",
        get: function get() {
          return DATETIME_HUGE;
        }
      }, {
        key: "DATETIME_HUGE_WITH_SECONDS",
        get: function get() {
          return DATETIME_HUGE_WITH_SECONDS;
        }
      }]);
      return DateTime;
    })(Symbol.for("nodejs.util.inspect.custom"));
    function friendlyDateTime(dateTimeish) {
      if (DateTime.isDateTime(dateTimeish)) {
        return dateTimeish;
      } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
        return DateTime.fromJSDate(dateTimeish);
      } else if (dateTimeish && typeof dateTimeish === "object") {
        return DateTime.fromObject(dateTimeish);
      } else {
        throw new InvalidArgumentError("Unknown datetime argument: " + dateTimeish + ", of type " + typeof dateTimeish);
      }
    }
    var VERSION = "3.5.0";
    luxon$1.DateTime = DateTime;
    luxon$1.Duration = Duration;
    luxon$1.FixedOffsetZone = FixedOffsetZone;
    luxon$1.IANAZone = IANAZone;
    luxon$1.Info = Info;
    luxon$1.Interval = Interval;
    luxon$1.InvalidZone = InvalidZone;
    luxon$1.Settings = Settings;
    luxon$1.SystemZone = SystemZone;
    luxon$1.VERSION = VERSION;
    luxon$1.Zone = Zone;
    return luxon$1;
  }

  var luxonExports = requireLuxon();

  var namedExports = /*#__PURE__*/_mergeNamespaces({
    __proto__: null,
    default: luxonExports
  }, [luxonExports]);

  const defaultExports = Object.isFrozen(luxonExports) ? Object.assign({}, luxonExports?.default || luxonExports || { __emptyModule: true }) : luxonExports;
  Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
  Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
  var luxon = Object.isFrozen(luxonExports) ? Object.freeze(defaultExports) : defaultExports;

  return luxon;

}));
