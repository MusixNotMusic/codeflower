export const ID_PER = 50
export const MIN_QUESTION_ID = 19550225
export const MAX_QUESTION_ID = 60000000
export const MIN_TOPIC_ID = 19550225
export const MAX_TOPIC_ID = 20050000
export const beattime = 1000 * 30
export const cleartime = 1000 * 60 * 10
export const redisOpts = {
    host: '101.201.37.28',
    port: '6379',
    password: 'Abc123456'
}

export const esOpts = {
    hosts: ["http://thracia:thracia@123456@59.110.52.213/thracia"],
    requestTimeout: 300000,
    log: 'error'
}
export const mongoUrl = "mongodb://codeflower:codeflower123@dds-2ze2c44ee9d940c41.mongodb.rds.aliyuncs.com:3717,dds-2ze2c44ee9d940c42.mongodb.rds.aliyuncs.com:3717/codeflower"