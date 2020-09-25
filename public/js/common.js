; (function ($, window, document, undefined) {
  "use strict";
  if (!$) {
    console.error("jQuery ");
    return false;
  }
  var pluginName = 'bootoast';

  function BootstrapNotify(options) {
    if (options !== undefined) {
      // Variables default
      this.settings = $.extend({}, this.defaults);
      // Checa se foi passada uma mensagem flat ou se h谩 op莽玫es.
      if (typeof options !== 'string') {
        $.extend(this.settings, options);
      } else {
        this.settings.message = options;
      }

      this.content = this.settings.content || this.settings.text || this.settings.message;
      // Define uma posi莽茫o suportada para o .alert
      if (this.positionSupported[this.settings.position] === undefined) {
        // Tenta encontrar um sin么nimo
        var positionCamel = $.camelCase(this.settings.position);

        if (this.positionSinonym[positionCamel] !== undefined) {
          this.settings.position = this.positionSinonym[positionCamel] || 'bottom-center';
        }
      }

      var position = this.settings.position.split('-'),
        positionSelector = '.' + position.join('.'),
        positionClass = position.join(' ');

      // Define se o novo .alert deve ser inserido por primeiro ou 煤ltimo no container.
      this.putTo = position[0] == 'bottom' ? 'appendTo' : 'prependTo';

      // Define o .glyphicon com base no .alert-<type>
      this.settings.icon = this.settings.icon || this.icons[this.settings.type];
      var containerClass = pluginName + '-container';
      if ($('body > .' + containerClass + positionSelector).length === 0) {
        $('<div class="' + containerClass + ' ' + positionClass + '"></div>').appendTo('body');
      }

      // Adiciona o .alert ao .container conforme seu posicionamento.
      this.$el = $('<div class="alert alert-' + this.settings.type + ' ' + pluginName + '"><span class="glyphicon glyphicon-' + this.settings.icon + '"></span><span class="bootoast-alert-container"><span class="bootoast-alert-content">' + this.content + '</span></span></div>')[this.putTo]('.' + containerClass + positionSelector);

      if (this.settings.dismissable === true) {
        this.$el
          .addClass('alert-dismissable')
          .prepend('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
      }

      // Exibe o .alert
      this.$el.animate({
        opacity: 1,
      }, this.settings.animationDuration);

      if (this.settings.timeout !== false) {
        var secondsTimeout = parseInt(this.settings.timeout * 1000),
          timer = this.hide(secondsTimeout),
          plugin = this;

        // Pausa o timeout baseado no hover
        this.$el.hover(
          clearTimeout.bind(window, timer),
          function () {
            timer = plugin.hide(secondsTimeout);
          });
      }
    }
  };

  $.extend(BootstrapNotify.prototype, {
    /*
     * Default options
     * @type {Object} defaults
     */
    defaults: {
      message: 'Helo!', // String: HTML
      type: 'info', // String: ['warning', 'success', 'danger', 'info']
      position: 'bottom-center', // String: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']
      icon: undefined, // String: name
      timeout: false,
      animationDuration: 300, // Int: animation duration in miliseconds
      dismissable: true,
      callback: null
    },
    /*
     * Default icons
     * @type {Object} icons
     */
    icons: {
      warning: 'exclamation-sign',
      success: 'ok-sign',
      danger: 'remove-sign',
      info: 'info-sign'
    },
    /*
     * Position Sinonymus
     * @type {Object} positionSinonym
     */
    positionSinonym: {
      bottom: 'bottom-center',
      leftBottom: 'bottom-left',
      rightBottom: 'bottom-right',
      top: 'top-center',
      rightTop: 'top-right',
      leftTop: 'top-left'
    },
    /*
     * Position Supported
     * @type {array} positionSupported
     */
    positionSupported: [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-right'
    ],
    /**
     * @type {method} hide
     * @param {int} timeout
     * @return {int} setTimeoutID The setTimeout ID.
     **/
    hide: function (timeout) {
      var plugin = this;
      return setTimeout(function () {
        plugin.$el.animate({
          opacity: 0,
        }, plugin.settings.animationDuration, function () {
          plugin.$el.remove();
        });
        if (plugin.settings.callback) {
          plugin.settings.callback();
        }
      }, timeout || 0);
    }
  });

  window[pluginName] = function (options) {
    return new BootstrapNotify(options);
  };

})(window.jQuery || false, window, document);
/*! js-cookie v3.0.0-rc.1 | MIT */
;
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global = global || self, (function () {
        var current = global.Cookies;
        var exports = global.Cookies = factory();
        exports.noConflict = function () { global.Cookies = current; return exports; };
      }()));
}(this, (function () {
  'use strict';

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target
  }

  var defaultConverter = {
    read: function (value) {
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent
      )
    }
  };

  function init(converter, defaultAttributes) {
    function set(key, value, attributes) {
      if (typeof document === 'undefined') {
        return
      }

      attributes = assign({}, defaultAttributes, attributes);

      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }

      key = encodeURIComponent(key)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);

      value = converter.write(value, key);

      var stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue
        }

        stringifiedAttributes += '; ' + attributeName;

        if (attributes[attributeName] === true) {
          continue
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }

      return (document.cookie = key + '=' + value + stringifiedAttributes)
    }

    function get(key) {
      if (typeof document === 'undefined' || (arguments.length && !key)) {
        return
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split('; ') : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        var value = parts.slice(1).join('=');

        if (value[0] === '"') {
          value = value.slice(1, -1);
        }

        try {
          var foundKey = defaultConverter.read(parts[0]);
          jar[foundKey] = converter.read(value, foundKey);

          if (key === foundKey) {
            break
          }
        } catch (e) { }
      }

      return key ? jar[key] : jar
    }

    return Object.create(
      {
        set: set,
        get: get,
        remove: function (key, attributes) {
          set(
            key,
            '',
            assign({}, attributes, {
              expires: -1
            })
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes))
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes)
        }
      },
      {
        attributes: { value: Object.freeze(defaultAttributes) },
        converter: { value: Object.freeze(converter) }
      }
    )
  }

  var api = init(defaultConverter, { path: '/' });

  return api;

})));

; (function ($, window, document, undefined) {
  "use strict";
  if (!$) {
    console.error("jQuery ");
    return false;
  }
  $.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
})(window.jQuery || false, window, document);
function isEmailAvailable(emailInput) {
  var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  if (!myreg.test(emailInput)) {
    return false;
  }
  else {
    return true;
  }
}
function isUserAvailable(userName) {
  var validateStr = /^[\w|\-|－|＿|[０-９]|[\u4e00-\u9fa5]|[\uFF21-\uFF3A]|[\uFF41-\uFF5A]]+$/;
  var rs = false;
  if (validateStr.test(userName)) {
    var strLenth = getStrLength(userName);
    if (strLenth < 5 || strLenth > 20) {
      rs = false;
    } else {
      rs = true;
    }
  }
  return rs;
}

/**
 * 获取字符串的长度，对双字符（包括汉字）按两位计数
 * 
 * @param value
 * @return
 */
function getStrLength(value) {
  var valueLength = 0;
  var chinese = /[\u0391-\uFFE5]/;
  for (var i = 0; i < value.length; i++) {
    var temp = value.substring(i, i + 1);
    if (temp.match(chinese)) {
      valueLength += 2;
    } else {
      valueLength += 1;
    }
  }
  return valueLength;
}

function logout() {
  window.Cookies.remove("token");
  window.location.href="/";
}

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');


function createCode(url, txt) {
  $('#qrcodeCanvas').html("");
  var qrcode = new QRCode('qrcodeCanvas', {
    text: url,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
  qrcodeImg = $("#qrcodeCanvas img")[0]
  qrcodeImg.crossOrigin = "anonymous"
  qrcodeImg.onload = function () {
    beginDraw(txt)
  }
}

function beginDraw(txt) {
  var width = 480
  var height = 650
  var c = document.getElementById("myCanvas");
  c.width = width
  c.height = height
  var ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(qrcodeImg, 20, 20, width - 50, width - 50);
  ctx.fillStyle = "#000";
  ctx.font = "30px 微软雅黑";
  ctx.fillText(txt, 20, height - 150);

  ctx.font = "20px 微软雅黑";
  ctx.fillText("壹块盘-可以赚钱的网盘", 130, height - 80);
  ctx.fillText("www.1pan.top", 130, height - 40);
  var img = new Image();
  img.src = '/img/1pan.png';
  img.crossOrigin = "anonymous"
  img.onload = function () {
    ctx.drawImage(img, 20, height - 120, 100, 100);
    setTimeout(function () {
      base64_path = c.toDataURL("image/jpeg", 1);
      $('#showImg').attr('src', base64_path)
    }, 100)
  }
}

function compress(imgdata, callback) {
  var img = new Image()
  img.onload = function () {
    var initSize = img.src.length;
    var originWidth = img.width;
    var originHeight = img.height;
    if (originHeight < 300 || originWidth < 300) {
      callback(false)
      return
    }
    var maxWidth = 300,
      maxHeight = 300;
    var targetWidth = originWidth,
      targetHeight = originHeight;
    if (originWidth > maxWidth || originHeight > maxHeight) {
      if (originWidth / originHeight > maxWidth / maxHeight) {
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
    } else {
      targetWidth = 400;
      targetHeight = 400;
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    var ndata = canvas.toDataURL("image/jpeg", 0.6);
    callback && callback(ndata);
  }
  img.src = imgdata;

}
