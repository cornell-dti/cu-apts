import React, { ReactElement } from 'react';
import CollapsibleHeader from './CollapsibleHeader';
import { FAQData } from '../../pages/FAQPage';

type Props = {
  readonly data: FAQData[];
};

export default function FAQs({ data }: Props): ReactElement {
  return (
    <div className="App">
      <div className="faq-questions">
        {data.map((info, index) => (
          <CollapsibleHeader key={index} {...info} />
        ))}
      </div>
    </div>
  );
}
