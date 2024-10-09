const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://localhost:27017/rentalPortal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  interestedRenters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Property = mongoose.model('Property', propertySchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNumber: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ['Owner', 'Renter'],
    required: true,
  },
  profilePicture: { type: String },
  interestedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
});

const User = mongoose.model('User', userSchema);

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post('/register', async (req, res) => {
  const { name, contactNumber, city, email, password, userType } = req.body;
  if (!['Owner', 'Renter'].includes(userType)) {
    return res.status(400).json({ message: 'Invalid user type.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      contactNumber,
      city,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'An error occurred while registering.', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.status(200).json({ token, userType: user.userType });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/owners', async (req, res) => {
  try {
    const owners = await User.find({ userType: "Owner" });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch owners' });
  }
});

app.get('/cities', async (req, res) => {
  try {
    const cities = await Property.distinct('location');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cities' });
  }
});

app.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/profile/picture', authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profilePicture = req.file.path;
    await user.save();
    res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/properties', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, location } = req.body;
    if (!title || !description || !price || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const imagePaths = req.files.map(file => file.path);
    const newProperty = new Property({
      title,
      description,
      price,
      location,
      images: imagePaths,
      ownerId: req.user.id,
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }      
});

app.get('/properties', authenticate, async (req, res) => {
  try {
    const query = req.user.userType === "Owner" ? { ownerId: req.user.id } : {};
    const properties = await Property.find(query)
      .populate('ownerId')
      .populate('interestedRenters', 'name contactNumber email');
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/interested', authenticate, async (req, res) => {
  try {
    const renter = await User.findById(req.user.id).populate('interestedProperties');
    if (!renter) {
      return res.status(404).json({ message: 'Renter not found' });
    }
    res.json(renter.interestedProperties);
  } catch (error) {
    console.error('Error fetching interested properties:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/properties/:propertyId/interested', authenticate, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId).populate('interestedRenters', 'name contactNumber email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property.interestedRenters);
  } catch (error) {
    console.error('Error fetching interested renters:', error);
    res.status(500).json({ message: 'Failed to fetch interested renters' });
  }
});

app.post('/request', authenticate, async (req, res) => {
  const { roomId, renterId } = req.body;
  try {
    const property = await Property.findById(roomId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (!property.interestedRenters.includes(renterId)) {
      property.interestedRenters.push(renterId);
      await property.save();
    } else {
      return res.status(400).json({ message: 'Renter already expressed interest' });
    }
    const renter = await User.findById(renterId);
    if (!renter) {
      return res.status(404).json({ message: 'Renter not found' });
    }
    if (!renter.interestedProperties.includes(roomId)) {
      renter.interestedProperties.push(roomId);
      await renter.save();
    }
    res.json({ message: 'Interest request sent successfully' });
  } catch (error) {
    console.error('Error sending interest request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
