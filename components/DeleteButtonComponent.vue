<template>
    <v-btn color="rgb(255, 255, 255)" icon @click="onClick($event)">
        <v-icon>mdi-close-circle</v-icon>
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