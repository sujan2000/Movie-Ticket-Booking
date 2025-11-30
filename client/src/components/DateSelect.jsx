import React from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLastIcon } from 'lucide-react'

const DateSelect = ({dateTiem, id}) => {
  return (
    <div id="dateSelect" className="pt-30">
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 
      relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
       <BlurCircle  top="-100px" left="-100px"/>
       <BlurCircle  top="100px" right="0px"/>
       <div>
        <p className="text-lg font-semibold">Choose Date</p>
        <div className="flex items-center gap-6 text-sm mt-5">
          <ChevronLastIcon width={28}/>
        </div>
       </div>
      </div>
    </div>
  )
}

export default DateSelect