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
                <ButtonComponent :disabled="selectedActor === ''" :is-small="true" text="Add" @click="onAdd"/>
            </div>
            <ObjectComponent
                v-for="actor in addedActors"
                :object-name="actor.actorName"
                :id="actor['@id']"
                :parameters="actor.parameters"
                @click="onDelete"
                @param="onChangeParameter"
                @id="onIDChange"
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

                const selectedActor = this.selectedActor;
                this.selectedActor = '';

                this.$store.commit('addActor', {
                    busGroup: this.busGroup.busGroupName,
                    '@id': `${selectedActor}#${this.addedActors.length}`,
                    actorName: selectedActor
                });

                await this.$store.dispatch('getArguments', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: selectedActor
                });
            },
            onDelete(deletedActor) {
                this.$store.commit('deleteActor', {
                    busGroup: this.busGroup.busGroupName,
                    '@id': deletedActor
                });
            },
            onChangeParameter(value, id, parameterName) {
                this.$store.commit('changeParameterValueOfActor', {
                    busGroup: this.busGroup.busGroupName,
                    '@id': id,
                    parameterName: parameterName,
                    value: value
                });
            },
            onIDChange(currentID, newID) {
                this.$store.commit('changeIDOfActor', {
                    busGroup: this.busGroup.busGroupName,
                    currentID: currentID,
                    newID: newID
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
