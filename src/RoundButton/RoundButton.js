import { Button } from "rimble-ui";
import React, { Component } from 'react';

class RoundButton extends Component {
  render() {
    const buttonProps = Object.assign({
      width:1,
      fontSize:2,
      fontWeight:4,
      height:'45px',
      boxShadow:null,
      borderRadius:1,
      fontFamily:'ctas',
      mainColor:'primaryCtaBg',
      contrastColor:'primaryCtaText'
    },this.props.buttonProps);

    return (
       <Button
        {...buttonProps}
        onClick={this.props.handleClick}
       >
        {this.props.children}
       </Button>
    );
  }
}

export default RoundButton;
