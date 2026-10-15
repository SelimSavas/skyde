/*
 * Birinci Kapı · 1. Kısım — Var ve Yok: İki Simgeli Bir Evren
 * Ders kitabı ve etkinlikler (Word). Çalıştırma:
 *   python3 video/kitap/kapi1-kisim1/sekiller.py   # şekiller (bir kez)
 *   node video/kitap/kapi1-kisim1/kitap.js         # → Birinci-Kapi-1-Var-ve-Yok-Ders-Kitabi.docx
 */
'use strict';
const fs = require('fs');
const path = require('path');
const {
  docx, P, runs, bullet, numbered, H1, H2, H3, videoTag, fig, box, table, lines, quote, spacer, pageBreak, numbering, RENK, CONTENT_W,
} = require('./yardimci');
const { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, PageNumber, ImageRun, BorderStyle, TabStopType } = docx;

const C = AlignmentType.CENTER;
const L = AlignmentType.LEFT;
let etk = 0;
const E = (title, children) => { etk += 1; return box('etkinlik', `${etk}. ${title}`, children); };
const mc = (q, opts, inst) => [
  new Paragraph({ children: runs(q), numbering: { reference: 'sayi', level: 0, instance: inst }, spacing: { before: 100, after: 60, line: 290 }, keepNext: true }),
  ...opts.map((o, i) => P(`${'abcd'[i]}) ${o}`, { indent: { left: 900 }, after: 30, align: L })),
];

const body = [];
const add = (...xs) => xs.flat().forEach((x) => body.push(x));

// ---------------------------------------------------------------------------
// Kullanım kılavuzu ve hedefler
// ---------------------------------------------------------------------------
add(
  new Paragraph({ heading: docx.HeadingLevel.HEADING_1, children: [new TextRun('Bu Kitabı Nasıl Kullanmalı?')], spacing: { after: 160 } }),
  P('Bu kitap, *Var ve Yok: İki Simgeli Bir Evren* videosunun yol arkadaşıdır. Video size büyük resmi gösterir; kitap ise aynı konuları yavaşça, adım adım ve kalem elde çalışmanız için açar. En iyi sonucu şu sırayla alırsınız:'),
  numbered('**Videoyu izleyin.** Yaklaşık dokuz dakikalık videoyu baştan sona, durdurmadan izleyin.', 1),
  numbered('**Üniteyi okuyun.** Her ünitenin başındaki lacivert şerit, o konunun videoda hangi dakikalara denk geldiğini gösterir. Takıldığınız yerde o bölümü yeniden izleyebilirsiniz.', 1),
  numbered('**Etkinlikleri yapın.** Kutulardaki etkinlikler okuduğunuzu elinizle denemeniz içindir. Bazıları tek başına, bazıları arkadaşlarınızla yapılır.', 1),
  numbered('**Kendinizi deneyin.** Kitabın sonundaki sorularla neyi iyi anladığınızı, neyi tekrar etmeniz gerektiğini görün. Cevaplar en sondadır; önce kendiniz deneyin!', 1),
  spacer(80),
  H3('Kutuların anlamı'),
  table(['Kutu', 'Ne işe yarar?'], [
    ['**ANAHTAR KAVRAM**', 'Ünitenin en önemli terimi ve tanımı. Bunları bilmek, sonraki bölümleri anlamanın anahtarıdır.'],
    ['**BİLİYOR MUYDUNUZ?**', 'Konuyla ilgili ilginç bilgiler ve tarihten hikâyeler.'],
    ['**DİKKAT: YAYGIN YANILGI**', 'Pek çok kişinin yanlış bildiği bir noktayı düzeltir.'],
    ['**ETKİNLİK**', 'Kalem, kâğıt, makas ya da bir arkadaşla yapılacak uygulama.'],
    ['**DÜŞÜN VE TARTIŞ**', 'Tek bir doğru cevabı olmayan, sınıfta ya da evde konuşulacak sorular.'],
  ], [3000, CONTENT_W - 3000], { zebra: true }),
  spacer(160),
  H3('Gerekenler'),
  P('Kurşun kalem ve silgi, renkli kalemler (kırmızı, turuncu, sarı, kahverengi), makas, bir el feneri ya da telefon feneri, birkaç yaprak beyaz kâğıt. Hesap makinesi bazı etkinliklerde işinizi kolaylaştırır.'),
  spacer(80),
  H3('Bu bölümün sonunda…'),
  bullet('Bilginin neden iki durumla (var/yok, 1/0) taşındığını açıklayabileceksiniz.'),
  bullet('Bit ve baytın ne olduğunu söyleyip *n* bitle kaç farklı durum kurulabileceğini hesaplayabileceksiniz.'),
  bullet('İkilik sayıları onluğa, onluk sayıları ikiliğe çevirebileceksiniz.'),
  bullet('Kilobayt, megabayt, gigabayt ve terabaytı karşılaştırabileceksiniz.'),
  bullet('Harflerin bilgisayarda nasıl sayı olarak saklandığını anlatabileceksiniz.'),
  bullet('Türkçe harflerin neden bazen bozuk göründüğünü ve Unicode’un bunu nasıl çözdüğünü açıklayabileceksiniz.'),
  bullet('On altılık sayıları okuyup web renk kodlarını çözebileceksiniz.'),
  bullet('Fotoğrafın, sesin ve videonun nasıl sayıya dönüştüğünü anlatabileceksiniz.'),
  bullet('Kişisel verilerin ölçülmesinin güç ve sorumluluk doğurduğunu tartışabileceksiniz.'),
);

// İçindekiler (videodaki sıra ve dakikalarla)
add(
  ...H1('', 'İçindekiler'),
  table(['', 'Ünite', 'Videoda'], [
    ['1', 'Tepeden Tepeye Ateş', '0:09'],
    ['2', 'İki Durum: Var ve Yok', '0:40'],
    ['3', 'Neden Sadece İki? Elektrik, Gürültü ve Eşik', '1:24'],
    ['4', 'Yan Yana Dizmenin Bereketi', '2:23'],
    ['5', 'Bayt ve İkilik Sayılar', '3:20'],
    ['6', 'Sözlük Kenarı: Kilo, Mega, Giga, Tera', '3:58'],
    ['7', 'Harf Nasıl Sayı Olur?', '4:20'],
    ['8', 'Türkçenin Kayıp Harfleri', '5:13'],
    ['9', 'On Altılık Düzen ve Renk Kodları', '6:33'],
    ['10', 'Her Şey Sayıya Dönüşebilir mi?', '7:51'],
    ['11', 'Ölçmek Güçtür', '8:50'],
    ['', 'Bölüm Özeti ve Kavram Sözlüğü', ''],
    ['', 'Kendini Değerlendir', ''],
    ['', 'Proje: Kendi Kodlamanı Yarat', ''],
    ['', 'Cevap Anahtarı ve Öğretmene Notlar', ''],
  ], [700, CONTENT_W - 700 - 1500, 1500], { zebra: true, pad: 90, size: 22, align: [C, L, C] }),
  spacer(200),
  ...fig('video_oldu.jpg', 15, 'Videodan: “Ateş tam olarak ne söylüyordu? Aslında tek bir şey: Oldu.”'),
);

// ---------------------------------------------------------------------------
// Ünite 1 · Tepeden tepeye ateş
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 1', 'Tepeden Tepeye Ateş'),
  videoTag('0:09 – 0:40', 'Dağın tepesinde bir ateş yanıyor'),
  ...fig('video_ates.jpg', 15.5, 'Videodan bir kare: Tepede yanan ateş, önceden kararlaştırılmış tek bir anlam taşır.'),
  P('Telefon, radyo ve internetten çok önce de insanlar uzak yerlere hızla haber göndermenin yollarını aradı. Bunlardan biri, tepelere yerleştirilen nöbetçilerin yaktığı ateşlerdi. Kural önceden konuşulurdu: **Tepede ateş yanarsa düşman sınırı geçmiş demektir.**'),
  P('Bir nöbetçi uzaktaki ateşi görünce kendi tepesindeki odunları tutuştururdu; onu gören bir sonraki nöbetçi de aynısını yapardı. Haber böylece tepeden tepeye, zincirleme yayılırdı. Bir atlının günlerce süren yolculuğu, ateş zinciriyle saatlere inerdi.'),
  ...fig('haber_zinciri.png', 15.5, 'Şekil 1.1 · Haber zinciri: Her nöbetçi, bir önceki tepedeki ateşi görünce kendi ateşini yakar.'),
  H2('Ateş ne söylüyordu?'),
  P('Ateş; düşmanın kim olduğunu, kaç kişi olduğunu, nereden geldiğini anlatamazdı. Aslında tek bir şey söylerdi: **“Oldu.”** Ateş yanıyorsa beklenen olay gerçekleşmiştir; yanmıyorsa gerçekleşmemiştir. Bu ünitenin ve bütün kitabın ana fikri, bu basit gözlemde saklıdır.'),
  P('Ateşin kendisi bir anlam taşımaz; anlamı, gönderenle alanın önceden yaptığı anlaşmadan gelir. Aynı ateş başka bir ülkede “hasat başladı” anlamına gelebilirdi.'),
  box('kavram', 'Kod', ['**Kod**, önceden üzerinde anlaşılmış anlamdır. İşaretin (ateş, ışık, elektrik…) kendisi bir şey söylemez; ona anlamı, gönderen ile alanın ortak anlaşması verir.']),
  box('biliyor', null, [
    'Ateşle ve dumanla haberleşme dünyanın pek çok yerinde kullanıldı. Yaklaşık 2.500 yıl önce yazılmış bir Antik Yunan oyununda, Truva’nın düştüğü haberinin tepeden tepeye yakılan ateşlerle tek gecede yüzlerce kilometre uzağa ulaştığı anlatılır. Çin Seddi’nin gözetleme kulelerinde de gündüz duman, gece ateş işaretleri kullanılırdı.',
  ]),
  E('Haber Zinciri Hesabı', [
    'Şekil 1.1’deki tepeler arası uzaklık 20 km’dir. Her nöbetçi ateşi gördükten sonra kendi ateşini yakmak için **3 dakika** harcar. Işık bir tepeden ötekine neredeyse anında ulaşır. Bir atlı ise saatte **15 km** yol alır.',
    'a) Haber 1. tepeden 6. tepeye ateş zinciriyle kaç dakikada ulaşır?',
    ...lines(1),
    'b) Aynı uzaklığı (5 × 20 km) atlı kaç saatte, yani kaç dakikada alır?',
    ...lines(1),
    'c) Ateş zinciri atlıdan yaklaşık kaç kat hızlıdır?',
    ...lines(1),
  ]),
  E('Sınıfta Işık Zinciri (grup etkinliği)', [
    'Sınıf, herkes yalnızca önündeki arkadaşını görecek biçimde sıraya dizilir. Kural basittir: Önündeki elini kaldırınca sen de kaldır.',
    '1. Öğretmen ilk öğrenciye yalnızca “tehlike var” bilgisini verir (elini kaldırır). Son öğrencinin elini kaldırması kaç saniye sürdü? Ölçün.',
    '2. Şimdi aynı zinciri fısıltıyla deneyin: İlk öğrenciye “Kuzeyden kırk iki atlı ve üç araba geliyor” cümlesi fısıldansın; herkes duyduğunu arkadaşına fısıldasın.',
    'Hangi yöntem daha hızlıydı? Hangisinde bilgi bozuldu? Nedenini aşağıya yazın.',
    ...lines(2),
  ]),
  box('tartis', null, [
    'Bugün hangi cihazlar ateş gibi “oldu / olmadı” türünden tek bir bilgi verir? (Örnek: yangın alarmı.) En az üç örnek bulun ve her birinin “oldu” durumunda neyi haber verdiğini yazın.',
    ...lines(2),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 2 · İki durum
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 2', 'İki Durum: Var ve Yok'),
  videoTag('0:40 – 1:24', 'İki durum mu, elli durum mu?'),
  P('Ateşle daha fazla bilgi göndermek istediğimizi düşünelim. Ateşin büyüklüğüne anlam yükleyebiliriz: **biraz** yanarsa “asker geliyor”, **yarı** yanarsa “gemi geliyor”, **gürül gürül** yanarsa “savaş başladı”. Hatta elli farklı büyüklüğe elli farklı haber yükleyebiliriz. Kâğıt üzerinde harika bir fikir gibi görünür.'),
  ...fig('video_yagmur.jpg', 15.5, 'Videodan bir kare: Yağmurda iki durumu ayırt etmek kolaydır; elli durumda kolayca yanılırsınız.'),
  P('Ama şimdi bir gece yağmur yağdığını, sisin çöktüğünü, nöbetçinin de yorgun olduğunu düşünün. Uzaktaki ateşin “biraz mı” yoksa “yarı mı” yandığını kestirmek neredeyse imkânsızdır. Elli durumdan birini yanlış okumak çok kolaydır; yanlış okunan bir haber ise, hiç gelmeyen haberden daha tehlikeli olabilir.'),
  P('Oysa iki durum arasında karar vermek her koşulda kolaydır: **Ateş yanıyor mu, yanmıyor mu?** Sis ne kadar yoğun olursa olsun, nöbetçi bunu görür.'),
  ...quote('İki durum arasında yanılmak, elli durum arasında yanılmaktan çok daha güçtür.'),
  P('Bu tek cümle telefonların, bilgisayarların, banka hesaplarının, dijital fotoğrafların ve bu kitabın da temelidir. Modern makineler bilgiyi iki durumla taşır; çünkü **iki durum, bozulmaya karşı en dayanıklı yoldur.**'),
  box('kavram', 'Gürültü', ['**Gürültü**, sinyali bozan istenmeyen etkilerin genel adıdır: sis, yağmur, parazit, ısınma… Bir sistem ne kadar az durumu birbirinden ayırt etmek zorundaysa gürültüye o kadar dayanıklıdır.']),
  E('Sisli Gözlem Deneyi (iki kişiyle)', [
    '**Malzeme:** el feneri (ya da telefon feneri), 8 yaprak beyaz kâğıt.',
    '1. Gönderen, gözlemcinin göremeyeceği biçimde fenerin önüne 0, 1, 2, 3 ya da 4 yaprak kâğıt koyar. Böylece 5 farklı parlaklık elde edilir.',
    '2. Gözlemci 3 metre uzaktan ışığa bakar ve kaç yaprak kâğıt olduğunu tahmin eder. 10 deneme yapın; doğru tahminleri sayın.',
    '3. Şimdi yalnızca iki durum kullanın: fener açık ya da kapalı. Yine 10 deneme yapın.',
    '4. **Sis ekleyin:** Gözlemcinin gözünün önüne 2 yaprak kâğıt tutun ve iki deneyi tekrarlayın.',
    table(['Deney', 'Durum sayısı', 'Doğru tahmin (10 denemede)'], [
      ['Parlaklıkla haber', '5', ''], ['Açık / kapalı', '2', ''], ['Parlaklıkla haber + sis', '5', ''], ['Açık / kapalı + sis', '2', ''],
    ], [3600, 2000, 3400], { align: [L, C, C], rowHeight: 420 }),
    spacer(60),
    'Hangi düzende daha az hata yaptınız? Sis eklenince hangi düzen daha çok etkilendi? Bilgisayarlar neden iki durumu seçmiş olabilir?',
    ...lines(3),
  ]),
  box('tartis', null, [
    'Bir trafik ışığının yalnızca üç durumu vardır: kırmızı, sarı, yeşil. Yirmi farklı renk tonuyla yirmi farklı anlam taşıyan bir trafik ışığı neden tehlikeli olurdu? Ünitede öğrendiklerinizle açıklayın.',
    ...lines(2),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 3 · Neden sadece iki?
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 3', 'Neden Sadece İki? Elektrik, Gürültü ve Eşik'),
  videoTag('1:24 – 2:23', 'Volt, parazit ve eşik çizgisi'),
  P('Bugünün makineleri ateş yerine **elektrik** kullanır. Bir teldeki elektriğin ne kadar güçlü “ittiğini” **volt** denen birimle ölçeriz. Telefon şarj aletinin çıkışı 5 volttur; bir kalem pil 1,5 volt.'),
  P('Volt değerini çok hassas kullanmak cazip görünebilir: 3,74 volt bir anlama, 3,75 volt başka bir anlama gelsin… Ama gerçek dünyada bu değer hiç yerinde durmaz. Sıcaklık değişir, kabloların direnci artar, yakındaki devrelerden parazit gelir. 3,74 volt dediğiniz değer bir saniye sonra 3,71 olabilir. Elli durumlu ateşin yaşadığı sorunun aynısı!'),
  P('Bu yüzden makine çok daha kolay bir soru sorar: **Elektrik var mı, yok mu?** Ortaya bir çizgi çekilir; buna **eşik** denir. Ölçülen değer eşiğin üstündeyse “var”, yani **1**; altındaysa “yok”, yani **0** kabul edilir. Değer biraz oynasa bile eşiğin aynı tarafında kaldıkça cevap değişmez.'),
  ...fig('video_esik.jpg', 15.5, 'Videodan bir kare: Dalgalanan voltaj, eşik çizgisi sayesinde temiz bir 0 ve 1 dizisine dönüşür.'),
  box('kavram', 'Bit', [
    '**Bit** (İngilizce *binary digit*, “ikili basamak”), yalnızca 0 ya da 1 değerini alabilen bilgi birimidir. Bilginin bölünemeyen en küçük parçasıdır; bu yüzden **bilişimin atomu** diye anılır.',
    'Tek bir bit çok az şey söyler: evet ya da hayır, açık ya da kapalı, var ya da yok. Ama bitleri yan yana dizdiğimizde ortaya şaşırtıcı bir güç çıkar (Ünite 4).',
  ]),
  box('yanilgi', null, [
    '“Bilgisayarın içinde 0 ve 1 rakamları dolaşır.” **Hayır!** Bilgisayarın içinde rakam yoktur; yalnızca eşiğin üstünde ya da altında kalan elektrik vardır. 0 ve 1, bu iki durumu adlandırmak için **bizim** kullandığımız etiketlerdir. Aynı iki durumu “açık/kapalı”, “var/yok” ya da “evet/hayır” diye de adlandırabilirdik.',
  ]),
  E('Gürültülü Sinyali Oku', [
    'Grafikte bir telden 10 zaman diliminde ölçülen voltaj görülüyor. **Eşik 1,65 volttur.** Her zaman diliminde sinyal eşiğin üstündeyse alttaki kutuya **1**, altındaysa **0** yazın.',
    ...fig('volt_esik.png', 15.5),
    'a) Okuduğunuz bit dizisi: ……………………………………………',
    'b) 4. dilimdeki aşağı doğru iniş ve 6. dilimdeki yukarı sıçrama okuduğunuz biti değiştirdi mi? Neden?',
    ...lines(2),
    'c) Eşik 1,65 volt değil de 3 volt olsaydı ne gibi bir sorun çıkabilirdi?',
    ...lines(2),
  ]),
  box('biliyor', null, ['Telefonunuzdaki işlemcide “var” ile “yok” arasındaki fark yalnızca **1 volt civarındadır** ve her bir minik anahtar bu iki durum arasında saniyede milyarlarca kez gidip gelir. Eşik fikri sayesinde bu kadar küçük ve hızlı sinyaller bile güvenle okunabilir.']),
);

// ---------------------------------------------------------------------------
// Ünite 4 · Yan yana dizmenin bereketi
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 4', 'Yan Yana Dizmenin Bereketi'),
  videoTag('2:23 – 3:20', 'Bir, iki, üç, dört lamba…'),
  P('Bir lamba iki durum gösterir: sönük (**0**) ya da yanık (**1**). İki lambayı yan yana dizelim. Artık dört durum vardır: **00, 01, 10, 11** (kapalı-kapalı, kapalı-açık, açık-kapalı, açık-açık).'),
  P('Üç lambada sekiz durum vardır. Nedenini görmek için şöyle düşünün: Yeni eklenen lamba **sönükken**, öteki iki lambanın dört durumu aynen kurulabilir. Yeni lamba **yanarken** de aynı dört durum bir kez daha kurulur. **4 + 4 = 8.**'),
  ...fig('video_uc_lamba.jpg', 15, 'Videodan bir kare: Üç lambanın sekiz durumu, yeni lamba sönükken dört, yanarken dört.'),
  P('Aynı akıl yürütme her lamba için geçerlidir: **Her yeni lamba, durum sayısını ikiye katlar.** n lambayla kurulabilecek durum sayısı 2 × 2 × … × 2 (n tane), kısaca **2ⁿ**’dir.'),
  ...fig('katlama.png', 14.5, 'Şekil 4.1 · Lamba (bit) sayısı arttıkça durum sayısı ikiye katlanarak büyür.'),
  P('Katlamanın gücünü sezgimiz kavramakta zorlanır. 10 lamba **1.024**, 20 lamba yaklaşık **1 milyon**, 32 lamba ise **4.294.967.296**, yani dört milyardan fazla durum demektir. Yalnızca 32 lambayla, dünyadaki her iki insandan birine ayrı bir numara verebilirsiniz!'),
  box('biliyor', 'Satranç tahtası ve pirinç', [
    ...fig('satranc.png', 6.2),
    'Bir efsaneye göre satrancın mucidi, ödül olarak tahtanın ilk karesine 1, ikincisine 2, üçüncüsüne 4 pirinç tanesi istemiş; her kareye bir öncekinin iki katı. Hükümdar bu isteği önemsiz bulup gülmüş. Oysa yalnızca son karede 2⁶³, yani yaklaşık **9,2 kentilyon** (9.200.000.000.000.000.000) tane pirinç olması gerekir. Bu, dünyanın yüzlerce yılda üretebileceğinden fazladır.',
  ]),
  E('Bütün Durumları Yaz', [
    'Üç lambanın 8 durumunu, hiçbirini atlamadan yazın. Yanan lamba için **1**, sönük lamba için **0** kullanın. İpucu: Videodaki gibi önce ilk lamba sönükken dört durumu, sonra yanıkken dört durumu yazın.',
    table(['Durum', '1. lamba', '2. lamba', '3. lamba'], [1, 2, 3, 4, 5, 6, 7, 8].map((i) => [String(i), '', '', '']), [1800, 2300, 2300, 2300], { align: [C, C, C, C], rowHeight: 380, center: true }),
    spacer(60),
  ]),
  E('Katlama Tablosu', [
    'Tabloyu doldurun. Son iki satırda önce **tahmin** edin, sonra hesap makinesiyle hesaplayın.',
    table(['Lamba sayısı', 'Durum sayısı', '', 'Lamba sayısı', 'Tahminim', 'Hesap'], [
      ['1', '2', '', '10', '—', ''], ['2', '4', '', '16', '', ''], ['3', '', '', '20', '', ''], ['4', '', '', '24', '', ''],
      ['5', '', '', '32', '', ''], ['6', '', '', '40', '', ''], ['7', '', '', '', '', ''], ['8', '', '', '', '', ''],
    ], [1500, 1500, 300, 1500, 2100, 2100], { align: [C, C, C, C, C, C], rowHeight: 360 }),
    spacer(60),
    'Tahminleriniz gerçek değerlere yakın mıydı? Sezginiz hangi satırda en çok yanıldı?',
    ...lines(1),
  ]),
  box('tartis', null, ['Bir telefonun 4 haneli şifresinde kaç farklı şifre olabilir? (Her hanede 0–9 arası 10 rakam vardır.) Şifreye bir hane daha eklenince olasılıklar kaç katına çıkar? Bu, lambalardaki katlamaya nasıl benziyor, nasıl farklı?', ...lines(2)]),
);

// ---------------------------------------------------------------------------
// Ünite 5 · Bayt ve ikilik sayılar
// ---------------------------------------------------------------------------
const bitTable = (bits, extra) => table(['128', '64', '32', '16', '8', '4', '2', '1', ...(extra ? ['Toplam'] : [])],
  [bits.split('').concat(extra ? [extra] : [])], [...Array(8).fill(1000), ...(extra ? [1500] : [])], { align: Array(9).fill(C), center: true, size: 24 });
add(
  ...H1('ÜNİTE 5', 'Bayt ve İkilik Sayılar'),
  videoTag('3:20 – 3:58', 'Her lambanın bir değeri vardır'),
  P('Sekiz bit yan yana gelince buna **bayt** denir. Bir bayt 2⁸ = **256** farklı durum gösterebilir.'),
  P('Bu durumları sayılara çevirmenin akıllıca bir yolu vardır: Her lambaya bir **değer** verilir. En sağdaki lamba **1**, solundaki **2**, sonra **4, 8, 16, 32, 64, 128.** Her değer, sağındakinin iki katıdır. Bir sayıyı okumak için yalnızca **yanan lambaların değerleri toplanır.**'),
  ...fig('video_bayt.jpg', 11, 'Videodan bir kare: Sekiz bitin değerleri 128’den 1’e; bütün lambalar yanınca 255.'),
  H3('Örnek: 00001101 kaçtır?'),
  bitTable('00001101', '13'),
  spacer(60),
  P('Yanan lambalar 8, 4 ve 1’dir: **8 + 4 + 1 = 13.** Hepsi sönükken **0**, hepsi yanıkken 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = **255** olur. Bir bayt, sıfırla birlikte 0’dan 255’e kadar **256 sayı** tutabilir.'),
  P('Bu yazma biçimine **ikilik (ikili) sayı sistemi** denir. Günlük hayatta kullandığımız onluk sistemde basamak değerleri 1, 10, 100, 1.000 diye **onar onar** büyür; ikilik sistemde 1, 2, 4, 8 diye **ikişer ikişer** büyür. Onluk sistemde her basamakta on rakam (0–9), ikilik sistemde yalnızca iki rakam (0 ve 1) vardır.'),
  H3('Onluktan ikiliğe çevirmek'),
  P('En büyük değerden başlayın. Sayı o değere **sığıyorsa** lambayı yakın (1) ve değeri sayıdan çıkarın; sığmıyorsa sönük bırakın (0). Örnek: **200**'),
  bullet('128 sığar → 1, kalan 72'),
  bullet('64 sığar → 1, kalan 8'),
  bullet('32 sığmaz → 0;  16 sığmaz → 0'),
  bullet('8 sığar → 1, kalan 0;  4, 2, 1 sığmaz → 0, 0, 0'),
  bitTable('11001000', '200'),
  spacer(80),
  box('biliyor', 'Parmaklarla 1.023’e kadar', ['Bir elinizin beş parmağına sağdan sola 1, 2, 4, 8, 16 değerlerini verin. Kalkan parmak 1, inik parmak 0 olsun. Tek elle 0’dan **31**’e, iki elle 0’dan **1.023**’e kadar sayabilirsiniz!']),
  E('Bit Kartları (kes ve oyna)', [
    'Aşağıdaki beş kartı kesin ve masaya **16, 8, 4, 2, 1** sırasıyla dizin. Noktaları görünen kart **1**, ters çevrilmiş kart **0** demektir. *(Bu etkinlik, dünyada yaygın kullanılan “bilgisayarsız bilişim” etkinliklerinden uyarlanmıştır.)*',
    ...fig('bit_kartlari.png', 15.5),
    'a) Yalnızca 8 ve 2 kartı açıkken kaç nokta görüyorsunuz? İkilik yazımı nedir? ……………………',
    'b) 13 noktayı hangi kartlarla gösterirsiniz? İkilik yazımı nedir? ……………………',
    'c) Beş kartla gösterebileceğiniz en büyük sayı kaçtır? ……………………',
    'd) Kartlarla 0’dan 31’e kadar birer birer sayın. En sağdaki kart her adımda ne yapıyor? 2 kartı ne zaman çevriliyor?',
    ...lines(2),
  ]),
  E('Çeviri Alıştırması', [
    table(['İkilik → Onluk', 'Cevap', '', 'Onluk → İkilik', 'Cevap'], [
      ['`00000101`', '', '', '9', ''], ['`00010000`', '', '', '33', ''], ['`00101010`', '', '', '77', ''], ['`01100100`', '', '', '128', ''], ['`11111111`', '', '', '250', ''],
    ], [2200, 1900, 300, 1900, 2700], { align: [C, C, C, C, C], rowHeight: 400, size: 22 }),
    spacer(40),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 6 · Sözlük kenarı
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 6', 'Sözlük Kenarı: Kilo, Mega, Giga, Tera'),
  videoTag('3:58 – 4:20', 'Bayttan terabayta'),
  P('Bir bayt, kabaca **bir harf** tutar. Daha büyük miktarları anlatmak için kilogramdaki gibi ön ekler kullanılır. “Kilo” **bin** demektir; her basamak bir öncekinin bin katıdır.'),
  table(['Birim', 'Kısaltma', 'Yaklaşık bayt', 'Ne sığar?'], [
    ['Bit', '—', '1/8 bayt', 'Tek bir 0 ya da 1'],
    ['Bayt', 'B', '1', 'Bir harf'],
    ['Kilobayt', 'KB', '1.000', 'Kısa bir mektup'],
    ['Megabayt', 'MB', '1.000.000', 'Bir şarkı ya da iyi bir fotoğraf (birkaç MB)'],
    ['Gigabayt', 'GB', '1.000.000.000', 'Bir film (bir-iki GB)'],
    ['Terabayt', 'TB', '1.000.000.000.000', 'Küçük bir kütüphanenin bütün kitapları'],
  ], [1700, 1300, 2600, CONTENT_W - 5600], { zebra: true, align: [L, C, AlignmentType.RIGHT, L] }),
  spacer(120),
  P('Bir karşılaştırma: Otuz bin harflik bir metin yaklaşık **30 kilobayttır**. Tek bir telefon fotoğrafı ise bunun yüz katı kadar, yani **birkaç megabayt** yer kaplar. Bir resim gerçekten de bin sözcükten fazlasını “tartar”.'),
  ...fig('video_sozluk.jpg', 12, 'Videodan bir kare: Sözlük kenarı.'),
  box('biliyor', '1.000 mi, 1.024 mü?', ['Bilgisayarlar ikilik düzende çalıştığı için bazen 1.000 yerine 2¹⁰ = **1.024** kullanılır. Karışıklığı önlemek için bu büyüklüklere ayrı adlar verilmiştir: kibibayt (KiB), mebibayt (MiB), gibibayt (GiB). Yeni aldığınız 1 TB’lık bir diskin bilgisayarda yaklaşık **931 GB** görünmesinin nedeni budur: Üretici 1.000’lerle, işletim sistemi 1.024’lerle sayar.']),
  E('Telefonum Ne Kadar Tutar?', [
    'Bir telefonun **128 GB** depolama alanı olsun (1 GB = 1.000 MB alın).',
    'a) Ortalama bir fotoğraf 4 MB ise kaç fotoğraf sığar? ……………………',
    'b) Bir şarkı 5 MB ise kaç şarkı sığar? ……………………',
    'c) Bir film 2 GB ise kaç film sığar? ……………………',
    'd) Kendi telefonunuzun ya da evdeki bir bilgisayarın depolama alanını öğrenin ve aynı hesabı yapın.',
    ...lines(2),
  ]),
  E('Büyükten Küçüğe Sırala', [
    'Aşağıdaki miktarları en büyükten en küçüğe sıralayın. İpucu: Hepsini önce megabayta çevirin.',
    P('**2 GB  ·  500 MB  ·  3.000 KB  ·  0,001 TB  ·  1.500.000 B**', { align: C }),
    ...lines(1),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 7 · Harf nasıl sayı olur?
// ---------------------------------------------------------------------------
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
add(
  ...H1('ÜNİTE 7', 'Harf Nasıl Sayı Olur?'),
  videoTag('4:20 – 5:13', 'A harfi aslında 65’tir'),
  P('Makine yalnızca 0 ve 1 biliyorsa, ekranda gördüğümüz **A** harfi nedir? Yanıt şaşırtıcıdır: Makinenin içinde “A harfi” diye bir şey yoktur; **65 sayısı** vardır.'),
  P('İnsanlar bir anlaşma yaptı: Her harfe, rakama ve işarete bir numara verildi. Bu anlaşmaya **karakter kodlaması** denir. En eski ve en yaygın olanı, 1963’te hazırlanan **ASCII**’dir (Amerikan Standart Bilgi Değişim Kodu).'),
  table(null, [ABC.slice(0, 13), ABC.slice(0, 13).map((c) => String(c.charCodeAt(0))), ABC.slice(13), ABC.slice(13).map((c) => String(c.charCodeAt(0)))],
    Array(13).fill(Math.floor(CONTENT_W / 13)), { align: Array(13).fill(C), size: 21, zebra: true, center: true }),
  spacer(80),
  P('Birkaç kural daha: **boşluk** 32, rakamlar **0–9** sırasıyla 48–57, küçük harfler **a–z** ise 97–122’dir. Küçük harfin kodu, büyük harfin kodundan tam **32 fazladır**: A = 65, a = 97.'),
  P('MERHABA sözcüğü bellekte harf olarak durmaz; **77 69 82 72 65 66 65** sayıları olarak durur. Bu sayılar da, bildiğimiz gibi, bit dizileri olarak saklanır: 65 = 64 + 1 = `01000001`.'),
  ...fig('video_merhaba.jpg', 15.5, 'Videodan bir kare: MERHABA, bellekte yedi sayı ve yedi bayttır.'),
  P('Harfin ekrandaki şeklini ise **yazı tipi (font)** çizer. Makine yalnızca harfin numarasını bilir; aynı 65 numarası bir yazı tipinde sade, ötekinde süslü bir A olarak görünür.'),
  box('kavram', 'Karakter kodlaması', ['**Karakter kodlaması**, harflere, rakamlara ve işaretlere numara veren ortak sözlüktür. Gönderen ile alan aynı sözlüğü kullandıkça yazı doğru görünür (Ünite 1’deki ateşin anlamını hatırlayın: anlam, anlaşmadan gelir).']),
  box('yanilgi', null, ['“7 rakamı bilgisayarda 7 olarak saklanır.” Metin içindeki **“7” karakterinin kodu 55’tir**; hesap yapılan 7 sayısı ise `00000111` olarak saklanır. Bir telefon numarası ya da posta kodu, çoğu zaman sayı değil, karakter dizisi olarak tutulur.']),
  E('Gizli Mesaj', [
    'Aşağıdaki sayılar ASCII ile yazılmış bir mesajdır. Tabloyu kullanarak çözün.',
    P('`66 73 76 71 73 32 71 85 67 84 85 82`', { align: C }),
    'Mesaj: ……………………………………………',
    'Bu kez mesaj bit dizisi olarak geldi: `01001111  01001011`  →  ……………………',
    'Çözdüğünüz ilk mesajda Türkçe harfler neden eksik? Tahmininizi yazın (cevap bir sonraki ünitede):',
    ...lines(1),
  ]),
  E('Adını Kodla', [
    'Adınızı büyük harflerle yazıp her harfin ASCII kodunu bulun. Sonra ilk iki harfi sekizer bitlik baytlara çevirin.',
    table(['Harf', '', '', '', '', '', '', ''], [['Kod', '', '', '', '', '', '', ''], ['Bitler (ilk iki harf)', '', '', '', '', '', '', '']],
      [2300, ...Array(7).fill(Math.floor((CONTENT_W - 2300 - 400) / 7))], { align: Array(8).fill(C), rowHeight: 460, headFill: '6B7280' }),
    spacer(40),
    'Adınızda Ç, Ğ, İ, Ö, Ş ya da Ü varsa ne oldu? Not edin.',
    ...lines(1),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 8 · Türkçenin kayıp harfleri
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 8', 'Türkçenin Kayıp Harfleri'),
  videoTag('5:13 – 6:33', 'Ç, Ğ, I, İ, Ö, Ş, Ü nereye sığdı?'),
  P('ASCII’yi İngilizce konuşanlar hazırladı. 26 harfli alfabeleri, rakamlar ve işaretler için **128 yer** ayırdılar (0–127); içine sığdı, arttı bile. Oysa bir bayt **256 yer** sunar: Listenin öteki yarısı (128–255) boş kalmıştı.'),
  ...fig('video_ascii.jpg', 9.5, 'Videodan bir kare: İlk anlaşma, 128 yer.'),
  P('Türkçenin **ç, ğ, ı, İ, ö, ş, ü** harfleri (ve büyükleri) bu listede yoktu. Her ülke boş kalan yarıya kendi harflerini yerleştirdi; ama herkes **farklı yere**. Türkçe için hazırlanan listede (ISO 8859-9) **240** numaralı yerde **ğ** harfi vardı; Batı Avrupa listesinde (ISO 8859-1) ise aynı yerde İzlanda dilinin **ð** harfi duruyordu.'),
  P('Bir belge gönderdiğinizde yola harf değil, **sayı** çıkar. Karşı taraf başka bir listeye bakıyorsa “ağaç” yazdığınız yerde “aðaç” okur. Bu bozulmaya İngilizcede *mojibake* (Japonca “bozulmuş karakter”) denir.'),
  ...fig('video_bozuk_harf.jpg', 15, 'Videodan bir kare: Aynı sayı, iki farklı sözlükte iki farklı harf.'),
  table(['Türkçe harf', 'Kodu (Türkçe liste)', 'Batı Avrupa listesinde görünen'], [
    ['ğ', '240', 'ð'], ['Ğ', '208', 'Ð'], ['ı', '253', 'ý'], ['İ', '221', 'Ý'], ['ş', '254', 'þ'], ['Ş', '222', 'Þ'], ['ç, ö, ü (ve büyükleri)', '231, 246, 252', 'aynı kalır'],
  ], [3000, 2900, CONTENT_W - 5900], { align: [C, C, C], zebra: true, size: 22 }),
  spacer(120),
  H2('Çözüm: Tek bir dev sözlük'),
  P('Kalıcı çözüm, dünyadaki bütün yazıları tek bir dev listede toplamak oldu: **Unicode** (Türkçe okunuşuyla Yunikod). Türkçe harfler, Çince karakterler, Arap ve Kiril alfabeleri, hatta emojiler bu listededir. Artık **ğ** her yerde aynı numaradır: **287**. 287, 255’ten büyük olduğu için tek bayta sığmaz; en yaygın Unicode yazım biçimi olan **UTF-8**, ğ harfini **iki baytla** saklar.'),
  ...fig('video_unicode.jpg', 10.5, 'Videodan bir kare: Dünyanın bütün yazıları, tek liste.'),
  ...quote('Teknolojideki sorunların çoğu teknik değil, anlaşma sorunudur. İki taraf aynı sözlüğe bakmıyorsa, kabloların hiçbir suçu yoktur.'),
  box('biliyor', null, [
    'Unicode’da bugün **150.000’den fazla** karakter vardır ve her yıl yenileri eklenir. Web sayfalarının neredeyse tamamı artık UTF-8 kullanır.',
    '**Türkçe I sorunu:** Türkçede küçük i’nin büyüğü **İ**, ı’nın büyüğü **I**’dır. İngilizce kuralına göre çalışan programlar “istanbul” sözcüğünü büyütürken “ISTANBUL” yazabilir. Yazılımcılar dünyanın her yerinde bu duruma “Türkçe I sorunu” der ve programlarını onunla sınar.',
  ]),
  E('Bozuk Metni Onar', [
    'Bir arkadaşınızdan gelen e-posta yanlış sözlükle açılmış. Yukarıdaki tabloyu kullanarak düzeltin.',
    table(['Ekranda görünen', 'Doğrusu'], [['Ýstanbul’da kýþ', ''], ['Doðru bilgi', ''], ['Þehir ýþýklarý', ''], ['Aðaç gölgesi', ''], ['Yaðmur yaðýyor', '']],
      [4300, 4700], { rowHeight: 440, size: 22 }),
    spacer(40),
  ]),
  box('tartis', null, ['Bir kurum müşterilerine “Sayýn müþterimiz” diye başlayan e-postalar gönderiyor. Sorun nerede olabilir? Kimin hangi “sözlüğe” bakması gerekir? Bu sorunu kim, nasıl çözebilir?', ...lines(2)]),
);

// ---------------------------------------------------------------------------
// Ünite 9 · On altılık düzen
// ---------------------------------------------------------------------------
const HEXROWS = Array.from({ length: 8 }, (_, i) => {
  const a = i;
  const b = i + 8;
  const f = (n) => [n.toString(16).toUpperCase(), n.toString(2).padStart(4, '0'), String(n)];
  return [...f(a), '', ...f(b)];
});
add(
  ...H1('ÜNİTE 9', 'On Altılık Düzen ve Renk Kodları'),
  videoTag('6:33 – 7:51', 'D6, #FF0000 ve telefon numaraları'),
  P('Uzun bit dizilerini okumak göze işkencedir: `1101011000111010…` Bu yüzden bir kısaltma kullanılır: **on altılık düzen** (onaltılık, *heksadesimal*).'),
  P('Dört bit **16** farklı durum gösterir. Her birine tek bir simge vermek için 16 simge gerekir. Rakamlarımız on tanedir (0–9); kalan altı durum için harfler kullanılır: **A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.**'),
  table(['On altılık', 'İkilik', 'Onluk', '', 'On altılık', 'İkilik', 'Onluk'], HEXROWS.map((r) => r.map((c, i) => (i === 1 || i === 5 ? `\`${c}\`` : c))),
    [1300, 1500, 1200, 300, 1300, 1500, 1200], { align: Array(7).fill(C), zebra: true, center: true, size: 21 }),
  spacer(120),
  P('Bir baytı on altılık yazmak için sekiz biti **dörderli iki gruba** bölün ve her grubu tek simgeye çevirin. Örnek: `1101 0110` → `1101` = 8 + 4 + 1 = 13 = **D**; `0110` = 4 + 2 = **6** → **D6**.'),
  ...fig('video_onaltilik.jpg', 11.5, 'Videodan bir kare: 11010110 = D6.'),
  H2('Web renk kodları'),
  P('Web sayfalarında renkler on altılık yazılır: **#FF0000** gibi. Ekrandaki her renk **kırmızı, yeşil ve mavi** ışığın (İngilizce baş harfleriyle **RGB**) karışımıdır. Koddaki üç çift, sırasıyla bu üç ışığın miktarıdır: **FF** = 255 (en çok), **00** = 0 (hiç). #FF0000 katıksız kırmızı, #000000 siyah, #FFFFFF beyazdır.'),
  ...fig('video_renk.jpg', 12.5, 'Videodan bir kare: Üç çift, üç ışık.'),
  P('On altılık yazım yeni bir bilgi değildir; **aynı bilginin kolay okunan bir kılığıdır**, tıpkı telefon numarasını 0532 123 45 67 diye bölerek yazmak gibi.'),
  box('biliyor', null, ['Her renk kanalı 0–255 arasında 256 değer alır. Üç kanalla 256 × 256 × 256 = **16.777.216** farklı renk yazılabilir. İnsan gözünün ayırt edebildiği renk sayısının da birkaç milyon civarında olduğu tahmin edilir.']),
  box('yanilgi', null, ['“Kırmızıyla yeşil karışırsa kahverengi olur.” Bu **boya** için doğrudur; **ışık** başka türlü karışır. Ekranda kırmızı ve yeşil ışık üst üste düşünce **sarı** görünür. Boyalar ışığı emerek, ekranlar ışık ekleyerek renk üretir.']),
  E('Çevir', [
    table(['Soru', 'Cevap'], [['`1010 1111` on altılık olarak?', ''], ['`0011 1100` on altılık olarak?', ''], ['**C8** ikilik ve onluk olarak?', ''], ['**FF** onluk olarak?', '']], [5200, 3800], { rowHeight: 440, size: 22 }),
    spacer(40),
  ]),
  E('Renk Kodu Dedektifi', [
    'Kutulardaki kodların hangi renge karşılık geldiğini bulun; kutuları renkli kalemle boyayın ya da rengin adını altına yazın. İpucu: Kırmızı + yeşil ışık **sarı**, kırmızı + mavi **macenta** (pembe-mor), yeşil + mavi **camgöbeği** (turkuaz) yapar. Üç ışığın yarısı, gri bir renk verir.',
    ...fig('renkler.png', 15.5),
    ...lines(1),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 10 · Her şey sayıya dönüşebilir mi?
// ---------------------------------------------------------------------------
const SAMPLES = [128, 186, 222, 214, 168, 108, 62, 46, 70, 120, 176, 210, 200];
add(
  ...H1('ÜNİTE 10', 'Her Şey Sayıya Dönüşebilir mi?'),
  videoTag('7:51 – 8:50', 'Fotoğraf, ses, video, sensörler'),
  H2('Fotoğraf'),
  P('Bir fotoğrafa çok yakından bakın: Sık dokunmuş bir kumaş gibi minicik karelerden oluşur. Her kareye **piksel** denir. Her pikselin üç sayısı vardır: kırmızı, yeşil ve mavi ışığın miktarı (0–255). 12 megapiksellik bir telefon fotoğrafında 12 milyon piksel, yani **36 milyon sayı** vardır.'),
  ...fig('video_piksel.jpg', 10.5, 'Videodan bir kare: Her kare bir piksel, her piksel üç sayı.'),
  H2('Ses'),
  P('Ses, havadaki **basınç dalgasıdır**. Mikrofon bu basıncı saniyede on binlerce kez ölçer; her ölçüm bir sayıdır. Müzik CD’lerinde saniyede **44.100** ölçüm yapılır. Bu sayılar aynı hızla hoparlöre verilince hoparlör havayı aynı biçimde titreştirir ve kulak aynı sesi yeniden duyar. Bu ölçme işine **örnekleme** denir.'),
  ...fig('ses_ornekleme.png', 15.5, 'Şekil 10.1 · Sürekli ses dalgası (mavi) ve düzenli aralıklarla yapılan ölçümler (turuncu).'),
  H2('Video ve sensörler'),
  P('Video, art arda gösterilen fotoğraflardır. Saniyede 25–30 kare gösterilince göz bunları akan bir hareket olarak algılar. Sıcaklık, nem, mesafe, kalp atışı, adım sayısı, konum… **Sensörler** (algılayıcılar) bunların hepsini sayıya çevirir.'),
  ...quote('Ölçülebilen her şey sayıya çevrilebilir; sayıya çevrilen her şey işlenebilir, saklanabilir, iletilebilir.'),
  E('Piksel Resmi', [
    'Her kare bir pikseldir. Karelerdeki sayılar, renk anahtarındaki renkleri gösterir; sayısız kareler beyaz kalır. Kareleri boyayın.',
    ...fig('piksel_bulmaca.png', 10.5),
    ...fig('piksel_anahtar.png', 12),
    'a) Hangi resim ortaya çıktı? Videonun hangi sahnesini hatırlatıyor? ……………………………',
    'b) Resim kaç pikseldir? ……………  Her piksel için kırmızı, yeşil, mavi olmak üzere 3 sayı tutulsaydı toplam kaç sayı gerekirdi? ……………',
  ]),
  E('Sesi Sayılarla Çiz', [
    'Bir mikrofonun yaptığı 13 ölçüm aşağıdaki tabloda verilmiştir. Her ölçümü ızgaraya bir nokta olarak işaretleyin, sonra noktaları düzgün bir çizgiyle birleştirin.',
    table(['Sıra', ...SAMPLES.map((_, i) => String(i))], [['Değer', ...SAMPLES.map(String)]], [1100, ...Array(13).fill(Math.floor((CONTENT_W - 1100 - 300) / 13))], { align: Array(14).fill(C), size: 19, headSize: 18 }),
    ...fig('ses_izgara.png', 15.5),
    'a) En yüksek ve en düşük ölçüm hangi sırada? ……………………',
    'b) Yalnızca çift sıradaki ölçümler (0, 2, 4, …) olsaydı çizdiğiniz dalga nasıl değişirdi? Bu, saniyede daha az ölçüm yapan bir kayıt cihazı için ne anlama gelir?',
    ...lines(2),
  ]),
  E('Sensör Avı', [
    'Evinizde ya da okulunuzda en az beş sensör bulun. Her biri neyi ölçüyor, sonucu hangi birimle gösteriyor?',
    table(['Cihaz', 'Neyi ölçüyor?', 'Birim', 'Örnek değer'], [['*Termometre*', '*Sıcaklık*', '*°C*', '*22*'], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
      [2600, 2700, 1600, 2100], { rowHeight: 420 }),
    spacer(40),
  ]),
);

// ---------------------------------------------------------------------------
// Ünite 11 · Ölçmek güçtür
// ---------------------------------------------------------------------------
add(
  ...H1('ÜNİTE 11', 'Ölçmek Güçtür'),
  videoTag('8:50 – 9:15', 'Bu cümle insan için de geçerlidir'),
  P('Ölçülebilen her şeyin sayıya çevrilebilmesi, bilişim çağının hem bütün gücünün hem de bütün tehlikesinin kaynağıdır. Çünkü bu cümle **insan** için de geçerlidir: nerede olduğunuz, kiminle konuştuğunuz, neye baktığınız, bir videoyu kaç saniye izlediğiniz… Hepsi ölçülebilir, saklanabilir, işlenebilir.'),
  ...fig('video_izler.jpg', 15.5, 'Videodan bir kare: Konum, mesajlar, bakışlar, izleme süreleri; hepsi birer sayı.'),
  P('Bu ölçümler hayatı kolaylaştırabilir: Harita uygulaması trafiği bu sayede bilir; akıllı saatler kalp ritmindeki bir düzensizliği erkenden fark edebilir. Ama aynı veriler, kişiler hakkında onların bilmediği tahminler yapmak, onları belirli içeriklere yönlendirmek ya da izlemek için de kullanılabilir.'),
  ...quote('Ölçmek, güçtür. Ve her güç gibi, kimin elinde olduğu sorusunu doğurur.'),
  box('biliyor', null, ['Türkiye’de kişisel verilerin korunması, 2016’da yürürlüğe giren **6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)** ile düzenlenir. Avrupa Birliği’nde ise **GDPR** adıyla bilinen bir düzenleme vardır. Bu yasalar, verilerinizin hangi amaçla toplandığını öğrenme ve silinmesini isteme gibi haklar tanır.']),
  E('Bir Günlük Dijital İz', [
    'Dün kullandığınız uygulamaları ve cihazları düşünün. Hangi bilgiler ölçülmüş olabilir? Tabloyu doldurun.',
    table(['Saat', 'Uygulama / cihaz', 'Ölçülen bilgi', 'Kim görebilir?'], [['*08.15*', '*Harita*', '*Konum, hız*', '*Uygulama şirketi*'], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']],
      [1300, 2500, 2700, 2500], { rowHeight: 440 }),
    spacer(40),
  ]),
  box('tartis', 'Grup tartışması', [
    '1. Konumunuzu hangi uygulamalarla paylaşmak size mantıklı geliyor, hangileriyle gelmiyor? Neden?',
    '2. “Saklayacak bir şeyim yoksa ölçülmem sorun değil” görüşüne katılıyor musunuz? Gerekçenizi yazın.',
    '3. Bir uygulamanın topladığı veriler hakkında hangi soruları sormalıyız? *(İpucu: Ne topluyor? Neden? Ne kadar süre saklıyor? Kimle paylaşıyor?)*',
    ...lines(3),
  ]),
);

// ---------------------------------------------------------------------------
// Özet, sözlük, değerlendirme, proje
// ---------------------------------------------------------------------------
add(
  ...H1('BÖLÜM SONU', 'Bu Bölümde Neler Öğrendik?'),
  bullet('Uzak tepelerdeki ateşler tek bir şey söyler: **oldu.** Bir işaretin anlamı, önceden yapılan anlaşmadan (koddan) gelir.'),
  bullet('**İki durum** arasında yanılmak, çok durum arasında yanılmaktan çok daha zordur; bu yüzden makineler bilgiyi iki durumla taşır.'),
  bullet('Elektrik hiç yerinde durmaz; makine bir **eşik** çizer: üstü **1**, altı **0**. Bu iki değerden birini alan birime **bit** denir.'),
  bullet('Her yeni bit durum sayısını **ikiye katlar**: n bit, 2ⁿ durum. 8 bit = 1 **bayt** = 256 durum.'),
  bullet('Bitlerin değerleri sağdan sola 1, 2, 4, 8… diye büyür; yanan bitlerin değerleri toplanınca sayı bulunur (**ikilik sistem**).'),
  bullet('Kilo bin demektir: KB, MB, GB, TB birimleri bin kat bin kat büyür.'),
  bullet('Harfler bilgisayarda **numaralarla** saklanır (karakter kodlaması): A = 65.'),
  bullet('Farklı ülkelerin farklı listeler kullanması Türkçe harfleri bozuyordu; **Unicode** bütün yazıları tek listede toplayarak bunu çözdü.'),
  bullet('Dört bit tek bir **on altılık** simgeyle yazılır (0–9, A–F); web renkleri #RRGGBB biçimindedir.'),
  bullet('Fotoğraf pikseller, ses ölçümler, video kareler olarak **sayıya** dönüşür; sensörler dünyayı ölçer.'),
  bullet('Ölçmek **güçtür**; kişisel verilerin kimin elinde olduğu önemli bir sorudur.'),
  pageBreak(),
  H2('Kavram Sözlüğü'),
  table(['Kavram', 'Anlamı'], [
    ['Kod', 'Bir işarete önceden verilmiş, üzerinde anlaşılmış anlam.'],
    ['Gürültü', 'Sinyali bozan istenmeyen etkiler (parazit, sıcaklık, sis…).'],
    ['Volt', 'Elektriğin bir teli ne kadar güçlü “ittiğini” ölçen birim.'],
    ['Eşik', 'Ölçülen değerin 0 mı 1 mi sayılacağını ayıran çizgi.'],
    ['Bit', '0 ya da 1 değerini alan, bilginin en küçük birimi.'],
    ['Bayt', '8 bit; 0–255 arası 256 değer alabilir. Kabaca bir harf.'],
    ['İkilik sistem', 'Basamak değerleri 1, 2, 4, 8… diye büyüyen, yalnızca 0 ve 1 kullanan sayı sistemi.'],
    ['Karakter kodlaması', 'Harflere, rakamlara ve işaretlere numara veren ortak sözlük.'],
    ['ASCII', '1963’te hazırlanan, 128 karakterlik ilk yaygın karakter kodlaması.'],
    ['Unicode / UTF-8', 'Dünyadaki bütün yazıları tek listede toplayan kodlama ve onun en yaygın yazım biçimi.'],
    ['On altılık düzen', '0–9 ve A–F simgeleriyle yazılan sayı düzeni; 4 bit = 1 simge.'],
    ['RGB', 'Kırmızı, yeşil ve mavi ışığın miktarıyla renk yazma biçimi.'],
    ['Piksel', 'Dijital görüntüyü oluşturan en küçük renkli kare.'],
    ['Örnekleme', 'Sürekli bir büyüklüğü (ses gibi) düzenli aralıklarla ölçüp sayıya çevirme.'],
    ['Sensör', 'Fiziksel bir büyüklüğü (sıcaklık, ışık, hareket…) ölçüp sayıya çeviren algılayıcı.'],
    ['Kişisel veri', 'Bir kişiyi tanımlayan ya da onunla ilgili olan her türlü bilgi.'],
  ], [2600, CONTENT_W - 2600], { zebra: true }),
);

add(
  ...H1('BÖLÜM SONU', 'Kendini Değerlendir'),
  H3('Çoktan seçmeli sorular'),
  ...mc('Bilgisayarların bilgiyi iki durumla taşımasının asıl nedeni nedir?', ['İki rakam daha kolay yazılır.', 'İki durum, gürültüye karşı en dayanıklı yoldur.', 'Elektrik yalnızca iki değer alabilir.', 'Eski bilgisayarlardan kalma bir alışkanlıktır.'], 2),
  ...mc('5 bitle kaç farklı durum gösterilebilir?', ['10', '25', '32', '64'], 2),
  ...mc('`00010110` ikilik sayısının onluk karşılığı nedir?', ['22', '26', '14', '110'], 2),
  ...mc('Bir bayt kaç bittir ve alabileceği en büyük değer kaçtır?', ['4 bit, 15', '8 bit, 255', '8 bit, 256', '16 bit, 255'], 2),
  ...mc('“A” harfinin ASCII kodu 65 ise “D” harfinin kodu kaçtır?', ['66', '67', '68', '69'], 2),
  ...mc('Bir e-postada “Doðru” yazısının görünmesi neyi gösterir?', ['Klavye arızasını', 'Gönderen ile alanın farklı karakter kodlaması kullandığını', 'Yazı tipinin eksik olduğunu', 'Bazı bitlerin kaybolduğunu'], 2),
  ...mc('#00FF00 renk kodu hangi rengi gösterir?', ['Kırmızı', 'Yeşil', 'Mavi', 'Beyaz'], 2),
  ...mc('On altılık düzende **A** simgesinin onluk değeri kaçtır?', ['1', '10', '11', '16'], 2),
  ...mc('2 GB kaç MB eder? (1 GB = 1.000 MB)', ['20', '200', '2.000', '2.000.000'], 2),
  ...mc('Aşağıdakilerden hangisi bir ses kaydının sayıya çevrilmesini en iyi anlatır?', ['Ses dalgasının saniyede binlerce kez ölçülmesi', 'Sesin harflere çevrilmesi', 'Ses tonunun renge çevrilmesi', 'Sesin tek bir sayıyla gösterilmesi'], 2),
  spacer(120),
  H3('Kısa cevaplı sorular'),
  numbered('“Eşik” kavramını kendi cümlelerinizle açıklayın ve gündelik hayattan bir örnek verin.', 2), ...lines(2),
  numbered('45 sayısını sekiz bitlik ikilik düzende yazın.', 2), ...lines(1),
  numbered('`1110 0101` baytını on altılık düzende yazın.', 2), ...lines(1),
  numbered('Unicode hangi sorunu çözmüştür? Bir örnekle açıklayın.', 2), ...lines(2),
  numbered('“Ölçmek güçtür” cümlesine katılıyor musunuz? Bir örnekle açıklayın.', 2), ...lines(2),
);

const TR = 'A B C Ç D E F G Ğ H I İ J K L M N O Ö P R S Ş T U Ü V Y Z'.split(' ');
add(
  ...H1('PROJE', 'Kendi Kodlamanı Yarat'),
  P('Bu bölümde öğrendiğiniz her şeyi birleştirme zamanı: Türkçe için **kendi karakter kodlamanızı** tasarlayacaksınız.'),
  numbered('Türk alfabesinde **29 harf** vardır. Her harfe ayrı bir ikilik kod vermek için en az kaç bit gerekir? Neden? *(İpucu: 4 bit kaç durum, 5 bit kaç durum verir?)*', 4), ...lines(1),
  numbered('Aşağıdaki tabloda her harfe bir kod verin (örneğin A = `00001`). Artan kodları boşluk ve iki noktalama işaretine ayırın.', 4),
  table(['Harf', 'Kod', 'Harf', 'Kod', 'Harf', 'Kod'], Array.from({ length: 11 }, (_, r) => [TR[r], '', TR[r + 11] ?? '', '', TR[r + 22] ?? (r === 7 ? 'boşluk' : r === 8 ? '.' : r === 9 ? '?' : ''), ''].map((c, i) => (i % 2 === 0 ? `**${c}**` : c))),
    [1100, 2075, 1100, 2075, 1100, 2074], { align: Array(6).fill(C), rowHeight: 380, center: true }),
  spacer(60),
  numbered('Kodunuzla bir arkadaşınıza kısa bir mesaj yazın; o da sizin kod tablonuzu kullanarak çözsün.', 4), ...lines(2),
  numbered('Arkadaşınız kod tablonuzu görmeden mesajı çözebilir mi? Bu durum, Ünite 1’deki “anlam anlaşmadan gelir” fikriyle ve Ünite 8’deki bozuk Türkçe harflerle nasıl ilişkili?', 4), ...lines(2),
  numbered('**Bonus:** Kodlamanıza küçük harfleri ve rakamları da eklemek isteseydiniz kaç bite ihtiyacınız olurdu?', 4), ...lines(1),
);

// ---------------------------------------------------------------------------
// Cevap anahtarı ve öğretmene notlar
// ---------------------------------------------------------------------------
add(
  ...H1('EK', 'Cevap Anahtarı'),
  H3('Etkinlik 1 · Haber Zinciri Hesabı'),
  P('a) 2.–6. tepelerdeki beş nöbetçi sırayla ateş yakar: 5 × 3 = **15 dakika**.  b) 100 km ÷ 15 km/sa ≈ **6 saat 40 dakika** (400 dakika).  c) 400 ÷ 15 ≈ **27 kat**.'),
  H3('Etkinlik 2 ve 3'),
  P('Sonuçlar gruptan gruba değişir. Genellikle tek bilgilik ışık zinciri hem daha hızlıdır hem de bozulmaz; ayrıntılı cümle yolda değişir. Sisli gözlemde iki durumlu düzen neredeyse hiç hata yapmazken beş parlaklıklı düzende hatalar belirgin biçimde artar.'),
  H3('Etkinlik 4 · Gürültülü Sinyali Oku'),
  ...fig('volt_esik_cozum.png', 13),
  P('a) **1 0 1 1 0 0 1 0 1 0**.  b) Değiştirmedi; iniş ve sıçrama eşik çizgisini geçmedi.  c) Eşik “var” düzeyine çok yakın olurdu; küçük bir dalgalanma 1’i 0 gibi gösterebilirdi. Eşik, iki düzeyin tam ortasına konursa en dayanıklı olur.'),
  H3('Etkinlik 5 · Bütün Durumları Yaz'),
  P('`000, 001, 010, 011, 100, 101, 110, 111` (sıra farklı olabilir; önemli olan 8 farklı durumun hepsinin bulunmasıdır).'),
  H3('Etkinlik 6 · Katlama Tablosu'),
  P('3 → 8, 4 → 16, 5 → 32, 6 → 64, 7 → 128, 8 → 256;  16 → 65.536, 20 → 1.048.576, 24 → 16.777.216, 32 → 4.294.967.296, 40 → 1.099.511.627.776 (bir trilyondan fazla).'),
  H3('Ünite 4 tartışma sorusu'),
  P('4 haneli şifre: 10 × 10 × 10 × 10 = **10.000**. Bir hane eklenince **10 kat** artar (100.000). Lambalarda her ekleme ×2, rakamlarda ×10 yapar; ikisi de katlayarak büyür.'),
  H3('Etkinlik 7 · Bit Kartları'),
  P('a) **10** nokta, `01010`.  b) 8 + 4 + 1 kartları: `01101`.  c) 16 + 8 + 4 + 2 + 1 = **31**.  d) En sağdaki kart her adımda çevrilir; 2 kartı her iki adımda bir, 4 kartı her dört adımda bir çevrilir.'),
  H3('Etkinlik 8 · Çeviri Alıştırması'),
  P('`00000101` = 5, `00010000` = 16, `00101010` = 42, `01100100` = 100, `11111111` = 255.  9 = `00001001`, 33 = `00100001`, 77 = `01001101`, 128 = `10000000`, 250 = `11111010`.'),
  H3('Etkinlik 9 ve 10'),
  P('128 GB = 128.000 MB → a) **32.000** fotoğraf, b) **25.600** şarkı, c) **64** film.  Sıralama: **2 GB** (2.000 MB) > **0,001 TB** (1.000 MB) > **500 MB** > **3.000 KB** (3 MB) > **1.500.000 B** (1,5 MB).'),
  H3('Etkinlik 11 · Gizli Mesaj'),
  P('**BILGI GUCTUR** (“Bilgi güçtür”) ve **OK**. Türkçe harfler eksik, çünkü ASCII’de Ç, Ğ, İ, Ö, Ş, Ü için yer yoktur; bu yüzden “BİLGİ GÜÇTÜR” yazılamamıştır.'),
  H3('Etkinlik 13 · Bozuk Metni Onar'),
  P('İstanbul’da kış · Doğru bilgi · Şehir ışıkları · Ağaç gölgesi · Yağmur yağıyor.  Tartışma: E-posta, Türkçe listeyle yazılıp Batı Avrupa listesiyle açılmıştır (“Sayın müşterimiz”). Kalıcı çözüm, gönderen sistemin ve alıcının UTF-8 kullanmasıdır.'),
  H3('Etkinlik 14 · Çevir'),
  P('`1010 1111` = **AF** (175),  `0011 1100` = **3C** (60),  **C8** = `1100 1000` = 200,  **FF** = 255.'),
  H3('Etkinlik 15 · Renk Kodu Dedektifi'),
  ...fig('renkler_cozum.png', 13),
  P('A kırmızı, B yeşil, C mavi, D sarı, E macenta, F camgöbeği, G gri, H turuncu.'),
  H3('Etkinlik 16 · Piksel Resmi'),
  ...fig('piksel_cozum.png', 6.5),
  P('a) Bir kamp ateşi; videonun açılışındaki tepedeki ateşi hatırlatır.  b) 16 × 16 = **256** piksel; RGB ile 256 × 3 = **768** sayı.'),
  H3('Etkinlik 17 · Sesi Sayılarla Çiz'),
  ...fig('ses_izgara_cozum.png', 13),
  P('a) En yüksek: 2. sıra (222); en düşük: 7. sıra (46).  b) Dalga kabalaşır, ince dalgalanmalar kaybolur. Saniyede daha az ölçüm yapan bir cihaz, özellikle tiz (hızlı titreşen) sesleri doğru kaydedemez.'),
  H3('Kendini Değerlendir'),
  P('1-b, 2-c, 3-a, 4-b, 5-c, 6-b, 7-b, 8-b, 9-c, 10-a.  12) 45 = 32 + 8 + 4 + 1 = `00101101`.  13) `1110` = E, `0101` = 5 → **E5**.  11, 14 ve 15. sorularda öğrencinin kendi ifadesi değerlendirilir.'),
  H3('Proje'),
  P('1) 4 bit yalnızca 16 durum verir, yetmez; 5 bit 32 durum verir, 29 harfe yeter: **5 bit**. 4) Tablo olmadan çözülemez; anlam, anlaşmadan gelir. 5) 29 büyük + 29 küçük + 10 rakam = 68 > 64 olduğundan **7 bit** gerekir (6 bit yalnızca 64 durum verir).'),
  spacer(160),
  H2('Öğretmene Notlar'),
  bullet('**Önerilen akış (2 ders saati):** 1. ders — video (9 dk), Ünite 1–5 ve Etkinlik 1, 3, 7. 2. ders — Ünite 6–11, Etkinlik 11, 13, 15, 16 ve grup tartışması.'),
  bullet('Bit kartları (Etkinlik 7) sınıfça oynandığında çok etkilidir: Beş öğrenci kartları tutar, sınıf bir sayı söyler, kart tutanlar hangi kartın açılacağına karar verir.'),
  bullet('Etkinlik 3 için sınıfı karartmak gerekmez; fenerin önüne konan kâğıtlar yeterli fark yaratır.'),
  bullet('Ünite 11’deki tartışmada tek doğru cevap aranmamalıdır; amaç, öğrencilerin veri toplama konusunda soru sormayı alışkanlık hâline getirmesidir.'),
);

// ---------------------------------------------------------------------------
// Kapak ve belge
// ---------------------------------------------------------------------------
function cover() {
  const img = fs.readFileSync(path.join(__dirname, 'gorseller', 'video_kapak.jpg'));
  const w = Math.round(16.8 * 96 / 2.54);
  const t = (text, o) => new TextRun({ text, ...o });
  return [
    new Paragraph({ children: [t('GERÇEKLİĞİN ÖLÇÜLEBİLİR HÂLE GELMESİ', { size: 20, bold: true, color: RENK.muted, characterSpacing: 80 })], alignment: C, spacing: { before: 400, after: 120 } }),
    new Paragraph({ children: [t('BİRİNCİ KAPI · DÜNYAYI SAYIYA ÇEVİRMEK', { size: 22, bold: true, color: RENK.orange, characterSpacing: 60 })], alignment: C, spacing: { after: 600 } }),
    new Paragraph({ children: [t('1. KISIM', { size: 28, bold: true, color: RENK.navy, characterSpacing: 100 })], alignment: C, spacing: { after: 80 } }),
    new Paragraph({ children: [t('VAR', { size: 96, bold: true, color: RENK.orange }), t(' ve ', { size: 60, italics: true, color: RENK.navy, font: 'Cambria' }), t('YOK', { size: 96, bold: true, color: '5A6C96' })], alignment: C, spacing: { after: 60 } }),
    new Paragraph({ children: [t('İki Simgeli Bir Evren', { size: 40, italics: true, color: RENK.navy, font: 'Cambria' })], alignment: C, spacing: { after: 480 } }),
    new Paragraph({ children: [new ImageRun({ type: 'jpg', data: img, transformation: { width: w, height: Math.round(w * 1080 / 1920) }, altText: { title: 'Kapak', description: 'Videonun açılış karesi', name: 'kapak' } })], alignment: C, spacing: { after: 480 } }),
    new Paragraph({ children: [t('DERS KİTABI VE ETKİNLİKLER', { size: 30, bold: true, color: RENK.navy, characterSpacing: 80 })], alignment: C, spacing: { after: 120 } }),
    new Paragraph({ children: [t('Videoyla birlikte okunmak, yazılmak, kesilip oynanmak için', { size: 22, italics: true, color: RENK.muted })], alignment: C }),
  ];
}

const header = new Header({ children: [new Paragraph({
  children: [new TextRun({ text: 'Birinci Kapı · 1. Kısım — Var ve Yok', size: 16, color: RENK.muted })],
  alignment: AlignmentType.RIGHT,
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB', space: 4 } },
})] });
const footer = new Footer({ children: [new Paragraph({ children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: RENK.muted })], alignment: C })] });

const page = { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1191, right: 1191, header: 560, footer: 560 } };

const doc = new Document({
  creator: 'Gerçekliğin Ölçülebilir Hâle Gelmesi',
  title: 'Birinci Kapı · 1. Kısım — Var ve Yok: Ders Kitabı ve Etkinlikler',
  description: 'Var ve Yok videosu için ders kitabı ve etkinlikler',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22, color: RENK.ink } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Calibri', size: 44, bold: true, color: RENK.navy }, paragraph: { spacing: { after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Calibri', size: 30, bold: true, color: RENK.orange }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Calibri', size: 24, bold: true, color: RENK.navy }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering,
  sections: [
    { properties: { page }, children: cover() },
    { properties: { page }, headers: { default: header }, footers: { default: footer }, children: body },
  ],
});

const OUT = path.join(__dirname, 'Birinci-Kapi-1-Var-ve-Yok-Ders-Kitabi.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(`${OUT} yazıldı (${(buf.length / 1e6).toFixed(1)} MB), ${etk} etkinlik`);
});
