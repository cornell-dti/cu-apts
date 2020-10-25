import React from 'react';
import './App.css';
import CollapsableQuestion from './components/FAQ/CollapsableQuestion';

function App() {

  const data = [
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
    },
  ]

  return (
    <div className="App">
      <div className="faq-questions">
        {data.map((questionSet, index) => (<CollapsableQuestion key={index} {...questionSet} />))}
      </div>
    </div>
  );
}

export default App;
