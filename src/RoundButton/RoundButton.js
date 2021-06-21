import { Button } from "rimble-ui";
import React, { Component } from 'react';

class RoundButton extends Component {
  render() {
    const buttonProps = Object.assign({
      width:1,
      fontWeight:3,
      height:'45px',
      fontSize:[2,3],
      boxShadow:null,
      borderRadius:4,
      mainColor:'blue'
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
