const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8999;


// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // limit file size to 25MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('upload'); // 'upload' is the name of the file input field

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

// Public folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('Welcome to the Image Upload API'));

app.post('/upload', (req, res) => {


  upload(req, res, (err) => {

    if (err) {
      res.status(400).json({ msg: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ msg: 'No file selected' });
      } else {
        res.json({
          uploaded: 'true',
          url: `https://api.rekat4indonesia.com/uploads/${req.file.filename}`
        });
      }
    }
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
