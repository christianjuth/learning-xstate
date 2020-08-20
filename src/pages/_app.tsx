import React from 'react';
import { AppProps } from 'next/app';
import { createStyleSheet } from '../utls';
// @ts-ignore
import Div100vh from 'react-div-100vh';
import '../index.css';

function App({
  Component, 
  pageProps
}: AppProps) {

  return (
    <Div100vh>
      <div style={styles.page}>
        <Component {...pageProps}/>
      </div>
    </Div100vh>
  );

}

const styles = createStyleSheet({
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%'
  }
});

export default App;