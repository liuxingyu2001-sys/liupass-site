/**
 * Liupass 官网 i18n：默认英语，可切换中文。
 * 语言保存在 localStorage（key: liupass-lang），默认 'en'。
 * 用法：
 *   - 元素加 data-i18n="键名"，加载时自动替换（支持 HTML）
 *   - I18N.doc('guide/04-task') 返回当前语言下的文档路径
 *   - 语言切换按钮 id 为 lang-switch，点击切换
 */
const I18N = (function () {
  const LS_KEY = 'liupass-lang';

  const dict = {
    en: {
      'brand': 'Liupass',
      'nav.home': 'Home',
      'nav.docs': 'Docs',
      'hero.h1': 'Liupass Battle Pass Plugin',
      'hero.p': 'A battle pass system for Paper / Leaf 1.21+ servers, with multiple seasons, three independently purchasable tiers, and custom tasks and rewards.',
      'hero.button': 'View Documentation',
      'feat.h2': 'Features',
      'feat.1': 'Multiple passes, each season configured independently',
      'feat.2': 'Standard / Deluxe / Premium tiers purchased independently',
      'feat.3': 'PlayerPoints points & Vault economy support',
      'feat.4': 'Task types: kill, mine, craft, fish, enchant, brew, eat, playtime, login, custom',
      'feat.5': 'Daily / weekly / season task periods',
      'feat.6': 'Reward types: command, item, CraftEngine model, economy, points',
      'feat.7': 'MySQL or SQLite data storage',
      'feat.8': 'Redis cross-server sync (optional)',
      'feat.9': 'PlaceholderAPI variables & PassAPI developer API',
      'footer': 'Liupass — a battle pass plugin for Paper / Leaf',
      'docs.h2': 'Docs',
      'sidebar.readme': 'Overview',
      'sidebar.user': 'User Guide',
      'sidebar.01': 'Installation',
      'sidebar.02': 'Configuration',
      'sidebar.03': 'Battle Pass',
      'sidebar.04': 'Tasks',
      'sidebar.05': 'Rewards',
      'sidebar.06': 'Commands & Permissions',
      'sidebar.07': 'Developer API',
      'sidebar.08': 'FAQ',
      'notfound.p': 'The page does not exist or has been removed.',
      'notfound.button': 'Back to Home',
      'switch.to': '中文'
    },
    zh: {
      'brand': 'Liupass',
      'nav.home': '首页',
      'nav.docs': '文档',
      'hero.h1': 'Liupass 战令 / 通行证插件',
      'hero.p': '适用于 Paper / Leaf 1.21 以上版本服务器的战令系统，支持多赛季、三档位购买、自定义任务与奖励。',
      'hero.button': '查看使用文档',
      'feat.h2': '功能特点',
      'feat.1': '多通行证，每个赛季独立配置',
      'feat.2': '普通、高级、豪华三档位独立购买',
      'feat.3': '支持 PlayerPoints 点券与 Vault 金币',
      'feat.4': '任务类型：击杀、挖掘、合成、钓鱼、附魔、酿造、进食、在线时长、登录、自定义',
      'feat.5': '每日、每周、赛季任务周期',
      'feat.6': '奖励类型：指令、物品、CraftEngine 模型、金币、点券',
      'feat.7': 'MySQL 或 SQLite 数据存储',
      'feat.8': 'Redis 跨服同步（可选）',
      'feat.9': 'PlaceholderAPI 变量与 PassAPI 开发接口',
      'footer': 'Liupass — Paper / Leaf 战令插件',
      'docs.h2': '文档',
      'sidebar.readme': '项目说明',
      'sidebar.user': '使用说明总览',
      'sidebar.01': '安装部署',
      'sidebar.02': '主配置',
      'sidebar.03': '通行证',
      'sidebar.04': '任务',
      'sidebar.05': '奖励',
      'sidebar.06': '命令权限',
      'sidebar.07': '开发 API',
      'sidebar.08': '常见问题',
      'notfound.p': '页面不存在或已被移除。',
      'notfound.button': '返回首页',
      'switch.to': 'English'
    }
  };

  function current() {
    return localStorage.getItem(LS_KEY) === 'zh' ? 'zh' : 'en';
  }

  function setLang(lang) {
    localStorage.setItem(LS_KEY, lang === 'zh' ? 'zh' : 'en');
    location.reload();
  }

  function t(key) {
    const d = dict[current()];
    return (d && d[key]) || dict.en[key] || key;
  }

  /** 应用所有 data-i18n 属性并更新语言切换按钮与 <html lang>。 */
  function apply() {
    document.documentElement.lang = current() === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    const btn = document.getElementById('lang-switch');
    if (btn) {
      btn.textContent = t('switch.to');
      btn.setAttribute('aria-label', btn.textContent);
    }
  }

  /** 当前语言下的文档路径：docs/en/xx.md 或 docs/zh/xx.md。 */
  function doc(name) {
    return 'docs/' + current() + '/' + name + '.md';
  }

  function init() {
    document.addEventListener('DOMContentLoaded', function () {
      apply();
      const btn = document.getElementById('lang-switch');
      if (btn) {
        btn.addEventListener('click', function () {
          setLang(current() === 'en' ? 'zh' : 'en');
        });
      }
    });
  }

  return { current: current, setLang: setLang, t: t, apply: apply, doc: doc, init: init };
})();

I18N.init();
