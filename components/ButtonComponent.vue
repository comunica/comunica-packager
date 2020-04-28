<template>
    <button id="btn" :class="isSmall ? 'small ' : 'large'" @click="onClick($event)">
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
            },
            isSmall: {
                type: Boolean,
                default: false
            },
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
        text-align: center;
        border-radius: 8px;
    }

    .small {
        font-size: 12pt;
        background: $comunica-red;
        padding: 7px 16px;
    }

    .large {
        font-size: 16pt;
        background: $comunica-dark-red;
        padding: 15px 32px;
    }
</style>