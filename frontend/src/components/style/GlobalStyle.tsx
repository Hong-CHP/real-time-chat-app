import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    margin: 0;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #0b6100;
    background-color: black;
  }

  a {
    color: #0b6100;
    text-decoration: none;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  Input {
    border: 1px solid #0b6100;
    color: #0b6100;
    background-color: transparent;
    outline: none;
  }

  button {
    border: 1px solid #0b6100;
    color: #0b6100;
    background-color: transparent;
  }
`;

export default GlobalStyle;