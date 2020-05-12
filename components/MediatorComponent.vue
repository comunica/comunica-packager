<template>
    <div class="box">
        <div class="dropdown-layout">
            <DropdownComponent
                v-model="selectedMediator"
                :options="mediators"
                placeholder="Choose mediator type"
            />
            <ButtonComponent :is-small="true" text="Create" @click="onCreate"/>
        </div>
    </div>
</template>

<script>
    import DropdownComponent from "./DropdownComponent";
    import ButtonComponent from "./ButtonComponent";
    export default {
        name: "MediatorComponent",
        components: {ButtonComponent, DropdownComponent},
        data: () => ({
            selectedMediator: ''
        }),
        computed: {
            mediators() {
                return this.$store.state.mediators;
            }
        },
        methods: {
            onCreate() {
                console.log('e');
            }
        }
    }
</script>

<style scoped>
</style>