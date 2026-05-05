 (() => { 
 	"use strict";
var __webpack_exports__ = {};
;
const external_wp_richText_namespaceObject = window["wp"]["richText"];
;
const external_wp_i18n_namespaceObject = window["wp"]["i18n"];
;
const external_wp_blockEditor_namespaceObject = window["wp"]["blockEditor"];
;
const external_wp_primitives_namespaceObject = window["wp"]["primitives"];
;
const external_ReactJSXRuntime_namespaceObject = window["ReactJSXRuntime"];
;
const formatBold = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M14.7 11.3c1-.6 1.5-1.6 1.5-3 0-2.3-1.3-3.4-4-3.4H7v14h5.8c1.4 0 2.5-.3 3.3-1 .8-.7 1.2-1.7 1.2-2.9.1-1.9-.8-3.1-2.6-3.7zm-5.1-4h2.3c.6 0 1.1.1 1.4.4.3.3.5.7.5 1.2s-.2 1-.5 1.2c-.3.3-.8.4-1.4.4H9.6V7.3zm4.6 9c-.4.3-1 .4-1.7.4H9.6v-3.9h2.9c.7 0 1.3.2 1.7.5.4.3.6.8.6 1.5s-.2 1.2-.6 1.5z"
  })
});
 const format_bold = (formatBold);
;
const bold_name = 'core/bold';
const title = (0,external_wp_i18n_namespaceObject.__)('Bold');
const bold = {
  name: bold_name,
  title,
  tagName: 'strong',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: bold_name,
        title
      }));
    }
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: bold_name
      }));
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
        type: "primary",
        character: "b",
        onUse: onToggle
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
        name: "bold",
        icon: format_bold,
        title: title,
        onClick: onClick,
        isActive: isActive,
        shortcutType: "primary",
        shortcutCharacter: "b"
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent, {
        inputType: "formatBold",
        onInput: onToggle
      })]
    });
  }
};
;
const code = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z"
  })
});
 const library_code = (code);
;
const code_name = 'core/code';
const code_title = (0,external_wp_i18n_namespaceObject.__)('Inline code');
const code_code = {
  name: code_name,
  title: code_title,
  tagName: 'code',
  className: null,
  __unstableInputRule(value) {
    const BACKTICK = '`';
    const {
      start,
      text
    } = value;
    const characterBefore = text[start - 1];
    if (characterBefore !== BACKTICK) {
      return value;
    }
    if (start - 2 < 0) {
      return value;
    }
    const indexBefore = text.lastIndexOf(BACKTICK, start - 2);
    if (indexBefore === -1) {
      return value;
    }
    const startIndex = indexBefore;
    const endIndex = start - 2;
    if (startIndex === endIndex) {
      return value;
    }
    value = (0,external_wp_richText_namespaceObject.remove)(value, startIndex, startIndex + 1);
    value = (0,external_wp_richText_namespaceObject.remove)(value, endIndex, endIndex + 1);
    value = (0,external_wp_richText_namespaceObject.applyFormat)(value, {
      type: code_name
    }, startIndex, endIndex);
    return value;
  },
  edit({
    value,
    onChange,
    onFocus,
    isActive
  }) {
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: code_name,
        title: code_title
      }));
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
        type: "access",
        character: "x",
        onUse: onClick
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
        icon: library_code,
        title: code_title,
        onClick: onClick,
        isActive: isActive,
        role: "menuitemcheckbox"
      })]
    });
  }
};
;
const external_wp_components_namespaceObject = window["wp"]["components"];
;
const external_wp_element_namespaceObject = window["wp"]["element"];
;
const ALLOWED_MEDIA_TYPES = ['image'];
const image_name = 'core/image';
const image_title = (0,external_wp_i18n_namespaceObject.__)('Inline image');
const image_image = {
  name: image_name,
  title: image_title,
  keywords: [(0,external_wp_i18n_namespaceObject.__)('photo'), (0,external_wp_i18n_namespaceObject.__)('media')],
  object: true,
  tagName: 'img',
  className: null,
  attributes: {
    className: 'class',
    style: 'style',
    url: 'src',
    alt: 'alt'
  },
  edit: Edit
};
function InlineUI({
  value,
  onChange,
  activeObjectAttributes,
  contentRef
}) {
  const {
    style,
    alt
  } = activeObjectAttributes;
  const width = style?.replace(/\D/g, '');
  const [editedWidth, setEditedWidth] = (0,external_wp_element_namespaceObject.useState)(width);
  const [editedAlt, setEditedAlt] = (0,external_wp_element_namespaceObject.useState)(alt);
  const hasChanged = editedWidth !== width || editedAlt !== alt;
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: image_image
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Popover, {
    placement: "bottom",
    focusOnMount: false,
    anchor: popoverAnchor,
    className: "block-editor-format-toolbar__image-popover",
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)("form", {
      className: "block-editor-format-toolbar__image-container-content",
      onSubmit: event => {
        const newReplacements = value.replacements.slice();
        newReplacements[value.start] = {
          type: image_name,
          attributes: {
            ...activeObjectAttributes,
            style: width ? `width: ${editedWidth}px;` : '',
            alt: editedAlt
          }
        };
        onChange({
          ...value,
          replacements: newReplacements
        });
        event.preventDefault();
      },
      children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
        spacing: 4,
        children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalNumberControl, {
          __next40pxDefaultSize: true,
          label: (0,external_wp_i18n_namespaceObject.__)('Width'),
          value: editedWidth,
          min: 1,
          onChange: newWidth => {
            setEditedWidth(newWidth);
          }
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextareaControl, {
          label: (0,external_wp_i18n_namespaceObject.__)('Alternative text'),
          __nextHasNoMarginBottom: true,
          value: editedAlt,
          onChange: newAlt => {
            setEditedAlt(newAlt);
          },
          help: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
            children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.ExternalLink, {
              href:
              (0,external_wp_i18n_namespaceObject.__)('https://www.w3.org/WAI/tutorials/images/decision-tree/'),
              children: (0,external_wp_i18n_namespaceObject.__)('Describe the purpose of the image.')
            }), (0,external_ReactJSXRuntime_namespaceObject.jsx)("br", {}), (0,external_wp_i18n_namespaceObject.__)('Leave empty if decorative.')]
          })
        }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHStack, {
          justify: "right",
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
            disabled: !hasChanged,
            accessibleWhenDisabled: true,
            variant: "primary",
            type: "submit",
            size: "compact",
            children: (0,external_wp_i18n_namespaceObject.__)('Apply')
          })
        })]
      })
    })
  });
}
function Edit({
  value,
  onChange,
  onFocus,
  isObjectActive,
  activeObjectAttributes,
  contentRef
}) {
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_blockEditor_namespaceObject.MediaUploadCheck, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.MediaUpload, {
      allowedTypes: ALLOWED_MEDIA_TYPES,
      onSelect: ({
        id,
        url,
        alt,
        width: imgWidth
      }) => {
        onChange((0,external_wp_richText_namespaceObject.insertObject)(value, {
          type: image_name,
          attributes: {
            className: `wp-image-${id}`,
            style: `width: ${Math.min(imgWidth, 150)}px;`,
            url,
            alt
          }
        }));
        onFocus();
      },
      render: ({
        open
      }) => (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
        icon: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SVG, {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 24 24",
          children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Path, {
            d: "M4 18.5h16V17H4v1.5zM16 13v1.5h4V13h-4zM5.1 15h7.8c.6 0 1.1-.5 1.1-1.1V6.1c0-.6-.5-1.1-1.1-1.1H5.1C4.5 5 4 5.5 4 6.1v7.8c0 .6.5 1.1 1.1 1.1zm.4-8.5h7V10l-1-1c-.3-.3-.8-.3-1 0l-1.6 1.5-1.2-.7c-.3-.2-.6-.2-.9 0l-1.3 1V6.5zm0 6.1l1.8-1.3 1.3.8c.3.2.7.2.9-.1l1.5-1.4 1.5 1.4v1.5h-7v-.9z"
          })
        }),
        title: image_title,
        onClick: open,
        isActive: isObjectActive
      })
    }), isObjectActive && (0,external_ReactJSXRuntime_namespaceObject.jsx)(InlineUI, {
      value: value,
      onChange: onChange,
      activeObjectAttributes: activeObjectAttributes,
      contentRef: contentRef
    })]
  });
}
;
const formatItalic = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M12.5 5L10 19h1.9l2.5-14z"
  })
});
 const format_italic = (formatItalic);
;
const italic_name = 'core/italic';
const italic_title = (0,external_wp_i18n_namespaceObject.__)('Italic');
const italic = {
  name: italic_name,
  title: italic_title,
  tagName: 'em',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: italic_name,
        title: italic_title
      }));
    }
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: italic_name
      }));
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
        type: "primary",
        character: "i",
        onUse: onToggle
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
        name: "italic",
        icon: format_italic,
        title: italic_title,
        onClick: onClick,
        isActive: isActive,
        shortcutType: "primary",
        shortcutCharacter: "i"
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent, {
        inputType: "formatItalic",
        onInput: onToggle
      })]
    });
  }
};
;
const external_wp_url_namespaceObject = window["wp"]["url"];
;
const external_wp_htmlEntities_namespaceObject = window["wp"]["htmlEntities"];
;
const link_link = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M10 17.389H8.444A5.194 5.194 0 1 1 8.444 7H10v1.5H8.444a3.694 3.694 0 0 0 0 7.389H10v1.5ZM14 7h1.556a5.194 5.194 0 0 1 0 10.39H14v-1.5h1.556a3.694 3.694 0 0 0 0-7.39H14V7Zm-4.5 6h5v-1.5h-5V13Z"
  })
});
 const library_link = (link_link);
;
const external_wp_a11y_namespaceObject = window["wp"]["a11y"];
;
const external_wp_data_namespaceObject = window["wp"]["data"];
;
function isValidHref(href) {
  if (!href) {
    return false;
  }
  const trimmedHref = href.trim();
  if (!trimmedHref) {
    return false;
  }
  if (/^\S+:/.test(trimmedHref)) {
    const protocol = (0,external_wp_url_namespaceObject.getProtocol)(trimmedHref);
    if (!(0,external_wp_url_namespaceObject.isValidProtocol)(protocol)) {
      return false;
    }
    if (protocol.startsWith('http') && !/^https?:\/\/[^\/\s]/i.test(trimmedHref)) {
      return false;
    }
    const authority = (0,external_wp_url_namespaceObject.getAuthority)(trimmedHref);
    if (!(0,external_wp_url_namespaceObject.isValidAuthority)(authority)) {
      return false;
    }
    const path = (0,external_wp_url_namespaceObject.getPath)(trimmedHref);
    if (path && !(0,external_wp_url_namespaceObject.isValidPath)(path)) {
      return false;
    }
    const queryString = (0,external_wp_url_namespaceObject.getQueryString)(trimmedHref);
    if (queryString && !(0,external_wp_url_namespaceObject.isValidQueryString)(queryString)) {
      return false;
    }
    const fragment = (0,external_wp_url_namespaceObject.getFragment)(trimmedHref);
    if (fragment && !(0,external_wp_url_namespaceObject.isValidFragment)(fragment)) {
      return false;
    }
  }
  if (trimmedHref.startsWith('#') && !(0,external_wp_url_namespaceObject.isValidFragment)(trimmedHref)) {
    return false;
  }
  return true;
}
function createLinkFormat({
  url,
  type,
  id,
  opensInNewWindow,
  nofollow
}) {
  const format = {
    type: 'core/link',
    attributes: {
      url
    }
  };
  if (type) {
    format.attributes.type = type;
  }
  if (id) {
    format.attributes.id = id;
  }
  if (opensInNewWindow) {
    format.attributes.target = '_blank';
    format.attributes.rel = format.attributes.rel ? format.attributes.rel + ' noreferrer noopener' : 'noreferrer noopener';
  }
  if (nofollow) {
    format.attributes.rel = format.attributes.rel ? format.attributes.rel + ' nofollow' : 'nofollow';
  }
  return format;
}
function getFormatBoundary(value, format, startIndex = value.start, endIndex = value.end) {
  const EMPTY_BOUNDARIES = {
    start: null,
    end: null
  };
  const {
    formats
  } = value;
  let targetFormat;
  let initialIndex;
  if (!formats?.length) {
    return EMPTY_BOUNDARIES;
  }
  const newFormats = formats.slice();
  const formatAtStart = newFormats[startIndex]?.find(({
    type
  }) => type === format.type);
  const formatAtEnd = newFormats[endIndex]?.find(({
    type
  }) => type === format.type);
  const formatAtEndMinusOne = newFormats[endIndex - 1]?.find(({
    type
  }) => type === format.type);
  if (!!formatAtStart) {
    targetFormat = formatAtStart;
    initialIndex = startIndex;
  } else if (!!formatAtEnd) {
    targetFormat = formatAtEnd;
    initialIndex = endIndex;
  } else if (!!formatAtEndMinusOne) {
    targetFormat = formatAtEndMinusOne;
    initialIndex = endIndex - 1;
  } else {
    return EMPTY_BOUNDARIES;
  }
  const index = newFormats[initialIndex].indexOf(targetFormat);
  const walkingArgs = [newFormats, initialIndex, targetFormat, index];
  startIndex = walkToStart(...walkingArgs);
  endIndex = walkToEnd(...walkingArgs);
  startIndex = startIndex < 0 ? 0 : startIndex;
  return {
    start: startIndex,
    end: endIndex
  };
}
function walkToBoundary(formats, initialIndex, targetFormatRef, formatIndex, direction) {
  let index = initialIndex;
  const directions = {
    forwards: 1,
    backwards: -1
  };
  const directionIncrement = directions[direction] || 1; 
  const inverseDirectionIncrement = directionIncrement * -1;
  while (formats[index] && formats[index][formatIndex] === targetFormatRef) {
    index = index + directionIncrement;
  }
  index = index + inverseDirectionIncrement;
  return index;
}
const partialRight = (fn, ...partialArgs) => (...args) => fn(...args, ...partialArgs);
const walkToStart = partialRight(walkToBoundary, 'backwards');
const walkToEnd = partialRight(walkToBoundary, 'forwards');
;
const LINK_SETTINGS = [...external_wp_blockEditor_namespaceObject.LinkControl.DEFAULT_LINK_SETTINGS, {
  id: 'nofollow',
  title: (0,external_wp_i18n_namespaceObject.__)('Mark as nofollow')
}];
function InlineLinkUI({
  isActive,
  activeAttributes,
  value,
  onChange,
  onFocusOutside,
  stopAddingLink,
  contentRef,
  focusOnMount
}) {
  const richLinkTextValue = getRichTextValueFromSelection(value, isActive);
  const richTextText = richLinkTextValue.text;
  const {
    selectionChange
  } = (0,external_wp_data_namespaceObject.useDispatch)(external_wp_blockEditor_namespaceObject.store);
  const {
    createPageEntity,
    userCanCreatePages,
    selectionStart
  } = (0,external_wp_data_namespaceObject.useSelect)(select => {
    const {
      getSettings,
      getSelectionStart
    } = select(external_wp_blockEditor_namespaceObject.store);
    const _settings = getSettings();
    return {
      createPageEntity: _settings.__experimentalCreatePageEntity,
      userCanCreatePages: _settings.__experimentalUserCanCreatePages,
      selectionStart: getSelectionStart()
    };
  }, []);
  const linkValue = (0,external_wp_element_namespaceObject.useMemo)(() => ({
    url: activeAttributes.url,
    type: activeAttributes.type,
    id: activeAttributes.id,
    opensInNewTab: activeAttributes.target === '_blank',
    nofollow: activeAttributes.rel?.includes('nofollow'),
    title: richTextText
  }), [activeAttributes.id, activeAttributes.rel, activeAttributes.target, activeAttributes.type, activeAttributes.url, richTextText]);
  function removeLink() {
    const newValue = (0,external_wp_richText_namespaceObject.removeFormat)(value, 'core/link');
    onChange(newValue);
    stopAddingLink();
    (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link removed.'), 'assertive');
  }
  function onChangeLink(nextValue) {
    const hasLink = linkValue?.url;
    const isNewLink = !hasLink;
    nextValue = {
      ...linkValue,
      ...nextValue
    };
    const newUrl = (0,external_wp_url_namespaceObject.prependHTTP)(nextValue.url);
    const linkFormat = createLinkFormat({
      url: newUrl,
      type: nextValue.type,
      id: nextValue.id !== undefined && nextValue.id !== null ? String(nextValue.id) : undefined,
      opensInNewWindow: nextValue.opensInNewTab,
      nofollow: nextValue.nofollow
    });
    const newText = nextValue.title || newUrl;
    let newValue;
    if ((0,external_wp_richText_namespaceObject.isCollapsed)(value) && !isActive) {
      const inserted = (0,external_wp_richText_namespaceObject.insert)(value, newText);
      newValue = (0,external_wp_richText_namespaceObject.applyFormat)(inserted, linkFormat, value.start, value.start + newText.length);
      onChange(newValue);
      stopAddingLink();
      selectionChange({
        clientId: selectionStart.clientId,
        identifier: selectionStart.attributeKey,
        start: value.start + newText.length + 1
      });
      return;
    } else if (newText === richTextText) {
      newValue = (0,external_wp_richText_namespaceObject.applyFormat)(value, linkFormat);
    } else {
      newValue = (0,external_wp_richText_namespaceObject.create)({
        text: newText
      });
      newValue = (0,external_wp_richText_namespaceObject.applyFormat)(newValue, linkFormat, 0, newText.length);
      const boundary = getFormatBoundary(value, {
        type: 'core/link'
      });
      const [valBefore, valAfter] = (0,external_wp_richText_namespaceObject.split)(value, boundary.start, boundary.start);
      const newValAfter = (0,external_wp_richText_namespaceObject.replace)(valAfter, richTextText, newValue);
      newValue = (0,external_wp_richText_namespaceObject.concat)(valBefore, newValAfter);
    }
    onChange(newValue);
    if (!isNewLink) {
      stopAddingLink();
    }
    if (!isValidHref(newUrl)) {
      (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Warning: the link has been inserted but may have errors. Please test it.'), 'assertive');
    } else if (isActive) {
      (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link edited.'), 'assertive');
    } else {
      (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link inserted.'), 'assertive');
    }
  }
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: {
      ...build_module_link_link,
      isActive
    }
  });
  async function handleCreate(pageTitle) {
    const page = await createPageEntity({
      title: pageTitle,
      status: 'draft'
    });
    return {
      id: page.id,
      type: page.type,
      title: page.title.rendered,
      url: page.link,
      kind: 'post-type'
    };
  }
  function createButtonText(searchTerm) {
    return (0,external_wp_element_namespaceObject.createInterpolateElement)((0,external_wp_i18n_namespaceObject.sprintf)(
    (0,external_wp_i18n_namespaceObject.__)('Create page: <mark>%s</mark>'), searchTerm), {
      mark: (0,external_ReactJSXRuntime_namespaceObject.jsx)("mark", {})
    });
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Popover, {
    anchor: popoverAnchor,
    animate: false,
    onClose: stopAddingLink,
    onFocusOutside: onFocusOutside,
    placement: "bottom",
    offset: 8,
    shift: true,
    focusOnMount: focusOnMount,
    constrainTabbing: true,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.LinkControl, {
      value: linkValue,
      onChange: onChangeLink,
      onRemove: removeLink,
      hasRichPreviews: true,
      createSuggestion: createPageEntity && handleCreate,
      withCreateSuggestion: userCanCreatePages,
      createSuggestionButtonText: createButtonText,
      hasTextControl: true,
      settings: LINK_SETTINGS,
      showInitialSuggestions: true,
      suggestionsQuery: {
        initialSuggestionsSearchOptions: {
          type: 'post',
          subtype: 'page',
          perPage: 20
        }
      }
    })
  });
}
function getRichTextValueFromSelection(value, isActive) {
  let textStart = value.start;
  let textEnd = value.end;
  if (isActive) {
    const boundary = getFormatBoundary(value, {
      type: 'core/link'
    });
    textStart = boundary.start;
    textEnd = boundary.end + 1;
  }
  return (0,external_wp_richText_namespaceObject.slice)(value, textStart, textEnd);
}
 const inline = (InlineLinkUI);
;
const link_name = 'core/link';
const link_title = (0,external_wp_i18n_namespaceObject.__)('Link');
function link_Edit({
  isActive,
  activeAttributes,
  value,
  onChange,
  onFocus,
  contentRef
}) {
  const [addingLink, setAddingLink] = (0,external_wp_element_namespaceObject.useState)(false);
  const [openedBy, setOpenedBy] = (0,external_wp_element_namespaceObject.useState)(null);
  (0,external_wp_element_namespaceObject.useEffect)(() => {
    if (!isActive) {
      setAddingLink(false);
    }
  }, [isActive]);
  (0,external_wp_element_namespaceObject.useLayoutEffect)(() => {
    const editableContentElement = contentRef.current;
    if (!editableContentElement) {
      return;
    }
    function handleClick(event) {
      const link = event.target.closest('[contenteditable] a');
      if (!link ||
      !isActive) {
        return;
      }
      setAddingLink(true);
      setOpenedBy({
        el: link,
        action: 'click'
      });
    }
    editableContentElement.addEventListener('click', handleClick);
    return () => {
      editableContentElement.removeEventListener('click', handleClick);
    };
  }, [contentRef, isActive]);
  function addLink(target) {
    const text = (0,external_wp_richText_namespaceObject.getTextContent)((0,external_wp_richText_namespaceObject.slice)(value));
    if (!isActive && text && (0,external_wp_url_namespaceObject.isURL)(text) && isValidHref(text)) {
      onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
        type: link_name,
        attributes: {
          url: text
        }
      }));
    } else if (!isActive && text && (0,external_wp_url_namespaceObject.isEmail)(text)) {
      onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
        type: link_name,
        attributes: {
          url: `mailto:${text}`
        }
      }));
    } else if (!isActive && text && (0,external_wp_url_namespaceObject.isPhoneNumber)(text)) {
      onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
        type: link_name,
        attributes: {
          url: `tel:${text.replace(/\D/g, '')}`
        }
      }));
    } else {
      if (target) {
        setOpenedBy({
          el: target,
          action: null 
        });
      }
      setAddingLink(true);
    }
  }
  function stopAddingLink() {
    setAddingLink(false);
    if (openedBy?.el?.tagName === 'BUTTON') {
      openedBy.el.focus();
    } else {
      onFocus();
    }
    setOpenedBy(null);
  }
  function onFocusOutside() {
    setAddingLink(false);
    setOpenedBy(null);
  }
  function onRemoveFormat() {
    onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, link_name));
    (0,external_wp_a11y_namespaceObject.speak)((0,external_wp_i18n_namespaceObject.__)('Link removed.'), 'assertive');
  }
  const shouldAutoFocus = !(openedBy?.el?.tagName === 'A' && openedBy?.action === 'click');
  const hasSelection = !(0,external_wp_richText_namespaceObject.isCollapsed)(value);
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [hasSelection && (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "primary",
      character: "k",
      onUse: addLink
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "primaryShift",
      character: "k",
      onUse: onRemoveFormat
    }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      name: "link",
      icon: library_link,
      title: isActive ? (0,external_wp_i18n_namespaceObject.__)('Link') : link_title,
      onClick: event => {
        addLink(event.currentTarget);
      },
      isActive: isActive || addingLink,
      shortcutType: "primary",
      shortcutCharacter: "k",
      "aria-haspopup": "true",
      "aria-expanded": addingLink
    }), addingLink && (0,external_ReactJSXRuntime_namespaceObject.jsx)(inline, {
      stopAddingLink: stopAddingLink,
      onFocusOutside: onFocusOutside,
      isActive: isActive,
      activeAttributes: activeAttributes,
      value: value,
      onChange: onChange,
      contentRef: contentRef,
      focusOnMount: shouldAutoFocus ? 'firstElement' : false
    })]
  });
}
const build_module_link_link = {
  name: link_name,
  title: link_title,
  tagName: 'a',
  className: null,
  attributes: {
    url: 'href',
    type: 'data-type',
    id: 'data-id',
    _id: 'id',
    target: 'target',
    rel: 'rel'
  },
  __unstablePasteRule(value, {
    html,
    plainText
  }) {
    const pastedText = (html || plainText).replace(/<[^>]+>/g, '').trim();
    if (!(0,external_wp_url_namespaceObject.isURL)(pastedText) || !/^https?:/.test(pastedText)) {
      return value;
    }
    window.console.log('Created link:\n\n', pastedText);
    const format = {
      type: link_name,
      attributes: {
        url: (0,external_wp_htmlEntities_namespaceObject.decodeEntities)(pastedText)
      }
    };
    if ((0,external_wp_richText_namespaceObject.isCollapsed)(value)) {
      return (0,external_wp_richText_namespaceObject.insert)(value, (0,external_wp_richText_namespaceObject.applyFormat)((0,external_wp_richText_namespaceObject.create)({
        text: plainText
      }), format, 0, plainText.length));
    }
    return (0,external_wp_richText_namespaceObject.applyFormat)(value, format);
  },
  edit: link_Edit
};
;
const formatStrikethrough = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M9.1 9v-.5c0-.6.2-1.1.7-1.4.5-.3 1.2-.5 2-.5.7 0 1.4.1 2.1.3.7.2 1.4.5 2.1.9l.2-1.9c-.6-.3-1.2-.5-1.9-.7-.8-.1-1.6-.2-2.4-.2-1.5 0-2.7.3-3.6 1-.8.7-1.2 1.5-1.2 2.6V9h2zM20 12H4v1h8.3c.3.1.6.2.8.3.5.2.9.5 1.1.8.3.3.4.7.4 1.2 0 .7-.2 1.1-.8 1.5-.5.3-1.2.5-2.1.5-.8 0-1.6-.1-2.4-.3-.8-.2-1.5-.5-2.2-.8L7 18.1c.5.2 1.2.4 2 .6.8.2 1.6.3 2.4.3 1.7 0 3-.3 3.9-1 .9-.7 1.3-1.6 1.3-2.8 0-.9-.2-1.7-.7-2.2H20v-1z"
  })
});
 const format_strikethrough = (formatStrikethrough);
;
const strikethrough_name = 'core/strikethrough';
const strikethrough_title = (0,external_wp_i18n_namespaceObject.__)('Strikethrough');
const strikethrough = {
  name: strikethrough_name,
  title: strikethrough_title,
  tagName: 's',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: strikethrough_name,
        title: strikethrough_title
      }));
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
        type: "access",
        character: "d",
        onUse: onClick
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
        icon: format_strikethrough,
        title: strikethrough_title,
        onClick: onClick,
        isActive: isActive,
        role: "menuitemcheckbox"
      })]
    });
  }
};
;
const underline_name = 'core/underline';
const underline_title = (0,external_wp_i18n_namespaceObject.__)('Underline');
const underline = {
  name: underline_name,
  title: underline_title,
  tagName: 'span',
  className: null,
  attributes: {
    style: 'style'
  },
  edit({
    value,
    onChange
  }) {
    const onToggle = () => {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: underline_name,
        attributes: {
          style: 'text-decoration: underline;'
        },
        title: underline_title
      }));
    };
    return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
        type: "primary",
        character: "u",
        onUse: onToggle
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.__unstableRichTextInputEvent, {
        inputType: "formatUnderline",
        onInput: onToggle
      })]
    });
  }
};
;
function Icon({
  icon,
  size = 24,
  ...props
}, ref) {
  return (0,external_wp_element_namespaceObject.cloneElement)(icon, {
    width: size,
    height: size,
    ...props,
    ref
  });
}
 const icon = ((0,external_wp_element_namespaceObject.forwardRef)(Icon));
;
const textColor = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M12.9 6h-2l-4 11h1.9l1.1-3h4.2l1.1 3h1.9L12.9 6zm-2.5 6.5l1.5-4.9 1.7 4.9h-3.2z"
  })
});
 const text_color = (textColor);
;
const color = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17.2 10.9c-.5-1-1.2-2.1-2.1-3.2-.6-.9-1.3-1.7-2.1-2.6L12 4l-1 1.1c-.6.9-1.3 1.7-2 2.6-.8 1.2-1.5 2.3-2 3.2-.6 1.2-1 2.2-1 3 0 3.4 2.7 6.1 6.1 6.1s6.1-2.7 6.1-6.1c0-.8-.3-1.8-1-3zm-5.1 7.6c-2.5 0-4.6-2.1-4.6-4.6 0-.3.1-1 .8-2.3.5-.9 1.1-1.9 2-3.1.7-.9 1.3-1.7 1.8-2.3.7.8 1.3 1.6 1.8 2.3.8 1.1 1.5 2.2 2 3.1.7 1.3.8 2 .8 2.3 0 2.5-2.1 4.6-4.6 4.6z"
  })
});
 const library_color = (color);
;
const external_wp_privateApis_namespaceObject = window["wp"]["privateApis"];
;
const {
  lock,
  unlock
} = (0,external_wp_privateApis_namespaceObject.__dangerousOptInToUnstableAPIsOnlyForCoreModules)('I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.', '@wordpress/format-library');
;
const {
  Tabs
} = unlock(external_wp_components_namespaceObject.privateApis);
const TABS = [{
  name: 'color',
  title: (0,external_wp_i18n_namespaceObject.__)('Text')
}, {
  name: 'backgroundColor',
  title: (0,external_wp_i18n_namespaceObject.__)('Background')
}];
function parseCSS(css = '') {
  return css.split(';').reduce((accumulator, rule) => {
    if (rule) {
      const [property, value] = rule.split(':');
      if (property === 'color') {
        accumulator.color = value;
      }
      if (property === 'background-color' && value !== transparentValue) {
        accumulator.backgroundColor = value;
      }
    }
    return accumulator;
  }, {});
}
function parseClassName(className = '', colorSettings) {
  return className.split(' ').reduce((accumulator, name) => {
    if (name.startsWith('has-') && name.endsWith('-color')) {
      const colorSlug = name.replace(/^has-/, '').replace(/-color$/, '');
      const colorObject = (0,external_wp_blockEditor_namespaceObject.getColorObjectByAttributeValues)(colorSettings, colorSlug);
      accumulator.color = colorObject.color;
    }
    return accumulator;
  }, {});
}
function getActiveColors(value, name, colorSettings) {
  const activeColorFormat = (0,external_wp_richText_namespaceObject.getActiveFormat)(value, name);
  if (!activeColorFormat) {
    return {};
  }
  return {
    ...parseCSS(activeColorFormat.attributes.style),
    ...parseClassName(activeColorFormat.attributes.class, colorSettings)
  };
}
function setColors(value, name, colorSettings, colors) {
  const {
    color,
    backgroundColor
  } = {
    ...getActiveColors(value, name, colorSettings),
    ...colors
  };
  if (!color && !backgroundColor) {
    return (0,external_wp_richText_namespaceObject.removeFormat)(value, name);
  }
  const styles = [];
  const classNames = [];
  const attributes = {};
  if (backgroundColor) {
    styles.push(['background-color', backgroundColor].join(':'));
  } else {
    styles.push(['background-color', transparentValue].join(':'));
  }
  if (color) {
    const colorObject = (0,external_wp_blockEditor_namespaceObject.getColorObjectByColorValue)(colorSettings, color);
    if (colorObject) {
      classNames.push((0,external_wp_blockEditor_namespaceObject.getColorClassName)('color', colorObject.slug));
    } else {
      styles.push(['color', color].join(':'));
    }
  }
  if (styles.length) {
    attributes.style = styles.join(';');
  }
  if (classNames.length) {
    attributes.class = classNames.join(' ');
  }
  return (0,external_wp_richText_namespaceObject.applyFormat)(value, {
    type: name,
    attributes
  });
}
function ColorPicker({
  name,
  property,
  value,
  onChange
}) {
  const colors = (0,external_wp_data_namespaceObject.useSelect)(select => {
    var _getSettings$colors;
    const {
      getSettings
    } = select(external_wp_blockEditor_namespaceObject.store);
    return (_getSettings$colors = getSettings().colors) !== null && _getSettings$colors !== void 0 ? _getSettings$colors : [];
  }, []);
  const activeColors = (0,external_wp_element_namespaceObject.useMemo)(() => getActiveColors(value, name, colors), [name, value, colors]);
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.ColorPalette, {
    value: activeColors[property],
    onChange: color => {
      onChange(setColors(value, name, colors, {
        [property]: color
      }));
    }
    ,
    __experimentalIsRenderedInSidebar: true
  });
}
function InlineColorUI({
  name,
  value,
  onChange,
  onClose,
  contentRef,
  isActive
}) {
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: {
      ...text_color_textColor,
      isActive
    }
  });
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Popover, {
    onClose: onClose,
    className: "format-library__inline-color-popover",
    anchor: popoverAnchor,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(Tabs, {
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.TabList, {
        children: TABS.map(tab => (0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.Tab, {
          tabId: tab.name,
          children: tab.title
        }, tab.name))
      }), TABS.map(tab => (0,external_ReactJSXRuntime_namespaceObject.jsx)(Tabs.TabPanel, {
        tabId: tab.name,
        focusable: false,
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(ColorPicker, {
          name: name,
          property: tab.name,
          value: value,
          onChange: onChange
        })
      }, tab.name))]
    })
  });
}
;
const transparentValue = 'rgba(0, 0, 0, 0)';
const text_color_name = 'core/text-color';
const text_color_title = (0,external_wp_i18n_namespaceObject.__)('Highlight');
const EMPTY_ARRAY = [];
function getComputedStyleProperty(element, property) {
  const {
    ownerDocument
  } = element;
  const {
    defaultView
  } = ownerDocument;
  const style = defaultView.getComputedStyle(element);
  const value = style.getPropertyValue(property);
  if (property === 'background-color' && value === transparentValue && element.parentElement) {
    return getComputedStyleProperty(element.parentElement, property);
  }
  return value;
}
function fillComputedColors(element, {
  color,
  backgroundColor
}) {
  if (!color && !backgroundColor) {
    return;
  }
  return {
    color: color || getComputedStyleProperty(element, 'color'),
    backgroundColor: backgroundColor === transparentValue ? getComputedStyleProperty(element, 'background-color') : backgroundColor
  };
}
function TextColorEdit({
  value,
  onChange,
  isActive,
  activeAttributes,
  contentRef
}) {
  const [allowCustomControl, colors = EMPTY_ARRAY] = (0,external_wp_blockEditor_namespaceObject.useSettings)('color.custom', 'color.palette');
  const [isAddingColor, setIsAddingColor] = (0,external_wp_element_namespaceObject.useState)(false);
  const colorIndicatorStyle = (0,external_wp_element_namespaceObject.useMemo)(() => fillComputedColors(contentRef.current, getActiveColors(value, text_color_name, colors)), [contentRef, value, colors]);
  const hasColorsToChoose = !!colors.length || allowCustomControl;
  if (!hasColorsToChoose && !isActive) {
    return null;
  }
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      className: "format-library-text-color-button",
      isActive: isActive,
      icon: (0,external_ReactJSXRuntime_namespaceObject.jsx)(icon, {
        icon: Object.keys(activeAttributes).length ? text_color : library_color,
        style: colorIndicatorStyle
      }),
      title: text_color_title
      ,
      onClick: hasColorsToChoose ? () => setIsAddingColor(true) : () => onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, text_color_name)),
      role: "menuitemcheckbox"
    }), isAddingColor && (0,external_ReactJSXRuntime_namespaceObject.jsx)(InlineColorUI, {
      name: text_color_name,
      onClose: () => setIsAddingColor(false),
      activeAttributes: activeAttributes,
      value: value,
      onChange: onChange,
      contentRef: contentRef,
      isActive: isActive
    })]
  });
}
const text_color_textColor = {
  name: text_color_name,
  title: text_color_title,
  tagName: 'mark',
  className: 'has-inline-color',
  attributes: {
    style: 'style',
    class: 'class'
  },
  edit: TextColorEdit
};
;
const subscript = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M16.9 18.3l.8-1.2c.4-.6.7-1.2.9-1.6.2-.4.3-.8.3-1.2 0-.3-.1-.7-.2-1-.1-.3-.4-.5-.6-.7-.3-.2-.6-.3-1-.3s-.8.1-1.1.2c-.3.1-.7.3-1 .6l.2 1.3c.3-.3.5-.5.8-.6s.6-.2.9-.2c.3 0 .5.1.7.2.2.2.2.4.2.7 0 .3-.1.5-.2.8-.1.3-.4.7-.8 1.3L15 19.4h4.3v-1.2h-2.4zM14.1 7.2h-2L9.5 11 6.9 7.2h-2l3.6 5.3L4.7 18h2l2.7-4 2.7 4h2l-3.8-5.5 3.8-5.3z"
  })
});
 const library_subscript = (subscript);
;
const subscript_name = 'core/subscript';
const subscript_title = (0,external_wp_i18n_namespaceObject.__)('Subscript');
const subscript_subscript = {
  name: subscript_name,
  title: subscript_title,
  tagName: 'sub',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: subscript_name,
        title: subscript_title
      }));
    }
    function onClick() {
      onToggle();
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_subscript,
      title: subscript_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    });
  }
};
;
const superscript = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M16.9 10.3l.8-1.3c.4-.6.7-1.2.9-1.6.2-.4.3-.8.3-1.2 0-.3-.1-.7-.2-1-.2-.2-.4-.4-.7-.6-.3-.2-.6-.3-1-.3s-.8.1-1.1.2c-.3.1-.7.3-1 .6l.1 1.3c.3-.3.5-.5.8-.6s.6-.2.9-.2c.3 0 .5.1.7.2.2.2.2.4.2.7 0 .3-.1.5-.2.8-.1.3-.4.7-.8 1.3l-1.8 2.8h4.3v-1.2h-2.2zm-2.8-3.1h-2L9.5 11 6.9 7.2h-2l3.6 5.3L4.7 18h2l2.7-4 2.7 4h2l-3.8-5.5 3.8-5.3z"
  })
});
 const library_superscript = (superscript);
;
const superscript_name = 'core/superscript';
const superscript_title = (0,external_wp_i18n_namespaceObject.__)('Superscript');
const superscript_superscript = {
  name: superscript_name,
  title: superscript_title,
  tagName: 'sup',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: superscript_name,
        title: superscript_title
      }));
    }
    function onClick() {
      onToggle();
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_superscript,
      title: superscript_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    });
  }
};
;
const button_button = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M8 12.5h8V11H8v1.5Z M19 6.5H5a2 2 0 0 0-2 2V15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2ZM5 8h14a.5.5 0 0 1 .5.5V15a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8.5A.5.5 0 0 1 5 8Z"
  })
});
 const library_button = (button_button);
;
const keyboard_name = 'core/keyboard';
const keyboard_title = (0,external_wp_i18n_namespaceObject.__)('Keyboard input');
const keyboard = {
  name: keyboard_name,
  title: keyboard_title,
  tagName: 'kbd',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    function onToggle() {
      onChange((0,external_wp_richText_namespaceObject.toggleFormat)(value, {
        type: keyboard_name,
        title: keyboard_title
      }));
    }
    function onClick() {
      onToggle();
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_button,
      title: keyboard_title,
      onClick: onClick,
      isActive: isActive,
      role: "menuitemcheckbox"
    });
  }
};
;
const help = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M12 4.75a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zM3.25 12a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0zM12 8.75a1.5 1.5 0 01.167 2.99c-.465.052-.917.44-.917 1.01V14h1.5v-.845A3 3 0 109 10.25h1.5a1.5 1.5 0 011.5-1.5zM11.25 15v1.5h1.5V15h-1.5z"
  })
});
 const library_help = (help);
;
const unknown_name = 'core/unknown';
const unknown_title = (0,external_wp_i18n_namespaceObject.__)('Clear Unknown Formatting');
function selectionContainsUnknownFormats(value) {
  if ((0,external_wp_richText_namespaceObject.isCollapsed)(value)) {
    return false;
  }
  const selectedValue = (0,external_wp_richText_namespaceObject.slice)(value);
  return selectedValue.formats.some(formats => {
    return formats.some(format => format.type === unknown_name);
  });
}
const unknown = {
  name: unknown_name,
  title: unknown_title,
  tagName: '*',
  className: null,
  edit({
    isActive,
    value,
    onChange,
    onFocus
  }) {
    if (!isActive && !selectionContainsUnknownFormats(value)) {
      return null;
    }
    function onClick() {
      onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, unknown_name));
      onFocus();
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      name: "unknown",
      icon: library_help,
      title: unknown_title,
      onClick: onClick,
      isActive: true
    });
  }
};
;
const language = (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.SVG, {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_primitives_namespaceObject.Path, {
    d: "M17.5 10h-1.7l-3.7 10.5h1.7l.9-2.6h3.9l.9 2.6h1.7L17.5 10zm-2.2 6.3 1.4-4 1.4 4h-2.8zm-4.8-3.8c1.6-1.8 2.9-3.6 3.7-5.7H16V5.2h-5.8V3H8.8v2.2H3v1.5h9.6c-.7 1.6-1.8 3.1-3.1 4.6C8.6 10.2 7.8 9 7.2 8H5.6c.6 1.4 1.7 2.9 2.9 4.4l-2.4 2.4c-.3.4-.7.8-1.1 1.2l1 1 1.2-1.2c.8-.8 1.6-1.5 2.3-2.3.8.9 1.7 1.7 2.5 2.5l.6-1.5c-.7-.6-1.4-1.3-2.1-2z"
  })
});
 const library_language = (language);
;
const language_name = 'core/language';
const language_title = (0,external_wp_i18n_namespaceObject.__)('Language');
const language_language = {
  name: language_name,
  tagName: 'bdo',
  className: null,
  edit: language_Edit,
  title: language_title
};
function language_Edit({
  isActive,
  value,
  onChange,
  contentRef
}) {
  const [isPopoverVisible, setIsPopoverVisible] = (0,external_wp_element_namespaceObject.useState)(false);
  const togglePopover = () => {
    setIsPopoverVisible(state => !state);
  };
  return (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_ReactJSXRuntime_namespaceObject.Fragment, {
    children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextToolbarButton, {
      icon: library_language,
      label: language_title,
      title: language_title,
      onClick: () => {
        if (isActive) {
          onChange((0,external_wp_richText_namespaceObject.removeFormat)(value, language_name));
        } else {
          togglePopover();
        }
      },
      isActive: isActive,
      role: "menuitemcheckbox"
    }), isPopoverVisible && (0,external_ReactJSXRuntime_namespaceObject.jsx)(InlineLanguageUI, {
      value: value,
      onChange: onChange,
      onClose: togglePopover,
      contentRef: contentRef
    })]
  });
}
function InlineLanguageUI({
  value,
  contentRef,
  onChange,
  onClose
}) {
  const popoverAnchor = (0,external_wp_richText_namespaceObject.useAnchor)({
    editableContentElement: contentRef.current,
    settings: language_language
  });
  const [lang, setLang] = (0,external_wp_element_namespaceObject.useState)('');
  const [dir, setDir] = (0,external_wp_element_namespaceObject.useState)('ltr');
  return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Popover, {
    className: "block-editor-format-toolbar__language-popover",
    anchor: popoverAnchor,
    onClose: onClose,
    children: (0,external_ReactJSXRuntime_namespaceObject.jsxs)(external_wp_components_namespaceObject.__experimentalVStack, {
      as: "form",
      spacing: 4,
      className: "block-editor-format-toolbar__language-container-content",
      onSubmit: event => {
        event.preventDefault();
        onChange((0,external_wp_richText_namespaceObject.applyFormat)(value, {
          type: language_name,
          attributes: {
            lang,
            dir
          }
        }));
        onClose();
      },
      children: [(0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: language_title,
        value: lang,
        onChange: val => setLang(val),
        help: (0,external_wp_i18n_namespaceObject.__)('A valid language attribute, like "en" or "fr".')
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.SelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: (0,external_wp_i18n_namespaceObject.__)('Text direction'),
        value: dir,
        options: [{
          label: (0,external_wp_i18n_namespaceObject.__)('Left to right'),
          value: 'ltr'
        }, {
          label: (0,external_wp_i18n_namespaceObject.__)('Right to left'),
          value: 'rtl'
        }],
        onChange: val => setDir(val)
      }), (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.__experimentalHStack, {
        alignment: "right",
        children: (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_components_namespaceObject.Button, {
          __next40pxDefaultSize: true,
          variant: "primary",
          type: "submit",
          text: (0,external_wp_i18n_namespaceObject.__)('Apply')
        })
      })]
    })
  });
}
;
const non_breaking_space_name = 'core/non-breaking-space';
const non_breaking_space_title = (0,external_wp_i18n_namespaceObject.__)('Non breaking space');
const nonBreakingSpace = {
  name: non_breaking_space_name,
  title: non_breaking_space_title,
  tagName: 'nbsp',
  className: null,
  edit({
    value,
    onChange
  }) {
    function addNonBreakingSpace() {
      onChange((0,external_wp_richText_namespaceObject.insert)(value, '\u00a0'));
    }
    return (0,external_ReactJSXRuntime_namespaceObject.jsx)(external_wp_blockEditor_namespaceObject.RichTextShortcut, {
      type: "primaryShift",
      character: " ",
      onUse: addNonBreakingSpace
    });
  }
};
;
 const default_formats = ([bold, code_code, image_image, italic, build_module_link_link, strikethrough, underline, text_color_textColor, subscript_subscript, superscript_superscript, keyboard, unknown, language_language, nonBreakingSpace]);
;
default_formats.forEach(({
  name,
  ...settings
}) => (0,external_wp_richText_namespaceObject.registerFormatType)(name, settings));
(window.wp = window.wp || {}).formatLibrary = __webpack_exports__;
 })()
;