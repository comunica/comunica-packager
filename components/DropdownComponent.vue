<template>
    <select :value="value" @change="$emit('input', $event.target.value)" class="select">
        <option value="" disabled selected hidden>{{placeholder}}</option>
        <option v-for="option in options"
                :key="option"
                :value="option"
        >
            {{option}}
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
            }
        },
        methods: {
        }
    }
</script>

<style scoped>

</style>