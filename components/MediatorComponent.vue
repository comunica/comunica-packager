<template>
    <div class="box">
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
            :object-name="mediator.type"
            :id="mediator['@id']"
            :parameters="mediator.parameters"
            @click="onDelete(mediator['@id'])"
            @param="onChangeParameter"
        />
    </div>
</template>

<script>
    import DropdownComponent from "./DropdownComponent";
    import ButtonComponent from "./ButtonComponent";
    import ObjectComponent from "./ObjectComponent";
    export default {
        name: "MediatorComponent",
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
                // TODO: unique id
                const parameters = this.mediators.find(m => m.name === this.selectedMediator).parameters;
                console.log(parameters);
                this.$store.commit('createNewMediator', {
                    type: this.selectedMediator,
                    '@id': `${this.selectedMediator}#${this.createdMediators.length}`,
                    parameters: parameters,
                });
            },
            onDelete(mediator) {
                this.$store.commit('deleteMediator', mediator);
            },
            onChangeParameter(value, mediatorName, parameterName) {
                this.$store.commit('changeParameterValueOfMediator', {
                    busGroup: null,
                    name: mediatorName,
                    parameterName: parameterName,
                    value: value
                });
            }
        }
    }
</script>

<style scoped>
</style>