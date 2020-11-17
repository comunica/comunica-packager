<template>
    <div v-if="areActorsFiltered">
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

    <LoadingComponent v-else/>

</template>

<script>
    import DropdownComponent from "./DropdownComponent";
    import ButtonComponent from "./ButtonComponent";
    import BusGroupComponent from "./BusGroupComponent";
    import {getBusGroupOfActor} from "@/store";
    import {kebabCaseToPascalCase} from "@/utils/alpha";
    import LoadingComponent from "@/components/LoadingComponent";

    export default {
        name: "ActorsComponent",
        components: {LoadingComponent, BusGroupComponent, ButtonComponent, DropdownComponent},
        data: () => ({
            selectedActor: null,
            actors: [],
            areActorsFiltered: false,
        }),
        methods: {
            async onCreate() {

                const busGroup = getBusGroupOfActor(this.$store.state.busGroups, this.selectedActor);
                const id = `${busGroup}#${this.selectedActor}`

                await this.$store.dispatch('addActor', {
                    busGroup: busGroup,
                    '@id': id,
                    actorName: this.selectedActor,
                    set: this.$store.state.currentSet,
                });

                this.selectedActor = null;
                this.$store.commit('setEditedOfSet', this.$store.state.currentSet);

            }
        },
        computed: {
            busGroups() {
                let busGroups = Object.keys(this.$store.state.createdActors).sort();
                return busGroups.map(bg => ({
                    busGroup: bg,
                    actors: this.$store.state.createdActors[bg].filter(
                        actor => actor.set === this.$store.state.currentSet
                    ),
                }));
            }
        },
        async mounted() {

            const inits = this.$store.state.inits;
            const ignoreInits = [];

            for (const i of inits) {
                const iUpper = kebabCaseToPascalCase(i);
                const actorPart = iUpper.substring(9);
                const g = `https://linkedsoftwaredependencies.org/bundles/npm/@comunica/${i}/^1.0.0/components/Actor/Init/${actorPart}.jsonld`

                await this.$axios.$get(g).catch(_ => {
                    ignoreInits.push(iUpper);
                });
            }

            this.actors = this.$store.state.busGroups.flatMap(x => [...x.actors])
                .filter(a => !ignoreInits.includes(a));
            
            this.areActorsFiltered = true;
        }
    }
</script>

<style>
</style>