import { Flex } from "rimble-ui";
import React, { Component } from 'react';
import FunctionsUtil from '../utilities/FunctionsUtil';
import DashboardCard from '../DashboardCard/DashboardCard';

class TableRow extends Component {

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

  async componentDidUpdate(prevProps, prevState) {
    this.loadUtils();
  }

  render() {
    const FieldComponent = this.props.fieldComponent;
    const hasClickFunction = typeof this.props.handleClick === 'function';
    const isInteractive = hasClickFunction || !!this.props.isInteractive;
    return (
      <DashboardCard
        cardProps={{
          mb:2,
          width:1,
          px:[2,4],
          py:[2,'12px']
        }}
        id={this.props.cardId}
        {...this.props.rowProps}
        className={this.props.token}
        isInteractive={isInteractive}
        handleClick={hasClickFunction ? e => this.props.handleClick(this.props) : null}
      >
        <DashboardCard.Consumer>
          {({
            mouseOver
          }) => {
            return (
              <Flex
                flexDirection={'row'}
                id={this.props.rowId}
              >
                {
                  this.props.cols.map((colInfo,colIndex) => {
                    const visibleOnDesktop = colInfo.visibleOnDesktop || false;
                    if (colInfo.visible === false || (colInfo.mobile === false && this.props.isMobile) || (colInfo.mobile === true && !visibleOnDesktop && !this.props.isMobile)){
                      return null;
                    }
                    return (
                      <Flex
                        key={`col-${colIndex}`}
                        {...colInfo.props}
                      >
                        <Flex
                          width={1}
                          alignItems={'center'}
                          flexDirection={'row'}
                          {...colInfo.parentProps}
                        >
                          {
                            colInfo.fields.map((fieldInfo,fieldIndex) => {
                              if (!fieldInfo || fieldInfo.visible === false || (fieldInfo.mobile === false && this.props.isMobile)){
                                return null;
                              }
                              const CustomComponent = fieldInfo.fieldComponent;

                              let fieldProps = fieldInfo.props;

                              // Merge with funcProps
                              if (fieldInfo.funcProps && Object.keys(fieldInfo.funcProps).length>0){
                                fieldProps = this.functionsUtil.replaceArrayPropsRecursive(fieldProps,fieldInfo.funcProps,this.props);
                              }

                              return (
                                <Flex
                                  height={'100%'}
                                  flexDirection={'column'}
                                  alignItems={'flex-start'}
                                  justifyContent={'center'}
                                  {...fieldInfo.parentProps}
                                  style={fieldInfo.style || {
                                    overflow:'hidden'
                                  }}
                                  width={colInfo.fields.length>1 ? 'auto' : 1}
                                  id={`field-${colIndex}-${fieldIndex}-${fieldInfo.name}`}
                                  key={`field-${colIndex}-${fieldIndex}-${fieldInfo.name}`}
                                >
                                  {
                                    CustomComponent ? (
                                      <CustomComponent
                                        {...this.props}
                                        {...fieldProps}
                                        mouseOver={mouseOver}
                                      />
                                    ) : (
                                      <FieldComponent
                                        {...this.props}
                                        mouseOver={mouseOver}
                                        fieldInfo={fieldInfo}
                                        colProps={colInfo.props}
                                        parentId={`field-${colIndex}-${fieldIndex}-${fieldInfo.name}`}
                                      />
                                    )
                                  }
                                </Flex>
                              );
                            })
                          }
                        </Flex>
                      </Flex>
                    )
                  })
                }
              </Flex>
            );
          }}
          </DashboardCard.Consumer>
      </DashboardCard>
    );
  }
}

export default TableRow;
