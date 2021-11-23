import { Image } from "rimble-ui"
import React, { Component } from 'react'
class HoverImage extends Component {

    render() {
        return (
            <Image
                src={this.props.hoverOn ? this.props.hover : this.props.noHover}
                {...this.props.imageProps}
            />
        )
    }
}
export default HoverImage;