const router = require('express').Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getAllUsers,
  verifyUser,
  uploadAvatar,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserProfile);
router.put('/me', authMiddleware, updateUserProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.post('/logout', authMiddleware, logoutUser);
router.post('/verify', verifyUser); // Verify user account
router.get('/allUsers', getAllUsers);

module.exports = router;
