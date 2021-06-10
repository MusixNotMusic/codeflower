<template>
  <div class="mainbody">
    <Heade></Heade> 
      <div class = "main">
      <div class = "main-left" :style="{display:isShow}">
      <Wboard></Wboard> 
      <Filte></Filte> 
      </div> 
      <Graph></Graph> 
      <div class = "main-mid">
          <div class="circle-sign" v-for="key in $store.state.show.sign" :style="{background: color[key]}">
              <span class="font-sign">{{name[key]}}</span>
          </div>
      </div>
      <Sboard></Sboard> 
      <Tool></Tool> 
      </div> 
      <Foote></Foote> 
      <Modal></Modal> 
  </div>
</template>

<script>
import Heade from "~components/head_top.vue";
import Wboard from "~components/work_board.vue";
import Filte from "~components/cond_filter.vue";
import Sboard from "~components/show_board.vue";
import Foote from "~components/time_line.vue";
import Tool from "~components/tool_area.vue";
import Modal from "~components/mark.vue";
import Graph from "~components/main.vue";

// import Vue from 'vue'
// import ElementUI from 'element-ui'
import "element-ui/lib/theme-default/index.css";
// Vue.use(ElementUI)

export default {
  components: {
    Heade,
    Wboard,
    Filte,
    Sboard,
    Foote,
    Tool,
    Modal,
    Graph
  },
  computed: {
    isShow() {
      return this.$store.state.tool.show;
    }
  },
  data() {
    return {
      name: {
        m: "男",
        f: "女",
        main: "主节点",
        generalV: "普通",
        yellowV: "黄V",
        blueV: "蓝V",
        name: "过滤点"
      },

      color: {
        f: "#F73080",
        m: "#93BFF5",
        generalV: "#F73080",
        blueV: "#93BFF5",
        yellowV: "#cadc4f",
        main: "black",
        name: "green"
      },
      status: null
    };
  }
};
</script>

<style>
.mainbody {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}
.circle-sign {
  border-radius: 5px;
  width: 10px;
  height: 10px;
  margin-left: 10px;
  margin-top: 10px;
  position: relative;
}
.font-sign {
  display: block;
  margin-left: 20px;
  font-size: 12px;
  color: #666;
  width: 40px;
}
</style>