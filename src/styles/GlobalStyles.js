import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --orange: #F0B354;
    --black: #2E2E2E;
    --white: #FFFFFF;
    --gray: rgb(0 0 0 / 10%);
  }
  
  body {
    margin: 0;
  }

  img {
    max-width: 100%;
  }
`;

export default GlobalStyles;
