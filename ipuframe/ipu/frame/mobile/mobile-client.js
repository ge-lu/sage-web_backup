/* eslint-disable */
/**
 * 此JS文件匹配mobile_browser.js,用于分离出终端调用和web调用的逻辑.
 * 终端访问应用时,动态引用mobile_client.js文件;浏览器访问应用时,动态引用mobile_browser.js文件.
 */
// define(["IpuMobile", "clientTool"], function (IpuMobile, clientTool) {
import IpuMobile from './ipu-mobile';
import clientTool from './client-toolkit';

const Mobile = new function () {
  /** ****************系统功能**********************/
  /* 判断是否App */
  this.isApp = function () {
    return IpuMobile.isApp();
  };
  /* 关闭应用 */
  this.closeApp = function () {
    IpuMobile.close(false);
  };
  /** ****************数据请求**********************/
  /* 调用服务 */
  this.dataRequest = function (action, param, callback, err, headers) {
    param = param || '';
    headers = headers || '';
    IpuMobile.dataRequest(callback, action, param.toString(), null, null, null, err, headers.toString());
  };
  /* 调用指定服务端地址服务 */
  this.dataRequestWithHost = function (url, action, param, callback, err, headers) {
    param = param || '';
    headers = headers || '';
    IpuMobile.dataRequestWithHost(callback, url, action, param.toString(), null, null, null, err, headers.toString());
  };
  /** ****************页面跳转**********************/
  /* 页面跳转,url为跳转目标 */
  this.openUrl = function (url, callback, title, buttons, styles, err) {
    IpuMobile.openUrl(url, callback, title, buttons, styles, err);
  };
  this.loadUrl = function (url, err) {
    IpuMobile.loadUrl(url, err);
  };
  /* 页面跳转,param为打开页面时调用接口的参数 */
  this.openPage = function (pageAction, param, err) {
    param = param || '';
    IpuMobile.openPage(pageAction, param.toString(), err);
  };
  this.loadPage = function (pageAction, param, err) {
    param = param || '';
    IpuMobile.loadPage(pageAction, param.toString(), err);
  };
  /* 页面跳转,param为打开页面的映射数据 */
  this.openTemplate = function (pageAction, param, err) {
    param = param || '';
    IpuMobile.openTemplate(pageAction, param.toString(), err);
  };
  this.loadTemplate = function (pageAction, param, err) {
    param = param || '';
    IpuMobile.loadTemplate(pageAction, param.toString(), err);
  };
  /* 将模板转换成html源码 */
  this.getTemplate = function (action, param, callback, err) {
    param = param || '';
    if (typeof (param) !== 'string') {
      param = param.toString();
    }
    IpuMobile.getTemplate(callback, action, param, err);
  };
  /* 将Page转换成html源码 */
  this.getPage = function (action, param, callback, err) {
    param = param || '';
    if (typeof (param) !== 'string') {
      param = param.toString();
    }
    IpuMobile.getPage(callback, action, param, err);
  };
  /* 回退到前一个界面 */
  this.back = function (tag, err) {
    IpuMobile.back(tag, err);
  };
  /* 设置back监听事件 */
  this.onBack = function (callback) {
    this.setBackCallListener(function (e) {
      const data = e.data;
      callback(data);
    });
  };
  /** back回调事件监听开始**/
  /* 设置back监听回调 */
  this.setBackCallListener = function (callback) {
    document.addEventListener('backCall', function (e) {
      callback(e.data);
    });
  };
  /** back回调事件监听结束**/
  /* 触发事件的回退，同onBack联合使用 */
  this.backWithCallback = function (data, tag, err) {
    IpuMobile.backWithCallback(data, tag, err);
  };
  /** ****************基础UI**********************/
  /* 打开loading对话框 */
  this.loadingStart = function (message, title) {
    IpuMobile.loadingStart(message, title);
  };
  /* 关闭加载中对话框 */
  this.loadingStop = function () {
    IpuMobile.loadingStop();
  };
  /* 弹出确认对话框 */
  this.confirm = function () {
    alert('confirm待开发……');
  };
  /* 弹出提示气泡 */
  this.tip = function (msg, type) {
    if (type == undefined) {
      type = 1;
    }
    IpuMobile.tip(msg, type);
  };
  /* 弹出提示框 */
  this.alert = function (msg, title, callback) {
    IpuMobile.alert(msg, title, callback);
  };
  /** ****************内存缓存**********************/
  this.setMemoryCache = function (key, value) {
    if (clientTool.tool.isDataMap(key)) {
      IpuMobile.setMemoryCache(key.map);
    } else {
      IpuMobile.setMemoryCache(key, value);
    }
  };
  this.getMemoryCache = function (callback, key, defValue) {
    IpuMobile.getMemoryCache(callback, key, defValue);
  };
  this.removeMemoryCache = function (key) {
    IpuMobile.removeMemoryCache(key);
  };
  this.clearMemoryCache = function () {
    IpuMobile.clearMemoryCache();
  };
  /** ****************离线缓存**********************/
  this.setOfflineCache = function (key, value, isEncrypt) {
    if (clientTool.tool.isDataMap(key)) {
      IpuMobile.setOfflineCache(key.map, value, isEncrypt);
    } else {
      IpuMobile.setOfflineCache(key, value, isEncrypt);
    }
  };
  this.getOfflineCache = function (callback, key, value, isEncrypt) {
    IpuMobile.getOfflineCache(callback, key, value, isEncrypt);
  };
  this.removeOfflineCache = function (key) {
    IpuMobile.removeOfflineCache(key);
  };
  this.clearOfflineCache = function () {
    IpuMobile.clearOfflineCache();
  };
  /** ****************扩展UI**********************/
  this.openDialog = function (pageAction, param, callback, width, height) {
    param = param || '';
    width = width || 0.5;// 默认0.5
    height = height || 0.5;
    IpuMobile.openDialog(callback, pageAction, param.toString(), width, height);
  };
  this.closeDialog = function (result) {
    IpuMobile.closeDialog(result);
  };
  this.openWindow = function (pageAction, param, callback) {
    param = param || '';
    IpuMobile.openWindow(callback, pageAction, param.toString());
  };
  this.closeWindow = function (result) {
    if (typeof (result) === 'undefined' || result == null) {
      IpuMobile.closeWindow();
      return;
    }
    if (typeof (result) !== 'string') {
      result = result.toString();
    }
    IpuMobile.closeWindow(result);
  };
  /* 打开侧滑菜单 */
  this.openSlidingMenu = function (action, param, callback, type) { // type:left|right
    type = type || 'left';
    param = param || '';
    if (type == 'left') {
      IpuMobile.openSlidingMenu(callback, action, param, 0.5, 1, 0, 0);
    } else {
      IpuMobile.openSlidingMenu(callback, action, param, 0.5, 1, 1, 0);
    }
  };
  /* 关闭侧滑菜单 */
  this.closeSlidingMenu = function (result) {
    IpuMobile.closeSlidingMenu(result);
  };
  /** ****************本地数据库操作**********************/
  this.execSQL = function (dbName, sql, bindArgs, limit, offset, callback, err) {
    IpuMobile.execSQL(dbName, sql, bindArgs, limit, offset, callback, err);
  };
  this.insert = function (dbName, table, datas, callback, err) {
    IpuMobile.insert(dbName, table, datas, callback, err);
  };
  this.delete = function (dbName, table, condSQL, conds, callback, err) {
    IpuMobile.delete(dbName, table, condSQL, conds, callback, err);
  };
  this.update = function (dbName, table, datas, condSQL, conds, callback, err) {
    IpuMobile.update(dbName, table, datas, condSQL, conds, callback, err);
  };
  this.select = function (dbName, table, columns, condSQL, conds, limit, offset, callback, err) {
    IpuMobile.select(dbName, table, columns, condSQL, conds, limit, offset, callback, err);
  };
  // 查询第一行数据,效率高
  this.selectFirst = function (dbName, table, columns, condSQL, conds, callback, err) {
    IpuMobile.selectFirst(dbName, table, columns, condSQL, conds, callback, err);
  };
  // 设置手势锁
  this.setScreenLock = function (dataParam, callback, err) {
    IpuMobile.setScreenLock(dataParam.toString(), callback, err);
  };
  // 获取手势锁状态
  this.getScreenLockState = function (callback) {
    IpuMobile.getScreenLockState(callback);
  };
  // 解锁
  this.screenUnlock = function (forgetPageAction, callback, err) {
    IpuMobile.screenUnlock(forgetPageAction, callback, err);
  };
  // 打开小键盘
  this.openKeyboard = function (value, err) {
    IpuMobile.openKeyboard(value, err);
  };
  this.openNative = function (data, err) {
    IpuMobile.openNative(data.toString(), err);
  };
  // 初始化NFC
  this.initNfc = function (data, err) {
    IpuMobile.initNfc(data.toString(), err);
  };
  this.httpPost = function (url, encode, contentType, data, headers, callback, err) {
    IpuMobile.httpPost(callback, url, encode, contentType, data, headers, err);
  };
  this.httpGet = function (url, encode, callback) {
    IpuMobile.httpGet(callback, url, encode);
  };
}();

export default Mobile;
// return Mobile;
// });
