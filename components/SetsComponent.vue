<template>
    <div v-if="sets">
        <div id="body">
            <div :class="set.name === selected ? 'set selected' : 'set'" v-for="set in sets" >
                <v-icon style="margin-right: 5px; color: black">mdi-layers</v-icon>
                <p @click="onClick(set)">{{set.name}}</p>
                <IconButtonComponent v-if="set.name !== 'default'" @click="onDelete(set)" style="z-index: 10;" icon-tag="mdi-close-circle"/>
            </div>
        </div>
        <div id="add-set">
            <input v-model="setInput" id="input-sets" class="input"/>
            <ButtonComponent :is-small="true" text="Add" @click="onAddSet"/>
        </div>
    </div>
</template>

<script>
    import ButtonComponent from "@/components/ButtonComponent";
    import IconButtonComponent from "@/components/IconButtonComponent";
    import ModalComponent from "@/components/ModalComponent";
    export default {
        name: "SetsComponent",
        components: {IconButtonComponent, ButtonComponent},
        data() {
            return {
                setInput: ''
            }
        },
        computed: {
            sets() {
                return this.$store.state.sets;
            },
            selected() {
                return this.$store.state.currentSet;
            }
        },
        methods: {
            onAddSet() {
                this.$store.commit('addSet', {name: this.setInput, loaded: true, edited: false});
                this.setInput = '';
            },
            onClick(set) {
                this.$store.commit('setSelectedSet', set.name);
            },
            onDelete(set) {

                this.$modal.show(ModalComponent, {
                    topText: 'Delete set ' + set.name,
                    question: 'Are you sure you want to delete this set?',
                    onConfirm: 'removeSet',
                    potentialPayload: set.name
                });

                // this.$store.commit('removeSet', set.name);
            }
        }
    }
</script>

<style scoped lang="scss">

    #body {
        margin-top: 10px;
        padding-left: 10px;
    }

    #add-set {
        display: grid;
        grid-template-columns: 10fr 1fr;
        grid-gap: 10px;
        margin-top: 10px;
        padding-left: 10px;
    }

    .set {
        padding-left: 10px;
        width: 100%;
        line-height: 30pt;
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    p {
        flex: 1;
    }

    p:hover {
        cursor: pointer;
    }

    .selected {
        background: $comunica-hover;
    }

</style>