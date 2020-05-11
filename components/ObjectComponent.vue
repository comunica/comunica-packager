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
        <div v-for="parameter in parameters" :key="parameter['@id']" id="parameter">
            <p><v-icon small color="#fff">mdi-tune</v-icon></p>
            <p id="parameter-text">{{parameter['@id']}}</p>
            <input id="parameter-input" type="text">
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
            parameters: {
                type: Array,
                default: () => []
            }
        },
        methods: {
            onClick(e) {
                this.$emit('click', e);
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

    #parameter {
        display: grid;
        grid-template-columns: 1fr 5fr 3fr;
        column-gap: 5px;
        padding: 7px;
    }
    #parameter-text {
        overflow-wrap: break-word;
        word-wrap: break-word;
        overflow: hidden;
    }
    #parameter-input {
        border: 1px solid $comunica-dark-red;
        border-radius: 7px;
    }
</style>