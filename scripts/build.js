#!/usr/bin/env node
/**
 * build.js — 把 posts/*.md 转成 articles/*.html 并更新首页文章列表
 * 用法: node scripts/build.js
 * 依赖: npm install marked gray-matter
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const ARTICLES_DIR = path.join(__dirname, '..', 'articles');
const INDEX_FILE = path.join(__dirname, '..', 'index.html');

// 确保 articles 目录存在
if (!fs.existsSync(ARTICLES_DIR)) fs.mkdirSync(ARTICLES_DIR, { recursive: true });

// 读取所有 markdown 文件
const posts = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md'))
  .map(f => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const { data, content } = matter(raw);
    const slug = f.replace('.md', '');
    const html = marked(content);
    return { ...data, slug, html, filename: f };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`Found ${posts.length} posts`);

// 文章页模板
function articleTemplate(post) {
  const dateStr = new Date(post.date).toISOString().slice(0, 10).replace(/-/g, '.');
  const titleHtml = post.title.replace(/：/g, '：<em>').replace(/$/, '') ;
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" data-lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title} — Lucas Zhuang</title>
<link rel="icon" href="../favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
<style>
:root,[data-theme="light"]{--bg:#faf9f5;--text:#141413;--text-light:#6b6963;--text-ghost:#b0aea5;--border:rgba(20,20,19,0.1);--gold:#d97757;--font-display:'Poppins',Arial,sans-serif;--font-body:'Lora',Georgia,serif}
[data-theme="dark"]{--bg:#0e0e0e;--text:#e8e6dc;--text-light:#8a8880;--text-ghost:#4a4840;--border:rgba(255,255,255,0.08)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:var(--font-body);background:var(--bg);color:var(--text);transition:background 0.5s,color 0.5s}::selection{background:var(--gold);color:#141413}
.top-bar{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:clamp(0.8rem,1.5vh,1.2rem) clamp(1.5rem,3vw,3rem);background:transparent;transition:background 0.3s}ar.scrolled{background:rgba(250,249,245,0.85);backdrop-filter:blur(12px)}[data-theme="dark"] .top-bar.scrolled{background:rgba(14,14,14,0.85)}.top-bar-left a{font-family:var(--font-display);font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;color:var(--text);transition:color 0.3s}.top-bar-left a:hover{color:var(--gold)}.top-bar-right{display:flex;gap:0.8rem}.toggle-btn{font-family:var(--font-display);font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;background:none;border:1.5px solid var(--border);color:var(--text);padding:0.4em 1em;cursor:pointer;transition:all 0.3s;border-radius:0}.toggle-btn:hover{border-color:var(--gold);color:var(--gold)}
.article{max-width:720px;margin:0 auto;padding:clamp(6rem,10vh,8rem) clamp(1.5rem,4vw,2rem) clamp(3rem,6vh,5rem)}.article-meta{font-size:0.6rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-ghost);margin-bottom:1.5rem}.article-meta span{margin-right:1.5rem}.article h1{font-family:var(--font-display);font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:700;line-height:1.2;margin-bottom:2rem}.article h1 em{font-style:italic;color:var(--gold)}.article h2{font-family:var(--font-display);font-size:clamp(1.2rem,2vw,1.6rem);font-weight:600;margin:m 0 1rem;padding-bottom:0.5rem;border-bottom:1px solid var(--border)}.article p{font-size:clamp(0.85rem,1vw,1rem);line-height:2;color:var(--text-light);margin-bottom:1.2rem}.article ul{margin:0 0 1.5rem 1.5rem}.article li{font-size:clamp(0.85rem,1vw,1rem);line-height:2;color:var(--text-light);margin-bottom:0.5rem}.article blockquote{border-left:3px solid var(--gold);padding:1rem 1.5rem;margin:1.5rem 0;background:rgba(217,119,87,0.04);font-style:italic;color:var(--text-light)}.article blockquote p{margin-bottom:0.5rem}.article strong{color:var(--text);font-weight:600}.article img{max-width:100%;height:auto;margin:1.5rem 0;border:1px solid var(--border)}
.footer{display:flex;justify-content:space-between;padding:clamp(2rem,4vh,3rem) clamp(1.5rem,4vw,2rem);font-size:0.6rem;color:var(--text-ghost);letter-spacing:0.1em;border-top:1px solid rgba(20,20,19,0.06);max-width:720px;margin:0 auto}
@media(max-width:768px){.top-bar{padding:0.6rem 1rem}}[data-lang="zh"] .en{display:none}[data-lang="en"] .zh{display:none}
</style>
</head>
<body>
<div class="top-bar" id="topBar">
  <div class="top-bar-left"><a href="../">← Lucas Zhuang</a></div>
  <div class="top-bar-right">
    <button class="toggle-btn" id="langToggle" onclick="toggleLang()">EN</button>
    <button class="toggle-btn" id="themeToggle" onclick="toggleTheme()">☾</button>
  </div>
</div>
<article class="article">
  <div class="article-meta">
    <span>${dateStr}</span>
    <span>${post.source}</span>
  </div>
  <h1>${post.title}</h1>
${post.html}
${post.original ? `  <p style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border)"><a href="${post.original}" target="_blank" style="color:var(--gold);text-decoration:none;font-size:0.85rem">📎 查看原文（含图片） →</a></p>` : ''}
</article>
<div class="footer">
  <span>© 2026 Lucas Zhuang</span>
  <span><a href="../" style="color:var(--text-ghost);text-decoration:none">← Back</a></span>
</div>
<script>
function toggleTheme(){const h=document.documentElement,b=document.getElementById('themeToggle');if(h.dataset.theme==='light'){h.dataset.theme='dark';b.textContent='☀';localStorage.setItem('theme','dark')}else{h.dataset.theme='light';b.textContent='☾';localStorage.setItem('theme','light')}}
function toggleLang(){const h=document.documentElement,b=document.getElementById('langToggle');if(h.dataset.lang==='zh'){h.dataset.lang='en';h.lang='en';b.textContent='中';localStorage.setItem('lang','en')}else{h.dataset.lang='zh';h.lang='zh-CN';b.textContent='EN';localStorage.setItem('lang','zh')}}
(function(){const t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.dataset.theme='dark';document.getElementById('themeToggle').textContent='☀'}const l=localStorage.getItem('lang');if(l==='en'){document.documentElement.dataset.lang='en';document.documentElement.lang='en';document.getElementById('langToggle').textContent='中'}})();
const topBar=document.getElementById('topBar');window.addEventListener('scroll',()=>{topBar.classList.toggle('scrolled',window.scrollY>50)},{passive:true});
</script>
</body>
</html>`;
}

// 生成文章页面
posts.forEach(post => {
  const outPath = path.join(ARTICLES_DIR, `${post.slug}.html`);
  fs.writeFileSync(outPath, articleTemplate(post));
  console.log(`  ✓ articles/${post.slug}.html`);
});

// 更新首页文章列表
let indexHtml = fs.readFileSync(INDEX_FILE, 'utf8');
const listStart = '  <div class="works-editorial">';
const listEnd = '  </div>\n</section>';
const startIdx = indexHtml.indexOf(listStart);
const endIdx = indexHtml.indexOf(listEnd, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find works-editorial section in index.html');
  process.exit(1);
}

const articleRows = posts.map((post, i) => {
  const dateStr = new Date(post.date).toISOString().slice(0, 10).replace(/-/g, '.');
  return `    <a class="work-row reveal stagger-${i + 1}" href="articles/${post.slug}.html" style="text-decoration:none;color:inherit;cursor:pointer">
      <div class="yr">${dateStr}</div>
      <h3><span class="zh">${post.title}</span><span class="en">${post.title_en || post.title}</span></h3>
      <div class="cat"><span class="zh">${(post.source || '').replace(' · ', ' · ')}</span><span class="en">${post.source_en || post.source || ''}</span></div>
    </a>`;
}).join('\n');

const newList = `  <div class="works-editorial">\n${articleRows}\n`;
indexHtml = indexHtml.slice(0, startIdx) + newList + indexHtml.slice(endIdx);
fs.writeFileSync(INDEX_FILE, indexHtml);
console.log(`  ✓ index.html updated with ${posts.length} articles`);
console.log('Done! 🐾');
