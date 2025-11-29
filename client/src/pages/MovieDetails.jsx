import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'

const MovieDetails = () => {
  
  const {id} = useParams()
  const [show, setShow] = useState(null)

  const getShow =async ()=>{
    const show =dummyShowsData.find(show => show._id === id)
    setShow({
      movie: show,
      dateTime: dummyDateTimeData
    })
  }

  return (
    <div>

    </div>
  )
}

export default MovieDetails