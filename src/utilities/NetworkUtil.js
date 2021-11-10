import React from "react";

import WrongNetworkBanner from "./components/WrongNetworkBanner";

class NetworkUtil extends React.Component {
  render() {
    return (
      <div>
        { this.props.network.isSupportedNetwork === false && this.props.web3 &&
          <WrongNetworkBanner
            network={this.props.network}
          />
        }
      </div>
    );
  }
}

export default NetworkUtil;
