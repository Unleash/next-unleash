import * as React from 'react';
import UnleashContext from './unleash-context';

function withUnleash(Component) {
  return function ThemeComponent(props) {
    return <UnleashContext.Consumer>{contexts => <Component {...props} {...contexts} />}</UnleashContext.Consumer>;
  };
}

export default withUnleash;
