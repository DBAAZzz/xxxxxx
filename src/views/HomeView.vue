<template>
  <div class="home">
    <img alt="Vue logo" @click="clickLogo" src="../assets/logo.png" />
    <img id="xx" v-reload="'https://p3-passport.byteimg.com/img/user-avatar/7812b7dadb31734fe41c491722b54d54~180x180.awebp'" src="https://p3-passport.byteimg.com/img/user-avatar/7812b7dadb31734fe41c491722b54d541~180x180.awebp" >
    <HelloWorld  msg="Welcome to Your Vue.js App" />
    <HelloWorld2></HelloWorld2>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import AsyncScheme from 'async-solve'
import HelloWorld2 from "uu/components/HelloWorld.vue"

export default {
  name: "HomeView",
  components: {
    HelloWorld,
    HelloWorld2
  },
  mounted() {
    this.asyncObj = new AsyncScheme()
  },
  directives: {
    reload: {
      bind(el, binding) {
        let { value } = binding
        el.addEventListener('error', () => {
          el.src = value
        })
      }
    }
  },
  methods: {
    clickLogo() {
      this.asyncObj.setKeyValue('one', 1)
    }
  },
};
</script>
