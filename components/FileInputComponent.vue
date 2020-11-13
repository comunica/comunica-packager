<template>
    <div id="upload">
        <input type="file" id="file" accept="application/zip" @change="handleFile">
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
                this.$emit('click', file.target.files[0]);
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
        cursor: pointer;
        font-weight: bold;
    }

    #upload {
        border-bottom: 2px solid transparent;
    }

    #upload:hover {
        border-bottom: 2px solid white;
    }

</style>