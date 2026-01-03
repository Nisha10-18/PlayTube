import React , { useEffect, useState} from 'react'
let alertHandle;

export const showCustomAlert = (message)=>{
    if(alertHandle){
        alertHandle(message)
    }
}

function CustomAlert() {
    const [mess,setMess] = useState("")
    const [visible,setVisible] = useState(false)

    useEffect(()=>{
        alertHandle = (message) =>{
            setMess(message)
            setVisible(true)
        }
    },[])
    return (
         visible && (<div className='fixed inset-0 flex items-start justify-center pt-[50px] bg-black/50 z-50'>
            <div className='bg-[#202124] text-white rounded-lg shadow-lg p-6 w-80'>
                <p className='text-sm'>{mess}</p>
                <div className = 'flex justify-end mt-10'>
                    <button className = 'bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full text-sm'
                    onClick={()=>setVisible(false)}>Ok</button>
            </div>
            </div>
        </div>)
    )
}

export default CustomAlert