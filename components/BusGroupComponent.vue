<template>
    <div style="margin-top: 20px;">
        <p class="text-medium">{{busGroup}}</p>
        <div class="box">
            <ObjectComponent
                v-for="actor in addedActors"
                :object-name="actor.actorName"
                :id="actor['@id']"
                :parameters="actor.parameters"
                :bus-group="busGroup"
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
                type: String,
                default: 'Placeholder busgroup'
            }
        },
        methods: {
            onDelete(deletedActor) {
                this.$store.commit('deleteActor', {
                    busGroup: this.busGroup,
                    '@id': deletedActor
                });
            },
            onChangeParameter(value, id, parameterName) {
                this.$store.commit('changeParameterValueOfActor', {
                    busGroup: this.busGroup,
                    '@id': id,
                    parameterName: parameterName,
                    value: value
                });
            },
            onIDChange(currentID, newID) {
                this.$store.commit('changeIDOfActor', {
                    busGroup: this.busGroup,
                    currentID: currentID,
                    newID: newID
                });
            }
        },
        computed: {
            addedActors() {
                return this.$store.state.createdActors[this.busGroup];
            }
        }
    }
</script>

<style scoped lang="scss">

</style>
