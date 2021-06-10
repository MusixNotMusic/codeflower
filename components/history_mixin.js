export default {
    methods: {
        records: function(type, state, target) {
            let record = {};
            record.name = type;
            record.content = state;
            record.target = target;
            this.$store.state.header.history.stack.unshift(record);
            this.$store.state.header.history.target = record;
        }
    }
}