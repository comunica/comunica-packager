<template>
    <div>
        <div class="box">
            <div class="dropdown-layout">
                <DropdownComponent
                        v-model="selectedActor"
                        :options="actors"
                        placeholder="Choose actor"
                />
                <ButtonComponent :disabled="!selectedActor" :is-small="true" text="Create" @click="onCreate"/>
            </div>
        </div>
        <BusGroupComponent
            v-for="bg in busGroups"
            v-if="bg.actors.length"
            :key="bg.busGroup"
            :bus-group="bg.busGroup"
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
                const id = `${busGroup}#${actorName}`

                await this.$store.dispatch('addActor', {
                    busGroup: busGroup,
                    '@id': id,
                    actorName: actorName
                });

            }
        },
        computed: {
            actors() {
                return this.$store.state.busGroups.flatMap(x => [...x.actors]);
            },
            busGroups() {
                let busGroups = Object.keys(this.$store.state.createdActors).sort();
                return busGroups.map(bg => ({
                    busGroup: bg,
                    actors: this.$store.state.createdActors[bg]
                }));
            }
        }
    }
</script>


</style>