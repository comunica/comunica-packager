<template>
    <div id="object">
        <div id="object-header">
            <p class="text-medium" style="align-self: center;">{{objectName}}</p>
            <IconButtonComponent
                @click="close = !close"
                style="justify-self: end;"
                icon-tag="mdi-tune"
            />
            <IconButtonComponent
                    @click="$emit('click', id)"
                    style="justify-self: end;"
                    icon-tag="mdi-close-circle"
            />
        </div>
        <div id="variables" v-if="!close">
            <div id="id-input">
                <p class="text-small" style="align-self: center;">@id</p>
                <input
                        :value="id"
                        @change="onIDChange($event.target.value)"
                        class="input id-input"
                        type="text"
                >
            </div>
            <div id="parameters">
                <div v-for="p in Object.keys(parameters)" :key="p" class="parameter">
                    <p class="parameter-text text-small" v-if="parameters[p].required"><b>{{trimIdentifier(p)}}</b></p>
                    <p class="parameter-text text-small" v-else><i>{{trimIdentifier(p)}}</i></p>
                    <DropdownComponent
                            v-if="trimIdentifier(p).startsWith('mediator')"
                            :value="parameters[p].value"
                            @input="x => $emit('param', x, id, p)"
                            placeholder="Choose mediator"
                            :options="mediators"
                    />
                    <DropdownComponent
                            v-else-if="parameters[p].range === 'cc:Bus'"
                            :value="parameters[p].value"
                            @input="x => $emit('param', x, id, p)"
                            placeholder="Choose bus"
                            :options="buses"
                    />
                    <DropdownComponent
                            v-else-if="parameters[p].range === 'cc:Logger'"
                            :value="parameters[p].value"
                            @input="x => $emit('param', x, id, p)"
                            placeholder="Choose logger"
                            :options="loggers"
                    />
                    <input
                            v-else
                            :value="parameters[p].value"
                            @change="$emit('param', $event.target.value, id, p)"
                            class="input parameter-input"
                            type="text"
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DeleteButtonComponent from "./IconButtonComponent";
    import DropdownComponent from "./DropdownComponent";
    import {extractLabel, trimIdentifier} from "../utils/alpha";
    import IconButtonComponent from "./IconButtonComponent";
    export default {
        name: "ObjectComponent",
        components: {IconButtonComponent, DropdownComponent, DeleteButtonComponent},
        props: {
            objectName: {
                type: String,
                default: 'Placeholder object name'
            },
            parameters: {
                type: Object,
                default: () => {}
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
                objectParameters: this.parameters,
                close: true
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
                return this.$store.state.buses.map(p => ({
                    fullName: p,
                    name: extractLabel(p)
                }));
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
        grid-template-columns: 10fr 1fr 1fr;
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
        grid-template-columns: 6fr 7fr;
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
        font-size: max(1vmin, 11pt);
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