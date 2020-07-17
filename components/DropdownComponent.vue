<template>
    <v-select
        class="style-chooser"
        :value="value"
        @input="$emit('input', $event)"
        :placeholder="placeholder"
        :options="options"
        :label="label"
        :reduce="reduce ? x => x[reduce]: x => x"
    >
        <span slot="no-options">{{noItems}}</span>
    </v-select>
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
            label: {
                type: String
            },
            reduce: {
                type: String
            },
            noItems: {
                type: String,
                default: 'No items to be found.'
            }
        }
    }
</script>

<style lang="scss">

    .style-chooser .vs__selected,
    .style-chooser .vs__selected-options{
        word-break: break-all;
    }

    .style-chooser .vs__search::placeholder,
    .style-chooser .vs__dropdown-toggle,
    .style-chooser .vs__selected,
    .style-chooser .vs__dropdown-menu {
        background: $comunica-red;
        color: white;
        border-radius: 7px;
    }

    .style-chooser .vs__dropdown-menu li {
        color: white;
    }

    .style-chooser .vs__clear,
    .style-chooser .vs__open-indicator {
        fill: white;
        color: white;
    }

</style>