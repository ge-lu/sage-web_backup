/* eslint-disable */
// define(["IpuMobile", "mobileClient", "mobileBrowser"], function (IpuMobile, MobileClient, MobileBrowser) {
import IpuMobile from './ipu-mobile';
import MobileClient from './mobile-client';
import MobileBrowser from './mobile-browser';

/* if (IpuMobile.isApp()) {
export default MobileClient;
} else {
export default MobileBrowser;
} */

export default IpuMobile.isApp() ? MobileClient : MobileBrowser;
// });
