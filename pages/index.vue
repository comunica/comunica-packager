<template>
    <div id="container">
        <div id="header">
            <img id="logo" src="comunica_white.svg"/>
            <ButtonComponent text="New engine" @click="onNew"/>
            <ButtonComponent text="Generate engine" @click="onGenerateEngine"/>
        </div>
        <div id="content">
            <div class="column" style="margin-right: 10px;" v-if="busGroups">
                <h1>Actors</h1>
                <BusGroupComponent
                        v-for="busGroup in busGroups"
                        :key="busGroup.busGroupName"
                        :bus-group="busGroup"
                        style="margin-top: 20px;"
                />
            </div>
            <div class="column" style="margin-left: 10px;">
                <h1>Mediators</h1>

            </div>
        </div>

    </div>
</template>

<script>

    import ButtonComponent from "~/components/ButtonComponent.vue";
    import BusGroupComponent from "~/components/BusGroupComponent.vue";

    export default {
        components: {
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
            mediators() {
                return this.$store.state.mediators;
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
        grid-template-columns: repeat(3, 1fr);
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
