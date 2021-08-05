import React from "react";
import { useSwipeable } from 'react-swipeable';

export default function Swipeable(){

  const params = arguments[0];

  const handlers = useSwipeable({
    onSwiped: (eventData) => params.callback(eventData),
    delta: 10,                            // min distance(px) before a swipe starts
    preventDefaultTouchmoveEvent: false,  // call e.preventDefault *See Details*
    trackTouch: true,                     // track touch input
    trackMouse: false,                    // track mouse input
    rotationAngle: 0,                     // set a rotation angle
  });

  return (
  	<div {...handlers} style={{ touchAction: 'pan-x' }}>
  		{params.children}
  	</div>
  );
}