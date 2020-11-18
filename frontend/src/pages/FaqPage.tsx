import React, {ReactElement} from 'react'
import CollapsibleHeader from '../components/FAQ/CollapsibleHeader';
import axios from 'axios'

const dummyData = [
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

const FaqPage= (): ReactElement => {
    const [data, setData] = React.useState(dummyData)
    React.useEffect(() => {
      axios.get("http://localhost:8080/")
      .then(response => {
        console.log(response);
        setData(response.data)
        console.log(data);
        
      })
      .catch(error => {
        console.log('error',error);
      })

    },[])
    return <div className="App">
    <div className="faq-questions">
      {data.map((section, index) => (<CollapsibleHeader key={index} {...section} />))}
    </div>
  </div>
}

export default FaqPage;