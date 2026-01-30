const validUsers = [
  { email: "sarvjeet.s23@iiits.in", password: "123456@@", isPremium: true },
  { email: "sauravkumar.r23@iiits.in", password: "123456@@", isPremium: false },
  { email: "kartik.r23@iiits.in", password: "123456@@", isPremium: true },
  { email: "anuj.r23@iiits.in", password: "123456@@", isPremium: true },
  { email: "likhita.b23@iiits.in", password: "123456@@", isPremium: true },
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = validUsers.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    req.session.user = user;
    
    res.json({ 
      success: true, 
      message: "Login successful",
      user: {
        email: user.email,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true, message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  login,
  logout,
  getCurrentUser
};

