<template>
    <div class="box">
        <div class="dropdown-layout">
            <DropdownComponent
                v-model="selectedMediator"
                :options="mediatorTypes"
                placeholder="Choose mediator type"
            />
            <ButtonComponent :is-small="true" text="Create" @click="onCreate"/>
        </div>
        <ObjectComponent
                v-for="mediator in createdMediators"
                :object-name="mediator.type"
                :parameters="mediator.parameters"
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
            selectedMediator: null
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
                    parameters: parameters,
                });
            }
        }
    }
</script>

<style scoped>
</style>