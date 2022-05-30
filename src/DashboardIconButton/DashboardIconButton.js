import Title from '../Title/Title';
import React, { Component } from 'react';
import { Flex, Icon, Text, Image } from "rimble-ui";
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';

class DashboardIconButton extends Component {

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
    return (
      <DashboardCard
        cardProps={{
          pr:2,
          py:[2,3],
          pl:[2,3],
        }}
        isActive={false}
        isInteractive={true}
        handleClick={this.props.handleClick}
      >
        <Flex
          height={'100%'}
          alignItems={'center'}
          flexDirection={'row'}
          justifyContent={'center'}
        > 
          <Flex
            px={[1,0]}
          >
            {
              this.props.icon ? (
                <Icon
                  name={this.props.icon}
                  size={this.props.isMobile ? '1.8em' : '3em'}
                  color={this.props.iconColor ? this.props.iconColor : 'redeem'}
                />
              ) : this.props.image && (
                <Image
                  src={this.props.image}
                  width={this.props.isMobile ? '1.8em' : '2.7em'}
                  height={this.props.isMobile ? '1.8em' : '2.7em'}
                />
              )
            }
          </Flex>
          <Flex
            ml={[2,3]}
            flexDirection={'column'}
            alignItems={'flex-start'}
            justifyContent={'center'}
          >
            <Title
              as={'h4'}
              fontSize={[1,3]}
            >
              {this.props.title}
            </Title>
            <Text
              fontWeight={2}
              fontSize={[0,2]}
              color={'cellText'}
            >
              {this.props.text}
            </Text>
          </Flex>
          <Icon
            align={'center'}
            color={'cellText'}
            name={'KeyboardArrowRight'}
            size={this.props.isMobile ? '1.8em' : '2.5em'}
          />
        </Flex>
      </DashboardCard>
    );
  }
}

export default DashboardIconButton;
