<script setup lang="ts">
import { ref } from 'vue';
const visible = ref()
GM_log('log in App.vue')
const gmInfo = JSON.stringify(GM_info, null, 2)
</script>

<template>
<div :class="['vite-plugin-tampermonkey', { 'vite-plugin-tampermonkey--show': visible }]"  @click="visible = !visible">
  <span class="vite-plugin-tampermonkey-name">
    V<span class="vite-plugin-tampermonkey-name-detail">ite-</span>P<span class="vite-plugin-tampermonkey-name-detail">lugin-</span>T<span class="vite-plugin-tampermonkey-name-detail">ampermonkey</span>
  </span>
  <pre v-if="visible">
    {{ gmInfo }}
  </pre>
</div>
</template>

<style scoped lang="less">
.vite-plugin-tampermonkey {
  cursor: pointer;
  z-index: 10000;
  position: fixed;
  right: 10px;
  bottom: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  font-size: 18px;
  background-color: #232323;
  color: #f5f5f5;
  box-shadow: rgb(0 0 0 / 25%) 0px 0px 15px 0px;
  transition: all .6s;
  &-name {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  &-name-detail {
    transition: all .5s;
    white-space: nowrap;
    opacity: 0;
    max-width: 0;
  }
  &--show {
    width: 50vw;
    height: 50vh;
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%);
    background-color: #f5f5f5;
    color: #232323;
    border-radius: 12px;
    font-size: 40px;
    font-weight: 600;
  }
  &--show &-name-detail {
    opacity: 1;
    max-width: 260px;
    font-weight: 400;
  }
  pre {
    font-size: 12px;
    height: 50%;
    width: 60%;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 6px;
    }
  }
}
</style>
