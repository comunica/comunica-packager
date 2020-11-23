<template>
    <div id="container">
        <nav id="header">
            <LogoComponent/>
            <div id="input">
                <div id="buttons">
                    <a v-if="!isPresetLoading" class="button-top" href="#" @click.prevent="imp = !imp">Import config</a>
                    <LoadingComponent v-else/>
                    <div v-if="imp" class="dd-import">
                        <p class="preset" v-for="preset in presets" @click="onImport(preset)">
                            {{preset.name}}
                        </p>
                    </div>
                    <LoadingComponent v-if="isExporting"/>
                    <a class="button-top" href="#" v-else @click.prevent="onExport">Export config</a>
                    <FileInputComponent text="Upload config" @click="onUpload"/>
                    <a class="button-top" href="#" @click.prevent="onReset">Reset</a>
                </div>
            </div>
        </nav>
        <div id="sidebar">
            <p class="text-medium">Package information</p>
            <PackageInformationComponent/>
            <p class="text-medium">Sets</p>
            <SetsComponent/>
        </div>
        <div v-if="!isCurrentSetLoading" id="body">

            <div id="content">
                <div class="column" style="margin-right: 10px;" v-if="busGroups">
                    <p class="text-large">Actors</p>
                    <ActorsComponent style="margin-top: 20px;"/>
                </div>
                <div class="column" style="margin-left: 10px;">
                    <p class="text-large">Mediators</p>
                    <MediatorComponent v-if="areMediatorsFetched" style="margin-top: 20px;"/>
                    <LoadingComponent v-else/>
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
        <LoadingComponent :size="100" v-else id="load-main"/>

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
import {getExpandedIRI, parseContext} from "@/utils/json";
import {handleParameters} from "@/middleware/packages";
import {extractLabel} from "@/utils/alpha";
import LoadingComponent from "../components/LoadingComponent";
import SetsComponent from "@/components/SetsComponent";
import PackageInformationComponent from "@/components/PackageInformationComponent";
import ModalComponent from "@/components/ModalComponent";

export default {
    components: {
        PackageInformationComponent,
        SetsComponent,
        LoadingComponent,
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
            actorLink: undefined,
            imp: false,
            areMediatorsFetched: false,
            isExporting: false,
        }
    },
    computed: {
        busGroups() {
            return this.$store.state.busGroups;
        },
        isPresetLoading() {
            return this.$store.state.isPresetLoading;
        },
        isCurrentSetLoading() {
            for (const set of this.$store.state.sets) {
                if (set.name === this.$store.state.currentSet)
                    return !set.loaded
            }
        },
        presets() {
            const rawPresets = this.$store.state.appConfig.presets;
            return Object.keys(rawPresets).map(a => {
                        return {
                            name: a,
                            url: rawPresets[a]
                        };
                    });
        }
    },
    methods: {
        onUpload(file) {
            this.$store.dispatch('uploadZip', file);
        },
        async onImport(preset) {
            this.imp = false;
            this.$store.commit('setStateEntry', {
                key: 'persistUrl',
                value: true
            });
            let currQuery = _.cloneDeep(this.$router.currentRoute.query);
            currQuery.preset = preset.name;
            await this.$router.replace({
                query:  currQuery
            });
            await this.$store.dispatch('importPreset', preset.url);
        },
        async onExport() {
            this.isExporting = true;
            await this.$store.dispatch('downloadZip');
            this.isExporting = false;
        },
        onReset() {
            this.$modal.show(ModalComponent, {
                topText: 'Reset configuration',
                question: 'Are you sure you want to reset the current configuration?',
                onConfirm: 'resetState'
            });
        }
    },
    async mounted () {

        // Every mediator has a bus parameter
        const mediatorSuperParameter = {
            "@id": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/core/Mediator/bus",
            "comment": "The bus this mediator will mediate over.",
            "range": "cc:Bus",
            "unique": true,
            "required": true
        };

        // Every number mediator has these parameters
        const numberSuperParameters = [
            {
                "@id": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/mediator-number/Mediator/Number/field",
                "comment": "The field name to mediate over",
                "range": "xsd:string",
                "unique": true,
                "required": true
            },
            {
                "@id": "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/mediator-number/Mediator/Number/ignoreErrors",
                "comment": "If actors that throw test errors should be ignored",
                "range": "xsd:boolean",
                "unique": true,
                "required": true,
                "default": false
            }
        ];

        const mediatorPackages = this.$store.state.mediatorPackages;
        const mediatorsList = [];


        for (const m of mediatorPackages) {
            const mediatorComponents = await this.$axios.$get(`https://linkedsoftwaredependencies.org/bundles/npm/@comunica/${m}/^1.0.0/components/components.jsonld`);
            const mediatorPackageContext = await parseContext(mediatorComponents['@context']);
            const mediatorComponentsExpanded = mediatorComponents['import']
                .map(i => getExpandedIRI(mediatorPackageContext, i));
            for (const mediatorURL of mediatorComponentsExpanded) {

                const mediatorJson = await this.$axios.$get(mediatorURL);
                const mediatorComponent = mediatorJson.components[0];
                const normalizedContext = await parseContext(mediatorJson['@context']);
                const parameters = {}

                handleParameters(normalizedContext, parameters, [mediatorSuperParameter]) ;

                if (mediatorComponent.extends && mediatorComponent.extends !== 'cc:Mediator') {
                    handleParameters(normalizedContext, parameters, numberSuperParameters);
                } else {
                    if (mediatorComponent.parameters)
                        handleParameters(normalizedContext, parameters, mediatorComponent.parameters);
                }

                for (let p of Object.keys(parameters))
                    if (parameters[p].hasOwnProperty('default'))
                        parameters[p].value = parameters[p].default;

                mediatorsList.push({
                    context: mediatorJson['@context'],
                    name: extractLabel(mediatorComponent['@id']) ,
                    parameters: parameters,
                });
            }
        }

        this.$store.commit('addMediators', mediatorsList);
        this.areMediatorsFetched = true;
        localStorage.setItem('areMediatorsFetched', 'true');

        const currQuery = this.$route.query;
        if (currQuery.preset) {
            this.$store.commit('setStateEntry', {
                key: 'isPresetLoading',
                value: true
            });
            for (const preset of this.presets) {
                if (preset.name === currQuery.preset) {
                    await this.onImport(preset);
                    if (currQuery.set) {
                        this.$store.commit('setSelectedSet', currQuery.set);
                    }
                }
            }
            this.$store.commit('setStateEntry', {
                key: 'isPresetLoading',
                value: false
            });
        }
    }
}
</script>

<style scoped lang="scss">

    #container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    #header {
        position: fixed;
        top: 0;
        height: 75px;
        background-color: $comunica-red;
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;
        width: 100%;
        z-index: 5;
    }
    #input {
        display: grid;
        place-items: center;
    }

    #buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        place-items: center;
        grid-gap: 20px;
    }

    #logo {
        max-width: 130px;
        max-height: 185px;
    }

    #body {
        margin-top: 75px;
        margin-left: max(15vw, 250px);
        flex: 1;
        color: black;
        background-color: white;
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 75px);
    }

    #load-main {
        margin-top: 100px;
        color: black;
        margin-left: max(15vw, 250px);
        align-self: center;
    }

    #sidebar {
        color: black;
        position: fixed;
        //bottom: max(5vh, 40px);
        bottom: 0;
        top: 75px;
        width: max(15vw, 250px);
        padding: 20px 20px;
        border-right: 1px solid $comunica-border;
        overflow-y: auto;
    }

    #content {
        padding: 20px 20px;
        color: black;
        display: flex;
        flex: 1;
    }

    .column {
        margin: 0 10px;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    @media screen and (max-width: 1000px) {
        #content {
            flex-direction: column;
        }

        .column {
            margin: 10px 0 !important;
        }
    }

    #footer {
        width: 100%;
        text-align: center;
        height: max(5vh, 40px);
        display: grid;
        grid-template-columns: 1fr 1fr;
        place-items: center;
        grid-gap: 20px;
        padding: 0 25%;
        z-index: 100;
        background-color: $comunica-red;
    }

    a {
        color: white;
        text-decoration: none;
        font-weight: bold;
        border-bottom: 2px solid transparent;
    }

    a:hover {
        border-bottom: 2px solid white;
    }

    .dd-import {
        padding: 10px 0;
        position: absolute;
        top: 60px;
        color: black;
        z-index: 5;
        background: lightgray;
        border-radius: 10px;
        border: 1px solid $comunica-border;
    }

    .preset {
        line-height: 30px;
        padding: 0 10px;
    }

    .preset:hover {
        cursor: pointer;
        background: #79AAFC;
    }

</style>
