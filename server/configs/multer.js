import multer from 'multer';
import path from 'path';

// Configuração de storage
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtro para aceitar imagens e vídeos
const fileFilter = (req, file, callback) => {
  // Tipos de imagem permitidos
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Tipos de vídeo permitidos
  const videoTypes = /mp4|webm|mov|avi|mkv|m4v/;
  
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;
  
  // Verificar se é imagem
  if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
    return callback(null, true);
  }
  
  // Verificar se é vídeo
  if (videoTypes.test(extname) && mimetype.startsWith('video/')) {
    return callback(null, true);
  }
  
  callback(new Error('Apenas imagens (JPEG, PNG, GIF, WebP) e vídeos (MP4, WebM, MOV) são permitidos.'));
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB (para vídeos)
  }
});

export default upload;