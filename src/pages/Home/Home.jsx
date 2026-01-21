import React from 'react'
import AdminLayoutWithAuth from '../../components/layout/SidebarLayout'
import DashboardPage from '../../components/DasbordCompo'

const Home = () => {
  return (
    <AdminLayoutWithAuth>
        <DashboardPage/>
    </AdminLayoutWithAuth>
  )
}

export default Home