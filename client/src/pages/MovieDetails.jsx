import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'

const MovieDetails = () => {

  const { id } = useParams()
  const [show, setShow] = useState(null)

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id)
    setShow({
      movie: show,
      dateTime: dummyDateTimeData
    })
  }

  useEffect(() => {
    getShow()
  }, [id])

  return show ? (
    <div className="px-6 md:px-16 lg:px pt-30 md:pt-50">
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
             <img src={show.movie.poster_path} alt="" className="max-md:mx-auto rounded-xl h-104
              max-w-70 object-cover"/> 
        </div>
    </div>
  ) : (
    <div>
      Loading...
    </div>
  )
}

export default MovieDetails