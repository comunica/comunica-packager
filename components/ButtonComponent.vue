<template>
    <button :disabled="disabled" id="btn" :class="isSmall ? 'small ' : 'large'" @click="onClick($event)">
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
            disabled: {
                type: Boolean,
                default: false
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
        text-align: center;
        border-radius: 8px;
    }

    .small {
        font-size: max(1vmin, 11pt);
        background: $comunica-red;
        padding: 7px 16px;
    }

    .large {
        font-size: max(2vmin, 13pt);
        background: $comunica-red;
        padding: 15px 32px;
    }
</style>