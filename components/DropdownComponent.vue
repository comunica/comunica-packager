<template>
    <v-select
        class="style-chooser"
        :value="value"
        @input="$emit('input', $event)"
        :placeholder="placeholder"
        :options="options"
    />
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
            }
        }
    }
</script>

<style lang="scss">

    .style-chooser .vs__search::placeholder,
    .style-chooser .vs__dropdown-toggle,
    .style-chooser .vs__selected,
    .style-chooser .vs__dropdown-menu {
        background: $comunica-red;
        color: white;
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