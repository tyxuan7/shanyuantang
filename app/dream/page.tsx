"use client";

import { useState } from "react";
import PayModal from "@/components/PayModal";

const CATEGORIES = [
  { id:"人物", label:"人物", icon:"👥" },
  { id:"身体", label:"身体", icon:"🫀" },
  { id:"动物", label:"动物", icon:"🐎" },
  { id:"植物", label:"植物", icon:"🌿" },
  { id:"天象", label:"天象自然", icon:"🌤" },
  { id:"物品", label:"物品", icon:"📿" },
  { id:"房舍", label:"房舍宅院", icon:"🏠" },
  { id:"生死", label:"生死婚丧", icon:"🕯" },
  { id:"行为", label:"行为", icon:"🚶" },
  { id:"鬼神", label:"鬼神宗教", icon:"🙏" },
  { id:"财运", label:"财运钱帛", icon:"💰" },
];

interface DreamItem { title:string; level:string; desc:string; }
const DREAM_DATA: Record<string, DreamItem[]> = {
  "人物": [
    { title:"梦见贵人", level:"上上", desc:"事业上将遇贵人扶持，或得到上级器重与提拔。" },
    { title:"梦见父母", level:"上吉", desc:"近期家中诸事顺遂，家人安康。已故父母则为思念所致。" },
    { title:"梦见孩子", level:"中吉", desc:"象征新的开始与希望。怀孕者主胎气稳固，未孕者主喜事将至。" },
    { title:"梦见已故亲人", level:"上吉", desc:"多为思念所致，亦为先祖庇佑之兆。亡者面色和悦则家中将逢喜事。" },
    { title:"梦见亲戚", level:"中吉", desc:"近期可能有久未联系之亲戚相聚，彼此应多走动。" },
    { title:"梦见陌生人", level:"中平", desc:"生活中将有新缘分到来，可能是贵人或新友，需明辨善恶。" },
    { title:"梦见僧人", level:"上吉", desc:"心灵将得开悟，迷茫之事将有指引。虔诚信佛者之吉兆。" },
    { title:"梦见老人", level:"中吉", desc:"象征智慧与经验。若老人为长辈，主家中长辈健康长寿。" },
    { title:"梦见婴儿", level:"上吉", desc:"新生、希望与纯真。事业将有新起点，或家中有添丁之喜。" },
    { title:"梦见敌人", level:"中平", desc:"现实中可能面临竞争，但梦提示你将克服困难。" },
    { title:"梦见老师", level:"中吉", desc:"近期需要学习新知识，或有良师益友即将出现。" },
    { title:"梦见医生", level:"中平", desc:"身体或心理需要关注，也主将有贵人相助度过难关。" },
  ],
  "身体": [
    { title:"梦见头发", level:"中平", desc:"白发主长寿智慧；脱发反为烦恼脱落、轻装前行之意。" },
    { title:"梦见掉牙", level:"中平", desc:"传统认为主长辈安康。现代解为压力释放，不必过虑。" },
    { title:"梦见眼睛", level:"中吉", desc:"对事物有新洞察。视物不清则提示当下判断需谨慎。" },
    { title:"梦见流血", level:"上吉", desc:"鲜血在解梦学中反主财运将至，大量流血更佳。" },
    { title:"梦见手", level:"中吉", desc:"手主能力与掌控。手受伤提示需注意合作关系的边界。" },
    { title:"梦见脚", level:"中平", desc:"脚主根基与前程。步履稳健则事业稳，受伤则需审慎。" },
    { title:"梦见脸", level:"中平", desc:"主自我形象。脸变美则自信增强，变丑则需反思内省。" },
    { title:"梦见怀孕", level:"上吉", desc:"不限于字面，主创意、计划将孕育成形，新阶段开始。" },
  ],
  "动物": [
    { title:"梦见龙", level:"上上", desc:"大吉大利之兆，事业腾飞、贵人提携、声名鹊起。" },
    { title:"梦见蛇", level:"中吉", desc:"蛇为小龙，主财运和智慧。不伤你则财运至，被咬则贵人相助。" },
    { title:"梦见鱼", level:"大吉", desc:"鱼谐音'余'，富贵有余。鱼在水中游主事业顺，抓到则好消息至。" },
    { title:"梦见狗", level:"中吉", desc:"狗为忠诚之兆，主朋友可靠、社交顺利。凶狗则需防范小人。" },
    { title:"梦见猫", level:"中平", desc:"猫性独立，需注意身边是否有口是心非之人。" },
    { title:"梦见马", level:"上吉", desc:"马到成功之意。白马主贵人来助，黑马主事业突破。" },
    { title:"梦见鸟", level:"中吉", desc:"飞鸟主自由与消息。群鸟齐飞表示好消息将至。" },
    { title:"梦见虎", level:"中平", desc:"虎主权威与挑战。面对困难将得到力量，但需谨慎行事。" },
    { title:"梦见蜘蛛", level:"中吉", desc:"蜘蛛织网主财运，网越大财越多。亦主耐心与坚持。" },
    { title:"梦见老鼠", level:"中平", desc:"需注意身边是否有小人或财务上的小损失。" },
  ],
  "植物": [
    { title:"梦见花开", level:"上吉", desc:"花主喜庆，感情运旺，单身者可能遇良缘。" },
    { title:"梦见树", level:"中吉", desc:"树主根基与成长。大树枝繁叶茂，事业根基稳固。" },
    { title:"梦见果实", level:"上吉", desc:"劳动即将收获回报，投资和努力将见成果。" },
    { title:"梦见草", level:"中平", desc:"平凡中见生机，近期生活平稳，宜脚踏实地。" },
    { title:"梦见竹子", level:"上吉", desc:"竹节节高，主事业步步高升、学业进步。" },
    { title:"梦见莲花", level:"上上", desc:"出淤泥而不染，主心性清净、事业高雅、福报深厚。" },
  ],
  "天象": [
    { title:"梦见太阳", level:"上上", desc:"光明正大，事业如日中天，一切阴暗将消散。" },
    { title:"梦见月亮", level:"中吉", desc:"月主感情，圆月主团圆美满，缺月则需耐心等候。" },
    { title:"梦见星星", level:"上吉", desc:"心愿将如繁星点点陆续实现。流星则主许愿良机。" },
    { title:"梦见下雨", level:"中平", desc:"雨水主财运和情感滋润。细雨为吉，暴雨则需防冲动。" },
    { title:"梦见打雷", level:"中平", desc:"雷声主警醒，家中或工作将有突发变化，需提前准备。" },
    { title:"梦见彩虹", level:"上吉", desc:"雨后彩虹，困难将过去，好运将至。感情运极佳。" },
    { title:"梦见下雪", level:"中吉", desc:"瑞雪兆丰年，主纯洁与新的开始。冬日梦雪尤吉。" },
  ],
  "物品": [
    { title:"梦见镜子", level:"中平", desc:"镜子主自省，需审视自己的内心和外在表现。" },
    { title:"梦见钱", level:"上吉", desc:"财运亨通，可能会有意外之财或投资回报。" },
    { title:"梦见书", level:"上吉", desc:"书主智慧，学业有成，或近期需要学习新技能。" },
    { title:"梦见钥匙", level:"上吉", desc:"难题将被解开，将有开启新局面的机会。" },
    { title:"梦见刀剑", level:"中平", desc:"刀剑锋利，主果决。用得好则斩断烦恼，不好则伤及无辜。" },
    { title:"梦见钟表", level:"中平", desc:"时间意识增强，提醒你珍惜当下，莫错失良机。" },
    { title:"梦见衣服", level:"中吉", desc:"衣主外表和身份。新衣主新角色，破衣则需注意形象。" },
  ],
  "房舍": [
    { title:"梦见房子", level:"中吉", desc:"房子主家庭和自我。大房子主事业扩展，老房子主怀旧。" },
    { title:"梦见搬家", level:"中平", desc:"生活将有变动，可能是好的变化，需适应新环境。" },
    { title:"梦见门窗", level:"中吉", desc:"机会之门即将打开。窗明几净主前景光明。" },
    { title:"梦见厨房", level:"中吉", desc:"厨房主财运和家庭温暖，梦见做饭尤为吉祥。" },
    { title:"梦见卧室", level:"中平", desc:"卧室主私密空间，需注意个人情感和隐私保护。" },
    { title:"梦见寺庙", level:"上吉", desc:"心灵寻求安宁，将得到精神指引或贵人相助。" },
  ],
  "生死": [
    { title:"梦见自己死了", level:"上上", desc:"梦中死亡是'重生'的象征，旧的告一段落，新的将启。莫怕。" },
    { title:"梦见葬礼", level:"中平", desc:"旧的阶段结束，新的开始。与其害怕不如迎接变化。" },
    { title:"梦见棺材", level:"上吉", desc:"反梦见官运财运，'见棺发财'是传统吉兆。" },
    { title:"梦见婚礼", level:"中吉", desc:"喜事将至，不仅限于婚嫁，事业合作亦吉。" },
    { title:"梦见哭泣", level:"中平", desc:"反梦，现实中将有开心事发生。亦为压力释放。" },
    { title:"梦见坟墓", level:"中平", desc:"主结束与埋葬，过去的烦恼将被放下。新生活开始。" },
  ],
  "行为": [
    { title:"梦见飞", level:"上吉", desc:"事业学业将有突破和提升，内心渴望自由与超越。" },
    { title:"梦见被追赶", level:"中平", desc:"正逃避某事或承受压力。建议正视问题，勇敢面对。" },
    { title:"梦见掉下去", level:"中平", desc:"对现状的不安或失去控制感。醒来后宜深呼吸放松。" },
    { title:"梦见考试", level:"中平", desc:"反映近期压力，也暗示生活正考验你的能力。" },
    { title:"梦见游泳", level:"中吉", desc:"水主情感，游泳自如则感情顺遂，逆水则需坚持。" },
    { title:"梦见唱歌", level:"上吉", desc:"心情愉悦，近期将有开心事发生，人际关系和谐。" },
  ],
  "鬼神": [
    { title:"梦见佛菩萨", level:"上上", desc:"大吉大利，得佛光普照、菩萨加持。近期运势极佳。" },
    { title:"梦见鬼", level:"中平", desc:"心中有恐惧或未解决的烦恼。宜多行善事、诵经回向。" },
    { title:"梦见神仙", level:"上吉", desc:"有贵人暗中相助，困境将解。亦主健康良好。" },
    { title:"梦见烧香", level:"上吉", desc:"心诚则灵，祈求之事有望实现。宜保持虔诚之心。" },
    { title:"梦见念经", level:"上吉", desc:"心灵将得安宁，烦恼将逐步消散。宜坚持修行。" },
  ],
  "财运": [
    { title:"梦见捡钱", level:"上吉", desc:"财运将至，可能有意外之财或新的收入来源。" },
    { title:"梦见金元宝", level:"上上", desc:"大财将至，传统解梦中最喜见之梦境，主富贵双全。" },
    { title:"梦见金银", level:"上吉", desc:"财运亨通，投资理财将有回报。宜稳健不贪。" },
    { title:"梦见丢钱", level:"中平", desc:"不是真丢财，反主消灾避祸。破财免灾之意。" },
    { title:"梦见钱包", level:"中吉", desc:"钱包鼓则财运好。空钱包则需合理规划支出。" },
  ],
};

export default function DreamPage() {
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [pendingDream, setPendingDream] = useState("");

  const handleInterpret = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    const localFound = (activeCat?DREAM_DATA[activeCat]:null)?.find(d=>d.title===text) || Object.values(DREAM_DATA).flat().find(d=>d.title===text);
    try {
      const res = await fetch("/api/divine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"dream",data:{dream:text}})});
      const d = await res.json();
      if (d.result) { setResult(d.result); setLoading(false); return; }
    } catch {}
    if (localFound) {
      setResult(`【${localFound.title}·${localFound.level}】\n\n${localFound.desc}\n\n此梦提示保持平和心态，日常可多行善事积累福报。福生无量天尊。`);
    } else {
      setResult(`【关于"${text}"的解析】\n\n此梦在周公解梦传统中属于心有所思之梦。梦境是潜意识的反映，建议结合最近的生活状态来理解。\n\n此梦提醒你关注内心真实想法。心静则梦安，心安则事顺。福生无量天尊。`);
    }
    setLoading(false);
  };

  const handleCategory = (catId: string) => {
    if (activeCat === catId) { setActiveCat(null); return; }
    setActiveCat(catId);
    setResult(null);
  };

  const catName = CATEGORIES.find(c=>c.id===activeCat)?.label;
  const catDreams = activeCat ? DREAM_DATA[activeCat] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-24" style={{marginTop:"3.5rem"}}>
      <section className="space-y-3 pt-6 text-center">
        <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-gold">
            <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
          </svg>
        </div>
        <h1 className="font-display text-4xl tracking-widest text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>周公解梦</h1>
        <p className="text-base text-paper-dark/85">百梦皆有意 · 古今相参证</p>
      </section>

      {/* 搜索 */}
      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3">
        <p className="text-base text-paper-dark/85">请描述您梦中所见</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={dream} onChange={e=>setDream(e.target.value)} maxLength={100}
            placeholder="如:梦见龙、梦见牙齿掉了"
            className="rounded-md border border-gold/20 bg-xuan-surface px-3 text-paper-dark placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 h-12 w-full text-base sm:flex-1"
            onKeyDown={e=>e.key==="Enter"&&handleInterpret(dream)}/>
          <button onClick={()=>{setPendingDream(dream);setShowPay(true);}} disabled={loading}
            className="inline-flex items-center justify-center gap-2 font-body font-medium transition-all rounded-lg bg-vermillion tracking-wider text-white shadow-lg shadow-vermillion/20 hover:bg-vermillion-light min-w-[180px] px-5 text-base h-12 whitespace-nowrap disabled:opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 size-4"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
            {loading?"解梦中...":"解梦"}
          </button>
        </div>
      </div>

      {/* 解梦结果 */}
      {result && (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm animate-slide-up">
          <h3 className="text-gold text-lg mb-3" style={{fontFamily:"var(--font-calligraphy)"}}>📖 解梦结果</h3>
          <p className="text-sm text-paper-dark leading-relaxed whitespace-pre-wrap">{result}</p>
          <button onClick={()=>setResult(null)} className="mt-4 text-xs text-paper-muted hover:text-gold">关闭 →</button>
        </div>
      )}

      {/* 按类查梦 */}
      <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3">
        <h2 className="font-display text-xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>按类查梦</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>handleCategory(c.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                activeCat===c.id?"border-gold/60 bg-gold/10 text-gold":"border-gold/20 text-paper-dark/85 hover:border-gold/40"
              }`}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 分类梦境列表 或 热门梦境 */}
      {catDreams ? (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>
              <span>{CATEGORIES.find(c=>c.id===activeCat)?.icon}</span>{catName}类梦境
            </h2>
            <button onClick={()=>setActiveCat(null)} className="text-xs text-paper-muted hover:text-gold">← 返回热门</button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {catDreams.map((d,i)=>(
              <button key={i} onClick={()=>handleInterpret(d.title)}
                className={`rounded-lg border p-3 text-left transition-colors hover:border-gold/60 ${
                  d.level==="上上"?"border-vermillion/40 bg-vermillion/10":
                  d.level==="大吉"?"border-vermillion/40 bg-vermillion/10":
                  d.level==="上吉"?"border-vermillion/30 bg-vermillion/5":
                  d.level==="中吉"?"border-gold/40 bg-gold/10":
                  "border-gold/20 bg-xuan-surface/50"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{d.title}</span>
                  <span className={`text-sm ${d.level==="上上"||d.level==="大吉"||d.level==="上吉"?"text-vermillion-light":d.level==="中吉"?"text-gold":"text-paper"}`}>{d.level}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-paper-dark/75">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gold/20 bg-xuan-card/95 p-card-pad shadow-paper backdrop-blur-sm space-y-3">
          <h2 className="flex items-center gap-2 font-display text-xl text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>
            </svg>热门梦境
          </h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {(Object.values(DREAM_DATA).flat().slice(0,12)).map((d,i)=>(
              <button key={i} onClick={()=>handleInterpret(d.title)}
                className={`rounded-lg border p-3 text-left transition-colors hover:border-gold/60 ${
                  d.level==="上上"?"border-vermillion/40 bg-vermillion/10":
                  d.level==="大吉"?"border-vermillion/40 bg-vermillion/10":
                  d.level==="上吉"?"border-vermillion/30 bg-vermillion/5":
                  d.level==="中吉"?"border-gold/40 bg-gold/10":
                  "border-gold/20 bg-xuan-surface/50"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-base text-gold" style={{fontFamily:"var(--font-calligraphy)"}}>{d.title}</span>
                  <span className={`text-sm ${d.level==="上上"||d.level==="大吉"||d.level==="上吉"?"text-vermillion-light":d.level==="中吉"?"text-gold":"text-paper"}`}>{d.level}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-paper-dark/75">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
