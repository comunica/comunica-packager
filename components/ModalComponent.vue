<template>
    <div id="modal">
        <p>Eej maatje</p>
        <ButtonComponent :is-small="true" @click="$emit('close')"/>
    </div>
</template>

<script>
import ButtonComponent from "@/components/ButtonComponent";
export default {
name: "ModalComponent",
    components: {ButtonComponent}
}
</script>

<style scoped>
    #modal {
        font-family: "Open Sans", Verdana, Arial, sans-serif;
    }
</style>