import { Text } from "rimble-ui";
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';

class Base extends Component {

  // Utils
  functionsUtil = null;

  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount(){
    this.loadUtils();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  render() {
    const cardProps = {
      p:3,
      mb:2,
      width:'49%',
      ...this.props.cardProps
    };

    return (
      <DashboardCard
        cardProps={cardProps}
        title={this.props.title}
        titleProps={{
          fontSize:1,
          fontWeight:3,
        }}
        titleParentProps={{
          mt:0,
          ml:0
        }}
        description={this.props.description}
      >
        {
          this.props.value ? (
            <Text
              mt={1}
              fontSize={[2,3]}
              color={'statValue'}
              {...this.props.textProps}
            >
              {this.props.value}
            </Text>
          ) : (this.props.children || null)
        }
      </DashboardCard>
    );
  }
}

export default Base;
