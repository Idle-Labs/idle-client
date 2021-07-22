import React, { Component } from 'react';
import { Flex, Text, Icon, Image } from "rimble-ui";
import DashboardCard from '../DashboardCard/DashboardCard';

class CardIconButton extends Component {
  render() {
    const cardProps = Object.assign({
      py:1,
      width:'auto',
      px:['12px',3],
    },this.props.cardProps);

    return (
       <DashboardCard
         cardProps={cardProps}
         isInteractive={true}
         isActive={this.props.isActive}
         isDisabled={this.props.isDisabled}
         handleClick={this.props.handleClick}
       >
         <Flex
           my={1}
           alignItems={'center'}
           flexDirection={'row'}
           justifyContent={'center'}
         >
          {
            this.props.image ? (
              <Image
                align={'center'}
                src={this.props.image}
                height={ this.props.isMobile ? '1.2em' : '1.4em' }
                width={ this.props.isMobile ? '1.2em' : '1.4em' }
                {...this.props.imageProps}
              />
            ) : this.props.useIconOnly ? (
              <Icon
                align={'center'}
                name={this.props.icon}
                size={ this.props.isMobile ? '1.2em' : '1.4em' }
                color={ this.props.iconColor ? this.props.iconColor : 'redeem' }
                {...this.props.iconProps}
              />
            ) : (
             <Flex
               mr={2}
               p={['4px','7px']}
               borderRadius={'50%'}
               alignItems={'center'}
               justifyContent={'center'}
               backgroundColor={ this.props.iconBgColor ? this.props.iconBgColor : this.props.theme.colors.transactions.actionBg.redeem }
             >
               <Icon
                 align={'center'}
                 name={this.props.icon}
                 size={ this.props.isMobile ? '1.2em' : '1.4em' }
                 color={ this.props.iconColor ? this.props.iconColor : 'redeem' }
                 {...this.props.iconProps}
               />
             </Flex>
            )
          }
           <Text
             fontWeight={3}
             fontSize={[1,3]}
             {...this.props.textProps}
           >
             {this.props.text}
           </Text>
         </Flex>
       </DashboardCard>
    );
  }
}

export default CardIconButton;