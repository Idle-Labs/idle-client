import React, { Component } from 'react';
import styles from './TableCellHeader.module.scss';
import { Flex, Text, Icon, Link, Tooltip } from "rimble-ui";

class TableCellHeader extends Component {
  render() {

    const ColTitle = (props) => (
      <Text
        fontWeight={4}
        color={'cellTitle'}
        fontSize={['12px',0]}
        fontFamily={'titles'}
        style={{
          width:'100%',
          whiteSpace:'nowrap'
        }}
        lineHeight={'initial'}
        {...props}
        {...props.colsProps}
      >
        {props.children}
      </Text>
    );

    return (
      <Flex
        width={this.props.width}
      >
        {
          (this.props.desc && this.props.desc.length>1) ? (
            <Flex
              alignItems={'center'}
            >
              <ColTitle
                {...this.props}
              />
              <Link
                style={{
                  cursor:'pointer'
                }}
                onClick={ e => this.props.openTooltipModal(this.props.title,this.props.desc) }
              >
                <Tooltip
                  placement={'top'}
                  message={'Click to read the description'}
                >
                  <Icon
                    ml={1}
                    name={"Info"}
                    color={'cellTitle'}
                    className={styles.tooltip}
                    size={ this.props.isMobile ? '1em' : '1.2em'}
                  />
                </Tooltip>
              </Link>
            </Flex>
          ) : (
            <ColTitle
              {...this.props}
            />
          )
        }
      </Flex>
    );
  }
}

export default TableCellHeader;
