import { createGlobalStyle } from 'styled-components';
import bodyFontRegular from '../assets/fonts/OpenSans-Regular.ttf';
import bodyFontSemiBold from '../assets/fonts/OpenSans-SemiBold.ttf';

const Typography = createGlobalStyle`
  @font-face {
    font-family: 'Open Sans';
    src: url(${bodyFontRegular});
    font-weight: 400;
  }

  @font-face {
    font-family: 'Open Sans';
    src: url(${bodyFontSemiBold});
    font-weight: 500;
  }

  html {
    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    color: var(--black);
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  p, li {
    letter-spacing: 0.5px;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
  }
`;

export default Typography;
