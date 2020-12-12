import React, { ReactElement } from 'react';
import {
  Card, CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, Button
} from 'reactstrap';
import ApartmentImg from "../images/apartment-sample.png";
import MapIcon from "../images/map-pin.png";
import RedHeartIcon from "../images/heart_outline_red.png";
import PriceIcon from "../images/tag-outline.png";
import SmileyFace from "../images/happy.png";
import WhiteHeartIcon from "../images/heart_outline.png";
interface Props {
  address: String;
  company?: String;
  bedsAndBaths?: String;
  amenities: Boolean;
  reviews?: Boolean;
  reviewStars?: String;
  price?: String;
  topReviewDisplay?:String;
  percentReview?:String;
  numReviews?:String;
}

const ApartmentCard = (props: Props): ReactElement =>{
  
  function renderAdressSection(){
    return props.reviews?<div><div style={{display:"inline-block"}}>
      <img src={RedHeartIcon} className="pr-2 pb-2"></img>
      <CardSubtitle tag="h6" className="pb-2" style={{color:"black", display:"inline-block"}}>{props.reviewStars}</CardSubtitle>
      </div>
      {renderPrice()}
      <div>
      <CardTitle tag="h5" className="pb-1 mb-2" style={{color:'#495057'}}>{props.address}</CardTitle>
      </div>
      </div>:
      <div>
      <div style={{display:"inline-block"}}>
      <img src={MapIcon} className="pb-3 pr-2"></img>
      <CardTitle tag="h5" className="pb-1 mb-2" style={{color:'#495057', display:"inline-block"}}>{props.address}</CardTitle>
      </div>
      {renderPrice()}
      </div>;
  }

  function renderPrice(){
    return props.price ? <div style={{display:"inline-block"}}> 
    <img src={PriceIcon} className="pb-3 pr-2" style={{display:"inline-block", position:"absolute", right:50, top:200}}></img>
    <CardSubtitle tag="h6" className="" style={{color:"black", display:"inline-block", position:"absolute", right:10, top:205}}>{props.price}</CardSubtitle>
    </div>:
    <div style={{display:"inline-block"}}> 
    <CardSubtitle tag="h6" className="" style={{color:"black", display:"inline-block", position:"absolute", right:20, top:205}}>$$</CardSubtitle>
    </div>;
  }

  function renderOptionalTopReviewBar(){
    if(props.topReviewDisplay){
    return<div className="text-center font-weight-bold review-rectangle"style={{position:"absolute", right:"0px", top:"100px", width:"105px" }}><img src={WhiteHeartIcon} className="pr-2" style={{paddingBottom: "3px"}}></img>{props.topReviewDisplay}</div>;
    }
    else if(props.percentReview){
    return <div className="text-center font-weight-bold review-rectangle" style={{position:"absolute", right:"0px", top:"100px", width:"82px"}}>{props.percentReview}<img src={SmileyFace} className="pl-2" style={{paddingBottom: "4px"}}></img></div>;
    }
  }

  return(
    <div>
      <Card className="shadow rounded">
        <CardImg top width="100%" src={ApartmentImg} alt="Apartment Image" />
        {renderOptionalTopReviewBar()}
        <CardBody>
        {renderAdressSection()}
        {props.company && <CardSubtitle tag="h6" className="pb-4">{props.company}</CardSubtitle>}
        <CardSubtitle tag="h6" className="pb-2" style={{color:"#495057"}}>{props.bedsAndBaths}</CardSubtitle>
        {props.amenities && <div style={{}} className="text-center mt-2 amenities-button">AMENITIES</div>}
        {props.numReviews && <CardText className="pb-2" style={{position:"absolute", right:"10px", bottom:"10px", fontSize:"14px"}}>{props.numReviews}</CardText>}
        </CardBody>
      </Card>
    </div>
  );
}

export default ApartmentCard;

