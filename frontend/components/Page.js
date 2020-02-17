import React from 'react'
import styled, { ThemeProvider, injectGlobal } from 'styled-components'
import Header from '../components/Header'
import Meta from '../components/Meta'

const theme = {
  red: '#00B8D4',
  devblue: '#00B8D4',
  black: '#393939',
  grey: '#3A3A3A',
  lightgrey: '#E1E1E1',
  offWhite: '#EDEDED',
  maxWidth: '1600px',
  bs: '0 12px 24px 0 rgba(0, 0, 0, 0.09)',
}

const StyledPage = styled.div`
  background: white;
  color: ${props => props.theme.black};
`
const Inner = styled.div`
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
  padding: 2rem;
`
injectGlobal`
@font-face {
  font-family: 'Space Mono';
  src: url('../static/SpaceMono-Regular.woff') format('woff2');
  font-weight: normal;
  font-style: normal;
} 


  html {
    box-sizing: border-box;
    font-size: 10px;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    padding: 0;
    margin: 0;
    font-size: 1.5rem;
    line-height: 2;
    font-family: 'Space Mono';
  }
  a {
    text-decoration: none;
    color: ${theme.black};
  }
  h1,
  h2 {
    text-align: center;
  }
`

class Page extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <StyledPage>
          <Meta />
          <Header />
          <Inner>{this.props.children}</Inner>
        </StyledPage>
      </ThemeProvider>
    )
  }
}

export default Page