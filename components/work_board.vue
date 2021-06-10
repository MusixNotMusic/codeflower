<template>
    <div class="mark">
      <h2>标注面板</h2>
      <div class="mark-content">
        <div :class="['mark-sex', (light&1)?'active':'']"     @click="on_click(0)">性别</div>
        <div :class="['mark-v', (light&2)?'active':'']"       @click="on_click(1)">认证</div>
        <div :class="['mark-mainnode', (light&4)?'active':'']" @click="on_click(2)">主节点</div>
        <div class="blank_none blank"></div>
        <div class="blank_none blank"></div>
        <!--<div :class="['mark-shuijun','blank' ,(light&8)?'active':'']" @click="on_click(4)">水军</div>
        <div :class="['mark-klass', 'blank' ,(light&16)?'active':'']"  @click="on_click(8)">层级</div>-->
      </div>
    </div>
</template>

<script>
import history from './history_mixin.js';
export default {
  mixins:[history],

  data(){
    return{
      light: 0,
      open:{
        old: -1,
        current: -2,
        selected: false
      },

      map:{
        gender:'性别',
        verify:'认证',
        node:'主节点',
      },
    }
  },

  methods:{
    on_click(index){
      let loaded = this.$store.state.header.loaded;
      if(loaded){
      let bit = 1<<index;
      this.light = bit;
      this.open.old  = this.open.current;
      this.open.current = index;
      if(this.open.old === this.open.current){
        this.open.selected = false;
        this.light = 0;
        this.open.current = -1;
      }else{
        this.open.selected  = true;
      }
      this.shift_render(this.open.current);
      }
    },
    // index ==> 0 gender |  1 verify  | 2 water | 3 depth | 4 nodes
    shift_render(index){
      let ref =  this.label_store(index);
      if(ref){
        this.records('标注',{ref:ref, keyword:this.map[ref.name]}, this);
      }
      codeflower.label_filter(ref);
    },


    label_store(index){
        let ref = null;
      switch(index){
        case 0:
          ref = {};
          ref.name = 'gender';
          this.$store.state.show.sign = ['f','m','name'];
          break;
        case 1:
          ref = {};
          ref.name = 'verify';
          this.$store.state.show.sign = ['generalV','blueV','yellowV','name'];
          break;
        case 2:
          ref = {};
          ref.name = 'node';
          this.$store.state.show.sign = ['main','name'];
          break;
        case 3:
          console.log('不存在');
          this.$store.state.show.sign = [];
          break;
        case 4:
          console.log('不存在');
          this.$store.state.show.sign = [];
          break;
      }
      return  ref;
    },
  },
   
}
</script>

<style scoped>
  .blank:hover {
    background: white;
    border: 1px;
    color: white;
    cursor: default;
  }

  .blank {
    background: white;
    border: 1px;
    color: white;
    cursor: default;
  }
  .blank_none{
    width: 50px;
    height: 50px;
    cursor: pointer;
    margin: 5px;
    float: left;
    padding-top: 30px;
  }
</style>