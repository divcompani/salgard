'use strict';
const clues = [
  {
    title: 'بلیتِ بی‌تاریخ',
    story: 'اولین مدرک از یک صحنه آمده است؛ تاریخ روی بلیت پاک شده، اما خاطره‌اش هنوز زنده است.',
    evidence: 'هتل ترانسیلوانیا / اولین اجرا / تاریخ: …',
    question: 'اولین اجرای هتل ترانسیلوانیا چه تاریخی بود؟',
    answers: ['۵ دی', '۵ دی ماه', 'پنجم دی', 'پنجم دی ماه', 'پنج دی', 'پنج دی ماه'],
    hint: 'روز پنجمِ اولین ماه زمستان. جواب را به شکل «عدد روز + نام ماه» بنویس: «۵ دی ماه». نوشتن سال لازم نیست.',
    piece: 'ف', note: 'تاریخ به پرونده برگشت. اولین حرف آزاد شد.'
  },
  {
    title: 'ردّی بالاتر از میدان',
    story: 'مدرک دوم یک رسید است؛ نشانی‌اش معلوم است، اما اسم سفارش زیر یک لکه پنهان شده.',
    evidence: 'تهران، بالای میدان ولیعصر / یک فست‌فود / سفارش همیشگیِ تو',
    question: 'بالای میدون ولیعصر تهران یه فست‌فوده؛ چی می‌خوری اونجا؟',
    answers: ['بال سوخاری', 'بال مرغ سوخاری'],
    hint: 'یک سفارش ترد و سوخاری؛ بخش کوچکی از مرغ که اسمش یادآور پرواز است.',
    piece: 'ه', note: 'همان سفارش آشنا. یک خاطرهٔ دیگر، یک حرف دیگر.'
  },
  {
    title: 'رازِ آشپزخانهٔ خاتون',
    story: 'این بار باید به هتل برگردی. شاهد بعدی، غذایی است که نامش در خاطرهٔ آن روزها مانده.',
    evidence: 'هتل ترانسیلوانیا / آشپز: خاتون / نام غذا: …',
    question: 'غذای معروفی که خاتون توی هتل ترانسیلوانیا درست کرد چیه؟',
    answers: ['باقالی قاتق', 'باقلا قاتق', 'باقلی قاتق', 'باقالا قاتق', 'باقالی قاتوق'],
    hint: 'یک غذای گیلانی با باقالی، شوید و تخم‌مرغ؛ اسمش دو بخش دارد.',
    piece: 'ی', note: 'بوی خاطره از آشپزخانه رسید. حرف سوم پیدا شد.'
  },
  {
    title: 'شاهدانِ پشت تلویزیون',
    story: 'گزارش می‌گوید یک نفر فقط خودش تماشا نمی‌کند؛ بقیه هم باید همراهش ببینند!',
    evidence: 'شش دوست / یک کافه / و توصیه‌ای که انگار نمی‌شود ردش کرد',
    question: 'سریالی که دوست داری ببینی و همه رو مجبور می‌کنی ببینن؟',
    answers: ['فرندز', 'فرندز سریال', 'سریال فرندز', 'friends', 'فرندز!', 'دوستان'],
    hint: 'ریچل، راس، مونیکا، چندلر، جویی و فیبی. اسم فارسی یا انگلیسی سریال پذیرفته می‌شود.',
    piece: 'م', note: 'شش شاهد، یک جواب. فقط یک حرف باقی مانده.'
  },
  {
    title: 'آخرین اعتراف',
    story: 'آخرین سؤال در هیچ بایگانی‌ای ثبت نشده. جوابش را خودت بهتر از هر کارآگاهی می‌دانی.',
    evidence: 'این مدرک را با حافظه حل نکن؛ با دلت جواب بده.',
    question: 'تو دختر کوچولوی کی هستی؟',
    answers: ['امین', 'امین گلستانه', 'امینم', 'amin'],
    hint: 'اسم کوچک کسی که این پرونده را برایت نوشته؛ با «ا» شروع می‌شود.',
    piece: 'ه', note: 'اعتراف ثبت شد. هر پنج حرف حالا پیش توست.'
  }
];
const $ = id => document.getElementById(id);
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalize = s => s.normalize('NFKC').toLowerCase()
  .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[أإآ]/g, 'ا')
  .replace(/[\s\u200c\u200d\u064B-\u065F\u0670ـ.,،!؟?]/g, '');
const faNumber = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
let index = 0, solved = false, opening = false, revealTimer, inspectTimer;
const pieces = [...document.querySelectorAll('.piece')];
const steps = [...document.querySelectorAll('.step')];

function show(id) {
  ['intro', 'game', 'finalLock', 'letterView'].forEach(key => { $(key).hidden = key !== id; });
  document.body.classList.toggle('letter-mode', id === 'letterView');
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function stopInspection() {
  clearTimeout(inspectTimer);
  $('inspect').disabled = false;
  $('inspect').classList.remove('searching');
  $('casePaper').classList.remove('investigating');
}
function render() {
  stopInspection(); solved = false;
  const c = clues[index];
  $('clueNumber').textContent = 'مدرک ' + ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم'][index] + ' / از پنج مدرک';
  $('solvedCount').textContent = faNumber(index) + ' / ۵';
  $('questionTitle').textContent = c.title;
  $('story').textContent = c.story;
  $('evidence').textContent = c.evidence;
  $('question').textContent = c.question;
  $('answer').value = '';
  $('answer').removeAttribute('aria-invalid');
  $('answerForm').hidden = false;
  $('feedback').textContent = '';
  $('feedback').classList.remove('ok');
  $('hint').hidden = false; $('hint').open = false;
  $('hint').querySelector('details').open = false;
  $('inspect').setAttribute('aria-expanded', 'false');
  $('inspect').parentElement.hidden = false;
  $('hintText').textContent = c.hint;
  $('solution').textContent = 'پاسخ: ' + c.answers[0];
  $('success').hidden = true;
  steps.forEach((step, i) => {
    step.classList.toggle('active', i <= index);
    step.classList.toggle('complete', i < index);
    if (i === index) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
  $('questionTitle').focus();
}
$('inspect').onclick = () => {
  if (solved || $('inspect').disabled) return;
  $('inspect').disabled = true;
  $('inspect').classList.add('searching');
  $('casePaper').classList.add('investigating');
  inspectTimer = setTimeout(() => {
    stopInspection();
    $('hint').open = true;
    $('inspect').setAttribute('aria-expanded', 'true');
    $('hint').querySelector('summary').focus();
    $('hint').scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'instant' : 'smooth' });
  }, reducedMotion() ? 0 : 1050);
};
$('hint').addEventListener('toggle', () => $('inspect').setAttribute('aria-expanded', String($('hint').open)));
$('start').onclick = () => { show('game'); render(); switchMusic('crime'); };
$('answerForm').onsubmit = event => {
  event.preventDefault(); if (solved) return;
  const c = clues[index];
  if (!c.answers.some(answer => normalize(answer) === normalize($('answer').value))) {
    $('feedback').textContent = 'این جواب با خاطره جور نیست. دوباره فکر کن؛ ذره‌بین هم می‌تواند کمکت کند.';
    $('answer').setAttribute('aria-invalid', 'true'); playAnswerEffect(false); return;
  }
  stopInspection(); solved = true;
  $('answerForm').hidden = true; $('hint').hidden = true; $('inspect').parentElement.hidden = true;
  $('feedback').classList.add('ok'); $('feedback').textContent = 'درست کشف کردی.';
  playAnswerEffect(true);
  pieces[index].textContent = c.piece; pieces[index].classList.add('found');
  steps[index].classList.add('complete');
  $('solvedCount').textContent = faNumber(index + 1) + ' / ۵';
  $('successText').textContent = c.note + ' حرف رمز: «' + c.piece + '»';
  $('success').hidden = false;
  $('next').textContent = index === clues.length - 1 ? 'کنار هم گذاشتن رمز ←' : 'مدرک بعدی ←';
  $('next').focus();
};
$('next').onclick = () => {
  if (!solved) return;
  if (index < clues.length - 1) { index++; render(); }
  else { show('finalLock'); $('lockHeading').focus(); }
};
function finishReveal() {
  $('curtain').hidden = true;
  $('letterView').removeAttribute('inert');
  $('letterTitle').focus();
}
$('unlockForm').onsubmit = event => {
  event.preventDefault();
  if (opening || index !== clues.length - 1 || !solved) return;
  if (normalize($('password').value) !== normalize('فهیمه')) {
    $('lockFeedback').textContent = 'پنج حرف را از راست کنار هم بخوان؛ فقط اسم کوچک کافی است.'; playAnswerEffect(false); return;
  }
  opening = true;
  playAnswerEffect(true);
  switchMusic('romance');
  const curtain = $('curtain'); curtain.classList.remove('open'); curtain.hidden = false;
  show('letterView'); $('letterView').setAttribute('inert', '');
  curtain.getBoundingClientRect();
  requestAnimationFrame(() => requestAnimationFrame(() => curtain.classList.add('open')));
  revealTimer = setTimeout(finishReveal, reducedMotion() ? 60 : 1950);
};
$('restart').onclick = () => {
  clearTimeout(revealTimer); stopInspection(); index = 0; solved = false; opening = false;
  $('curtain').hidden = true; $('curtain').classList.remove('open');
  $('letterView').removeAttribute('inert');
  $('password').value = ''; $('lockFeedback').textContent = '';
  pieces.forEach(piece => { piece.textContent = '—'; piece.classList.remove('found'); });
  show('game'); render(); switchMusic('crime');
};

// Media are opt-in local assets: no requests are made for absent files.
const media = window.ANNIVERSARY_MEDIA || {};
const tracks = { crime: $('crimeAudio'), romance: $('romanceAudio') };
let musicEnabled = true, activeAudio = null, musicKind = 'crime', musicVersion = 0;
let volumeTimer;
const trackName = () => musicKind === 'crime' ? 'موسیقیِ پرونده' : 'موسیقیِ نامه';
for (const [kind, audio] of Object.entries(tracks)) {
  if (media[kind]) audio.src = media[kind];
  audio.addEventListener('error', () => {
    if (audio !== activeAudio) return;
    $('soundStatus').textContent = 'موسیقی فعلاً در دسترس نیست';
    $('soundToggle').textContent = 'تلاش دوباره';
    $('soundToggle').setAttribute('aria-pressed', 'false');
  });
}
function syncSoundUI() {
  const playing = !!activeAudio && !activeAudio.paused;
  $('soundToggle').textContent = playing ? 'توقف موسیقی' : 'پخش موسیقی';
  $('soundToggle').setAttribute('aria-pressed', String(playing));
  $('soundStatus').textContent = trackName() + (playing ? ' · در حال پخش' : ' · متوقف');
}
function switchMusic(kind) {
  musicKind = kind; const version = ++musicVersion;
  clearInterval(volumeTimer);
  Object.values(tracks).forEach(audio => { audio.pause(); audio.volume = 0.5; });
  activeAudio = media[kind] ? tracks[kind] : null;
  $('soundBar').hidden = !activeAudio;
  if (!activeAudio) return;
  activeAudio.currentTime = 0;
  syncSoundUI();
  if (musicEnabled) playMusic(version);
}
function playMusic(version = ++musicVersion) {
  const audio = activeAudio; if (!audio) return;
  audio.volume = 0.08;
  // Called directly from the start/unlock/toggle gesture for mobile autoplay rules.
  audio.play().then(() => {
    if (version !== musicVersion || audio !== activeAudio || !musicEnabled) return;
    syncSoundUI(); clearInterval(volumeTimer);
    volumeTimer = setInterval(() => {
      if (audio !== activeAudio || !musicEnabled || audio.paused) { clearInterval(volumeTimer); return; }
      audio.volume = Math.min(0.5, audio.volume + 0.035);
      if (audio.volume >= 0.5) clearInterval(volumeTimer);
    }, 75);
  }).catch(() => {
    if (version !== musicVersion || audio !== activeAudio) return;
    $('soundToggle').textContent = 'پخش موسیقی';
    $('soundToggle').setAttribute('aria-pressed', 'false');
    $('soundStatus').textContent = 'برای شنیدن، پخش را لمس کن';
  });
}
$('soundToggle').onclick = () => {
  if (!activeAudio) return;
  if (!activeAudio.paused) {
    musicEnabled = false; ++musicVersion; clearInterval(volumeTimer); activeAudio.pause(); syncSoundUI();
  } else { musicEnabled = true; playMusic(); }
};
if (media.couple) {
  const image = $('couplePhoto');
  image.addEventListener('load', () => {
    $('coupleFrame').hidden = false;
    $('photoPair').hidden = false;
  });
  image.addEventListener('error', () => { $('photoPair').hidden = true; });
  image.src = media.couple;
}

// Short, non-overlapping answer cues; sound failure must never block the game.
function playAnswerEffect(correct) {
  if (!musicEnabled) return;
  const success = $('correctAudio'), failure = $('incorrectAudio');
  success.pause(); failure.pause();
  const effect = correct ? success : failure;
  effect.currentTime = 0;
  effect.volume = 0.65;
  effect.play().catch(() => {});
}
