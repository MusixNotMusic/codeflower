<template>
    <div style="position:absolute;" :class="[$store.state.tool.cursor,'main-mid']">
    <span>
    <div style="position: relative; height:100%">
    <svg id="drawLine" width="100%" height="100%" :style="{'position':'absolute','z-index':$store.state.tool.pencil_zindex}">
        <rect fill-opacity="0" width="100%" height="100%"></rect>
    </svg>
    <canvas  id="precircle" style="position:absolute; height:819px; width:100%"></canvas>
    <canvas  id="loop" style="position:absolute; width:678px; height:819px;" ></canvas>
    <canvas  id="console" style="position:absolute; width:678px; height:819px;"></canvas>
     <canvas  id="base" style="position:absolute; width:678px; height:819px;"></canvas>
        <div style="display: none; position: absolute;" class="content_mousemove_message" id="move_message">
                <!-- <div class="content_mousemove_message" id="move_message"> -->
                    <div id="userId" class="user_id_message"></div>
                    <div id="userComments" class="user_content_message"></div>
                <!-- </div> -->
        </div>
    </div>
        <!-- dialog window -->
    <div id="dialog" class="dialog" style="display: none;">
                <div class="dialog-title">
                    <img class="image"  id="picture" align="middle">
                    <span align="center" class="username">
                        <a href="#" id="username" target="_blank"></a>
                    </span>
                    <i class="fa fa-close" id='close' align="center"></i>
                    <!-- <i class="fa fa-link" id="link" align="center"></i> -->
                </div>
                <div class="container">
                <div class="dialog-content" id="content">
                </div>
                <div class="dialog-assist">
                    <span id="relay">直接转发: 25</span>
                    <span id="comments">评论: 9</span>
                    <span id="fans">粉丝: 712285</span>
                </div>
                </div>
    </div>
    </span>
    <script src="hidpi-canvas.min.js"></script>
    <script src="d3.js"></script>
    <script src="jsfr.js"></script>
    <script src="codeflower_backup.js"></script>
     </div> 
</template>

<script>
export default {

  components: {
  },
  data(){
    return{

    }
  },

  computed:{
  
  },

  methods:{
  },
  mounted(){
  } 
}
</script>

<style>
    .init_cursor{
        cursor: default;
    }
    .pencil_cursor{
        cursor: url(~assets/images/pencil.png), auto;
    }
</style>