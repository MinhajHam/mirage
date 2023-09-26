// Initialize FilePond
const inputElement = document.querySelector('.filepond');

FilePond.registerPlugin(
  FilePondPluginFileEncode,
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform
);

FilePond.setOptions({
  allowReorder: true,
  server: {
    process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
      // Handle image upload here
      // Use the load callback to notify FilePond about the successful upload
    }
  }
});

const pond = FilePond.create(inputElement);

// Existing image data (replace this with your actual data)
const existingImages = [
  { serverId: 'image1', source: '/path/to/image1.jpg' },
  { serverId: 'image2', source: '/path/to/image2.jpg' },
  // Add more existing image objects
];

// Load existing images into FilePond
existingImages.forEach(image => {
  pond.addFile(image.source, { options: { serverId: image.serverId } });
});
