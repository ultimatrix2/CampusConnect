import React from 'react'
import Search from './Search'
import UsersList from './UsersList'
import { useState } from 'react'  


export default function Sidebar() {
    const [searchKey, setSearchKey] = useState('');
    return (
        <div className="app-sidebar">
            <Search 
                searchKey={searchKey} 
                setSearchKey={setSearchKey}
            />
            <UsersList 
                searchKey={searchKey}
            />
        </div>
    )
}
