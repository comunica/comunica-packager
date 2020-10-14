<template>
    <div id="loading">
        <v-progress-circular
                indeterminate
                color="primary"
                :size="size"
        ></v-progress-circular>
    </div>

</template>

<script>
    export default {
        name: "LoadingComponent",
        props: {
            size: {
                type: Number,
                default: 32
            }
        }
    }
</script>

<style scoped>
    #loading {
        display: grid;
        place-items: center;
        justify-content: center;
    }
</style>