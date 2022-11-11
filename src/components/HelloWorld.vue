<template>
  <div class="title">
    xxx
  </div>
</template>

<script>
export default {
  data() {
    return {
      x: 0,
      y: 0,
      show: true,
    };
  },
  mounted() {
    window.addEventListener("click", (e) => {
      this.show = true;
      let { clientX, clientY } = e;
      console.log("clientX", clientX);
      this.x = clientX;
      this.y = clientY;
    });
  },
};
</script>

<style scoped lang="scss">
.box {
  position: fixed;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background: red;
}
.wave-content {
  position: fixed;
  left: 0;
  top: 0;
  width: 50px;
  height: 50px;
}

.wave {
  position: absolute;
  left: 0px;
  top: 0px;
  height: 100%;
  width: 100%;
  transform-origin: center center;
  background-color: transparent;
  border: 1px solid #979797;
  animation-duration: 7s;
  animation-name: wv;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  border-radius: 50%;
  opacity: 0;
}

.wave1 {
  animation-delay: 0s;
}

.wave2 {
  animation-delay: 1.5s;
}

.wave3 {
  animation-delay: 3s;
}

.wave4 {
  animation-delay: 4.5s;
}

@keyframes wv {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  30% {
    opacity: 0.7;
    transform: scale(0.65);
  }

  70% {
    opacity: 0.1;
    transform: scale(0.85);
  }

  100% {
    opacity: -0.2;
    transform: scale(1);
  }
}
</style>