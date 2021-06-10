<template>
    <div class="filter">
      <h2>过滤条件</h2>
      <div class="filter-fans filter-item">
        <div class="filter-title">
          <div class="left">粉丝数</div>
          <div class="right">> = {{filter_fans.limit * filter_fans.rate}}</div>
        </div>
          <div class="filter-content">
            <peity :type="'line'" :options="{ 'fill': ['#808eff',], width: 100+'%', height: 100+'%',strokeWidth: 1 }" :data="fansData"></peity>
          </div>
          <div class="block">
          <el-slider v-model="filter_fans.limit" :disabled="!$store.state.header.loaded" :max="filter_fans.step" show-stops :show-tooltip="false"></el-slider>
          </div>
      </div>
      <div class="filter-forward filter-item">
        <div class="filter-title">
          <div class="left">转发数</div>
          <div class="right">> = {{filter_retweet.limit == 0? 0 : Math.pow(2,filter_retweet.limit)}}</div>
        </div>
        <div class="filter-content">
          <peity :type="'line'" :options="{ 'fill': ['#808eff',], width: 100+'%', height: 100+'%',strokeWidth: 1 }" :data="retweetData"></peity>
        </div>
        <div class="block">
          <el-slider v-model="filter_retweet.limit" :disabled="!$store.state.header.loaded" :max="filter_retweet.step" show-stops :show-tooltip="false"></el-slider>
          </div>
      </div>
      <div class="filter-klass filter-item">
        <div class="filter-title">
          <div class="left">转发层级</div>
          <div class="right">> = {{filter_deepth.limit}}</div>
        </div>
        <div class="filter-content">
         <peity :type="'line'" :options="{ 'fill': ['#808eff',], width: 100+'%', height:100+'%',strokeWidth: 1 }" :data="deepthData" :show-tooltip="false"></peity>
        </div>
        <div class="block">
          <el-slider v-model="filter_deepth.limit" :disabled="!$store.state.header.loaded" :max="filter_deepth.step-1" show-stops></el-slider>
          </div>
      </div>
      <div class="filter-item source">
        <div class="filter-title">
          <div class="left">发布时间</div>
        </div>         
         <div class="block">
           <el-date-picker
            v-model="filter_time.value"
            type="datetimerange"
            :style="{width:'84%'}"
            placeholder="选择日期范围">
          </el-date-picker>
        </div>
      </div>

      <div class="filter-item source">
        <div class="filter-title">
          <div class="left">提交过滤器</div>
        </div> 
        <div class="mid_button">
          <el-button type="primary" :loading="this.loading" :disabled="!$store.state.header.loaded" @click="submit">提交</el-button>
        </div>
      </div>
    </div>
</template>



<script>
/*
   依赖关系:由main.vue 获取初始数据,然后filter组件才可以使用
   4个过滤器之间不存在依赖,可以无序处理 
*/
// import Datepicker from 'vue-bulma-datepicker.vue'
// import Datepicker from '~components/main.vue'
// import {Slider, DatePicker, Button} from 'element-ui';
import Peity from 'vue-peity';
import history from './history_mixin.js';
export default {
  mixins:[history],
  components:{
     Peity,
  },
  data(){
    return{
      filter_queue:[],
      filter_fans:{keyword:'followers_count',limit:-1, rate:100, step:20},
      filter_retweet:{keyword:'children',limit:-1, rate:100, step: 1},
      filter_deepth:{keyword:'deepth', limit:-1, rate:0,  step:1},
      filter_time:{keyword:'t', value:[null, null]},
      loading:false,
    }
  },

  methods:{
      submit(isRecord){
        this.loading = true;
        let status = {};
        status.keyword = '';
        // 
        if(this.filter_fans.limit > 0){
          this.filter_queue.push(_.cloneDeep(this.filter_fans));
          status.filter_fans = _.cloneDeep(this.filter_fans);
          status.keyword += '粉丝数 '
        }
        if(this.filter_retweet.limit > 0){
         this.filter_queue.push(_.cloneDeep(this.filter_retweet));
         status.filter_retweet = _.cloneDeep(this.filter_retweet);
         status.keyword += '转发数 '
        }
        if(this.filter_deepth.limit > 0){
          this.filter_queue.push(_.cloneDeep(this.filter_deepth));
          status.filter_deepth = _.cloneDeep(this.filter_deepth);
          status.keyword += '层级数 '
        }
        if(this.filter_time.value[0]){
          this.filter_queue.push(_.cloneDeep(this.filter_time));
          status.filter_time = _.cloneDeep(this.filter_time);
          status.keyword += '时间'
        }
        // 防止再次调用时 将还原记录的信息写入历史栈内
        if(isRecord){
           console.log('isRecord', isRecord);
           this.records('过滤', status, this);
        }
          codeflower.attribute_filter(this.filter_queue);
          this.filter_queue = []
        this.loading = false;
      },
  },
  created(){
      // this.src = this.$store.state.header.src; 
  },

  computed:{
     fansData(){
      //  this.filter_fans.limit = -1;
       let loaded = this.$store.state.header.loaded;
       if(loaded){
        return codeflower.vue_fans(this.filter_fans);
       }
       return "0";
     },
    //  在现有的数据之上处理数据
    //  childTable 记录所有有转发数,A有n个child,就有n个转发数 (直接转发)
    //  log2(size) 让数据分布的更均匀
     retweetData(){
        let loaded = this.$store.state.header.loaded;
        if(loaded){
          return codeflower.vue_retweet(this.filter_retweet);
        }
        return "0";
     },

       deepthData(){
        let loaded = this.$store.state.header.loaded;
        if(loaded){
          return codeflower.vue_depth(this.filter_deepth);
        }
        return '0';
     },
      //当数据比较大,等待计算分布图全部完成后，允许提交  
     canSubmit(){
       return this.filter_deepth.disabled || this.filter_retweet.disabled || this.filter_fans.disabled
     }
   
  },

}
</script>

<style>
  .el-slider{
    width: 84%;
    margin: auto;
  }
  .el-input__inner{
        margin: 10% 10% 10% 7%;
  }
  .mid_button{
        margin: 5% 10% 5% 33%;
  }
</style>