import Vuex from 'vuex'

const store = new Vuex.Store({
    state: {
        src: null,
        childTable: null,
        size: 1,
        codeflower: null,
        total: -1,
        loaded: false,
        share: true,
        history: {
            stack: [],
        },
        url: "",
    }
})

export default store