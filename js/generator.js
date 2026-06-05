import { createRNG } from './rng.js';
import { POOLS } from './i18n.js';

// All possible evidence items grouped by app
const EVIDENCE_POOL = {
  instagram: [
    { id: 'ig_dm_unknown', type: 'real' },
    { id: 'ig_tagged_wrong_place', type: 'real' },
    { id: 'ig_story_view', type: 'real' },
    { id: 'ig_likes_cluster', type: 'real' },
    { id: 'ig_follow_private', type: 'real' },
    { id: 'ig_comment_flirty', type: 'real' },
    { id: 'ig_search_history', type: 'real' },
    { id: 'ig_blocked_account', type: 'real' },
    { id: 'ig_dm_surprise', type: 'redHerring' },
    { id: 'ig_old_convo', type: 'redHerring' },
    { id: 'ig_business_dm', type: 'redHerring' },
    { id: 'ig_reel_save', type: 'redHerring' },
  ],
  whatsapp: [
    { id: 'wa_contact_alias', type: 'real' },
    { id: 'wa_deleted_msgs', type: 'real' },
    { id: 'wa_miss_you', type: 'real' },
    { id: 'wa_location_shared', type: 'real' },
    { id: 'wa_emoji_heavy', type: 'real' },
    { id: 'wa_voice_note_unknown', type: 'real' },
    { id: 'wa_sister', type: 'redHerring' },
    { id: 'wa_work_group', type: 'redHerring' },
    { id: 'wa_old_ex', type: 'redHerring' },
  ],
  revolut: [
    { id: 'rv_dinner_2', type: 'real' },
    { id: 'rv_hotel', type: 'real' },
    { id: 'rv_flowers', type: 'real' },
    { id: 'rv_gift', type: 'real' },
    { id: 'rv_airbnb', type: 'real' },
    { id: 'rv_lingerie', type: 'real' },
    { id: 'rv_cash_withdrawals', type: 'real' },
    { id: 'rv_uber_unknown', type: 'real' },
    { id: 'rv_birthday_flowers', type: 'redHerring' },
    { id: 'rv_biz_trip', type: 'redHerring' },
    { id: 'rv_couple_restaurant', type: 'redHerring' },
    { id: 'rv_parents_gift', type: 'redHerring' },
  ],
  twitter: [
    { id: 'tw_liked_flirty', type: 'real' },
    { id: 'tw_follow_private', type: 'real' },
    { id: 'tw_reply_heart', type: 'real' },
    { id: 'tw_alibi_break', type: 'real' },
    { id: 'tw_dm_notif', type: 'real' },
    { id: 'tw_list', type: 'real' },
    { id: 'tw_retweet_relatable', type: 'redHerring' },
    { id: 'tw_mutual_follows', type: 'redHerring' },
    { id: 'tw_old_tweet', type: 'redHerring' },
  ],
  maps: [
    { id: 'gm_wrong_home', type: 'real' },
    { id: 'gm_restaurant_saved', type: 'real' },
    { id: 'gm_hotel_search', type: 'real' },
    { id: 'gm_frequent_unknown', type: 'real' },
    { id: 'gm_alibi_route', type: 'real' },
    { id: 'gm_shared_location', type: 'real' },
    { id: 'gm_parents_home', type: 'redHerring' },
    { id: 'gm_work_route', type: 'redHerring' },
    { id: 'gm_gym', type: 'redHerring' },
  ],
  gallery: [
    { id: 'gal_photo_unknown_girl', type: 'real' },
    { id: 'gal_hotel_room', type: 'real' },
    { id: 'gal_gift_unwrapped', type: 'real' },
    { id: 'gal_screenshot_convo', type: 'real' },
    { id: 'gal_deleted_bin', type: 'real' },
    { id: 'gal_sister_photo', type: 'redHerring' },
    { id: 'gal_surprise_photo', type: 'redHerring' },
    { id: 'gal_old_photo', type: 'redHerring' },
    { id: 'gal_work_event', type: 'redHerring' },
  ],
  messages: [
    { id: 'wa_miss_you', type: 'real' },   // SMS version
    { id: 'wa_location_shared', type: 'real' }, // SMS version
  ],
  calendar: [
    { id: 'cal_fake_alibi', type: 'real' },
  ],
  notes: [
    { id: 'notes_suspicious', type: 'real' },
    { id: 'notes_locked', type: 'real' },
  ],
};

// Deduplicated flat pool for cross-app evidence selection
const ALL_REAL = Object.values(EVIDENCE_POOL).flat().filter(e => e.type === 'real').reduce((acc, e) => {
  if (!acc.find(x => x.id === e.id)) acc.push(e);
  return acc;
}, []);

const ALL_HERRING = Object.values(EVIDENCE_POOL).flat().filter(e => e.type === 'redHerring').reduce((acc, e) => {
  if (!acc.find(x => x.id === e.id)) acc.push(e);
  return acc;
}, []);

const AVATAR_COLORS = ['#FF6B9D','#C77DFF','#74C0FC','#69DB7C','#FFD43B','#FF8CC8','#845EF7','#FFA94D','#63E6BE'];

function generateUsername(rng, name, pools) {
  const base = name.toLowerCase().replace(/[áàäâ]/g,'a').replace(/[éèëê]/g,'e').replace(/[íìïî]/g,'i').replace(/[óòöô]/g,'o').replace(/[úùüû]/g,'u').replace(/[^a-z]/g,'');
  const suffix = rng.pick(pools.usernameSuffixes);
  return base + suffix;
}

function selectEvidence(rng, outcome) {
  const shuffledReal = rng.shuffle([...ALL_REAL]);
  const shuffledHerring = rng.shuffle([...ALL_HERRING]);

  const realCount = outcome === 'guilty' ? rng.nextInt(5, 7) : 0;
  const herringCount = rng.nextInt(3, 4);

  const realEvidenceIds = shuffledReal.slice(0, realCount).map(e => e.id);
  const herringIds = shuffledHerring.slice(0, herringCount).map(e => e.id);

  return { realEvidenceIds, redHerringIds: herringIds };
}

function generateAppContent(rng, lang, pools, ctx) {
  const { suspect, girlfriend, secretContact, outcome, realEvidenceIds, redHerringIds, secretRestaurant, hotelName, secretAddress, gymName, monthsCheating } = ctx;

  // Helper: create a base item
  function item(id, evidenceId, extra) {
    return { id, evidenceId, ...extra };
  }

  // Key date — the single day all suspicious events cluster on for cross-referencing
  const keyDay = rng.nextInt(8, 22);
  const _mi = new Date().getMonth();
  const _abbrEs = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][_mi];
  const _abbrEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][_mi];
  const keyDateStr = `${keyDay} ${lang === 'es' ? _abbrEs : _abbrEn}`;
  const _fullEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][_mi];
  const _fullEn = ['January','February','March','April','May','June','July','August','September','October','November','December'][_mi];
  const keyDateLabel = lang === 'es' ? `el ${keyDay} de ${_fullEs}` : `${_fullEn} ${keyDay}`;

  // ── INSTAGRAM ──────────────────────────────────────────────────────────────
  const igItems = [];
  let igIdx = 0;

  // Varied suspect filler posts (pick 2 from a larger pool)
  const suspectPostPool = lang === 'es' ? [
    { caption: 'Buenas vibras 🌅', imageEmoji: '🌅', imageColor: '#87CEEB' },
    { caption: `Con los chicos 🍻`, imageEmoji: '🍻', imageColor: '#4682B4' },
    { caption: 'Finde perfecto ⚽', imageEmoji: '⚽', imageColor: '#4CAF50' },
    { caption: 'Tarde de sol ☀️', imageEmoji: '🌅', imageColor: '#FFD700' },
    { caption: 'Nada como casa 🏠', imageEmoji: '🌳', imageColor: '#90EE90' },
    { caption: 'Volando alto ✈️', imageEmoji: '🌅', imageColor: '#87CEEB' },
  ] : [
    { caption: 'Good vibes only 🌅', imageEmoji: '🌅', imageColor: '#87CEEB' },
    { caption: 'Lads night 🍻', imageEmoji: '🍻', imageColor: '#4682B4' },
    { caption: 'Weekend football ⚽', imageEmoji: '⚽', imageColor: '#4CAF50' },
    { caption: 'Sunny day ☀️', imageEmoji: '🌅', imageColor: '#FFD700' },
    { caption: 'Nothing like home 🏠', imageEmoji: '🌳', imageColor: '#90EE90' },
    { caption: 'Up in the air ✈️', imageEmoji: '🌅', imageColor: '#87CEEB' },
  ];
  const shuffledPosts = rng.shuffle([...suspectPostPool]);
  for (let pi = 0; pi < 2; pi++) {
    const p = shuffledPosts[pi];
    igItems.push(item(`ig_f${igIdx++}`, null, {
      subtype: 'feed_post',
      username: suspect.username,
      avatarColor: suspect.avatarColor,
      caption: p.caption,
      likes: rng.nextInt(15, 320),
      timeAgo: `${rng.nextInt(1, 7)}d`,
      imageColor: p.imageColor,
      imageEmoji: p.imageEmoji,
    }));
  }

  // Posts from OTHER accounts in the feed (makes it feel like a real feed)
  const otherAccounts = lang === 'es' ? [
    { username: 'futbol_diario', color: '#2E86AB', caption: '¡Qué golazo! ⚽🔥', imageEmoji: '⚽', likes: rng.nextInt(1200, 45000) },
    { username: 'recetas_fit', color: '#4CAF50', caption: 'Ensalada mediterránea 🥗 Receta en el link 🍋', imageEmoji: '🍕', likes: rng.nextInt(800, 8000) },
    { username: 'viajes_top', color: '#FF6B9D', caption: 'Cuando viajas sin planear... 🌊🏖️', imageEmoji: '🌊', likes: rng.nextInt(5000, 120000) },
    { username: 'humor_español', color: '#FFD43B', caption: 'Un lunes más... 😅☕', imageEmoji: '🌅', likes: rng.nextInt(3000, 50000) },
  ] : [
    { username: 'dailyfootball', color: '#2E86AB', caption: 'What a goal ⚽🔥', imageEmoji: '⚽', likes: rng.nextInt(1200, 45000) },
    { username: 'fitrecipes_uk', color: '#4CAF50', caption: 'Mediterranean salad 🥗 Recipe in bio 🍋', imageEmoji: '🍕', likes: rng.nextInt(800, 8000) },
    { username: 'traveltop', color: '#FF6B9D', caption: 'When you travel without a plan... 🌊🏖️', imageEmoji: '🌊', likes: rng.nextInt(5000, 120000) },
    { username: 'britishmemes', color: '#FFD43B', caption: 'Monday again... 😅☕', imageEmoji: '🌅', likes: rng.nextInt(3000, 50000) },
  ];
  // Pick 2 random other accounts
  const pickedOthers = rng.shuffle([...otherAccounts]).slice(0, 2);
  for (const acc of pickedOthers) {
    igItems.push(item(`ig_f${igIdx++}`, null, {
      subtype: 'feed_post',
      username: acc.username,
      avatarColor: acc.color,
      caption: acc.caption,
      likes: acc.likes,
      timeAgo: `${rng.nextInt(1, 4)}h`,
      imageColor: '#87CEEB',
      imageEmoji: acc.imageEmoji,
    }));
  }

  // Girlfriend's own post in the feed
  igItems.push(item(`ig_f${igIdx++}`, null, {
    subtype: 'feed_post',
    username: girlfriend.username,
    avatarColor: girlfriend.avatarColor,
    caption: lang === 'es' ? 'Feliz 🌸✨' : 'Happy 🌸✨',
    likes: rng.nextInt(40, 400),
    timeAgo: `${rng.nextInt(2, 8)}d`,
    imageColor: '#FFB6C1',
    imageEmoji: '🌸',
  }));

  // DM from girlfriend
  igItems.push(item(`ig_f${igIdx++}`, null, {
    subtype: 'dm_thread',
    username: girlfriend.username,
    avatarColor: girlfriend.avatarColor,
    preview: lang === 'es' ? 'Te quiero mucho 😘' : 'Love you so much 😘',
    messages: [
      { from: 'them', text: lang === 'es' ? 'Buenas noches mi amor ❤️' : 'Good night my love ❤️', time: '22:30' },
      { from: 'me', text: lang === 'es' ? 'Igualmente, hasta mañana 😘' : 'You too, see you tomorrow 😘', time: '22:31' }
    ],
    time: '22:31'
  }));

  // Evidence items
  if (realEvidenceIds.includes('ig_dm_unknown')) {
    igItems.push(item(`ig_ev_dm`, 'ig_dm_unknown', {
      subtype: 'dm_thread',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      preview: lang === 'es' ? 'anoche lo pasamos muy bien 😏' : 'last night was so fun 😏',
      messages: [
        { from: 'them', text: lang === 'es' ? 'Oye, ¿cuándo te vuelvo a ver? 😏' : 'Hey, when do I get to see you again? 😏', time: '01:14' },
        { from: 'me', text: lang === 'es' ? 'Pronto, te lo prometo 😘' : 'Soon, I promise 😘', time: '01:16' },
        { from: 'them', text: lang === 'es' ? 'anoche lo pasamos muy bien 😍' : 'last night was amazing 😍', time: '01:17' }
      ],
      time: '01:17'
    }));
  }
  if (realEvidenceIds.includes('ig_likes_cluster')) {
    igItems.push(item(`ig_ev_likes`, 'ig_likes_cluster', {
      subtype: 'liked_posts',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      postCount: rng.nextInt(28, 45),
      timeAgo: `${rng.nextInt(1,3)}d`
    }));
  }
  if (realEvidenceIds.includes('ig_search_history')) {
    igItems.push(item(`ig_ev_search`, 'ig_search_history', {
      subtype: 'search_history',
      username: secretContact.username,
      searchCount: rng.nextInt(10, 15),
      timeAgo: `${rng.nextInt(1,3)}d`
    }));
  }
  if (realEvidenceIds.includes('ig_story_view')) {
    igItems.push(item(`ig_ev_story`, 'ig_story_view', {
      subtype: 'story_view',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      isPrivate: true,
      time: `${rng.nextInt(1,5)}h`
    }));
  }
  if (realEvidenceIds.includes('ig_follow_private')) {
    igItems.push(item(`ig_ev_follow`, 'ig_follow_private', {
      subtype: 'following',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      bio: lang === 'es' ? '✨ solo para seguidores' : '✨ close friends only',
      isPrivate: true,
      mutuals: 0
    }));
  }
  if (realEvidenceIds.includes('ig_comment_flirty')) {
    igItems.push(item(`ig_ev_comment`, 'ig_comment_flirty', {
      subtype: 'feed_post',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      caption: lang === 'es' ? `Verano 🌊 #playa` : `Summer vibes 🌊 #beach`,
      likes: rng.nextInt(80, 500),
      timeAgo: `${rng.nextInt(2,8)}d`,
      imageColor: '#87CEEB',
      imageEmoji: '👙',
      suspectComment: '🔥🔥🔥'
    }));
  }
  if (realEvidenceIds.includes('ig_blocked_account')) {
    igItems.push(item(`ig_ev_blocked`, 'ig_blocked_account', {
      subtype: 'story_view',
      username: girlfriend.username,
      avatarColor: girlfriend.avatarColor,
      isPrivate: false,
      blocked: true,
      time: '3d'
    }));
  }
  if (realEvidenceIds.includes('ig_tagged_wrong_place')) {
    igItems.push(item(`ig_ev_tagged`, 'ig_tagged_wrong_place', {
      subtype: 'feed_post',
      username: rng.pick([suspect.username, secretContact.username]),
      avatarColor: secretContact.avatarColor,
      caption: lang === 'es' ? `Cenando en ${secretRestaurant} ❤️` : `Dinner at ${secretRestaurant} ❤️`,
      likes: rng.nextInt(15, 100),
      timeAgo: `${rng.nextInt(3,10)}d`,
      imageColor: '#FFC0CB',
      imageEmoji: '🍷',
      location: secretRestaurant
    }));
  }

  // Red herrings for instagram
  if (redHerringIds.includes('ig_dm_surprise')) {
    const plannerName = rng.pick(pools.femaleNames.filter(n => n !== secretContact.name && n !== girlfriend.name));
    igItems.push(item(`ig_rh_surprise`, 'ig_dm_surprise', {
      subtype: 'dm_thread',
      username: plannerName.toLowerCase() + rng.pick(pools.usernameSuffixes),
      avatarColor: rng.pick(AVATAR_COLORS),
      preview: lang === 'es' ? '¿sigue sin saber nada? 🎉' : 'does he still not know? 🎉',
      messages: [
        { from: 'them', text: lang === 'es' ? `Oye, ¿${girlfriend.name} ya sabe algo de la fiesta?` : `Hey, does ${girlfriend.name} know about the party yet?`, time: '18:45' },
        { from: 'me', text: lang === 'es' ? 'No, sigue sin saber nada 🎉' : "No, she still doesn't know 🎉", time: '18:47' }
      ],
      time: '18:47',
      _plannerName: plannerName
    }));
  }
  if (redHerringIds.includes('ig_old_convo')) {
    igItems.push(item(`ig_rh_old`, 'ig_old_convo', {
      subtype: 'dm_thread',
      username: rng.pick(pools.femaleNames).toLowerCase() + rng.pick(pools.usernameSuffixes),
      avatarColor: rng.pick(AVATAR_COLORS),
      preview: lang === 'es' ? '¿te acuerdas de aquella noche? 😄' : 'remember that night? 😄',
      messages: [
        { from: 'them', text: lang === 'es' ? '¿te acuerdas de aquella noche en la fiesta? 😄' : 'remember that night at the party? 😄', time: '15:20' },
        { from: 'me', text: lang === 'es' ? 'Jajaja sí! Qué tiempos 😂' : 'Haha yes! Good times 😂', time: '15:22' }
      ],
      time: `${rng.nextInt(6,18)}mo`,
      isOld: true
    }));
  }
  if (redHerringIds.includes('ig_business_dm')) {
    igItems.push(item(`ig_rh_brand`, 'ig_business_dm', {
      subtype: 'dm_thread',
      username: 'brandcollab_oficial',
      avatarColor: '#FFD43B',
      preview: lang === 'es' ? 'Queremos trabajar contigo 📩' : 'We want to work with you 📩',
      messages: [
        { from: 'them', text: lang === 'es' ? 'Hola! Somos una marca y nos gustaría colaborar contigo 😊' : 'Hi! We are a brand and would love to collaborate with you 😊', time: '11:00' }
      ],
      time: '11:00'
    }));
  }
  if (redHerringIds.includes('ig_reel_save')) {
    igItems.push(item(`ig_rh_reels`, 'ig_reel_save', {
      subtype: 'liked_posts',
      username: 'reels_romanticos',
      avatarColor: '#FF6B9D',
      postCount: rng.nextInt(8, 20),
      timeAgo: `${rng.nextInt(1,4)}d`,
      isSaved: true
    }));
  }

  // ── WHATSAPP ──────────────────────────────────────────────────────────────
  const waItems = [];
  let waIdx = 0;

  // Varied WhatsApp filler threads (girlfriend conversation, picked from pool)
  const gfConvoPool = lang === 'es' ? [
    {
      msgs: [
        {from:'them', text:'¿A qué hora llegas esta noche?', time:'19:02'},
        {from:'me', text:'Sobre las 8, ¿por?', time:'19:05'},
        {from:'them', text:'Hago cena 😊', time:'19:06'},
      ], last:'Hago cena 😊', lastTime:'19:06'
    },
    {
      msgs: [
        {from:'them', text:'¿Recuerdas que tenemos cena el viernes?', time:'14:10'},
        {from:'me', text:'Claro, a las 21h ¿no?', time:'14:15'},
        {from:'them', text:'Sí exacto ❤️', time:'14:16'},
      ], last:'Sí exacto ❤️', lastTime:'14:16'
    },
    {
      msgs: [
        {from:'them', text:'¿Compras tú el pan de camino a casa?', time:'17:50'},
        {from:'me', text:'Sí, lo pillo 😊', time:'17:55'},
        {from:'them', text:'Eres lo mejor 🥰', time:'17:56'},
      ], last:'Eres lo mejor 🥰', lastTime:'17:56'
    },
    {
      msgs: [
        {from:'me', text:'Ya voy saliendo, en 20 min llego', time:'20:05'},
        {from:'them', text:'Perfecto, tengo la cena lista 🍝', time:'20:06'},
      ], last:'Perfecto, tengo la cena lista 🍝', lastTime:'20:06'
    },
  ] : [
    {
      msgs: [
        {from:'them', text:'What time are you home tonight?', time:'19:02'},
        {from:'me', text:'Around 8, why?', time:'19:05'},
        {from:'them', text:"I'll make dinner 😊", time:'19:06'},
      ], last:"I'll make dinner 😊", lastTime:'19:06'
    },
    {
      msgs: [
        {from:'them', text:'Do you remember we have dinner Friday?', time:'14:10'},
        {from:'me', text:'Yeah, 9pm right?', time:'14:15'},
        {from:'them', text:'Exactly ❤️', time:'14:16'},
      ], last:'Exactly ❤️', lastTime:'14:16'
    },
    {
      msgs: [
        {from:'them', text:'Can you grab bread on your way home?', time:'17:50'},
        {from:'me', text:"Yep, on it 😊", time:'17:55'},
        {from:'them', text:'You\'re the best 🥰', time:'17:56'},
      ], last:"You're the best 🥰", lastTime:'17:56'
    },
    {
      msgs: [
        {from:'me', text:'Leaving now, be there in 20', time:'20:05'},
        {from:'them', text:'Perfect, dinner\'s ready 🍝', time:'20:06'},
      ], last:"Perfect, dinner's ready 🍝", lastTime:'20:06'
    },
  ];
  const gfConvo = rng.pick(gfConvoPool);
  waItems.push(item(`wa_f${waIdx++}`, null, {
    subtype: 'thread',
    contactName: girlfriend.name,
    avatarColor: girlfriend.avatarColor,
    isUnknown: false,
    messages: gfConvo.msgs,
    lastMessage: gfConvo.last,
    lastTime: gfConvo.lastTime,
    unread: 0
  }));

  // Family group
  const familyConvoPool = lang === 'es' ? [
    {msgs:[{from:'them',text:'¿Venís el domingo?',time:'10:30'},{from:'me',text:'Sí, allí estaremos',time:'10:45'}], last:'Sí, allí estaremos', lastTime:'10:45'},
    {msgs:[{from:'them',text:'Mamá: ¿Quedamos el sábado? 🍕',time:'11:00'},{from:'me',text:'Perfecto, yo llevo postre',time:'11:15'}], last:'Yo llevo postre', lastTime:'11:15'},
    {msgs:[{from:'them',text:'¿Alguien sabe cuándo llega el paquete de papá?',time:'16:20'},{from:'me',text:'Mañana dicen',time:'16:30'}], last:'Mañana dicen', lastTime:'16:30'},
  ] : [
    {msgs:[{from:'them',text:'Are you coming Sunday?',time:'10:30'},{from:'me',text:"Yes, we'll be there",time:'10:45'}], last:"Yes, we'll be there", lastTime:'10:45'},
    {msgs:[{from:'them',text:'Mum: Saturday dinner? 🍕',time:'11:00'},{from:'me',text:"Perfect, I'll bring dessert",time:'11:15'}], last:"I'll bring dessert", lastTime:'11:15'},
    {msgs:[{from:'them',text:"Does anyone know when Dad's parcel arrives?",time:'16:20'},{from:'me',text:'Tomorrow they said',time:'16:30'}], last:'Tomorrow they said', lastTime:'16:30'},
  ];
  const familyConvo = rng.pick(familyConvoPool);
  waItems.push(item(`wa_f${waIdx++}`, null, {
    subtype: 'thread',
    contactName: pools.familyGroupName,
    avatarColor: '#69DB7C',
    isUnknown: false,
    isGroup: true,
    messages: familyConvo.msgs,
    lastMessage: familyConvo.last,
    lastTime: familyConvo.lastTime,
    unread: 0
  }));

  // Extra casual friend thread (adds depth to the inbox)
  const friendName = rng.pick(lang === 'es' ? ['Carlos','Rafa','Toni','Álvaro','Borja'] : ['Jamie','Dave','Mike','Dan','Connor']);
  const friendConvoPool = lang === 'es' ? [
    {msgs:[{from:'them',text:`¿Ves el partido esta noche?`,time:'20:00'},{from:'me',text:'Obvio, en el bar de siempre 🍺',time:'20:02'}], last:'Obvio, en el bar de siempre 🍺', lastTime:'20:02'},
    {msgs:[{from:'them',text:'Colega que gol el de ayer 🔥',time:'09:12'},{from:'me',text:'Épico jaja',time:'09:30'}], last:'Épico jaja', lastTime:'09:30'},
  ] : [
    {msgs:[{from:'them',text:'Watching the match tonight?',time:'20:00'},{from:'me',text:'Obviously, usual pub 🍺',time:'20:02'}], last:'Obviously, usual pub 🍺', lastTime:'20:02'},
    {msgs:[{from:'them',text:'Mate what a goal yesterday 🔥',time:'09:12'},{from:'me',text:'Insane haha',time:'09:30'}], last:'Insane haha', lastTime:'09:30'},
  ];
  const friendConvo = rng.pick(friendConvoPool);
  waItems.push(item(`wa_f${waIdx++}`, null, {
    subtype: 'thread',
    contactName: friendName,
    avatarColor: rng.pick(['#74C0FC','#FFD43B','#63E6BE']),
    isUnknown: false,
    messages: friendConvo.msgs,
    lastMessage: friendConvo.last,
    lastTime: friendConvo.lastTime,
    unread: 0
  }));

  if (realEvidenceIds.includes('wa_contact_alias')) {
    const alias = rng.pick(pools.workAliases);
    waItems.push(item(`wa_ev_alias`, 'wa_contact_alias', {
      subtype: 'thread',
      contactName: alias,
      avatarColor: secretContact.avatarColor,
      isUnknown: false,
      messages: [
        { from: 'them', text: lang === 'es' ? '¿Me echas de menos? 😘' : 'Do you miss me? 😘', type: 'voice', duration: '0:08', time: '00:47' },
        { from: 'me', text: lang === 'es' ? '🔥🔥' : '🔥🔥', time: '00:48' }
      ],
      lastMessage: '🔥🔥',
      lastTime: '00:48',
      unread: 0
    }));
  }
  if (realEvidenceIds.includes('wa_deleted_msgs')) {
    waItems.push(item(`wa_ev_deleted`, 'wa_deleted_msgs', {
      subtype: 'thread',
      contactName: `+34 ${rng.nextInt(600,699)} ${rng.nextInt(100,999)} ${rng.nextInt(100,999)}`,
      avatarColor: rng.pick(AVATAR_COLORS),
      isUnknown: true,
      messages: [
        { from: 'them', text: lang === 'es' ? 'Este mensaje fue eliminado' : 'This message was deleted', deleted: true, time: '23:12' },
        { from: 'me', text: lang === 'es' ? 'Este mensaje fue eliminado' : 'This message was deleted', deleted: true, time: '23:13' },
        { from: 'them', text: lang === 'es' ? 'Este mensaje fue eliminado' : 'This message was deleted', deleted: true, time: '23:14' }
      ],
      lastMessage: lang === 'es' ? 'Este mensaje fue eliminado' : 'This message was deleted',
      lastTime: '23:14',
      unread: 0
    }));
  }
  if (realEvidenceIds.includes('wa_miss_you')) {
    waItems.push(item(`wa_ev_missyou`, 'wa_miss_you', {
      subtype: 'thread',
      contactName: `+34 ${rng.nextInt(600,699)} ${rng.nextInt(100,999)} ${rng.nextInt(100,999)}`,
      avatarColor: rng.pick(AVATAR_COLORS),
      isUnknown: true,
      messages: [
        { from: 'them', text: lang === 'es' ? 'Te echo de menos 🥺' : 'I miss you 🥺', time: '02:34' },
        { from: 'them', text: lang === 'es' ? '¿Cuándo te veo?' : 'When can I see you?', time: '02:35' }
      ],
      lastMessage: lang === 'es' ? '¿Cuándo te veo?' : 'When can I see you?',
      lastTime: '02:35',
      unread: 2
    }));
  }
  if (realEvidenceIds.includes('wa_voice_note_unknown')) {
    waItems.push(item(`wa_ev_voice`, 'wa_voice_note_unknown', {
      subtype: 'thread',
      contactName: `+34 ${rng.nextInt(600,699)} ${rng.nextInt(100,999)} ${rng.nextInt(100,999)}`,
      avatarColor: rng.pick(AVATAR_COLORS),
      isUnknown: true,
      messages: [
        { from: 'them', text: '', type: 'voice', duration: '0:23', time: '00:03', unlistened: true }
      ],
      lastMessage: lang === 'es' ? '🎤 Nota de voz' : '🎤 Voice note',
      lastTime: '00:03',
      unread: 1
    }));
  }
  if (realEvidenceIds.includes('wa_emoji_heavy')) {
    waItems.push(item(`wa_ev_emoji`, 'wa_emoji_heavy', {
      subtype: 'thread',
      contactName: secretContact.name,
      avatarColor: secretContact.avatarColor,
      isUnknown: false,
      messages: [
        { from: 'them', text: '😍❤️🔥', time: '21:00' },
        { from: 'me', text: '💋💋', time: '21:01' },
        { from: 'them', text: lang === 'es' ? 'No puedo dejar de pensar en ti' : "Can't stop thinking about you", time: '21:03' }
      ],
      lastMessage: lang === 'es' ? 'No puedo dejar de pensar en ti' : "Can't stop thinking about you",
      lastTime: '21:03',
      unread: 0
    }));
  }
  if (realEvidenceIds.includes('wa_location_shared')) {
    waItems.push(item(`wa_ev_location`, 'wa_location_shared', {
      subtype: 'thread',
      contactName: secretContact.name,
      avatarColor: secretContact.avatarColor,
      isUnknown: false,
      messages: [
        { from: 'me', text: '', type: 'location', address: secretAddress, time: '02:12' }
      ],
      lastMessage: lang === 'es' ? '📍 Ubicación compartida' : '📍 Location shared',
      lastTime: '02:12',
      unread: 0
    }));
  }

  // Red herrings for whatsapp
  if (redHerringIds.includes('wa_sister')) {
    const sisterLabel = rng.pick(pools.sisterNames);
    waItems.push(item(`wa_rh_sister`, 'wa_sister', {
      subtype: 'thread',
      contactName: lang === 'es' ? `${rng.pick(pools.femaleNames)} (${sisterLabel})` : `${rng.pick(pools.femaleNames)} (sis)`,
      avatarColor: rng.pick(AVATAR_COLORS),
      isUnknown: false,
      messages: [
        { from: 'them', text: lang === 'es' ? 'Mamá quiere que vengas este finde ❤️' : 'Mum wants you to come this weekend ❤️', time: '14:22' },
        { from: 'me', text: lang === 'es' ? 'Claro, allí estaré 😊' : 'Of course, I\'ll be there 😊', time: '14:30' }
      ],
      lastMessage: lang === 'es' ? 'Claro, allí estaré 😊' : "Of course, I'll be there 😊",
      lastTime: '14:30',
      unread: 0
    }));
  }
  if (redHerringIds.includes('wa_work_group')) {
    waItems.push(item(`wa_rh_work`, 'wa_work_group', {
      subtype: 'thread',
      contactName: pools.workGroupName,
      avatarColor: '#74C0FC',
      isUnknown: false,
      isGroup: true,
      messages: [
        { from: 'them', text: lang === 'es' ? '¿Puedes quedarte hasta las 9?' : 'Can you stay until 9?', time: '17:45' },
        { from: 'me', text: lang === 'es' ? 'Sí, sin problema' : 'Yes, no problem', time: '17:47' }
      ],
      lastMessage: lang === 'es' ? 'Sí, sin problema' : 'Yes, no problem',
      lastTime: '17:47',
      unread: 0
    }));
  }
  if (redHerringIds.includes('wa_old_ex')) {
    waItems.push(item(`wa_rh_ex`, 'wa_old_ex', {
      subtype: 'thread',
      contactName: rng.pick(pools.femaleNames),
      avatarColor: rng.pick(AVATAR_COLORS),
      isUnknown: false,
      messages: [
        { from: 'them', text: lang === 'es' ? '¿Cómo estás? Espero que bien 😊' : 'How are you? Hope you\'re well 😊', time: '11:15' },
        { from: 'me', text: lang === 'es' ? 'Muy bien gracias, y tú? Con mi novia genial 😊' : 'Great thanks, you? Really happy with my girlfriend 😊', time: '11:20' }
      ],
      lastMessage: lang === 'es' ? 'Muy bien gracias' : 'Great thanks',
      lastTime: '11:20',
      unread: 0
    }));
  }

  // ALIBI: rv_couple_restaurant — girlfriend confirms the dinner in WhatsApp
  if (redHerringIds.includes('rv_couple_restaurant')) {
    const dinnerRestaurant = rng.pick(pools.romanticRestaurants);
    waItems.push(item(`wa_alibi_dinner`, null, {
      subtype: 'thread',
      contactName: girlfriend.name,
      avatarColor: girlfriend.avatarColor,
      isUnknown: false,
      messages: [
        { from: 'them', text: lang === 'es' ? `Qué noche tan bonita anoche, gracias por llevarme a ${dinnerRestaurant} ❤️` : `Such a lovely night, thanks for taking me to ${dinnerRestaurant} ❤️`, time: '09:44' },
        { from: 'me', text: lang === 'es' ? '😘 Mereces lo mejor' : '😘 You deserve the best', time: '09:46' },
      ],
      lastMessage: lang === 'es' ? '😘 Mereces lo mejor' : '😘 You deserve the best',
      lastTime: '09:46',
      unread: 0,
    }));
  }

  // ALIBI: rv_parents_gift — family group discusses gifting mom
  if (redHerringIds.includes('rv_parents_gift')) {
    waItems.push(item(`wa_alibi_parentsgift`, null, {
      subtype: 'thread',
      contactName: pools.familyGroupName,
      avatarColor: '#69DB7C',
      isUnknown: false,
      isGroup: true,
      messages: [
        { from: 'them', text: lang === 'es' ? '¿Qué le regalamos a mamá para su cumpleaños?' : "What should we get Mum for her birthday?", time: '10:20' },
        { from: 'me', text: lang === 'es' ? 'Una joya, yo me encargo 😊' : 'Some jewellery, I\'ll sort it 😊', time: '10:25' },
        { from: 'them', text: lang === 'es' ? '¡Perfecto! Ella va a alucinar 💎' : 'Perfect! She\'ll love it 💎', time: '10:27' },
      ],
      lastMessage: lang === 'es' ? '¡Perfecto! Ella va a alucinar 💎' : "Perfect! She'll love it 💎",
      lastTime: '10:27',
      unread: 0,
    }));
  }

  // ── REVOLUT ──────────────────────────────────────────────────────────────
  const currency = pools.currency;
  const rvItems = [];
  let rvIdx = 0;

  // Filler transactions
  const fillerMerchants = lang === 'es'
    ? [['Mercadona','🛒 Supermercado'], ['Repsol','⛽ Carburante'], ['Netflix','📺 Suscripción'], ['El Corte Inglés','🛍️ Compras']]
    : [['Tesco','🛒 Supermarket'], ['BP','⛽ Fuel'], ['Netflix','📺 Subscription'], ['ASOS','🛍️ Shopping']];
  for (const [merchant, category] of fillerMerchants) {
    rvItems.push(item(`rv_f${rvIdx++}`, null, {
      subtype: 'transaction',
      merchant,
      amount: `-${rng.nextInt(10, 120)},${rng.nextInt(0,9)}${rng.nextInt(0,9)} ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb','mar','abr','may','jun']:['Jan','Feb','Mar','Apr','May','Jun'])}`,
      category
    }));
  }

  if (realEvidenceIds.includes('rv_hotel')) {
    rvItems.push(item(`rv_ev_hotel`, 'rv_hotel', {
      subtype: 'transaction',
      merchant: hotelName,
      amount: `-${rng.nextInt(95,180)},00 ${currency.symbol}`,
      date: keyDateStr,
      category: lang === 'es' ? '🏨 Hotel' : '🏨 Hotel',
      note: lang === 'es' ? `1 noche • ${suspect.city}` : `1 night • ${suspect.city}`
    }));
  }
  if (realEvidenceIds.includes('rv_dinner_2')) {
    rvItems.push(item(`rv_ev_dinner`, 'rv_dinner_2', {
      subtype: 'transaction',
      merchant: secretRestaurant,
      amount: `-${rng.nextInt(70,140)},00 ${currency.symbol}`,
      date: keyDateStr,
      category: lang === 'es' ? '🍽️ Restaurantes' : '🍽️ Restaurants',
      note: lang === 'es' ? 'Mesa para 2' : 'Table for 2'
    }));
  }
  if (realEvidenceIds.includes('rv_flowers')) {
    rvItems.push(item(`rv_ev_flowers`, 'rv_flowers', {
      subtype: 'transaction',
      merchant: lang === 'es' ? 'Floristería Primavera' : 'Bloom Flowers',
      amount: `-${rng.nextInt(30,70)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '💐 Regalos' : '💐 Gifts'
    }));
  }
  if (realEvidenceIds.includes('rv_gift')) {
    rvItems.push(item(`rv_ev_gift`, 'rv_gift', {
      subtype: 'transaction',
      merchant: lang === 'es' ? 'Joyería Tous' : 'Tiffany & Co.',
      amount: `-${rng.nextInt(120,350)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '💎 Joyería' : '💎 Jewellery'
    }));
  }
  if (realEvidenceIds.includes('rv_airbnb')) {
    rvItems.push(item(`rv_ev_airbnb`, 'rv_airbnb', {
      subtype: 'transaction',
      merchant: 'Airbnb',
      amount: `-${rng.nextInt(90,200)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '🏠 Alojamiento' : '🏠 Accommodation',
      note: lang === 'es' ? `${rng.nextInt(1,3)} noches` : `${rng.nextInt(1,3)} nights`
    }));
  }
  if (realEvidenceIds.includes('rv_lingerie')) {
    rvItems.push(item(`rv_ev_lingerie`, 'rv_lingerie', {
      subtype: 'transaction',
      merchant: lang === 'es' ? 'Women\'Secret Online' : 'Victoria\'s Secret Online',
      amount: `-${rng.nextInt(40,90)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '🛍️ Moda' : '🛍️ Fashion'
    }));
  }
  if (realEvidenceIds.includes('rv_cash_withdrawals')) {
    for (let i = 0; i < 3; i++) {
      rvItems.push(item(`rv_ev_cash${i}`, i === 0 ? 'rv_cash_withdrawals' : null, {
        subtype: 'transaction',
        merchant: lang === 'es' ? 'Cajero ATM' : 'ATM Withdrawal',
        amount: `-${rng.nextInt(100,300)},00 ${currency.symbol}`,
        date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb','mar']:['Jan','Feb','Mar'])}`,
        category: lang === 'es' ? '💵 Efectivo' : '💵 Cash'
      }));
    }
  }
  if (realEvidenceIds.includes('rv_uber_unknown')) {
    for (let i = 0; i < 3; i++) {
      rvItems.push(item(`rv_ev_uber${i}`, i === 0 ? 'rv_uber_unknown' : null, {
        subtype: 'transaction',
        merchant: 'Uber',
        amount: `-${rng.nextInt(8,25)},00 ${currency.symbol}`,
        date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
        category: lang === 'es' ? '🚗 Transporte' : '🚗 Transport',
        note: secretAddress
      }));
    }
  }

  // Red herrings revolut
  if (redHerringIds.includes('rv_birthday_flowers')) {
    rvItems.push(item(`rv_rh_bflowers`, 'rv_birthday_flowers', {
      subtype: 'transaction',
      merchant: lang === 'es' ? 'Floristería Primavera' : 'Bloom Flowers',
      amount: `-${rng.nextInt(30,60)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,5)} ${rng.pick(lang==='es'?['mar','abr']:['Mar','Apr'])}`,
      category: lang === 'es' ? '💐 Regalos' : '💐 Gifts'
    }));
  }
  if (redHerringIds.includes('rv_biz_trip')) {
    rvItems.push(item(`rv_rh_biztrip`, 'rv_biz_trip', {
      subtype: 'transaction',
      merchant: rng.pick(pools.hotels),
      amount: `-${rng.nextInt(80,160)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '🏨 Hotel' : '🏨 Hotel',
      note: lang === 'es' ? 'Viaje de empresa' : 'Business trip'
    }));
  }
  if (redHerringIds.includes('rv_couple_restaurant')) {
    rvItems.push(item(`rv_rh_coupledinner`, 'rv_couple_restaurant', {
      subtype: 'transaction',
      merchant: rng.pick(pools.romanticRestaurants),
      amount: `-${rng.nextInt(60,120)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '🍽️ Restaurantes' : '🍽️ Restaurants'
    }));
  }
  if (redHerringIds.includes('rv_parents_gift')) {
    rvItems.push(item(`rv_rh_parentsgift`, 'rv_parents_gift', {
      subtype: 'transaction',
      merchant: lang === 'es' ? 'Joyería Tous' : 'Argos',
      amount: `-${rng.nextInt(50,150)},00 ${currency.symbol}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      category: lang === 'es' ? '💎 Joyería' : '💎 Jewellery'
    }));
  }

  // ── TWITTER ──────────────────────────────────────────────────────────────
  const twItems = [];
  let twIdx = 0;

  // Filler tweets
  twItems.push(item(`tw_f${twIdx++}`, null, {
    subtype: 'tweet',
    username: suspect.username,
    avatarColor: suspect.avatarColor,
    text: lang === 'es' ? `El ${rng.pick(['fútbol','baloncesto','tenis'])} es vida 🏆` : `${rng.pick(['Football','Basketball','Tennis'])} is life 🏆`,
    time: `${rng.nextInt(1,6)}h`,
    likes: rng.nextInt(5, 80),
    retweets: rng.nextInt(0, 20)
  }));
  twItems.push(item(`tw_f${twIdx++}`, null, {
    subtype: 'tweet',
    username: suspect.username,
    avatarColor: suspect.avatarColor,
    text: lang === 'es' ? 'Buenos días a todos menos a los que ponen el despertador los domingos ☕' : 'Good morning to everyone except people who set alarms on Sundays ☕',
    time: `${rng.nextInt(1,3)}d`,
    likes: rng.nextInt(10, 200),
    retweets: rng.nextInt(1, 50)
  }));

  if (realEvidenceIds.includes('tw_liked_flirty')) {
    twItems.push(item(`tw_ev_liked`, 'tw_liked_flirty', {
      subtype: 'like',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      tweetText: lang === 'es' ? 'Cuando alguien te dice exactamente lo que necesitas oír 🥰✨' : 'When someone tells you exactly what you need to hear 🥰✨',
      time: `${rng.nextInt(1,3)}d`
    }));
  }
  if (realEvidenceIds.includes('tw_follow_private')) {
    twItems.push(item(`tw_ev_follow`, 'tw_follow_private', {
      subtype: 'following',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      bio: lang === 'es' ? '✨ vibras bonitas · solo para los míos 🔒' : '✨ good vibes · close friends only 🔒',
      isPrivate: true,
      followers: rng.nextInt(80, 400)
    }));
  }
  if (realEvidenceIds.includes('tw_reply_heart')) {
    twItems.push(item(`tw_ev_reply`, 'tw_reply_heart', {
      subtype: 'like',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      tweetText: lang === 'es' ? '🌊 Playa, sol y buena compañía 😍 #verano' : '🌊 Beach, sun and good company 😍 #summer',
      time: `${rng.nextInt(2,7)}d`,
      suspectReply: '😍😍'
    }));
  }
  if (realEvidenceIds.includes('tw_dm_notif')) {
    twItems.push(item(`tw_ev_dms`, 'tw_dm_notif', {
      subtype: 'dm_notif',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      preview: lang === 'es' ? 'ya me está haciendo efecto el vino 🍷' : 'the wine is kicking in 🍷'
    }));
  }
  if (realEvidenceIds.includes('tw_alibi_break')) {
    twItems.push(item(`tw_ev_alibi`, 'tw_alibi_break', {
      subtype: 'tweet',
      username: suspect.username,
      avatarColor: suspect.avatarColor,
      text: lang === 'es' ? `Trabajando tarde otra vez... 💻 ${suspect.city}` : `Working late again... 💻 ${suspect.city}`,
      time: '22:14',
      likes: rng.nextInt(2, 15),
      retweets: 0,
      location: secretRestaurant
    }));
  }
  if (realEvidenceIds.includes('tw_list')) {
    twItems.push(item(`tw_ev_list`, 'tw_list', {
      subtype: 'following',
      username: secretContact.username,
      avatarColor: secretContact.avatarColor,
      bio: lang === 'es' ? `${secretContact.age} años · ${suspect.city}` : `${secretContact.age} · ${suspect.city}`,
      isPrivate: true,
      inList: lang === 'es' ? 'cercanos' : 'close',
      followers: rng.nextInt(100, 800)
    }));
  }

  // Red herrings twitter
  if (redHerringIds.includes('tw_retweet_relatable')) {
    twItems.push(item(`tw_rh_memes`, 'tw_retweet_relatable', {
      subtype: 'tweet',
      username: 'memesdepareja',
      avatarColor: '#FF6B9D',
      text: lang === 'es' ? 'Cuando tu pareja dice "estoy bien" pero claramente no está bien 😂' : 'When your partner says "I\'m fine" but clearly isn\'t 😂',
      time: `${rng.nextInt(1,4)}d`,
      likes: rng.nextInt(500, 5000),
      retweets: rng.nextInt(200, 2000),
      isRetweet: true
    }));
  }
  if (redHerringIds.includes('tw_mutual_follows')) {
    twItems.push(item(`tw_rh_work`, 'tw_mutual_follows', {
      subtype: 'following',
      username: rng.pick(pools.femaleNames).toLowerCase() + rng.pick(pools.usernameSuffixes),
      avatarColor: rng.pick(AVATAR_COLORS),
      bio: lang === 'es' ? `${rng.pick(pools.jobs)} · ${suspect.city}` : `${rng.pick(pools.jobs)} · ${suspect.city}`,
      isPrivate: false,
      followers: rng.nextInt(300, 5000),
      mutuals: rng.nextInt(10, 50)
    }));
  }
  if (redHerringIds.includes('tw_old_tweet')) {
    twItems.push(item(`tw_rh_old`, 'tw_old_tweet', {
      subtype: 'tweet',
      username: suspect.username,
      avatarColor: suspect.avatarColor,
      text: lang === 'es' ? `Qué noche tan buena con @${rng.pick(pools.femaleNames).toLowerCase()} 🍹` : `Such a good night with @${rng.pick(pools.femaleNames).toLowerCase()} 🍹`,
      time: `${rng.nextInt(18,36)}mo`,
      likes: rng.nextInt(5, 30),
      retweets: 0,
      isOld: true
    }));
  }

  // ── MAPS ──────────────────────────────────────────────────────────────────
  const mapsItems = [];
  let mapsIdx = 0;

  // Filler saved places
  mapsItems.push(item(`gm_f${mapsIdx++}`, null, {
    subtype: 'saved_place',
    name: lang === 'es' ? 'Casa' : 'Home',
    address: suspect.city,
    label: lang === 'es' ? 'Casa' : 'Home',
    icon: '🏠'
  }));
  mapsItems.push(item(`gm_f${mapsIdx++}`, null, {
    subtype: 'recent_search',
    query: lang === 'es' ? `Gasolineras cerca de mí` : `Petrol stations near me`,
    time: `${rng.nextInt(1,5)}d`
  }));
  mapsItems.push(item(`gm_f${mapsIdx++}`, null, {
    subtype: 'timeline_entry',
    date: lang === 'es' ? 'Ayer' : 'Yesterday',
    places: [
      { name: lang === 'es' ? 'Casa' : 'Home', timeRange: '8:00 – 9:00' },
      { name: lang === 'es' ? 'Oficina' : 'Office', timeRange: '9:30 – 19:00' },
      { name: lang === 'es' ? 'Casa' : 'Home', timeRange: '19:30 –' }
    ]
  }));

  if (realEvidenceIds.includes('gm_wrong_home')) {
    mapsItems.push(item(`gm_ev_home`, 'gm_wrong_home', {
      subtype: 'saved_place',
      name: lang === 'es' ? 'Casa' : 'Home',
      address: secretAddress,
      label: lang === 'es' ? 'Casa' : 'Home',
      icon: '🏠'
    }));
  }
  if (realEvidenceIds.includes('gm_restaurant_saved')) {
    mapsItems.push(item(`gm_ev_restaurant`, 'gm_restaurant_saved', {
      subtype: 'saved_place',
      name: secretRestaurant,
      address: rng.pick(pools.streetNames),
      label: lang === 'es' ? 'Favorito' : 'Favourite',
      icon: '❤️'
    }));
  }
  if (realEvidenceIds.includes('gm_hotel_search')) {
    mapsItems.push(item(`gm_ev_hotelsearch`, 'gm_hotel_search', {
      subtype: 'recent_search',
      query: lang === 'es' ? `${hotelName} habitación doble` : `${hotelName} double room`,
      time: `${rng.nextInt(1,5)}d`
    }));
  }
  if (realEvidenceIds.includes('gm_frequent_unknown')) {
    mapsItems.push(item(`gm_ev_frequent`, 'gm_frequent_unknown', {
      subtype: 'saved_place',
      name: secretAddress,
      address: secretAddress,
      label: lang === 'es' ? 'Frecuente' : 'Frequent',
      icon: '📍',
      visitCount: rng.nextInt(7, 12)
    }));
  }
  if (realEvidenceIds.includes('gm_alibi_route')) {
    mapsItems.push(item(`gm_ev_alibi`, 'gm_alibi_route', {
      subtype: 'timeline_entry',
      date: keyDateLabel,
      places: [
        { name: lang === 'es' ? 'Casa' : 'Home', timeRange: '8:00 – 9:00' },
        { name: secretRestaurant, timeRange: '14:00 – 16:30' },
        { name: secretAddress, timeRange: '17:00 – 23:00' }
      ]
    }));
  }
  if (realEvidenceIds.includes('gm_shared_location')) {
    mapsItems.push(item(`gm_ev_shared`, 'gm_shared_location', {
      subtype: 'shared_location',
      contactName: secretContact.name,
      avatarColor: secretContact.avatarColor,
      address: secretAddress,
      since: lang === 'es' ? `hace ${rng.nextInt(2,8)} semanas` : `${rng.nextInt(2,8)} weeks ago`
    }));
  }

  // Red herrings maps
  if (redHerringIds.includes('gm_parents_home')) {
    mapsItems.push(item(`gm_rh_parents`, 'gm_parents_home', {
      subtype: 'saved_place',
      name: lang === 'es' ? 'Casa de mis padres' : "Parents' house",
      address: rng.pick(pools.addresses),
      label: lang === 'es' ? 'Favorito' : 'Favourite',
      icon: '🏡'
    }));
  }
  if (redHerringIds.includes('gm_work_route')) {
    mapsItems.push(item(`gm_rh_office`, 'gm_work_route', {
      subtype: 'saved_place',
      name: lang === 'es' ? 'Nueva oficina' : 'New office',
      address: rng.pick(pools.addresses),
      label: lang === 'es' ? 'Trabajo' : 'Work',
      icon: '💼'
    }));
  }
  if (redHerringIds.includes('gm_gym')) {
    mapsItems.push(item(`gm_rh_gym`, 'gm_gym', {
      subtype: 'saved_place',
      name: gymName,
      address: rng.pick(pools.streetNames),
      label: lang === 'es' ? 'Frecuente' : 'Frequent',
      icon: '💪',
      visitCount: rng.nextInt(6, 15)
    }));
  }

  // ── GALLERY ──────────────────────────────────────────────────────────────
  const galItems = [];
  let galIdx = 0;

  // Filler photos
  const fillerPhotos = [
    { color: '#87CEEB', emoji: '🌅', caption: lang==='es'?'Amanecer':'Sunrise', album: lang==='es'?'Recientes':'Recents' },
    { color: '#4682B4', emoji: '⚽', caption: lang==='es'?'Partido de fútbol':'Football match', album: lang==='es'?'Recientes':'Recents' },
    { color: '#90EE90', emoji: '🌳', caption: lang==='es'?'Parque':'Park', album: lang==='es'?'Recientes':'Recents' },
    { color: '#FFC0CB', emoji: '🍕', caption: lang==='es'?'Cena en casa':'Dinner at home', album: lang==='es'?'Recientes':'Recents' },
  ];
  for (const p of fillerPhotos) {
    galItems.push(item(`gal_f${galIdx++}`, null, {
      subtype: 'photo',
      imageColor: p.color,
      imageEmoji: p.emoji,
      caption: p.caption,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb','mar']:['Jan','Feb','Mar'])}`,
      album: p.album
    }));
  }

  if (realEvidenceIds.includes('gal_photo_unknown_girl')) {
    galItems.push(item(`gal_ev_selfie`, 'gal_photo_unknown_girl', {
      subtype: 'photo',
      imageColor: '#FFB6C1',
      imageEmoji: '🤳',
      caption: lang === 'es' ? `${secretContact.name} y ${suspect.name}` : `${secretContact.name} & ${suspect.name}`,
      date: `${rng.nextInt(1,14)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Recientes' : 'Recents'
    }));
  }
  if (realEvidenceIds.includes('gal_hotel_room')) {
    galItems.push(item(`gal_ev_hotel`, 'gal_hotel_room', {
      subtype: 'photo',
      imageColor: '#D2B48C',
      imageEmoji: '🛏️',
      caption: hotelName,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Recientes' : 'Recents'
    }));
  }
  if (realEvidenceIds.includes('gal_gift_unwrapped')) {
    galItems.push(item(`gal_ev_gift`, 'gal_gift_unwrapped', {
      subtype: 'photo',
      imageColor: '#FFD700',
      imageEmoji: '💍',
      caption: lang === 'es' ? 'Regalo abierto' : 'Unwrapped gift',
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Recientes' : 'Recents'
    }));
  }
  if (realEvidenceIds.includes('gal_screenshot_convo')) {
    galItems.push(item(`gal_ev_screenshot`, 'gal_screenshot_convo', {
      subtype: 'photo',
      imageColor: '#25D366',
      imageEmoji: '💬',
      caption: lang === 'es' ? `Captura — ${secretContact.name}` : `Screenshot — ${secretContact.name}`,
      date: `${rng.nextInt(1,14)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Capturas' : 'Screenshots'
    }));
  }
  if (realEvidenceIds.includes('gal_deleted_bin')) {
    for (let i = 0; i < 4; i++) {
      galItems.push(item(`gal_ev_deleted${i}`, i === 0 ? 'gal_deleted_bin' : null, {
        subtype: 'deleted',
        imageColor: rng.pick(['#FFB6C1','#D2B48C','#87CEEB','#FFD700']),
        imageEmoji: rng.pick(['📸','🤳','🛏️','💐']),
        caption: lang === 'es' ? 'Eliminada hoy' : 'Deleted today',
        date: lang === 'es' ? 'Hoy' : 'Today',
        album: lang === 'es' ? 'Papelera' : 'Trash'
      }));
    }
  }

  // Red herrings gallery
  if (redHerringIds.includes('gal_sister_photo')) {
    galItems.push(item(`gal_rh_sister`, 'gal_sister_photo', {
      subtype: 'photo',
      imageColor: '#DDA0DD',
      imageEmoji: '👫',
      caption: lang === 'es' ? `Con mi hermana ${rng.pick(pools.femaleNames)}` : `With my sister ${rng.pick(pools.femaleNames)}`,
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Recientes' : 'Recents'
    }));
  }
  if (redHerringIds.includes('gal_surprise_photo')) {
    galItems.push(item(`gal_rh_surprise`, 'gal_surprise_photo', {
      subtype: 'photo',
      imageColor: '#FFD700',
      imageEmoji: '🎁',
      caption: lang === 'es' ? 'Preparando sorpresa ❤️' : 'Preparing surprise ❤️',
      date: `${rng.nextInt(1,14)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Recientes' : 'Recents'
    }));
  }
  if (redHerringIds.includes('gal_old_photo')) {
    galItems.push(item(`gal_rh_old`, 'gal_old_photo', {
      subtype: 'photo',
      imageColor: '#C0C0C0',
      imageEmoji: '🏖️',
      caption: lang === 'es' ? `Vacaciones ${rng.nextInt(2018,2021)}` : `Holiday ${rng.nextInt(2018,2021)}`,
      date: `${rng.nextInt(2018,2021)}`,
      album: lang === 'es' ? 'Recientes' : 'Recents',
      isOld: true
    }));
  }
  if (redHerringIds.includes('gal_work_event')) {
    galItems.push(item(`gal_rh_work`, 'gal_work_event', {
      subtype: 'photo',
      imageColor: '#4682B4',
      imageEmoji: '🏢',
      caption: lang === 'es' ? 'Evento de empresa 💼' : 'Work event 💼',
      date: `${rng.nextInt(1,28)} ${rng.pick(lang==='es'?['ene','feb']:['Jan','Feb'])}`,
      album: lang === 'es' ? 'Recientes' : 'Recents'
    }));
  }

  // ── MESSAGES (SMS) ────────────────────────────────────────────────────────
  const msgItems = [];
  let msgIdx = 0;

  // Filler
  msgItems.push(item(`msg_f${msgIdx++}`, null, {
    subtype: 'sms_thread',
    contactName: lang === 'es' ? 'Banco Santander' : 'HSBC Bank',
    isUnknown: false,
    messages: [
      { from: 'them', text: lang === 'es' ? 'Su tarjeta ha sido cargada con 45,00€' : 'Your card has been charged £45.00', time: '10:02' }
    ],
    lastMessage: lang === 'es' ? 'Su tarjeta ha sido cargada...' : 'Your card has been charged...',
    lastTime: '10:02'
  }));
  msgItems.push(item(`msg_f${msgIdx++}`, null, {
    subtype: 'sms_thread',
    contactName: girlfriend.name,
    isUnknown: false,
    messages: [
      { from: 'them', text: lang === 'es' ? '¿Compras tú la leche? 🥛' : 'Can you get milk? 🥛', time: '13:45' },
      { from: 'me', text: lang === 'es' ? 'Sí, la traigo' : 'Yep, on it', time: '13:50' }
    ],
    lastMessage: lang === 'es' ? 'Sí, la traigo' : 'Yep, on it',
    lastTime: '13:50'
  }));

  // ALIBI: rv_birthday_flowers — mom's text thanking him for flowers
  if (redHerringIds.includes('rv_birthday_flowers')) {
    msgItems.push(item(`msg_alibi_bflowers`, null, {
      subtype: 'sms_thread',
      contactName: lang === 'es' ? 'Mamá 🌸' : 'Mum 🌸',
      isUnknown: false,
      messages: [
        { from: 'them', text: lang === 'es' ? '¡Gracias por las flores, hijo! Son preciosas 💐 Os quiero mucho' : 'Thank you so much for the flowers! They\'re beautiful 💐 Love you both', time: '14:32' }
      ],
      lastMessage: lang === 'es' ? '¡Gracias por las flores! 💐' : 'Thank you for the flowers! 💐',
      lastTime: '14:32',
    }));
  }

  // ALIBI: rv_biz_trip — company HR confirms travel expenses
  if (redHerringIds.includes('rv_biz_trip')) {
    msgItems.push(item(`msg_alibi_biztrip`, null, {
      subtype: 'sms_thread',
      contactName: lang === 'es' ? 'RRHH Empresa' : 'Company HR',
      isUnknown: false,
      messages: [
        { from: 'them', text: lang === 'es' ? 'Viaje corporativo aprobado. Gastos de hotel y dietas incluidos. Ref: VJ-2024-112' : 'Business travel approved. Hotel and expenses covered. Ref: BT-2024-112', time: '09:10' }
      ],
      lastMessage: lang === 'es' ? 'Gastos aprobados ✓ Ref: VJ-2024' : 'Expenses approved ✓ Ref: BT-2024',
      lastTime: '09:10',
    }));
  }

  // Messages-specific evidence (SMS versions of some whatsapp evidence)
  if (realEvidenceIds.includes('wa_miss_you') && !waItems.some(i => i.evidenceId === 'wa_miss_you')) {
    msgItems.push(item(`msg_ev_missyou`, 'wa_miss_you', {
      subtype: 'sms_thread',
      contactName: `+34 ${rng.nextInt(600,699)} ${rng.nextInt(100,999)} ${rng.nextInt(100,999)}`,
      isUnknown: true,
      messages: [
        { from: 'them', text: lang === 'es' ? 'Te echo de menos 😔' : 'Miss you 😔', time: '02:34' }
      ],
      lastMessage: lang === 'es' ? 'Te echo de menos 😔' : 'Miss you 😔',
      lastTime: '02:34'
    }));
  }

  const balance = `${rng.nextInt(500,3000)},${rng.nextInt(10,99)} ${currency.symbol}`;

  // ── CALENDAR ──────────────────────────────────────────────────────────────
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonthIdx = now.getMonth();
  const calMonthNamesEs = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const calMonthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const calMonthName = (lang === 'es' ? calMonthNamesEs : calMonthNamesEn)[calMonthIdx];

  const calEvents = [];
  calEvents.push({
    day: rng.nextInt(1, 7),
    title: lang === 'es' ? 'Gimnasio' : 'Gym',
    time: '07:00 – 08:30',
    location: gymName,
    color: '#FF9500',
    evidenceId: null
  });
  calEvents.push({
    day: rng.nextInt(8, 15),
    title: lang === 'es' ? 'Reunión de equipo' : 'Team meeting',
    time: '10:00 – 11:30',
    color: '#007AFF',
    evidenceId: null
  });
  calEvents.push({
    day: rng.nextInt(18, 25),
    title: lang === 'es' ? `Cena con ${girlfriend.name}` : `Dinner with ${girlfriend.name}`,
    time: '21:00',
    location: rng.pick(pools.romanticRestaurants),
    color: '#FF2D55',
    evidenceId: null
  });
  if (realEvidenceIds.includes('cal_fake_alibi')) {
    calEvents.push({
      day: keyDay,
      title: lang === 'es' ? 'Viaje de trabajo' : 'Work trip',
      time: lang === 'es' ? '14:00 – 23:00' : '2:00pm – 11:00pm',
      location: lang === 'es' ? 'Viaje corporativo' : 'Corporate travel',
      notes: lang === 'es'
        ? `Reunión con cliente. Maps lo sitúa en ${secretAddress}.`
        : `Client meeting. Maps places him at ${secretAddress}.`,
      color: '#007AFF',
      evidenceId: 'cal_fake_alibi'
    });
  }

  // ── NOTES ──────────────────────────────────────────────────────────────────
  const notesItems = [];
  notesItems.push({
    title: lang === 'es' ? 'Lista de la compra' : 'Shopping list',
    body: lang === 'es' ? 'Leche\nPan\nYogur\nCerveza\nDetergente' : 'Milk\nBread\nYoghurt\nBeer\nDetergent',
    date: lang === 'es' ? 'hoy' : 'today',
    preview: lang === 'es' ? 'Leche, Pan, Yogur...' : 'Milk, Bread, Yoghurt...',
    isPinned: false,
    isLocked: false,
    evidenceId: null
  });
  notesItems.push({
    title: lang === 'es' ? 'Películas pendientes' : 'Movies to watch',
    body: lang === 'es' ? 'Oppenheimer\nPoor Things\nInterstellar\nEl Padrino' : 'Oppenheimer\nPoor Things\nInterstellar\nThe Godfather',
    date: lang === 'es' ? 'hace 3 días' : '3 days ago',
    preview: lang === 'es' ? 'Oppenheimer, Poor Things...' : 'Oppenheimer, Poor Things...',
    isPinned: false,
    isLocked: false,
    evidenceId: null
  });
  if (realEvidenceIds.includes('notes_suspicious')) {
    notesItems.unshift({
      title: lang === 'es' ? 'Pendientes' : 'To do',
      body: lang === 'es'
        ? `Reservar ${secretRestaurant} — mesa para 2\nComprar algo para ${secretContact.name}\nCancelar plan con ${girlfriend.name} ese día\nBorrar conversaciones`
        : `Book ${secretRestaurant} — table for 2\nGet something for ${secretContact.name}\nCancel plans with ${girlfriend.name} that day\nDelete conversations`,
      date: lang === 'es' ? 'hace 5 días' : '5 days ago',
      preview: lang === 'es' ? `Reservar ${secretRestaurant}...` : `Book ${secretRestaurant}...`,
      isPinned: false,
      isLocked: false,
      evidenceId: 'notes_suspicious'
    });
  }
  if (realEvidenceIds.includes('notes_locked')) {
    notesItems.unshift({
      title: lang === 'es' ? 'Nota privada' : 'Private note',
      body: '',
      date: lang === 'es' ? 'hace 2 días' : '2 days ago',
      preview: lang === 'es' ? 'Bloqueada con Face ID' : 'Locked with Face ID',
      isPinned: true,
      isLocked: true,
      evidenceId: 'notes_locked'
    });
  }

  return {
    instagram: { items: igItems },
    whatsapp: { items: waItems },
    revolut: { balance, items: rvItems },
    twitter: { items: twItems },
    maps: { items: mapsItems },
    gallery: { items: galItems },
    messages: { items: msgItems },
    calendar: { monthName: calMonthName, monthIdx: calMonthIdx, year: calYear, events: calEvents },
    notes: { items: notesItems }
  };
}

export function generateScenario(seed, lang) {
  const rng = createRNG(seed);
  const pools = POOLS[lang] || POOLS.es;

  const suspectName = rng.pick(pools.maleNames);
  const suspectAge = rng.nextInt(22, 35);
  const suspectJob = rng.pick(pools.jobs);
  const suspectCity = rng.pick(pools.cities);
  const suspectAvatarColor = rng.pick(AVATAR_COLORS);
  const suspectUsername = generateUsername(rng, suspectName, pools);

  const girlfriendName = rng.pick(pools.femaleNames);
  const girlfriendAvatarColor = rng.pick(AVATAR_COLORS.filter(c => c !== suspectAvatarColor));
  const girlfriendUsername = generateUsername(rng, girlfriendName, pools);

  const secretName = rng.pick(pools.femaleNames.filter(n => n !== girlfriendName));
  const secretAge = rng.nextInt(20, 32);
  const secretAvatarColor = rng.pick(AVATAR_COLORS.filter(c => c !== girlfriendAvatarColor && c !== suspectAvatarColor));
  const secretUsername = generateUsername(rng, secretName, pools);

  const outcome = rng.bool() ? 'guilty' : 'innocent';
  const monthsCheating = rng.nextInt(1, 3);
  const relationshipMonths = rng.nextInt(6, 36);

  const secretRestaurant = rng.pick(pools.romanticRestaurants);
  const hotelName = rng.pick(pools.hotels);
  const secretAddress = rng.pick(pools.addresses);
  const gymName = rng.pick(pools.gymNames);

  const { realEvidenceIds, redHerringIds } = selectEvidence(rng, outcome);

  const suspect = { name: suspectName, username: suspectUsername, age: suspectAge, job: suspectJob, city: suspectCity, avatarColor: suspectAvatarColor };
  const girlfriend = { name: girlfriendName, username: girlfriendUsername, avatarColor: girlfriendAvatarColor };
  const secretContact = { name: secretName, username: secretUsername, age: secretAge, avatarColor: secretAvatarColor };

  const appContent = generateAppContent(rng, lang, pools, {
    suspect, girlfriend, secretContact, outcome,
    realEvidenceIds, redHerringIds,
    secretRestaurant, hotelName, secretAddress, gymName, monthsCheating
  });

  return {
    seed,
    lang,
    outcome,
    suspect,
    girlfriend,
    secretContact,
    monthsCheating,
    relationshipMonths,
    secretRestaurant,
    realEvidenceIds,
    redHerringIds,
    appContent
  };
}
