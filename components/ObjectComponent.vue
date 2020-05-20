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
            <h4 style="align-self: center;">@id</h4>
            <input
                :value="id"
                @change="onIDChange($event.target.value)"
                class="input id-input"
                type="text"
            >
        </div>

        <div id="parameters">
            <div v-for="parameter in parameters" :key="parameter['@id']" class="parameter">
                <p style="align-self: center;"><v-icon small color="#fff">mdi-tune</v-icon></p>
                <p class="parameter-text">{{trimIdentifier(parameter['@id'])}} {{parameter.required ? '*' : ''}}</p>
                <DropdownComponent
                    v-if="trimIdentifier(parameter['@id']).startsWith('mediator')"
                    :value="parameter.value"
                    @input="x => $emit('param', x, id, parameter['@id'])"
                    placeholder="Choose mediator"
                    :options="mediators"
                />
                <DropdownComponent
                    v-else-if="parameter.range === 'cc:Bus'"
                    :value="parameter.value"
                    @input="x => $emit('param', x, id, parameter['@id'])"
                    placeholder="Choose bus"
                    :options="buses"
                />
                <DropdownComponent
                    v-else-if="parameter.range === 'cc:Logger'"
                    :value="parameter.value"
                    @input="x => $emit('param', x, id, parameter['@id'])"
                    placeholder="Choose logger"
                    :options="loggers"
                />
                <input
                    v-else
                    :value="parameter.value"
                    @change="$emit('param', $event.target.value, id, parameter['@id'])"
                    class="input parameter-input"
                    type="text"
                >
            </div>
        </div>

    </div>

</template>

<script>
    import DeleteButtonComponent from "./DeleteButtonComponent";
    import DropdownComponent from "./DropdownComponent";
    import {trimIdentifier} from "../utils/alpha";
    export default {
        name: "ObjectComponent",
        components: {DropdownComponent, DeleteButtonComponent},
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
            },
            busGroup: {
                type: String,
                default: ''
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
            },
            trimIdentifier(s) {
                return trimIdentifier(s);
            }
        },
        computed: {
            mediators() {
                const mediators = this.$store.state.createdMediators;
                return mediators.map(x => x['@id']);
            },
            loggers() {
                return this.$store.state.loggers;
            },
            buses() {
                return this.$store.state.buses;
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

    #parameters {
        background-color: $comunica-dark-red;
        border-radius: 7px;
    }

    .parameter {
        display: grid;
        grid-template-columns: 1fr 6fr 7fr;
        column-gap: 5px;
        padding: 7px;
    }
    .parameter-text {
        overflow-wrap: break-word;
        word-wrap: break-word;
        overflow: hidden;
        align-self: center;
    }

    .input {
        border-radius: 7px;
        line-height: 1.3;
        width: 100%;
        max-width: 100%;
        padding: .6em 1.4em .5em .6em;
    }

    .id-input {
        border: 1px solid $comunica-dark-red;
        background-color: $comunica-dark-red;
    }

    .parameter-input {
        border: 1px solid $comunica-red;
        background-color: $comunica-red;
    }

</style>