import theme from '../theme';
import React, { Component } from 'react';
import SmartNumber from '../SmartNumber/SmartNumber';
import FunctionsUtil from '../utilities/FunctionsUtil';
import ShortHash from "../utilities/components/ShortHash";
import { Flex, Text, Icon, Link, Image } from "rimble-ui";

class TransactionField extends Component {

  state = {};

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

  async componentDidMount(){
    this.loadField();
  }

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();

    const hashChanged = prevProps.hash !== this.props.hash;
    const accountChanged = prevProps.account !== this.props.account;
    const fieldChanged = prevProps.fieldInfo.name !== this.props.fieldInfo.name;
    if (fieldChanged || hashChanged || accountChanged){
      this.loadField();
    }
  }

  async loadField(){
    const fieldInfo = this.props.fieldInfo;
    if (this.props.hash && this.props.account){
      switch (fieldInfo.name){
        case 'icon':
        break;
        case 'hash':
          
        break;
        case 'action':
          
        break;
        case 'date':
        break;
        case 'status':
        break;
        case 'amount':
        break;
        case 'asset':
        break;
        case 'custom':
        break;
        default:
        break;
      }
    }
  }

  render(){
    let icon = null;
    let color = null;
    let output = null;
    let tokenSymbol = null;
    let tokenConfig = null;
    const fieldInfo = this.props.fieldInfo;
    const transaction = this.props.transaction;
    let bgColor = theme.colors.transactions.actionBg.default;

    const fieldProps = {
      fontWeight:3,
      fontSize:[0,2],
      color:'cellText',
      style:{
        maxWidth:'100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },
      flexProps:{
        justifyContent:'flex-start'
      }
    };

    // Replace props
    if (fieldInfo.props && Object.keys(fieldInfo.props).length){
      Object.keys(fieldInfo.props).forEach(p => {
        fieldProps[p] = fieldInfo.props[p];
      });
    }

    switch (fieldInfo.name){
      case 'icon':
        if (transaction.action){
          color = theme.colors.transactions.action[transaction.action.toLowerCase()] ? theme.colors.transactions.action[transaction.action.toLowerCase()] : color;
          bgColor = theme.colors.transactions.actionBg[transaction.action.toLowerCase()] ? theme.colors.transactions.actionBg[transaction.action.toLowerCase()] : bgColor;
        }
        switch (transaction.action.toLowerCase()) {
          case 'deposit':
          case 'curveout':
          case 'curvezapout':
          case 'curvedepositout':
            icon = "ArrowDownward";
          break;
          case 'boost':
            icon = "TrendingUp";
          break;
          case 'redeem':
          case 'curvein':
          case 'curvezapin':
          case 'curvedepositin':
            icon = "ArrowUpward";
          break;
          case 'send':
            icon = "Send";
          break;
          case 'receive':
            icon = "Redo";
          break;
          case 'migrate':
            // icon = "Sync";
            icon = "Repeat";
          break;
          case 'swap':
            icon = "SwapHoriz";
          break;
          case 'swapout':
            icon = "SwapHoriz";
          break;
          case 'withdraw':
            icon = "ArrowUpward";
          break;
          default:
            icon = "Refresh";
          break;
        }
        output = (
          <Flex
            p={'5px'}
            borderRadius={'50%'}
            {...fieldProps}
            alignItems={'center'}
            backgroundColor={bgColor}
            justifyContent={'center'}
          >
            <Icon
              name={icon}
              color={color}
              align={'center'}
              size={this.props.isMobile ? '1em' : '1.4em'}
            />
          </Flex>
        );
      break;
      case 'hash':
        if (transaction.hash){
          output = (
            <Link
              target={'_blank'}
              rel={'nofollow noopener noreferrer'}
              href={this.functionsUtil.getEtherscanTransactionUrl(transaction.hash)}
            >
              <ShortHash
                fontSize={1}
                color={'white'}
                {...fieldProps}
                resolveAddress={false}
                hash={transaction.hash}
              />
            </Link>
          );
        }
      break;
      case 'action':
        let action = transaction.action;
        switch (transaction.action) {
          case 'Swap':
            action = "Swap In";
          break;
          case 'SwapOut':
            action = "Swap Out";
          break;
          default:
          break;
        }
        output = (
          <Text {...fieldProps}>{action.toUpperCase()}</Text>
        );
      break;
      case 'date':
        const formattedDate = transaction.momentDate.format('DD MMM, YYYY');
        output = (
          <Text {...fieldProps}>{formattedDate}</Text>
        );
      break;
      case 'statusIcon':
        color = theme.colors.transactions.status[transaction.status.toLowerCase()];
        switch (transaction.status) {
          case 'Completed':
            icon = "Done";
          break;
          case 'Pending':
            icon = "Timelapse";
          break;
          case 'Failed':
            icon = "ErrorOutline";
          break;
          default:
          break;
        }
        output = (
          <Flex
            p={[0,'1px']}
            borderRadius={'50%'}
            {...fieldProps}
            alignItems={'center'}
            width={['24px','26px']}
            height={['24px','26px']}
            justifyContent={'center'}
            border={ this.props.isMobile ? `1px solid ${color}` : `2px solid ${color}` }
          >
            <Icon
              name={icon}
              color={color}
              align={'center'}
              size={ this.props.isMobile ? '1em' : '1.2em'}
            />
          </Flex>
        );
      break;
      case 'status':
        output = (
          <Text {...fieldProps}>{transaction.status}</Text>
        );
      break;
      case 'amount':
        output = (
          <SmartNumber {...fieldProps} number={transaction.amount} />
        );
      break;
      case 'tokenIcon':
      tokenSymbol = transaction.tokenSymbol.toUpperCase();
      tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',tokenSymbol]);
        const iconSrc = tokenConfig && tokenConfig.icon ? tokenConfig.icon : `images/tokens/${tokenSymbol}.svg`;
        output = (
          <Image src={iconSrc} {...fieldProps} />
        );
      break;
      case 'tokenName':
        tokenSymbol = transaction.tokenSymbol.toUpperCase();
        tokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',tokenSymbol]);
        output = (
          <Text {...fieldProps}>{tokenConfig && tokenConfig.label ? tokenConfig.label : tokenSymbol}</Text>
        );
      break;
      case 'custom':
        let CustomComponent = null;
        let customValue = this.functionsUtil.getArrayPath(fieldInfo.path,this.props.transaction);
        switch (fieldInfo.type){
          case 'number':
            customValue = this.functionsUtil.BNify(customValue).toString();
            CustomComponent = SmartNumber;
            fieldProps.number = customValue;
            customValue = null;
          break;
          case 'image':
            CustomComponent = Image;
            fieldProps.src = customValue;
            customValue = null;
          break;
          case 'icon':
            CustomComponent = Icon;
            fieldProps.name = customValue;
            customValue = null;
          break;
          default:
            CustomComponent = Text;
          break;
        }
        output = customValue ? (
          <CustomComponent {...fieldProps}>{customValue}</CustomComponent>
        ) : <CustomComponent {...fieldProps} />
      break;
      default:
      break;
    }
    return output;
  }
}

export default TransactionField;
