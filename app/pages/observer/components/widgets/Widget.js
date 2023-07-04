import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Widget extends React.PureComponent {
    constructor(props){
        super(props)
    }
    static get type() {
      throw new Error(`Class Widget: static field 'type' needs to be implemented.`);
    }
    static get registerInformation() {
      throw new Error(`Class Widget: static field 'registerInformation' needs to be implemented.`);
    }

    getContent(){
        throw new Error("class Widget: 'getContent' methods needs to be implemented.")
    }

    update(){
        throw new Error(`Class Widget: 'update' methods needs to be implemented.`);
    }

    resize(){}

    getContainer = (container) => {
        this.container = container
    }
    
    componentWillReceiveProps(nextProps){
    }
    

    render() {
        return (
            <div ref={this.getContainer} >
                {this.getContent()}
            </div>
        )
    }
}


Widget.propTypes = {
};

export default Widget;
