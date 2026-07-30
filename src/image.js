function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that image'));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That image could not be opened'));
    image.src = source;
  });
}

export async function compressRecipeImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose a photo from your device');
  if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB');
  const source = await readFile(file);
  const image = await loadImage(source);
  const maxEdge = 800;
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff8e8';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const result = canvas.toDataURL('image/jpeg', 0.72);
  if (result.length > 700_000) throw new Error('This photo is still too large. Try a smaller crop.');
  return result;
}
