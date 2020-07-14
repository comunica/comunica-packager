<template>
    <div id="loading">
        <v-progress-circular
                indeterminate
                color="primary"
        ></v-progress-circular>
    </div>

</template>

<script>
    export default {
        name: "LoadingComponent"
    }
</script>

<style scoped>
    #loading {
        display: grid;
        place-items: center;
        justify-content: center;
    }
</style>