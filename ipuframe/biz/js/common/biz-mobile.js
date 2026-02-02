/* eslint-disable */
/**
 * 提供业务的AppMobile插件
 */
// define(["require"], function (require) {

const BizMobile = function (execute, storageCallback) {
    return {
        openIpuApp: function (param, callback, err) { // 打开ipu应用
            param = param || '';
            storageCallback('openIpuApp', callback);
            execute('openIpuApp', [param.toString()], err);
        },
        openNativeApp: function (param, err) { // 打开原生应用
            param = param || '';
            execute('openNativeApp', [param.toString()], err);
        },
        openRemoteURL: function (url, err) {
            execute('openRemoteURL', [url], err);
        },
        initAppConfig: function (param, err) { // 初始化应用
            param = param || '';
            execute('initAppConfig', [param.toString()], err);
        },
        getCacheSize: function (callback, err) { // 获取缓存
            storageCallback('getCacheSize', callback);
            execute('getCacheSize', [], err);
        },
        clearCache: function (callback, err) { // 清理缓存
            storageCallback('clearCache', callback);
            execute('clearCache', [], err);
        },
        getAppVersion: function (callback, err) { // 应用版本
            storageCallback('getAppVersion', callback);
            execute('getAppVersion', [], err);
        },
        changeTextSize: function (size, callback, err) { // 应用版本
            execute('changeTextSize', [size], err);
        },
        reLogin: function (actionPage, err) { // 处理超时重新登录
            execute('reLogin', [actionPage], err);
        },
        openRN: function (callback, appID, bundleKey, pageAction, initialProperties, err) {
            storageCallback('openRN', callback);
            execute('openRN', [appID, bundleKey, pageAction, initialProperties], err);
        },
        setKeyDownFlag: function (keyName, flag, err) {
            execute('setKeyDownFlag', [keyName, flag]);
        },
        /**
         * 打开高德导航
         *
         * @param paras
         * @param {string} paras.dlat 目的地纬度
         * @param {string} paras.dlon 目的地经度
         * @param {string} paras.dev 是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密)，高德的坐标系统传0
         * @param {string} paras.t  t=0(驾车) = 1(公交) = 2 (步行) = 3(骑行) = 4(火车) = 5(长途客车)(骑行仅在V7.88以上版本支持)
         * @param {function} callback 回调函数
         * @param {function} err 失败回调
         *
         */
        openGaoDeNav: function (paras, callback, err) {
            storageCallback('openGaoDeNav', callback);
            execute('openGaoDeNav', [JSON.stringify(paras)], err);
        },
        /**
         * 打开百度导航
         *
         * @param paras
         * @param {string} paras.dlat 目的地纬度
         * @param {string} paras.dlon 目的地经度
         * @param {string} paras.dev 是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密)，高德的坐标系统传0
         * @param {string} paras.t  t=0(驾车) = 1(公交) = 2 (步行) = 3(骑行) = 4(火车) = 5(长途客车)(骑行仅在V7.88以上版本支持)
         * @param {function} callback 回调函数
         * @param {function} err 失败回调
         *
         */
        openBaiDuNav: function (paras, callback, err) {
            storageCallback('openBaiDuNav', callback);
            execute('openBaiDuNav', [JSON.stringify(paras)], err);
        },
        /**
         * 打开QQ导航
         *
         * @param paras
         * @param {string} paras.dlat 目的地纬度
         * @param {string} paras.dlon 目的地经度
         * @param {string} paras.dev 是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密)，高德的坐标系统传0
         * @param {string} paras.t  t=0(驾车) = 1(公交) = 2 (步行) = 3(骑行) = 4(火车) = 5(长途客车)(骑行仅在V7.88以上版本支持)
         * @param {function} callback 回调函数
         * @param {function} err 失败回调
         *
         */
        openQQNav: function (paras, callback, err) {
            storageCallback('openQQNav', callback);
            execute('openQQNav', [JSON.stringify(paras)], err);
        },
        /**
         * 获取手机设备上已安装地图软件信息
         *
         * @param callback
         * @param err
         */
        mapAppList: function (callback, err) {
            storageCallback('mapAppList', callback);
            execute('mapAppList', [], err);
        },
        /**
         * 停止扫描蓝牙
         *
         * @param callback
         * @param err
         */
        stopScan: function (callback, err) {
            storageCallback('stopScan', callback);
            execute('stopScan', [], err);
        },
        /**
         * 扫描蓝牙
         *
         * @param callback
         * @param err
         */
        scan: function (callback, list, second, err) {
            storageCallback('scan', callback);
            execute('scan', [list, second], err);
        },
        /**
         * 蓝牙列表
         *
         * @param callback
         * @param err
         */
        list: function (callback, err) {
            storageCallback('list', callback);
            execute('list', [], err);
        },
        /*
         * 蓝牙是否连接
         */
        isConnected: function (callback, id, err) {
            storageCallback('isConnected', callback);
            execute('isConnected', [id], err);
        },
        /*
         * 蓝牙断开连接
         */
        disConnect: function (callback, err) {
            storageCallback('disConnect', callback);
            execute('disConnect', [], err);
        },
        /**
         * 设置厂家编码
         *
         * @param callback
         * @param err
         */
        setType: function (callback, type, err) {
            storageCallback('setType', callback);
            execute('setType', [type], err);
        },
        /**
         * 连接蓝牙
         *
         * @param callback
         * @param err
         */
        bleConnect: function (callback, id, secretKey, secretLock, userId, isKeyDevice, err) {
            storageCallback('bleConnect', callback);
            execute('bleConnect', [id, secretKey, secretLock, userId, isKeyDevice], err);
        },
        /**
         * 读取蓝牙信息
         *
         * @param callback
         * @param err
         */
        getBleInfo: function (callback, err) {
            storageCallback('getBleInfo', callback);
            execute('getBleInfo', [], err);
        },
        /**
         * 设置设备时间
         *
         * @param callback
         * @param err
         */
        setBleClock: function (callback, date, err) {
            storageCallback('setBleClock', callback);
            execute('setBleClock', [date], err);
        },
        /**
         * 读取锁具ID
         *
         * @param callback
         * @param err
         */
        getLockCode: function (callback, err) {
            storageCallback('getLockCode', callback);
            execute('getLockCode', [], err);
        },
        /**
         * 开锁
         *
         * @param callback
         * @param err
         */
        openLock: function (callback, lockCode, startTime, endTime, err) {
            storageCallback('openLock', callback);
            execute('openLock', [lockCode, startTime, endTime], err);
        },
        /**
         * 读取开门日志
         *
         * @param callback
         * @param err
         */
        readLog: function (callback, err) {
            storageCallback('readLog', callback);
            execute('readLog', [], err);
        },
        /**
         * 删除日志
         *
         * @param callback
         * @param err
         */
        removeLog: function (callback, err) {
            storageCallback('removeLog', callback);
            execute('removeLog', [], err);
        },
        /**
         * 给锁体进行编码
         *
         * @param callback
         * @param codeValue
         * @param err
         */
        initLockCode: function (codeValue, callback, err) {
            storageCallback('initLockCode', callback);
            execute('initLockCode', [codeValue], err);
        },
        /**
         * 获取锁具状态(暂未使用)
         *
         * @param callback
         * @param err
         */
        getLockState: function (callback, err) {
            storageCallback('getLockState', callback);
            execute('getLockState', [codeValue], err);
        },
        /**
         * 读取钥匙编码 在绑定钥匙和人的关系时会用到(暂未使用)
         *
         * @param callback
         * @param err
         */
        getKeyCode: function (callback, err) {
            storageCallback('getKeyCode', callback);
            execute('getKeyCode', [codeValue], err);
        },
        /**
         * 初始化电子钥匙(暂未使用)
         *
         * @param callback
         * @param err
         */
        initKey: function (callback, err) {
            storageCallback('initKey', callback);
            execute('initKey', [codeValue], err);
        },
        /**
         * 选择文件
         *
         * @param callback
         * @param err
         */
        chooseFile: function (callback, err) {
            storageCallback('chooseFile', callback);
            execute('chooseFile', [], err);
        },
        /**
         * 设置工具栏文字颜色
         *
         * @param {boolean} flag true为黑色，false为白色
         */
        setStatusBarIconDarkColor: function (flag) {
            execute('setStatusBarIconDarkColor', [flag]);
        },
        /**
         * 查看iOS 蓝牙sdk调用日志
         *
         */
        openLogView: function () {
            execute('openLogView', []);
        },
        /**
         *  清除iOS 蓝牙sdk调用日志
         *
         */
        deleteLog: function () {
            execute('deleteLog', []);
        },
        /**
         *  登录sip连接
         *
         * @param config
         * @param {string} config.server sip server ip
         * @param {string} config.port sip server端口
         * @param {string} config.protocol 连接协议 UDP或TCP
         * @param {string} config.account sip登录账号
         * @param {string} config.pass sip登录账号密码
         * @param callback 成功回调函数
         * @param error 失败回调函数
         */
        connectSip: function (config, callback, error) {
            storageCallback('connectSip', callback);
            const {server, port, protocol, account, pass} = config
            execute('connectSip', [server, port, protocol, account, pass], error);
        },
        /**
         *  退出sip连接
         *
         */
        disconnectSip: function (callback, error) {
            storageCallback('disconnectSip', callback);
            execute('disconnectSip', [], error);
        },
        /**
         *  拨打sip软电话
         *
         * @param param
         * @param {string} param.phoneNum 拨打的号码
         * @param callback 成功回调函数
         * @param error 失败回调函数
         */
        sipCallOut: function (param, callback, error) {
            storageCallback('callSipPhone', callback);
            const {phoneNum} = param
            execute('callSipPhone', [phoneNum], error);
        },

        /**
         * 获取当前网络状态
         *
         * @param callback 回调函数
         */
        getNetworkType: function (callback, error) {
            storageCallback('getNetworkType', callback);
            execute('getNetworkType', [], error);
        },
        /**
         * 初识轨迹服务：参数：
        * @serviceId 轨迹服务ID long
        * @entity 设备标识 String
        * @isNeedObjectStorage boolean 默认false
        * @gatherInterval 定位周期(单位:秒) 默认 5s
        * @packInterval  回传周期(单位:秒) 默认10s

        回调callback，结果为{"init":"true"}表示初始化成功。
         * @param {*} param 
         * @param {*} callback 
         * @param {*} error 
         */
        initBaiduTrace: function (param, callback, error) {
            storageCallback('initBaiduTrace', callback);
            console.log('initBaiduTrace', param)
            const { serviceId, entity, isNeedObjectStorage, gatherInterval, packInterval } = param
            execute('initBaiduTrace', [serviceId, entity, isNeedObjectStorage, gatherInterval, packInterval], error);
        },
        /**
         *  开启服务
         * @param {*} callback 
         * @param {*} error 
         */
        startService: function (callback, error) {
            storageCallback('startService', callback);
            execute('startService', [], error);
        },
        /**
         * 关闭服务
         * @param {*} callback 
         * @param {*} error 
         */
        stopService: function (callback, error) {
            storageCallback('stopService', callback);
            execute('stopService', [], error);
        },
        /**
         * 开启收集回传轨迹
         * @param {*} callback 
         * @param {*} error 
         */
        startGather: function (callback, error) {
            storageCallback('startGather', callback);
            execute('startGather', [], error);
        },
        /**
         * 关闭收集回传轨迹
         * @param {*} callback 
         * @param {*} error 
         */
        stopGather: function (callback, error) {
            storageCallback('stopGather', callback);
            execute('stopGather', [], error);
        },

        /**
         * 开始语音识别
         * @param {*} callback 
         * @param {*} error 
         */
        startAsr: function (callback, error) {
            storageCallback('startAsr', callback);
            execute('startAsr', [], error);
        },
        /**
         * 停止语音识别
         * @param {*} callback 
         * @param {*} error 
         */
        stopAsr: function (callback, error) {
            storageCallback('stopAsr', callback);
            execute('stopAsr', [], error);
        },
        /**
         * 开始语音播报
         * @param {*} callback 
         * @param {*} error 
         */
        startTts: function (text, callback, error) {
            storageCallback('startTts', callback);
            execute('startTts', [text], error);
        },
        /**
         * 停止语音播报
         * @param {*} callback 
         * @param {*} error 
         */
        stopTts: function (callback, error) {
            storageCallback('stopTts', callback);
            execute('stopTts', [], error);
        },
        /**
         * 添加提醒
         * @param {*} callback 
         * @param {*} remindTitle 提醒标题
         * @param {*} remindContent 提醒内容
         * @param {*} time 提醒时间 提醒的时间 (HH:mm)
         * @param {*} repeat 重复频率：0:不重复；1:每天重复；2:每周重复；3:每月重复
         * @param {*} ringtone 响铃方式：0:铃声；1:振动；2:静音
         */
        addRemind: function (callback, remindTitle, remindContent, time, repeat, ringtone) {
          storageCallback("addRemind", callback);
          execute("addRemind", [remindTitle, remindContent, time, repeat, ringtone]);
        },
        /**
         * 更新提醒
         * @param {*} callback 
         * @param {*} remindId 提醒任务id
         * @param {*} remindTitle 提醒标题
         * @param {*} remindContent 提醒内容
         * @param {*} time 提醒时间 提醒的时间 (HH:mm)
         * @param {*} repeat 重复频率：0:不重复；1:每天重复；2:每周重复；3:每月重复
         * @param {*} ringtone 响铃方式：0:铃声；1:振动；2:静音
         */
        updateRemind: function (callback, remindId, remindTitle, remindContent, time, repeat, ringtone) {
          storageCallback("updateRemind", callback);
          execute("updateRemind", [remindId, remindTitle, remindContent, time, repeat, ringtone]);
        },
        /**
         * 删除提醒
         * @param {*} callback 
         * @param {*} remindId 提醒任务id
         */
        deleteRemind: function (callback, remindId) {
          storageCallback("deleteRemind", callback);
          execute("deleteRemind", [remindId]);
        },
        /**
         * 查询所有提醒
         * @param {*} callback 
         */
        queryAllReminds: function (callback) {
          storageCallback("queryAllReminds", callback);
          execute("queryAllReminds", []);
        },
        /**
         * 取消所有提醒
         * @param {*} callback 
         * @param {*} error 
         */
        cancelAllReminds: function (callback, error) {
          storageCallback("cancelAllReminds", callback);
          execute("cancelAllReminds", [], error);
        }
    };
};

// let IpuMobile;
//
// function getIpuMobile() {
//   if (!IpuMobile) {
//     // webpack打包写法
//     IpuMobile = require("../../../ipu/frame/mobile/ipu-mobile").default;
//
//     // vue3 vite打包写法
//     // IpuMobile = import.meta.globEager('../../../ipu/frame/mobile/ipu-mobile.js')['../../../ipu/frame/mobile/ipu-mobile.js'].default;
//   }
//   return IpuMobile;
// }
//
// function execute(action, args, error, success) {
//   /* 循环依赖,懒加载 */
//
//   return getIpuMobile().execute(action, args, error, success);
// }
//
// function storageCallback(action, callback, isEscape, isBase64) {
//   getIpuMobile().callback.storageCallback(action, callback, isEscape, isBase64);
// }

export default BizMobile;
// return BizMobile;
// });
