<template>
    <div>
        <div id="body">
            <p :class="set === selected ? 'set selected' : 'set'" v-for="set in sets">
                {{set}}
            </p>
        </div>
        <div id="add-set">
            <input id="input-sets" class="input"/>
            <ButtonComponent :is-small="true" text="Add"/>
        </div>
    </div>
</template>

<script>
    import ButtonComponent from "@/components/ButtonComponent";
    export default {
        name: "SetsComponent",
        components: {ButtonComponent},
        data() {
            return {
                sets: ['default', 'http', 'query-operation'],
                selected: 'default'
            }
        }
    }
</script>

<style scoped lang="scss">

    #body {
        margin-top: 10px;
    }

    #add-set {
        display: grid;
        grid-template-columns: 10fr 1fr;
        grid-gap: 10px;
        padding-left: 10px;
    }

    .set {
        padding-left: 10px;
        width: 100%;
        line-height: 30pt;
    }

    .selected {
        color: $comunica-red;
        text-decoration: underline;
    }

</style>