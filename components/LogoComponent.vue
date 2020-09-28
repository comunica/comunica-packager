<template>
    <div>
        <img id="logo" src="comunica_white.svg"/>
        <p id="packager">PACKAGER</p>
    </div>
</template>

<script>
    export default {
        name: "LogoComponent"
    }
</script>

<style scoped lang="scss">

    #packager {
      font-family: bignoodletitlingregular, sans-serif;
      font-size: 9pt;
    }

    #logo {
      height: 3rem;
      vertical-align: middle;
    }

</style>