import { IpuMobile } from "@/ipuframe";
const remindUtil = {
    addRemind: function (callback: any, remindTitle: string, remindContent: string, time: string, repeat: string, ringtone: string) {
        IpuMobile.addRemind(callback, remindTitle, remindContent, time, repeat, ringtone);
    },
    updateRemind: function (callback: any, remindId: string, remindTitle: string, remindContent: string, time: string, repeat: string, ringtone: string) {
        IpuMobile.updateRemind(callback, remindId, remindTitle, remindContent, time, repeat, ringtone);
    },
    deleteRemind: function (callback: any, remindId: string) {
        IpuMobile.deleteRemind(callback, remindId);
    },
    getReminds: function (callback: any) {
        IpuMobile.getReminds(callback);
    },
    getRemindById: function (callback: any, remindId: string) {
        IpuMobile.getRemindById(callback, remindId);
    },
    getRemindCount: function (callback: any) {
        IpuMobile.getRemindCount(callback);
    },
    getRemindNextTime: function (callback: any) {
        IpuMobile.getRemindNextTime(callback);
    },
    getRemindNextTimeById: function (callback: any, remindId: string) {
        IpuMobile.getRemindNextTimeById(callback, remindId);
    },
    
}

export default remindUtil;