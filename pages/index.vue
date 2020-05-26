<template>
    <div id="container">
        <div id="header">
            <img id="logo" src="comunica_white.svg"/>
            <FileInputComponent text="New engine"/>
            <ButtonComponent text="Generate engine" @click="onGenerateEngine"/>
            <ButtonComponent text="Reset engine" @click="onResetEngine"/>
        </div>
        <div id="content">
            <div class="column" style="margin-right: 10px;" v-if="busGroups">
                <h1>Actors</h1>
                <ActorsComponent style="margin-top: 20px;"/>
            </div>
            <div class="column" style="margin-left: 10px;">
                <h1>Mediators</h1>
                <MediatorComponent style="margin-top: 20px;"/>
            </div>
        </div>
    </div>
</template>

<script>

    import ButtonComponent from "~/components/ButtonComponent.vue";
    import BusGroupComponent from "~/components/BusGroupComponent.vue";
    import MediatorComponent from "../components/MediatorsComponent";
    import ActorsComponent from "../components/ActorsComponent";
    import FileInputComponent from "../components/FileInputComponent";

    export default {
        components: {
            FileInputComponent,
            ActorsComponent,
            MediatorComponent,
            BusGroupComponent,
            ButtonComponent
        },
        middleware: ['packages'],
        data () {
            return {}
        },
        computed: {
            busGroups() {
                return this.$store.state.busGroups;
            },
        },
        methods: {
            onNew() {
                console.log('TODO: open existing config file');
            },
            onGenerateEngine() {
                this.$store.dispatch('downloadZip');
            },
            onResetEngine() {

            }
        }
    }
</script>

<style scoped lang="scss">
    #container {
        height: 100%;
    }
    #header {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        place-content: center;
        place-items: center;
        margin: 0 10%;
    }
    #logo {
        max-width: 130px;
        max-height: 185px;
    }
    #content {
        display: flex;
        margin: 10% 0;
    }
    .column {
        flex: 50%;
    }
</style>
