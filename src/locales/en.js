export default {
  header: {
    title: 'Telegram Sticker Maker',
    subtitle: 'Create stickers for Telegram easily'
  },
  tabs: {
    static: 'Static',
    video: 'Video',
    history: 'History',
    upload: 'Upload to TG'
  },
  upload: {
    static: {
      text: 'Click to upload or drag images (batch supported)',
      hint: 'PNG, WEBP, JPG (GIF not supported)'
    },
    video: {
      text: 'Click to upload or drag videos (batch supported)',
      hint: 'GIF, MP4, WEBM (static images not supported)'
    }
  },
  batch: {
    title: 'Conversion Queue',
    items: 'files',
    convertAll: 'Convert All',
    downloadAllPNG: 'Download All PNG',
    downloadAllWEBP: 'Download All WEBP',
    downloadAll: 'Download All',
    clear: 'Clear'
  },
  item: {
    convert: 'Convert',
    preview: 'Preview Trim',
    remove: 'Remove',
    retry: 'Retry',
    download: 'Download',
    converting: 'Converting...',
    failed: 'Conversion failed',
    loading: 'Loading...',
    trimTime: 'Trim Time Range',
    start: 'Start',
    end: 'End',
    duration: 'Duration'
  },
  requirements: {
    title: 'Requirements',
    static: {
      format: 'PNG / WEBP format',
      size: '512×512 max',
      background: 'Transparent background'
    },
    video: {
      format: 'WEBM VP9',
      size: '512×512 max',
      duration: '≤3 seconds',
      fps: '30 FPS',
      fileSize: '≤256 KB',
      audio: 'No audio track'
    }
  },
  history: {
    title: 'History',
    items: 'items',
    clear: 'Clear',
    empty: 'No history yet',
    tip: 'Records are kept for 24 hours',
    justNow: 'Just now',
    minutesAgo: '{n}m ago',
    hoursAgo: '{n}h ago',
    download: 'Download'
  },
  footer: {
    text: 'Based on',
    link: 'Telegram Sticker Requirements'
  },
  status: {
    pending: 'Pending',
    converting: 'Converting...',
    done: 'Done',
    error: 'Failed',
    conversionFailed: 'Conversion failed',
    preparing: 'Preparing...',
    completed: 'Completed'
  },
  alerts: {
    invalidFormat: 'Please upload PNG, WEBP or JPG format static images (GIF not supported)',
    invalidVideoFormat: 'Please upload GIF, MP4 or WEBM format video files (static images not supported)',
    filesFiltered: '{n} unsupported files filtered (GIF/videos etc.)',
    filesFilteredVideo: '{n} unsupported files filtered (static images etc.)',
    maxFiles: 'Maximum {max} files at once, automatically selected first {max}',
    maxVideos: 'Video processing is slow, maximum {max} files at once, automatically selected first {max}',
    clearHistory: 'Are you sure you want to clear history?',
    downloadFailed: 'Batch download failed, please try again'
  },
  telegram: {
    config: {
      title: 'Telegram Config',
      botToken: 'Token',
      botTokenPlaceholder: "From BotFather",
      validate: 'Verify',
      userId: 'User ID',
      userIdPlaceholder: 'Your Telegram user ID',
      userIdHint: "Send any message to userinfobot to get it",
      packName: 'Name',
      packNamePlaceholder: 'Letters, numbers, underscore',
      packTitle: 'Title',
      packTitlePlaceholder: 'Display name for pack',
      emoji: 'Emoji',
      emojiPlaceholder: '😊'
    },
    files: {
      title: 'Available Files',
      refresh: 'Refresh',
      clearSelection: 'Clear Selection',
      loading: 'Loading...',
      empty: 'No sticker files available',
      emptyHint: 'Convert files in Static/Video panel first',
      selectAll: 'Select All'
    },
    upload: {
      selected: '{n} files selected',
      limitWarning: 'Telegram packs limited to 120 stickers',
      button: 'Upload to Telegram',
      uploading: 'Uploading',
      viewPack: 'View Sticker Pack'
    },
    help: {
      title: 'Help',
      getToken: 'How to get Bot Token?',
      step1: 'Search BotFather in Telegram',
      step2: 'Send /newbot to create a new bot',
      step3: 'Copy the token you received',
      getUserId: 'How to get User ID?',
      userStep1: 'Search userinfobot in Telegram',
      userStep2: 'Send any message and the bot will reply with your ID',
      important: 'Important Notes',
      tip1: 'Start a chat with your bot before uploading (send /start)',
      tip2: 'Pack name can only contain letters, numbers and underscores',
      tip3: 'Each pack can have max 120 static or 50 video stickers'
    }
  }
}
