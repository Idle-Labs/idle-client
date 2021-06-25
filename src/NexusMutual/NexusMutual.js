import React, { Component } from 'react';
import FlexLoader from '../FlexLoader/FlexLoader';
import FunctionsUtil from '../utilities/FunctionsUtil';
import ButtonLoader from '../ButtonLoader/ButtonLoader';
import AssetSelector from '../AssetSelector/AssetSelector';
import DashboardCard from '../DashboardCard/DashboardCard';
import ExecuteTransaction from '../ExecuteTransaction/ExecuteTransaction';
import { Flex, Box, Text, Input, Link, Progress, Button, Icon } from "rimble-ui";

class NexusMutual extends Component {

  state = {
    step:1,
    quote:null,
    steps:{
      1:'Get Quote',
      2:'Buy Cover'
    },
    periodOptions:{
      30:{
        label:'30d'
      },
      60:{
        label:'60d'
      },
      90:{
        label:'90d'
      },
      365:{
        label:'1y'
      }
    },
    capacity:null,
    loading:false,
    amountValue:'',
    periodValue:'',
    maxCapacity:null,
    amountValid:true,
    periodValid:true,
    tokenConfig:null,
    tokenBalance:null,
    selectedToken:null,
    selectedPeriod:null,
    transactionParams:[],
    transactionValue:null
  };

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
    this.loadPoolCapacity();

    await this.props.initContract(this.props.contractInfo.name, this.props.contractInfo.address, this.props.contractInfo.abi);
  }

  async loadPoolCapacity(){
    const selectedToken = Object.keys(this.props.toolProps.availableTokens)[0];
    // const response = await this.functionsUtil.makeRequest(`https://api.nexusmutual.io/v1/contracts/${this.props.poolInfo.address}/capacity`);
    const response = await this.functionsUtil.makeRequest(`https://api.staging.nexusmutual.io/v1/contracts/${this.props.poolInfo.address}/capacity`);
    if (response && response.data){
      const capacity = response.data;
      this.setState({
        capacity
      },() => {
        this.changeSelectedToken(selectedToken);
      });
    } else {
      this.changeSelectedToken(selectedToken);
    }
  }

  async componentDidUpdate(prevProps,prevState){
    this.loadUtils();
  }

  async changeSelectedToken(selectedToken){
    const periodValue = '';
    const amountValue = '';
    const tokenConfig = this.props.toolProps.availableTokens[selectedToken];
    const maxCapacity = this.state.capacity && this.state.capacity[`capacity${selectedToken}`] ? this.functionsUtil.fixTokenDecimals(this.state.capacity[`capacity${selectedToken}`],tokenConfig.decimals) : this.functionsUtil.BNify(0);
    const tokenBalance = selectedToken === 'ETH' ? await this.functionsUtil.getETHBalance(this.props.account,false) : await this.functionsUtil.getTokenBalance(selectedToken,this.props.account,false);
    this.setState({
      amountValue,
      periodValue,
      maxCapacity,
      tokenConfig,
      tokenBalance,
      selectedToken
    });
  }

  setMaxCoverAmount(){
    const amountValue = this.state.maxCapacity.toFixed();
    this.changeAmount({
      target:{
        value:amountValue
      }
    });
  }

  changeAmount = (e) => {
    const amountValue = e.target.value.length && !isNaN(e.target.value) ? e.target.value : '';
    const amountValid = this.functionsUtil.BNify(amountValue).gt(0) && this.functionsUtil.BNify(amountValue).lte(this.state.maxCapacity);
    this.setState({
      amountValue
    });
  }

  changePeriod = (e) => {
    const periodValue = e.target.value.length && !isNaN(e.target.value) ? e.target.value : '';
    const periodValid = parseInt(periodValue)>=30 && parseInt(periodValue)<=365;
    this.setState({
      periodValue,
      periodValid,
      selectedPeriod:null
    });
  }

  selectPeriod = (selectedPeriod) => {
    this.changePeriod({
      target:{
        value:selectedPeriod
      }
    });
  }

  async getQuote() {

    this.setState({
      loading:true
    });

    // Setup your cover data.
    const coverData = {
      period: this.state.periodValue, // days
      coverAmount: this.state.amountValue, // ETH in units not wei
      currency: this.state.selectedToken,
      asset: this.state.tokenConfig.address,
      contractAddress: this.props.poolInfo.address, // the contract you will be buying cover for
    };

    // URL to request a quote for.
    const quoteURL = 'https://api.nexusmutual.io/v1/quote?' +
      `coverAmount=${coverData.coverAmount}&currency=${coverData.currency}&period=${coverData.period}&contractAddress=${coverData.contractAddress}`;

    const response = await this.functionsUtil.makeRequest(quoteURL);

    const quote = response && response.data ? response.data : null;

    if (!quote){
      this.setState({
        loading:false
      });
      return false;
    }

    // encode the signature result in the data field
    const data = this.props.web3.eth.abi.encodeParameters(
      ['uint', 'uint', 'uint', 'uint', 'uint8', 'bytes32', 'bytes32'],
      [quote.price, quote.priceInNXM, quote.expiresAt, quote.generatedAt, quote.v, quote.r, quote.s],
    );

    const COVER_TYPE = this.functionsUtil.toBN(0);
    const feePercentage = await this.functionsUtil.genericContractCall(this.props.contractInfo.name,'feePercentage');
    const basePrice = this.functionsUtil.BNify(quote.price);
    const priceWithFee = basePrice.times(feePercentage).div(10000).plus(basePrice);
    const amountInWei = this.functionsUtil.toWei(coverData.coverAmount.toString());
    const maxPriceWithFee = this.functionsUtil.toBN(priceWithFee.toFixed());

    const transactionParams = [
      coverData.contractAddress,
      coverData.asset,
      amountInWei,
      coverData.period,
      COVER_TYPE,
      maxPriceWithFee,
      data
    ];

    const transactionValue = this.state.selectedToken === 'ETH' ? this.functionsUtil.toBN(priceWithFee.toFixed()) : null;

    console.log(transactionParams,transactionValue);

    const step = 2;
    const loading = false;

    this.setState({
      step,
      quote,
      loading,
      transactionValue,
      transactionParams
    });
  }

  transactionSucceeded = (tx) => {
    debugger;
  }

  reset(){
    const step = 1;
    const quote = null;
    const periodValue = '';
    const amountValue = '';
    const transactionParams = [];
    this.setState({
      step,
      quote,
      periodValue,
      amountValue,
      transactionParams
    });
  }

  render() {

    return (
      <Flex
        width={1}
        mt={[2,3]}
        alignItems={'center'}
        flexDirection={'column'}
        justifyContent={'center'}
      >
        <Flex
          mb={3}
          width={[1,0.36]}
          flexDirection={'column'}
        >
          <Flex
            mb={1}
            width={1}
            flexDirection={'row'}
            justifyContent={'space-between'}
          >
            {
              Object.keys(this.state.steps).map( stepIndex => (
                <Link
                  style={{
                    flexBasis:'0',
                    flex:'1 1 0px',
                    textDecoration:'none',
                    cursor:this.state.step>=stepIndex ? 'pointer' : 'default'
                  }}
                  fontSize={2}
                  textAlign={'center'}
                  key={`step_${stepIndex}`}
                  color={ this.state.step>=stepIndex ? 'primary' : 'cellText' }
                  hoverColor={ this.state.step>=stepIndex ? 'primary' : 'cellText' }
                  activeColor={ this.state.step>=stepIndex ? 'primary' : 'cellText' }
                >
                  {this.state.steps[stepIndex]}
                </Link>
              ) )
            }
          </Flex>
          <Flex
            width={1}
            flexDirection={'column'}
          >
            <Progress
              style={{
                width:'100%',
                height:'15px'
              }}
              value={(1/Object.keys(this.state.steps).length)*this.state.step}
            />
          </Flex>
        </Flex>
        {
          !this.state.selectedToken ? (
            <FlexLoader
              flexProps={{
                flexDirection:'row'
              }}
              loaderProps={{
                size:'25px',
              }}
              textProps={{
                ml:2
              }}
              text={'Loading assets...'}
            />
          ) : !this.state.quote ? (
            <Flex
              width={[1,0.36]}
              alignItems={'stretch'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Box
                width={1}
              >
                <Text
                  mb={1}>
                  Select asset:
                </Text>
                <AssetSelector
                  {...this.props}
                  showBalance={false}
                  selectedToken={this.state.selectedToken}
                  onChange={this.changeSelectedToken.bind(this)}
                  availableTokens={this.props.toolProps.availableTokens}
                />
              </Box>
              <Box
                mt={2}
                width={1}
              >
                <Text
                  mb={1}
                >
                  How much do you want to cover?
                </Text>
                <Input
                  min={0}
                  width={'100%'}
                  type={"number"}
                  required={true}
                  height={'3.4em'}
                  borderRadius={2}
                  fontWeight={500}
                  borderColor={'cardBorder'}
                  backgroundColor={'cardBg'}
                  boxShadow={'none !important'}
                  value={this.state.amountValue}
                  onChange={this.changeAmount.bind(this)}
                  border={`1px solid ${this.props.theme.colors.divider}`}
                  placeholder={`Insert ${this.state.selectedToken.toUpperCase()} amount`}
                />
                <Flex
                  width={1}
                  maxWidth={'100%'}
                  alignItems={'center'}
                  flexDirection={'row'}
                  justifyContent={'flex-end'}
                >
                  <Link
                    mt={1}
                    fontSize={1}
                    fontWeight={3}
                    color={'dark-gray'}
                    textAlign={'right'}
                    hoverColor={'copyColor'}
                    onClick={ (e) => this.setMaxCoverAmount() }
                    style={{
                      maxWidth:'100%',
                      overflow:'hidden',
                      whiteSpace:'nowrap',
                      textOverflow:'ellipsis'
                    }}
                  >
                    Max Available: {this.state.maxCapacity.toFixed(this.props.isMobile ? 2 : 4)} {this.state.selectedToken}
                  </Link>
                </Flex>
              </Box>
              <Box
                mt={2}
                width={1}
              >
                <Text
                  mb={1}
                >
                  For how many days?
                </Text>
                <Input
                  min={0}
                  width={'100%'}
                  type={"number"}
                  required={true}
                  height={'3.4em'}
                  borderRadius={2}
                  fontWeight={500}
                  borderWidth={'1px'}
                  borderStyle={'solid'}
                  backgroundColor={'cardBg'}
                  boxShadow={'none !important'}
                  value={this.state.periodValue}
                  placeholder={'Insert days of coverage'}
                  onChange={this.changePeriod.bind(this)}
                  borderColor={this.state.periodValid ? 'cardBorder' : 'red'}
                />
                {
                  !this.state.periodValid && (
                    <Text
                      my={1}
                      fontSize={2}
                      color={'red'}
                    >
                      Enter a period between 30 and 365 days!
                    </Text>
                  )
                }
                <Flex
                  mt={2}
                  alignItems={'center'}
                  flexDirection={'row'}
                  justifyContent={'space-between'}
                >
                  {
                    Object.keys(this.state.periodOptions).map( period => {
                      const periodInfo = this.state.periodOptions[period];
                      const isActive = this.state.selectedPeriod===period;
                      const width = (1/Object.keys(this.state.periodOptions).length)-0.01;
                      return (
                        <DashboardCard
                          cardProps={{
                            p:2,
                            width:width,
                          }}
                          isActive={isActive}
                          isInteractive={true}
                          key={`coverPeriod_${period}`}
                          handleClick={e => this.selectPeriod(period)}
                        >
                          <Text 
                            fontSize={2}
                            fontWeight={3}
                            textAlign={'center'}
                            color={this.props.isActive ? 'copyColor' : 'legend'}
                          >
                            {periodInfo.label}
                          </Text>
                        </DashboardCard>
                      );
                    })
                  }
                </Flex>
              </Box>
              <Flex
                mt={2}
                width={1}
                justifyContent={'center'}
              >
                <ButtonLoader
                  buttonProps={{
                    my:2,
                    mx:[0, 2],
                    size:'medium',
                    borderRadius:4,
                    mainColor:'blue',
                    disabled:(!this.state.amountValue || !this.state.selectedToken || !this.state.periodValue || !this.state.periodValid)
                  }}
                  buttonText={'GET QUOTE'}
                  isLoading={this.state.loading}
                  handleClick={ e => this.getQuote(e) }
                />
              </Flex>
            </Flex>
          ) : (
            <Flex
              width={[1,0.36]}
              alignItems={'stretch'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Text
                mt={1}
                mb={2}
                fontSize={3}
                fontWeight={3}
                color={'primary'}
              >
                Cover Summary:
              </Text>
              <DashboardCard
                cardProps={{
                  py:2,
                  mb:2,
                  px:3
                }}
                isActive={true}
                isInteractive={false}
              >
                <Text
                  mb={1}
                  fontSize={1}
                  fontWeight={2}
                  color={'cellText'}
                >
                  Protocol:
                </Text>
                <Text
                  mb={2}
                  fontSize={2}
                  fontWeight={3}
                  color={'primary'}
                >
                  Idle Finance
                </Text>
                <Text
                  mb={1}
                  fontSize={1}
                  fontWeight={2}
                  color={'cellText'}
                >
                  Cover Amount:
                </Text>
                <Text
                  mb={2}
                  fontSize={2}
                  fontWeight={3}
                  color={'primary'}
                >
                  {this.state.amountValue} {this.state.selectedToken}
                </Text>
                <Text
                  mb={1}
                  fontSize={1}
                  fontWeight={2}
                  color={'cellText'}
                >
                  Cover Period:
                </Text>
                <Text
                  mb={2}
                  fontSize={2}
                  fontWeight={3}
                  color={'primary'}
                >
                  {this.state.periodValue} days
                </Text>
                <Text
                  mb={1}
                  fontSize={1}
                  fontWeight={2}
                  color={'cellText'}
                >
                  Cover Price:
                </Text>
                <Text
                  mb={2}
                  fontSize={2}
                  fontWeight={3}
                  color={'primary'}
                >
                  {this.functionsUtil.fixTokenDecimals(this.state.quote.price,this.state.tokenConfig.decimals).toFixed(6)} {this.state.selectedToken}
                </Text>
              </DashboardCard>
              <Flex
                mt={2}
                width={1}
                alignItems={'center'}
                flexDirection={'column'}
                justifyContent={'center'}
              >
                {
                  this.state.tokenBalance.lt(this.functionsUtil.BNify(this.state.quote.price)) ? (
                    <DashboardCard
                      cardProps={{
                        p:3
                      }}
                    >
                      <Flex
                        alignItems={'center'}
                        flexDirection={'column'}
                      >
                        <Icon
                          name={'MoneyOff'}
                          color={'cellText'}
                          size={this.props.isMobile ? '1.8em' : '2.3em'}
                        />
                        <Text
                          mt={1}
                          fontSize={2}
                          color={'cellText'}
                          textAlign={'center'}
                        >
                          You don't have enough {this.state.selectedToken} in your wallet.
                        </Text>
                      </Flex>
                    </DashboardCard>
                  ) : (
                    <ExecuteTransaction
                      {...this.props}
                      parentProps={{
                        width:1,
                        alignItems:'center',
                        justifyContent:'center'
                      }}
                      Component={Button}
                      componentProps={{
                        fontSize:3,
                        fontWeight:3,
                        size:'medium',
                        width:[1,1/2],
                        borderRadius:4,
                        mainColor:'deposit',
                        value:'Buy Coverage',
                        disabled:this.state.buttonDisabled
                      }}
                      action={'Buy Coverage'}
                      methodName={'buyCover'}
                      value={this.state.transactionValue}
                      params={this.state.transactionParams}
                      contractName={this.props.contractInfo.name}
                      callback={this.transactionSucceeded.bind(this)}
                    />
                  )
                }
                <Link
                  mt={1}
                  color={'link'}
                  hoverColor={'primary'}
                  onClick={this.reset.bind(this)}
                >
                  Get New Quote
                </Link>
              </Flex>
            </Flex>
          )
        }
      </Flex>
    );
  }
}

export default NexusMutual;