import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon } from 'lucide-react'
import React from 'react'
import { assets } from '../../assets/assets'


const AdminSidebar = () => {

    const user = {
        firstName: 'Admin',
        lastName: 'User',
        imageUrl: assets.profile,
    }

    const adminNavlinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
        { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon },
        { name: 'List Shows', path: '/admin/list-show', icon: ListIcon },
        { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon },
    ]


    return (

        <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full
        border-r border-gray-300/30 text-sm">
            <img className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto" src={user.imageUrl} alt="sidebar" />
        </div>
    )

}

export default AdminSidebar