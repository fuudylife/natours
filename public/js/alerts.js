export const hideAlert = () => {
  const el = document.querySelector('.alert');
  // 1レベル上の親要素に移動して、そこから子要素を削除する
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
export const showAlert = (type, msg) => {
  // アラートを表示するときはいつでも、すでに存在するすべてのアラートを非表示にする。そのため、常にhideAlertを実行する
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  // これが何を意味するかというと、bodyの中ですが、まさに冒頭の部分です。
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  // 5秒後にアラートを非表示
  window.setTimeout(hideAlert, 5000);
};
