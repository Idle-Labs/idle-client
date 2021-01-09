import React, { Component } from 'react';
import { Icon, Text, Flex } from "rimble-ui";
import DashboardCard from '../DashboardCard/DashboardCard';

class IconBox extends Component {

  render() {
    const cardProps = Object.assign({
      p:3
    },this.props.cardProps);
    return (
      <DashboardCard
        cardProps={cardProps}
      >
        <Flex
          alignItems={'center'}
          flexDirection={'column'}
        >
          <Icon
            size={'1.8em'}
            color={'cellText'}
            name={this.props.icon ? this.props.icon : 'InfoOutline'}
            {...this.props.iconProps}
          />
          {
            this.props.text && 
              <Text
                mt={2}
                fontSize={2}
                color={'cellText'}
                textAlign={'center'}
                dangerouslySetInnerHTML={{
                  __html:this.props.text
                }}
                {...this.props.textProps}
              />
          }
          {
            this.props.children
          }
        </Flex>
      </DashboardCard>
    );
  }
}

export default IconBox;
