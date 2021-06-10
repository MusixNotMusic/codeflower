// 保证源数据没有问题
var source_data_check = function(data) {
    if (!data.reposts || data.reposts.length === 0 || Array.isArray(data)) {
        return false;
    }
    return true
}

module.exports = source_data_check