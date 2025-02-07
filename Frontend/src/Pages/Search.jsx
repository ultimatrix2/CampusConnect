import { useSelector } from 'react-redux';
import './chat.css'

function Search({searchKey, setSearchKey}){
    
const handleSearch = (e) => {
    e.preventDefault();
        console.log('Search key:', searchKey);
}

    return (
        <div className="user-search-area">
            <form className='searchForm' onSubmit={(e)=>handleSearch(e)}>
            <input type="text" 
                className="user-search-text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)} />
            </form>
        </div>
    )
}

export default Search;