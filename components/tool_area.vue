<template>
   <div class="main-tool">
    <ul>
      <li @click="on_click(0)" :class="[(full_screen?'zoom_in':'zoom_out'),(is_active&1?'active':'')]"></li>
      <!--<li @click="on_click(1)" :class="['rotate']"></li>-->
      <li @click="on_click(1)" :class="['pencil', (is_active&1?'active':'')]"></li>
    </ul>
    </div>
</template>

<script>
export default {
  components: {
  },

  data(){
    return {
      full_screen: true,
      is_active: 0,
      record:{
        old: -2,
        current: -1,
        selected: false,
      },
      cursors:[
        'init_cursor',
        // 'init_cursor',
        'pencil_cursor',
      ],
    }
  },
  methods:{
    on_click(index){
        let loaded = this.$store.state.header.loaded;
        if(loaded){
            this.is_active = 1<<index;
          if(index === 0){
                  this.full_screen = !this.full_screen;
              if(!this.full_screen){
                  this.$store.state.tool.show='none';
              }else{
                  this.$store.state.tool.show='block';
              }
              this.$store.state.tool.cursor = this.cursors[0];
          }else{
              this.record.old  = this.record.current;
              this.record.current = index;
              let rotate_clockwise = this.$store.state.header.rotate_clockwise;
              if(this.record.old === this.record.current){
                  this.record.selected = false;
                  this.is_active = 0;
                  this.record.current = -1;
                  this.$store.state.tool.cursor = this.cursors[0];
                  this.inactive_tool(index);
              }else{
                  this.record.selected = true;
                  this.$store.state.tool.cursor = this.cursors[index];
                  this.active_tool(index);
              }

          }
      }
    },
    inactive_tool(index){
      switch(index){
        // case 1: 
        //   this.$store.state.header.codeflower.rotate_clockwise(); 
        //   break;
        case 1: 
          this.$store.state.tool.pencil_zindex = 0; 
          break;
      }
    },
    active_tool(index){
      switch(index){
        // case 1: 
        //   this.$store.state.header.codeflower.rotate_clockwise(); 
        //   break;
        case 1: 
          this.$store.state.tool.pencil_zindex = 50; 
          break;
      }
    }
  }
}
</script>

<style>
</style>