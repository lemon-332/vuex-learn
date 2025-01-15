<template>
  <!-- <h1>{{ store.state.count }}</h1> -->
  <!-- <div>{{ $st ore.state.count }}</div> -->
  <button @click="add">修改</button>
  <button @click="addAsync">异步修改</button>
  <button @click="$store.state.count++">异步修改</button>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { useStore } from "@/vuex";

@Options({})
export default class App extends Vue {
  private store = useStore();

  private add() {
    this.store.commit("add", 1);
  }

  private addAsync() {
    this.store.dispatch("addAsync", 1);
  }

  mounted() {
    console.log(this.store,'333');
  }
}
</script>
