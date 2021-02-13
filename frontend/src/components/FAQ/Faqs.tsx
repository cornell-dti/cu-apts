import React, { ReactElement } from 'react';
import CollapsibleHeader from './CollapsibleHeader'

type Props = {
  readonly data: {
    headerName: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  }[];
}

export default function Faqs({ data }: Props): ReactElement {

  return (
    <div className="App">
      <div className="faq-questions">
        {data.map((info, index) => (<CollapsibleHeader key={index} {...info} />))}
      </div>
    </div>
  )
}