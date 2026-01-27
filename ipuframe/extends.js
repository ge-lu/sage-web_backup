// 插件封装扩展

// 限制百度定位一秒最多调用一次，业务上调用频率要限制，无法支持每秒一次的调用频率
export function wrapBaiduLocation(IpuMobile) {
  // 百度定位插件用
  let isLocationAvailable = true // 当前定位是否可用
  let locationNo = 0 // 最新定位编号
  let currentLocationNo = 0 // 当前正在定位的编号
  const locationArgs = [] // 定位调用信息
  const oldLocation = IpuMobile.baiduLocation

  IpuMobile.baiduLocation = function(callback, errorback) {
    const localLocationNo = ++locationNo // 先申请一个本地编号
    console.log('wrapBaiduLocation', localLocationNo, locationNo)
    const args = { callback, errorback, localLocationNo }

    if (isLocationAvailable) {
      realBaiduLocation(args)
    } else {
      locationArgs.push(args)
    }
  }

  function realBaiduLocation({ callback, errorback, localLocationNo }) {
    isLocationAvailable = false
    currentLocationNo = localLocationNo
    let isSettled = false

    oldLocation.call(IpuMobile, (result) => {
      if (!isSettled) {
        isSettled = true
        goNextLocation(localLocationNo)
      }
      if (callback) {
        callback(result)
      }
    }, (result) => {
      if (!isSettled) {
        isSettled = true
        goNextLocation(localLocationNo)
        if (errorback) {
          errorback(result)
        }
      }
    })

    // 定位超时或未被处理时，认为超时失败
    setTimeout(() => {
      // promise两秒后还没有结束，设置promise为超时失败
      if (!isSettled) {
        isSettled = true
        console.log('setTimeout', localLocationNo, currentLocationNo)
        goNextLocation(localLocationNo)
        if (errorback) {
          errorback('百度定位超时')
        } else {
          alert('百度定位超时')
        }
      }
    }, 30 * 1000) // 实际测试，没有sim卡时有10几种才返回的情况
  }

  // 处理队列的下一个定位
  function goNextLocation(localLocationNo) {
    if (localLocationNo === currentLocationNo) {
      setTimeout(() => {
        isLocationAvailable = true
        if (locationArgs.length) {
          realBaiduLocation(locationArgs.shift())
        }
      }, 1000)
    }
  }
}
