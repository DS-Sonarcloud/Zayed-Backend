var ControlMediaItemView = elementor.modules.controls.Media.extend({
  openFrame: function() {
    if (!this.frame) {
      this.initFrame();
    }
  },
  initFrame: function() {
    var fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.onchange = this.select.bind(this);
    fileSelector.click();
  },
  select: function(e) {
    this.trigger('before:select');
    var formData = new FormData();
    Object.keys(e.target.files).forEach(fileIndex=>{
      formData.append('file-' + fileIndex, e.target.files[fileIndex]);
    }
    );
    fetch(base_url + '/elementor/upload', {
      method: 'POST',
      enctype: 'multipart/form-data',
      body: formData,
    }).then(res=>res.json()).then(data=>{
      this.setValue(data[0]);
      this.applySavedValue();
      this.trigger('after:select');
    }
    ).catch(error=>console.log(error));
  },
  deleteImage: function(event) {
    event.stopPropagation();
    fetch(base_url + '/elementor/delete_upload/' + this.getControlValue().id, {
      method: 'DELETE',
    }).then(res=>res.json()).then(data=>{
      this.setValue({
        url: '',
        id: ''
      });
      this.applySavedValue();
    }
    ).catch(error=>console.log(error));
  },
  onBeforeDestroy: function() {
    this.$el.remove();
  }
});
elementor.modules.controls.Media = ControlMediaItemView;
var ControlMediaItemViewGallery = elementor.modules.controls.Gallery.extend({
  applySavedValue: function() {
    var images = this.getControlValue() || [],
        imagesCount = images.length,
        hasImages = !!imagesCount;
    this.$el
      .toggleClass('elementor-gallery-has-images', hasImages)
      .toggleClass('elementor-gallery-empty', !hasImages);
    var $galleryThumbnails = this.ui.galleryThumbnails;
    $galleryThumbnails.empty();
    this.ui.status.text(
      elementor.translate(
        hasImages ? 'gallery_images_selected' : 'gallery_no_images_selected',
        [imagesCount]
      )
    );
    if (!hasImages) return;
    images.forEach(function(image) {
      var $thumbnail = jQuery('<div>', {
        'class': 'elementor-control-gallery-thumbnail',
        'data-id': image.id
      });
      $thumbnail.css('background-image', 'url(' + image.url + ')');
      $galleryThumbnails.append($thumbnail);
    });
  },
  openFrame: function(action) {
    this.initFrame(action);
  },
  initFrame: function(action) {
    var fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('multiple', 'multiple');
    fileSelector.onchange = this.select.bind(this);
    fileSelector.click();
  },
  select: function(e) {
    var formData = new FormData();
    Object.keys(e.target.files).forEach(fileIndex => {
      formData.append('file-' + fileIndex, e.target.files[fileIndex]);
    });
    fetch('/elementor/upload', {
      method: 'POST',
      enctype: 'multipart/form-data',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      var existing = this.getControlValue() || [];
      var merged = existing.concat(data); 
      this.setValue(merged);
      this.applySavedValue();
    })
    .catch(error => console.log(error));
  },
  onBeforeDestroy: function() {
    this.$el.remove();
  },
  resetGallery: function() {
    Promise.all(
      (this.getControlValue() || []).map(function(image) {
        return fetch('/elementor/delete_upload/' + image.id, {
          method: 'DELETE',
        }).catch(error => console.log(error));
      })
    ).then(() => {
      this.setValue('');
      this.applySavedValue();
    });
  },
  initRemoveDialog: function() {
    var removeDialog;
    this.getRemoveDialog = function() {
      if (!removeDialog) {
        removeDialog = elementor.dialogsManager.createWidget('confirm', {
          message: elementor.translate('dialog_confirm_gallery_delete'),
          headerMessage: elementor.translate('delete_gallery'),
          strings: {
            confirm: elementor.translate('delete'),
            cancel: elementor.translate('cancel')
          },
          defaultOption: 'confirm',
          onConfirm: this.resetGallery.bind(this)
        });
      }
      return removeDialog;
    };
  },
  onAddImagesClick: function() {
    this.openFrame(this.hasImages() ? 'add' : 'create');
  },
  onClearGalleryClick: function() {
    this.getRemoveDialog().show();
  },
  onGalleryThumbnailsClick: function(e) {
    var $target = jQuery(e.target);
    if ($target.hasClass('elementor-control-gallery-thumbnail-remove')) {
      var id = $target.closest('.elementor-control-gallery-thumbnail').data('id');
      this.removeImageById(id);
    } else {
      this.openFrame('edit');
    }
  },
  removeImageById: function(id) {
    var images = this.getControlValue() || [];
    var filtered = images.filter(img => img.id !== id);
    fetch('/elementor/delete_upload/' + id, {
      method: 'DELETE',
    }).catch(error => console.log(error));
    this.setValue(filtered);
    this.applySavedValue();
  }
});
elementor.modules.controls.Gallery = ControlMediaItemViewGallery;
