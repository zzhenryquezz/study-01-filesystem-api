import { provide, inject, Ref, InjectionKey } from 'vue'

const key = Symbol('file-handler') as InjectionKey<Ref<FileSystemDirectoryHandle | undefined>>

export const provideFileHandler = (fileHandlerRef: Ref<FileSystemDirectoryHandle | undefined>) => {
    provide(key, fileHandlerRef)
}

export const useFileHandler = () => {
    const fileHandler = inject(key)
    
    if (!fileHandler) {
        throw new Error('No file handler provided')
    }

    return fileHandler
}


