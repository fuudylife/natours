class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //これは、私たちが使っているライブラリが投げるエラーではなく、
    //私たち自身が投げるエラーを素早く特定できるようにするためのものです。
    this.isOperational = true;

    /*
    このAppErrorクラスの内部にさらにメソッドが追加される場合、
    Error.captureStackTrace(this, this.constructor); はスタックトレースに
    それらのメソッドの詳細を表示しないようにすることができます。
    これは、ユーザーにとって関係のない内部実装の詳細を隠すために使用できるので便利です。
    */
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;