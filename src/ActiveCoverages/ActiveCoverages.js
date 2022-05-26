import { Flex } from "rimble-ui";
import Title from '../Title/Title';
import React, { Component } from 'react';
import CustomList from '../CustomList/CustomList';
import FunctionsUtil from '../utilities/FunctionsUtil';

class Base extends Component {

  state = {
    loaded:false,
    activeCoverages:null
  }

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
    this.loadCoverages();
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();

    const accountChanged = prevProps.account !== this.props.account;
    if (accountChanged){
      this.loadCoverages();
    }
  }

  async loadCoverages(){
    if (!this.props.account){
      return false;
    }

    const coverages = await this.functionsUtil.getActiveCoverages(this.props.account);
    const activeCoverages = [];
    if (coverages && coverages.length>0){
      coverages.forEach( c => {
        if (!this.props.availableTokens || !this.props.availableTokens.length || this.props.availableTokens.includes(c.collateral)){
          const statusColors = this.props.theme.colors.transactions.status;
          let statusIcon = 'VerifiedUser';
          let statusColor = statusColors.completed;
          switch (c.status){
            case 'Expired':
              statusIcon = 'Error';
              statusColor = statusColors.failed;
            break;
            case 'Claimed':
              statusIcon = 'Error';
              statusColor = statusColors.pending;
            break;
            default:
            case 'Active':
              statusIcon = 'VerifiedUser';
              statusColor = statusColors.completed;
            break;
          }

          const statusIconProps = {
            color:statusColor
          };

          const portfolioCoverage = c.portfolioCoverage || 'N/A';

          activeCoverages.push(Object.assign(c,{
            statusIcon,
            statusIconProps,
            portfolioCoverage
          }));
        }
      })
    }

    this.setState({
      loaded:true,
      activeCoverages
    });
  }

  render() {

    if (!this.state.loaded){
      return null;
    }

    return (
      <Flex
        width={1}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        {
          this.props.title && ((this.state.activeCoverages && this.state.activeCoverages.length>0) || this.props.children) && (
            <Title
              {...this.props.titleProps}
            >
              {this.props.title}
            </Title>
          )
        }
        {
          this.state.activeCoverages && this.state.activeCoverages.length>0 ? (
            <CustomList
              rows={this.state.activeCoverages}
              handleClick={ this.props.isMobile ? (props) => props.row.status!=='Expired' && props.row.fileClaimUrl && this.functionsUtil.openWindow(props.row.fileClaimUrl) : null }
              cols={[
                {
                  title:'PROTOCOL',
                  props:{
                    width:[0.28,0.14]
                  },
                  fields:[
                    {
                      type:'image',
                      props:{
                        mr:[1,2],
                        size:this.props.isMobile ? '1.2em' : '1.8em'
                      },
                      path:[this.props.themeMode === 'dark' ? 'protocolImageDark' : 'protocolImage']
                    },
                    {
                      type:'text',
                      path:['protocolName'],
                    }
                  ]
                },
                {
                  title:'TOKEN',
                  props:{
                    width:[0.33,0.14]
                  },
                  fields:[
                    {
                      type:'image',
                      props:{
                        mr:[1,2],
                        size:this.props.isMobile ? '1.2em' : '1.8em'
                      },
                      path:['collateralIcon']
                    },
                    {
                      type:'text',
                      path:['collateral'],
                    }
                  ]
                },
                {
                  title:'AMOUNT',
                  props:{
                    width:[0.24, 0.12],
                  },
                  fields:[
                    {
                      type:'number',
                      path:['balance'],
                      props:{
                        decimals: this.props.isMobile ? 2 :  4,
                      }
                    },
                    {
                      type:'text',
                      path:['token'],
                      props:{
                        ml:[1,2],
                        style:{
                          textTransform:'uppercase'
                        }
                      }
                    }
                  ]
                },
                {
                  mobile:false,
                  title:'EXPIRATION DATE',
                  props:{
                    width:0.19,
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'text',
                      path:['expirationDate'],
                      props:{
                        
                      }
                    },
                  ]
                },
                {
                  mobile:false,
                  title:'COVERED FUNDS',
                  props:{
                    width:0.14,
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'text',
                      path:['portfolioCoverage'],
                      props:{
                        
                      }
                    },
                  ]
                },
                {
                  title:'STATUS',
                  props:{
                    width:[0.15,0.12],
                    justifyContent:['center','flex-start']
                  },
                  fields:[
                    {
                      type:'icon',
                      name:'custom',
                      path:['statusIcon'],
                      props:{
                        mr:[1,2],
                        size:this.props.isMobile ? '1.2em' : '1.8em'
                      }
                    },
                    {
                      mobile:false,
                      name:'custom',
                      path:['status'],
                      props:{
                        style:{
                          textTransform:'capitalize'
                        }
                      }
                    }
                  ]
                },
                {
                  title:'',
                  mobile:false,
                  props:{
                    width:0.17,
                  },
                  parentProps:{
                    width:1
                  },
                  fields:[
                    {
                      type:'button',
                      name:'custom',
                      funcProps:{
                        label:(props) => (props.row.actionLabel),
                        disabled:(props) => (props.row.actionDisabled)
                      },
                      props:{
                        width:1,
                        height:'45px',
                        size: this.props.isMobile ? 'small' : 'medium',
                        handleClick:(props) => props.row.status!=='Expired' && props.row.actionUrl && this.functionsUtil.openWindow(props.row.actionUrl)
                      }
                    }
                  ]
                }
              ]}
              {...this.props}
            />
          ) : this.props.children
        }
      </Flex>
    )
  }
}

export default Base;
