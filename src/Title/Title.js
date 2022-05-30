import { Heading } from "rimble-ui";
import React, { Component } from 'react';

class Title extends Component {
  render() {
    const props = {
      fontWeight:4,
      color:'primary',
      textAlign:'center',
      fontFamily:'titles',
      lineHeight:'initial',
    };

    // Get title height
    const as = this.props.as && Heading[this.props.as] ? this.props.as : 'h1';
    const titleType = parseInt(as.substr(1));

    // Set font size for h1
    if (titleType === 1){
      props.fontSize = [5,6];
    } else if (titleType>=3){ // Reduce weight for h3...h6
      props.fontWeight = 3;
    }

    // Replace props
    if (this.props && Object.keys(this.props).length){
      Object.keys(this.props).forEach(p => {
        props[p] = this.props[p];
      });
    }

    const HeadingComponent =  this.props.component ? this.props.component : Heading[as];

    return (
      <HeadingComponent
        {...props}
      >
        {this.props.children}
      </HeadingComponent>
    );
  }
}

export default Title;
