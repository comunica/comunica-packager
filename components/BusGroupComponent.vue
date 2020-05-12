<template>
    <div>
        <h2><strong>{{busGroup.busGroupName}}</strong></h2>
        <div id="bus-group">
            <div id="bus-group-input">
                <DropdownComponent
                    v-model="selectedActor"
                    :options="busGroupActors"
                    placeholder="Choose actor"
                />
                <ButtonComponent :is-small="true" text="Add" @click="onAdd"/>
            </div>

            <ObjectComponent
                    v-for="actor in addedActors"
                    :bus-group-name="busGroup.busGroupName"
                    :object-name="actor.actorName"
                    :parameters="actor.parameters"
            />

        </div>

    </div>
</template>

<script>
    import ButtonComponent from "~/components/ButtonComponent.vue";
    import DeleteButtonComponent from "./DeleteButtonComponent";
    import ObjectComponent from "./ObjectComponent";
    import DropdownComponent from "./DropdownComponent";

    export default {
        name: "BusGroupComponent",
        components: {DropdownComponent, ObjectComponent, DeleteButtonComponent, ButtonComponent},
        props: {
            busGroup: {
                type: Object,
                default: () => {}
            }
        },
        data: () => ({
            selectedActor: ''
        }),
        methods: {
            async onAdd() {
                this.$store.commit('addActor', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: this.selectedActor
                });

                await this.$store.dispatch('getArguments', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: this.selectedActor
                });
            },
            onDelete(deletedActor) {
                this.$store.commit('deleteActor', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: deletedActor
                })
            }
        },
        computed: {
            addedActors() {
                return this.$store.state[this.busGroup.busGroupName] ? this.$store.state[this.busGroup.busGroupName] : [];
            },
            busGroupActors() {
                return this.busGroup.actors.filter(actor => !this.addedActors.map(a => a.actorName).includes(actor));
            }
        }
    }
</script>

<style scoped lang="scss">

    #bus-group {
        background: $comunica-dark-red;
        border-radius: 7px;
        padding: 7px;
    }

    #bus-group-input {
        display: grid;
        grid-template-columns: 10fr 1fr;
        grid-column-gap: 7px;
    }

</style>
