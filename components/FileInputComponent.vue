<template>
    <div>
        <input type="file" id="file" accept="application/zip" @change="file => handleFile(file)">
        <label for="file">{{text}}</label>
    </div>
</template>

<script>
    export default {
        name: "FileInputComponent",
        props: {
            text: {
                type: String,
                default: 'Upload file'
            }
        },
        methods: {
            handleFile(file) {
                console.log(file);
            }
        }
    }
</script>

<style scoped lang="scss">

    input[type="file"] {
        display: none;
    }

    label {
        color: white;
        text-align: center;
        border-radius: 8px;
        font-size: 16pt;
        background: $comunica-dark-red;
        padding: 15px 32px;
        cursor: pointer;
    }

</style>