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
                :set="actor.set"
                @click="onDelete"
                @param="onChangeParameter"
                @id="onIDChange"
            />
        </div>
    </div>
</template>

<script>
    import ButtonComponent from "~/components/ButtonComponent.vue";
    import DeleteButtonComponent from "./IconButtonComponent";
    import ObjectComponent from "./ObjectComponent";
    import DropdownComponent from "./DropdownComponent";
    import ModalComponent from "@/components/ModalComponent";

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
                this.$modal.show(ModalComponent, {
                    topText: 'Delete actor ' + deletedActor,
                    question: 'Are you sure you want to delete this actor?',
                    onConfirm: 'deleteActor',
                    potentialPayload: {
                        busGroup: this.busGroup,
                        '@id': deletedActor
                    }
                });
            },
            onChangeParameter(value, id, parameterName) {
                this.$store.commit('changeParameterValueOfActor', {
                    busGroup: this.busGroup,
                    '@id': id,
                    parameterName: parameterName,
                    value: value
                });
                this.$store.commit('setEditedOfSet', this.$store.state.currentSet);
            },
            onIDChange(currentID, newID) {
                this.$store.commit('changeIDOfActor', {
                    busGroup: this.busGroup,
                    currentID: currentID,
                    newID: newID
                });
                this.$store.commit('setEditedOfSet', this.$store.state.currentSet);
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
