<template>
    <div>
        <h2><strong>{{busGroup.busGroupName}}</strong></h2>
        <div id="bus-group">
            <div id="bus-group-input">
                <DropdownComponent
                    v-model="selectedActor"
                    :options="busGroupActors"
                    placeholder="Choose actor"
                />
                <ButtonComponent :is-small="true" text="Add" @click="onAdd"/>
            </div>

            <ObjectComponent
                    v-for="actor in addedActors"
                    :bus-group-name="busGroup.busGroupName"
                    :object-name="actor.actorName"
                    :parameters="actor.parameters"
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
                this.$store.commit('addActor', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: this.selectedActor
                });

                await this.$store.dispatch('getArguments', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: this.selectedActor
                });
            },
            onDelete(deletedActor) {
                this.$store.commit('deleteActor', {
                    busGroup: this.busGroup.busGroupName,
                    actorName: deletedActor
                })
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

    #bus-group {
        background: $comunica-dark-red;
        border-radius: 7px;
        padding: 7px;
    }

    #bus-group-input {
        display: grid;
        grid-template-columns: 10fr 1fr;
        grid-column-gap: 7px;
    }

    .select {
        display: block;
        font-size: 16px;
        color: white;
        line-height: 1.3;
        padding: .6em 1.4em .5em .8em;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        margin: 0;
        box-shadow: 0 1px 0 1px rgba(0,0,0,.04);
        border-radius: .5em;
        -moz-appearance: none;
        -webkit-appearance: none;
        appearance: none;
        background-color: $comunica-red;
        background-image: url('~@/assets/arrow-down.svg');
        background-repeat: no-repeat, repeat;
        background-position: right .7em top 50%, 0 0;
        background-size: .65em auto, 100%;
    }

    .select:focus {
        color: white;
        outline: none;
    }

</style>
