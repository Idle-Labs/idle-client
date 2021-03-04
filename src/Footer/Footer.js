import {
  Link as RouterLink,
} from "react-router-dom";
import ExtLink from '../ExtLink/ExtLink';
import React, { Component } from 'react';
import styles from './Footer.module.scss';
import FunctionsUtil from '../utilities/FunctionsUtil';
import { Flex, Text, Heading, Image, Link } from 'rimble-ui';

class Footer extends Component {

  // Utils
  functionsUtil = null;
  loadUtils(){
    if (this.functionsUtil){
      this.functionsUtil.setProps(this.props);
    } else {
      this.functionsUtil = new FunctionsUtil(this.props);
    }
  }

  async componentWillMount() {
    this.loadUtils();
  }

  render() {
    const currYear = new Date().getFullYear();
    const governanceEnabled = this.functionsUtil.getGlobalConfig(['governance','enabled']);
    const columnWidth = governanceEnabled ? 1/4 : 1/3;
    return (
      <Flex
        pl={0}
        id={"footer"}
        alignItems={'center'}
        flexDirection={'column'}
        className={styles.footer}
        backgroundColor={'white'}
        justifyContent={'flex-start'}
      >
        <Flex
          width={1}
          px={[3,6]}
          justifyContent={'center'}
        >
          <Flex
            width={1}
            height={['auto','100%']}
            alignItems={'flex-start'}
            maxWidth={['35em','70em']}
            justifyContent={'flex-start'}
            flexDirection={['column','row']}
          >
            <Flex width={[1,columnWidth]} flexDirection={'column'} height={['auto','100%']}>
              <Heading.h3 textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,3]} my={3} color={'dark-gray'}>
                Resources
              </Heading.h3>
              <Flex width={1} flexDirection={'column'}>
                <ExtLink
                  pb={[3,2]}
                  color={'blue'}
                  fontSize={[3,2]}
                  hoverColor={'blue'}
                  fontFamily={'sansSerif'}
                  textAlign={['center','left']}
                  href={'https://developers.idle.finance'}
                >
                  <span role="img" aria-label="documentation">📚</span> Documentation
                </ExtLink>
                <ExtLink
                  pb={[3,2]}
                  color={'blue'}
                  fontSize={[3,2]}
                  hoverColor={'blue'}
                  fontFamily={'sansSerif'}
                  textAlign={['center','left']}
                  href={'https://www.notion.so/idlelabs/Idle-Finance-Brand-Assets-fd63e4161cb64c999531646c7549bc4b'}
                >
                  <span role="img" aria-label="brand-assets">🎨</span> Brand Assets
                </ExtLink>
                <Flex pb={[3,2]} width={1} justifyContent={['center','flex-start']}>
                  <RouterLink
                    color={'blue'}
                    to="/terms-of-service"
                    className={styles.link}
                  >
                    <Text
                      fontWeight={3}
                      color={'blue'}
                      fontSize={[3,2]}
                      hoverColor={'blue'}
                      fontFamily={'sansSerif'}
                      textAlign={['center','left']}
                    >
                      <span role="img" aria-label="terms-of-service">📑</span> Terms of Service
                    </Text>
                  </RouterLink>
                </Flex>
                <ExtLink
                  pb={[3,2]}
                  color={'blue'}
                  fontSize={[3,2]}
                  hoverColor={'blue'}
                  fontFamily={'sansSerif'}
                  textAlign={['center','left']}
                  href={'https://www.iubenda.com/privacy-policy/61211749'}
                >
                  <span role="img" aria-label="privacy-policy">🕵️‍♂️</span> Privacy Policy
                </ExtLink>
                <ExtLink
                  pb={[3,2]}
                  color={'blue'}
                  fontSize={[3,2]}
                  hoverColor={'blue'}
                  fontFamily={'sansSerif'}
                  textAlign={['center','left']}
                  href={'https://www.iubenda.com/privacy-policy/61211749/cookie-policy'}
                >
                  <span role="img" aria-label="cookie-policy">🍪</span> Cookie Policy
                </ExtLink>
              </Flex>
            </Flex>
            {
              governanceEnabled && 
                <Flex width={[1,columnWidth]} flexDirection={'column'} height={['auto','100%']}>
                  <Heading.h3 textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,3]} my={3} color={'dark-gray'}>
                    Governance
                  </Heading.h3>
                  <Flex width={1} flexDirection={'column'}>
                    <Flex pb={[3,2]} width={1} justifyContent={['center','flex-start']}>
                      <RouterLink
                        color={'blue'}
                        to={"/governance"}
                        className={styles.link}
                      >
                        <Text textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,2]} fontWeight={3} color={'blue'} hoverColor={'blue'}>
                          <span role="img" aria-label="governance-overview">🏛</span> Overview
                        </Text>
                      </RouterLink>
                    </Flex>
                    <Flex pb={[3,2]} width={1} justifyContent={['center','flex-start']}>
                      <RouterLink
                        color={'blue'}
                        className={styles.link}
                        to={"/governance/proposals"}
                      >
                        <Text textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,2]} fontWeight={3} color={'blue'} hoverColor={'blue'}>
                          <span role="img" aria-label="governance-proposals">💡</span> Proposals
                        </Text>
                      </RouterLink>
                    </Flex>
                    <Flex pb={[3,2]} width={1} justifyContent={['center','flex-start']}>
                      <RouterLink
                        color={'blue'}
                        className={styles.link}
                        to={"/governance/leaderboard"}
                      >
                        <Text textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,2]} fontWeight={3} color={'blue'} hoverColor={'blue'}>
                          <span role="img" aria-label="governance-leaderboard">📋</span> Leaderboard
                        </Text>
                      </RouterLink>
                    </Flex>
                    <Flex pb={[3,2]} width={1} justifyContent={['center','flex-start']}>
                      <ExtLink href="https://gov.idle.finance/">
                        <Text textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,2]} fontWeight={3} color={'blue'} hoverColor={'blue'}>
                          <span role="img" aria-label="governance-forum">🤝</span> Forum
                        </Text>
                      </ExtLink>
                    </Flex>
                  </Flex>
                </Flex>
            }
            <Flex width={[1,columnWidth]} flexDirection={'column'} height={['auto','100%']}>
              <Heading.h3 textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,3]} my={3} color={'dark-gray'}>
                Start a Conversation
              </Heading.h3>
              <Link textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,2]} color={'blue'} hoverColor={'blue'}>
                <span role="img" aria-label="email">✉️</span> info@idle.finance
              </Link>
            </Flex>
            <Flex width={[1,columnWidth]} flexDirection={'column'}>
              <Heading.h3 textAlign={['center','left']} fontFamily={'sansSerif'} fontSize={[3,3]} my={3} color={'dark-gray'}>
                Explore
              </Heading.h3>
              <Flex flexDirection={'row'} justifyContent={['space-evenly','flex-start']}>
                <ExtLink href="https://twitter.com/idlefinance">
                  <Image src="images/social/twitter.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
                <ExtLink href="https://t.me/idlefinance">
                  <Image src="images/social/telegram.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
                <ExtLink href="https://discord.gg/mpySAJp">
                  <Image src="images/social/discord.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
                <ExtLink href="https://medium.com/@idlefinance">
                  <Image src="images/social/medium.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
                <ExtLink href="https://github.com/Idle-Labs/">
                  <Image src="images/social/github.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
                <ExtLink href="https://www.linkedin.com/company/idlefinance">
                  <Image src="images/social/linkedin.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
                <ExtLink href="https://defipulse.com/defi-list">
                  <Image src="images/social/defi-pulse.png" height={'2.4em'} mr={['auto',3]} my={[2,0]} boxShadow={1} borderRadius={'7px'} />
                </ExtLink>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          width={1}
          height={['auto','100%']}
          flexDirection={'column'}
          alignItems={['center','flex-end']}
          justifyContent={['center','flex-end']}
        >
          <Flex
            p={2}
            width={1}
            alignItems={'center'}
            justifyContent={'center'}
            backgroundColor={'dark-blue'}
            flexDirection={['column','row']}
          >
            <Text
              color={'white'}
              textAlign={['center','flex-end']}
            >
              &copy; {currYear} - Idle Labs Inc.
            </Text>
            <RouterLink
              color={'blue'}
              to={'/terms-of-service'}
              style={{textDecoration:'none'}}
            >
              <Text
                pl={2}
                color={'#0df'}
                textAlign={['center','flex-end']}
              >
                Terms of Service
              </Text>
            </RouterLink>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}

export default Footer;
