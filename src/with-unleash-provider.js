import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UnleashContext from './unleash-context';

// Gets the display name of a JSX component for dev tools
const getDisplayName = P => P.displayName || P.name || 'Component';

const withUnleashProvider = Page =>
  class extends Component {
    static displayName = `withUnleashProvider(${getDisplayName(Page)})`;

    static async getInitialProps(props) {
      // Only serverside
      const toggles = props.ctx && props.ctx.req ? props.ctx.req.toggles : {};

      const componentProps = Page.getInitialProps && (await Page.getInitialProps(props));

      return { ...componentProps, toggles };
    }

    static propTypes = {
      toggles: PropTypes.object.isRequired
    };

    constructor(props) {
      super(props);
      const { toggles } = this.props;
      this.state = {
        toggles
      };
    }

    render() {
      return (
        <UnleashContext.Provider value={this.state}>
          <Page {...this.props} />
        </UnleashContext.Provider>
      );
    }
  };
export default withUnleashProvider;
