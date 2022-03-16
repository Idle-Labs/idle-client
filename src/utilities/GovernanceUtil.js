import Batcher from 'web3-batched-send';
import FunctionsUtil from './FunctionsUtil';
import VesterABI from '../contracts/Vester.json';

// const env = process.env;

class GovernanceUtil {
  // Attributes
  props = {};
  functionsUtil = null;

  // Constructor
  constructor(props){
    this.setProps(props);
  }

  // Methods
  setProps = props => {
    this.props = props;

    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  getTotalSupply = async () => {

    // Check for cached data
    const cachedDataKey = 'getTotalSupply';
    const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.functionsUtil.BNify(cachedData).isNaN()){
      return cachedData;
    }

    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);
    let totalSupply = await this.functionsUtil.genericContractCall(contractName,'totalSupply');
    if (totalSupply){
      totalSupply = this.functionsUtil.fixTokenDecimals(totalSupply,18);
      return this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,totalSupply,null);
    }

    return null;
  }

  getTokensBalance = async (account=null) => {

    account = account ? account : this.props.account;
    if (account){

      // Check for cached data
      const cachedDataKey = `getTokensBalance_${account}`;
      const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
      if (cachedData && !this.functionsUtil.BNify(cachedData).isNaN()){
        return cachedData;
      }

      const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);
      const balance = await this.functionsUtil.getContractBalance(contractName, account);
      if (balance && !this.functionsUtil.BNify(balance).isNaN()){
        return this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,this.functionsUtil.BNify(balance));
      }
    }
    return null;
  }

  getVestedAmount = async (account=null) => {
    let vestedAmount = this.functionsUtil.BNify(0);
    account = account ? account : this.props.account;
    const founderVesting = await this.getVestingContract(account);
    if (founderVesting){
      const governanceTokenName = this.functionsUtil.getGlobalConfig(['governance','props','tokenName']);
      const governanceTokenConfig = this.functionsUtil.getGlobalConfig(['stats','tokens',governanceTokenName.toUpperCase()]);
      let [
        vestingEnd,
        lastUpdate,
        vestingBegin,
        vestingAmount,
      ] = await Promise.all([
        this.functionsUtil.genericContractCall('VestingContract','vestingEnd'),
        this.functionsUtil.genericContractCall('VestingContract','lastUpdate'),
        this.functionsUtil.genericContractCall('VestingContract','vestingBegin'),
        this.functionsUtil.genericContractCall('VestingContract','vestingAmount')
      ]);

      if (vestingAmount && vestingBegin && vestingEnd && lastUpdate){
        vestingEnd = this.functionsUtil.BNify(vestingEnd);
        lastUpdate = this.functionsUtil.BNify(lastUpdate);
        vestingBegin = this.functionsUtil.BNify(vestingBegin);
        vestingAmount = this.functionsUtil.BNify(vestingAmount);
        const blockTimestamp = this.functionsUtil.BNify(parseInt(Date.now()/1000));

        if (blockTimestamp.gt(vestingEnd)) {
          vestedAmount = await this.functionsUtil.getContractBalance(governanceTokenName,account);
        } else {
          vestedAmount = vestingAmount.times(blockTimestamp.minus(this.functionsUtil.BNify(lastUpdate))).div(vestingEnd.minus(vestingBegin));
        }
        vestedAmount = this.functionsUtil.fixTokenDecimals(vestedAmount,governanceTokenConfig.decimals);
      }
    }
    return vestedAmount;
  }

  getVestingContract = async (account=null) => {
    account = account ? account : this.props.account;
    const vestingContract = await this.functionsUtil.genericContractCall('VesterFactory','vestingContracts',[account]);

    if (parseInt(vestingContract) === 0){
      return null;
    }
    // Init vesting contract
    await this.props.initContract('VestingContract',vestingContract,VesterABI);
    return vestingContract;
  }

  claimVestedTokens = async (account=null,callback=null,callbackReceipt=null) => {
    account = account ? account : this.props.account;
    const founderVesting = await this.getVestingContract(account);
    if (founderVesting){
      return await this.functionsUtil.contractMethodSendWrapper('VestingContract','claim',[],callback,callbackReceipt);
    }
    return null;
  }

  delegateVesting = async (account=null,delegate=null,callback=null,callbackReceipt=null) => {
    account = account ? account : this.props.account;
    const founderVesting = await this.getVestingContract(account);
    if (founderVesting){
      // await this.functionsUtil.contractMethodSendWrapper('IDLE','delegate',[delegate]);
      return await this.functionsUtil.contractMethodSendWrapper('VestingContract','setDelegate',[delegate],callback,callbackReceipt);
    }
    return null;
  }

  getVestingAmount = async (account=null) => {
    account = account ? account : this.props.account;
    const founderVesting = await this.getVestingContract(account);
    if (founderVesting){
      let vestingAmount = await this.functionsUtil.genericContractCall('VestingContract','vestingAmount');
      if (vestingAmount){
        return this.functionsUtil.BNify(vestingAmount);
      }
    }
    return null;
  }

  getCurrentDelegate = async (account=null) => {

    account = account ? account : this.props.account;
    if (account){

      // Check for cached data
      const cachedDataKey = `getCurrentDelegate_${account}`;
      const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
      if (cachedData){
        return cachedData;
      }

      const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);
      const delegate = await this.functionsUtil.genericContractCall(contractName, 'delegates', [account]);

      return this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,delegate);
    }

    return null;
  }

  getCurrentVotes = async (account=null) => {

    account = account ? account : this.props.account;
    if (account){
      // Check for cached data
      const cachedDataKey = `getCurrentVotes_${account}`;
      const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
      if (cachedData){
        return cachedData;
      }

      const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);
      const votes = await this.functionsUtil.genericContractCall(contractName, 'getCurrentVotes', [account]);
      if (votes && !this.functionsUtil.BNify(votes).isNaN() ){
        return this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,this.functionsUtil.BNify(votes));
      }
    }

    return null;
  }

  getVotingPeriod = async () => {
    // Check for cached data
    const cachedDataKey = `votingPeriod`;
    const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.functionsUtil.BNify(cachedData).isNaN()){
      return cachedData;
    }

    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    let votingPeriod = await this.functionsUtil.genericContractCall(contractName,'votingPeriod');
    if (votingPeriod){
      votingPeriod = this.functionsUtil.BNify(votingPeriod);
      return this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,votingPeriod,null);
    }

    return null;
  }

  getTimelockDelay = async () => {
    // Check for cached data
    const cachedDataKey = `getTimelockDelay`;
    const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData && !this.functionsUtil.BNify(cachedData).isNaN()){
      return cachedData;
    }

    let delay = await this.functionsUtil.genericContractCall('Timelock','delay');
    if (delay){
      delay = this.functionsUtil.BNify(delay);
      return this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,delay,null);
    }

    return null;
  }

  queueProposal = async (proposalId,callback=null,callbackReceipt=null) => {
    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    await this.functionsUtil.contractMethodSendWrapper(contractName,'queue',[this.functionsUtil.toBN(proposalId)],callback,callbackReceipt);
  }

  executeProposal = async (proposalId,callback=null,callbackReceipt=null) => {
    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    await this.functionsUtil.contractMethodSendWrapper(contractName,'execute',[this.functionsUtil.toBN(proposalId)],callback,callbackReceipt);
  }

  proposeAndVoteFor = async (targets, values, signatures, calldatas, description) => {
    const batcher = new Batcher(this.props.web3,'0x741A4dCaD4f72B83bE9103a383911d78362611cf');

    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    const contract = this.functionsUtil.getContractByName(contractName);

    const txs = [
      {
        to:contract._address,
        method:contract.methods.propose,
        args:[targets, values, signatures, calldatas, description]
      },
      {
        to:contract._address,
        method:contract.methods.castVote,
        args:[this.functionsUtil.BNify(3), true],
      }
    ];

    batcher(txs);
  }

  propose = async (targets, values, signatures, calldatas, description, callback=null,callbackReceipt=null) => {
    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    return await this.props.contractMethodSendWrapper(contractName, 'propose', [targets, values, signatures, calldatas, description], null, callback, callbackReceipt);
  }

  castVote = async (proposalId,support,callback=null,callbackReceipt=null) => {
    proposalId = this.functionsUtil.toBN(proposalId);
    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    return await this.props.contractMethodSendWrapper(contractName, 'castVote', [proposalId, support], null, callback, callbackReceipt);
  }

  setDelegate = async (delegate,callback=null,callbackReceipt=null) => {
    const contractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);
    return await this.props.contractMethodSendWrapper(contractName, 'delegate', [delegate], null, callback, callbackReceipt);
  }

  getDelegatesChanges = async () => {

    const lastBlockNumber = await this.props.web3.eth.getBlockNumber();

    const delegationsCalls = [];
    const blocksPerCall = 100000;
    const fromBlock = this.functionsUtil.getGlobalConfig(['governance','startBlock']);
    const delegatesContractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);

    for (var blockNumber = fromBlock; blockNumber < lastBlockNumber; blockNumber+=blocksPerCall) {
      const toBlock = Math.min(blockNumber+blocksPerCall,lastBlockNumber);
      delegationsCalls.push(this.functionsUtil.getContractPastEvents(delegatesContractName,'DelegateChanged', {fromBlock: blockNumber, toBlock}))
    }

    const all_delegations = await Promise.all(delegationsCalls);

    return all_delegations.reduce( (delegations,d) => {
      delegations = delegations.concat(d);
      return delegations;
    },[]);
  }

  getDelegatesVotesChanges = async () => {

    const lastBlockNumber = await this.props.web3.eth.getBlockNumber();

    const delegationsCalls = [];
    const blocksPerCall = 100000;
    const fromBlock = this.functionsUtil.getGlobalConfig(['governance','startBlock']);
    const delegatesContractName = this.functionsUtil.getGlobalConfig(['governance','contracts','delegates']);

    for (var blockNumber = fromBlock; blockNumber < lastBlockNumber; blockNumber+=blocksPerCall) {
      const toBlock = Math.min(blockNumber+blocksPerCall,lastBlockNumber);
      delegationsCalls.push(this.functionsUtil.getContractPastEvents(delegatesContractName,'DelegateVotesChanged', {fromBlock: blockNumber, toBlock}))
    }

    const all_delegations = await Promise.all(delegationsCalls);

    return all_delegations.reduce( (delegations,d) => {
      delegations = delegations.concat(d);
      return delegations;
    },[]);
  }

  getDelegates = async (limit=null) => {

    // Check for cached data
    const cachedDataKey = `getDelegates`;
    const cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    const [
      all_votes,
      totalSupply,
      delegations,
    ] = await Promise.all([
      this.getVotes(),
      this.getTotalSupply(),
      this.getDelegatesVotesChanges()
    ]);

    const delegateAccounts = {};
    delegations.forEach(e => {
      const { delegate, newBalance } = e.returnValues;
      delegateAccounts[delegate] = newBalance;
    });

    let delegates = [];
    Object.keys(delegateAccounts).forEach((account) => {
      const votes = +delegateAccounts[account];
      if (votes === 0) return;
      delegates.push({
        votes: votes/1e18,
        delegate: account
      });
    });

    delegates.sort((a, b) => {
      return a.votes < b.votes ? 1 : -1;
    });

    delegates.forEach( (d,index) => {
      d.rank = index+1;
      d.votes = d.votes.toFixed(6);
      d.vote_weight = (100 * (d.votes / parseFloat(totalSupply))).toFixed(4) + '%';
      d.proposals = all_votes.filter( v => (v.voter && d.delegate && v.voter.toLowerCase() === d.delegate.toLowerCase()) ).length;
    });

    this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,delegates);

    if (limit !== null){
      delegates = delegates.splice(0,limit);
    }

    return delegates;
  }

  getProposalParams = async () => {

    // Check for cached data
    const cachedDataKey = `getProposalParams`;
    const cachedData = this.functionsUtil.getCachedData(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    const govContractName = this.functionsUtil.getGlobalConfig(['governance','contracts','governance','v2']).name;
    let [
      proposalThreshold,
      proposalMaxOperations
    ] = await Promise.all([
      this.functionsUtil.genericContractCall(govContractName,'proposalThreshold'),
      this.functionsUtil.genericContractCall(govContractName,'proposalMaxOperations')
    ]);

    if (proposalThreshold){
      proposalThreshold = this.functionsUtil.BNify(proposalThreshold);
    }

    const params = {
      proposalThreshold,
      proposalMaxOperations
    };

    return this.functionsUtil.setCachedData(cachedDataKey,params);
  }

  getVotes = async () => {

    // Check for cached data
    const cachedDataKey = `getVotes`;
    const cachedData = this.functionsUtil.getCachedData(cachedDataKey);
    if (cachedData){
      return cachedData;
    }

    
    const governanceContracts = this.functionsUtil.getGlobalConfig(['governance','contracts','governance']);
    let lastContract=null;
    let fromBlock=null;
    const votes=[];
    Object.values(governanceContracts).forEach(async (governanceContract,index)=>{
      const contractName=governanceContract.name;
      const toBlock=governanceContract.toBlock;
      if(!lastContract)
      {
        fromBlock = this.functionsUtil.getGlobalConfig(['governance','startBlock']);
      }
      else
      {
        fromBlock=lastContract.toBlock;
      }
      lastContract=governanceContract;
      let contractVotes = await this.functionsUtil.getContractPastEvents(contractName,'VoteCast', {fromBlock, toBlock});
      
      if (contractVotes){
        contractVotes = contractVotes.map( e => {
          const {
              voter,
              votes,
              support,
              proposalId
          } = e.returnValues;
          return {
            votes,
            voter,
            support,
            proposalId
          }
        });
      Object.values(contractVotes).forEach(vote=>{
        votes.push(vote);
      })
      }
    });
   
    return this.functionsUtil.setCachedData(cachedDataKey,votes);
  }

  getProposals = async (voted_by=null,filter_by_state=null,startBlock=null) => {

    // Check for cached data
    const cachedDataKey = `getProposals`;
    let cachedData = this.functionsUtil.getCachedDataWithLocalStorage(cachedDataKey);
    if (cachedData){
      if (filter_by_state){
        cachedData = cachedData.filter( p => (p && p.state && p.state.toLowerCase() === filter_by_state.toLowerCase() ) );
      }
      if (voted_by){
        cachedData = cachedData.filter( p => (p && p.votes.find( v => (v.voter && v.voter.toLowerCase() === voted_by.toLowerCase()) )) );
      }
      if (startBlock){
        cachedData = cachedData.filter( p => parseInt(p.startBlock)>=parseInt(startBlock) );
      }
      return cachedData;
    }
    
    const enumerateProposalState = (state) => {
      const proposalStates = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
      return proposalStates[state];
    };

    const governanceContracts = this.functionsUtil.getGlobalConfig(['governance','contracts','governance']);
    const contracts = Object.values(governanceContracts);
    
    let fromBlock=null;

    // const proposalCounts= await Object.values(governanceContracts).map(async (governanceContract)=>{
    const proposalCounts = await this.functionsUtil.asyncForEach(contracts,async (governanceContract)=>{
      const proposalCount = await this.functionsUtil.genericContractCall(governanceContract.name,'proposalCount');
      return proposalCount;
    });
    let allProposals=[];

    await this.functionsUtil.asyncForEach(contracts, async(governanceContract,index) => {
      
      const governanceContractName = governanceContract.name;
      const proposalCount = parseInt(await proposalCounts[index]);
      const lastCount = parseInt(await proposalCounts[index-1]);
      if (!proposalCount){
        return [];
      }
      if(index===0){
        fromBlock = this.functionsUtil.getGlobalConfig(['governance','startBlock']);
      }
      else{
        fromBlock = contracts[index-1].toBlock;
      }

      const proposalGets = [];
      const proposalStateGets = [];
      for (const i of Array.from(Array(proposalCount),(n,i) => i+1)) {
        if (!index || i>lastCount){
          proposalGets.push(this.functionsUtil.genericContractCall(governanceContractName,'proposals',[i]));
          proposalStateGets.push(this.functionsUtil.genericContractCall(governanceContractName,'state',[i]));
        }
      }

      if(!proposalStateGets || !proposalGets){
        return false;
      }
      const toBlock = governanceContract.toBlock;
      let [
        votes,
        proposals,
        proposalStates,
        proposalQueuedEvents,
        proposalCreatedEvents,
        proposalCanceledEvents,
        proposalExecutedEvents,
      ] = await Promise.all([
        this.getVotes(),
        Promise.all(proposalGets),
        Promise.all(proposalStateGets),
        this.functionsUtil.getContractPastEvents(governanceContractName,'ProposalQueued', {fromBlock, toBlock}),
        this.functionsUtil.getContractPastEvents(governanceContractName,'ProposalCreated', {fromBlock, toBlock}),
        this.functionsUtil.getContractPastEvents(governanceContractName,'ProposalCanceled', {fromBlock, toBlock}),
        this.functionsUtil.getContractPastEvents(governanceContractName,'ProposalExecuted', {fromBlock, toBlock}),
      ]);

      proposals.reverse();
      proposalStates.reverse();
      proposalQueuedEvents.reverse();
      proposalCreatedEvents.reverse();
      proposalCanceledEvents.reverse();
      proposalExecutedEvents.reverse();

      // await this.functionsUtil.asyncForEach(proposals, async (p,i) => {
      await this.functionsUtil.asyncForEach(proposalCreatedEvents, async (createdEvent,i) => {
        const p = proposals[i];

        if (!p || !p.id){
          return;
        }

        const proposalId = parseInt(p.id);
        const canceledEvent = proposalCanceledEvents.find( e => (parseInt(e.returnValues.id) === proposalId ) );
        const executedEvent = proposalExecutedEvents.find( e => (parseInt(e.returnValues.id) === proposalId ) );
        const queuedEvent = proposalQueuedEvents.find( e => (parseInt(e.returnValues.id) === proposalId ) );

        const [
          endBlockInfo,
          queuedBlockInfo,
          createdBlockInfo,
          canceledBlockInfo,
          executedBlockInfo,
        ] = await Promise.all([
          p.endBlock ? this.functionsUtil.getBlockInfo(p.endBlock) : null,
          queuedEvent ? this.functionsUtil.getBlockInfo(queuedEvent.blockNumber) : null,
          createdEvent ? this.functionsUtil.getBlockInfo(createdEvent.blockNumber) : null,
          canceledEvent ? this.functionsUtil.getBlockInfo(canceledEvent.blockNumber) : null,
          executedEvent ? this.functionsUtil.getBlockInfo(executedEvent.blockNumber) : null,
        ]);

        // Init states array
        p.states = [];

        // Create created state
        const createdState = {
          state: "Pending",
          blockNumber: createdEvent.blockNumber,
          end_time: createdBlockInfo.timestamp,
          start_time: createdBlockInfo.timestamp,
          trx_hash: createdEvent.transactionHash
        };
        p.states.push(createdState);

        // Push active state
        const activeState = {
          end_time: null,
          trx_hash: null,
          state: "Active",
          blockNumber: createdEvent.blockNumber,
          start_time: createdState.start_time
        };
        p.states.push(activeState);

        // Push canceled state
        if (canceledEvent){
          const canceledState = {
            end_time: null,
            state: "Canceled",
            blockNumber: canceledEvent.blockNumber,
            start_time: canceledBlockInfo.timestamp,
            trx_hash: canceledEvent.transactionHash
          }
          // Update previous state end_time
          p.states[p.states.length-1].end_time = canceledBlockInfo.timestamp;
          p.states.push(canceledState);
        } else {
          // Push queued state
          if (queuedEvent){
            const succeededState = {
              end_time: null,
              trx_hash: null,
              state: "Succeeded",
              blockNumber: queuedEvent.blockNumber,
              start_time: queuedBlockInfo.timestamp,
            };

            const queuedState = {
              end_time: null,
              state: "Queued",
              blockNumber: queuedEvent.blockNumber,
              trx_hash: queuedEvent.transactionHash,
              start_time: queuedBlockInfo.timestamp,
            };

            // Update previous state end_time
            p.states[p.states.length-1].end_time = queuedBlockInfo.timestamp;
            // Push Succeeded state
            p.states.push(succeededState);
            // Push queued state
            p.states.push(queuedState);
          }

          // Push executed state
          if (executedEvent){
            const executedState = {
              end_time: null,
              state: "Executed",
              blockNumber: executedEvent.blockNumber,
              start_time: executedBlockInfo.timestamp,
              trx_hash: executedEvent.transactionHash
            }
            // Update previous state end_time
            p.states[p.states.length-1].end_time = executedBlockInfo.timestamp;
            p.states.push(executedState);
          }
        }

        // console.log(governanceContractName,i,proposalStates,proposalStates[i]);

        // Check for defeated or expired
        p.state = enumerateProposalState(proposalStates[i]);
        const foundState = p.states.find( s => (s.state === p.state) );
        if (!foundState){
          const endState = {
            state: p.state,
            end_time: null,
            trx_hash: null,
            blockNumber: p.endBlock,
            start_time: endBlockInfo.timestamp,
          }
          // Update previous state end_time
          p.states[p.states.length-1].end_time = endBlockInfo.timestamp;
          p.states.push(endState);
        }

        p.votes = votes.filter( v => (parseInt(v.proposalId)===proposalId) );

        const { description, signatures, targets, values, calldatas } = createdEvent.returnValues;
        p.timestamp = createdBlockInfo ? createdBlockInfo.timestamp : null;


        // Idle
        p.title = description.split(/# |\n|↵/g)[0].replace(/^#/,'') || 'Untitled';
        p.description = description.split(/\n|↵/g);
        p.description.shift();
        p.description = p.description.join("\n");
        p.description = p.description.replace(/\n/g,"<br />")

        // Overwrite proposal details
        const proposalDetails = this.functionsUtil.getGlobalConfig(['governance','proposals',proposalId]);
        if (proposalDetails){
          Object.keys(proposalDetails).forEach( attr => {
            p[attr] = proposalDetails[attr];
          });
        }

        // Save proposal
        proposals[i] = {
          eta:p.eta,
          actions:{
            values,
            targets,
            calldatas,
            signatures
          },
          id:proposalId,
          title:p.title,
          state:p.state,
          votes:p.votes,
          states:p.states,
          executed:p.executed,
          endBlock:p.endBlock,
          canceled:p.canceled,
          forVotes:p.forVotes,
          proposer:p.proposer,
          timestamp:p.timestamp,
          startBlock:p.startBlock,
          description:p.description,
          againstVotes:p.againstVotes
        };
      });

      
      
      // console.log('getProposals',filter_by_state,cachedData);

      

      Object.values(proposals).forEach(proposal=>{
        allProposals.push(proposal);
      });
    });
    this.functionsUtil.setCachedDataWithLocalStorage(cachedDataKey,allProposals,3600);

    if (filter_by_state){
      allProposals = allProposals.filter( p => (p && p.state && p.state.toLowerCase() === filter_by_state.toLowerCase() ) );
    }

    if (voted_by){
      allProposals = allProposals.filter( p => (p && p.votes.find( v => (v.voter && v.voter.toLowerCase() === voted_by.toLowerCase()) )) );
    }

    if (startBlock){
      allProposals = allProposals.filter( p => parseInt(p.startBlock)>=parseInt(startBlock) );
    }

    return allProposals;
  }
}

export default GovernanceUtil;