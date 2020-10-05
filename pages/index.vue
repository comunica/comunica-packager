<template>
    <div id="container">
        <nav id="header">
            <LogoComponent/>
            <div id="input">
                <div id="buttons">
                    <a class="button-top" href="#" @click.prevent="imp = true">Import</a>
                    <LoadingComponent v-if="isExporting"/>
                    <a class="button-top" href="#" v-else @click.prevent="onExport">Export</a>
                    <FileInputComponent text="Upload" @click="onUpload"/>
                    <a class="button-top" href="#" @click.prevent="onReset">Reset</a>
                </div>
                <div v-if="imp" id="preset-selector" class="dropdown-layout">
                    <DropdownComponent
                        v-model="actorLink"
                        :options="presets"
                        placeholder="Choose preset"
                        label="name"
                        reduce="url"
                    />
                    <ButtonComponent v-if="!isPresetLoading" :disabled="!actorLink" :is-small="true" text="Import" @click="onImport"/>
                    <LoadingComponent v-else/>
                </div>
            </div>
        </nav>
        <div id="body">
            <div id="sidebar">
<!--                <p class="text-medium">Package information</p>-->
<!--                <PackageInformationComponent/>-->
<!--                <hr>-->
                <p class="text-medium">Sets</p>
                <SetsComponent/>
            </div>
            <div id="content">
                <div class="column" style="margin-right: 10px;" v-if="busGroups">
                    <p class="text-large">Actors</p>
                    <ActorsComponent style="margin-top: 20px;"/>
                </div>
                <hr style="height:2px;border-width:0;color:gray;background-color:white;border-radius:2px">
                <div class="column" style="margin-left: 10px;">
                    <p class="text-large">Mediators</p>
                    <MediatorComponent v-if="areMediatorsFetched" style="margin-top: 20px;"/>
                    <LoadingComponent v-else/>
                </div>
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
import {getExpandedIRI, parseContext} from "@/utils/json";
import {handleParameters} from "@/middleware/packages";
import {extractLabel} from "@/utils/alpha";
import LoadingComponent from "../components/LoadingComponent";
import SetsComponent from "@/components/SetsComponent";
import PackageInformationComponent from "@/components/PackageInformationComponent";

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
            presets: [],
            areMediatorsFetched: false,
            isPresetLoading: false,
            isExporting: false,
        }
    },
    computed: {
        busGroups() {
            return this.$store.state.busGroups;
        }
    },
    methods: {
        onUpload(file) {
            this.$store.dispatch('uploadZip', file);
        },
        async onImport() {
            this.isPresetLoading = true;
            await this.$store.dispatch('importPreset', this.actorLink);
            this.isPresetLoading = false;
            this.imp = false;
        },
        async onExport() {
            this.isExporting = true;
            await this.$store.dispatch('downloadZip');
            this.isExporting = false;
        },
        onReset() {
            this.$store.commit('resetState');
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

    },
    async asyncData(context) {
        const rawPresets = await context.$axios.$get('/comunica-packager/presets.json');
        return {
            presets: Object.keys(rawPresets).map(a => {
                return {
                    name: a,
                    url: rawPresets[a]
                };
            })
        };
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
        flex: 1;
        color: black;
        background-color: white;
        display: flex;
    }

    #sidebar {
        padding: 20px 20px 0;
        flex: 2;
        border-right: 1px solid $comunica-border;
    }

    #content {
        padding: 20px 20px;
        color: black;
        display: flex;
        flex: 11;
    }

    .column {
        margin: 0 10px;
        display: flex;
        flex-direction: column;
        flex: 1;
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
    }

    a:hover {
        border-bottom: 2px solid white;
    }

</style>
