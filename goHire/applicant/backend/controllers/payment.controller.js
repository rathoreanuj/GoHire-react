const User = require('../models/user');
const PremiumUser = require('../models/premium_user');

const getPaymentPage = async (req, res) => {
  try {
    res.json({ message: 'Payment page data' });
  } catch (error) {
    console.error('Payment page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const processPayment = async (req, res) => {
  try {
    const {
      paymentMethod,
      amount,
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
      bankName,
      bankUserId,
      upiId,
      upiApp,
      upiName
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Please login to Buy the Premium.' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create premium user
    const premiumUser = new PremiumUser({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      password: user.password,
      resumeId: user.resumeId
    });

    await premiumUser.save();

    // Determine subscription plan based on amount
    let subscriptionPlan = 'Monthly Premium Plan';
    if (amount === '2999') {
      subscriptionPlan = 'Annual Premium Plan';
    }

    res.json({
      success: true,
      transactionId,
      amount,
      subscriptionPlan,
      paymentDetails: {
        method: paymentMethod,
        amount,
        transactionId,
        cardNumber: cardNumber ? cardNumber.slice(-4) : undefined,
        cardholderName
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment failed. Please try again.' });
  }
};

const getReceipt = async (req, res) => {
  try {
    res.json({ message: 'Receipt data' });
  } catch (error) {
    console.error('Receipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSubscription = async (req, res) => {
  try {
    res.json({ message: 'Subscription page data' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTerms = async (req, res) => {
  try {
    res.json({ message: 'Terms of Service' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPrivacy = async (req, res) => {
  try {
    res.json({ message: 'Privacy Policy' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPaymentPage,
  processPayment,
  getReceipt,
  getSubscription,
  getTerms,
  getPrivacy
};

