import React from 'react';
import ReactDOM from 'react-dom';

const name = 'Josh Perez';
const element = <h1>Hello,dfdfdfdf  {name}</h1>;


document.addEventListener("DOMContentLoaded", function() { 

  console.log(document.getElementById('ge-app'))

  ReactDOM.render(
    element,
    document.getElementById('ge-app')
  );

});