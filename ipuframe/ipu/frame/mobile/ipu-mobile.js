/* eslint-disable */
/**
 * 与客户端交互的基础API
 */
// define(["jcl", "mobileExpand", "bizMobileExpand"], function (jcl, mobileExpand, bizMobileExpand) {
// import jcl from '../base/jcl';
import mobileExpand from './expand-mobile';
import bizMobileExpand from '../../../biz/js/common/biz-mobile';

// 终端类型,a为android,i为ios
const deviceType = (function () {
  /*
    IpuMobile/i1/android/00/2.0/Hybrid
    userAgent格式
    i1版本规范:
    标识符/规范版本号/终端类型(ios,android,wp)/终端型号(平板，或尺寸,00表示默认)/框架版本号/结尾标识符
  */
  const sUserAgent = window.navigator.userAgent;
  //          标识符     规范1  类型2 型号3  框架4 结尾标识符
  const re = /IpuMobile\/(.*)\/(.*)\/(.*)\/(.*)\/Hybrid/ig;
  const arrMessages = re.exec(sUserAgent);
  if (arrMessages && arrMessages[1] == 'i1') {
    if (arrMessages[2] == 'android') {
      return 'a';
    } else if (arrMessages[2] == 'ios') {
      return 'i';
    } else {
      return null;
    }
  } else {
    return null;
  }
})();

if (!window.TerminalType) {
  window.TerminalType = deviceType;
}
const terminalType = window.TerminalType;

var IpuMobile = (function () {
  return {
    isAndroid: function () {
      return terminalType == 'a';
    },
    isIOS: function () {
      return terminalType == 'i';
    },
    isApp: function () { // 判断是否是APP应用
      return !!terminalType;
    },
    getSysInfo: function (callback, key, err) { // TELNUMBER|IMEI|IMSI|SDKVERSION|OSVERSION|PLATFORM|SIMNUMBER
      IpuMobile.callback.storageCallback('getSysInfo', callback);
      execute('getSysInfo', [key], err);
    },
    close: function (confirm, err) {
      if (typeof (confirm) !== 'boolean') {
        confirm = true;
      }
      execute('close', [confirm], err);
    },
    httpRequest: function (callback, requestUrl, encode, conTimeout, readTimeout, err) {
      if (terminalType == 'i') {
        requestUrl = encodeURIComponent(requestUrl);
      }
      IpuMobile.callback.storageCallback('httpRequest', callback);
      execute('httpRequest', [requestUrl, encode, conTimeout, readTimeout], err);
    },
    httpPost: function (callback, requestUrl, encode, contentType, data, headers, err) {
      // if (terminalType == 'i') {
      //   requestUrl = encodeURIComponent(requestUrl);
      // }
      IpuMobile.callback.storageCallback('httpPost', callback);
      execute('httpPost', [requestUrl, encode, contentType, data, headers], err);
    },
    dataRequest: function (callback, dataAction, param, encode, conTimeout, readTimeout, err, headers) {
      IpuMobile.callback.storageCallback('dataRequest', callback);
      execute('dataRequest', [
        dataAction, param, encode, conTimeout, readTimeout, headers
      ], err);
    },
    dataRequestWithHost: function (callback, url, dataAction, param, encode, conTimeout, readTimeout, err, headers) {
      IpuMobile.callback.storageCallback('dataRequestWithHost', callback);
      execute('dataRequestWithHost', [
        url, dataAction, param, encode, conTimeout, readTimeout, headers
      ], err);
    },
    /**
     *
     * @param {string} url  打开网页地址，不能为空
     * @param {function} callback openUrl打开的页面，调用closeUrl时触发回调？
     * @param {string} title 工具栏标题，可不传
     * @param buttons=[false, false, false] 更多操作是否显示分享、搜索、复制链接操作
     * @param styles=[],  颜色设置
     * @param hideTopBar=false  是否隐藏导航栏
     * @param hideBarBtn=[false，false， false， false】  是否隐藏返回、关闭、刷新、更多按钮
     * @param hideFloatBtn=false  是否显示悬浮按钮，可为空，默认不显示false
     * @param err
     */
    openUrl: function (url, callback, title, buttons, styles, hideTopBar, hideBarBtn, hideFloatBtn, err) {
      IpuMobile.callback.storageCallback('openUrl', callback);
      execute('openUrl', [
        encodeURIComponent(url), title, buttons, styles, hideTopBar, hideBarBtn, hideFloatBtn
      ], err);
    },
    openPage: function (action, data, err) {
      execute('openPage', [action, data], err);
    },
    openTemplate: function (action, context, err) {
      execute('openTemplate', [action, context], err);
    },
    loadPage: function (action, data, err) {
      execute('loadPage', [action, data], err);
    },
    loadTemplate: function (action, context, err) {
      execute('loadTemplate', [action, context], err);
    },
    back: function (tag, err) {
      execute('back', [tag], err);
    },
    backWithCallback: function (data, tag, err) {
      execute('backWithCallback', [data, tag], err);
    },
    getPage: function (callback, action, param, err) {
      IpuMobile.callback.storageCallback('getPage', callback);
      execute('getPage', [action, param], err);
    },
    getTemplate: function (callback, action, context, err) {
      IpuMobile.callback.storageCallback('getTemplate', callback);
      execute('getTemplate', [action, context], err);
    },
    storageDataByThread: function (dataAction, param, waitoutTime, err) {
      execute('storageDataByThread', [dataAction, param, waitoutTime], err);
    },
    openDialog: function (callback, pageAction, param, width, height, err) {
      IpuMobile.callback.storageCallback('openDialog', callback);
      execute('openDialog', [pageAction, param, width, height], err);
    },
    closeDialog: function (result, state, err) {
      execute('closeDialog', [result, state], err);
    },
    openWindow: function (callback, pageAction, param, err) {
      IpuMobile.callback.storageCallback('openWindow', callback);
      execute('openWindow', [pageAction, param], err);
    },
    closeWindow: function (result, state, err) {
      execute('closeWindow', [result, state], err);
    },
    openSlidingMenu: function (callback, action, param, width, height, leftMargin, topMargin, err) {
      IpuMobile.callback.storageCallback('openSlidingMenu', callback);
      execute('openSlidingMenu', [
        action, param, width, height, leftMargin, topMargin
      ], err);
    },
    closeSlidingMenu: function (result, state, err) {
      execute('closeSlidingMenu', [result, state], err);
    }
  };
})();

window.IpuMobile = window.WadeMobile = IpuMobile; // 暴露全避对象给客户端回调

// 生成一个10位随机数，不一定有10位，后3位是0
function getRandomId() {
  // 取随机数 * 当前时间戳结果的中间7位整数 + 三位自增长
  var randId = (Math.round(Math.random() * Date.now() * 1000)) % Math.pow(10, 7) * 1000;
  var minNum = Math.pow(10, 10)

  // 结果数不足10位，补0
  while (randId < minNum) {
    randId = randId * 10
  }
  return randId
}

// 全局变量
let callbackId = getRandomId();
const callbacks = {};// 用来存放成功和失败的js回调函数
const callbackDefine = {};// 用来存放自定义的js回调函数
let globalErrorKey = null;// 全局错误关键字,定位错误

// 默认错误回调函数
function defaultErrorBack(message) {
  alert(message)
}

// 获取时间字符串
function geNowDateTimeStr() {
  let date = new Date() ;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var millisecond = date.getMilliseconds();
  return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + "." + millisecond+' ';
}

// 添加一个获取时间字符串方法
IpuMobile.geNowDateTimeStr = geNowDateTimeStr

/* 绝大多数情况下,success回调函数是用不上的,有需要回调函数的时候异步方式传入取值 */
let isAlert = false;// 防止反复弹出alert
var execute = function (action, args, error, success) {
  args = stringify(args);

  if (IpuMobile.debug) {
    console.log(geNowDateTimeStr() + 'action:' + (action + callbackId) + ' param:' + args);
  }

  if (terminalType == 'a') {
    androidExecute(action, args, error, success);
  } else if (terminalType == 'i') {
    iosExecute(action, args, error, success);
  } else {
    if (mockExecute(action, args, error, success)) { // 若有插件模拟，执行插件模拟
      return;
    }

    if (isAlert) {
      isAlert = false;
      alert(action + '无终端类型');
    } else {
      console.log(action + '无终端类型');
    }
  }
};

var androidExecute = function (action, args, error, success) {
  // 执行android方法时，带入到android底层的key值为，回调方法实际的key值 + 用于在top上索引本iframe的IpuMobile的唯一标识。
  // 在android底层，如果发现回调函数的key值包含这个特殊的串。那么将解析这个key。并且取出加回调函数key的后半部分，作为在top上索引本iframe相对应的IpuMobile对象的唯一依据。
  let tmpKey = action + callbackId++;
  if (window._WadeMobileSet_Key_ != undefined) {
    tmpKey += window._WadeMobileSet_Key_;
  }
  const callbackKey = globalErrorKey = tmpKey;
  error = error || defaultErrorBack
  if (success || error) {
    callbacks[callbackKey] = { success: success, error: error };
  }

  PluginManager.exec(action, callbackKey, args);
  globalErrorKey = null;
};

var iosExecute = function (action, args, error, success) {
  const callbackKey = globalErrorKey = action + callbackId++;
  error = error || defaultErrorBack
  if (success || error) {
    callbacks[callbackKey] = { success: success, error: error };
  }

  const WADE_SCHEME = 'wade://';
  const url = WADE_SCHEME + action + '?param=' + encodeURIComponent(args) + '&callback=' + callbackKey;
  // 一个动作请求客户端的最大数量，超过会造成请求覆盖
  const limitAction = 30;
  const ifrmName = 'jcl_FRAME_' + (callbackId % limitAction);
  let ifrm = document.getElementById(ifrmName);
  if (!ifrm) {
    ifrm = document.createElement('iframe');
    ifrm.setAttribute('id', ifrmName);
    ifrm.setAttribute('width', '0');
    ifrm.setAttribute('height', '0');
    ifrm.setAttribute('border', '0');
    ifrm.setAttribute('frameBorder', '0');
    ifrm.setAttribute('name', ifrmName);
    ifrm.setAttribute('style', 'display: none;'); // wkWebview不设置会影响页面滚动距离和高度
    document.body.appendChild(ifrm);
  }
  document.getElementById(ifrmName).contentWindow.location = encodeURIComponent(url);
  // document.getElementById(ifrmName).src = encodeURI(url);//无法处理&符号
  globalErrorKey = null;
};

var mockExecute = function (action, args, error, success) {
  const mockPlugin = mockPlugins[action];
  if (mockPlugin) { // 若存在mock      // 固定两个参数
    let tmpKey = action + callbackId;
    callbackId++;

    const backFun = function (method, data, assetArg, time) {
      setTimeout(function () {
        IpuMobile.callback[method](tmpKey, data, assetArg);
      }, time || 100);
    };

    const backs = {
      callback: function (message, isSave, time) {
        // 若message是对象，则转换为字符串
        if (typeof message === 'object') {
          message = JSON.stringify(message)
        }
        backFun('execCallback', message, isSave, time)
      },
      error: function (message, isEncode, time) {
        backFun('error', message, isEncode, time)
      }
    }

    const callbackKey = globalErrorKey = tmpKey;
    error = error || defaultErrorBack
    if (success || error) {
      callbacks[callbackKey] = { success: success, error: error };
    }

    if (!args) {
      args = [];
    } else {
      args = JSON.parse(args);
    }
    args.unshift(backs); // 把back方法放最前面
    mockPlugin.apply(window, args);
    globalErrorKey = null;
    return true;
  }
};

var mockPlugins = {}; // 用来存储模拟插件实现

/**
 * 注册插件模拟方法，插件模拟方法只在非app环境生效
 *
 * @param {string} pluginName 插件名称
 * @param {function} pluginFun 插件模拟方法
 * @param {Object} pluginFun.backs 插件回调方法集
 * @param {function} pluginFun.backs.callback 插件正常回调执行方法backs.callback(result, isSave=false,
 * time=100) result插件回调数据，isSave回调方法是否保存，time为回调延迟执行时长，单位为ms
 * @param {function} pluginFun.backs.error 插件失败回调执行方法backs.callback(result, isEncode=false,
 * time=100) result插件回调数据，isEncode回调数据是否需要编码，time为回调延迟执行时长，单位为ms
 */
IpuMobile.mockPlugin = function (pluginName, pluginFun) {
  mockPlugins[pluginName] = pluginFun;
};

/**
 * 一次注册多个插件模拟
 *
 * @param pluginObj 插件模拟json对象，key为插件名称，value对应插件模拟实现
 */
IpuMobile.mockPlugins = function (pluginObj) {
  for (const name in pluginObj) {
    IpuMobile.mockPlugin(name, pluginObj[name]);
  }
};

// 用来主动触发插件事件
IpuMobile.triggerMockEvent = function (eventName, data) {
  if (IpuMobile.debug) {
    console.log(geNowDateTimeStr() + 'triggerMockEvent', eventName, data);
  }
  IpuMobile.triggerEvent(eventName, data);
};

// 添加支持promise方式调用，未添加参数说明
/**
 * 插件通用调用方法，可通过此方法调用所有插件，移除了部分参数
 * IpuMobile.invokePlugin('getNetInfo', ['IP']).then(function(result){console.log(result )});
 *
 * @param {string} pluginName 插件名称
 * @param {any[]} [args] 插件调用参数，数组格式，基本类型如：String、Number、Boolean，对象参数如Json或Array，需转换为对应Json字符串, url类型字符串需使用encodeURIComponent进行包装，否则iOS取参会出现问题
 * @param {function} [callback] 插件回调方法，部分插件无回调，如打开新的页面openPage
 * @param {Object} callback.data 插件回调参数，参数类型和格式由插件功能实现决定
 * @param {function} [errorback] 插件失败回调方法
 * @param {string} callback.msg 插件失败回调参数，参数类型和格式由插件功能实现决定
 * @memberof module:ipuMobile
 *
 * @example
 * IpuMobile.invokePlugin("call", ["10086", true]); //call插件名称，["10086", ture]是插件参数
 * IpuMobile.invokePlugin("getSysInfo", ["IP"], function(result){console.log(result)});
 * IpuMobile.invokePlugin("getNetInfo", ["IP"]).then((ip)=>{console.log(ip)},
 * (msg)=>{console.log('error', msg)});       // promise方式调用
 */

IpuMobile.invokePlugin = function (pluginName, args, callback, errorback) {
  if (typeof args === 'function') { // 没有插件参数的调用情况
    callback = args;
    errorback = callback;
    args = []
  }

  return new Promise((res, rej) => {
    // 有回调方法走回调方法流程，没有走promise的res流程
    IpuMobile.callback.storageCallback(pluginName, (result) => {
      if (callback) {
        callback(result);
      } else {
        res(result);
      }
    });

    // 有错误回调走错误回调，否则走promise的rej流程
    execute(pluginName, args, (msg) => {
      if (errorback) {
        errorback(msg)
      } else {
        rej(msg)
      }
    });
  });
};

/**
 * 注册新的插件定义
 *
 *
 * @param {function} fun
 * @param {function} fun.execute  与App原生能力通信方法
 * @param {function} fun.storageCallback 存储插件回调方法（注册插件时，必须先存储回调方法，再调用与原生能力通信方法）
 *
 * @return {Object} result 多个插件对象定义， name是插件名称，值是插件方法定义
 */
IpuMobile.registerPlugin = function (fun) {
  let plugins = fun(execute, IpuMobile.callback.storageCallback);
  for (let name in plugins) {
    IpuMobile[name] = plugins[name]
  }
}

IpuMobile.callback = (function () {
  return {
    success: function (callbackKey, message) {
      if (typeof message === 'undefined') {
        return;
      }
      if (callbacks[callbackKey]) {
        if (callbacks[callbackKey].success) {
          if (typeof callbacks[callbackKey].success === 'function') {
            const func = callbacks[callbackKey].success;
            func(message);
          } else {
            _eval(callbacks[callbackKey].success + '(\'' + message + '\',\'' + callbackKey + '\')');
          }
        }
        if (callbacks[callbackKey]) {
          delete callbacks[callbackKey];
        }
      } else {
        dispatchPlugEvent(plugEventActions.success, { callbackKey, data: message })
      }
    },
    error: function (callbackKey, message, isEncode) {
      if (IpuMobile.debug) {
        console.log(geNowDateTimeStr() + 'error, callbackKey:' + callbackKey + '， message:' + message + '， isEncode:' + isEncode);
      }

      if (typeof message === 'undefined') {
        return;
      }
      if (isEncode) {
        message = decodeURIComponent(message);
      }
      if (callbacks[callbackKey]) {
        if (callbacks[callbackKey].error) {
          if (typeof callbacks[callbackKey].error === 'function') {
            const func = callbacks[callbackKey].error;
            func(message);
          } else {
            _eval(callbacks[callbackKey].error + '(\'' + message + '\',\'' + callbackKey + '\')');
          }
        }
        if (callbacks[callbackKey]) {
          delete callbacks[callbackKey];
        }
      } else {
        dispatchPlugEvent(plugEventActions.error, { callbackKey, data: message, isEncode: false })
      }
    },
    storageCallback: function (action, callback) {
      const callbackKey = action + callbackId;
      if (callback) {
        callbackDefine[callbackKey] = { callback: callback };
      }
    },
    execCallback: function (callbackKey, data, isSave) {
      if (IpuMobile.debug) {
        console.log(geNowDateTimeStr() + 'execCallback，callbackKey:' + callbackKey + '， data:' + data + '， isSave:' + isSave);
      }
      globalErrorKey = callbackKey;
      const callbackItem = callbackDefine[callbackKey];
      if (callbackItem) {
        data = data == 'null' ? null : data;
        if (data) {
          if (IpuMobile.isIOS()) {
            /* IOS需要decode */
            data = decodeURIComponent(data);
          }
        }
        if (callbackItem.callback) {
          if (typeof callbackItem.callback === 'function') {
            const func = callbackItem.callback;
            func(data);
          } else {
            _eval(callbackItem.callback + '(\'' + data + '\',\'' + callbackKey + '\')');
          }
        }

        if (isSave !== true && isSave !== 'true') {
          if (callbackItem) {
            delete callbackDefine[callbackKey];
          }
        }
        globalErrorKey = null;
      } else {
        dispatchPlugEvent(plugEventActions.execCallback, { callbackKey, data, isSave })
      }
    }
  };
})();

/** 物理按键监听start**/
IpuMobile.setKeyListener = function (key, callback, isOverload) {
  if (key == 'back' || key == 'menu' || key == 'home') {
    if (isOverload != null) {
      execute('setKeyDownFlag', [key, isOverload]);
    }
    return IpuMobile.listenerEvent(key, callback);
  }
};

IpuMobile.cleanKeyDownFlag = function (key) {
  if (key != null) {
    execute('cleanKeyDownFlag', [key]);
  }
};

IpuMobile.event = {
  back: function () {
    IpuMobile.triggerEvent('back');
  },
  menu: function () {
    IpuMobile.triggerEvent('menu');
  },
  home: function () {
    IpuMobile.triggerEvent('home');
  }
};
/** 物理按键监听end**/

IpuMobile.backevent = {
  backCall: function (data) {
    IpuMobile.triggerEvent('backCall', data)
  }
};

/* 通用插件事件触发函数,建议name ipu开头,如 ipuPush，不要出现字母外特殊字符 */
IpuMobile.triggerEvent = function (name, data) {
  if (IpuMobile.debug) {
    console.log(geNowDateTimeStr() +'triggerEvent，name:' + name + '， data:' + data);
  }
  const event = document.createEvent('Event');
  event.initEvent(name, true, true);
  event.data = data;
  document.dispatchEvent(event);
  dispatchPlugEvent(plugEventActions.triggerEvent, { name, data })
};

/* 通用监听插件事件函数，调用返回对象 的remove方法移除监听 */
IpuMobile.listenerEvent = function (name, callBack) {
  function handle(e) {
    callBack(e.data, e);
  }

  document.addEventListener(name, handle, false);

  return {
    handle: handle,
    remove: function () {
      IpuMobile.removeListener(name, handle);
    }
  }
};

// 移除监听
IpuMobile.removeListener = function (name, handle) {
  document.removeEventListener(name, handle, false);
};

// 设置返回事件的监听
IpuMobile.setBackCallListener = function (callback) {
  return IpuMobile.listenerEvent('backCall', callback);
};

/** back回调事件监听结束**/

/** **********公共方法**************/
/**
 * @param {String}  errorMessage   错误信息
 * @param {String}  scriptURI      错误文件
 * @param {Long}    lineNumber     错误行号
 */
window.onerror = function (errorMessage, scriptURI, lineNumber) {
  const msgArray = new Array();
  if (errorMessage) {
    msgArray.push('错误信息:' + errorMessage);
  }
  if (lineNumber) {
    msgArray.push('错误行号:' + lineNumber);
  }
  if (globalErrorKey) {
    msgArray.push('错误关键字:' + globalErrorKey);
  }
  if (scriptURI) {
    msgArray.push('错误文件:' + scriptURI);
  }
  const msg = msgArray.join('\t\n');
  console.log(msg);
  alert(msg);
};

// 动态执行js方法
function _eval(code, action) {
  if (IpuMobile.debug) {
    console.log(geNowDateTimeStr() + '_eval', code);
  }
  const func = eval(code);
  if (typeof func === 'function') {
    func();
  }
}

// 格式转换方法
function stringify(args) {
  return JSON.stringify(args);
}

// 注册框架插件
IpuMobile.registerPlugin(mobileExpand)

// 注册项目插件
IpuMobile.registerPlugin(bizMobileExpand)
// jcl.extend(IpuMobile, mobileExpand);// 属性合并,mobileExpand累加到IpuMobile中
// jcl.extend(IpuMobile, bizMobileExpand);// 属性合并,bizMobileExpand累加到IpuMobile中

// iframe新的实现方案
// 定义plug事件动作类型
let plugEventActions = {
  success: 'success', // 成功回调（插件结果未返回）
  error: 'error', // 失败回调
  execCallback: 'execCallback', // 插件结果回调
  triggerEvent: 'triggerEvent' // 消息触发回调（多次回调，或外界触发的回调，如物理键返回）
}

// 是否开放支持iframe插件调用
let isTop = window.top === window // 是否顶部窗口
let isReceive = !isTop; // 是否允许接收父窗口插件事件
let isSend = true;  //  是否允许发送子窗口插件事件
let isPlugEventListen = false;

/**
 * 是否开启功能
 *
 * @param enable
 */
IpuMobile.setPlugEventEnable = function (config) {
  isReceive = config.isReceive
  isSend = config.isSend

  // 从false修改为true时，初始经监听
  if (isReceive) {
    addPlugEventListen()
  } else {
    removePlugEventListen()
  }
}


/**
 * 对关联iframe进行通知，iframe上加个属性用来标记是否需要通知
 *
 * @param eventData.action // 参考
 * @param eventData.callBackKey
 * @param eventData.isSave
 * @param eventData.isSave
 * @param eventData.action
 *
 */
function dispatchPlugEvent(action, eventData) {
  if (!isSend) {
    return
  }

  let data = { ...eventData, action }
  // 找到所有iframe，并进行注册处理
  let frames = document.querySelectorAll('iframe.ipu-iframe') // iframe过滤要接收子消息的
  if (IpuMobile.debug) {
    console.log(geNowDateTimeStr() + 'dispatchPlugEvent', data, frames)
  }

  frames.forEach(item => {
    item.contentWindow.postMessage(data, '*')
  })
}

/**
 * iframe插件事件处理函数
 *
 * @param event
 */
function listenPlugEvent(event) {
  if (isTop || !isReceive) {
    return
  }

  if (IpuMobile.debug) {
    console.log(geNowDateTimeStr()  + 'listenPlugEvent', event)
  }

  let eventData = event.data || {}
  let action = eventData.action
  let { name, callbackKey, data, isEncode, isSave } = eventData

  if (plugEventActions.error === action) {
    IpuMobile.callback.error(callbackKey, data, isEncode)
  } else if (plugEventActions.success === action) {
    IpuMobile.callback.success(callbackKey, data)
  } else if (plugEventActions.execCallback === action) {
    IpuMobile.callback.execCallback(callbackKey, data, isSave)
  } else if (plugEventActions.triggerEvent === action) {
    IpuMobile.triggerEvent(name, data)
  }
}


// 添加监听
function addPlugEventListen() {
  if (!isPlugEventListen) {
    isPlugEventListen = true
    window.addEventListener("message", listenPlugEvent, false);
  }
}

// 移除监听
function removePlugEventListen() {
  if (isPlugEventListen) {
    isPlugEventListen = false
    window.removeEventListener("message", listenPlugEvent, false);
  }
}

// 非顶级窗口, 监听插件回调
if (window.top !== window && isReceive) {
  addPlugEventListen()
}

export default IpuMobile;

// return IpuMobile;
// });

// 让top对象上，保持有一个当前iframe里面的IpuMobile对象的引用。
// 注意：在iframe中，_WadeMobileSet_Key_+时间戳表示一个key，此key作为了在top对象上索引iframe中的IpuMobile的依据。
// 将保持引用的key值存入到当前ifame的window对象上。
// (function () {
//   // 屏蔽所有浏览器
//   if (window.navigator.userAgent.indexOf('IpuMobile\/') == -1) {
//     console.log('<IpuMobileSet> "IpuMobile\/" string does not exist in the userAgent. return.');
//     return;
//   }
//
//   // WadeMobileSet此名称客户端写死，暂不能修改
//   if (top != window) {
//     if (top.WadeMobileSet == undefined) {
//       top.WadeMobileSet = {};
//     }
//     for (var key in top.WadeMobileSet) {
//       try {
//         if (key.indexOf('_WadeMobileSet_Key_') != -1 && (!top.WadeMobileSet[key] || (top.WadeMobileSet[key].canRemoved && top.WadeMobileSet[key].canRemoved()))) {
//           console.log('(top set)delete:' + key);
//           delete top.WadeMobileSet[key];
//           console.log('(top set)delete success :' + key);
//         }
//       } catch (e) {
//         console.log('a error(IpuMobile) : ' + e);
//         console.log('(top set)delete:' + key);
//         delete top.WadeMobileSet[key];
//         console.log('(top set)delete success :' + key);
//       }
//     }
//     var key = '_WadeMobileSet_Key_' + new Date().getTime();
//     window._WadeMobileSet_Key_ = key;
//     console.log('in an iframe, window.IpuMobile object is referenced top.WadeMobileSet.' + key);
//     top.WadeMobileSet[key] = window.IpuMobile;
//     window.IpuMobile.canRemoved = function () {
//       return !window;
//     };
//   }
// })();
