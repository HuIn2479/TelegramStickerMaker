/**
 * 进度追踪器
 * 用于跟踪任务进度并通过 WebSocket 发送更新
 */
export class ProgressTracker {
  constructor(taskId, wsManager, totalSteps = 100) {
    this.taskId = taskId
    this.wsManager = wsManager
    this.totalSteps = totalSteps
    this.currentStep = 0
    this.status = 'pending'
    this.startTime = Date.now()
  }

  /**
   * 更新进度
   */
  update(step, message = '') {
    this.currentStep = step
    const percentage = Math.min(Math.round((step / this.totalSteps) * 100), 100)

    this.wsManager.broadcastProgress(this.taskId, {
      percentage,
      step,
      totalSteps: this.totalSteps,
      message,
      status: 'processing',
      elapsed: Date.now() - this.startTime
    })
  }

  /**
   * 设置总步骤数
   */
  setTotalSteps(totalSteps) {
    this.totalSteps = totalSteps
  }

  /**
   * 增加进度
   */
  increment(message = '') {
    this.update(this.currentStep + 1, message)
  }

  /**
   * 完成任务
   */
  complete(result = null) {
    this.status = 'completed'
    this.wsManager.notifyComplete(this.taskId, {
      ...result,
      elapsed: Date.now() - this.startTime
    })
  }

  /**
   * 任务失败
   */
  error(error) {
    this.status = 'failed'
    this.wsManager.notifyError(this.taskId, error)
  }
}

export default ProgressTracker
