import {create } from 'zustand';
import {persist} from 'zustand/middleware'

const usethemeStore = create(
    persist((set)=>({
        theme:'light',
        setTheme:(theme)=>set({theme}),

    }),
{name:'theme-storage',
    getStorage: () => localStorage
})
)

export default usethemeStore;