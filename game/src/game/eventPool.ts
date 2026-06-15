import type { GameEvent } from '../types'

// 50+ 随机事件池
export const eventPool: GameEvent[] = [
  // ===== 滑坠·受伤类（高风险） =====
  {
    id: 'evt_slip_slope', title: '滑坠！',
    description: '脚下的碎石突然松动，你整个人向下滑去！你拼命想抓住什么……',
    category: 'crisis', condition: { minDangerLevel: 2 },
    choices: [
      { id: 'evt_slip_a', text: '用登山杖死死撑住', narrative: '你把登山杖深深插入碎石中，身体猛烈地晃了一下……', effects: { stamina: -12 },
        outcomes: [
          { probability: 0.5, narrative: '登山杖卡住了！你悬在坡上，心跳如雷。慢慢把自己拉了回来。', effects: { health: -5 } },
          { probability: 0.5, narrative: '登山杖承受不住折断了！你滑了十几米才被一块大石头挡住，全身剧痛。', effects: { health: -20, stamina: -10 }, loseItems: ['hikingPoles'] },
        ] },
      { id: 'evt_slip_b', text: '试图抓住身边的岩石', narrative: '你伸手去抓旁边的岩石，手指在粗糙的石面上摩擦……', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.35, narrative: '你抓住了！手指被磨得鲜血淋漓，但总算停住了。', effects: { health: -8 } },
          { probability: 0.4, narrative: '没抓稳，你继续下滑，撞到了几块石头。最终在一片草甸上停了下来。', effects: { health: -18, stamina: -15 } },
          { probability: 0.25, narrative: '你滚落了很长一段，背包被甩了出去，食物和水散落一地。', effects: { health: -15, stamina: -10, food: -2, water: -1 } },
        ] },
    ]
  },
  {
    id: 'evt_ankle_twist', title: '扭伤脚踝',
    description: '踩到一块松动的石头，脚踝猛地一歪！钻心的疼痛让你差点叫出声来。',
    category: 'crisis', condition: { terrainTypes: ['石海', '刃脊', '草甸'] },
    choices: [
      { id: 'evt_ankle_a', text: '用绷带固定后继续走（需要急救包）', narrative: '你咬着牙用急救包里的绷带紧紧缠住脚踝，试着走了几步……', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.7, narrative: '绷带起了作用，虽然还是疼，但至少能走了。', effects: { health: -5 }, loseItems: ['firstAidKit'] },
          { probability: 0.3, narrative: '扭伤比想象中严重，即使缠了绷带每一步都很痛苦。', effects: { health: -12, stamina: -8 }, loseItems: ['firstAidKit'] },
        ] },
      { id: 'evt_ankle_b', text: '休息一会儿再慢慢走', narrative: '你坐在地上，等疼痛稍微缓解后，一瘸一拐地继续前进。', effects: { stamina: -10, hydration: -2 },
        outcomes: [
          { probability: 0.5, narrative: '休息后好了一些，但脚踝还是隐隐作痛。', effects: { health: -8 } },
          { probability: 0.5, narrative: '脚踝肿了起来，每走一步都像踩在刀尖上。', effects: { health: -15, stamina: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_rockfall', title: '碎石滚落',
    description: '上方的石海突然传来轰鸣声，碎石如雨点般滚落！',
    category: 'terrain', condition: { terrainTypes: ['石海', '刃脊'], minDangerLevel: 3 },
    choices: [
      { id: 'evt_rockfall_a', text: '迅速躲避到大石后面', narrative: '你猛地扑向一块巨石后面，碎石从两侧飞过。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.6, narrative: '成功躲过了大部分碎石，只是被小块石头砸了一下。', effects: { health: -5 } },
          { probability: 0.4, narrative: '一块较大的碎石砸中了你的肩膀，背包被砸破了一个洞！', effects: { health: -12, stamina: -5, food: -1 } },
        ] },
      { id: 'evt_rockfall_b', text: '快速冲过落石区', narrative: '你压低身体在碎石雨中快速冲过。', effects: { stamina: -12 },
        outcomes: [
          { probability: 0.35, narrative: '你冲过了危险区域，有惊无险！', effects: { luck: 1 } },
          { probability: 0.65, narrative: '被碎石击中，摔倒在乱石堆里，膝盖被划出好几道口子。', effects: { health: -15 } },
        ] },
    ]
  },
  {
    id: 'evt_ridge_wind', title: '刃脊狂风',
    description: '仅容一人通过的刃脊上，狂风突然袭来！两侧是数百米悬崖，你几乎被吹倒！',
    category: 'terrain', condition: { terrainTypes: ['刃脊'], minAltitude: 3000 },
    choices: [
      { id: 'evt_ridge_a', text: '趴下紧贴地面等待', narrative: '你立刻趴在刃脊上，双手紧抓岩石缝隙。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.65, narrative: '几分钟后风势减弱，你小心翼翼地站起来继续前进。', effects: { health: -3 } },
          { probability: 0.35, narrative: '风持续了很久，体温急剧下降，手指开始失去知觉。', effects: { health: -12 } },
        ] },
      { id: 'evt_ridge_b', text: '顶着风强行冲过', narrative: '你弯腰顶着风向前冲，每一步都在和风搏斗。', effects: { stamina: -15 },
        outcomes: [
          { probability: 0.25, narrative: '你冲过了最窄的刃脊段！虽然惊险但安全了。', effects: { luck: 2 } },
          { probability: 0.75, narrative: '一阵更强的风把你吹得踉跄，你差点滑向悬崖边！', effects: { health: -10, stamina: -8 } },
        ] },
    ]
  },
  {
    id: 'evt_bog', title: '沼泽陷阱',
    description: '看似坚实的草甸下隐藏着沼泽，你一脚踩下去，小腿直接陷到了膝盖！',
    category: 'terrain', condition: { terrainTypes: ['草甸'] },
    choices: [
      { id: 'evt_bog_a', text: '慢慢拔出腿', narrative: '你深呼吸，慢慢晃动腿部，一点一点地拔出来。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.55, narrative: '成功拔出了腿，鞋子上沾满了泥但人没事。', effects: {} },
          { probability: 0.45, narrative: '另一只脚也陷了进去！挣扎了好一会儿才脱身，一只鞋丢了。', effects: { health: -5, stamina: -10 } },
        ] },
      { id: 'evt_bog_b', text: '用登山杖借力（需要登山杖）', narrative: '你把登山杖深深插入旁边的硬地，借力把腿拔了出来。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.7, narrative: '登山杖发挥了关键作用，你很快脱身了。', effects: {} },
          { probability: 0.3, narrative: '登山杖在泥中打滑，你摔了个满身泥，背包进水了！', effects: { health: -3, stamina: -5 }, loseItems: ['warmClothes'] },
        ] },
    ]
  },
  {
    id: 'evt_river_cross', title: '冰河横渡',
    description: '湍急的冰川融水挡住了去路，水温接近零度，石头上长满青苔。',
    category: 'terrain', condition: { terrainTypes: ['丛林', '草甸'], minAltitude: 2500 },
    choices: [
      { id: 'evt_river_a', text: '踩着石头跳过去', narrative: '你选择了一排看起来可以落脚的石头。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.45, narrative: '你稳稳地跳过了溪流。', effects: {} },
          { probability: 0.55, narrative: '石头太滑！你的脚踩进了冰水中，刺骨的寒意瞬间传遍全身。', effects: { health: -12, stamina: -8 } },
        ] },
      { id: 'evt_river_b', text: '用绳索保护过河（需要绳索）', narrative: '你把绳索绑在一棵树上，另一头系在腰间，小心翼翼地过河。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.8, narrative: '有了绳索保护，你安全地过了河。', effects: {} },
          { probability: 0.2, narrative: '水流比预想的急，你差点被冲倒，绳索救了你一命。', effects: { health: -5 } },
        ] },
    ]
  },
  {
    id: 'evt_snow_bridge', title: '雪桥',
    description: '前方有一座天然雪桥，横跨在两块岩石之间。这是唯一的捷径，但雪桥看起来不太稳固。',
    category: 'terrain', condition: { minAltitude: 3400, minDangerLevel: 4 },
    choices: [
      { id: 'evt_sbridge_a', text: '冒险通过雪桥', narrative: '你小心翼翼地踏上雪桥，每一步都能听到咯吱声。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.3, narrative: '你成功通过了！', effects: { luck: 2, knowledgePoints: 1 } },
          { probability: 0.7, narrative: '雪桥在你脚下突然塌陷！你拼命抓住对面的岩石，悬在半空中。', effects: { health: -20, stamina: -15 } },
        ] },
      { id: 'evt_sbridge_b', text: '绕路避开', narrative: '你决定不冒这个险，选择绕行。', effects: { stamina: -15, hydration: -3 },
        outcomes: [
          { probability: 0.65, narrative: '绕路虽然辛苦，但安全到达了。', effects: {} },
          { probability: 0.35, narrative: '绕路途中又遇到了一段陡坡，体力消耗巨大。', effects: { health: -5, stamina: -8 } },
        ] },
    ]
  },
  {
    id: 'evt_glacier_crevasse', title: '冰裂缝',
    description: '脚下的雪面突然出现细微裂缝！下方可能是深不见底的冰川裂缝。',
    category: 'crisis', condition: { minAltitude: 3500, minDangerLevel: 4 },
    choices: [
      { id: 'evt_crevasse_a', text: '立刻趴下分散体重', narrative: '你本能地趴在雪面上，慢慢向安全区域挪动。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.6, narrative: '判断正确，雪面没有继续塌陷。你安全挪到了岩石上。', effects: { knowledgePoints: 2 } },
          { probability: 0.4, narrative: '雪面还是塌了一块，你一条腿陷了进去，拼命爬了出来。', effects: { health: -15 } },
        ] },
      { id: 'evt_crevasse_b', text: '快速跑过', narrative: '你决定快速冲过去。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.25, narrative: '你跑过了危险区域！', effects: { luck: 2 } },
          { probability: 0.75, narrative: '跑动中雪面大面积塌陷！你掉了进去，拼命爬了上来，全身被冰棱划伤。', effects: { health: -25, stamina: -15 } },
        ] },
    ]
  },
  {
    id: 'evt_steep_descent', title: '陡坡下降',
    description: '前方是一段近乎垂直的陡坡，大约50米长，必须下降才能继续。没有现成的路。',
    category: 'terrain', condition: { minDangerLevel: 3, minAltitude: 2800 },
    choices: [
      { id: 'evt_descent_a', text: '用绳索缓降（需要绳索）', narrative: '你把绳索绑在上方的一块巨石上，开始缓降。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.75, narrative: '绳索缓降非常顺利，你安全到达了下方。', effects: {} },
          { probability: 0.25, narrative: '下降途中绳索差点断裂！你加快速度滑了下来，手掌被磨破了。', effects: { health: -8 } },
        ] },
      { id: 'evt_descent_b', text: '徒手攀岩下降', narrative: '你没有绳索，只能靠双手和双脚慢慢往下爬。', effects: { stamina: -15 },
        outcomes: [
          { probability: 0.3, narrative: '你凭借出色的攀爬技巧安全下降了！', effects: { luck: 2 } },
          { probability: 0.4, narrative: '中途踩空了一次，幸好抓住了岩缝，但手臂肌肉拉伤了。', effects: { health: -10, stamina: -10 } },
          { probability: 0.3, narrative: '你滑了下去！在碎石坡上滚了十几米，撞得浑身是伤。', effects: { health: -25, stamina: -10 } },
        ] },
    ]
  },

  // ===== 天气·灾害类 =====
  {
    id: 'evt_sudden_storm', title: '暴风雪突袭',
    description: '天空瞬间变暗，暴风雪毫无征兆地袭来！气温骤降，能见度几乎为零。',
    category: 'weather', condition: { minAltitude: 3000 },
    choices: [
      { id: 'evt_storm_a', text: '寻找避风处', narrative: '你四下张望，寻找可以躲避的岩石或凹陷处。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.45, narrative: '你找到了一处岩石凹陷，蜷缩在里面等待暴风雪过去。', effects: { health: -5 } },
          { probability: 0.55, narrative: '附近没有好的避风处，你只能背对风蹲下，身体不断失温。', effects: { health: -18 } },
        ] },
      { id: 'evt_storm_b', text: '扎营等待（需要帐篷）', narrative: '你迅速在风雪中支起帐篷，手指已经冻得不太灵活。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.55, narrative: '帐篷在暴风雪中摇摇欲坠，但总算撑住了。', effects: { health: -3 } },
          { probability: 0.3, narrative: '风太大了，帐篷被撕开了一个口子！你不得不用身体压住。', effects: { health: -10 } },
          { probability: 0.15, narrative: '帐篷被狂风彻底掀翻！你只能抱着背包在雪地里挨冻。帐篷也损坏了。', effects: { health: -20 }, loseItems: ['tent'] },
        ] },
      { id: 'evt_storm_c', text: '冒雪强行前进', narrative: '你决定顶着暴风雪继续走。', effects: { stamina: -20 },
        outcomes: [
          { probability: 0.2, narrative: '你凭借顽强的意志穿过了暴风雪区！', effects: { health: -15, luck: 2 } },
          { probability: 0.8, narrative: '暴风雪太强了，你根本看不清路。体力严重消耗，体温急剧下降。', effects: { health: -25, stamina: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_hail', title: '冰雹袭击',
    description: '鸽子蛋大小的冰雹从天而降，砸在身上生疼！',
    category: 'weather', condition: { minAltitude: 2800 },
    choices: [
      { id: 'evt_hail_a', text: '用背包护住头部蹲下', narrative: '你把背包举过头顶，蹲在原地等待。', effects: { stamina: -3 },
        outcomes: [
          { probability: 0.6, narrative: '冰雹持续了十几分钟就停了。', effects: { health: -3 } },
          { probability: 0.4, narrative: '冰雹越下越大，你的手被砸伤，背包也被砸破了。', effects: { health: -8, food: -1 } },
        ] },
      { id: 'evt_hail_b', text: '跑向最近的岩石躲避', narrative: '你顶着冰雹冲向不远处的大岩石。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.5, narrative: '你在岩石下找到了庇护。', effects: { health: -2 } },
          { probability: 0.5, narrative: '跑的过程中滑倒了，膝盖重重磕在石头上。', effects: { health: -12 } },
        ] },
    ]
  },
  {
    id: 'evt_lightning', title: '雷暴',
    description: '远处传来沉闷的雷声，闪电在山脊上炸开！你暴露在开阔的高地上，非常危险。',
    category: 'weather', condition: { minAltitude: 3000, minDangerLevel: 3 },
    choices: [
      { id: 'evt_light_a', text: '迅速降低高度，远离山脊', narrative: '你赶紧向低处移动。', effects: { stamina: -12 },
        outcomes: [
          { probability: 0.75, narrative: '你及时降低了高度，雷暴从头顶掠过。', effects: { health: -3 } },
          { probability: 0.25, narrative: '下撤途中你踩到了湿滑的石头摔了一跤。', effects: { health: -10 } },
        ] },
      { id: 'evt_light_b', text: '蹲在岩石凹处等待', narrative: '你找了一块大岩石，蹲在旁边的凹陷处，双脚并拢。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.65, narrative: '雷暴持续了半小时后移走了。', effects: {} },
          { probability: 0.35, narrative: '一道闪电击中了附近的岩石，碎石飞溅！你被震得耳鸣了好一会儿。', effects: { health: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_whiteout', title: '白化天',
    description: '四周一片白茫茫，天空和地面融为一体，你完全分不清方向。',
    category: 'weather', condition: { minAltitude: 3200 },
    choices: [
      { id: 'evt_white_a', text: '原地等待', narrative: '你蹲在原地，等待白化天过去。', effects: { stamina: -5, hydration: -3, hunger: -2 },
        outcomes: [
          { probability: 0.45, narrative: '等了一个多小时，视野逐渐恢复。', effects: { health: -5 } },
          { probability: 0.55, narrative: '白化天持续了很久，你的体温在寒风中不断下降。', effects: { health: -15 } },
        ] },
      { id: 'evt_white_b', text: '用GPS导航前进（需要GPS）', narrative: '你掏出GPS，等待信号锁定……', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.65, narrative: 'GPS成功定位，你沿着正确方向走出了白化区。', effects: { knowledgePoints: 1 } },
          { probability: 0.35, narrative: 'GPS信号太弱，你偏离了路线。', effects: { stamina: -10, health: -5 } },
        ] },
      { id: 'evt_white_c', text: '凭直觉前进', narrative: '你凭感觉选了一个方向走……', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.2, narrative: '你的直觉很准，走出了白化区！', effects: { luck: 2 } },
          { probability: 0.8, narrative: '你完全走错了方向，越走越偏。', effects: { health: -10, stamina: -12 } },
        ] },
    ]
  },
  {
    id: 'evt_rain_slip', title: '暴雨湿滑',
    description: '持续大雨让山路极其湿滑，你的衣物已经完全湿透。',
    category: 'weather', condition: { weatherConditions: ['大雨'] },
    choices: [
      { id: 'evt_rain_a', text: '放慢速度小心走', narrative: '每踩一步都先确认稳固。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.55, narrative: '安全走过了湿滑路段。', effects: {} },
          { probability: 0.45, narrative: '还是滑了一跤。', effects: { health: -8 } },
        ] },
      { id: 'evt_rain_b', text: '快速通过', narrative: '你想尽快离开危险区域。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.3, narrative: '快速通过了！', effects: {} },
          { probability: 0.7, narrative: '脚下一滑，重重摔在湿滑的岩石上。', effects: { health: -15 } },
        ] },
    ]
  },

  // ===== 身体·危机类 =====
  {
    id: 'evt_altitude_sickness', title: '高反来袭',
    description: '头痛欲裂，恶心想吐，每走一步都像踩在棉花上。',
    category: 'crisis', condition: { minAltitude: 3400 },
    choices: [
      { id: 'evt_alt_a', text: '立即下撤', narrative: '你知道继续上升只会更危险，决定先下撤。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.6, narrative: '下降几百米后，症状明显缓解。', effects: { health: 8 } },
          { probability: 0.4, narrative: '下撤了一段，但症状没有完全缓解。', effects: { health: 3, stamina: -5 } },
        ] },
      { id: 'evt_alt_b', text: '原地休息适应', narrative: '你找了个避风处坐下，深呼吸。', effects: { stamina: -5, hydration: -3 },
        outcomes: [
          { probability: 0.4, narrative: '休息后症状有所缓解。', effects: { health: 5 } },
          { probability: 0.6, narrative: '症状没有好转，反而加重了。你开始呕吐。', effects: { health: -12, hydration: -5 } },
        ] },
      { id: 'evt_alt_c', text: '咬牙继续', narrative: '你强忍着不适继续走。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.1, narrative: '奇迹般地，你的身体逐渐适应了。', effects: { luck: 2 } },
          { probability: 0.9, narrative: '高反越来越严重，你开始出现幻觉，差点走错方向摔下悬崖。', effects: { health: -20, stamina: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_hypothermia', title: '失温征兆',
    description: '你开始不受控制地发抖，手指僵硬，思维迟钝。失温的早期征兆！',
    category: 'crisis', condition: { maxHealth: 50 },
    choices: [
      { id: 'evt_hypo_a', text: '换干衣服+喝热水', narrative: '你颤抖着换上干衣服，烧了些热水。', effects: { water: -1 },
        outcomes: [
          { probability: 0.55, narrative: '干衣服和热水起了作用，体温开始回升。', effects: { health: 12 } },
          { probability: 0.45, narrative: '有所好转，但手指还是不太灵活。', effects: { health: 5 } },
        ] },
      { id: 'evt_hypo_b', text: '钻进睡袋（需要睡袋）', narrative: '你迅速钻进睡袋，蜷缩起来。', effects: { stamina: -3 },
        outcomes: [
          { probability: 0.7, narrative: '睡袋的保暖效果很好，你逐渐恢复了体温。', effects: { health: 15 } },
          { probability: 0.3, narrative: '睡袋有些潮湿，保暖效果打了折扣。', effects: { health: 8 } },
        ] },
      { id: 'evt_hypo_c', text: '做运动产热', narrative: '你开始原地跳跃。', effects: { stamina: -10, food: -1 },
        outcomes: [
          { probability: 0.35, narrative: '运动让你暖和了一些。', effects: { health: 8 } },
          { probability: 0.65, narrative: '运动消耗了太多体力，你反而更虚弱了。', effects: { health: 3, stamina: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_exhaustion', title: '体力透支',
    description: '双腿像灌了铅一样沉重，每一步都需要极大的意志力。',
    category: 'crisis', condition: { maxHealth: 60 },
    choices: [
      { id: 'evt_exhaust_a', text: '原地休息吃点东西', narrative: '你找了个地方坐下，拿出食物和水。', effects: { food: -1, water: -1 },
        outcomes: [
          { probability: 0.55, narrative: '休息和进食后，你恢复了一些体力。', effects: { stamina: 15, hunger: 10, hydration: 10 } },
          { probability: 0.45, narrative: '食物和水不多了，你不敢多吃。', effects: { stamina: 8 } },
        ] },
      { id: 'evt_exhaust_b', text: '咬牙继续走', narrative: '你不想浪费时间，强撑着继续前进。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.25, narrative: '你硬是走过去了！', effects: { luck: 1 } },
          { probability: 0.75, narrative: '体力严重透支，你眼前一黑差点晕倒。', effects: { health: -15, stamina: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_snowblind', title: '雪盲前兆',
    description: '你的眼睛开始刺痛、流泪，看东西模糊。强烈的紫外线在雪面上反射，灼伤你的角膜。',
    category: 'crisis', condition: { minAltitude: 3200, lacksItem: 'sunglasses' },
    choices: [
      { id: 'evt_snow_a', text: '用布条蒙住眼睛继续走', narrative: '你撕下一块布条，在眼睛上开了条缝。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.55, narrative: '布条起到了一定保护作用。', effects: { health: -3 } },
          { probability: 0.45, narrative: '视线太差，你走偏了路。', effects: { health: -5, stamina: -10 } },
        ] },
      { id: 'evt_snow_b', text: '闭眼休息等天色变暗', narrative: '你找了个地方坐下，闭眼等待。', effects: { stamina: -3, hydration: -2 },
        outcomes: [
          { probability: 0.65, narrative: '休息后眼睛好了一些。', effects: { health: -2 } },
          { probability: 0.35, narrative: '你的眼睛越来越疼。', effects: { health: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_dehydration', title: '严重脱水',
    description: '你已经很久没有喝水了，嘴唇干裂，头晕目眩。',
    category: 'crisis', condition: { maxHealth: 50 },
    choices: [
      { id: 'evt_dehy_a', text: '喝掉最后的水', narrative: '你把水壶里最后的水一饮而尽。', effects: { water: -99, hydration: 20 },
        outcomes: [
          { probability: 0.6, narrative: '水暂时缓解了脱水症状，但你的水壶空了。', effects: { health: 5 } },
          { probability: 0.4, narrative: '不够，远远不够。', effects: {} },
        ] },
      { id: 'evt_dehy_b', text: '收集露水/雪水', narrative: '你用衣物收集草叶上的露水，拧进嘴里。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.5, narrative: '收集到了一些水分。', effects: { hydration: 8, health: 3 } },
          { probability: 0.5, narrative: '露水太少了，几乎没什么用。', effects: { health: -5 } },
        ] },
    ]
  },

  // ===== 装备·损失类 =====
  {
    id: 'evt_tent_broken', title: '帐篷破损',
    description: '长期的风吹日晒让帐篷的防水层开裂了。今晚如果下雨，帐篷可能挡不住水。',
    category: 'crisis', condition: { hasItem: 'tent', minDay: 2 },
    choices: [
      { id: 'evt_tent_a', text: '用绷带修补（牺牲急救包）', narrative: '你用急救包里的绷带勉强修补了破损处。', effects: {},
        outcomes: [
          { probability: 0.65, narrative: '修补效果还不错。', effects: {}, loseItems: ['firstAidKit'] },
          { probability: 0.35, narrative: '修补不太牢固。', effects: {}, loseItems: ['firstAidKit'] },
        ] },
      { id: 'evt_tent_b', text: '不管它，继续用', narrative: '你决定先不管，希望不会下雨。', effects: {},
        outcomes: [
          { probability: 0.35, narrative: '运气不错，接下来几天都没下大雨。', effects: {} },
          { probability: 0.65, narrative: '当晚就下起了雨，帐篷漏水，你被淋透了。', effects: { health: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_pole_break', title: '登山杖断裂',
    description: '你的登山杖在攀爬中突然折断！失去了重要支撑。',
    category: 'crisis', condition: { hasItem: 'hikingPoles' },
    choices: [
      { id: 'evt_pole_a', text: '找树枝替代', narrative: '你在附近找了一根粗壮的树枝。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.45, narrative: '树枝虽然不如登山杖好用，但总比没有强。', effects: {} },
          { probability: 0.55, narrative: '树枝太脆了，走了没多久就断了。', effects: { stamina: -5 } },
        ] },
      { id: 'evt_pole_b', text: '没有也要继续', narrative: '你深吸一口气，继续前进。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.35, narrative: '虽然吃力，但你适应了。', effects: {} },
          { probability: 0.65, narrative: '下坡时没有支撑，你滑了好几次。', effects: { health: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_water_leak', title: '水袋漏水',
    description: '你发现水袋在漏水！已经损失了不少水。',
    category: 'crisis', condition: { minWater: 2 },
    choices: [
      { id: 'evt_wleak_a', text: '赶紧修补', narrative: '你用打火机烤了一下漏水处，勉强封住了。', effects: { water: -1 },
        outcomes: [
          { probability: 0.65, narrative: '修补成功，剩下的水保住了。', effects: {} },
          { probability: 0.35, narrative: '修补不太成功，又漏了一些。', effects: { water: -1 } },
        ] },
      { id: 'evt_wleak_b', text: '赶紧喝掉', narrative: '你把剩下的水赶紧喝掉。', effects: { water: -2, hydration: 10 },
        outcomes: [{ probability: 1, narrative: '虽然浪费了一些，但至少补充了水分。', effects: {} }] },
    ]
  },
  {
    id: 'evt_clothes_wet', title: '衣物湿透',
    description: '持续的雨雪让你的衣物完全湿透，保暖层也失去了作用。如果不处理，失温只是时间问题。',
    category: 'crisis', condition: { hasItem: 'warmClothes' },
    choices: [
      { id: 'evt_clothes_a', text: '停下来拧干+用体温烘干', narrative: '你脱下湿衣服拧干，然后贴身穿着用体温慢慢烘干。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.55, narrative: '衣服半干半湿地穿回去了。', effects: { health: -5 } },
          { probability: 0.45, narrative: '烘干效果不好，你的体温继续下降。', effects: { health: -12 } },
        ] },
      { id: 'evt_clothes_b', text: '继续走，靠运动产热', narrative: '你不想停下来。', effects: { stamina: -10, food: -1 },
        outcomes: [
          { probability: 0.35, narrative: '运动确实让你暖和了。', effects: { health: -5 } },
          { probability: 0.65, narrative: '湿衣服加速了失温，保暖衣物彻底报废。', effects: { health: -15 }, loseItems: ['warmClothes'] },
        ] },
    ]
  },
  {
    id: 'evt_food_dropped', title: '食物滚落',
    description: '你打开背包时，一袋食物从手中滑落，沿着陡坡滚了下去！',
    category: 'crisis', condition: { minDangerLevel: 2 },
    choices: [
      { id: 'evt_fdrop_a', text: '追上去捡回来', narrative: '你沿着陡坡追了下去……', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.35, narrative: '你追上了食物，但消耗了不少体力。', effects: {} },
          { probability: 0.65, narrative: '食物滚到了你够不到的地方，白费了体力。', effects: { food: -1, stamina: -5 } },
        ] },
      { id: 'evt_fdrop_b', text: '算了，不要了', narrative: '你看着食物滚远，叹了口气。', effects: { food: -1 },
        outcomes: [{ probability: 1, narrative: '少了一份食物。', effects: {} }] },
    ]
  },
  {
    id: 'evt_backpack_rip', title: '背包撕裂',
    description: '你的背包在攀爬中被岩石划了一道大口子！东西随时可能掉出来。',
    category: 'crisis', condition: { minDangerLevel: 3 },
    choices: [
      { id: 'evt_bpack_a', text: '用绳索绑住（需要绳索）', narrative: '你用绳索把撕裂的地方绑紧了。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.7, narrative: '虽然不好看，但东西不会再掉了。', effects: {} },
          { probability: 0.3, narrative: '绑得不太牢，走了一段时间又松了。', effects: { food: -1 } },
        ] },
      { id: 'evt_bpack_b', text: '把重要东西转移到前面', narrative: '你把食物和水放到衣服口袋里。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.6, narrative: '重新分配了负重，东西安全了。', effects: {} },
          { probability: 0.4, narrative: '转移过程中掉了一袋食物。', effects: { food: -1 } },
        ] },
    ]
  },

  // ===== 扎营·风险类 =====
  {
    id: 'evt_camp_wind', title: '夜间狂风',
    description: '半夜里狂风大作，帐篷被吹得剧烈摇晃！固定绳索在风中发出尖锐的声音。',
    category: 'crisis', condition: { hasItem: 'tent', minAltitude: 3000 },
    choices: [
      { id: 'evt_cwind_a', text: '出去加固帐篷', narrative: '你顶着风出去重新固定绳索。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.55, narrative: '你成功加固了帐篷。', effects: { health: -5 } },
          { probability: 0.45, narrative: '风太大了，一根帐篷杆被吹断了！帐篷损坏。', effects: { health: -12 }, loseItems: ['tent'] },
        ] },
      { id: 'evt_cwind_b', text: '待在帐篷里用身体压住', narrative: '你用身体压住帐篷内侧，祈祷风能停。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.45, narrative: '风渐渐小了，帐篷虽然歪了但没倒。', effects: { health: -3 } },
          { probability: 0.55, narrative: '帐篷被掀翻了一个角，冷风灌了进来。', effects: { health: -10, stamina: -5 } },
        ] },
    ]
  },
  {
    id: 'evt_camp_animal', title: '夜间访客',
    description: '你被一阵窸窣声惊醒。有什么东西在帐篷外面翻你的背包！食物的气味引来了野生动物。',
    category: 'crisis', condition: { hasItem: 'tent' },
    choices: [
      { id: 'evt_canimal_a', text: '大声喊叫驱赶', narrative: '你大声喊叫，同时敲打帐篷壁。', effects: {},
        outcomes: [
          { probability: 0.55, narrative: '动物被吓跑了，但食物被翻得乱七八糟。', effects: { food: -1 } },
          { probability: 0.45, narrative: '动物没被吓跑，反而撕破了你的背包！食物丢了不少。', effects: { food: -2, health: -3 } },
        ] },
      { id: 'evt_canimal_b', text: '悄悄等待它离开', narrative: '你屏住呼吸，一动不动地躺着。', effects: {},
        outcomes: [
          { probability: 0.45, narrative: '动物翻了一会儿就走了。', effects: { food: -1 } },
          { probability: 0.35, narrative: '动物把你的食物袋叼走了！', effects: { food: -2 } },
          { probability: 0.2, narrative: '动物撕开了帐篷钻了进来！你拼命把它赶了出去。', effects: { health: -5, food: -1 } },
        ] },
    ]
  },
  {
    id: 'evt_camp_flood', title: '营地进水',
    description: '你醒来发现帐篷底部已经开始渗水！你扎营的位置比想象中低。',
    category: 'crisis', condition: { hasItem: 'tent' },
    choices: [
      { id: 'evt_cflood_a', text: '赶紧转移营地', narrative: '你在雨中拆了帐篷，搬到了更高的地方。', effects: { stamina: -12 },
        outcomes: [
          { probability: 0.55, narrative: '虽然折腾了一番，但新营地干燥多了。', effects: { health: -3 } },
          { probability: 0.45, narrative: '搬家的过程中睡袋被淋湿了！', effects: { health: -8 }, loseItems: ['sleepingBag'] },
        ] },
      { id: 'evt_cflood_b', text: '用衣物堵住进水处', narrative: '你用备用的衣物塞住帐篷底部的缝隙。', effects: {},
        outcomes: [
          { probability: 0.45, narrative: '堵住了大部分进水。', effects: { health: -3 } },
          { probability: 0.55, narrative: '水越渗越多，你的睡袋还是湿了。', effects: { health: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_snow_camp', title: '雪地扎营',
    description: '周围全是积雪，你必须在这里扎营。但雪地扎营有很多风险。',
    category: 'crisis', condition: { hasItem: 'tent', minAltitude: 3400 },
    choices: [
      { id: 'evt_snowcamp_a', text: '踩实雪地后扎营', narrative: '你用力踩实了一块雪地，然后支起帐篷。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.6, narrative: '营地还算稳固，你安全过了一夜。', effects: {} },
          { probability: 0.4, narrative: '半夜雪地开始融化下陷，帐篷歪了。', effects: { health: -8, stamina: -5 } },
        ] },
      { id: 'evt_snowcamp_b', text: '挖雪洞过夜', narrative: '你决定挖一个雪洞，比帐篷更保暖。', effects: { stamina: -15 },
        outcomes: [
          { probability: 0.5, narrative: '雪洞挖得不错，里面比外面暖和多了。', effects: { health: 5 } },
          { probability: 0.3, narrative: '雪洞勉强能用。', effects: {} },
          { probability: 0.2, narrative: '雪洞塌了！你被埋了一半。', effects: { health: -15, stamina: -10 } },
        ] },
    ]
  },

  // ===== 发现·补给类 =====
  {
    id: 'evt_discover_cache', title: '发现补给包',
    description: '在一块大石头后面，你发现了一个用塑料袋包裹的补给包！前人留下的。',
    category: 'discovery', condition: { minAltitude: 2800, minDangerLevel: 2 },
    choices: [
      { id: 'evt_cache_a', text: '全部取走', narrative: '里面有一些食物和水，还有一张纸条：「祝你好运」。', effects: { food: 2, water: 2 },
        outcomes: [
          { probability: 0.75, narrative: '补给品还在保质期内。', effects: { hunger: 5, hydration: 5 } },
          { probability: 0.25, narrative: '有些食物变质了，但水还能喝。', effects: { water: 1 } },
        ] },
      { id: 'evt_cache_b', text: '只取一半，留给后来人', narrative: '你取了一半，在纸条背面写上感谢。', effects: { food: 1, water: 1 },
        outcomes: [{ probability: 1, narrative: '善有善报。', effects: { luck: 2 } }] },
    ]
  },
  {
    id: 'evt_discover_abandoned', title: '废弃营地',
    description: '一个被遗弃的营地，帐篷破烂不堪，地上散落着装备。',
    category: 'discovery', condition: { minAltitude: 3000, minDangerLevel: 3 },
    choices: [
      { id: 'evt_abandon_a', text: '搜索装备', narrative: '你在废墟中翻找。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.2, narrative: '找到了一个还能用的头灯！', effects: {}, gainItems: { headlamp: true } },
          { probability: 0.25, narrative: '找到了一包压缩饼干。', effects: { food: 2 } },
          { probability: 0.25, narrative: '找到了半瓶水和一条绳索。', effects: { water: 1 }, gainItems: { rope: true } },
          { probability: 0.3, narrative: '大部分东西都坏了，只找到半瓶水。', effects: { water: 1 } },
        ] },
      { id: 'evt_abandon_b', text: '查看后离开', narrative: '你环顾四周，心中不安。', effects: { knowledgePoints: 2 },
        outcomes: [{ probability: 1, narrative: '地上有个笔记本，最后一页写着：「天气变了，我们迷路了……」', effects: { knowledgePoints: 1 } }] },
    ]
  },
  {
    id: 'evt_water_source', title: '发现水源',
    description: '你听到了水声！循声找去，发现了一处清澈的山泉。',
    category: 'discovery', condition: { terrainTypes: ['丛林', '草甸'] },
    choices: [
      { id: 'evt_wsource_a', text: '补充全部水量', narrative: '你用容器接满了水，洗了把脸。', effects: { water: 3, hydration: 15 },
        outcomes: [
          { probability: 0.75, narrative: '甘甜的山泉水，难得的享受。', effects: { stamina: 5 } },
          { probability: 0.25, narrative: '水矿物质含量高，肚子有点不舒服。', effects: { health: -3 } },
        ] },
      { id: 'evt_wsource_b', text: '简单补水后继续', narrative: '时间紧迫。', effects: { water: 1, hydration: 8 },
        outcomes: [{ probability: 1, narrative: '继续赶路。', effects: {} }] },
    ]
  },
  {
    id: 'evt_found_rope', title: '遗落的绳索',
    description: '路边灌木上挂着一条登山绳索，看起来还能用。',
    category: 'discovery', condition: { lacksItem: 'rope', minAltitude: 2800 },
    choices: [
      { id: 'evt_frope_a', text: '收好绳索', narrative: '你检查了绳索强度，收进了背包。', effects: {}, outcomes: [{ probability: 1, narrative: '关键时刻可能救命。', effects: {}, gainItems: { rope: true } }] },
      { id: 'evt_frope_b', text: '不拿', narrative: '不想增加负重。', effects: {}, outcomes: [{ probability: 1, narrative: '轻装前进。', effects: {} }] },
    ]
  },
  {
    id: 'evt_found_sunglasses', title: '遗落的墨镜',
    description: '你在石缝中发现了一副墨镜，镜片完好。在高海拔雪地上这可是救命装备！',
    category: 'discovery', condition: { lacksItem: 'sunglasses', minAltitude: 3000 },
    choices: [
      { id: 'evt_fsun_a', text: '戴上墨镜', narrative: '你戴上墨镜，眼前的雪地不再刺眼了。', effects: {}, outcomes: [{ probability: 1, narrative: '防雪盲，太重要了。', effects: {}, gainItems: { sunglasses: true } }] },
      { id: 'evt_fsun_b', text: '不戴', narrative: '你不需要。', effects: {}, outcomes: [{ probability: 1, narrative: '继续赶路。', effects: {} }] },
    ]
  },
  {
    id: 'evt_found_gps', title: '遗落的GPS',
    description: '你在路边的石头上发现了一个GPS设备，还有电！',
    category: 'discovery', condition: { lacksItem: 'gps', minAltitude: 3000, minDangerLevel: 3 },
    choices: [
      { id: 'evt_fgps_a', text: '收好GPS', narrative: '你把GPS装进背包。', effects: {}, outcomes: [{ probability: 1, narrative: '迷路时这东西能救命。', effects: {}, gainItems: { gps: true } }] },
      { id: 'evt_fgps_b', text: '不拿', narrative: '你已经有方向感了。', effects: {}, outcomes: [{ probability: 1, narrative: '继续赶路。', effects: {} }] },
    ]
  },
  {
    id: 'evt_herbs', title: '高山草药',
    description: '路边生长着一些草药，可能缓解高反。',
    category: 'discovery', condition: { terrainTypes: ['草甸', '丛林'], minAltitude: 2800 },
    choices: [
      { id: 'evt_herbs_a', text: '采摘服用', narrative: '你采了一些草药。', effects: { stamina: -3 },
        outcomes: [
          { probability: 0.45, narrative: '草药有效，症状缓解了。', effects: { health: 8 } },
          { probability: 0.35, narrative: '效果不太明显。', effects: { health: 3 } },
          { probability: 0.2, narrative: '你采错了，吃下去后肚子疼。', effects: { health: -8 } },
        ] },
      { id: 'evt_herbs_b', text: '不冒险', narrative: '不敢乱吃。', effects: {}, outcomes: [{ probability: 1, narrative: '安全的选择。', effects: {} }] },
    ]
  },
  {
    id: 'evt_wild_fruit', title: '野果',
    description: '路边的灌木上结满了红色的野果，看起来很诱人。',
    category: 'discovery', condition: { terrainTypes: ['丛林', '草甸'] },
    choices: [
      { id: 'evt_wfruit_a', text: '采摘食用', narrative: '你摘了一些野果。', effects: { hunger: 5 },
        outcomes: [
          { probability: 0.5, narrative: '野果酸甜可口。', effects: { food: 1 } },
          { probability: 0.3, narrative: '味道一般，但能充饥。', effects: {} },
          { probability: 0.2, narrative: '吃了之后肚子不舒服。', effects: { health: -8 } },
        ] },
      { id: 'evt_wfruit_b', text: '不冒险', narrative: '你不确定是否有毒。', effects: {}, outcomes: [{ probability: 1, narrative: '安全第一。', effects: {} }] },
    ]
  },

  // ===== 遭遇类 =====
  {
    id: 'evt_encounter_hiker', title: '偶遇徒步者',
    description: '前方走来一个经验丰富的徒步者，他停下来和你打招呼。',
    category: 'encounter', condition: { maxDay: 3 },
    choices: [
      { id: 'evt_ehiker_a', text: '请教路况', narrative: '他告诉你前方的情况。', effects: { knowledgePoints: 3 },
        outcomes: [
          { probability: 0.55, narrative: '他的信息很有用！', effects: { luck: 1 } },
          { probability: 0.45, narrative: '他说的路况和你遇到的不太一样。', effects: { knowledgePoints: 1 } },
        ] },
      { id: 'evt_ehiker_b', text: '交换物资', narrative: '你们互相检查了物资储备。', effects: {},
        outcomes: [
          { probability: 0.5, narrative: '他用两份食物换了你一份水。', effects: { food: 2, water: -1 } },
          { probability: 0.5, narrative: '他给了你一些巧克力。', effects: { food: 1, hunger: 10 } },
        ] },
    ]
  },
  {
    id: 'evt_encounter_rescue', title: '救援队经过',
    description: '你遇到了一支搜救队，正在寻找失踪的徒步者。',
    category: 'encounter', condition: { minDay: 2, minAltitude: 3000 },
    choices: [
      { id: 'evt_erescue_a', text: '加入搜救', narrative: '你决定帮忙搜寻。', effects: { stamina: -15, hydration: -5, hunger: -3 },
        outcomes: [
          { probability: 0.25, narrative: '你发现了线索。', effects: { knowledgePoints: 5, luck: 2 } },
          { probability: 0.75, narrative: '搜救了几个小时，没有发现。', effects: { knowledgePoints: 2 } },
        ] },
      { id: 'evt_erescue_b', text: '提供信息后继续', narrative: '你告诉他们你没看到任何人。', effects: { knowledgePoints: 1 },
        outcomes: [{ probability: 1, narrative: '继续赶路。', effects: {} }] },
    ]
  },
  {
    id: 'evt_animal_encounter', title: '野生动物',
    description: '灌木丛中传来一阵骚动，一只体型不小的野生动物出现在你面前！',
    category: 'encounter', condition: { terrainTypes: ['丛林', '草甸'] },
    choices: [
      { id: 'evt_eanimal_a', text: '慢慢后退', narrative: '你慢慢后退，不敢直视它的眼睛。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.7, narrative: '动物看了你一眼，转身走了。', effects: {} },
          { probability: 0.3, narrative: '动物朝你冲了过来！你拼命跑，摔了一跤。', effects: { health: -10 } },
        ] },
      { id: 'evt_eanimal_b', text: '大声驱赶', narrative: '你大声喊叫，挥舞登山杖。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.6, narrative: '动物被吓跑了。', effects: {} },
          { probability: 0.4, narrative: '动物没被吓跑，反而更凶了！你赶紧绕路。', effects: { stamina: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_lost_trail', title: '迷路了',
    description: '路标消失了，你不确定该往哪个方向走。四周看起来都一样。',
    category: 'crisis', condition: { minDangerLevel: 2 },
    choices: [
      { id: 'evt_lost_a', text: '原路返回找路标', narrative: '你决定往回走，重新找到正确的路。', effects: { stamina: -12 },
        outcomes: [
          { probability: 0.6, narrative: '你找到了路标，重新上了正轨。', effects: {} },
          { probability: 0.4, narrative: '走了很远也没找到路标，体力消耗巨大。', effects: { health: -5, stamina: -8 } },
        ] },
      { id: 'evt_lost_b', text: '凭记忆继续走', narrative: '你凭记忆选了一个方向。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.3, narrative: '你走对了！', effects: { luck: 1 } },
          { probability: 0.7, narrative: '你走错了，越走越偏。', effects: { health: -8, stamina: -10 } },
        ] },
      { id: 'evt_lost_c', text: '用GPS定位（需要GPS）', narrative: '你掏出GPS查看位置。', effects: { stamina: -3 },
        outcomes: [
          { probability: 0.8, narrative: 'GPS帮你找到了正确的方向。', effects: { knowledgePoints: 1 } },
          { probability: 0.2, narrative: 'GPS信号不好，但大致方向是对的。', effects: {} },
        ] },
    ]
  },
  {
    id: 'evt_fog_road', title: '浓雾笼罩',
    description: '浓雾突然升起，能见度降到不足5米。你只能看到脚下。',
    category: 'weather', condition: { minAltitude: 2500 },
    choices: [
      { id: 'evt_fog_a', text: '原地等待雾散', narrative: '你蹲在原地等待。', effects: { stamina: -3, hydration: -2 },
        outcomes: [
          { probability: 0.5, narrative: '雾渐渐散了。', effects: {} },
          { probability: 0.5, narrative: '雾持续了很久，你开始失温。', effects: { health: -8 } },
        ] },
      { id: 'evt_fog_b', text: '缓慢摸索前进', narrative: '你小心翼翼地往前走。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.4, narrative: '你安全走出了雾区。', effects: {} },
          { probability: 0.6, narrative: '你走偏了路，还差点踩空。', effects: { health: -10 } },
        ] },
    ]
  },
  {
    id: 'evt_sunburn', title: '严重晒伤',
    description: '高海拔的紫外线极其强烈，你暴露的皮肤被严重晒伤，红肿疼痛。',
    category: 'crisis', condition: { minAltitude: 3000, lacksItem: 'sunglasses' },
    choices: [
      { id: 'evt_sunburn_a', text: '用衣物遮盖暴露部位', narrative: '你用多余的衣物裹住头和手臂。', effects: { stamina: -3 },
        outcomes: [
          { probability: 0.6, narrative: '遮盖后好了一些。', effects: { health: -3 } },
          { probability: 0.4, narrative: '已经晒伤了，疼痛难忍。', effects: { health: -8 } },
        ] },
      { id: 'evt_sunburn_b', text: '不管它继续走', narrative: '你咬牙继续。', effects: {},
        outcomes: [
          { probability: 0.3, narrative: '皮肤虽然疼但还能忍受。', effects: { health: -5 } },
          { probability: 0.7, narrative: '晒伤越来越严重，皮肤开始起水泡。', effects: { health: -12 } },
        ] },
    ]
  },
  {
    id: 'evt_camp_cold', title: '寒夜难眠',
    description: '帐篷外的温度降到了零下十几度，即使裹着睡袋也冷得发抖。',
    category: 'crisis', condition: { hasItem: 'tent', minAltitude: 3200 },
    choices: [
      { id: 'evt_ccold_a', text: '把所有衣物都穿上', narrative: '你把所有能穿的都套在身上。', effects: {},
        outcomes: [
          { probability: 0.55, narrative: '暖和了一些，勉强睡着了。', effects: { health: -3 } },
          { probability: 0.45, narrative: '还是太冷了，一夜没睡好。', effects: { health: -8, stamina: -5 } },
        ] },
      { id: 'evt_ccold_b', text: '做些简单运动保暖', narrative: '你在帐篷里做了一些拉伸。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.4, narrative: '运动后暖和了一些。', effects: { health: -3 } },
          { probability: 0.6, narrative: '帐篷里空间太小，运动效果不好。', effects: { health: -8 } },
        ] },
    ]
  },
  {
    id: 'evt_cairn', title: '玛尼堆',
    description: '路边有一座小小的玛尼堆，前人留下的路标和祈福。上面还压着一张纸条。',
    category: 'discovery', condition: { minAltitude: 3000 },
    choices: [
      { id: 'evt_cairn_a', text: '阅读纸条', narrative: '纸条上写着前方路况提醒。', effects: { knowledgePoints: 3 },
        outcomes: [
          { probability: 0.6, narrative: '信息很有用！前方有一段危险刃脊。', effects: { luck: 1 } },
          { probability: 0.4, narrative: '纸条已经模糊不清了。', effects: { knowledgePoints: 1 } },
        ] },
      { id: 'evt_cairn_b', text: '添一块石头祈福', narrative: '你捡了一块石头放在玛尼堆上。', effects: { stamina: -2 },
        outcomes: [{ probability: 1, narrative: '愿山神保佑。', effects: { luck: 1 } }] },
    ]
  },
  {
    id: 'evt_shelter', title: '岩洞避风',
    description: '你发现了一个天然岩洞，可以暂时避风休息。地上有一些前人留下的痕迹。',
    category: 'discovery', condition: { minAltitude: 2800, minDangerLevel: 3 },
    choices: [
      { id: 'evt_shelter_a', text: '进去休息一会儿', narrative: '你在岩洞里坐下，吃点东西。', effects: { food: -1, water: -1 },
        outcomes: [
          { probability: 0.55, narrative: '休息后体力恢复了不少。', effects: { stamina: 15, hunger: 10, hydration: 10 } },
          { probability: 0.35, narrative: '岩洞里发现了一瓶被遗忘的水！', effects: { water: 1, stamina: 10 } },
          { probability: 0.1, narrative: '岩洞里有蛇！你被吓了一跳，赶紧退了出来。', effects: { health: -5 } },
        ] },
      { id: 'evt_shelter_b', text: '只是短暂躲避', narrative: '你在洞口站了一会儿。', effects: { stamina: 5 },
        outcomes: [{ probability: 1, narrative: '避了避风，继续赶路。', effects: {} }] },
    ]
  },
  {
    id: 'evt_frostbite', title: '冻伤征兆',
    description: '你的手指和脚趾开始发白、失去知觉。这是冻伤的早期征兆！',
    category: 'crisis', condition: { maxHealth: 40 },
    choices: [
      { id: 'evt_frost_a', text: '用体温缓慢复温', narrative: '你把手放在腋下，把脚抱在胸前。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.5, narrative: '缓慢复温有效，知觉逐渐恢复。', effects: { health: 8 } },
          { probability: 0.5, narrative: '复温过程中疼痛难忍，但总算保住了。', effects: { health: 3 } },
        ] },
      { id: 'evt_frost_b', text: '用雪搓（错误方法）', narrative: '你用雪搓冻伤部位。', effects: {},
        outcomes: [
          { probability: 0.2, narrative: '虽然方法不对，但运气好没出大问题。', effects: { health: -3 } },
          { probability: 0.8, narrative: '用雪搓加重了冻伤！组织损伤更严重了。', effects: { health: -15 } },
        ] },
    ]
  },
  {
    id: 'evt_avalanche_near', title: '雪崩！',
    description: '远处传来轰隆声，一场雪崩正在发生！虽然不在你正上方，但气浪和飞雪正向你袭来。',
    category: 'crisis', condition: { minAltitude: 3400, minDangerLevel: 4 },
    choices: [
      { id: 'evt_aval_a', text: '躲到岩石后面', narrative: '你扑向最近的大岩石。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.6, narrative: '岩石挡住了大部分气浪和飞雪。', effects: { health: -5 } },
          { probability: 0.4, narrative: '飞雪还是把你埋了半截，你拼命挖了出来。', effects: { health: -12, stamina: -8 } },
        ] },
      { id: 'evt_aval_b', text: '横向跑出雪崩路径', narrative: '你拼命向侧面跑。', effects: { stamina: -15 },
        outcomes: [
          { probability: 0.4, narrative: '你跑出了雪崩范围！', effects: { luck: 2 } },
          { probability: 0.6, narrative: '气浪把你掀翻了。', effects: { health: -15 } },
        ] },
    ]
  },
  {
    id: 'evt_mudslide', title: '泥石流',
    description: '暴雨之后，山坡上突然涌下一股泥石流！泥浆裹挟着碎石向你的方向冲来。',
    category: 'crisis', condition: { weatherConditions: ['大雨'], minDangerLevel: 2 },
    choices: [
      { id: 'evt_mud_a', text: '迅速向两侧高处跑', narrative: '你拼命向侧面高处跑。', effects: { stamina: -12 },
        outcomes: [
          { probability: 0.5, narrative: '你跑到了安全地带。', effects: {} },
          { probability: 0.5, narrative: '泥浆还是溅到了你，装备被糊了一层泥。', effects: { health: -5, stamina: -5 } },
        ] },
      { id: 'evt_mud_b', text: '爬上大石头', narrative: '你爬上了路边的一块大石头。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.6, narrative: '泥石流从石头两侧流过。', effects: {} },
          { probability: 0.4, narrative: '泥浆漫上了石头，你的鞋被冲走了。', effects: { health: -8 } },
        ] },
    ]
  },
  {
    id: 'evt_night_walk', title: '天黑迷路',
    description: '天色已暗，你还没找到合适的扎营点。继续走还是就地扎营？',
    category: 'crisis', condition: { minHour: 18 },
    choices: [
      { id: 'evt_night_a', text: '打头灯继续走（需要头灯）', narrative: '你打开头灯，在黑暗中摸索前进。', effects: { stamina: -10 },
        outcomes: [
          { probability: 0.4, narrative: '你找到了一个不错的扎营点。', effects: {} },
          { probability: 0.6, narrative: '黑暗中你踩空了，摔了一跤。', effects: { health: -10 } },
        ] },
      { id: 'evt_night_b', text: '就地扎营（需要帐篷）', narrative: '你决定不再冒险，就地扎营。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.5, narrative: '虽然位置不理想，但至少安全了。', effects: { health: -3 } },
          { probability: 0.5, narrative: '扎营位置太差，半夜被冷风吹醒。', effects: { health: -8 } },
        ] },
    ]
  },
  {
    id: 'evt_old_marker', title: '路标指示',
    description: '路边有一个褪色的路标，指向两个不同的方向。一个标注"捷径"，一个标注"安全路线"。',
    category: 'discovery', condition: { minAltitude: 2800, minDangerLevel: 2 },
    choices: [
      { id: 'evt_marker_a', text: '走捷径', narrative: '你选择了捷径。', effects: { stamina: -5 },
        outcomes: [
          { probability: 0.35, narrative: '捷径确实更近！节省了不少体力。', effects: { stamina: 10, luck: 1 } },
          { probability: 0.65, narrative: '捷径已经坍塌了！你不得不原路返回。', effects: { stamina: -15, health: -5 } },
        ] },
      { id: 'evt_marker_b', text: '走安全路线', narrative: '你选择了安全路线。', effects: { stamina: -8 },
        outcomes: [
          { probability: 0.7, narrative: '安全路线虽然远一些，但路况不错。', effects: {} },
          { probability: 0.3, narrative: '安全路线也不太安全，有一段塌方。', effects: { health: -5 } },
        ] },
    ]
  },
]