const mongoose = require('mongoose');

// 사용자 자격증 스키마
const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  institution: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

// 사용자 배지 스키마
const userBadgeSchema = new mongoose.Schema({
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  awarded_at: {
    type: Date,
    default: Date.now,
  },
});

// 사용자 활동 기록 스키마
const activityMapSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  activity_date: {
    type: Date,
    required: true,
  },
  hashtags: [{ type: String }],
});

// 마커에 할당한 카테고리 정보 저장
const MarkerCategorySchema = new mongoose.Schema({
  color: {
    type: String,
    enum: ['red', 'yellow', 'green', 'blue', 'purple'],
    required: true,
  },
  categoryName: { type: String, required: true },
});

// 선호도 스키마
const preferenceSchema = new mongoose.Schema({
  location: {
    type: String,
    enum: ['outdoor', 'indoor', 'both'],
    required: true,
  },
  environment: {
    type: String,
    enum: ['sea', 'mountain', 'both'],
    required: true,
  },
  group: {
    type: String,
    enum: ['group', 'individual', 'both'],
    required: true,
  },
  season: {
    type: String,
    enum: ['winter', 'summer', 'both'],
    required: true,
  },
});

// 사용자 스키마
const userSchema = new mongoose.Schema({
  kakaoId: {
    type: String,
    sparse: true, // 이메일 회원가입 사용자를 위해 null 허용
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // 카카오 회원가입 사용자를 위해 null 허용
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  name: {
    type: String,
    required: false,
  },

  nickname: {
    type: String,
    required: false,
  },

  bio: {
    type: String,
    maxlength: 255,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  age: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  isMentor: {
    type: Boolean,
    default: false,
  },

  refreshToken: {
    type: String, // refreshToken을 저장할 필드 추가
  },

  isDeveloper: {
    type: Boolean,
    default: false,
  },

  // activities 필드 추가
  activities: [
    {
      name: { type: String, required: true }, // 활동명
      date: { type: Date, default: Date.now }, // 활동 날짜
      location: { type: String }, // 활동 장소 (선택사항)
    },
  ],

  preference: preferenceSchema, // 선호도 필드 추가
  certificates: [certificateSchema], // 자격증 필드 추가
  badges: [userBadgeSchema], // 사용자 배지 필드 추가
  activities: [activityMapSchema], // 활동 기록 필드 추가
  markerCategories: [MarkerCategorySchema], // 사용자 마커 카테고리 설정
});

userSchema.pre('save', function (next) {
  if (!this.kakaoId) {
    this.kakaoId = undefined; // kakaoId가 없는 경우 해당 필드를 아예 undefined로 설정합니다.
  }
  next();
});

//멘토 자격 부여 로직
userSchema.methods.checkMentorEligibility = function () {
  if (this.certificates && this.certificates.length > 0) {
    this.isMentor = true;
  } else {
    this.isMentor = false;
  }
};

userSchema.pre('save', function (next) {
  this.checkMentorEligibility();
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
