<template>
<footer :style="{display:isShow}">
  <div class="content">
    <!--<div class="slider" style="left: 50%;">2017-03-25</div>-->
    <peity :type="'line'" :options="{ 'fill': ['#808eff',], width: 100+'%', height:100+'%',strokeWidth: 1 }" :data="timeLine" :show-tooltip="false"></peity>
  </div>
  <div class="block">
          <el-slider v-model="time_line.limit" 
                :disabled="time_line.disabled" 
                :max="time_line.step" 
                :style="{width: wid}" 
                range 
                :format-tooltip="format_tooltip"
                ></el-slider>
  </div>
  </footer>
</template>

<script>
import Peity from 'vue-peity'
export default {
  components: {
    Peity,
  },
  /* 
    1、sort 时间排序
    2、最小时间为 base_time, 假设 offset 为5分钟(300m)
    3、 splice = (max_time - base_time) / 1000 / offset 分段的时间
    4、统计时间:
            forEach ==> src_time
                index = 向下取膜(src_time[i]-base_time) / 300 / 1000  
  */
  data(){
    return{
      dist_mid_list:null,
      time_line: {step:0, disabled:true, limit:0, base_time: -1},
      wid:'100%',
      offset:300,
    }
  },

  computed:{
    isShow(){
      return this.$store.state.tool.show;
    },
    timeLine(){
      // 清除数据
      this.time_line.disabled = true;
      this.time_line.step = 0;
      this.time_line.base_time = -1;
      this.time_line.limit = 0;

      let loaded = this.$store.state.header.loaded;
      if(loaded){
        return codeflower.vue_timeline(this.time_line,this.offset);
      }
      return '0';
    }
  },

  methods:{
  //   init_time_params(){
  //       this.time_line.step = dist_time_list.length;
  //       this.time_line.disabled = false;
  //       this.time_line.base_time = base_time;
  //   }
  format_tooltip(value){
    
    let format = new Date(this.time_line.base_time + value*this.offset*1000); 
    if(value <=this.time_line.step-1){
      return format.toLocaleDateString()+" "+format.toLocaleTimeString();
    }else{
      return ">"+format.toLocaleDateString();
    }
  }
  }
}
</script>

<style>
</style>