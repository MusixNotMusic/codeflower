<template>
    <header>
        <div class="header-logo">
            <!-- <div class="logo-title">微博分析工具</div>  -->
        </div>
        <div class="header-mid">
            <div class="header-search">
                <div class="input-wrap" ref="inputBox">
                    <input type="text" ref="input" @keyup.enter="to_check" placeholder="可以输入微博地址进行分析 或者 mid" @focus="focusHandle" v-model="url">
                    <ul v-if="onFocus" class="search-mid-box">
                        <li v-for="(mid, index) in midList" :class="{'active': index === activeMidIndex}" @click="clickMidHandle(index, mid)" :key="index">{{mid}}</li>
                        <div v-if="!midList || midList.length === 0" class="nodata">暂无数据</div>
                    </ul>  
                </div>
                <button @click="to_check">开始分析<i class="fa fa-angle-right"></i></button>
            </div>
            <ul class="header-tool">
            <div class="nohover_type1">视图模式</div>
            <li @click="on_click(0)" :class="['type2',(light&1)?'active':'']"></li>
            <li @click="on_click(1)" :class="['type3',(light&2)?'active':'']"></li>
            <li @click="on_click(2)" :class="['type4',(light&4)?'active':'']"></li>
           <!-- <li @click="on_click(4)" :class="['type5',(light&16)?'active':'']"></li>
            <li @click="on_click(5)" :class="['type6',(light&32)?'active':'']"></li>
            <li @click="on_click(6)" :class="['type7',(light&64)?'active':'']"></li>-->
            </ul>
        </div>
        <div class="header-right">
            <!-- <div :class="[is_hidpi?'header-hidpi-active':'header-hidpi-inactive']" @click="hidpi"><span class="hidpi">{{is_hidpi?'高清':'普通'}}</span></div> -->
            <!-- <div class="header-share" @click="share"></div> -->
            <!-- <div class="header-document"><span class="hidpi"><a style="color:white;" :href="document" download="idatage_weibo_help.pdf">下载使用文档</a></span></div> -->
            <div class="header-login">
                <!--<login></login>-->
                <!--<span>登录</span>
                <i class="line"></i>
                <i class="fa fa-weibo"></i>
                <i class="fa fa-qq"></i>-->
            </div>
        </div>
        <div v-if="loading" class='loading-mask'>
            <div class="loading-progress">
                <el-progress type="circle" 
                :percentage="status && status.progress>0 ? status.progress : 0" 
                :status="status && status.status === 'complete' ? 'success' : '' "></el-progress>
            </div>
            <div class="loading-information">
                <span class="loading-content">{{ get_info && status && (status.message||status.status)}}</span>
            </div>
        </div>
        <!--<el-dialog
            title="提示"
            :visible.sync="dialog_visible"
            size="tiny"
            v-if="dialog_visible"
            >
            <span class="el-dialog-context">{{dialog_context.message}}</span>
            <span class="el-dialog-time">
                {{'创建时间:'+ (dialog_context.create_time !== '' ? new Date(dialog_context.create_time).toLocaleDateString() : 'none')}}
            </span>
            <span slot="footer" class="dialog-footer">
                <el-button type="danger" 
                           v-if="dialog_context.operate_code&2"
                           @click="reload_data" 
                           size="small">重新加载</el-button>

                <el-button type="info"
                           v-if="dialog_context.operate_code&1"
                           @click="load_data" 
                           size="small">直接加载</el-button>
            </span>
        </el-dialog>-->

     <div  class="el-dialog__wrapper" style="z-index: 2006;" @click.self="dialog_close" v-if="dialog_visible">
            <div class="el-dialog el-dialog--tiny" style="top: 15%;">
                    <div class="el-dialog__header">
                            <span class="el-dialog__title">提示</span>
                            <button type="button" aria-label="Close" @click="dialog_close" class="el-dialog__headerbtn"><i class="el-dialog__close el-icon el-icon-close"></i></button>
                    </div>
                    <div class="el-dialog__body">
                            <span  class="el-dialog-context">{{dialog_context.message}}</span>
                            <span class="el-dialog-time">
                                {{'创建时间:'+ (dialog_context.create_time !== '' ? new Date(dialog_context.create_time).toLocaleDateString() : 'none')}}
                            </span>
                    </div>
                    <div class="el-dialog__footer">
                            <span  class="dialog-footer">
                                <el-button type="info"
                                        v-if="dialog_context.operate_code&1"
                                        @click="load_data" 
                                        size="small">加载</el-button>
                           </span>
                    </div>
                </div>
            </div>
    <div @click="dialog_close" @key.esc="dialog_close" class="v-modal" style="z-index: 2000;" v-if="dialog_visible"></div>
     </header>
</template>

<script>
import axios from '~plugins/axios';
import history from './history_mixin.js';
export default {
  mixins:[history],
  directives: {
    focus: {
      update: function (el, {value}) {
        if (value) {
          el.focus()
        }
      }
    }
  },
  data(){
    return {
      history: false,
      url:'',
      submited:false,
      document:'/idatage_weibo_help.pdf',
      codeflower:null,
      result: null,
      light: 0,
      loading:false,
      status: null,
      result: null,
      status_loading:{
                status:'init',
                message:"等待加载数据...",
                progress:0,
      },
      status_db:{
                status:'complete',
                message:"正在获取数据...",
                progress:100,
        },
      status_page:{
                status:'complete',
                message:"正在初始化页面...",
                progress:100,
      },
      is_hidpi:false,
      dialog_visible:false,
      dialog_context:null,
      onFocus: false,
      midList: [],
      activeMidIndex: -1
    }
  },
  methods:{
     open_history(){
        this.history = !this.history
     },
     on_click(index){
        let loaded = this.$store.state.header.loaded;
        if(loaded){
        this.light =  1<<index;
        this.mode(index);
        }
     },

     dialog_close(){
        this.dialog_visible = false;
     },
     hidpi(){
         if(this.$store.state.header.loaded){
            if(devicePixelRatio == 2){
                this.is_hidpi = !this.is_hidpi;
                if(this.is_hidpi){
                    document.cookie = 'mac';
                }else{
                    document.cookie = '';
                }
                window.location.reload();
            }
         }
     },
     mode(index){
         if(index == 0){
            codeflower.switch_layout('circular')
         }else if(index == 1){
            codeflower.switch_layout('tree')
         }else if(index == 2){
            codeflower.switch_layout('radiate')
         }
     },
     share(){
         if(this.$store.state.header.loaded)
             this.$store.state.header.share = !this.$store.state.header.share;
     },
     async to_check(){
        let reg = /^(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?$/
        let numberReg = /^\d+$/
        if( reg.test(this.url.trim()) || numberReg.test(this.url.trim())){
             if(!this.submited){
                this.submited = true;
                try{
                    let ret = await axios.get("/exist.json?url="+this.url);
                    console.log('ret ssss',ret);
                    if(ret.data.status == 'success'){
                        this.dialog_visible = true;
                        this.dialog_context =  ret.data;
                    }else{
                        this.$message({
                            message: '服务器出现问题! 😔',
                            type: 'error'
                        })
                    }
                    // this.loading = true;
                    // console.log('loading',this.loading);
                    // let ret = await axios.get(this.baseUrl+this.url);
                    // 当任务正在运行是 不允许两个用户同时分析同一条微博
                    // if(!ret.data.lock){
                    //     this.loading = true;
                    // }
                }catch(e){
                    console.log('e',e);
                }
                this.submited = false;
             }else{
                 console.log('不能重复提交');
             }
         }else{
             this.url = 'url error'
         }
     },

     async load_data(){
        try{
             this.dialog_visible = false
             this.loading = true;
             console.log('loading',this.loading);
             let ret = await axios.get("/launch.json?url="+this.url);
        }catch(e){
             this.$message({
                  message: '网络出现问题! 😔',
                  type: 'error'
             })
             console.error(e);
        }
     },

     async reload_data(){
         try{
            this.dialog_visible = false;
            let result = await axios.get("/delete.json?url="+this.url);
            if(result.data.status == "success"){
                this.$message(result.data.message);
                await this.load_data();
            }
         }catch(e){
            this.$message({
                  message: '网络出现问题! 😔',
                  type: 'error'
            })
            console.error(e);
         }
     },


     init_codeflower(result){
        this.clear_status();
        if(result){
            try{
                codeflower.launch(result.data);
                this.$message({
                    message: '数据加载完成 😀',
                    type: 'success'
                });
                this.loading = false;
                this.$store.state.header.loaded = true;
                this.$store.state.header.url = this.url;
            }catch(e){
                console.error(e);
                this.$message.error('这条微博可能存在问题(1、非源级转发 2、服务繁忙 😟)');
                this.loading = false;
            }
            // 允许再次提交
            this.submited = false;
        }
     },


     clear_status(){
          this.$store.state.header.url = "";
          this.$store.state.filter.deepth = null;
          this.$store.state.filter.retweet = null;
          this.$store.state.show.verified = null;
          this.$store.state.show.gender = null;
          this.$store.state.show.node = null;
          this.$store.state.header.loaded = false;
          this.$store.state.show.sign = null;
          this.$store.state.tool.pencil_zindex = 0;
          this.$store.state.header.history = { stack:[]};
     },
     recover(type,$index){
        console.log('recover history', type, $index);
        let loaded = this.$store.state.header.loaded;
        if(loaded){
            let stack = this.$store.state.header.history.stack, 
                zindex, 
                otype = ["标注", "过滤"];

            if(type == otype[0]){
                this.recover_label(stack[$index].content.ref)
                zindex = this.find_front(otype[1], $index, stack);
                // 没有找到 
                if(zindex >= 0){
                    zindex = this.find_back(otype[1], $index, stack);
                    if(zindex >= 0){
                        // 还原 zindex数据
                        this.recover_filter(stack[zindex]);
                    }else{
                        // 消除 过滤数据
                        this.recover_filter([]);
                    }
                }
            }else if(type == otype[1]){
                this.recover_filter(stack[$index])
                zindex = this.find_front(otype[0], $index, stack);
                // 没有找到 
                if(zindex >= 0){
                    zindex = this.find_back(otype[0], $index, stack);
                    if(zindex >= 0){
                        // 还原 zindex数据
                        this.recover_label(stack[zindex].content.ref)
                    }else{
                        // 消除 标记数据
                        this.recover_label(null)
                    }
                }
            }
        }
     },

     recover_filter(record){
        console.log('recover_filter',record);
        let content=[],copy;
        if(!_.isArray(record)){
            for(let item in record.content){
                if(item !== 'keyword'){
                    content.push(record.content[item]);
                }
            }
        }
        codeflower.attribute_filter(content)
     },

     recover_label(record){
      console.log('recover_label',record);
      codeflower.label_filter(record);
            
     },

     find_front(type, pos ,stack){
        for(let i = pos; i >= 0; i--){
            if(stack[i].name == type){
                return i;
            }
        }
        return -1;
     },
     find_back(type, pos ,stack){
        for(let i = pos; i < stack.length; i++){
            if(stack[i].name == type){
                return i;
            }
        }
        return -1;
     },

     focusHandle () {
         this.onFocus = true
         this.getAllMid()
     },
     getAllMid () {
        axios.get("/getAllMid").then((data) => {
            console.log('data -->', data)
            if (data.data) {
                this.midList = data.data
            }
        })
     },
     clickMidHandle (index, mid) {
         this.activeMidIndex = index
         this.url = mid
     },

     registerEvent () {
         window.addEventListener('click', (e) => {
             if (!this.$refs.inputBox.contains(e.target)) {
                 this.onFocus = false
             }
         })
     },

     removeEvent () {
         window.removeEventListener('clicl')
     }
  },

  computed:{
     async get_info(){
         if(this.loading){
             this.status = this.status_loading;
            let timer = setInterval(async()=>{
                    let info = await axios.get("/status.json?url="+this.url);
                    this.status = info.data;
                    console.log('get_info===>', info);
                    if(info.data.status === 'complete'){
                        clearInterval(timer);
                        this.status = this.status_db;
                        new Promise(async(resolve,reject)=>{
                            let result = await axios.get("/data.json?url="+this.url);
                            resolve(result);
                        }).then((result)=>{
                            this.status = _.cloneDeep(this.status_page);
                            return result;
                        }).then((result)=>{
                            setTimeout(()=>{ this.init_codeflower(result); },500)
                        })
                        console.log(info)
                    }else if(info.data.status === 'success'){
                        this.status = info.data;
                    }else if(info.data.status === 'failed'){
                        this.status = info.data;
                    }
            },5000);
         }
     },
  },
  beforeMount(){
    this.is_hidpi = document.cookie.includes("mac")
  },
  mounted(){
    console.log(this);
    codeflower = window.codeflower()
    this.$nextTick(()=>{
        this.url = this.$route.query['weibo'] ? this.$route.query['weibo'] : ''
        this.url = this.url.trim()
    })
    this.getAllMid()
    this.registerEvent()
  },
  destroyed () {
      this.removeEvent()
  }
}
</script>

<style scoped>
    .loading-mask {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(255, 255, 255, .5);
        z-index: 99999;
    }
    .loading-progress{
        position: fixed;
        top:40%;
        left: 42%;
    }
    
    .loading-information{
        position: fixed;
        top: 40%;
        left: 42%;
        width: 126px;
        margin-top:136px;
    }
    .loading-content{
        color: #20A0FF;
        font-size:15px;
        width: 126px;
        text-align: center;
        display: block;
    }

    .header-hidpi-inactive {
        width: 50px;
        height: 30px;
        border-radius: 4px;
        margin-top: 15px;
        cursor: pointer;
        float: left;
        background:linear-gradient(to right, #7d94fc , #9682ff);
        margin-left: 20px;
        color: floralwhite;
    }
    .header-hidpi-active{
       width: 50px;
        height: 30px;
        border-radius: 4px;
        margin-top: 15px;
        cursor: pointer;
        float: left;
        color:#9682ff;
        margin-left: 20px;
        background:linear-gradient(to right, floralwhite , #7d94fc);
    }

    .header-document{
        width: 100px;
        height: 30px;
        border-radius: 4px;
        margin-top: 15px;
        cursor: pointer;
        float: left;
        color: floralwhite;
        margin-left: 20px;
        background:linear-gradient(to right, #7d94fc , #9682ff);
        margin-left: 100px;
    }

    .hidpi{
        height: 30px;
        font-size: 14px;
        line-height: 30px;
    }
    .nohover_type1{
        width: auto;
        padding: 0 10px;
        -ms-flex: 1;
        flex: 1;
        white-space: nowrap;
        border-radius: 4px 0 0 4px;

        box-sizing: border-box;
        background-color: #fff;
        border: 1px solid transparent;
        height: 30px;
        border-left: 1px solid #ebf0f3;
        background-repeat: no-repeat;
        background-position: center center;
    }
  
    .el-dialog-context{
        font-size: 22px;
        display: block;
    }   
   

    .el-dialog-time{
        display: block;
        margin-top: 20px;
    }


    .v-modal{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: .5;
        background: #000;
    }

    .el-dialog__wrapper{
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        position: fixed;
        overflow: auto;
        margin: 0;
    }
  
    .el-dialog--tiny {
        width: 30%;
    }

    .el-dialog {
        position: absolute;
        left: 50%;
        -ms-transform: translateX(-50%);
        transform: translateX(-50%);
        background: #fff;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,.3);
        box-sizing: border-box;
        margin-bottom: 50px;
    }

    .el-dialog__header {
        padding: 10px;
        background: #3879d9;
        color: white;
    }
    
    .el-dialog__title {
        line-height: 1;
        font-size: 16px;
        font-weight: 700;
        color: white;
    }

    .el-dialog__headerbtn {
        float: right;
        background: 0 0;
        border: none;
        outline: 0;
        padding: 0;
        cursor: pointer;
    }

    .el-dialog__body {
        padding: 20px;
        font-size: 14px;
        border-bottom: 1px dashed #aaa;
    }

    .el-dialog__footer {
        padding: 10px;
        text-align: right;
        box-sizing: border-box;
    }

    .logo-title {
        text-align: center;
        font-size: 34px;
        line-height: 60px;
        color: deeppink;
    }

    .input-wrap {
        position: relative;
        width: calc(100% - 20px);
    }
    .input-wrap input {
        width: calc(100% - 20px);
    }

    .search-mid-box {
        position: absolute;
        top: 35px;
        width: 150px;
        height: 200px;
        overflow: auto;
        z-index: 100;
        border: 1px solid #ccc;
        border-radius: 5px;
        background: white;
    }
    li {
        height: 30px;
        cursor: pointer;
        line-height: 30px;
    }
    li:hover {
        background: #eee;
    }
    li.active {
        background: #1d90e6;
        color: white;
    }

    .nodata {
        margin-top: 90px;
        color: #aaa;
    }
</style>
