const multer = require('multer');

module.exports = function (app, supabaseAdmin)
{
  // Configure multer for in-memory storage (we'll upload to Supabase)
  const storage = multer.memoryStorage();

  // File filter - only allow images
  const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const fileExt = require('path').extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, gif, webp)'), false);
    }
  };

  // Configure multer
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Upload endpoint
  app.post('/api/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        console.error('Upload validation error:', err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = require('path').extname(req.file.originalname);
      const fileName = 'recipe-' + uniqueSuffix + fileExt;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('recipe-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: `Upload failed: ${error.message}` });
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('recipe-images')
        .getPublicUrl(fileName);

      const fileUrl = publicUrlData.publicUrl;

      res.status(201).json({
        url: fileUrl,
        filename: fileName,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  });
};
