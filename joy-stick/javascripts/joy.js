const StickStatus = {
  xPosition: 0,
  yPosition: 0,
  x: 0, // 最大値: 100 最小値: -100
  y: 0, // 最大値: 100 最小値: -100
  cardinalDirection: 'C' // 方位(デフォルトは "C"enter)
};

/**
 * @description ジョイスティックを描画する関数
 * @param {String} container JoyStick 関数のインスタンスをもつ HTML 要素
 * @param {optional} parameters 以下のキーを持つオブジェクト
 *  title {String} (optional) キャンバスの ID(デフォルトの値は 'joystick')
 *  width {Int} (optional) キャンバスの幅(デフォルトの値はコンテナの幅)
 *  height {Int} (optional) キャンバスの高さ(デフォルトの値はコンテナの高さ)
 *  internalFillColor {String} (optional) スティック内部の色(デフォルトの値は '#00AA00')
 *  anotherInternalFillColor {String} (optional) その他のスティック内部の色(デフォルト値はなし)
 *  internalLineWidth {Int} (optional) スティックの境界線の幅(デフォルトの値は 2)
 *  internalStrokeColor {String} (optional) スティックの境界線の色(デフォルトの値は '#003300')
 *  externalLineWidth {Int} (optional) スティックの動かす基準となる円の幅 (デフォルトの値は 2)
 *  externalStrokeColor {String} (optional) 基準となる円の色(デフォルトの値は '#008000')
 *  autoReturnToCenter {Bool} (optional) スティックを離した際に、中央の位置に戻るかどうかを設定する値(デフォルトの値は true で、中央に戻る設定)
 * @param {StickStatus} callback
 */

const JoyStick = (function(container, parameters, callback) { // function と => では this の扱いが異なる
  parameters = parameters || {}; // 存在しなければ新規作成
  let title = (typeof parameters.title === 'undefined' ? 'joystick' : parameters.title),// 存在しなければデフォルトの値を設定
      width = (typeof parameters.width === 'undefined' ? 0 : parameters.width),
      height = (typeof parameters.height === 'undefined' ? 0 : parameters.height),
      internalFillColor = (typeof parameters.internalFillColor === 'undefined' ? '#00AA00' : parameters.internalFillColor),
      internalLineWidth = (typeof parameters.internalLineWidth === 'undefined' ? 2 : parameters.internalLineWidth),
      internalStrokeColor = (typeof parameters.internalStrokeColor === 'undefined' ? '#003300' : parameters.internalStrokeColor),
      externalLineWidth = (typeof parameters.externalLineWidth === 'undefined' ? 2 : parameters.externalLineWidth),
      externalStrokeColor = (typeof parameters.externalStrokeColor === 'undefined' ? '#008000' : parameters.externalStrokeColor),
      autoReturnToCenter = (typeof parameters.autoReturnToCenter === 'undefined' ? true : parameters.autoReturnToCenter)
  
  callback = callback || function (StickStatus) { };// 存在しない場合は空の関数を渡す

  // コンテナの中に、キャンバス要素を作成する
  const objContainer = document.getElementById(container);

  // Passive Event Listener 内で preventDefault を使用できるように設定(Chrome)
  objContainer.style.touchAction = 'none';

  const canvas = document.createElement('canvas');
  canvas.id = title;
  if (width === 0) width = objContainer.clientWidth;
  if (height === 0) height = objContainer.clientHeight;
  canvas.width = width;
  canvas.height = height;
  objContainer.appendChild(canvas);
  const context = canvas.getContext('2d');

  let pressed = false; // true: 押されている false: 押されていない
  const circumference = 2 * Math.PI; // 円周の半径に対する比(τ)
  const internalRadius = (canvas.width - ((canvas.width / 2) + 10)) / 2; // 内側の円の半径
  const maxMoveStick = internalRadius + 5; // スティックの最大可動域 
  const externalRadius = internalRadius + 30; // 外側の縁の半径
  const centerX = canvas.width / 2; // 中心座標(X)
  const centerY = canvas.height / 2; // 中心座標(Y)
  const directionHorizontalLimitPos = canvas.width / 10; // 水平方向に動かせる限界の場所
  const directionHorizontalLimitNeg = directionHorizontalLimitPos * -1; // directionHorizontalLimitPos の符号を反転した値
  const directionVerticalLimitPos = canvas.height / 10; // 垂直方向に動かせる限界の場所
  const directionVerticalLimitNeg = directionVerticalLimitPos * -1; // directionVerticalLimitPos の符号を反転した値
  // スティックの現在位置を保存
  let movedX = centerX;
  let movedY = centerY;

  // タッチデバイスを使用しているかどうかを確認
  if ('ontouchstart' in document.documentElement) { // 要素がタッチされていたら
    canvas.addEventListener('touchstart', onTouchStart, false); // false にすることで、このリスナーは削除されず、何度も呼び出せる(デフォルト)
    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchend', onTouchEnd, false);
  } else {// タッチデバイスでないなら
    canvas.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
  }
  // スティックを描く
  drawExternal();
  drawInternal();

  /**********************
   * 以下、private メソッド
   **********************/
  /**
   * @description 基準となる外側の円を描く関数
   */
  function drawExternal() {
    context.beginPath();
    context.arc(centerX, centerY, externalRadius, 0, circumference, false); // false: 時計回りに円を描く
    context.lineWidth = externalLineWidth;
    context.strokeStyle = externalStrokeColor;
    context.stroke();
  }


  /**
   * @description ユーザがスティックを動かした現在位置に、スティックを描画する関数
   */
  function drawInternal() {
    context.beginPath();
    if (movedX < maxMoveStick) movedX = maxMoveStick; // スティックが円からはみ出さないように
    if ((movedX + maxMoveStick) > canvas.width) movedX = canvas.width - (maxMoveStick); // スティックがcanvas要素の外側に行かないように
    if (movedY < maxMoveStick) movedY = maxMoveStick; // スティックが円からはみ出さないように
    if ((movedY + maxMoveStick) > canvas.height) movedY = canvas.height - (maxMoveStick); // スティックがcanvas要素の外側に行かないように
    context.arc(movedX, movedY, internalRadius, 0, circumference, false);
    // 放射状グラデーションの作成
    const grd = context.createRadialGradient(movedX + 20, movedY - 20, 5, movedX, movedY, 75);
    // グラデーションに使う色の指定(明)
    grd.addColorStop(0, internalFillColor); // 0: 開始地点
    const aotInternalFillColor = parameters.anotherInternalFillColor
    // グラデーションに使用するその他の色
    if (aotInternalFillColor) {
      for (const [offset, color] of Object.entries(aotInternalFillColor)) {
        grd.addColorStop(offset, color);
      }
    }
    // グラデーションに使う色の指定(暗)
    grd.addColorStop(1, internalStrokeColor);
    context.fillStyle = grd;
    context.fill();
    context.lineWidth = internalLineWidth;
    context.strokeStyle = internalStrokeColor;
    context.stroke();
  }


  /**
   * @description タッチイベント用の関数
   */
  function onTouchStart() {
    pressed = true;
  }

  function onTouchMove(event) {
    if (pressed && event.targetTouches[0].target === canvas) { // canvas 要素が押されているなら
      movedX = event.targetTouches[0].pageX; // pageX: ページ全体に対するX座標
      movedY = event.targetTouches[0].pageY;
      // 基準からの距離を考慮
      if (canvas.offsetParent.tagName.toUpperCase() === 'BODY') { // .toUpperCase() は常に大文字にしたいため
        movedX -= canvas.offsetLeft;
        movedY -= canvas.offsetTop; // canvas.offsetTop: ここでは、 canvas 要素の外枠から body 要素の上枠の内側までの相対的な距離
      } else {
        movedX -= canvas.offsetParent.offsetLeft;
        movedY -= canvas.offsetParent.offsetTop;
      }
      // キャンバス全体を消去
      context.clearRect(0, 0, canvas.width, canvas.height);
      // 再度スティックを描画する
      drawExternal();
      drawInternal();

      // StickStatus オブジェクトの値を設定
      StickStatus.xPosition = movedX;
      StickStatus.yPosition = movedY;
      StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
      StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed(); // y の±の向きを一般的なものに戻す
      StickStatus.cardinalDirection = getCardinalDirection();
      callback(StickStatus);
    }
  }

  function onTouchEnd() {
    pressed = false;
    //  autoReturnToCenter が true (指を離したら自動的に中央へ戻る)のとき
    if (autoReturnToCenter) {
      movedX = centerX;
      movedY = centerY;
    }
    // キャンバス全体を消去
    context.clearRect(0, 0, canvas.width, canvas.height);
    // 再度スティックを描画する
    drawExternal();
    drawInternal();

    // StickStatus オブジェクトの値を設定
    StickStatus.xPosition = movedX;
    StickStatus.yPosition = movedY;
    StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
    StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed(); // y の±の向きを一般的なものに戻す
    StickStatus.cardinalDirection = getCardinalDirection();
    callback(StickStatus);
  }


  /**
   * @description マウスイベント用の関数
   */
  function onMouseDown() {
    pressed = true;
  }

  function onMouseMove(event) {
    if (pressed) {
      movedX = event.pageX;
      movedY = event.pageY;
      // 基準からの距離を考慮
      if (canvas.offsetParent.tagName.toUpperCase() === 'BODY') {
        movedX -= canvas.offsetLeft;
        movedY -= canvas.offsetTop;
      } else {
        movedX -= canvas.offsetParent.offsetLeft;
        movedY -= canvas.offsetParent.offsetTop;
      }
      // キャンバス全体を消去
      context.clearRect(0, 0, canvas.width, canvas.height);
      // 再度スティックを描画する
      drawExternal();
      drawInternal();

      // StickStatus オブジェクトの値を設定
      StickStatus.xPosition = movedX;
      StickStatus.yPosition = movedY;
      StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
      StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed(); // y の ± の向きを一般的なものに戻す
      StickStatus.cardinalDirection = getCardinalDirection();
      callback(StickStatus);
    }
  }

  function onMouseUp() {
    pressed = false;
    //  autoReturnToCenter が true (指を離したら自動的に中央へ戻る)のとき
    if (autoReturnToCenter) {
      movedX = centerX;
      movedY = centerY;
    }
    // キャンバス全体を消去
    context.clearRect(0, 0, canvas.width, canvas.height);
    // 再度スティックを描画する
    drawExternal();
    drawInternal();

    // StickStatus オブジェクトの値を設定
    StickStatus.xPosition = movedX;
    StickStatus.yPosition = movedY;
    StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
    StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed(); // y の±の向きを一般的なものに戻す
    StickStatus.cardinalDirection = getCardinalDirection();
    callback(StickStatus);
  }

  /**
   * @description スティックの現在位置から、8方位のいずれかを文字列で返す関数
   * @param {String} result 8方位の頭文字1文字または2文字
   */
  function getCardinalDirection() {
    let result = '';
    let horizontal = movedX - centerX;
    let vertical = movedY - centerY;

    if (vertical >= directionVerticalLimitNeg && vertical <= directionVerticalLimitPos) result = 'C';
    if (vertical < directionVerticalLimitNeg) result = 'N';
    if (vertical > directionVerticalLimitPos) result = 'S';

    if (horizontal < directionHorizontalLimitNeg) {
      if (result === 'C') {
        result = 'W';
      } else {
        result += 'W';
      }
    }
    if (horizontal > directionHorizontalLimitPos) {
      if (result === 'C') {
        result = 'E';
      } else {
        result += 'E';
      }
    }

    return result;
  }

  
  /*********************
   * 以下、public メソッド
   *********************/

  /**
   * @description キャンバスの幅を返す関数
   * @return {Int} 幅の px 値
   */
  this.GetWidth = () => canvas.width;

  /**
   * @description キャンバスの高さを返す関数
   * @return {Int} 高さの px 値
   */
  this.GetHeight = () => canvas.height;

  /**
   * @description キャンバスの寸法に対するカーソルの X 座標を返す関数
   * @return {Int} 相対的な位置
   */
  this.GetPosX = () => movedX;

  /**
   * @description キャンバスの寸法に対するカーソルの Y 座標を返す関数
   * @return {Int} 相対的な位置
   */
  this.GetPosY = () => movedY;

  /**
   * @description 扱いやすくした、スティックの X 座標を返す関数
   * @return {Int} -100 から 100 までの整数
   */
  this.GetX = () => (100 * ((movedX - centerX) / maxMoveStick)).toFixed();

  /**
   * @description 扱いやすくした、スティックの Y 座標を返す関数
   * @return {Int} -100 から 100 までの整数
   */
  this.GetY = () => ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();

  /**
   * @description スティックの方向を文字列で返す関数
   * @return {String} 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'C'のいずれか
   */
  this.GetDir = () => getCardinalDirection();
});