<template>
    <div id="container">
        <div id="header">
            <v-img id="logo" max-width="130px" max-height="185px" src="./comunica_white.svg"/>
            <ButtonComponent text="New engine" @click="onNew"/>
            <ButtonComponent text="Generate engine" @click="onGenerateEngine"/>
        </div>
        <div id="bus-groups">
            <BusGroupComponent v-for="busGroup in busGroups" :key="busGroup.busGroupName"/>
        </div>
    </div>
</template>

<script lang="ts">

    import ButtonComponent from "~/components/ButtonComponent.vue";
    import BusGroupComponent from "~/components/BusGroupComponent.vue";

    export default {
        components: {
            BusGroupComponent,
            ButtonComponent
        },
        data () {
            return {
                // TODO: replace this with actual actors
                busGroups: [
                    {
                        busGroupName: 'Sparql',
                        actors: [
                            {
                                // Testcase 2 args, strings
                                actorName: 'ActorSparqlTest',
                                args: {
                                    arg1: 'testArg1',
                                    arg2: 'testArg2'
                                }
                            }
                        ]
                    },
                    {
                        busGroupName: 'RDF',
                        actors: [
                            {
                                // Testcase 1 arg, int
                                actorName: 'ActorRDFTest',
                                args: {
                                    arg1: 0
                                }
                            },
                            {
                                // Testcase 0 args
                                actorName: 'ActorRDFTest2'
                            }
                        ]
                    }
                ]
            }
        },
        methods: {
            onNew() {
                console.log('Pressed on new!');
            },
            onGenerateEngine() {
                console.log('Pressed on generate!');
            }
        }
    }
</script>

<style scoped lang="scss">
    #header {
        display: grid;
        grid-template-columns: repeat(3, 2fr);
        place-content: center;
        place-items: center;
        margin: 0 10%;
    }
</style>
