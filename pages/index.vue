<template>
    <div id="container">
        <div id="header">
            <LogoComponent/>
            <div id="buttons">
                <ButtonComponent text="Import" @click="presets"/>
                <ButtonComponent text="Export" @click="onExport"/>
                <FileInputComponent text="Upload" @click="onUpload"/>
                <ButtonComponent text="Reset" @click="onReset"/>
            </div>
        </div>
        <div v-if="imp" id="preset-selector" class="dropdown-layout">
<!--            <DropdownComponent-->
<!--                v-model=""-->
<!--            />-->
            <ButtonComponent :disabled="!presetActor" :is-small="true" text="Import" @click="onImport"/>
        </div>
        <div id="content">
            <div class="column" style="margin-right: 10px;" v-if="busGroups">
                <p class="text-large">Actor</p>
                <ActorsComponent style="margin-top: 20px;"/>
            </div>
            <hr style="height:2px;border-width:0;color:gray;background-color:white;border-radius:2px">
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
    import LogoComponent from "../components/LogoComponent";
    import DropdownComponent from "../components/DropdownComponent";

    export default {
        components: {
            DropdownComponent,
            LogoComponent,
            FileInputComponent,
            ActorsComponent,
            MediatorComponent,
            BusGroupComponent,
            ButtonComponent
        },
        middleware: ['packages'],
        data () {
            return {
                presetActor: undefined,
                imp: false
            }
        },
        computed: {
            busGroups() {
                return this.$store.state.busGroups;
            },
        },
        methods: {
            onUpload(file) {
                this.$store.dispatch('uploadZip', file);
            },
            onImport() {
                this.presetDialog = true;
            },
            onExport() {
                this.$store.dispatch('downloadZip');
            },
            onReset() {
                this.$store.commit('resetState');
            },
            presets() {
                return this.$axios.$get('/comunica-packager/presets.json');
            }
        }
    }
</script>

<style scoped lang="scss">

    #container {
        height: 100%;
    }

    #header {
        background-color: $comunica-dark-red;
        display: flex;
        justify-content: space-between;
        padding: 20px 20px;
        border-radius: 0 0 15px 15px;
    }

    #buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        place-items: center;
        grid-gap: 10px;
    }

    #logo {
        max-width: 130px;
        max-height: 185px;
    }

    #content {
        display: flex;
        margin: 5% 0;
    }

    .column {
        margin: 0 10px;
    }

    @media screen and (max-width: 900px) {
        #content {
            flex-direction: column;
        }

        .column {
            margin: 10px 0 !important;
        }
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
        padding: 0 25%;
    }

    a {
        color: white;
    }
</style>
