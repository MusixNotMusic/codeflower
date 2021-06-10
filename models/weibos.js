'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema; //类生产工厂

/*****************************微博**********************************/
const WeiboScheme = mongoose.Schema({
    // _id:{ type:String, require:true, unique: true,},
    mid: { type: String, index: true },
    weibo_created_at: { type: Date },
    weibo_id: { type: Number },
    weibo_mid: { type: String },
    weibo_idstr: { type: String },
    weibo_text: { type: String },
    weibo_source_allowclick: { type: Number },
    weibo_source_type: { type: Number },
    weibo_source: { type: String },
    weibo_appid: { type: Number },
    weibo_favorited: { type: Boolean },
    weibo_truncated: { type: Boolean },
    weibo_in_reply_to_status_id: { type: String },
    weibo_in_reply_to_user_id: { type: String },
    weibo_in_reply_to_screen_name: { type: String },
    weibo_pid: { type: String },
    weibo_user_id: { type: Number },
    weibo_user_idstr: { type: String },
    weibo_user_class: { type: Number },
    weibo_user_screen_name: { type: String },
    weibo_user_name: { type: String },
    weibo_user_province: { type: String },
    weibo_user_city: { type: String },
    weibo_user_location: { type: String },
    weibo_user_description: { type: String },
    weibo_user_url: { type: String },
    weibo_user_profile_image_url: { type: String },
    weibo_user_cover_image_phone: { type: String },
    weibo_user_profile_url: { type: String },
    weibo_user_domain: { type: String },
    weibo_user_weihao: { type: String },
    weibo_user_gender: { type: String },
    weibo_user_followers_count: { type: Number },
    weibo_user_friends_count: { type: Number },
    weibo_user_pagefriends_count: { type: Number },
    weibo_user_statuses_count: { type: Number },
    weibo_user_favourites_count: { type: Number },
    weibo_user_created_at: { type: Date },
    weibo_user_following: { type: Boolean },
    weibo_user_allow_all_act_msg: { type: Boolean },
    weibo_user_geo_enabled: { type: Boolean },
    weibo_user_verified: { type: Boolean },
    weibo_user_verified_type: { type: Number },
    weibo_user_remark: { type: String },
    weibo_user_insecurity_sexual_content: { type: Boolean },
    weibo_user_ptype: { type: Number },
    weibo_user_allow_all_comment: { type: Boolean },
    weibo_user_avatar_large: { type: String },
    weibo_user_avatar_hd: { type: String },
    weibo_user_verified_reason: { type: String },
    weibo_user_verified_trade: { type: String },
    weibo_user_verified_reason_url: { type: String },
    weibo_user_verified_source: { type: String },
    weibo_user_verified_source_url: { type: String },
    weibo_user_follow_me: { type: Boolean },
    weibo_user_online_status: { type: Number },
    weibo_user_bi_followers_count: { type: Number },
    weibo_user_lang: { type: String },
    weibo_user_star: { type: Number },
    weibo_user_mbtype: { type: Number },
    weibo_user_mbrank: { type: Number },
    weibo_user_block_word: { type: Number },
    weibo_user_block_app: { type: Number },
    weibo_user_level: { type: Number },
    weibo_user_type: { type: Number },
    weibo_user_ulevel: { type: Number },
    weibo_user_badge_uc_domain: { type: Number },
    weibo_user_badge_enterprise: { type: Number },
    weibo_user_badge_anniversary: { type: Number },
    weibo_user_badge_taobao: { type: Number },
    weibo_user_badge_travel2013: { type: Number },
    weibo_user_badge_gongyi: { type: Number },
    weibo_user_badge_gongyi_level: { type: Number },
    weibo_user_badge_bind_taobao: { type: Number },
    weibo_user_badge_hongbao_2014: { type: Number },
    weibo_user_badge_suishoupai_2014: { type: Number },
    weibo_user_badge_dailv: { type: Number },
    weibo_user_badge_zongyiji: { type: Number },
    weibo_user_badge_vip_activity1: { type: Number },
    weibo_user_badge_unread_pool: { type: Number },
    weibo_user_badge_daiyan: { type: Number },
    weibo_user_badge_ali_1688: { type: Number },
    weibo_user_badge_vip_activity2: { type: Number },
    weibo_user_badge_suishoupai_2016: { type: Number },
    weibo_user_badge_fools_day_2016: { type: Number },
    weibo_user_badge_uefa_euro_2016: { type: Number },
    weibo_user_badge_super_star_2016: { type: Number },
    weibo_user_badge_unread_pool_ext: { type: Number },
    weibo_user_badge_self_media: { type: Number },
    weibo_user_badge_olympic_2016: { type: Number },
    weibo_user_badge_dzwbqlx_2016: { type: Number },
    weibo_user_badge_discount_2016: { type: Number },
    weibo_user_badge_wedding_2016: { type: Number },
    weibo_user_badge_shuang11_2016: { type: Number },
    weibo_user_badge_follow_whitelist_video: { type: Number },
    weibo_user_badge_wbzy_2016: { type: Number },
    weibo_user_badge_hongbao_2017: { type: Number },
    weibo_user_badge_hongbao_2017_2: { type: Number },
    weibo_user_badge_caishen_2017: { type: Number },
    weibo_user_badge_top: { type: String },
    weibo_user_has_ability_tag: { type: Number },
    weibo_user_extend_privacy_mobile: { type: Number },
    weibo_user_extend_mbprivilege: { type: String },
    weibo_user_credit_score: { type: Number },
    weibo_user_user_ability: { type: Number },
    weibo_user_urank: { type: Number },
    weibo_reposts_count: { type: Number },
    weibo_comments_count: { type: Number },
    weibo_attitudes_count: { type: Number },
    weibo_isLongText: { type: Boolean },
    weibo_mlevel: { type: Number },
    weibo_visible_type: { type: Number },
    weibo_visible_list_id: { type: Number },
    weibo_biz_feature: { type: Number },
    weibo_hasActionTypeCard: { type: Number },
    weibo_userType: { type: Number },
    weibo_positive_recom_flag: { type: Number },
    weibo_gif_ids: { type: String },
    weibo_is_show_bulletin: { type: Number },
    weibo_geo: { type: String },
    weibo_total_number: { type: String }
})


// 当数据存在返回 数据否则返回null
WeiboScheme.statics.get = async function(mid, fre) {
    let frequency = fre || 1000;
    let count = await this.find({ 'mid': mid }).count();
    console.log('[data count]', count);
    if (count > 0) {
        let page = Math.ceil(count / (frequency * 10)),
            cursor = -1;
        let chips = [],
            list = null,
            formatDate;
        // 每次取1000 条数据 把数据格式化减小数据体积，释放引用;
        while (++cursor < page) {
            console.log('[Page]', cursor);
            list = await this.find({ mid: mid }).skip(cursor * (frequency * 10)).limit((frequency * 10));
            formatDate = await db_format_client_data(list, mid);
            list = null;
            chips.push(formatDate);
        }
        console.log('[piece_db_data.length]', chips.length);
        // 合并数据
        for (let i = 1; i < chips.length; i++) {
            chips[0].data.data = chips[0].data.data.concat(chips[i].data.data);
            chips[i] = null;
        }
        return chips[0];
    } else {
        return null;
    }
}

var total_number = 0;
async function db_format_client_data(source, mid) {
    let des = [],
        temp;
    for (let i = 0; i < source.length; i++) {
        temp = await extract_data_from_parallel(source[i])
        source[i] = null;
        if (mid === temp[0]) {
            temp[3] = null; //root parent null
            // // swap 取数据时，将root index = 0
            // let replace = des[0];
            // des[0] = temp;
            // temp = replace;
        }
        if (temp[0]) {
            des.push(temp)
        }
    }
    source = null;
    let format = await toString(total_number)
    format.data.data = des;

    return format;
}

function extract_data_from_parallel(src) {
    let des = []
    return new Promise((resolve, reject) => {
        des.push(src.weibo_mid);
        des.push(src.weibo_mid);
        des.push(src.weibo_user_id);
        src.weibo_pid ? des.push(src.weibo_pid + "") : des.push(src.mid);
        des.push(src.weibo_created_at);
        des.push(src.weibo_reposts_count);
        des.push(src.weibo_attitudes_count);
        des.push(src.weibo_comments_count);
        des.push(src.weibo_text);
        des.push(src.weibo_text);
        des.push(src.weibo_user_created_at); //<---- ?
        des.push(src.weibo_user_followers_count);
        des.push(src.weibo_user_bi_followers_count);
        des.push(src.weibo_user_favourites_count);
        des.push(src.weibo_user_statuses_count);
        des.push(src.weibo_user_friends_count);
        des.push(src.weibo_user_name);
        des.push(src.weibo_user_screen_name);
        des.push(src.weibo_user_description);
        des.push(src.weibo_user_gender);
        des.push(src.weibo_user_province);
        des.push(src.weibo_user_city);
        des.push(src.weibo_user_verified);
        des.push(src.weibo_user_verified_reason);
        des.push(src.weibo_user_verified_type);
        des.push(src.weibo_user_location);
        des.push(src.weibo_user_avatar_hd);
        des.push(src.weibo_user_geo_enabled);
        des.push(src.weibo_user_cover_image_phone);
        des.push(src.weibo_geo); //暂时不要
        if (src.weibo_total_number) {
            total_number = src.weibo_total_number
        }
        resolve(des)
            // return template
    })
}


function toString(total_number, page) {
    return new Promise((resolve, reject) => {
        let template = {
            // "messages4pages":pages,
            "data": {
                "fields": [
                    "id",
                    "mid",
                    "uid",
                    "parent",
                    "t",
                    "reposts_count",
                    "attitudes_count",
                    "comments_count",
                    "text",
                    "original_text",
                    "user_created_at",
                    "followers_count",
                    "bi_followers_count",
                    "favourites_count",
                    "statuses_count",
                    "friends_count",
                    "username",
                    "screen_name",
                    "user_description",
                    "gender",
                    "province",
                    "city",
                    "verified",
                    "verified_reason",
                    "verified_type",
                    "user_location",
                    "user_avatar",
                    "user_geo_enabled",
                    "picture",
                    "geo"
                ],
                "data": []
            },
            "total_number": total_number
        }
        resolve(template)
            // return template
    })
}


WeiboScheme.statics.getAllMid = async function() {
    let results = await this.distinct("mid")
    return results
}


const Model = mongoose.model('weibos', WeiboScheme);
export default Model;