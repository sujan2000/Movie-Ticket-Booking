import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../../assets/assets'

const ListBookings = () => {

  const currency = import.meta.env.VITE_CURRENCY

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getAllBookings = async () => {
    setBookings(dummyBookingData)
    setIsLoading(false)
  }

  useEffect(() => {
    getAllBookings()
  }, [])

  return (
    <div>

    </div>
  )
}

export default ListBookings