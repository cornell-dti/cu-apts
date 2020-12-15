
export type Faq = {
    question: string;
    answer: string
}

export type Section = {
    headerName: string;
    faqs: [Faq]
}

export type Review = {
    user_id: string;
    apt_id: string;
    overall_rating: number;
    landlord_rating: number;
    review_text: string;
    date: string;
}

export type Apt = {
    apt_id: string;
    address: string;
    price: number;
    landlord: string;
    avg_rating: number;
    num_reviews: number;
    num_bd: number;
    num_bath: number
}


