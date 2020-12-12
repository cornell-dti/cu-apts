import React, {ReactElement} from 'react'
import SearchBar from '../components/Home/SearchBar'
import NavBar from '../components/Home/NavBar'
import SectionDivider from '../components/Home/SectionDivider'
import ApartmentCard from '../components/Home/ApartmentCard'

const HomePage= (): ReactElement => {
    return <div className='Home'>
        <NavBar />   
        <SearchBar />   
        <SectionDivider /> 
        <div className="container-fluid">
            <div className="row flex-row flex-nowrap pt-3">
                <div className="col-4"><ApartmentCard address="117 Eddy St" company="Ithaca Renting Company" bedsAndBaths="5 Br | 2 B" amenities={false} price="$800" percentReview="90%" numReviews="5 Reviews"/></div> 
                <div className="col-4"><ApartmentCard address="117 Eddy St" bedsAndBaths="1 Br | 2 B" amenities={false} reviews={true} reviewStars="3.62 (12)"/></div>
                <div className="col-4"><ApartmentCard address="117 Eddy St" bedsAndBaths="5 Br | 2 B" amenities={true} price="$800" topReviewDisplay="3.62 (12)"/></div>  
            </div>
        </div>
    </div>
}

export default HomePage;