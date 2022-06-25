import 'regenerator-runtime/runtime';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// ここでやっているのは、まずこのコードで要素を作成し、それが実際に存在するかどうかをテストしてから、この行を実行することです。
// そうすることで、この要素を持つページでだけコードが実行される
// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const userImgEl = document.querySelector('.form__user-photo');
const userImgInputEl = document.querySelector('#photo');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // .valueでinputデータを取得
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', async (e) => {
    // pageのリロードを防ぐ
    e.preventDefault();
    document.querySelector('.btn--save-settings').textContent = 'Updating...';
    const form = new FormData();
    // .valueでinputデータを取得
    // account.pug内で#nameが埋め込まれているのが前提そうじゃないと要素を探し出せない
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    await updateSettings(form, 'data');

    document.querySelector('.btn--save-settings').textContent = 'Save settings';

    location.reload();
  });

const handleDisplayUserPhoto = (e) => {
  const imgFile = e.target.files?.[0];

  if (!imgFile?.type.startsWith('image/')) return;
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    userImgEl.setAttribute('src', reader.result);
  });

  reader.readAsDataURL(imgFile);
};
if (userImgInputEl)
  userImgInputEl.addEventListener('change', handleDisplayUserPhoto);

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    // pageのリロードを防ぐ
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    // .valueでinputデータを取得
    // account.pug内で#nameが埋め込まれているのが前提そうじゃないと要素を探し出せない
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...'
    // Event.targetはクリックされた要素であり、このイベントリスナーをトリガーしたものです。
    // そこにあるdata-tour-idにdatasetでアクセスし、tourIdを取得
    // しかし、今は変数名とと全く同じなので、その上で構造化を使うことができるのです。
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
