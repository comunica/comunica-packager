<template>
    <button id="btn" @click="onClick($event)">
        {{text}}
    </button>
</template>

<script>
    export default {
        name: "ButtonComponent",
        props: {
            text: {
                type: String,
                default: 'Placeholder button'
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
    #btn {
        color: white;
        background: $comunica-dark-red;
        padding: 15px 32px;
        text-align: center;
        border-radius: 10px;
        font-size: 16pt;
    }
</style>