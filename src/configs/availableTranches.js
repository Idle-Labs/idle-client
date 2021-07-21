import idleTranche from '../contracts/IdleTokenV4.json';
const availableTranches = {
  idle:{
    DAI:{
      junior:{
        abi:idleTranche,
        name:'idleDAI_aa',
        address:'0x000000000000000000000000000000000000'
      },
      senior:{
        abi:idleTranche,
        name:'idleDAI_bb',
        address:'0x000000000000000000000000000000000000'
      }
    }
  },
  yearn:{
  	DAI:{
  	  junior:{
  	    address:'0x000000000000000000000000000000000000'
  	  },
  	  senior:{
  	    address:'0x000000000000000000000000000000000000'
  	  }
  	}
  }
};
export default availableTranches;