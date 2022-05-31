import React, { Component } from "react";
import { Flex, Text, Icon, Image } from "rimble-ui";
import DashboardCard from "../DashboardCard/DashboardCard";

class CardIconButton extends Component {
  render() {
    const cardProps = Object.assign(
      {
        py: 1,
        width: "auto",
        px: ["12px", 3],
        justifyContent:'center'
      },
      this.props.cardProps
    );

    const textProps = {...this.props.textProps};
    if (this.props.isActive){
      textProps.color = 'primary';
    }

    return (
      <DashboardCard
        isInteractive={true}
        cardProps={cardProps}
        backgroundColor={"blue"}
        isActive={this.props.isActive}
        isDisabled={this.props.isDisabled}
        handleClick={this.props.handleClick}
      >
        <Flex
          my={1}
          alignItems={"center"}
          flexDirection={"row"}
          justifyContent={this.props.align || "center"}
          mx={this.props.margin ? this.props.margin : 0}
        >
          {
            this.props.iconBgColor && !this.props.useIconOnly ? (
              <Flex
                borderRadius={"50%"}
                alignItems={"center"}
                justifyContent={"center"}
                mr={this.props.isSidebar ? 0 : 2}
                p={this.props.isSidebar ? 0 : ["4px", "7px"]}
                backgroundColor={this.props.iconBgColor ? this.props.iconBgColor : this.props.theme.colors.transactions.actionBg.redeem}
              >
                {
                  this.props.image ? (
                    <Image
                      align={"center"}
                      src={this.props.image}
                      height={this.props.isMobile ? "1.2em" : "1.4em"}
                      width={this.props.isMobile ? "1.2em" : "1.4em"}
                      {...this.props.imageProps}
                    />
                  ) : (
                    <Icon
                      align={"center"}
                      name={this.props.icon}
                      size={this.props.isMobile ? "1.2em" : "1.4em"}
                      color={this.props.iconColor ? this.props.iconColor : "primary"}
                      {...this.props.iconProps}
                    />
                  )
                }
              </Flex>
            ) : this.props.image ? (
              <Image
                mr={1}
                align={"center"}
                src={this.props.image}
                height={this.props.isMobile ? "1.2em" : "1.4em"}
                width={this.props.isMobile ? "1.2em" : "1.4em"}
                {...this.props.imageProps}
              />
            ) : this.props.icon && (
              <Icon
                mr={1}
                align={"center"}
                name={this.props.icon}
                size={this.props.isMobile ? "1.2em" : "1.4em"}
                color={this.props.iconColor ? this.props.iconColor : "primary"}
                {...this.props.iconProps}
              />
            )
          }
          <Text
            fontWeight={3}
            fontSize={[1, 2]}
            {...textProps}
          >
            {this.props.text}
          </Text>
        </Flex>
      </DashboardCard>
    );
  }
}

export default CardIconButton;
