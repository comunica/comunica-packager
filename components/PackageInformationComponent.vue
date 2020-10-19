<template>
    <div id="package-info">
        <p class="text-small label">Package @id</p>
        <input
            v-model="packageID"
            class="input"
            type="text"
        >
        <p class="text-small label">Package name</p>
        <input
            v-model="packageName"
            class="input"
            type="text"
        >
    </div>
</template>

<script>
export default {
    name: "PackageInformationComponent",
    computed: {
        packageID: {
            get: function() {
                return this.$store.state.id;
            },
            set: function(newID) {
                this.$store.commit('setStateEntry', {key: 'id', value: newID});
            }
        },
        packageName: {
            get: function() {
                return this.$store.state.packageName;
            },
            set: function(newValue) {
                this.$store.commit('setStateEntry', {key: 'packageName', value: newValue});
            }
        }
    }
}
</script>

<style scoped>
    #package-info {
        padding-left: 10px;
        margin: 10px 0;
    }
    .label {
        font-weight: bold;
        margin: 5px 0;
    }
</style>