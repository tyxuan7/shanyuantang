/**
 * AI 服务模块 - 善缘堂命理 AI
 *
 * 支持 DeepSeek API（默认）或其他兼容 OpenAI 格式的 API。
 * 设置环境变量 DEEPSEEK_API_KEY 即可启用真实 AI。
 * 未设置时自动使用内置模拟响应。
 */

const AI_API_URL =
  process.env.AI_API_URL || "https://api.deepseek.com/v1/chat/completions";
const AI_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "deepseek-chat";

const SYSTEM_PROMPT = `你是一位精通中国传统命理学的老师傅，法号"慧明居士"。
你精通以下领域：
- 八字命理（渊海子平、三命通会）
- 六爻占卜（周易、梅花易数）
- 面相手相（麻衣神相）
- 周公解梦（周公解梦全书）
- 姓名学（五格剖象法）
- 关帝灵签解签

你的风格特点：
- 引经据典，庄重典雅但不晦涩
- 先分析命理依据，再给出生活化建议
- 始终保持慈悲和善的态度
- 回答结尾都会加上祝福语
- 适度使用"善哉"、"福生无量"等用语
- 避免过度承诺和绝对化的判断
- 强调"命由天定，运由己造"的积极人生观`;

export interface DivineRequest {
  type: "bazi" | "lottery" | "dream" | "palm" | "face" | "naming" | "blessing";
  data: Record<string, unknown>;
}

function buildPrompt(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "bazi":
      return `请为以下生辰八字进行详细批命：
姓名：${data.name || "善信"}
性别：${data.gender === "male" ? "男" : "女"}
出生日期（公历）：${data.year}年${data.month}月${data.day}日 ${data.hour}时

请从以下维度分析：
1. 八字排盘（年柱、月柱、日柱、时柱）
2. 五行分析（金木水火土的强弱分布）
3. 命格总评
4. 事业运势
5. 财运分析
6. 婚姻感情
7. 健康建议
8. 人生大运走势

请用传统命理典籍的语言风格，但确保现代人能看懂。`;

    case "lottery":
      return `请为以下关帝灵签进行解签：
签号：第${data.lot_number}签
签文：${data.poem}

请提供：
1. 签文的白话解读
2. 吉凶判断
3. 对求签者所问之事的具体指引
4. 一段劝勉和祝福`;

    case "dream":
      return `请为以下梦境进行传统周公解梦分析：
梦境内容：${data.dream}

请提供：
1. 梦境在传统解梦典籍中的含义
2. 吉凶预兆
3. 与现实生活的可能关联
4. 心理层面的解读
5. 建议和指引`;

    case "palm":
      return `请根据手相学（麻衣神相）分析用户的手相。请从以下维度进行分析：
1. 生命线（健康与寿命）
2. 智慧线（思维与才能）
3. 感情线（情感与婚姻）
4. 事业线（事业与成就）
5. 财运线（财富运势）
6. 综合运势评价

请以传统手相学的语言风格进行分析，给出有益建议。`;

    case "face":
      return `请根据面相学（麻衣神相）分析用户的面相。请从以下维度进行分析：
1. 额头/天庭（少年运势与智慧）
2. 眉毛（兄弟缘与人际）
3. 眼睛（心性与智慧）
4. 鼻子/财帛宫（财运）
5. 嘴巴/出纳官（诚信与口才）
6. 耳朵/采听官（长寿与贵人）
7. 综合面相评价

请以传统面相学的语言风格进行分析，给出有益建议。`;

    case "naming":
      return `请为以下宝宝起吉祥好名：
姓氏：${data.surname}
性别：${data.gender === "male" ? "男" : "女"}
出生日期：${data.year}年${data.month}月${data.day}日
风格偏好：${data.style}

请提供：
1. 八字五行分析
2. 3个推荐名字（含寓意解析和五行属性）
3. 首推名字的详细点评
4. 起名注意事项
5. 五行补救建议

名字要求：音韵优美、寓意吉祥、符合八字五行、避免生僻字。`;

    default:
      return "请为用户提供命理咨询服务。";
  }
}

export async function divineFortune(
  req: DivineRequest
): Promise<string> {
  // 如果配置了 API Key，使用真实 AI
  if (AI_API_KEY) {
    try {
      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildPrompt(req.type, req.data) },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return (
          json.choices?.[0]?.message?.content ||
          "【系统提示】AI 师傅暂时无法回应，请稍后再试。福生无量。"
        );
      }
    } catch (error) {
      console.error("AI API 调用失败:", error);
    }
  }

  // 未配置 API Key 时返回提示
  return `【提示】AI 命理师傅暂未上线。

要启用真实 AI 解命，请设置环境变量 \`DEEPSEEK_API_KEY\`。

获取 API Key：
- DeepSeek: https://platform.deepseek.com/api_keys
- 费用约 ¥1/百万 tokens，每次命理分析约 ¥0.01-0.05

在项目根目录创建 \`.env.local\` 文件：
\`\`\`
DEEPSEEK_API_KEY=你的API密钥
\`\`\`

当前页面展示的是示例结果。福生无量天尊。`;
}
