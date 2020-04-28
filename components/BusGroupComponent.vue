<template>
    <div>
        <p>{{busGroup.busGroupName}}</p>
        <div id="bus-group">
            <div>
                Dropdown temp
            </div>
            <ButtonComponent :is-small="true" text="Add" @click="onAdd"/>
        </div>
    </div>
</template>

<script lang="ts">
    import {BusGroup} from "~/assets/interfaces";
    import ButtonComponent from "~/components/ButtonComponent.vue";

    export default {
        name: "BusGroupComponent",
        components: {ButtonComponent},
        props: {
            busGroup: {
                type: Object as () => BusGroup,
                default: () => {
                    return {
                        busGroupName: 'Placeholder busGroupName',
                        actors: [{
                            actorName: 'Placeholder actorName',
                            args: {}
                        }]
                    }
                }
            }
        },
        methods: {
            onAdd() {
                console.log('Pressed add for a busgroup!')
            }
        }
    }
</script>

<style scoped lang="scss">
    #bus-group {
        display: grid;
        grid-template-columns: 10fr 1fr;

        background: $comunica-dark-red;
        border-radius: 7px;
        padding: 5px;
    }
</style>
