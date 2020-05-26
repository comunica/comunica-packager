<template>
    <div>
        <div class="box">
            <div class="dropdown-layout">
                <DropdownComponent
                        v-model="selectedActor"
                        :options="actors"
                        :groups="true"
                        placeholder="Choose actor"
                />
                <ButtonComponent :disabled="!selectedActor" :is-small="true" text="Create" @click="onCreate"/>
            </div>
        </div>
        <BusGroupComponent
            v-for="(value, key) in busGroups"
            v-if="value.length"
            :key="key"
            :bus-group="key"
        />
    </div>

</template>

<script>
    import DropdownComponent from "./DropdownComponent";
    import ButtonComponent from "./ButtonComponent";
    import BusGroupComponent from "./BusGroupComponent";

    export default {
        name: "ActorsComponent",
        components: {BusGroupComponent, ButtonComponent, DropdownComponent},
        data: () => ({
            selectedActor: null
        }),
        methods: {
            async onCreate() {
                const selectedActor = this.selectedActor.split('|');
                this.selectedActor = null;

                const busGroup = selectedActor[0];
                const actorName = selectedActor[1];
                const id = `mytest:${actorName}`

                await this.$store.dispatch('addActor', {
                    busGroup: busGroup,
                    '@id': id,
                    actorName: actorName
                });

            }
        },
        computed: {
            actors() {
                return this.$store.state.busGroups.map(x => ({
                    groupName: x.busGroupName,
                    options: x.actors
                }));
            },
            busGroups() {
                return this.$store.state.createdActors;
            }
        }
    }
</script>

<style scoped>

</style>