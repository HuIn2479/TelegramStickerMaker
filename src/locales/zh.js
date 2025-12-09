export default {
  header: {
    title: 'Telegram 贴纸制作工具',
    subtitle: '轻松制作 Telegram 贴纸'
  },
  tabs: {
    static: '静态贴纸',
    video: '视频贴纸',
    history: '历史记录',
    upload: '上传到 TG'
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
    items: '个文件',
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
  },
  telegram: {
    config: {
      title: 'Telegram 配置',
      botToken: '机器人令牌',
      botTokenPlaceholder: "从 BotFather 获取",
      validate: '验证',
      userId: '用户 ID',
      userIdPlaceholder: '你的 Telegram 用户 ID',
      userIdHint: "向 userinfobot 发送任意消息获取",
      packName: '包名称',
      packNamePlaceholder: '英文、数字、下划线',
      packTitle: '包标题',
      packTitlePlaceholder: '贴纸包显示名称',
      emoji: '表情符号',
      emojiPlaceholder: '😊'
    },
    files: {
      title: '可上传文件',
      refresh: '刷新',
      clearSelection: '取消选择',
      loading: '加载中...',
      empty: '暂无可上传的贴纸文件',
      emptyHint: '请先在静态/视频贴纸页面转换文件',
      selectAll: '全选'
    },
    upload: {
      selected: '已选择 {n} 个文件',
      limitWarning: 'Telegram 贴纸包最多 120 个贴纸',
      button: '上传到 Telegram',
      uploading: '上传中',
      viewPack: '查看贴纸包'
    },
    help: {
      title: '❓ 使用帮助',
      getToken: '如何获取 Bot Token？',
      step1: '在 Telegram 中搜索 BotFather',
      step2: '发送 /newbot 创建新机器人',
      step3: '复制获得的 Token',
      getUserId: '如何获取用户 ID？',
      userStep1: '在 Telegram 中搜索 userinfobot',
      userStep2: '发送任意消息，机器人会回复你的 ID',
      important: '重要提示',
      tip1: '上传前请先与你的机器人进行对话（发送 /start）',
      tip2: '贴纸包名称只能包含英文字母、数字和下划线',
      tip3: '每个贴纸包最多 120 个静态贴纸或 50 个视频贴纸'
    }
  }
}
