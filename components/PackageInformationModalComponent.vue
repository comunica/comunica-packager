<template>
    <div class="modal">
      <p id="title" class="text"><b>Check your package information here</b></p>
        <PackageInformationComponent/>
        <div id="buttons">
          <ButtonComponent text="Cancel" :is-small="true" @click="$emit('close')"/>
          <ButtonComponent id="btn-export" text="Export" :is-small="true" @click="onExport()"/>
        </div>
    </div>
</template>

<script>
import PackageInformationComponent from "~/components/PackageInformationComponent";
import ButtonComponent from "~/components/ButtonComponent";
export default {
    name: "PackageInformationModalComponent",
    components: {ButtonComponent, PackageInformationComponent},
    data () {
        return {
            isExporting: false,
        }
    },
    methods: {
        async onExport() {
            this.isExporting = true;
            await this.$store.dispatch('downloadZip');
            this.isExporting = false;
            this.$emit('close');
        }
    }
}
</script>

<style scoped>

    .text {
        place-self: center;
        text-align: center;
    }

    #buttons {
      margin-top: 10px;
      place-self: end;
    }

</style>