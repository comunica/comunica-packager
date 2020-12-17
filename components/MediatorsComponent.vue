<template>
    <div id="mediators" class="box">
        <div class="dropdown-layout">
            <DropdownComponent
                v-model="selectedMediator"
                :options="mediatorTypes"
                placeholder="Choose mediator type"
            />
            <ButtonComponent :disabled="selectedMediator === ''" :is-small="true" text="Create" @click="onCreate"/>
        </div>
        <ObjectComponent
            v-for="mediator in createdMediators"
            :object-name="mediator.name"
            :id="mediator['@id']"
            :parameters="mediator.parameters"
            :set="mediator.set"
            @click="onDelete(mediator['@id'])"
            @param="onChangeParameter"
            @id="onChangeID"
        />
    </div>
</template>

<script>
    import DropdownComponent from "./DropdownComponent";
    import ButtonComponent from "./ButtonComponent";
    import ObjectComponent from "./ObjectComponent";
    import {extractLabel} from "../utils/alpha";
    import ModalComponent from "@/components/ModalComponent";

    export default {
        name: "MediatorsComponent",
        components: {ObjectComponent, ButtonComponent, DropdownComponent},
        data: () => ({
            selectedMediator: ''
        }),
        computed: {
            mediators() {
                return this.$store.state.mediators;
            },
            mediatorTypes() {
                return this.mediators.map(p => p.name);
            },
            createdMediators() {
                return this.$store.state.createdMediators;
            }
        },
        methods: {
            onCreate() {
                // Create new object of mediator type
                this.$store.dispatch('addMediator', {
                    mediator: this.selectedMediator,
                    set: this.$store.state.currentSet
                });
                this.$store.commit('setEditedOfSet', this.$store.state.currentSet);
                if (this.$store.state.persistUrl) {
                    this.$router.replace('/');
                    this.$store.commit('setStateEntry', {
                        key: 'persistUrl',
                        value: false,
                    });
                }
            },
            onDelete(mediator) {
                this.$modal.show(ModalComponent, {
                    topText: 'Delete mediator ' + mediator,
                    question: 'Are you sure you want to delete this mediator?',
                    onConfirm: 'deleteMediator',
                    potentialPayload: mediator
                });
            },
            onChangeParameter(value, id, parameterName) {
                this.$store.commit('changeParameterValueOfMediator', {
                    '@id': id,
                    parameterName: parameterName,
                    value: value
                });
                this.$store.commit('setEditedOfSet', this.$store.state.currentSet);
                if (this.$store.state.persistUrl) {
                    this.$router.replace('/');
                    this.$store.commit('setStateEntry', {
                        key: 'persistUrl',
                        value: false,
                    });
                }
            },
            onChangeID(currentID, newID) {
                this.$store.commit('changeIDOfMediator', {
                    currentID: currentID,
                    newID: newID
                });
                this.$store.commit('setEditedOfSet', this.$store.state.currentSet);
                if (this.$store.state.persistUrl) {
                    this.$router.replace('/');
                    this.$store.commit('setStateEntry', {
                        key: 'persistUrl',
                        value: false,
                    });
                }
            }
        }
    }
</script>

<style scoped>
</style>