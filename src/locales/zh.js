export default {
  header: {
    title: 'Telegram 贴纸制作工具',
    subtitle: '轻松制作 Telegram 贴纸'
  },
  tabs: {
    static: '静态贴纸',
    video: '视频贴纸',
    history: '历史记录'
  },
  upload: {
    static: {
      text: '点击上传或拖拽图片（支持批量）',
      hint: 'PNG, WEBP, JPG（不支持 GIF）'
    },
    video: {
      text: '点击上传或拖拽视频（支持批量）',
      hint: 'GIF, MP4, WEBM（不支持静态图片）'
    }
  },
  batch: {
    title: '转换队列',
    convertAll: '全部转换',
    downloadAllPNG: '全部下载 PNG',
    downloadAllWEBP: '全部下载 WEBP',
    downloadAll: '全部下载',
    clear: '清空'
  },
  item: {
    convert: '转换',
    preview: '预览截取',
    remove: '移除',
    retry: '重试',
    download: '下载',
    converting: '转换中...',
    failed: '转换失败',
    loading: '加载中...',
    trimTime: '截取时间段',
    start: '开始',
    end: '结束',
    duration: '时长'
  },
  requirements: {
    title: '格式要求',
    static: {
      format: 'PNG / WEBP 格式',
      size: '512×512 以内',
      background: '透明背景'
    },
    video: {
      format: 'WEBM VP9',
      size: '512×512 以内',
      duration: '≤3 秒',
      fps: '30 FPS',
      fileSize: '≤256 KB',
      audio: '无音轨'
    }
  },
  history: {
    title: '历史记录',
    items: '条记录',
    clear: '清空',
    empty: '暂无历史记录',
    tip: '转换记录会自动保存 24 小时',
    justNow: '刚刚',
    minutesAgo: '{n} 分钟前',
    hoursAgo: '{n} 小时前',
    download: '下载'
  },
  footer: {
    text: '基于',
    link: 'Telegram Sticker 规范'
  },
  status: {
    pending: '待转换',
    converting: '转换中',
    done: '完成',
    error: '失败',
    conversionFailed: '转换失败',
    preparing: '准备中...',
    completed: '已完成'
  },
  alerts: {
    invalidFormat: '请上传 PNG、WEBP 或 JPG 格式的静态图片（不支持 GIF 动图）',
    invalidVideoFormat: '请上传 GIF、MP4 或 WEBM 格式的视频文件（不支持静态图片）',
    filesFiltered: '已过滤掉 {n} 个不支持的文件（GIF/视频等）',
    filesFilteredVideo: '已过滤掉 {n} 个不支持的文件（静态图片等）',
    maxFiles: '一次最多上传 {max} 个文件，已自动选择前 {max} 个',
    maxVideos: '视频处理较慢，一次最多上传 {max} 个文件，已自动选择前 {max} 个',
    clearHistory: '确定要清空历史记录吗？',
    downloadFailed: '打包下载失败，请重试'
  }
}
