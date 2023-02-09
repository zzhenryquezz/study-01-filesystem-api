<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { provideFileHandler } from './composables/file-handler';

import { get, set } from 'idb-keyval'

import FileList from './components/FileList.vue';

const handler = ref<FileSystemDirectoryHandle>()
const permission = ref<PermissionState>()

provideFileHandler(handler)

async function pickFolder() {
  const folderHandler = await window.showDirectoryPicker();

  handler.value = folderHandler
}

async function requestPermission() {
  if (!handler.value) return

  permission.value = await handler.value.requestPermission()
}

onMounted(async () => {
  const storedHandler = await get('handler')

  if (!storedHandler) return

  handler.value = storedHandler
})

watch(handler, async (newHandler) => {
  await set('handler', newHandler)

  if (!newHandler) {
    permission.value = undefined
    return
  }

  permission.value = await newHandler.queryPermission()
})



</script>
<template>
  <div class="h-screen w-screen flex items-center justify-center bg-gray-100" >
    <div class="w-[500px] border" >
      <div class="border-b py-2 px-4" >
          <button v-if="handler" @click="requestPermission" class="px-4 py-2 bg-teal-500 text-white mr-4">
            Re-open "{{ handler?.name }}"
          </button>
          <button @click="pickFolder" class="px-4 py-2 bg-teal-500 text-white" >
            Pick folder
          </button>
      </div>

      <div class="py-2 px-4" v-if="permission === 'granted'">
        <FileList path="." />
      </div>
  
    </div>
  </div>
</template>