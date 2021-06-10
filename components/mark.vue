<template>
    <div class='mask' v-bind:style="{display:($store.state.header.share ? 'none': 'block')}">
        <div class="share">
        <div class="close" @click='close'>x</div>
        <div class="top">
            <p>链接分享</p>
            <div class="linkshare">
            <input type="text" value="https://app/uxpin.com/edit/5123199#">
            <button>复制链接</button>
            </div>
            <p>微博分享</p>
            <textarea>#数太奇微博可视化分析工具#（http://vis.idatage.com/weibova/weiboevents）分析@华夏地理 的微博</textarea>
            <button class="send">发送微博</button>
        </div>
        <div class="bottom">
            <button><a id="image" :href="dataUrl" :download="new Date().getTime()+'.png'" 
             @click="download">图片导出</a></button>
            <button><a id="excel" @click="excel">Excel导出</a></button>
            <button><a id="qr">二维码导出</a></button>
        </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data(){
        return {
            dataUrl:'',
            excelUrl:'/excel.json?url=',
        }
    },
    methods:{
        close(){
            return this.$store.state.header.share = true;
        },
        download(){
            let loaded = this.$store.state.header.loaded;
            if(loaded){
               this.dataUrl =  codeflower.draw_graph_summary();
            }else{
               this.dataUrl = 'javascript:void(0)';
            }
        },
        async excel(){
            let loaded = this.$store.state.header.loaded;
            let dom = document.getElementById('excel');
            if(loaded){
                    dom.download = this.$store.state.header.url+".xlsx";
                    dom.href = this.excelUrl+this.$store.state.header.url;
            }else{
               delete dom.download;
               delete dom.href;
            }
        },
    },
}   
</script>
<style scoped>
    a{
        color:black;
    }
</style>
