<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFileHandler } from '../composables/file-handler';

// Props & emits

defineProps({
    path: {
        type: String,
        required: true
    }
})

const current = ref<FileSystemDirectoryHandle>()
const previous = ref<FileSystemDirectoryHandle>()

// entries
const handler = useFileHandler()

const entries = ref<(FileSystemDirectoryHandle | FileSystemFileHandle)[]>([])

async function setEntries(){
    entries.value = []

    if (!current.value) return

    for await (const entry of current.value.values()) {
        entries.value.push(entry)
    }
}

watch(current, setEntries)

watch(handler, (newHandler) => {
    if (!newHandler) return

    current.value = newHandler
},  { immediate: true })

// actions

function onEntryClick(entry: FileSystemDirectoryHandle | FileSystemFileHandle) {
    if (entry.kind === 'directory') {
        previous.value = current.value
        current.value = entry
    }
}

function goBack() {
    if (!previous.value) return

    current.value = previous.value
    previous.value = undefined
}

// search

const search = ref('')

async function doSearch() {
    if (!search.value) return

    if (!handler.value) return

    const paths = search.value.split('/')

    const lastPath = paths.pop() as string

    let currentFolder = handler.value

    for await (const path of paths) {

        const entry = await currentFolder.getDirectoryHandle(path, { create: false })

        if (!entry || entry.kind !== 'directory') return

        currentFolder = entry
    }

    let result: FileSystemDirectoryHandle | FileSystemFileHandle | undefined = undefined

    for await (const entry of currentFolder.values()) {
        if (entry.name === lastPath) {
            result = entry
            break
        }
    }
        
    if (!result) return

    previous.value = current.value

    if (result.kind === 'file') {
        current.value = currentFolder
        return
    }

    if (result.kind === 'directory') {
        current.value = result
        return
    }

}


</script>
<template>
    <div>
        <div class="flex" >
            <button
                @click="current = handler"
                class="px-4 py-2 bg-blue-500 text-white rounded mr-2 "
                v-text="'🏠'"
            />
    
            <button
                @click="setEntries"
                class="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                v-text="'🔄'"
            />
    
            <div class="flex" >
                <input v-model="search" class="px-4 py-2 outline outline-1 outline-gray-500 rounded focus:outline-teal-500 mr-2" placeholder="/my-foder">
                <button
                    @click="doSearch"
                    class="px-4 py-2 bg-blue-500 text-white rounded"
                    v-text="'🔎'"
                />
            </div>

        </div>


        <ul>
            <li
                v-for="entry in entries"
                :key="entry.name"
                class="border my-2 p-2 cursor-pointer"
                :class="entry.kind === 'directory' ? 'bg-gray-200' : 'bg-gray-100'"
                @click="onEntryClick(entry)"

            >
                {{ entry.name }}
            </li>
        </ul>
    </div>
</template>