import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'

const AddShows = () => {

  const currency = import.meta.env.VITE_CURRENCY
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [dateTimeInput, setDateTimeInput] = useState("")
  const [showPrice, setShowPrice] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)


  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData);
  }

  useEffect(() => {
    fetchNowPlayingMovies()
  },)

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

    </>
  ) : (
    <Loading />
  )
}

export default AddShows