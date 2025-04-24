// eslint-disable-next-line no-use-before-define
import React from 'react';
import PropertyCard from '../components/PropertyCard';

interface NewsletterProps {
  firstName?: string;
  headline?: string;
  landlordReview?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({
  firstName = 'Friend',
  headline = 'Check out these properties!',
  landlordReview = '',
}) => (
  <div>
    <h1>Hello {firstName}!</h1>
    <h2>{headline}</h2>
    {landlordReview && <p>Landlord Review: {landlordReview}</p>}
    <PropertyCard
      propertyName="Collegetown Plaza"
      address="111 Dryden Rd"
      priceRange="$1K - $1.2K"
      bedrooms="2-4 Bed"
      imageUrl="https://your-image-url.com/property.jpg"
    />
  </div>
);

// Add defaultProps to satisfy the ESLint rule
Newsletter.defaultProps = {
  firstName: 'Friend',
  headline: 'Check out these properties!',
  landlordReview: '',
};

export default Newsletter;
