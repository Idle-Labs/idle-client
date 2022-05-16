import moment from 'moment';
import { id as keccak256 } from 'ethers/utils/hash';

class Multicall {
  web3 = null;
  multiCalls = {};
  multiCallsMax = 100;
  multiCallsStats = {
    endDate:null,
    startDate:null,
    arrivedCount:0,
    rejectedCount:0,
    requestsTimes:{},
    missingHashes:{},
    processedCount:0,
    resolvedHashes:{},
    rejectedHashes:{},
    totalElapsedTime:0,
    maxProcessingBatches:0
  };
  processingBatches = 0;
  selectedNetwork = null;
  networksContracts = {
    1:'0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
    137:'0x11ce4B23bD875D7F5C6a31084f55fDe1e9A87507'
  };
  multiCallsBatchId = 0;
  multiCallsResults = {};
  multiCallsTimeoutIds = {};
  maxProcessingBatches = null;
  multiCallsExecutionInterval = 500;

  timeLog = (...props) => { console.log(moment().format('HH:mm:ss'), ...props); }

  constructor(selectedNetwork=null,web3=null,multiCallsMax=null,multiCallsExecutionInterval=null) {
    if (selectedNetwork){
      this.setNetwork(selectedNetwork);
    }
    if (web3){
      this.setWeb3(web3);
    }
    if (multiCallsMax){
      this.multiCallsMax = multiCallsMax;
    }
    if (multiCallsExecutionInterval){
      this.multiCallsExecutionInterval = multiCallsExecutionInterval;
    }
  }

  clear(){
    this.multiCalls = {};
    this.multiCallsStats = {
      endDate:null,
      startDate:null,
      arrivedCount:0,
      rejectedCount:0,
      requestsTimes:{},
      missingHashes:{},
      processedCount:0,
      resolvedHashes:{},
      rejectedHashes:{},
      totalElapsedTime:0,
      maxProcessingBatches:0
    };
    this.processingBatches = 0;
    this.multiCallsBatchId = 0;
    this.multiCallsResults = {};
    this.multiCallsTimeoutIds = {};
    this.maxProcessingBatches = null;
  }

  setNetwork(selectedNetwork){
    this.selectedNetwork = selectedNetwork;
  }

  setWeb3(web3) {
    this.web3 = web3;
  }

  makeMulticall = async (callData) => {
    const callBatchId = this.multiCallsBatchId;
    const callDataHash = JSON.stringify(callData);

    // Skip rejected calls for more than 2 times
    if (this.checkRejectedHash(callDataHash)>=1){
      return 'REJECTED';
    }

    if (!this.multiCalls[this.multiCallsBatchId]){
      this.multiCalls[this.multiCallsBatchId] = {};
    }
    this.multiCalls[this.multiCallsBatchId][callDataHash] = callData;

    this.multiCallsStats.arrivedCount++;

    if (!this.multiCallsStats.missingHashes[this.multiCallsBatchId]){
      this.multiCallsStats.missingHashes[this.multiCallsBatchId] = {};
    }
    this.multiCallsStats.missingHashes[this.multiCallsBatchId][callDataHash] = this.multiCallsBatchId;

    // this.timeLog('makeMulticall',this.multiCallsBatchId,callDataHash);

    if (!this.multiCallsTimeoutIds[this.multiCallsBatchId]){
      this.multiCallsTimeoutIds[this.multiCallsBatchId] = 0;
    }

    window.clearTimeout(this.multiCallsTimeoutIds[callBatchId]);
    if (Object.values(this.multiCalls[callBatchId]).length>=this.multiCallsMax){
      this.multiCallsBatchId++;
      this.executeBatch(callBatchId);
    } else {
      this.multiCallsTimeoutIds[callBatchId] = setTimeout(() => {
        this.multiCallsBatchId++;
        this.executeBatch(callBatchId);
      },this.multiCallsExecutionInterval);
    }

    const checkMulticallData = async (batchId,resultHash) => {
      return new Promise( (resolve, reject) => {
        const attempt = (count=0,maxCount=2000) => {

          const maxCountReached = maxCount && count>=maxCount;
          const resultIsDefined = this.multiCallsResults[batchId] && typeof this.multiCallsResults[batchId][resultHash] !== 'undefined';

          if (resultIsDefined || maxCountReached){

            // Force rejected response
            if (maxCountReached && !resultIsDefined){
              if (!this.multiCallsResults[batchId]){
                this.multiCallsResults[batchId] = {};
              }
              this.multiCallsResults[batchId][resultHash] = 'REJECTED';
            }

            // Handle rejection
            if (this.multiCallsResults[batchId][resultHash] === 'REJECTED'){
              // this.timeLog('REJECTED',batchId,resultHash);

              // Add hash to rejected hashes
              this.addRejectedHash(resultHash);

              resolve('REJECTED');
            } else {
              // this.timeLog('RESOLVED',batchId,resultHash);
              this.addResolvedHash(resultHash);
              resolve(this.multiCallsResults[batchId][resultHash]);
            }

            // Increment processed count
            this.multiCallsStats.processedCount++;

            // Remove hash from missing hashes
            delete this.multiCallsStats.missingHashes[batchId][resultHash];
          } else {
            // this.timeLog('checkMulticallData_NOT-FOUND',resultHash);
            window.setTimeout(()=>{
              attempt(count+1);
            },10);
          }
        }

        attempt(0);
      });
    }

    const data = await checkMulticallData(callBatchId,callDataHash);
    return data;
  }

  checkResolvedHash = (callHash) => {
    return !!this.multiCallsStats.resolvedHashes[callHash];
  }

  checkRejectedHash = (callHash) => {
    return this.multiCallsStats.rejectedHashes[callHash] || false;
  }

  addResolvedHash = (callHash) => {
    if (!this.multiCallsStats.resolvedHashes[callHash]){
      this.multiCallsStats.resolvedHashes[callHash] = 0;
    }
    this.multiCallsStats.resolvedHashes[callHash]++;

    if (this.checkRejectedHash(callHash)){
      delete this.multiCallsStats.rejectedHashes[callHash];
    }
  }

  addRejectedHash = (callHash,checkResolved=true) => {
    if (checkResolved && this.checkResolvedHash(callHash)){
      return false;
    }
    if (!this.multiCallsStats.rejectedHashes[callHash]){
      this.multiCallsStats.rejectedHashes[callHash] = 0;
    }
    this.multiCallsStats.rejectedCount++;
    this.multiCallsStats.rejectedHashes[callHash]++;
  }

  executeBatch = async (executeBatchId) => {

    const asyncTimeout = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    if (!this.web3 || !this.selectedNetwork || (this.maxProcessingBatches && this.processingBatches>=this.maxProcessingBatches)){
      await asyncTimeout(10);
      return await this.executeBatch(executeBatchId);
    }

    this.processingBatches++;

    // Take maximum processing batches
    this.multiCallsStats.maxProcessingBatches = Math.max(this.multiCallsStats.maxProcessingBatches,this.processingBatches);
    
    // this.timeLog('executeBatch_START',executeBatchId,this.processingBatches,this.multiCalls[executeBatchId]);

    if (!this.multiCallsStats.startDate){
      this.multiCallsStats.startDate = new Date();
    }

    const startDate = new Date();
    const timeStart = parseFloat(Date.now()/1000);
    const results = await this.executeMulticalls(Object.values(this.multiCalls[executeBatchId]),this.web3);

    const endDate = new Date();
    const hashes = Object.keys(this.multiCalls[executeBatchId]);
    const elapsedTime = parseFloat(Date.now()/1000)-timeStart;
    const requestsCount = Object.values(this.multiCalls[executeBatchId]).length;
    const avgResolveTime = elapsedTime/requestsCount;
    const status = results ? 'RESOLVED' : 'REJECTED';

    this.multiCallsStats.requestsTimes[executeBatchId] = {
      hashes,
      status,
      elapsedTime,
      requestsCount,
      avgResolveTime,
      startDate,
      endDate,
    };

    this.multiCallsResults[executeBatchId] = {};
    
    if (results) {
      results.forEach( (r,i) => {
        const callDataHash = Object.keys(this.multiCalls[executeBatchId])[i];
        this.multiCallsResults[executeBatchId][callDataHash] = r;
        // this.timeLog('SAVE',executeBatchId,callDataHash,this.multiCallsResults[executeBatchId][callDataHash]);
      });
      // delete this.multiCalls[executeBatchId][callDataHash];
    } else {
      Object.keys(this.multiCalls[executeBatchId]).forEach( callDataHash => {
        this.multiCallsResults[executeBatchId][callDataHash] = 'REJECTED';
      });
      // delete this.multiCalls[executeBatchId];
    }

    this.processingBatches--;
    if (this.processingBatches<0){
      this.processingBatches = 0;
    }

    this.multiCallsStats.endDate = new Date();
    this.multiCallsStats.totalElapsedTime = parseFloat(this.multiCallsStats.endDate.getTime()/1000)-parseFloat(this.multiCallsStats.startDate.getTime()/1000);

    // delete this.multiCalls[executeBatchId];
    // this.timeLog('executeBatch_END',executeBatchId,this.processingBatches,this.multiCalls[executeBatchId],results);
  }

  prepareMulticallData = (calls,web3=null) => {

    web3 = this.web3 || web3;

    if (!web3){
      return false;
    }

    const strip0x = (str) => {
      return str.replace(/^0x/, '');
    }

    // this.timeLog('prepareMulticallData',this.web3,this.props);

    const values = [
      calls.map(({ target, method, args, returnTypes }) => [
        target,
        keccak256(method).substr(0, 10) +
          (args && args.length > 0
            ? strip0x(web3.eth.abi.encodeParameters(args.map(a => a[1]), args.map(a => a[0])))
            : '')
      ])
    ];
    const calldata = web3.eth.abi.encodeParameters(
      [
        {
          components: [{ type: 'address' }, { type: 'bytes' }],
          name: 'data',
          type: 'tuple[]'
        }
      ],
      values
    );

    return '0x252dba42'+strip0x(calldata);
  }

  executeMulticalls = async (calls,web3=null) => {

    web3 = this.web3 || web3;

    const calldata = this.prepareMulticallData(calls,web3);

    if (!calldata){
      return null;
    }

    const contractAddress = this.networksContracts[this.selectedNetwork];

    try {
      const results = await web3.eth.call({
        data: calldata,
        to:contractAddress
      });
      const decodedParams = web3.eth.abi.decodeParameters(['uint256', 'bytes[]'], results);

      // this.timeLog('makeMulticall',calls,results,decodedParams);

      if (decodedParams && typeof decodedParams[1] !== 'undefined'){
        return decodedParams[1].map( (d,i) => {
          const returnTypes = calls[i].returnTypes;
          const returnFields = calls[i].returnFields;
          const output = Object.values(web3.eth.abi.decodeParameters(returnTypes,d));
          if (returnTypes.length === 1){
            return output[0];
          }
          const values = output.splice(0,returnTypes.length);
          return values.reduce( (acc,v,j) => {
            acc[j] = v;
            acc[returnFields[j]] = v;
            return acc;
          },{});
        });
      }
    } catch (err) {
      // this.timeLog('makeMulticall',err);
      return null;
    }

    return null;
  }
}

export default Multicall;