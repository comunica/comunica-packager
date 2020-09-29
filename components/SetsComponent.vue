<template>
    <div>
        <div id="header">
            <input
                class="input"
            />
            <ButtonComponent :is-small="true" text="Add"/>
        </div>
    </div>
</template>

<script>
    import ButtonComponent from "@/components/ButtonComponent";
    export default {
        name: "SetsComponent",
        components: {ButtonComponent}
    }
</script>

<style scoped>

    #header {
        display: grid;
        grid-template-columns: 10fr 1fr;
        grid-gap: 10px;
    }

</style>