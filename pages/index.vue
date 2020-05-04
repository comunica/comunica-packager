<template>
    <div id="container">
        <div id="header">
            <v-img id="logo" max-width="130px" max-height="185px" src="./comunica_white.svg"/>
            <ButtonComponent text="New engine" @click="onNew"/>
            <ButtonComponent text="Generate engine" @click="onGenerateEngine"/>
        </div>
        <div id="bus-groups" v-if="busGroups">
            <BusGroupComponent
                    v-for="busGroup in busGroups"
                    :key="busGroup.busGroupName"
                    :bus-group="busGroup"
            />
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
        middleware: ['actors'],
        data () {
            return {}
        },
        computed: {
            busGroups() {
                return this.$store.state.busGroups;
            }
        },
        methods: {
            onNew() {
                // console.log(this);
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
    #bus-groups {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 30px 80px;
        margin: 10% 0;
    }
</style>
