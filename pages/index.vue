<template>
    <div id="container">
        <div id="header">
            <img id="logo" src="comunica_white.svg"/>
            <FileInputComponent text="Import" @click="onNew"/>
            <ButtonComponent text="Export" @click="onGenerateEngine"/>
            <ButtonComponent text="Reset" @click="onResetEngine"/>
        </div>
        <div id="content">
            <div class="column" style="margin-right: 10px;" v-if="busGroups">
                <p class="text-large">Actor</p>
                <ActorsComponent style="margin-top: 20px;"/>
            </div>
            <div class="column" style="margin-left: 10px;">
                <p class="text-large">Mediators</p>
                <MediatorComponent style="margin-top: 20px;"/>
            </div>
        </div>
        <div id="footer">
            <div>
                <v-icon dark>mdi-xml</v-icon>
                <a href="https://github.com/comunica/comunica-packager">Source code</a>
            </div>
            <div>
                <v-icon dark>mdi-bug</v-icon>
                <a href="https://github.com/comunica/comunica-packager/issues">Report a bug</a>
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
            onNew(file) {
                this.$store.dispatch('uploadZip', file);
            },
            onGenerateEngine() {
                this.$store.dispatch('downloadZip');
            },
            onResetEngine() {
                this.$store.commit('resetState');
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

    #footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        text-align: center;
        background-color: $comunica-dark-red;
        height: 5vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
        place-items: center;
        grid-gap: 20px;
        padding: 0 30%;
    }

    a {
        color: white;
    }
</style>
