<template>
    <div>
        <h2><strong>{{busGroup.busGroupName}}</strong></h2>
        <div class="box">
            <div class="dropdown-layout">
                <DropdownComponent
                    v-model="selectedActor"
                    :options="busGroupActors"
                    placeholder="Choose actor"
                />
                <ButtonComponent :is-small="true" text="Add" @click="onAdd"/>
            </div>
            <ObjectComponent
                v-for="actor in addedActors"
                :object-name="actor.actorName"
                :parameters="actor.parameters"
                @click="onDelete"
                @param="onChangeParameter"
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
                });
            },
            onChangeParameter(value, actorName, parameterName) {
                this.$store.commit('changeParameterValueOfActor', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: actorName,
                    parameterName: parameterName,
                    value: value
                });
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

</style>
