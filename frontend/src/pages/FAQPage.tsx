import React, { ReactElement } from 'react'
import FAQNavBar from '../components/FAQ/FAQNavBar'
import FAQHelp from '../components/FAQHelp/FAQHelp'
import CollapsibleHeader from '../components/FAQ/CollapsibleHeader'

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

const FAQs = (): ReactElement => {
  return <div className="App">
    <div className="faq-questions">
      {data.map((section, index) => (<CollapsibleHeader key={index} {...section} />))}
    </div>
  </div>
}


const FAQPage = (): ReactElement => {
  return (

    <div className='faq-page'>
      <FAQNavBar />
      <div className='faq-help'>
        <FAQHelp />
      </div>

      <div className='faq-header-title'>
        <h2>Frequently Asked Questions</h2>
      </div>
      <FAQs />

    </div>
  )
}

export default FAQPage;