#!/usr/bin/env bash
# 用法: ./scripts/copilot-commit-zh.sh "主要修改点"
# 这个脚本只是辅助你固定中文模板，便于与 Copilot 结合。

summary="$1"
if [ -z "$summary" ]; then
  echo "请输入提交说明主题，例如：./scripts/copilot-commit-zh.sh '修复：XX问题'"
  exit 1
fi

# 如果不是以中文前缀开头，自动补齐映射
if [[ ! $summary =~ ^(修复：|新增：|优化：|文档：|重构：|性能：|测试：|维护：) ]]; then
  summary="修复：$summary"
fi

# 交给 git commit，触发 prepare-commit-msg 钩子也可二次校验
git commit -m "$summary"
