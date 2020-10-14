<template>
    <v-btn color="#9D2D11" icon @click="onClick($event)">
        <v-icon>{{iconTag}}</v-icon>
    </v-btn>
</template>

<script>
    export default {
        name: "IconButtonComponent",
        props: {
            iconTag: {
                type: String,
                default: ''
            }
        },
        methods: {
            onClick(e) {
                this.$emit('click', e);
            }
        }
    }
</script>

<style scoped lang="scss">
</style>