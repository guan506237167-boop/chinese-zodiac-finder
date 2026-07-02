# Chinese Zodiac Guide 发文标准

> 适用范围：生肖站所有 Guides、动物详情页、年份页、兼容性页、后续新增文章页。
> 目标：让 AI 批量发文时保持 SEO/GEO 结构稳定、事实可控、内链自然、FAQ 不重复，并能通过 `Pre-Publish SEO Check`。

## 1. 发布前必须准备

每篇文章在生成前必须有以下字段：

| 字段 | 标准 |
|---|---|
| Primary Keyword | 一个主关键词，不能和已发布页面重复 |
| Search Intent | 明确属于 meaning / year / compatibility / element / animal / guide / tool 中的一类或组合 |
| URL Slug | 英文小写短横线，不堆关键词，不随年份热点频繁改 |
| SEO Title | 35-70 字符，主关键词尽量靠前，语义完整 |
| Meta Description | 90-165 字符，包含主题、场景、用户能得到什么 |
| Article Type | guide / animal / year / compatibility / tool-support / FAQ |
| Target Page Role | 枢纽页 / 长尾页 / 工具辅助页 / 详情页 |
| Related Internal Links | 3-5 条候选内链 |
| FAQ Plan | 2-5 个当前页专属问题 |

## 2. 写作知识库规则

这一部分才是正式发文时给 AI 的“写作规则库”。SEO 检查只能判断结构有没有问题，不能保证文章像真人写；所以每篇文章生成时，必须同时执行下面的开篇、过渡、正文、结尾规则。

### 2.1 核心原则：70% + 30%

| 部分 | 来源 | 在生肖站里的含义 |
|---|---|---|
| 70% | AI 负责 | 关键词意图、文章框架、事实整理、FAQ、内链、SEO/GEO 结构 |
| 30% | 知识库素材 | 文化解释、具体例子、用户场景、传统边界说明、站内已有工具和页面经验 |

每篇文章都要通过“替换署名测试”：

> 如果把站名换成任何一个普通生肖网站，这篇文章还完全成立，那就说明文章太通用，必须补充更具体的文化信息、场景解释或站内工具引导。

### 2.2 开篇规则

开篇不是泛泛介绍，也不是 “In this article, we will explore...”。生肖站文章开头要做到三件事：

1. 第一段直接回答用户搜索意图。
2. 前 3 句话尽量短，先让用户知道自己找对了页面。
3. 80-140 个英文词内给出核心答案、边界提醒和继续阅读理由。

可使用的开篇类型：

| 类型 | 适用页面 | 写法 |
|---|---|---|
| 直接回答型 | 年份页、动物页、工具辅助页 | 先给答案，再解释 Lunar New Year、animal、element |
| 场景问题型 | compatibility、calculator、FAQ | 先写用户困惑，例如生日在 1 月/2 月、两人属相是否合适 |
| 误区纠正型 | year、element、zodiac start date | 先纠正 “zodiac year starts on January 1” 这类常见误解 |
| 文化背景型 | meaning、lucky symbols、guide | 先说明这是传统文化参考，不是科学或现实承诺 |

示例：

```text
If you were born in 1990, your Chinese zodiac sign is usually the Horse, but the exact answer depends on whether your birthday falls before or after Lunar New Year. In Chinese zodiac culture, the Horse is associated with movement, confidence, independence, and a bright social presence. This guide explains the zodiac year boundary, the Horse meaning, and how to use the result as a cultural reference rather than a fixed personality label.
```

不要这样写：

```text
Chinese zodiac is a fascinating system with a long history. In this article, we will explore everything you need to know about the Horse zodiac.
```

### 2.3 过渡规则

过渡句不能只是连接词，必须解释“为什么下一段值得看”。每个 H2 之间要有 1 句自然过渡，让用户和搜索引擎都能理解文章逻辑。

推荐过渡方式：

| 场景 | 过渡句功能 | 示例 |
|---|---|---|
| 从答案到解释 | 告诉用户为什么还要看下去 | “That boundary matters because Chinese zodiac years follow the lunar calendar, not January 1.” |
| 从动物到年份 | 把文化含义落到可验证信息 | “Once the animal is clear, the next step is to check which Gregorian years belong to that sign.” |
| 从年份到元素 | 解释更细分的判断 | “The animal gives the main sign, while the element adds another layer to the traditional reading.” |
| 从工具到结果 | 防止用户误读工具 | “The result is best used as a cultural guide, especially for birthdays near Lunar New Year.” |
| 从正文到 FAQ | 承接真实疑问 | “These are the questions people usually ask after checking their zodiac sign.” |

避免：

- Firstly / Secondly / Finally 机械堆叠。
- It is worth noting that 这种空泛连接。
- Moreover / Furthermore 连续出现。
- 上一段讲 meaning，下一段突然跳到 lucky number，中间没有解释。

### 2.4 正文节奏规则

生肖站不是论文，也不是纯工具说明。正文要“答案清楚、段落轻、信息密度高”。

| 项目 | 标准 |
|---|---|
| 段落长度 | 普通段落 2-4 句，避免大段墙 |
| 每段主题 | 一段只讲一个意思 |
| 句子节奏 | 长短句搭配，核心答案用短句 |
| 表格使用 | 年份、元素、兼容性、lucky symbols 优先用表格 |
| 列表使用 | 步骤、误区、判断标准优先用列表 |
| GEO 摘取 | 每篇至少有一个短答案段，可被 AI 搜索直接引用 |

推荐结构：

```text
直接答案
→ 为什么这样判断
→ 具体表格或步骤
→ 文化含义
→ 常见误区
→ FAQ
→ 自然引导到相关工具或页面
```

### 2.5 结尾规则

结尾不要突然结束，也不要写空泛 CTA。结尾要完成三件事：

1. 回答开头的问题。
2. 再提醒一次文化边界。
3. 自然给出下一步入口，例如 calculator、compatibility、animal guide。

推荐结尾类型：

| 类型 | 适用页面 | 写法 |
|---|---|---|
| 总结判断型 | 年份页、动物页 | 重申 sign、element、Lunar New Year 边界 |
| 下一步引导型 | 工具页、guide | 引导用户继续查 compatibility 或 years chart |
| 误区收束型 | 边界类文章 | 重申不要按 January 1 直接判断 |
| 文化边界型 | compatibility、lucky symbols | 提醒这是 traditional reference，不是确定性结论 |

示例：

```text
The main point is simple: the Horse sign is useful only after you check the Lunar New Year boundary for your birth year. Once the sign is confirmed, you can read the Horse meaning, compare compatibility, or use the zodiac calculator to check another birthday. Treat the result as a cultural guide, not a fixed rule about personality or relationships.
```

不要这样写：

```text
In conclusion, Chinese zodiac is very interesting. We hope this article helped you. Thanks for reading.
```

### 2.6 去 AI 味规则

必须避免这些表达：

| AI 味表达 | 问题 | 替代方式 |
|---|---|---|
| Firstly / Secondly / Finally | 机械 | 用自然小标题或 “The next thing to check is...” |
| It is worth noting that | 废话感强 | 直接说重点 |
| In conclusion | 模板味 | 用 “The main point is...” 或直接总结 |
| This article explores | 开头无价值 | 直接回答用户问题 |
| rich and fascinating history | 空泛 | 换成具体文化信息 |
| always / never / guaranteed | 风险高 | 换成 traditionally / often / commonly associated with |

生成后必须检查：

- 有没有连续几段句式一样。
- 有没有每篇文章都使用同一套开头。
- 有没有没有事实支撑的文化判断。
- 有没有把生肖写成现实承诺。
- 有没有只是在换关键词，没有新增具体信息。

### 2.7 生肖站文章模板

后续 AI 批量生成文章时，优先按这个模板走：

```text
# H1: [Primary Keyword]

Opening:
- 直接回答搜索意图
- 说明 Lunar New Year / cultural reference / tool use 中的关键边界

Short Answer:
- 2-4 句可被 GEO 摘取的短答案

H2: [Core Explanation]
- 解释主题，不泛泛讲历史

H2: [Table / Steps / Checker Result]
- 年份、元素、兼容性、查询步骤等结构化信息

H2: [Common Mistakes / Cultural Notes]
- 纠正常见误区

H2: [Related Guides]
- 3-5 条自然内链

FAQ:
- 2-5 个当前页专属问题

Ending:
- 回扣开头
- 文化边界提醒
- 下一步页面或工具入口
```

## 3. 正文结构标准

每篇正式文章必须包含：

1. **直接回答段**
   开头 80-140 个英文词内回答用户核心问题，不绕弯，不写泛泛介绍。

2. **主题解释**
   说明生肖、年份、元素、兼容性或文化含义。必须区分传统文化解释和现实建议。

3. **事实锚点**
   至少包含 2-4 个可核查信息，例如：
   - zodiac animal
   - year range
   - Lunar New Year boundary
   - element
   - order in the 12-animal cycle
   - compatibility score 或 pair type

4. **实用区块**
   根据页面类型选择：
   - 年份页：dates / animal / element / early birthday note
   - 动物页：years / meaning / personality / lucky numbers / colors
   - 兼容性页：overall / love / friendship / work / cultural note
   - 工具辅助页：how to use / what result means / common mistakes

5. **专属 FAQ**
   FAQ 必须和当前页直接相关，不能每页复制同一组通用 FAQ。

6. **自然结尾**
   总结核心答案，并自然引导到相关页，不强行营销。

## 4. SEO/GEO 结构标准

### 4.0 Content depth gate

Do not publish a new zodiac guide as a short placeholder.

| Page type | Minimum visible words | Target words |
|---|---:|---:|
| New zodiac guide article | 1000 | 1000-1400 |
| Animal/year detail page | 1000 | 1000-1300 |
| Compatibility hub page | 1000 | 1000-1400 |
| Compatibility template detail | 1000 | 1000-1300 |
| Tool/list/FAQ support page | Not forced | Judge by task completeness |

Every new article must include a direct answer block, Lunar New Year boundary where relevant, cultural-reference disclaimer, related guides, and page-specific FAQ. Existing short template pages should be treated as rewrite candidates, not as the quality benchmark.

| 项目 | 标准 |
|---|---|
| H1 | 每页只能 1 个，和页面主题一致 |
| H2 | 至少 2 个，结构清楚 |
| FAQ | 详情页必须有 2-5 个专属 FAQ |
| FAQ Schema | 只输出 1 份 FAQPage schema |
| Breadcrumb | 必须有 |
| Canonical | 必须指向当前正式 URL |
| Sitemap | 发布后必须进入 sitemap |
| 内链 | 每篇 3-5 条，自然放入正文或 Related Guides |
| 图片 Alt | 所有非装饰图片必须有 alt；装饰图可以空 alt |
| GEO 短答案 | 页面中至少有一个可被 AI 摘取的直接答案段 |

GEO 问答优先覆盖这些问题类型：

- What is ...
- What does ... mean?
- How do I find ...
- Is ... compatible with ...?
- What year is ...
- What element is ...
- Does the zodiac year start on January 1?

## 5. 内链规则

每篇文章优先链接：

1. 当前主题的上级枢纽页，例如 `/guides/`、`/chinese-zodiac-animals/`。
2. 当前主题对应的详情页，例如 Horse 页、2026 年份页。
3. 工具页，例如 Calculator、Years chart、Compatibility checker。
4. 同主题集群页面，例如 animal + years + elements + compatibility。

禁止：

- 为凑数量硬塞内链。
- 所有页面都链接同一批页面。
- 锚文本全部写成 “click here”。
- 详情页重复放完全一样的 Related Guides。

## 6. FAQ 规则

FAQ 必须满足：

- 每页 2-5 个。
- 问题像真实用户会问的句子。
- 答案短、直接、可引用。
- 当前页专属，不复制全站通用 FAQ。
- 页面可见 FAQ 和结构化 FAQ 内容一致。

FAQ 不要写：

- 玄学断言
- 现实关系判断
- “一定适合 / 一定不好”
- 医疗、投资、法律类承诺

推荐表达：

- “In traditional Chinese zodiac culture...”
- “This is a cultural reference, not a scientific claim.”
- “People often use this as a symbolic guide...”

## 7. 图片和视觉规则

| 项目 | 标准 |
|---|---|
| 视觉类型 | 生肖印章、剪纸风图标、传统纹样、文化插画 |
| 图片数量 | 普通文章可 1-3 张；工具页可少图但必须有视觉锚点 |
| 图片相关性 | 必须和生肖、年份、元素、兼容性或传统文化有关 |
| 禁止 | 无关 stock 图、模糊背景图、重复图、看不清文字的图 |
| Alt | 描述图片实际内容，不堆关键词 |

## 8. 合规和事实边界

生肖站必须保持文化解释定位：

- 不把生肖内容写成科学结论。
- 不做关系、婚姻、事业、健康、财富的确定性承诺。
- 不写 “guaranteed lucky”、“best forever”、“must avoid” 这类绝对说法。
- 兼容性页面必须说明是 cultural reference / entertainment。
- 涉及年份边界时，以 Lunar New Year 为准，避免直接按 January 1 判断。

推荐替代表达：

| 不建议 | 建议 |
|---|---|
| This match is perfect | This pair is traditionally read as harmonious |
| You will be lucky | It is traditionally associated with auspicious symbolism |
| This personality is true | This is a cultural personality association |
| 2026 starts on Jan 1 | The zodiac year begins at Lunar New Year |

## 9. 发布前检查流程

每次新增或更新文章后必须执行：

```bash
npm run build
```

然后查看：

```text
/admin/seo-report/
/admin/seo-report.json
```

发布门槛：

- `Fix = 0`
- 新增文章分数建议 `>= 90`
- 如为法律页、隐私页，可接受 Review
- 任何 H1、canonical、sitemap、FAQ Schema 问题必须先修复

## 10. 发布后复盘

每篇文章发布后按时间窗口记录：

| 时间 | 检查 |
|---|---|
| Day 0 | 页面 200、样式、图片、FAQ、Schema、sitemap |
| Day 3 | GSC 是否发现，是否有明显抓取问题 |
| Day 7 | 是否有曝光，标题和描述是否需要微调 |
| Day 14 | 未收录页面检查内容重复、内链弱、结构薄 |
| Day 28 | 决定保留观察 / 微调 / 合并 / 重写 / 加强内链 |

## 11. 反哺知识库

每次发文或复盘后，如果出现以下内容，要沉淀到知识库：

| 情况 | 沉淀位置 |
|---|---|
| 好选题角度 | 选题角度库 |
| 高质量 FAQ | FAQ 题库 |
| 自然内链组合 | 内链池 |
| 好开头或短答案段 | 可复用优秀段落 |
| 图片提示词有效 | 图片提示词库 |
| 出现错误或踩坑 | 禁用词与雷区 |
| 流程问题 | SEO/GEO 写作流程 |

## 12. 当前生肖站专属页面类型

| 类型 | 必须包含 |
|---|---|
| Animal page | animal order, years, Chinese name, pinyin, meaning, personality, lucky numbers/colors |
| Year page | Gregorian year, animal, element, Lunar New Year date, early birthday note |
| Compatibility page | pair summary, score, love/friendship/work dimensions, cultural disclaimer |
| Guide list page | 搜索框、分类卡片、清晰入口，不强制 FAQ |
| FAQ page | 全站 FAQ 汇总，可分类折叠 |
| Tool page | 工具说明、输入方式、结果解释、误区提示 |

---

最后更新：2026-06-26
