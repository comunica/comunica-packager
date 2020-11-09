<template>
    <div id="modal">
        <v-icon id="icon" x-large>mdi-alert-circle-outline</v-icon>
        <p id="title" class="text">{{topText}}</p>
        <p class="text text-small">{{question}}</p>
        <div id="buttons">
            <ButtonComponent text="Cancel" :is-small="true" @click="$emit('close')"/>
            <ButtonComponent text="Confirm" :is-small="true" @click="confirm()"/>
        </div>
    </div>
</template>

<script>
import ButtonComponent from "@/components/ButtonComponent";
export default {
name: "ModalComponent",
    components: {ButtonComponent},
    props: {
        topText: {
            type: String,
            default: '?'
        },
        question: {
            type: String,
            default: '?'
        },
        onConfirm: {
            type: String
        },
        potentialPayload: {
            type: Object | String
        }
    },
    methods: {
        confirm() {
            this.$store.commit(this.onConfirm, this.potentialPayload);
            this.$emit('close');
        }
    }
}
</script>

<style scoped lang="scss">
    #modal {
        font-family: "Open Sans", Verdana, Arial, sans-serif;
        display: grid;
        padding: 10px;
    }

    #icon {
        color: $comunica-red;
        margin-top: 10px;
    }

    .text {
        place-self: center;
        text-align: center;
    }

    #title {
        font-size: max(2vmin, 13pt);
        font-weight: bold;
        margin: 10px 0 5px;
    }

    #buttons {
        margin-top: 10px;
        place-self: end;
    }
</style>