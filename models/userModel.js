const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    //userModel.jsから'admin'オプションを削除する必要がある
    //Compassから手動でadminオプションを渡すしかありません。
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    // select: falseにすることでデータベースを読み込んだ際に表示されない
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on create and save!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// データを取得するときと、データを保存する時がデータを操作する時に最適な瞬間
userSchema.pre('save', async function (next) {
  // thisはcurrent user
  // Only run this function if password was acturlly modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // passwordChangedAt がJWTTimestampより前になることでユーザーはログインできる
  // passwordChangedAt がJWTTimestampより後になる、つまりJWTTimestamp < changedTimestampが
  // trueになるとprotectされる。だから、1秒遅らせてる
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//findだけでなく、findandupdate、findanddeleteなど、あらゆるクエリに対応しています。
// /^find/は、findで始まるもの
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // もし、passwordChangedAt propertyがあるとき
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // 100 < 200 これがtrueならtokenが発行されてからパスワードが変更されたということ
    return JWTTimestamp < changedTimestamp;
  }
  //このタイムスタンプ(JWTTimestamp)以降、ユーザーはパスワードを変更していない。
  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // reset tokenをそのままdatabaseに保存しているとハッカーに悪用される恐れがある
  // encryptしてセキュリティを向上させる
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10分

  return resetToken;
};

// モデルを作るときは、変数名を大文字にする
const User = mongoose.model('User', userSchema);

module.exports = User;
