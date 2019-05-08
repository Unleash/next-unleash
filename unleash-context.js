import * as React from 'react';

const ThemeContext = React.createContext(
  // default values used by a Consumer when it does not have a
  // matching Provider above it in the tree, useful for testing
  {
    toggleContext: {}
  }
);

export default ThemeContext;
