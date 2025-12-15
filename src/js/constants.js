// --- 游戏定义库 ---
const GAMES = [
    {
        id: 'datematch',
        name: '心动清单',
        icon: '💖',
        color: 'bg-pink-100 text-pink-600',
        desc: '探索彼此都想做的浪漫小事'
    },
    {
        id: 'musicbox',
        name: '双人乐章',
        icon: '🎹',
        color: 'bg-indigo-100 text-indigo-600',
        desc: '不论相隔多远，共奏一曲'
    },
    {
        id: 'touchsync',
        name: '指尖感应',
        icon: '👆',
        color: 'bg-orange-100 text-orange-600',
        desc: '寻找对方在屏幕上的指尖'
    },
    {
        id: 'telepathy',
        name: '默契大考验',
        icon: '🧠',
        color: 'bg-blue-100 text-blue-600',
        desc: '心有灵犀，选出相同答案'
    },
    {
        id: 'clickwar',
        name: '爱心填充',
        icon: '❤️',
        color: 'bg-red-100 text-red-600',
        desc: '手速比拼，填满这颗爱心'
    },
    {
        id: 'drawing',
        name: '灵魂画手',
        icon: '🎨',
        color: 'bg-purple-100 text-purple-600',
        desc: '你画我猜，实时同步画布'
    },
    {
        id: 'tictactoe',
        name: '爱的连线',
        icon: '⭕',
        color: 'bg-teal-100 text-teal-600',
        desc: '简单的井字棋休闲时光'
    },
    {
        id: 'reaction',
        name: '心动反应',
        icon: '⚡',
        color: 'bg-yellow-100 text-yellow-600',
        desc: '测测谁看到对方心跳更快'
    },
    {
        id: 'poison',
        name: '水果大作战',
        icon: '🍎',
        color: 'bg-green-100 text-green-600',
        desc: '经典的心理博弈小游戏'
    },
    {
        id: 'memory',
        name: '记忆翻牌',
        icon: '🧩',
        color: 'bg-cyan-100 text-cyan-600',
        desc: '找出相同的Emoji配对'
    }
];

// 甜蜜互动建议（替代惩罚）
const SWEET_ACTIONS = [
    "给对方发一张现在的自拍", "语音说一声'我爱你'", "下次见面要拥抱一分钟", 
    "夸夸对方今天的发型/穿搭", "为对方唱两句喜欢的歌", "分享一件最近开心的小事",
    "答应陪对方去做一件小事", "给对方点一杯奶茶/咖啡", "深情对视视频通话10秒"
];

// 应用状态常量
const SCREENS = {
    CONNECT: 'connect',
    LOBBY: 'lobby',
    GAME: 'game'
};