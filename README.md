# next-unleash
The goal of this module is to make it easy to use Unleash with next.js. 

The main motivation is to make sure toggles are available both during Server-Side-Rendering (SSR) 
and during local page transitions. 

The general idea is that Unleash Node.js SDK is used at the server side, and that all toggles are 
propagated as part of SSR. 

**This project is considered a POC. APIs and components might change**

## Not solved yet:
- Client side update of toggles. We should use SSE or similar to update the client toggles when changes are detected. Currently these changes are only picket up during reload (SSR). 
- A wrapper component. It would provably be easier to use if there where some kind of react component you could use to wrap your components. 
- Figure out if there are ways to configure the middleware with next.js so that users don't have to introduce custom server. 
- Make it easy to configure toggles you care about in the app.


## How to use

### Step 1: Express middleware setup

First you will need to configure a [custom-server](https://github.com/zeit/next.js/tree/canary/examples/custom-server-express) with next.js in order to make the toggles available during SSR. 

```javascript
//server.js
  
const express = require('express');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const { initialize, isEnabled } = require('unleash-client');
const handle = app.getRequestHandler();

initialize({
  url: 'https://unleash.herokuapp.com/api/',
  appName: 'next-unleash-demo',
});

app.prepare().then(() => {
  const server = express()
  
  //Unleash middleware
  server.use((req, res, nextCall) => {
    req.toggles = {
      newPriceModel: isEnabled('unleash-x.newPriceModel'),
      reducesRiskLink: isEnabled('landing.reducesRiskLink'),
      betaKillSwitch: isEnabled('landing.betaKillSwitch')
    };
    nextCall();
  });

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
```


### Step 2: Wrap App with the Unleash provider

You will need to wrap your `App` component with the unleash-provider. 

```javascript
//_app.js

import React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';

import JssProvider from 'react-jss/lib/JssProvider';
import getPageContext from '../src/getPageContext';

import { withUnleashProvider } from 'next-unleash';

class MyApp extends App {
  constructor(props) {
    super(props);
    this.pageContext = getPageContext();
  }

  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <Head>
          <title>My app</title>
        </Head>
        <Component pageContext={this.pageContext} {...pageProps} />
      </Container>
    );
  }
}

// Wrap the entire app with the unleash provider
export default withUnleashProvider(MyApp);
```

### Step 3: Access toggles in component

When you want to access Unleash feature toggles in a component you can wrap the component using `withUnleash`:

```javascript
import withUnleash from 'next-unleash';

import React from 'react';
import PropTypes from 'prop-types';
import { withUnleash } from './unleash/withUnleash';

class MyComponent extends React.Component {

  render() {
    const { toggles } = this.props;

    return (
      <div>
        {toggles.demo ? <p>Enabled</p> : <p>disabled</p>}
      </div>
    );
  }
}

MyComponent.propTypes = {
  toggles: PropTypes.object.isRequired
};

export default withUnleash(MyComponent);


```
