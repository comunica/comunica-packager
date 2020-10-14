<template>
    <div v-if="set === currentSet" id="object">
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
                <p class="text-small" style="align-self: center; font-weight: bold;">@id</p>
                <input
                        :value="id"
                        @change="onIDChange($event.target.value)"
                        class="input id-input"
                        type="text"
                >
            </div>
            <div v-if="areParametersFetched" id="parameters">
                <div v-for="p in Object.keys(objectParameters)" :key="p" class="parameter">
                    <p class="parameter-text text-small" v-if="objectParameters[p].required"><b>{{trimIdentifier(p)}}</b></p>
                    <p class="parameter-text text-small" v-else><i>{{trimIdentifier(p)}}</i></p>
                    <DropdownComponent
                            v-if="trimIdentifier(p).startsWith('mediator')"
                            :value="objectParameters[p].value"
                            @input="x => changeParameterValue(p, x)"
                            placeholder="Choose mediator"
                            :options="mediators"
                            no-items="No mediators defined."
                    />
                    <DropdownComponent
                            v-else-if="objectParameters[p].range === 'cc:Bus'"
                            :value="objectParameters[p].value"
                            @input="x => changeParameterValue(p, x)"
                            :placeholder="showDefaultAsPlaceholder(objectParameters[p])"
                            :options="buses"
                            label="name"
                            reduce="fullName"
                    />
                    <DropdownComponent
                            v-else-if="objectParameters[p].range === 'cc:Logger'"
                            :value="objectParameters[p].value"
                            @input="x => changeParameterValue(p, x)"
                            :placeholder="showDefaultAsPlaceholder(objectParameters[p])"
                            :options="loggers"
                    />
                    <DropdownComponent
                            v-else-if="objectParameters[p].range === 'cc:Actor'"
                            :value="objectParameters[p].value"
                            @input="x => changeParameterValue(p, x)"
                            placeholder="Choose an actor"
                            :options="actors"
                            no-items="No other actors defined."
                    />
                    <input
                            v-else
                            :value="objectParameters[p].value"
                            @change="$emit('param', $event.target.value, id, p)"
                            class="input parameter-input"
                            type="text"
                            :placeholder="showDefaultAsPlaceholder(objectParameters[p])"
                    >
                </div>
            </div>
            <LoadingComponent v-else/>
        </div>
    </div>
</template>

<script>
    import DeleteButtonComponent from "./IconButtonComponent";
    import IconButtonComponent from "./IconButtonComponent";
    import DropdownComponent from "./DropdownComponent";
    import {extractLabel, trimIdentifier} from "../utils/alpha";
    import LoadingComponent from "./LoadingComponent";

    export default {
        name: "ObjectComponent",
        components: {LoadingComponent, IconButtonComponent, DropdownComponent, DeleteButtonComponent},
        props: {
            objectName: {
                type: String,
                default: 'Placeholder object name'
            },
            parameters: {
                type: Object,
                default: undefined
            },
            id: {
                type: String,
                default: 'placeholderID'
            },
            busGroup: {
                type: String,
                default: undefined
            },
            set: {
                type: String,
                default: 'default'
            }
        },
        data() {
            return {
                close: true,
                areParametersFetched: false,
                objectParameters: {}
            }
        },
        methods: {
            onIDChange(value) {
                this.$emit('id', this.id, value);
                this.id = value;
            },
            trimIdentifier(s) {
                return trimIdentifier(s);
            },
            changeParameterValue(key, value) {
                this.$emit('param', value, this.id, key);
                this.$forceUpdate();
            },
            showDefaultAsPlaceholder(obj) {
                if (obj.value)
                    return '';
                switch (obj.range) {
                    case 'cc:Bus': {
                        return obj.defaultScoped ? extractLabel(obj.defaultScoped.defaultScopedValue['@id']) : '';
                    }
                    case 'cc:Logger': return obj.default['@type'];
                    default: {
                        let defaultValue = undefined;
                        if (obj.hasOwnProperty('default'))
                            defaultValue = obj.default
                        else if (obj.hasOwnProperty('defaultScoped'))
                            defaultValue = obj.defaultScoped.defaultScopedValue;

                        if (typeof defaultValue === 'string')
                            return defaultValue;
                        else
                            return defaultValue ? JSON.stringify(defaultValue) : '' ;
                    }
                }
            }
        },
        computed: {
            actors() {
                const createdActors = this.$store.state.createdActors;
                return Object.keys(createdActors)
                    .flatMap(bg => createdActors[bg].map(ca => ca['@id']))
                    .filter(a => a !== this.id);
            },
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
            },
            currentSet() {
                return this.$store.state.currentSet;
            }
        },
        async mounted() {
            this.objectParameters = this.parameters;
            if (this.busGroup) {
                   await this.$store.dispatch('fetchArgumentsOfActor', {
                       busGroup: this.busGroup,
                       actorName: this.objectName,
                       '@id': this.id,
                       set: this.set,
                   });
                   this.areParametersFetched = true;
            } else {
                this.areParametersFetched = true;
            }
        }
    }
</script>

<style scoped lang="scss">

    #object {
        border: 1px solid $comunica-border;
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
        border: 1px solid $comunica-border;
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


</style>