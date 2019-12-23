;!function(){
  var tlog = window.tlog||[];
  var body = document.getElementsByTagName("body")[0];
  var pageId = body.getAttribute('data-page-id')||'';
  var dataInfo = body.getAttribute('data-info')||'';
  //不支持类似.com.cn 这种域名
  var domain = document.domain.split('.').slice(-2).join('.') + (location.port ? ':'+location.port : '');
  var __tlogPreSet = window.__tlogPreSet || {};
  var cookie={
    get:function( name ) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');
      for ( var i=0;i < ca.length; i++ ) {
        var c = ca[ i ];
        while ( c.charAt(0) == ' ' ) c = c.substring( 1 , c.length );
        if ( c.indexOf( nameEQ ) == 0 ) {
          var ret;
          try{
            ret = decodeURIComponent( c.substring( nameEQ.length , c.length ) );
          } catch(e) {
            ret = unescape( c.substring( nameEQ.length , c.length ) );
          }
          return ret;
        }
      }
      return null;
    },
    set:function( name , value , days , path , domain , secure ) {
      var expires;
      if (typeof days ==='number') {
        var date = new Date();
        date.setTime( date.getTime() + ( days * 1000 ) );
        expires = date.toGMTString();
      } else if ( typeof days ==='string' ) {
        expires = days;
      } else {
        expires = false;
      }
      document.cookie = name + '=' + encodeURIComponent( value )+
        (expires ? (';expires=' + expires)  : '') +
        (path ? (';path=' + path) : '') +
        (domain ? (';domain=' + domain) : '') +
        (secure ? ';secure' : '');
    }
  };
  tlog = {
    pug : function(){
      if (!arguments || typeof arguments[0] != 'object') {
        return
      }
      var param = arguments[0],
        url = arguments[1] || window.location.href;
      url = url.split('#');
      var hash = url[1]||'';
      url = url[0];
      for (var i in param) {
        if(param.hasOwnProperty(i)){
          var name = i,
            val = param[i];
          var reg = new RegExp('([\\?&#])((' + name + '=)([^&#]+))(&?)', 'i');
          var omatch = url.match(reg);
          if (val !== 0 && !val && omatch) {
            (omatch[5] && omatch[2]) ? url = url.replace(omatch[2] + '&', '') : (omatch[1] && omatch[2]) ? url = url.replace(omatch[0], '') : ''
          }
          if ((val === 0 || val) && !omatch) {
            url.indexOf('?') > -1 ? url += '&' + name + '=' + val : url += '?' + name + '=' + val
          }
          if ((val === 0 || val) && omatch===0 || omatch && val != omatch[4]) {
            url = url.replace(omatch[2], omatch[3] + val);
          }
        }
      }
      if(hash){
        url += '#'+hash;
      }
      if (!arguments[1] && window.location.href != url) {
        window.location.href = url;
      } else {
        return url;
      }
    },
    gup:function(name,url){
      var reg = new RegExp('[?&#]' + name + '=([^&#]+)', 'i'),
        ret = reg.exec(url);
      return ret? decodeURIComponent(ret[1]):'';
    },
    stacks : Object.prototype.toString.call(tlog)==='[object Array]'?tlog:[],
    start : +new Date(),
    cache : {
      url : encodeURIComponent(window.location.href),
      refer : encodeURIComponent(window.document.referrer),
      resolution :  window.screen? window.screen.width+'X'+ window.screen.height :'0X0'
    },
    src : '//statistic.'+domain+'/statisticPlatform/tLog?page_id='+pageId+(dataInfo?'&data_info='+dataInfo:''),
    timer: '',
    mscid:{},
    domain:domain,
    path:'/',
    defaultcode:'00000000',
    getTime : function(){
      return +new Date();
    },
    load : function(source){
      var src = this.pug({t:this.getTime()},source);
      var image = new Image;
      image.src = src;
    },
    uid:function(){
      return (+new Date()+Math.random()).toFixed(2);
    },
    toToday:function(){
      var date = new Date();
      date.setHours(0,0,0,0);
      return 24*60*60*1000-(this.getTime()-date.getTime());
    },
    getTlog:function(){
      return cookie.get('__tlog')||'';
    },
    update:function(){
      var __tlog = this.getTlog(),
        url = window.location.href;
      if(!__tlog){
        this.defaultSet('update');
        return;
      }else{
        var tmp = __tlog.split('|'),
          n_imscid = this.gup('imscid',url),
          n_mscid = this.gup('mscid',url),
          sessionId = tmp[0],
          if_mscid = tmp[1],
          il_mscid = tmp[2],
          ef_mscid = tmp[3],
          el_mscid = tmp[4];
        if(n_imscid && (il_mscid !== n_imscid)){
          il_mscid = n_imscid;
        }
        if(n_mscid && (ef_mscid !== n_mscid)){
          el_mscid = n_mscid;
        }
        cookie.set('__tlog',[sessionId,if_mscid,il_mscid,ef_mscid,el_mscid].join('|'),this.timer,this.path,this.domain);
        this.mscid = {
          sessionId : sessionId,
          if_mscid : if_mscid,
          il_mscid : il_mscid,
          ef_mscid : ef_mscid,
          el_mscid : el_mscid
        };
      };
    },
    defaultSet:function(update){
      var sessionId = this.uid(),
        url = window.location.href,
        defaultcode = this.defaultcode,
        if_mscid = update? this.gup('imscid',url)||defaultcode :defaultcode,
        il_mscid = if_mscid,
        ef_mscid = update? this.gup('mscid',url)||this.defaultcode :defaultcode,
        el_mscid = ef_mscid;
      cookie.set('__tlog',[sessionId,if_mscid,il_mscid,ef_mscid,el_mscid].join('|'),this.timer,this.path,this.domain);
      this.mscid = {
        sessionId :sessionId,
        if_mscid :if_mscid,
        il_mscid :il_mscid,
        ef_mscid :ef_mscid,
        el_mscid :el_mscid
      }
    },
    push:function(){
      if(!arguments.length){
        return;
      };
      if(!this.getTlog()){
        this.defaultSet('update');
      }
      if(this.isnew){
        this.src = this.pug({'isnew':1},this.src);
        delete this.isnew;
      }else{
        this.src = this.pug({'isnew':''},this.src);
      };
      var user_id = cookie.get('user_id')|| 0,
        user_kind = cookie.get("user_kind")|| 9,
        __session_seq = cookie.get('__session_seq')|| 0,
        __uv_seq = cookie.get('__uv_seq')|| 0;
      var param = arguments[0].split(':'),
        type = param[0],
        id = param[1],
        src = this.pug(this.cache,this.src),
        obj = {};
      src = this.pug(this.mscid,src);
      switch (type){
        case 'p':
          __session_seq = __session_seq - 0 + 1;
          __uv_seq = __uv_seq- 0 + 1;
          cookie.set('__session_seq',__session_seq,this.timer,this.path,this.domain);
          cookie.set('__uv_seq',__uv_seq,Math.round(this.toToday()/1000),this.path,this.domain);
          obj = {
            type:'p'
          };
          break;
        case 'c':
          obj = {
            c_id : id,
            type:'c'
          };
          break;
        case 's':
          obj = {
            s_id : id,
            type:'s'
          };
          break;
        default : //'v'
          obj = {
            v_stay_time : this.getTime()-this.start,
            type:'v'
          };
          break;
      }
      src = this.pug(obj,src);
      src = this.pug({
        user_id:user_id,
        user_kind:user_kind,
        session_seq:__session_seq,
        uv_seq:__uv_seq
      },src);
      this.load(src);
    },
    init:function(){
      var __uuid = cookie.get('__uuid');
      var __nnn_bad_na_ = cookie.get('__nnn_bad_na_');
      if(__nnn_bad_na_){
        this.src = this.pug({__nnn_bad_na_:__nnn_bad_na_},this.src);
      }
      this.src = this.pug(__tlogPreSet,this.src);
      if(!__uuid){
        __uuid = this.uid();
        cookie.set('__uuid',__uuid,60*60*24*365*20,this.path,this.domain);
        this.isnew = 1;
      };
      this.cache.uuid = __uuid;
      this.update();
      window.onbeforeunload=function(){
        tlog.push('v');
      };
      var arr = this.stacks;
      this.push('p');
      for(var i= 0,l = arr.length;i<l;i++){
        this.push(arr[i]);
      };
    }
  };
  tlog.init();
  window.tlog = tlog;
}();

var Stat;
if (!this.Stat) {
  Stat = (function () {
    function generateUUID(length){
      var id = new Date().getTime().toString();
      for(var i=0; i<length; i++) id += Math.floor(Math.random()*10);
      return id;
    }
    var load_time = Date.parse(new Date()), stay_time = 0; uuid = generateUUID(10);
    var expireDateTime, documentAlias = document, navigatorAlias = navigator, screenAlias = screen, windowAlias = window, hostnameAlias = windowAlias.location.hostname, hasLoaded = false, registeredOnLoadHandlers = [];
    function isDefined(property) {
      return typeof property !== "undefined";
    }
    function addEventListener(element, eventType, eventHandler, useCapture) {
      if (element.addEventListener) {
        element.addEventListener(eventType, eventHandler, useCapture);
        return true;
      } else {
        if (element.attachEvent) {
          return element.attachEvent("on" + eventType, eventHandler);
        }
      }
      element["on" + eventType] = eventHandler;
    }
    function beforeUnloadHandler() {
      var _hack = true;
      try{
        if(!!( window.attachEvent && !window.opera )){
          var _active = window.document.activeElement;
          if((_active.href || "").indexOf("javascript:") === 0){
            _hack = false;
          }
        }
      } catch(err){}
      if (_hack && isDefined(expireDateTime)) {
        try {
          stay_time = Date.parse(new Date()) - load_time;
          var stat = Stat.getTracker("//statistic.liepin.com/statVisit.do", 1);
          stat.trackPageView();
        } catch( err ){}
        //do { } while (Date.parse(new Date()) < expireDateTime);
      }
    }
    function loadHandler() {
      if (!hasLoaded) {
        hasLoaded = true;
        for (var i = 0; i < registeredOnLoadHandlers.length; i++) {
          registeredOnLoadHandlers[i]();
        }
      }
      return true;
    }
    function addReadyListener() {
      if (documentAlias.addEventListener) {
        addEventListener(documentAlias, "DOMContentLoaded", function () {
          documentAlias.removeEventListener("DOMContentLoaded", arguments.callee, false);
          loadHandler();
        });
      } else {
        if (documentAlias.attachEvent) {
          documentAlias.attachEvent("onreadystatechange", function () {
            if (documentAlias.readyState === "complete") {
              documentAlias.detachEvent("onreadystatechange", arguments.callee);
              loadHandler();
            }
          });
          if (documentAlias.documentElement.doScroll && windowAlias == windowAlias.top) {
            (function () {
              if (hasLoaded) {
                return;
              }
              try {
                documentAlias.documentElement.doScroll("left");
              }
              catch (error) {
                setTimeout(arguments.callee, 0);
                return;
              }
              loadHandler();
            }());
          }
        }
      }
      addEventListener(windowAlias, "load", loadHandler, false);
    }
    function Tracker(trackerUrl, siteId) {
      var userId,userKind,configTrackerUrl = trackerUrl || "", configTrackerSiteId = siteId || "", configCustomUrl, configTrackerPause = 200, configCustomData, browserHasCookies = "0", pageReferrer, escapeWrapper = windowAlias.encodeURIComponent || escape, unescapeWrapper = windowAlias.decodeURIComponent || unescape, stringify = function (value) {
        var escapable = new RegExp("[\\\"\x00-\x1f\x7f-\x9f\xad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]", "g"), meta = {"\b":"\\b", "\t":"\\t", "\n":"\\n", "\f":"\\f", "\r":"\\r", "\"":"\\\"", "\\":"\\\\"};
        function quote(string) {
          escapable.lastIndex = 0;
          return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
          }) + "\"" : "\"" + string + "\"";
        }
        function f(n) {
          return n < 10 ? "0" + n : n;
        }
        function str(key, holder) {
          var i, k, v, partial, value = holder[key];
          if (value === null) {
            return "null";
          }
          if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key);
          }
          switch (typeof value) {
            case "string":
              return quote(value);
            case "number":
              return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "null":
              return String(value);
            case "object":
              partial = [];
              if (value instanceof Array) {
                for (i = 0; i < value.length; i++) {
                  partial[i] = str(i, value) || "null";
                }
                v = partial.length === 0 ? "[]" : "[" + partial.join(",") + "]";
                return v;
              }
              if (value instanceof Date) {
                return quote(value.getUTCFullYear() + "-" + f(value.getUTCMonth() + 1) + "-" + f(value.getUTCDate()) + "T" + f(value.getUTCHours()) + ":" + f(value.getUTCMinutes()) + ":" + f(value.getUTCSeconds()) + "Z");
              }
              for (k in value) {
                v = str(k, value);
                if (v) {
                  partial[partial.length] = quote(k) + ":" + v;
                }
              }
              v = partial.length === 0 ? "{}" : "{" + partial.join(",") + "}";
              return v;
          }
        }
        return str("", {"":value});
      };
      function setCookie(cookieName, value, daysToExpire, path, domain, secure) {
        var expiryDate;
        if (daysToExpire) {
          expiryDate = new Date();
          expiryDate.setTime(expiryDate.getTime() + daysToExpire * 86400000);
        }
        documentAlias.cookie = cookieName + "=" + escapeWrapper(value) + (daysToExpire ? ";expires=" + expiryDate.toGMTString() : "") + ";path=" + (path ? path : "/") + (domain ? ";domain=" + domain : "") + (secure ? ";secure" : "");
      }
      function getCookie(cookieName) {
        var cookiePattern = new RegExp("(^|;)[ ]*" + cookieName + "=([^;]*)"), cookieMatch = cookiePattern.exec(documentAlias.cookie);
        return cookieMatch ? unescapeWrapper(cookieMatch[2]) : 0;
      }
      function getImage(url, delay) {
        var now = new Date(),
          tick = "lt_stats_" + Math.floor(2147483648 * Math.random()).toString(36),
          image = new Image;
        expireDateTime = now.getTime() + delay;
        window[tick] = image;
        image.onload = image.onerror = image.onabort = function() {
          image.onload = image.onerror = image.onabort = null;
          image = window[tick] = null;
        };
        image.src = url;
      }
      function getReferrer() {
        var referrer = "";
        try {
          referrer = top.document.referrer;
        }
        catch (e) {
          if (parent) {
            try {
              referrer = parent.document.referrer;
            }
            catch (e2) {
              referrer = "";
            }
          }
        }
        if (referrer === "") {
          referrer = documentAlias.referrer;
        }
        return referrer;
      }
      function hasCookies() {
        var testCookieName = "_testCookie";
        if (!isDefined(navigatorAlias.cookieEnabled)) {
          setCookie(testCookieName, "1");
          return getCookie(testCookieName) == "1" ? "1" : "0";
        }
        return navigatorAlias.cookieEnabled ? "1" : "0";
      }
      function getRequest() {
        var i, now, request;
        now = new Date();
        request = "site=" + configTrackerSiteId + "&userId="+userId+"&userKind="+userKind+"&url=" + escapeWrapper(isDefined(configCustomUrl) ? configCustomUrl : documentAlias.location.href) + "&resolution=" + screenAlias.width + "x" + screenAlias.height + "&h=" + now.getHours() + "&m=" + now.getMinutes() + "&s=" + now.getSeconds() + "&cookie=" + browserHasCookies + "&ref=" + escapeWrapper(pageReferrer) + "&puuid="+ uuid +"&stay_time="+ stay_time +"&rand=" + Math.random();
        request = configTrackerUrl + "?" + request;
        return request;
      }
      function logPageView() {
        var request = getRequest();
        if (isDefined(configCustomData)) {
          request += "&data=" + escapeWrapper(stringify(configCustomData));
        }
        getImage(request, configTrackerPause);
        return false;
      }
      pageReferrer = getReferrer();
      userId =getCookie('user_id');
      userKind = getCookie("user_kind");
      browserHasCookies = hasCookies();
      return {trackPageView:function () {
        logPageView();
      }};
    }
    addEventListener(windowAlias, "beforeunload", beforeUnloadHandler, false);
    addReadyListener();
    return {getTracker:function (StatUrl, siteId) {
      return new Tracker(StatUrl, siteId);
    }};
  }());
}

;(function(){
  try {
    var stat = Stat.getTracker("//statistic.liepin.com/statVisit.do", 1);
    stat.trackPageView();
  } catch( err ){}
})();