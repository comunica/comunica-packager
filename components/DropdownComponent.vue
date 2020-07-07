<template>
    <select v-if="groups"
            :value="value"
            @change="$emit('input', $event.target.value)"
            class="select">
        <option :value="null" disabled selected hidden>{{placeholder}}</option>
        <optgroup v-if="group.options.length"
                  v-for="group in options"
                  :label="group.groupName">
            <option v-for="option in group.options"
                    :key="option"
                    :value="`${group.groupName}|${option}`">
                {{option}}
            </option>
        </optgroup>
    </select>

    <select v-else
            :value="value"
            @change="$emit('input', $event.target.value)"
            class="select">
        <option value="" disabled selected hidden>{{placeholder}}</option>
        <option v-for="option in options"
                :key="option.fullName ? option.fullName : option"
                :value="option.fullName ? option.fullName : option">
            {{option.name ? option.name : option}}
        </option>
    </select>
</template>

<script>
    export default {
        name: "DropdownComponent",
        props: {
            placeholder: {
                type: String,
                default: 'Choose an option'
            },
            options: {
                type: Array,
                default: () => []
            },
            value: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: null
            },
            groups: {
                type: Boolean,
                default: false
            }
        },
        methods: {
        }
    }
</script>

<style scoped lang="scss">

    .select {
        display: block;
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

    option {
        font-size: max(1vmin, 11pt);
    }

</style>