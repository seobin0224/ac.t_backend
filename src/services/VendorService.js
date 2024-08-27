//입력한 업체명이 데이터베이스에 있는지 확인.
//-> 존재하면 자동완성 리스트에 보여주고, 존재하지 않으면 새로운 업체명 DB에 추가
const mongoose = require('mongoose'); // mongoose 모듈 가져오기
const Vendor = require('../models/Vendor');
const PostService = require('../services/PostService'); // 감정 분석 서비스를 가져옵니다.
const SearchHistory = require('../models/SearchHistory'); // 검색 기록 모델 (필요시 생성)

//검색 기능 추가
class VendorService {
  // 업체명 검색 (부분 일치)
  async searchVendors(query) {
    try {
      console.log('searchVendors called with:', { query });

      const vendors = await Vendor.find({
        title: new RegExp(query, 'i'),
      }).exec();

      return vendors;
    } catch (error) {
      console.error('Error in searchVendors:', error);
      throw error;
    }
  }

  async addVendor(name) {
    try {
      // 로그 추가: 입력 값 확인
      console.log('addVendor called with name:', name);

      const existingVendor = await Vendor.findOne({ title: name }).exec();

      if (existingVendor) {
        console.log('Vendor already exists:', existingVendor);
        return existingVendor;
      }

      const vendor = new Vendor({ title: name });
      const savedVendor = await vendor.save();

      console.log('New vendor added:', savedVendor);
      return savedVendor;
    } catch (error) {
      console.error('Error in addVendor:', error);
      throw error;
    }
  }
  // 시군별 숙박시설 검색 + 숙박 유형 필터링
  async getAccommodationsByRegion(region, category = null) {
    const query = {
      sigunguname: region, // 시군구 필드로 필터링
      contenttype: '숙박', // 숙박시설로 한정
    };
    if (category) {
      query['category3'] = category; // 특정 숙박 유형으로 필터링 (모텔, 펜션 등)
    }

    return await Vendor.find(query)
      .select('title addr1 firstimage description tel category3')
      .exec();
  }
  // 키워드를 통해 장소 검색
  async searchActivitiesByKeyword(keyword) {
    return await Vendor.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { addr1: { $regex: keyword, $options: 'i' } },
        { sigunguname: { $regex: keyword, $options: 'i' } },
        { contentype: { $regex: keyword, $options: 'i' } },
        { category1: { $regex: keyword, $options: 'i' } },
        { category2: { $regex: keyword, $options: 'i' } },
        { category3: { $regex: keyword, $options: 'i' } },
      ],
    }).exec();
  }
  // 특정 장소에 대한 감정 분석 결과를 가져옴
  async getVendorDetailsAndSentiments(vendorId) {
    const vendor = await Vendor.findById(vendorId).exec();
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    // PostService를 이용하여 감정 분석을 수행
    const sentimentAnalysis = await PostService.analyzeSentiments(vendor.title);
    return {
      vendor,
      sentimentAnalysis,
    };
  }
  //<액티비티 검색창> : 장소추천, 검색기록
  // 사용자 기반 추천 장소 제공
  async getRecommendedVendors(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }
  }
  // 사용자의 최근 검색 기록 가져오기
  async getSearchHistory(userId) {
    return await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();
  }
  // 검색 기록 저장
  async saveSearchHistory(userId, keyword, searchType) {
    try {
      console.log('saveSearchHistory called with:', {
        userId,
        keyword,
        searchType,
      });
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const history = new SearchHistory({
        user: userObjectId,
        keyword,
        searchType,
        createdAt: new Date(),
      });

      const savedHistory = await history.save();

      console.log('Search history saved:', savedHistory);

      return savedHistory;
    } catch (error) {
      console.error('Error in saveSearchHistory:', error);
      throw error;
    }
  }
}

module.exports = new VendorService();
