<template>
    <div id="object">
        <div id="object-header">
            <h3 style="align-self: center;">
                {{objectName}}
            </h3>
            <DeleteButtonComponent
                    @click="onClick($event)"
                    style="justify-self: end;"
            />
        </div>
        <div v-for="parameter in parameters" :key="parameter['@id']" class="parameter">
            <p><v-icon small color="#fff">mdi-tune</v-icon></p>
            <p class="parameter-text">{{parameter['@id']}}</p>
            <input @change="onChangeParameter($event, parameter['@id'])" class="parameter-input" type="text">
        </div>
    </div>

</template>

<script>
    import DeleteButtonComponent from "./DeleteButtonComponent";
    export default {
        name: "ObjectComponent",
        components: {DeleteButtonComponent},
        props: {
            objectName: {
                type: String,
                default: 'Placeholder object name'
            },
            busGroupName: {
                type: String,
                default: 'Placeholder busgroup name'
            },
            parameters: {
                type: Array,
                default: () => []
            }
        },
        methods: {
            onClick(e) {
                this.$emit('click', e);
            },
            onChangeParameter(e, parameterID) {
                this.$store.commit('changeParameterValueOffActor', {
                    busGroup: this.busGroupName,
                    actorName: this.objectName,
                    parameterID: parameterID,
                    value: e.target.value
                });
            }
        }
    }
</script>

<style scoped lang="scss">

    #object {
        background: $comunica-red;
        border-radius: 7px;
        padding: 7px;
        margin: 7px 0 0 0;
    }

    #object-header {
        display: grid;
        grid-template-columns: 10fr 1fr;
    }

    .parameter {
        display: grid;
        grid-template-columns: 1fr 5fr 3fr;
        column-gap: 5px;
        padding: 7px;
    }
    .parameter-text {
        overflow-wrap: break-word;
        word-wrap: break-word;
        overflow: hidden;
    }
    .parameter-input {
        border: 1px solid $comunica-dark-red;
        border-radius: 7px;
    }
</style>