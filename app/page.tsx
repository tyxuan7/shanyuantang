import Link from "next/link";

const SERVICES = [
  { href: "/blessing", icon: "lucide-heart", color: "text-vermillion", tag: "心愿寄托", title: "心愿供灯", desc: "点一盏灯，写下一份祝愿。适合生日纪念、平安祝福、学业心愿与日常仪式感表达。" },
  { href: "/almanac", icon: "lucide-calendar-days", color: "text-gold", tag: "每日打卡", title: "今日黄历", desc: "干支宜忌、神煞冲煞、十二时辰，传统择吉一目了然。" },
  { href: "/dream", icon: "lucide-moon", color: "text-gold", tag: "新增", title: "周公解梦", desc: "百梦皆有意，古今相参证。80 余条经典梦境，直接告诉您吉凶。" },
  { href: "/lottery", icon: "lucide-sparkles", color: "text-gold", tag: "传统签谱", title: "传统签谱", desc: "一签一事，100 支签文整理自传统签谱，为当前事项提供一版文化参考。" },
  { href: "/bazi", icon: "lucide-compass", color: "text-gold", tag: "传家技艺", title: "八字精批", desc: "立春节气真排盘，看命格根骨与一生气运起伏。" },
  { href: "/divination", icon: "lucide-scroll-text", color: "text-gold", tag: "周易卦例", title: "周易卦象", desc: "心起一念，三铜起卦，再看本卦、互卦、变卦，为当前事项补一版卦象参考。" },
  { href: "/palmistry", icon: "lucide-hand", color: "text-gold", tag: "图解", title: "手相 / 面相", desc: "上传掌心照或正脸照，围绕图上可见特征逐段分析，先预览再解锁完整详批。" },
  { href: "/naming", icon: "lucide-book-open", color: "text-gold", tag: "传家", title: "宝宝起名", desc: "结合八字喜忌、音韵笔画、典故诗词，给孩子一个耐看的名字。" },
  { href: "/meditation", icon: "lucide-flame", color: "text-gold", tag: "新增", title: "静心禅坐", desc: "钟磬古乐、佛号梵音、深山溪水。日日一坐，让自己慢下来。" },
];

const icons: Record<string, string> = {
  "lucide-heart": '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
  "lucide-calendar-days": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  "lucide-moon": '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  "lucide-sparkles": '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  "lucide-compass": '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
  "lucide-scroll-text": '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  "lucide-hand": '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  "lucide-book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  "lucide-flame": '<path d="M12 2c.7 1.3 2.3 3 3.5 4.5A5 5 0 0 1 12 22a5 5 0 0 1-3.5-15.5C9.7 5 11.3 3.3 12 2z"/>',
  "lucide-share2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[name] || "" }} />
  );
}

function GoldDivider() {
  return <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />;
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      {/* ===== Hero ===== */}
      <section className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-6 px-2 text-center md:min-h-[calc(100vh-3.5rem)]">
        <div className="space-y-5">
          {/* Logo with ring animation */}
          <div className="relative mx-auto flex size-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold shadow-gold">
            <img src="/logo.svg" alt="善缘堂" className="size-14 rounded-full object-contain" />
            <span className="absolute inset-0 rounded-full" style={{border:"1.5px solid rgba(201,160,94,0.6)",animation:"ring-expand 3s ease-out infinite"}}/>
            <span className="absolute inset-0 rounded-full" style={{border:"1.5px solid rgba(201,160,94,0.6)",animation:"ring-expand 3s ease-out infinite 1.5s"}}/>
          </div>

          <h1 className="text-5xl tracking-widest md:text-6xl text-gradient-gold" style={{fontFamily:"var(--font-calligraphy)"}}>善缘堂</h1>
          <p className="mx-auto max-w-md text-base leading-loose text-paper-dark/85 md:text-lg">
            以古籍为根，以真人感解读为用<br/>心愿供灯 · 传统签谱 · 看八字
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:px-0">
          <Link href="/blessing" className="w-full sm:w-auto no-underline">
            <span className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light min-w-[180px] h-12 px-8 w-full text-lg sm:w-auto">
              <Icon name="lucide-heart" className="mr-2 size-5"/>心愿供灯
            </span>
          </Link>
          <Link href="/bazi" className="w-full sm:w-auto no-underline">
            <span className="inline-flex items-center justify-center gap-2 rounded-md font-body font-medium transition-all border border-gold/40 bg-transparent text-gold hover:border-gold/60 hover:bg-gold/10 h-12 px-8 w-full text-lg sm:w-auto">
              大师八字精批
            </span>
          </Link>
        </div>

        <p className="animate-bounce text-sm text-paper-dark/65">向下滚动 · 看更多功德</p>
      </section>

      {/* ===== 九大善门 ===== */}
      <section className="space-y-6 pb-16">
        <h2 className="text-center text-3xl tracking-widest text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>九大善门</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(svc => (
            <Link key={svc.href} href={svc.href} className="no-underline group">
              <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm h-full space-y-3 transition-all hover:border-gold/40 hover:shadow-gold">
                <div className="flex items-center justify-between">
                  <Icon name={svc.icon} className={`size-9 ${svc.color}`} />
                  <span className="rounded-full border border-gold/25 px-2 py-0.5 text-xs text-gold/80">{svc.tag}</span>
                </div>
                <h3 className="text-2xl text-paper-dark" style={{fontFamily:"var(--font-calligraphy)"}}>{svc.title}</h3>
                <p className="text-base text-paper-dark/80">{svc.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== 为何选本站 ===== */}
      <section className="pb-16">
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-5 text-center">
          <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium border-gold/30 bg-gradient-to-r from-gold/20 to-gold/5 text-gold-dark">真排盘 · 古籍为据 · 多风格解读</span>
          <h2 className="text-2xl tracking-widest text-gold md:text-3xl" style={{fontFamily:"var(--font-calligraphy)"}}>为何选本站</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[{t:"古籍为根",d:"解读围绕《渊海子平》《滴天髓》《周易》等经典展开，引文皆有出处。"},{t:"多风格解读",d:"不是模板化套话，而是围绕盘面、流年与问题重点，给你更贴近真人表达的完整判断。"},{t:"心诚为本",d:"网站不替代医疗、法律、投资建议。一切结果，仅作传统文化参考。"}].map((item, i) => (
              <div key={i} className="rounded-lg border border-gold/15 bg-xuan-surface/40 p-4 text-left">
                <p className="font-display text-lg text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{item.t}</p>
                <p className="mt-2 text-sm text-paper-dark/80">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 在线上香 ===== */}
      <section className="pb-16">
        <div className="rounded-t-xl rounded-b-xl border-x-4 border-gold/40 bg-paper-warm px-8 py-6 text-ink shadow-card space-y-4 text-center"
          style={{backgroundColor:"rgb(237,228,212)",color:"#1a1410"}}>
          <GoldDivider/>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto size-10 text-vermillion" aria-hidden="true">
            <path d="M12 2c.7 1.3 2.3 3 3.5 4.5A5 5 0 0 1 12 22a5 5 0 0 1-3.5-15.5C9.7 5 11.3 3.3 12 2z"/>
          </svg>
          <p className="text-sm" style={{color:"rgba(26,20,16,0.6)"}}>每日三礼 · 每礼三炷</p>
          <h2 className="text-2xl tracking-widest md:text-3xl" style={{fontFamily:"var(--font-calligraphy)"}}>在线上香</h2>
          <p className="mx-auto max-w-md text-base leading-loose" style={{color:"rgba(26,20,16,0.8)"}}>静心三礼九炷，为自己、为家人、为众生。把心念安放下来，人也更容易慢慢安定。</p>
          <Link href="/temple"
            className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-[#c41e1e] tracking-wider text-white shadow-lg shadow-red-600/30 hover:bg-[#e03838] h-10 px-5 text-base no-underline">
            敬上一炷清香
          </Link>
          <GoldDivider/>
        </div>
      </section>

      {/* ===== 分享 ===== */}
      <section className="pb-16">
        <div className="rounded-t-xl rounded-b-xl border-x-4 border-gold/40 bg-paper-warm px-8 py-6 text-ink shadow-card space-y-4 text-center"
          style={{backgroundColor:"rgb(237,228,212)",color:"#1a1410"}}>
          <GoldDivider/>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-vermillion/30 bg-vermillion/10">
            <Icon name="lucide-sparkles" className="size-7 text-vermillion"/>
          </div>
          <p className="text-sm tracking-widest" style={{color:"rgba(26,20,16,0.6)"}}>一灯传万灯 · v2</p>
          <h2 className="text-2xl tracking-widest md:text-3xl" style={{fontFamily:"var(--font-calligraphy)"}}>分享给家人 · 一起记录心愿</h2>
          <p className="mx-auto max-w-md text-base leading-loose" style={{color:"rgba(26,20,16,0.8)"}}>发给亲朋好友，让他们也能点一盏灯、求一支签、看一版传统文化参考。<br/>微信、朋友圈、抖音私信都可以分享，把一份温和祝愿传递出去。</p>
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light h-10 px-5 text-base no-underline">
              <Icon name="lucide-share2" className="mr-2 size-4"/>分享返佣 · 赚钱
            </span>
          </div>
          <GoldDivider/>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="space-y-5 border-t border-gold/10 pt-10 text-center text-sm">
        <div className="space-y-3">
          <p className="leading-loose text-gold/80">善念起于心，福缘自然生。一念清净，万物皆宁。</p>
          <p className="leading-loose text-paper-dark/70">菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。</p>
          <p className="leading-loose text-paper-dark/65">命自我立，福自我求。诸恶莫作，众善奉行。</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gold/80">
          <Link href="/terms" className="transition-colors hover:text-gold-light no-underline">用户协议</Link>
          <Link href="/privacy" className="transition-colors hover:text-gold-light no-underline">隐私说明</Link>
          <Link href="/ai-notice" className="transition-colors hover:text-gold-light no-underline">AI 生成说明</Link>
        </div>
        <div className="mx-auto w-12 border-t border-gold/15"/>
        <p className="mx-auto max-w-2xl text-xs leading-6 text-paper-dark/65">本站内容仅作传统文化参考，不替代医疗、法律、投资等专业意见；部分说明由 AI 辅助生成。</p>
        <p className="mx-auto max-w-2xl text-xs leading-6 text-paper-dark/62">继续使用本站或发起服务，即表示您已阅读《用户协议》《隐私说明》《AI 生成说明》；未满18周岁请勿使用本服务。</p>
        <p className="text-xs text-paper-dark/60"><span>善缘堂</span> · 一念慈悲，一灯长明</p>
      </footer>
    </div>
  );
}
