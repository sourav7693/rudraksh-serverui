import React, { useState } from 'react'
import ManageCommunicationProvider from '../components/communication/ManageCommunicationProvider'
import Helmet from 'react-helmet'

const CommuicationProvider = () => {
     
  return (
    <div className=' self-padding'>
      <Helmet>
        <title>Ganapati Rudrakshaam Admin | Communication Provider</title>
      </Helmet>
        <div className=' flex flex-col gap-6'>
            <div>
                <ManageCommunicationProvider/>

            </div>
        </div>
      
    </div>
  )
}

export default CommuicationProvider
