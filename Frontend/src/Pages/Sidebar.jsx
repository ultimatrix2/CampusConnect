import React, { useEffect } from 'react'
import Search from './Search'
import UsersList from './UsersList'
import { useState } from 'react'  
import './chat.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers } from '../redux/userSlice'

export default function Sidebar({search}) {
    
    const [searchKey, setSearchKey] = useState('');
    const dispatch = useDispatch();
    const allUsers = useSelector((state) => state.user.allUsers);
  
    useEffect(() => {
      dispatch(fetchAllUsers()); 
    }, [dispatch]);
    return (
        <div className="app-sidebar">
            <Search 
                searchKey={searchKey} 
                setSearchKey={setSearchKey}
            />
            <UsersList 
                searchKey={searchKey || search}
            />
        </div>
    )
}
