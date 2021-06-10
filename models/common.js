import Weibos from './weibos'
import Records from './records'
export async function exist(mid) {
    console.log("exist .......", mid);
    try {
        let isExist = await Weibos.findOne({ 'mid': mid }),
            isRecord = await Records.findOne({ 'mid': mid });
        if (isExist && isRecord) {
            return {
                status: "success",
                message: "数据已经缓存",
                create_time: isRecord.create_time || '',
                operate_code: 3, // 可以删除，可以直接执行 二进制 11
            }
        } else if (!isExist && !isRecord) {
            return {
                status: "success",
                message: "数据不存在",
                create_time: '',
                operate_code: 1, // 可以执行 不可以删除
            }
        } else {
            return {
                status: "success",
                message: "数据丢失,不完整,建议重新加载",
                create_time: (isRecord && isRecord.create_time) || '',
                operate_code: 3, // 可以执行 可以删除
            }
        }
    } catch (e) {
        console.error(e);
        return {
            status: 'fail',
            message: '服务器出错了!',
            operate_code: 0
        }
    }
}