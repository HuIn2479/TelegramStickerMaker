export default {
  header: {
    title: 'Telegram Sticker Maker',
    subtitle: 'Create stickers for Telegram easily'
  },
  tabs: {
    static: 'Static',
    video: 'Video',
    history: 'History'
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
  }
}
