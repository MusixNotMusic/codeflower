import Xlsx from './tasks/export/xlsx.js'
import Weibos from './models/weibos'
import { exist } from '../../models/common'
let xlsx = new Xlsx(Weibos, '/Users/musix/Desktop/微博导出数据/5.3微博及微信原文-01月重点剧目TOP30原文.xlsx', null)
// let xlsx = new Xlsx(Weibos, '/Users/musix/Desktop/微博导出转发占比/5.4-12.xlsx', null)
xlsx.retweet_percentage_fill()