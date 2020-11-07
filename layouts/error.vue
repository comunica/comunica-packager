<template>
    <div id="error">

        <h1>{{error.statusCode}}</h1>
        <h2>Error message: {{error.message}}</h2>
        <a @click="refresh()" href="#">Refresh page</a>

    </div>
</template>

<script>
    export default {
        layout: 'empty',
        props: {
            error: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
            };
        },
        head() {
            return 'An error has occurred';
        },
        methods: {
            refresh() {
                location.reload();
            }
        }
    }
</script>

<style scoped lang="scss">
    #error {
        display: grid;
        place-items: center;
        color: $comunica-red;
        margin-top: 30vh;
    }

    h1 {
        margin-bottom: 5vh;
    }

    h2 {
        margin-bottom: 3vh;
    }
</style>
