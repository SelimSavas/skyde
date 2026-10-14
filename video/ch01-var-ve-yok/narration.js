/*
 * Birinci Kapı — Türkçe seslendirme metni.
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS) bağlıdır ve o vuruşun başından itibaren sırayla okunur.
 *   text    ekranda görünen alt yazı
 *   say     TTS'in okuyacağı biçim (sayılar yazıyla, simge yok); yoksa text okunur
 *   caption false ise alt yazı gösterilmez (aynı söz zaten ekranda büyük yazılı)
 * holds: konuşmanın sığması için o vuruşta görüntünün bekleyeceği ek saniyeler.
 * id'ler insan sesiyle kayıt yapılırsa dosya adıdır (narrate.mjs --engine files:<klasör> → <id>.wav).
 * Metni değiştirince: node video/narrate.mjs ch01-var-ve-yok
 */
window.NARRATION = {
  holds: {
    'two.quote': 1.7,
    'two.icons': 1.4,
    'lamps.three_four': 0.4,
    'glossary.rows': 0.2,
    'letters.answer': 1.5,
    'letters.encoding': 0.4,
    'letters.fonts': 0.1,
    'turkish.letters': 0.5,
    'turkish.master': 5.2,
    'hex.split': 0.3,
    'numbers.statement': 3.7,
    'numbers.watched': 0.3,
    'numbers.power': 3.0,
  },
  lines: [
    { id: "01-open-title", beat: "open.title", text: "Birinci Kapı. Var ve Yok: iki simgeli bir evren.", say: "Birinci kapı. Var ve yok: iki simgeli bir evren.", caption: false, offset: 0.5 },
    { id: "02-fires-one", beat: "fires.one", text: "Dağın tepesinde bir ateş yanıyor." },
    { id: "03-fires-relay", beat: "fires.relay", text: "Karşı tepedeki nöbetçi hemen kendi ateşini yakardı; ondan ötekisi, ondan berikisi." },
    { id: "04-fires-race", beat: "fires.race", text: "Böylece haber, atlının günlerce süren yolculuğunu saatlere indirirdi." },
    { id: "05-fires-question", beat: "fires.question", text: "Peki, ateş tam olarak ne söylüyordu?", caption: false },
    { id: "06-fires-answer", beat: "fires.answer", text: "Aslında tek bir şey: “Oldu.”", say: "Aslında tek bir şey: Oldu.", caption: false },
    { id: "07-two-split", beat: "two.split", text: "Yanıyorsa oldu, yanmıyorsa olmadı. İki durum: var ve yok." },
    { id: "08-two-weather", beat: "two.weather", text: "Yağmurda, siste bile ikisini ayırt edersiniz." },
    { id: "09-two-weather", beat: "two.weather", text: "Ya elli durum? Yanılırsınız." },
    { id: "10-two-quote", beat: "two.quote", text: "İki durum arasında yanılmak, elli durum arasında yanılmaktan çok daha güçtür.", caption: false },
    { id: "11-two-icons", beat: "two.icons", text: "Telefon, televizyon, banka hesabı, bu kitap. Hepsinin temeli bu." },
    { id: "12-why-analog", beat: "why.analog", text: "Bir devredeki akımın değeri sürekli oynar: sıcaklık değişir, parazit gelir." },
    { id: "13-why-digital", beat: "why.digital", text: "Ama şunu demek çok kolaydır: Akım var mı, yok mu? Var → 1. Yok → 0.", say: "Ama şunu demek çok kolaydır: akım var mı, yok mu? Var, bir. Yok, sıfır." },
    { id: "14-why-bit", beat: "why.bit", text: "Bu iki değerin her birine bit denir." },
    { id: "15-why-bit", beat: "why.bit", text: "Bit, bilişimin atomudur." },
    { id: "16-lamps-one", beat: "lamps.one", text: "Tek bir bit, bir lamba düğmesi kadardır." },
    { id: "17-lamps-two", beat: "lamps.two", text: "Yan yana iki lamba düşünün. Kaç farklı durum? Dört." },
    { id: "18-lamps-three-four", beat: "lamps.three_four", text: "Üç lamba? Sekiz durum." },
    { id: "19-lamps-three-four", beat: "lamps.three_four", text: "Her yeni lamba, olasılıkları ikiye katlar." },
    { id: "20-lamps-three-four", beat: "lamps.three_four", text: "Dört lamba? On altı." },
    { id: "21-lamps-table", beat: "lamps.table", text: "Sekiz lamba – bir avuç kadar şey – 256 durum anlatabilir.", say: "Sekiz lamba, bir avuç kadar şey, iki yüz elli altı durum anlatabilir." },
    { id: "22-lamps-byte", beat: "lamps.byte", text: "8 bitlik öbeğe bayt denir. Bir bayt, kabaca bir harftir.", say: "Sekiz bitlik öbeğe bayt denir. Bir bayt, kabaca bir harftir." },
    { id: "23-glossary-rows", beat: "glossary.rows", text: "Kilobayt kısa bir mektup, megabayt bir şarkı, gigabayt bir film." },
    { id: "24-glossary-compare", beat: "glossary.compare", text: "30 kilobaytlık metin, bir fotoğrafın yanında hiç kalır.", say: "Otuz kilobaytlık metin, bir fotoğrafın yanında hiç kalır." },
    { id: "25-letters-question", beat: "letters.question", text: "Ekrandaki “A” nedir?", say: "Ekrandaki A nedir?", caption: false },
    { id: "26-letters-answer", beat: "letters.answer", text: "“A” harfi diye bir şey yoktur. 65 sayısı vardır.", say: "A harfi diye bir şey yoktur. Altmış beş sayısı vardır.", caption: false },
    { id: "27-letters-encoding", beat: "letters.encoding", text: "Her harfe bir numara; bu anlaşmaya karakter kodlaması denir." },
    { id: "28-letters-merhaba", beat: "letters.merhaba", text: "Bellekte “MERHABA” yazmaz. Sayılar yazar; onlar da var ile yok dizisidir.", say: "Bellekte merhaba yazmaz. Sayılar yazar; onlar da var ile yok dizisidir." },
    { id: "29-letters-fonts", beat: "letters.fonts", text: "Makine harfin şeklini değil, numarasını bilir." },
    { id: "30-turkish-grid", beat: "turkish.grid", text: "İlk anlaşmayı İngilizce konuşanlar yaptı." },
    { id: "31-turkish-letters", beat: "turkish.letters", text: "ç, ğ, ı, İ, ö, ş, ü için yer yoktu.", say: "Çe, yumuşak ge, ı, büyük i, ö, şe, ü için yer yoktu." },
    { id: "32-turkish-mojibake", beat: "turkish.mojibake", text: "Aynı sayı, karşı tarafta başka bir harf oldu." },
    { id: "33-turkish-agreement", beat: "turkish.agreement", text: "Kimse art niyetli değildi; sözlükler farklıydı." },
    { id: "34-turkish-unicode", beat: "turkish.unicode", text: "Çözüm: Unicode. Dünyanın bütün yazıları, tek bir listede.", say: "Çözüm: Yunikod. Dünyanın bütün yazıları, tek bir listede." },
    { id: "35-turkish-master", beat: "turkish.master", text: "Teknolojideki sorunların çoğu teknik değil, anlaşma sorunudur.", caption: false },
    { id: "36-turkish-master", beat: "turkish.master", text: "İki taraf aynı sözlüğe bakmıyorsa, kabloların hiçbir suçu yoktur.", caption: false },
    { id: "37-hex-blur", beat: "hex.blur", text: "Uzun bit dizileri, göze işkencedir." },
    { id: "38-hex-split", beat: "hex.split", text: "Her dört biti tek simgeyle yazarız: D6.", say: "Her dört biti tek simgeyle yazarız: de altı." },
    { id: "39-hex-colors", beat: "hex.colors", text: "Web sayfalarında renkler böyle yazılır.", say: "Veb sayfalarında renkler böyle yazılır." },
    { id: "40-hex-phone", beat: "hex.phone", text: "Tıpkı telefon numarasını bölüp yazmak gibi." },
    { id: "41-numbers-photo", beat: "numbers.photo", text: "Fotoğraf, sık dokunmuş bir kumaş gibidir. Her pikselin üç sayısı vardır." },
    { id: "42-numbers-sound", beat: "numbers.sound", text: "Ses, saniyede on binlerce ölçüm." },
    { id: "43-numbers-video", beat: "numbers.video", text: "Video, saniyede 25 kare.", say: "Video, saniyede yirmi beş kare." },
    { id: "44-numbers-sensors", beat: "numbers.sensors", text: "Sıcaklık, nem, mesafe, kalp atışı: hepsi birer sayı." },
    { id: "45-numbers-statement", beat: "numbers.statement", text: "Ölçülebilen her şey sayıya çevrilebilir; sayıya çevrilen her şey işlenebilir, saklanabilir, iletilebilir.", caption: false },
    { id: "46-numbers-watched", beat: "numbers.watched", text: "Bu cümle insan için de geçerlidir.", caption: false },
    { id: "47-numbers-power", beat: "numbers.power", text: "Ölçmek, güçtür.", caption: false, offset: 0.6 },
    { id: "48-numbers-power", beat: "numbers.power", text: "Ve her güç gibi, kimin elinde olduğu sorusunu doğurur.", caption: false },
    { id: "49-close-end", beat: "close.end", text: "Var ve yok.", caption: false },
  ],
};
