const router = require('express').Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getAllUsers,
  verifyUser,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserProfile);
router.put('/me', authMiddleware, updateUserProfile);
router.post('/logout', authMiddleware, logoutUser);
router.post('/verify', verifyUser); // Verify user account
router.get('/allUsers', getAllUsers);

module.exports = router;
