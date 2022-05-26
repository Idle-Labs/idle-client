import { Button } from "rimble-ui";
import theme from "../theme-dark";
import React, { Component } from 'react';

class RoundButton extends Component {
  state = {
    buttonState:'default'
  };

  render() {
    const ctaType = this.props.type || 'primary';

    const buttonProps = Object.assign({
      width:1,
      fontSize:2,
      fontWeight:4,
      height:'45px',
      boxShadow:null,
      borderRadius:1,
      fontFamily:'ctas',
      border:theme.colors.ctas[ctaType][this.state.buttonState].border,
      contrastColor:theme.colors.ctas[ctaType][this.state.buttonState].text,
      mainColor:theme.colors.ctas[ctaType][this.state.buttonState].background
    },this.props.buttonProps);

    return (
       <Button
        {...buttonProps}
        onMouseEnter={(data, e) => {
          this.setState({
            buttonState:'hover'
          });
        }}
        onMouseLeave={(data, e) => {
          this.setState({
            buttonState:'default'
          });
        }}
        onClick={this.props.handleClick || this.props.onClick}
       >
        {this.props.children}
       </Button>
    );
  }
}

export default RoundButton;
