<template>
    <div id="app">
      <v-img id="logo" max-width="130px" max-height="185px" src="./comunica_white.svg"/>
      <nuxt />
    </div>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>

<style lang="scss">
  #app {
    display: flex;
    justify-content: center;

    padding: 100px 200px 10px 200px;
  }
</style>
