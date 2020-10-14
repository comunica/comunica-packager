<template>
    <div id="logo">
        <img id="image" src="comunica_white.svg"/>
        <p id="packager">PACKAGER</p>
    </div>
</template>

<script>
    export default {
        name: "LogoComponent"
    }
</script>

<style scoped lang="scss">

    #logo {
        display: grid;
        grid-template-columns: 1fr 2fr;
        place-items: center;
        grid-gap: 10px;
    }

    #packager {
      font-family: bignoodletitlingregular, sans-serif;
      font-size: 20pt;
    }

    #image {
      height: 3rem;
      vertical-align: middle;
    }

</style>