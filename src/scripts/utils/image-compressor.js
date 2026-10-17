export async function compressImageToBlob(fileOrBlob, { maxSizeMB = 1.0, maxWidthOrHeight = 1280 } = {}) {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (fileOrBlob.size <= maxBytes && fileOrBlob.type === 'image/jpeg') {
    return fileOrBlob;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > height && width > maxWidthOrHeight) {
        height = Math.round((height * maxWidthOrHeight) / width);
        width = maxWidthOrHeight;
      } else if (height > maxWidthOrHeight) {
        width = Math.round((width * maxWidthOrHeight) / height);
        height = maxWidthOrHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;

      const attemptCompression = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal memproses gambar pada canvas.'));
              return;
            }

            if (blob.size <= maxBytes || quality <= 0.4) {
              resolve(blob);
            } else {
              quality -= 0.15;
              attemptCompression();
            }
          },
          'image/jpeg',
          quality
        );
      };

      attemptCompression();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal membaca berkas gambar. Pastikan format berkas valid.'));
    };

    img.src = url;
  });
}
