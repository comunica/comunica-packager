<template>
    <div>
        <h2><strong>{{busGroup.busGroupName}}</strong></h2>
        <div id="bus-group">
            <!-- TODO: fix correct color for arrow -->
            <div id="bus-group-input">
                <select v-model="selectedActor" class="select">
                    <option value="" disabled selected hidden>Choose actor</option>
                    <option v-for="actor in busGroupActors"
                            :key="actor"
                            :value="actor"
                    >
                        {{actor}}
                    </option>
                </select>
                <ButtonComponent :is-small="true" text="Add" @click="onAdd"/>
            </div>

            <div id="bus-group-actors">
                <div v-for="actor in addedActors" :key="actor" class="actor">
                    <div class="actor-header">
                        <h3 style="align-self: center;">
                            {{actor}}
                        </h3>
                        <DeleteButtonComponent
                                @click="onDelete(actor)"
                                style="justify-self: end;"
                        />
                    </div>
                    <div class="actor-parameter">
                        <p><v-icon small color="#fff">mdi-tune</v-icon></p>
                        <p>Parameter 1</p>
                        <input class="input-param" type="text">
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
    import ButtonComponent from "~/components/ButtonComponent.vue";
    import DeleteButtonComponent from "./DeleteButtonComponent";

    export default {
        name: "BusGroupComponent",
        components: {DeleteButtonComponent, ButtonComponent},
        props: {
            busGroup: {
                type: Object,
                default: () => {
                    return {
                        busGroupName: 'Placeholder busGroupName',
                        actors: ['Placeholder actor 1', 'Placeholder actor 2']
                    }
                }
            }
        },
        data: () => ({
            selectedActor: ''
        }),
        methods: {
            onAdd() {
                this.$store.commit('addActor', {
                    busGroup: this.busGroup.busGroupName,
                    actor: this.selectedActor
                });
            },
            onDelete(deletedActor) {
                this.$store.commit('deleteActor', {
                    busGroup: this.busGroup.busGroupName,
                    actor: deletedActor
                })
            }
        },
        computed: {
            addedActors() {
                return this.$store.state[this.busGroup.busGroupName] ? this.$store.state[this.busGroup.busGroupName] : [];
            },
            busGroupActors() {
                return this.busGroup.actors.filter(actor => !this.addedActors.includes(actor));
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

    #bus-group-actors {
        display: grid;
        grid-row-gap: 7px;
        margin-top: 7px;
    }

    .actor {
        background: $comunica-red;
        border-radius: 7px;
        padding: 7px;
    }

    .actor-header {
        display: grid;
        grid-template-columns: 10fr 1fr;
    }

    .actor-parameter {
        display: grid;
        grid-template-columns: 1fr 5fr 3fr;
        padding: 7px;
    }

    .input-param {
        border: 1px solid $comunica-dark-red;
        border-radius: 7px;
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
        background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
        background-repeat: no-repeat, repeat;
        background-position: right .7em top 50%, 0 0;
        background-size: .65em auto, 100%;
    }

    .select:focus {
        color: white;
        outline: none;
    }

</style>
