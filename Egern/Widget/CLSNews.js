const API_URL = "https://api.98dou.cn/api/hotlist/cls/all";
const HOME_URL = "https://www.cls.cn/telegraph";
const CACHE_KEY = "cls-news-cache-v1";

const COLORS = {
  background: { light: "#FFFDF9", dark: "#171511" },
  primary: { light: "#17130D", dark: "#F7F1E7" },
  secondary: { light: "#766D61", dark: "#AAA094" },
  accent: "#D9272E",
};

function text(value) {
  return String(value == null ? "" : value)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function timestamp(value) {
  const number = Number(value);
  if (Number.isFinite(number)) return number < 1000000000000 ? number * 1000 : number;
  if (typeof value === "string") {
    const parsed = new Date(value.replace(" ", "T") + "+08:00").getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function articleURL(value, id) {
  if (typeof value === "string") {
    const candidate = value.trim();
    if (candidate.startsWith("https://www.cls.cn/")) return candidate;
    if (candidate.startsWith("http://www.cls.cn/")) {
      return "https://www.cls.cn/" + candidate.slice("http://www.cls.cn/".length);
    }
    if (candidate.startsWith("/")) return "https://www.cls.cn" + candidate;
  }
  return id ? `https://www.cls.cn/detail/${encodeURIComponent(String(id))}` : HOME_URL;
}

function normalize(payload) {
  const candidates = [
    payload && payload.data && payload.data.roll_data,
    payload && payload.data && payload.data.telegraph_list,
    payload && payload.data && payload.data.list,
    payload && payload.data && payload.data.data && payload.data.data.roll_data,
    payload && payload.data && payload.data.data && payload.data.data.list,
    payload && payload.data,
    payload && payload.list,
  ];
  const list = candidates.find(Array.isArray) || [];

  return list.map((item) => {
    const id = item.id_original || item.telegraph_id || item.article_id || item.id;
    const title = text(item.title || item.subject || item.content || item.brief);
    return {
      id: id ? String(id) : "",
      title,
      time: timestamp(item.ctime || item.create_time || item.time || item.publish_time),
      important: Boolean(item.is_red || item.is_top || item.level === 1),
      url: articleURL(item.share_url || item.shareurl || item.url, id),
    };
  }).filter((item) => item.title);
}

function timeLabel(value) {
  if (!value) return "刚刚";
  const date = new Date(value);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function refreshDate(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function header(stale) {
  return {
    type: "stack",
    direction: "row",
    alignItems: "center",
    children: [
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        gap: 6,
        children: [
          { type: "stack", width: 4, height: 17, backgroundColor: COLORS.accent, borderRadius: 2, children: [] },
          { type: "text", text: "财联社电报", font: { size: "headline", weight: "bold" }, textColor: COLORS.primary, maxLines: 1 },
        ],
      },
      { type: "spacer" },
      { type: "text", text: stale ? "缓存" : "实时", font: { size: "caption2", weight: "semibold" }, textColor: stale ? COLORS.secondary : COLORS.accent },
    ],
  };
}

function newsRow(item, compact) {
  return {
    type: "stack",
    direction: "row",
    alignItems: "start",
    gap: compact ? 5 : 8,
    url: item.url,
    children: [
      { type: "text", text: timeLabel(item.time), font: { size: "caption2", weight: "medium" }, textColor: item.important ? COLORS.accent : COLORS.secondary, maxLines: 1 },
      { type: "text", text: item.title, font: { size: compact ? 12 : 14, weight: item.important ? "semibold" : "regular" }, textColor: COLORS.primary, maxLines: compact ? 2 : 2, minScale: 0.82, flex: 1 },
    ],
  };
}

function emptyWidget(message, refreshMinutes) {
  return {
    type: "widget",
    url: HOME_URL,
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.background,
    refreshAfter: refreshDate(refreshMinutes),
    children: [
      header(true),
      { type: "spacer" },
      { type: "image", src: "sf-symbol:exclamationmark.triangle", width: 24, height: 24, color: COLORS.accent },
      { type: "text", text: message, font: { size: "caption1", weight: "medium" }, textColor: COLORS.secondary, maxLines: 3, minScale: 0.75 },
      { type: "spacer" },
    ],
  };
}

function inlineWidget(item, refreshMinutes) {
  return {
    type: "widget",
    url: item ? item.url : HOME_URL,
    refreshAfter: refreshDate(refreshMinutes),
    children: [{
      type: "text",
      text: item ? `财联社 · ${item.title}` : "财联社 · 暂无电报",
      font: { size: "caption1", weight: "medium" },
      maxLines: 1,
    }],
  };
}

function accessoryWidget(item, refreshMinutes) {
  return {
    type: "widget",
    url: item ? item.url : HOME_URL,
    refreshAfter: refreshDate(refreshMinutes),
    gap: 3,
    children: [
      { type: "text", text: "财联社", font: { size: "caption2", weight: "bold" }, maxLines: 1 },
      { type: "text", text: item ? item.title : "暂无电报", font: { size: "caption1", weight: "medium" }, maxLines: 2, minScale: 0.75 },
    ],
  };
}

function mainWidget(items, family, stale, refreshMinutes) {
  const small = family === "systemSmall";
  const extraLarge = family === "systemExtraLarge";
  const limit = small ? 2 : family === "systemMedium" ? 3 : extraLarge ? 10 : 6;
  const visible = items.slice(0, limit);

  return {
    type: "widget",
    url: HOME_URL,
    padding: small ? 13 : 16,
    gap: small ? 8 : 10,
    backgroundColor: COLORS.background,
    refreshAfter: refreshDate(refreshMinutes),
    children: [
      header(stale),
      {
        type: "stack",
        direction: "column",
        gap: small ? 8 : 9,
        flex: 1,
        children: visible.map((item) => newsRow(item, small)),
      },
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        children: [
          { type: "text", text: stale ? "网络异常，显示上次内容" : `更新于 ${timeLabel(Date.now())}`, font: { size: "caption2" }, textColor: COLORS.secondary, maxLines: 1 },
          { type: "spacer" },
          { type: "image", src: "sf-symbol:chevron.right", width: 7, height: 10, color: COLORS.secondary },
        ],
      },
    ],
  };
}

export default async function(ctx) {
  const refreshMinutes = Math.max(5, Number(ctx.env.REFRESH_MINUTES) || 10);
  let items = [];
  let stale = false;
  let failure = "未知错误";

  try {
    const response = await ctx.http.get(API_URL, {
      timeout: 8000,
      policy: "DIRECT",
    });
    if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    items = normalize(payload);
    if (!items.length) {
      const code = payload && (payload.code || payload.errno || payload.status);
      const message = payload && (payload.msg || payload.message || payload.error);
      throw new Error(message || (code != null ? `接口代码 ${code}` : "响应中没有新闻"));
    }
    ctx.storage.setJSON(CACHE_KEY, { items, savedAt: Date.now() });
  } catch (error) {
    failure = error && error.message ? String(error.message) : String(error);
    try {
      const cache = ctx.storage.getJSON(CACHE_KEY);
      items = cache && Array.isArray(cache.items)
        ? cache.items.map((item) => ({ ...item, url: articleURL(item.url, item.id) }))
        : [];
    } catch (_) {
      items = [];
    }
    stale = true;
  }

  if (!items.length) return emptyWidget(`获取失败：${failure}`, refreshMinutes);
  if (ctx.widgetFamily === "accessoryInline") return inlineWidget(items[0], refreshMinutes);
  if (ctx.widgetFamily === "accessoryCircular" || ctx.widgetFamily === "accessoryRectangular") {
    return accessoryWidget(items[0], refreshMinutes);
  }
  return mainWidget(items, ctx.widgetFamily, stale, refreshMinutes);
}
