module.exports = (fn) => {
    return (req, res, next) => {
      //next関数にエラーを渡して、そのエラーをグローバルエラー処理ミドルウェアで処理できるようにする必要があります。
      fn(req, res, next).catch(next);
    }
  };