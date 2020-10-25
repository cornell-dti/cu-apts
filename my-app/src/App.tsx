import React from 'react';
import logo from './logo.svg';
import './App.css';
import CollapsableQuestion from './components/FAQ/CollapsableQuestion';

function App() {

  const props = {
    answer: "Anim pariatur cliche reprehenderit enim eiusmod high life accusamus terry richardson ad squid. Nihilanim keffiyeh helvetica, craft beer labore wes anderson crednesciunt sapiente ea proident",

    question: "How are you?"
  }

  return (
    <div className="App">
      <CollapsableQuestion {...props} />
    </div>
  );
}

export default App;
