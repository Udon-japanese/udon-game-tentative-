const joyParam = {
  'title': 'MainJoyStick',
  'internalFillColor': '#FFFFFF',
  'anotherInternalFillColor': {
    0.5: '#0099FF',
    0.9: '#0071BD'
  },
  'internalLineWidth': 2,
  'internalStrokeColor': '#00568F',
  'externalLineWidth': 5,
  'externalStrokeColor': '#000000',
  'autoReturnToCenter': true
};

const callbackFunc =  (stickData) => {
  PosX.value = stickData.xPosition;
  PosY.value = stickData.yPosition;
  Direction.value = stickData.cardinalDirection;
  X.value = stickData.x;
  Y.value = stickData.y;
}

const joy = new JoyStick('joy', joyParam, callbackFunc);