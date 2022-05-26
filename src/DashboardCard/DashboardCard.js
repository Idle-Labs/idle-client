import Title from '../Title/Title';
import React, { Component } from 'react';
import styles from './DashboardCard.module.scss';
import { Flex, Icon, Card, Tooltip } from "rimble-ui";


class DashboardCard extends Component {

  state = {
    mouseOver: false
  }

  setMouseOver(mouseOver) {
    this.setState({
      mouseOver
    });
  }

  render() {
    const isDisabled = this.props.isDisabled;
    const isActive = this.props.isActive && !isDisabled;
    const isInteractive = this.props.isInteractive && !isDisabled;
    const isVisible = typeof this.props.isVisible !== 'undefined' ? this.props.isVisible : true;
    const isRainbow = typeof this.props.isRainbow !== 'undefined' ? this.props.isRainbow : false;

    const cardProps = {
      p: 0,
      border:0,
      borderRadius: 2,
      borderColor: null,
      position: 'relative',
      minHeight: 'initial',
      backgroundColor: 'cardBg'
    };

    // Replace props
    if (this.props.cardProps && Object.keys(this.props.cardProps).length) {
      Object.keys(this.props.cardProps).forEach(p => {
        cardProps[p] = this.props.cardProps[p];
      });
    }

    if (isInteractive && this.state.mouseOver) {
      cardProps.backgroundColor = 'cardBgHover';
    }

    if (isActive){
      cardProps.backgroundColor = 'cardBgActive';
    }

    const className = [
      styles.defaultOpacity,
      isActive ? styles.active : null,
      !isVisible ? styles.hidden : null,
      isRainbow ? styles.rainbow : null,
      isDisabled ? styles.disabled : null,
      isInteractive ? styles.interactive : null,
    ];

    if (this.props.className && styles[this.props.className]) {
      className.push(styles[this.props.className]);
    }

    return (
      <Card
        {...cardProps}
        className={className}
        onClick={this.props.handleClick}
        onMouseOut={(e) => this.setMouseOver(false)}
        onMouseOver={(e) => this.setMouseOver(true)}
      >
        {
          this.props.title && this.props.title.length > 0 &&
          <Flex
            mt={[3, 4]}
            ml={[3, 4]}
            alignItems={'center'}
            flexDirection={'row'}
            {...this.props.titleParentProps}
          >
            <Title
              as={'h4'}
              fontWeight={4}
              fontSize={[2, 3]}
              textAlign={'left'}
              color={'dark-gray'}
              lineHeight={'initial'}
              {...this.props.titleProps}
            >
              {this.props.title}
            </Title>
            {
              this.props.description && this.props.description.length > 0 &&
              <Tooltip
                placement={'top'}
                message={this.props.description}
              >
                <Icon
                  ml={2}
                  name={"Info"}
                  size={'1em'}
                  color={'cellTitle'}
                />
              </Tooltip>
            }

          </Flex>
        }
        {this.props.children}
      </Card>
    );
  }
}

export default DashboardCard;