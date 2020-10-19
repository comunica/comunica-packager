<template>
    <div id="package-info">
        <p class="text-small label">Package name</p>
        <input
            v-model="packageName"
            class="input"
            type="text"
        />
        <p class="text-small label">Author</p>
        <input
            v-model="author"
            class="input"
            type="text"
        />
        <p class="text-small label">Description</p>
        <textarea
            v-model="description"
            class="input"
        />
    </div>
</template>

<script>
export default {
    name: "PackageInformationComponent",
    computed: {
        packageName: {
            get: function() {
                return this.$store.state.packageName;
            },
            set: function(newValue) {
                this.$store.commit('setStateEntry', {key: 'packageName', value: newValue});
            }
        },
        author: {
            get: function() {
                return this.$store.state.author;
            },
            set: function(newValue) {
                this.$store.commit('setStateEntry', {key: 'author', value: newValue});
            }
        },
        description: {
            get: function() {
                return this.$store.state.description;
            },
            set: function(newValue) {
                this.$store.commit('setStateEntry', {key: 'description', value: newValue});
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