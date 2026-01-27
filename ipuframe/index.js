/**
 * IPU框架暴露的模块
 */
import Mobile from './ipu/frame/mobile/mobile'
import IpuMobile from './ipu/frame/mobile/ipu-mobile'
import jcl from './ipu/frame/base/jcl'
import constant from './constant'
import browserTool from './ipu/frame/mobile/browser-toolkit'
// import util from '@/util'

import { wrapBaiduLocation } from './extends'
const REQUEST_TIME_OUT=(30 + 4) * 1000;

// 设置超时
browserTool.ajax.ajaxSettings.timeout = REQUEST_TIME_OUT

// 项目插件，请定义到biz/js/common/biz-mobile.js
IpuMobile.constant = constant

if (IpuMobile.isApp()) {
  IpuMobile.debug = true // 在App模式下打印插件调用日志信息
}

// 优化百度定位调用频率
wrapBaiduLocation(IpuMobile)

export {
  constant,
  Mobile, // 框架对象，适配浏览器与app环境
  IpuMobile, // 插件对象
  jcl // Zepto扩展，增加了jcl.DataMap和jcl.DataSet数据格式，部分插件参数为jcl.DataMap或jcl.DatasetList
}
