<template>
    <div>
        <div id="drop" @dragenter="handleDragover" @dragover="handleDragover" @drop="handleDrop">
            Drop a spreadsheet file here to see sheet data</div>
        <div class="task_table" v-if="result">
            <div class="field">
                <p class="control">
                    <span class="select is-medium">
                        <select v-model="cur_sheet" @change="onchange">
                            <option v-for="(value,key) in result" :value="key">{{key}}</option>
                        </select>
                        </span>
                </p>
            </div>
            <div class="field is-grouped">
                <p class="control">
                    <a class="button is-small is-primary" @click="to_lauch">
                        启动任务
                        </a>
                </p>
                <p class="control">
                    <a class="button is-small is-primary" @click="to_check">
                        检测任务
                        </a>
                </p>
                <p class="control">
                    <a class="button is-small is-success"  download="weibo.zip" @click="to_excel($event)">
                        获取Excel
                        </a>
                </p>
                <p class="control">
                    <a class="button is-small is-danger" @click="to_delete">
                        删除数据
                        </a>
                </p>
            </div>
            <table class="table">
                <thead class="look_nice">
                    <tr>
                        <th><abbr>Num</abbr></th>
                        <th>
                            <div class="field">
                                <p class="control">
                                    <label class="checkbox">
                            <input type="checkbox" name="choise"  @click="check_all($event)">
                            </label>
                                </p>
                            </div>
                        </th>
                        <th v-for="(value, key) in result && result[cur_sheet][0]" v-if="key !== 'checked' && key !== 'status'"><abbr>{{key}}</abbr></th>
                        <th><abbr>任务进度</abbr></th>
                        <th><abbr>任务描述</abbr></th>
                    </tr>
                </thead>
                <tfoot class="look_nice">
                    <tr>
                        <th><abbr>Num</abbr></th>
                        <th>
                        </th>
                        <th v-for="(value, key)  in result && result[cur_sheet][0]" v-if="key !== 'checked' && key !== 'status'"><abbr>{{key}}</abbr></th>
                        <th><abbr>任务进读</abbr></th>
                        <th><abbr>任务描述</abbr></th>
                    </tr>
                </tfoot>
    
                <tbody>
                    <tr v-for="(item,index) in result && result[cur_sheet]">
                        <td>{{index+1}}</td>
                        <td>
                            <div class="field">
                                <p class="control">
                                    <label class="checkbox">
                            <input type="checkbox" name="choise" :checked="item.checked || false" @click="oncheck($event, index)">
                            </label>
                                </p>
                            </div>
                        </td>
                        <td v-for="(value, key) in item" v-if="key !== 'checked' && key !== 'status'">
                            <div v-if="key === url_alias || key === '微博链接'" class="url_nowrap">
                                <a :href="value" :title="value" target="blank">{{value}}</a>
                            </div>
                            <div v-else>
                                {{value}}
                            </div>
                        </td>
                        <td><progress class="progress is-primary" :value="((item.status && item.status.progress) |0)" max="100">
                                {{(item.status && item.status.progress) |0 +"%"}}</progress></td>
                        <td>{{(item.status && (item.status.message || item.status.status )) || '等待激活'}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <pre id="out"></pre>
        <!--<script src="lib/export/dargsheet.js">
    
</script>-->
<script src="lib/export/shim.js">
    
</script>
    
<script src="lib/export/xlsx.full.min.js">
    
</script>
    </div>
</template>

<script>
    import axios from '~plugins/axios'
    export default {
        components: {},
    
        data() {
            return {
                compatible: {
                    rABS: false,
                    worker: false,
                    transferable: false,
                },
                X: null,
                result: null,
                cur_sheet: '',
                detection: {},
                timer: null,
                watch: null,
                url_alias:'链接',
            }
        },
        methods: {
            /************** 输出格式 *******************/
            to_json(workbook) {
                var result = {};
                var _self = this;
                workbook.SheetNames.forEach((sheetName) => {
                    var roa = this.X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    if (roa.length > 0) {
                        result[sheetName] = roa;
                    }
                });
                return result;
            },
    
            to_csv(workbook) {
                var result = [];
                workbook.SheetNames.forEach((sheetName) => {
                    var csv = this.X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
                    if (csv.length > 0) {
                        result.push("SHEET: " + sheetName);
                        result.push("");
                        result.push(csv);
                    }
                });
                return result.join("\n");
            },
    
            to_formulae(workbook) {
                var result = [];
                workbook.SheetNames.forEach((sheetName) => {
                    var formulae = this.X.utils.get_formulae(workbook.Sheets[sheetName]);
                    if (formulae.length > 0) {
                        result.push("SHEET: " + sheetName);
                        result.push("");
                        result.push(formulae.join("\n"));
                    }
                });
                return result.join("\n");
            },
    
            /*******格式转换********/
            fixdata(data) {
                var o = "",
                    l = 0,
                    w = 10240;
                for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                return o;
            },
    
            // ab2str(data) {
            //     var o = "",
            //         l = 0,
            //         w = 10240;
            //     for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
            //     o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
            //     return o;
            // },
    
            // s2ab(s) {
            //     var b = new ArrayBuffer(s.length * 2),
            //         v = new Uint16Array(b);
            //     for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
            //     return [v, b];
            // },
            /********检测是否兼容*********/
            check_compatible() {
                // 兼容浏览器 FileReader
                let rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
                if (rABS) {
                    this.compatible.rABS = rABS;
                }
                // 兼容 浏览器  Work transferable
                let use_worker = typeof Worker !== 'undefined';
                if (use_worker) {
                    this.compatible.worker = use_worker;
                    this.compatible.transferable = use_worker;
                }
            },
    
            /************darg event**************/
            handleDrop(e) {
                e.stopPropagation();
                e.preventDefault();
                var files = e.dataTransfer.files;
                var _self = this;
                var f = files[0]; {
                    var reader = new FileReader();
                    var name = f.name;
                    reader.onload = function(e) {
                        if (typeof console !== 'undefined') console.log("onload", new Date(), _self.compatible.rABS);
                        var data = e.target.result;
                        var wb;
                        if (_self.compatible.rABS) {
                            wb = _self.X.read(data, {
                                type: 'binary'
                            });
                        } else {
                            var arr = _self.fixdata(data);
                            wb = _self.X.read(btoa(arr), {
                                type: 'base64'
                            });
                        }
                        console.log('wb', wb)
                        // let output = JSON.stringify(_self.to_json(wb), 2, 2);
                        _self.result = _self.to_json(wb);
                        _self.init(_self.result);
                        console.log('result', _self.result);
                    };
                    if (_self.compatible.rABS) reader.readAsBinaryString(f);
                    else reader.readAsArrayBuffer(f);
                }
            },
            handleDragover(e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            },
            init(result) {
                console.log('result', result, this)
                this.cur_sheet = Object.keys(result)[0];
                for (let key in result) {
                    this.$set(this.detection, key, false);
                }
            },
            oncheck(e, index) {
                console.log('[event , inde]', e, index)
                this.$set(this.result[this.cur_sheet][index], 'checked', e.target.checked);
            },
    
            onchange() {
                console.log(this.cur_sheet)
                clearInterval(this.timer);
            },
            check_all(e) {
                for (let i = 0; i < this.result[this.cur_sheet].length; i++) {
                    this.$set(this.result[this.cur_sheet][i], 'checked', e.target.checked);
                }
            },
    
            checked_ctx() {
                let urls = [];
                for (let i = 0; i < this.result[this.cur_sheet].length; i++) {
                    if (this.result[this.cur_sheet][i].checked) {
                        urls.push(this.result[this.cur_sheet][i][this.url_alias]);
                    }
                }
                return urls;
            },

           interval(cb, time){
                let timer = null;
                let run =  function(){
                    timer = setInterval(cb, time);
                }
                run();
                return timer;
          },
    
            /**
             * status key   value
             *        url   status
             */
            set_status(status,sheet) {
                for (let i = 0; i < this.result[sheet].length; i++) {
                    let data = status[this.result[sheet][i][this.url_alias]];
                    if (data) {
                        this.$set(this.result[sheet][i], 'status', data);
                    }
                }
            },
            //  定时器请求状态
            to_status(){
                // let urls = this.result[this.cur_sheet].map((d)=>{
                //     return d[this.url_alias];
                // })
                let urls = this.checked_ctx();
                axios.post("/bstatus.json",{
                    urls:urls,
                    sheet: this.cur_sheet
                }).then(res=>{
                    this.set_status(res.data.data,res.data.sheet);
                    if(res.data.status == "complete"){
                        console.log("任务全部完成， 停止定时器");
                        clearInterval(this.timer);
                    }
                }).catch((e)=>{
                    throw(e);
                })
            },
            //  当 状态全部为 complete时 清除定时器
            // to_clear(){
            //     let len = this.result[this.cur_sheet].length;
            //     let len1 = this.result[this.cur_sheet].filter((d)=>{
            //         return d.status && d.status.status === "complete"
            //     }).length;
            //     if(len === len1){
            //         clearInterval(this.watch);
            //         clearInterval(this.timer);
            //     }
            // },
            // button event 
            async to_lauch() {
                clearInterval(this.timer);
                let urls = this.checked_ctx();
                if (urls.length < 1) return;
                try {
                    let result = await axios.post('/batch.json', {
                        'urls': urls
                    });
                    this.timer = this.interval(()=>{this.to_status()}, 1000);
                    // this.watch = this.interval(()=>{this.to_clear()}, 5000);
                    console.log("======> ok");
    
                } catch (e) {
                    this.$message.error('操作失败!');
                }
            },

            async to_check() {
                let urls = this.checked_ctx();
                if (urls.length < 1) return;
                // this.timer = this.interval(()=>{console.log(this.cur_sheet)},1000)
                try {
                    let result = await axios.post('/check.json', {
                        'urls': urls,
                        'sheet':this.cur_sheet,
                    });
                    console.log("result===>", result);
                    this.set_status(result.data.data, result.data.sheet);
                } catch (e) {
                    console.log(e);
                    this.$message.error('操作失败!');
                }
            },
            async to_excel(e) {
                let urls = this.checked_ctx();
                if (urls.length < 1) return;
                console.log(e)
                try {
                    let result = await axios.post("/bexport.json",{
                        urls:urls
                    })
                    if(result.data.status == "success"){
                        window.open(result.data.path,"下载");
                    }
                    console.log(result.data);
                } catch (e) {
                    console.log(e);
                    this.$message.error('操作失败!');
                }
            },
            async to_delete() {
                let urls = this.checked_ctx();
                if (urls.length < 1) return;
                try {
                    let result = await axios.post('/bdelete.json', {
                        'urls': urls
                    });
                    this.$message({
                        message: result.data.message,
                        type: result.data.status
                    })
                } catch (e) {
                    this.$message.error('操作失败!');
                }
            },
        },
        mounted() {
            this.X = XLSX;
            this.check_compatible();
        }
    }
</script>

<style scoped>
    @import '~assets/style/bulma.min.css';
    #drop {
        border: 2px dashed orange;
        -moz-border-radius: 5px;
        -webkit-border-radius: 5px;
        border-radius: 5px;
        padding: 25px;
        text-align: center;
        font: 20pt bold, "Vollkorn";
        color: #bbb;
        margin: 20px;
    }
    
    .task_table {
        border: 2px solid #ffdd57;
        border-top-right-radius: 3px;
        color: rgba(0, 0, 0, 0.7);
        padding: 1.5rem;
        position: relative;
        margin: 20px;
        background: white;
        -moz-border-radius: 5px;
        -webkit-border-radius: 5px;
        font-size: 10px;
    }
    
    .table th {
        color: deepskyblue;
    }
    
    .table {
        margin-bottom: 0;
    }
    
    .url_nowrap {
        width: 300px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
