const express = require('express');
const router = express.Router();
const MateController = require('../controllers/MateController');
const authorize = require('../middleware/authorize');

router.post('/mates', authorize, MateController.createMatePost);
router.get('/mates', authorize, MateController.getMatePosts); // GET 요청에서 쿼리 파라미터를 통해 필터링 가능

//특정 기준으로 필터링하는 라우트 추가
router.get(
  '/mates/filter/activity',
  authorize,
  MateController.filterMatePostsByActivity
);
router.get(
  '/mates/filter/location',
  authorize,
  MateController.filterMatePostsByLocation
);
router.get(
  '/mates/filter/preferences',
  MateController.filterMatePostsByPreferences
);

router.get('/mates/:id', authorize, MateController.getMatePostById);
router.put('/mates/:id/join', authorize, MateController.joinMatePost);
router.put('/mates/:id/leave', authorize, MateController.leaveMatePost);
router.delete('/mates/:id', authorize, MateController.deleteMatePost);
router.post('/mates/:id/join-chat', authorize, MateController.joinMateChatRoom); // 참여하여 채팅방으로 이동

module.exports = router;
