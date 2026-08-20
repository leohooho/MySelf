# MySelf

个人配置与脚本的合集仓库，用于备份和同步各类日常使用的配置文件。

## 目录结构

```text
Egern/
├── Profile.yaml       Egern 精简配置
├── Rule/
│   ├── Hsbc.yaml      HSBC 分流规则
│   └── IBKR.yaml      IBKR 分流规则
└── Widget/
    └── Widgets.yaml   小组件配置
```

## Egern 配置

当前收录了一套面向日常使用的 Egern 精简配置：

- **Proxy**：订阅入口与默认代理策略
- **AI**：AI 服务独立选择节点
- **HongKong**：HSBC、IBKR 优先使用自动测速选出的香港节点；香港节点为空或不可用时回退直连
- **直连流量**：局域网、中国大陆 IP 及直连规则集
- **DNS**：使用腾讯与阿里 DoH，Bootstrap 使用 `223.5.5.5` 和 `119.29.29.29`
- **默认策略**：未命中其他规则的流量交给 `Proxy`

配置启用了 DNS 劫持和 MITM，并按需加载流媒体增强、WeatherKit、广告处理及桌面小组件等模块。桌面小组件已统一合并到 `Egern/Widget/Widgets.yaml`，无需再单独订阅 quick-start 的模块清单。

### 使用方式

1. 将 `Egern/Profile.yaml` 中 `Proxy.urls` 的占位地址替换为自己的订阅地址。
2. 将 `Profile.yaml` 导入 Egern。
3. 首次使用时检查 `Proxy` 和 `AI` 的节点选择，并按需启用模块。

HSBC、IBKR 的远程规则分别来自 `Egern/Rule/Hsbc.yaml` 和 `Egern/Rule/IBKR.yaml`。若香港节点不可用，相关流量会直连，不会改用其他地区的代理节点。

## 说明

本仓库为个人配置备份，仅供自用参考。
