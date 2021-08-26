import Title from '../Title/Title';
import React, { Component } from 'react';
import Faquestion from '../Faquestion/Faquestion';
import { Box, Flex, Text, Heading } from 'rimble-ui'

class GenericFaqs extends Component {
  state = {
    openedAnswer:null,
    selectedSection:null
  };
  componentWillMount(){
    const selectedSection = Object.keys(this.props.questions)[0];
    this.setSection(selectedSection);
  }
  setSection(section) {
    this.setState(state => ({...state, selectedSection: section, openedAnswer: null}));
  }
  toggleAnswer(e,i) {
    e.preventDefault();
    this.setState(state => ({...state, openedAnswer: state.openedAnswer===i ? null : i }));
  };

  render() {
    const showSections = this.props.showSections === undefined || this.props.showSections;
    return (
      <Flex
        width={1}
        flexDirection={'column'}
      >
        <Flex
          width={1}
          alignItems={'center'}
          flexDirection={'column'}
          justifyContent={"center"}
        >
          {
            showSections && (
              <Flex
                mb={[3,4]}
                px={[2,0]}
                width={[1,3/5]}
                flexDirection={'row'}
                justifyContent={'space-between'}
              >
                {
                  Object.keys(this.props.questions).map( (section,i) => {
                    const isSelected = section === this.state.selectedSection;
                    return (
                      <Flex
                        key={`section_${i}`}
                        textAlign={'center'}
                        justifyContent={'center'}
                        width={1/Object.keys(this.props.questions).length}
                        borderBottom={ isSelected ? '3px solid #0036ff' : 'none'}
                      >
                        <Text
                          mb={1}
                          fontWeight={3}
                          fontSize={[2, 3]}
                          textAlign={'center'}
                          onClick={() => this.setSection(section)}
                          color={isSelected ? 'blue' : 'copyColor'}
                          className={['pointer', isSelected ? 'selected' : '']}
                        >
                          {section}
                        </Text>
                      </Flex>
                    );
                  })
                }
              </Flex>
            )
          }
          <Box
            width={1}
          >
            {
              this.props.questions[this.state.selectedSection].map( (question,i) => (
                <Faquestion
                  key={`answer_${i}`}
                  answer={question.a}
                  pt={i === 0 ? 0 : ''}
                  question={question.q}
                  isOpened={this.state.openedAnswer === i}
                  handleClick={ e => this.toggleAnswer(e,i) }
                />
              ))
            }
          </Box>
        </Flex>
      </Flex>
    );
  }
}

export default GenericFaqs;