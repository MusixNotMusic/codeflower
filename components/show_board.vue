<template>
<div class="main-right" :style="{display:isShow}">
    <ul>
      <li>
        <div class="title">定向转发占比</div>
        <div class="percent-container">
          <div class="percent-title">定向</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: orientation[0]+'%'}"></div>
          </div>
          <div class="percent-text">{{orientation[0]+'%'}}</div>
        </div>
        <div class="percent-container">
          <div class="percent-title">非定向</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: orientation[1]+'%'}"></div>
          </div>
          <div class="percent-text">{{orientation[1]+'%'}}</div>
        </div>
      </li>
      <li>
        <div class="title">男女比例</div>
        <div class="percent-container">
          <div class="percent-title">男性</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: gender[0]+'%'}"></div>
          </div>
          <div class="percent-text">{{gender[0] + '%'}}</div>
        </div>
        <div class="percent-container">
          <div class="percent-title">女性</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: gender[1]+'%'}"></div>
          </div>
          <div class="percent-text">{{gender[1] + '%'}}</div>
        </div>
      </li>
      <li>
        <div class="title">认证比例</div>
        <div class="percent-container">
          <div class="percent-title">普通</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: verifiedType[0]+'%'}"></div>
          </div>
          <div class="percent-text">{{verifiedType[0]+'%'}}</div>
        </div>
        <div class="percent-container">
          <div class="percent-title">蓝V</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: verifiedType[1]+'%'}"></div>
          </div>
          <div class="percent-text">{{verifiedType[1]+'%'}}</div>
        </div>
        <div class="percent-container">
          <div class="percent-title">黄V</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: verifiedType[2]+'%'}"></div>
          </div>
          <div class="percent-text">{{verifiedType[2]+'%'}}</div>
        </div>
      </li>
      <li>
        <div class="title">水军比例</div>
        <div class="percent-container">
          <div class="percent-title">水军</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: zombie[0]+'%'}"></div>
          </div>
          <div class="percent-text">{{zombie[0]+'%'}}</div>
        </div>
        <div class="percent-container">
          <div class="percent-title">普通</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: zombie[1]+'%'}"></div>
          </div>
          <div class="percent-text">{{zombie[1]+'%'}}</div>
        </div>
      </li>
      <li>
        <div class="title">转发层级</div>
        <div class="percent-container" v-for="(dep,$index) in deep">
          <div class="percent-title">{{$index === 5 ?'>='+($index+ 1) : $index+ 1}}</div>
          <div class="percent-content">
            <div class="percent-inner" :style="{width: dep+'%'}"></div>
          </div>
          <div class="percent-text">{{dep + '%'}}</div>
        </div>
       
      </li>
      <li class="table">
        <div class="title">重要节点</div>
        <div class="subtitle">
          <div class="key">转发账号数量</div>
          <div class="value">{{account[0]}}</div>
        </div>
        <div class="table-head">
          <div class="table-th">用户名</div>
          <div class="table-th">提及数</div>
          <div class="table-th">粉丝数</div>
          <div class="table-th">被转数</div>
        </div>
        <div class="table-body">
          <div class="table-tr" v-for="ac in account[1]">
            <div class="table-td">{{ac && string_format(ac.username) }}</div>
            <div class="table-td">{{ac && string_format(ac.comments_count) }}</div>
            <div class="table-td">{{ac && string_format(ac.followers_count) }}</div>
            <div class="table-td">{{ac && string_format(ac.children.length) }}</div>
          </div>
        </div>
      </li>
    </ul>
</div>
</template>

<script>
export default {
  components: {
  },
  data(){
    return{
      uid_list:null,
    }
  },
  computed:{
    isShow(){
      return this.$store.state.tool.show;
    },
    orientation(){
        let loaded = this.$store.state.header.loaded;
        
        if(loaded){
          return codeflower.vue_orientation();
        }
        return [0,0];
    },
    gender(){
        let loaded = this.$store.state.header.loaded;
        if(loaded){
          return codeflower.vue_gender();
        }
        return [0,0];
    },
    verifiedType(){
        let loaded = this.$store.state.header.loaded;
        if(loaded){
          return codeflower.vue_verify();
        }
        return [0,0,0];
    },

    zombie(){
      return [0,0]
    },

    deep(){
       let loaded = this.$store.state.header.loaded;
       if(loaded){
          return codeflower.vue_deep();
       }
       return [0,0,0,0,0,0];
    },
    /*  先计算 主节点 
          选取规则:直接点转发节点 大于 size * 0.01
    
    */   
    account(){
      let loaded = this.$store.state.header.loaded;
      if(loaded){
        return codeflower.vue_account();
      }
      return ['0',null];
    }
  },
  methods:{
      string_format(number){
        if(number>10000){
          return (number/10000).toFixed(2) + 'w'; 
        }
        return number;
      }
  },

}
</script>

<style>

</style>