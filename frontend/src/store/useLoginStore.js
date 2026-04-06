import {create } from 'zustand';
import {persist} from 'zustand/middleware'

const useLoginStore = create(
    persist((set)=>({
        step:1,
        setStep:(step)=>set({step}),
        setUserPhonedata:(data)=>set({userPhonedata:data}),
        resetLoginState:()=> set({step:1,userPhonedata:null})

    }),
{name:'login-storage',
    partialize:(state) =>({step:state.step,userPhonedata:state.userPhonedata})
})
)

export default useLoginStore;