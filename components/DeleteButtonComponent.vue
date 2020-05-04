<template>
    <v-btn color="rgb(117, 31, 8)" fab x-small @click="onClick($event)">
        <v-icon>mdi-close</v-icon>
    </v-btn>
</template>

<script>
    export default {
        name: "DeleteButtonComponent",
        methods: {
            onClick(e) {
                this.$emit('click', e);
            }
        }
    }
</script>

<style scoped>

</style>