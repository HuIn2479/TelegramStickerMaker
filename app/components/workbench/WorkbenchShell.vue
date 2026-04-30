<template>
  <section class="section-grid workbench-shell">
    <div class="kv-surface workbench-shell-surface">
      <div class="workbench-header">
        <div>
          <h2 class="workbench-title">制作工坊</h2>
          <div class="text-secondary">转换、管理、发布贴纸</div>
        </div>
        <slot name="tabs" />
      </div>
      <slot />
    </div>
  </section>
</template>
