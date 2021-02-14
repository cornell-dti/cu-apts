import React, { ReactElement } from 'react'
import FAQNavBar from '../components/FAQ/FAQNavBar'
import FAQHelp from '../components/FAQHelp/FAQHelp'
import Faqs from '../components/FAQ/Faqs'

const data = [
  {
    headerName: "Section 1",
    faqs: [
      {
        question: "Question 1",
        answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
      },
      {
        question: "Question 2",
        answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
      },
      {
        question: "Question 3",
        answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident"
      }
    ]
  }
]

const FaqPage = (): ReactElement => {
  return (

    <div className='faq-page'>
      <FAQNavBar />
      <div className='faq-help'>
        <FAQHelp />
      </div>

      <div className='faq-header-title'>
        <h2>Frequently Asked Questions</h2>
      </div>
      <Faqs data={data} />
    </div>
  )
}

export default FaqPage;