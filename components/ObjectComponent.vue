<template>
    <div id="object">
        <div id="object-header">
            <h3 style="align-self: center;">
                {{objectName.split('/').pop()}}
            </h3>
            <DeleteButtonComponent
                    @click="$emit('click', id)"
                    style="justify-self: end;"
            />
        </div>
        <div id="id-input">
            <h4>@id</h4>
            <input
                :value="id"
                @change="onIDChange($event.target.value)"
                class="parameter-input"
                type="text"
            >
        </div>

        <hr class="line">

        <div v-for="parameter in parameters" :key="parameter['@id']" class="parameter">
            <p><v-icon small color="#fff">mdi-tune</v-icon></p>
            <p class="parameter-text">{{parameter['@id'].split('/').pop()}}</p>
            <input @change="$emit('param', $event.target.value, id, parameter['@id'])" class="parameter-input" type="text">
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
            },
            id: {
                type: String,
                default: 'placeholderID'
            }
        },
        data() {
            return {

            }
        },
        methods: {
            onIDChange(value) {
                this.$emit('id', this.id, value);
                this.id = value;
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
        padding: 0 7px;
    }

    #id-input {
        display: grid;
        grid-template-columns: 1fr 10fr;
        padding: 7px;
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