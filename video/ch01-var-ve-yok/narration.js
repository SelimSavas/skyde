/*
 * Birinci Kapı — Türkçe seslendirme metni (alt yazı yok; ekranda yalnızca görüntü).
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS) bağlıdır ve o vuruşun başından itibaren sırayla okunur;
 * görüntü, anlatıcı satırlarını bitirmeden ilerlemez.
 *   say     okunacak metin: sayılar ve harf adları yazıyla ("altmış beş", "fe fe"), simge yok
 *   offset  vuruş başından sonra en erken başlama (sn)
 * Virgül, nokta gibi işaretler hem durak (Engine.PAUSES) hem de öbek sınırıdır: film.js bir öğeyi
 * cue('satır', k) ile satırın k. öbeğine bağlar (0'dan sayılır). Noktalamayı değiştirirseniz
 * film.js'teki cue numaralarını da denetleyin.
 * id'ler insan sesiyle kayıt yapılırsa dosya adıdır (narrate.mjs --engine files:<klasör> → <id>.wav).
 * Metni değiştirince: node video/narrate.mjs ch01-var-ve-yok
 */
window.NARRATION = {
  lines: [
    { id: 'open-title', beat: 'open.title', offset: 0.5, say: 'Birinci kapı. Var ve yok: iki simgeli bir evren.' },

    // 1 · Tepeden tepeye ateş
    { id: 'fires-one', beat: 'fires.one', say: 'Dağın tepesinde bir ateş yanıyor.' },
    { id: 'fires-meaning', beat: 'fires.one', say: 'Ne anlama geldiği önceden kararlaştırılmıştı: düşman sınırı geçti.' },
    { id: 'fires-relay', beat: 'fires.relay', say: 'Karşı tepedeki nöbetçi, ateşi görür görmez kendi ateşini yakardı; ondan ötekisi, ondan berikisi.' },
    { id: 'fires-race', beat: 'fires.race', say: 'Böylece haber, atlının günlerce süren yolculuğunu saatlere indirirdi.' },
    { id: 'fires-question', beat: 'fires.question', say: 'Peki, ateş tam olarak ne söylüyordu?' },
    { id: 'fires-answer', beat: 'fires.answer', say: 'Aslında tek bir şey: oldu.' },

    // 2 · İki durum, elli durum
    { id: 'two-split', beat: 'two.split', say: 'Yanıyorsa oldu, yanmazsa olmadı. İki durum: var ve yok.' },
    { id: 'two-levels', beat: 'two.levels', say: 'Peki ateşle elli ayrı haber verilseydi? Biraz yanarsa asker, yarı yanarsa gemi, gürül gürül yanarsa savaş.' },
    { id: 'two-weather', beat: 'two.weather', say: 'Şimdi bir de yağmur yağsın, sis çöksün. Yorgun bir nöbetçi, ateşin biraz mı, yarı mı yandığını kestiremez. Ama yanıyor mu, yanmıyor mu; bunu her zaman görür.' },
    { id: 'two-quote', beat: 'two.quote', say: 'İki durum arasında yanılmak, elli durum arasında yanılmaktan çok daha güçtür.' },
    { id: 'two-icons', beat: 'two.icons', say: 'Bu tek cümle, telefonun, televizyonun, bankadaki hesabın ve bu kitabın temelidir.' },

    // 3 · Neden sadece iki?
    { id: 'why-volt', beat: 'why.analog', say: 'Bugünün makineleri de ateş yerine elektrik kullanır. Bir teldeki elektriğin ne kadar güçlü ittiğini, volt denen birimle ölçeriz.' },
    { id: 'why-wobble', beat: 'why.analog', say: 'Ama bu değer hiç yerinde durmaz: sıcaklık değişir, kablonun direnci artar, komşu devreden parazit gelir. Tam üç virgül yetmiş dört volt dersiniz, bir saniye sonra yanılırsınız.' },
    { id: 'why-threshold', beat: 'why.digital', say: 'Ama şu soruyu sormak kolay: elektrik var mı, yok mu? Makine ortaya bir çizgi çeker; buna eşik denir. Üstündeyse var, altındaysa yok; değeri biraz oynasa bile, cevap değişmez.' },
    { id: 'why-code', beat: 'why.digital', say: 'Elektrik var, bir. Elektrik yok, sıfır.' },
    { id: 'why-bit', beat: 'why.bit', say: 'Bu iki değerin her birine bit denir. Bit, bilişimin atomudur: bölünemeyen en küçük bilgi parçası.' },
    { id: 'why-pairs', beat: 'why.bit', say: 'Tek başına çok az şey anlatır: evet ya da hayır, açık ya da kapalı.' },

    // 4 · Yan yana dizmenin bereketi
    { id: 'lamps-one', beat: 'lamps.one', say: 'Bir lamba kadar: sönükse sıfır, yanıyorsa bir. İki durum. Ama bitleri yan yana dizince, bir şey olur.' },
    { id: 'lamps-two', beat: 'lamps.two', say: 'İki lamba düşünün. Kaç farklı durum kurabilirsiniz? Kapalı kapalı, kapalı açık, açık kapalı, açık açık. Dört.' },
    { id: 'lamps-three', beat: 'lamps.three', say: 'Üç lamba? Sekiz durum. Çünkü yeni lamba sönükken, eski dört durum aynen kurulur; yanarken, aynı dört durum bir kez daha. Dört artı dört, sekiz.' },
    { id: 'lamps-four', beat: 'lamps.four', say: 'Dört lamba? On altı. Her yeni lamba, olasılıkları ikiye katlar.' },
    { id: 'lamps-table', beat: 'lamps.table', say: 'Katlamayı sürdürün: otuz iki, altmış dört, yüz yirmi sekiz, iki yüz elli altı. Sekiz lamba, iki yüz elli altı durum.' },
    { id: 'lamps-big', beat: 'lamps.table', say: 'Otuz iki lambada durum sayısı dört milyarı aşar. Sezgimiz en çok burada yanılır.' },
    { id: 'lamps-byte', beat: 'lamps.byte', say: 'Sekiz bit yan yana gelince, buna bayt denir.' },
    { id: 'lamps-values', beat: 'lamps.values', say: 'Her lambanın bir değeri vardır: sağdan sola bir, iki, dört, sekiz, böyle ikiye katlanarak, yüz yirmi sekize kadar. Yanan lambaların değerleri toplanır.' },
    { id: 'lamps-range', beat: 'lamps.values', say: 'Hepsi kapalıysa sıfır, hepsi açıksa, iki yüz elli beş. Bir bayt, sıfırla birlikte iki yüz elli altı ayrı sayı tutar.' },
    { id: 'lamps-letters', beat: 'lamps.letters', say: 'Bu, bir alfabenin bütün harflerine, rakamlara ve işaretlere yeter. Bir bayt, kabaca bir harftir.' },

    // 5 · Sözlük kenarı
    { id: 'glossary-rows', beat: 'glossary.rows', say: 'Kilo, kilogramdaki gibi bin demektir; her basamak bin kat büyür. Kilobayt kısa bir mektup, megabayt bir şarkı, gigabayt bir film, terabayt bir kütüphane.' },
    { id: 'glossary-compare', beat: 'glossary.compare', say: 'Otuz bin harflik bir metin, otuz kilobayttır. Tek bir fotoğraf ise, yüz kat daha fazla yer kaplar.' },

    // 6 · Harf nasıl sayı olur?
    { id: 'letters-question', beat: 'letters.question', say: 'Makine yalnızca sıfır ile bir biliyorsa, ekranda gördüğümüz A harfi nedir?' },
    { id: 'letters-answer', beat: 'letters.answer', say: 'Makinenin içinde A harfi diye bir şey yoktur; altmış beş sayısı vardır.' },
    { id: 'letters-encoding', beat: 'letters.encoding', say: 'İnsanlar anlaştı: her harfe bir numara. Buna karakter kodlaması denir.' },
    { id: 'letters-cards', beat: 'letters.encoding', say: 'A harfi altmış beş, be altmış altı, küçük a doksan yedi, boşluk bile otuz iki.' },
    { id: 'letters-merhaba', beat: 'letters.merhaba', say: 'Makinenin belleğinde merhaba yazmaz; şu yazar: yetmiş yedi, altmış dokuz, seksen iki, yetmiş iki, altmış beş, altmış altı, altmış beş.' },
    { id: 'letters-bits', beat: 'letters.merhaba', say: 'Onlar da lambalardaki gibi, var yok dizileri olarak durur: altmış beş, altmış dört artı bir.' },
    { id: 'letters-fonts', beat: 'letters.fonts', say: 'Harfin şeklini yazı tipi çizer; makine yalnızca numarasını bilir.' },

    // 7 · Türkçenin kayıp harfleri
    { id: 'turkish-grid', beat: 'turkish.grid', say: 'İlk anlaşmayı İngilizce konuşanlar yaptı. Yirmi altı harflik alfabeleri için, yüz yirmi sekiz yer ayırdılar; içine sığdı, arttı bile.' },
    { id: 'turkish-half', beat: 'turkish.half', say: 'Oysa bir bayt iki yüz elli altı yer sunar; öteki yarı boş kaldı.' },
    { id: 'turkish-letters', beat: 'turkish.letters', say: 'Türkçenin çe, yumuşak ge, noktasız ı, büyük noktalı i, ö, şe, ü; bu yedi harf o listede yoktu.' },
    { id: 'turkish-place', beat: 'turkish.place', say: 'Her ülke, boş yarıya kendi harflerini koydu; ama herkes, farklı yere.' },
    { id: 'turkish-mojibake', beat: 'turkish.mojibake', say: 'Belge gönderince yola harf değil, sayı çıkar. Sizde iki yüz kırk, yumuşak ge harfidir; karşıdaki sözlükte ise bambaşka bir harf.' },
    { id: 'turkish-agreement', beat: 'turkish.agreement', say: 'Kimse art niyetli değildi; yalnızca sözlükler farklıydı.' },
    { id: 'turkish-unicode', beat: 'turkish.unicode', say: 'Çözüm, bütün yazıları tek bir dev listede toplamaktı: Yunikod. Türk harfleri de, Çin yazısı da, emojiler de orada.' },
    { id: 'turkish-codepoint', beat: 'turkish.unicode', say: 'Artık yumuşak ge, her yerde aynı numaradır: iki yüz seksen yedi. Bu sayı için tek bayt yetmez; iki bayt gerekir.' },
    { id: 'turkish-master', beat: 'turkish.master', say: 'Teknolojideki sorunların çoğu, teknik değil, anlaşma sorunudur. İki taraf aynı sözlüğe bakmıyorsa, kabloların hiçbir suçu yoktur.' },

    // 8 · Sayıları on altılık yazmak
    { id: 'hex-blur', beat: 'hex.blur', say: 'Uzun bit dizilerini okumak göze işkencedir. Bu yüzden bir kısaltma kullanılır: onaltılık düzen.' },
    { id: 'hex-digits', beat: 'hex.digits', say: 'Dört lambanın on altı durumu vardı; her birine tek bir simge gerekir. Rakamlarımız ise on tane, sıfırdan dokuza; kalan altısı için harfler kullanılır: A on, be on bir, böyle sırayla, fe on beşe kadar.' },
    { id: 'hex-split', beat: 'hex.split', say: 'Diziyi dörderli gruplara bölün. Dört lambanın değerleri sekiz, dört, iki, bir. İlk grupta sekiz, dört ve bir yanıyor: on üç, yani de. İkinci grupta dört ile iki: altı. Kısaca, de altı.' },
    { id: 'hex-colors', beat: 'hex.colors', say: 'Web sayfalarında renkler böyle yazılır. Ekrandaki her renk, kırmızı, yeşil ve mavi ışığın karışımıdır; koddaki üç çift, bu üç ışığın miktarıdır.' },
    { id: 'hex-red', beat: 'hex.colors', say: 'Fe fe en çok, yani iki yüz elli beş; sıfır sıfır, hiç. Kırmızı sonuna kadar açık, öbürleri kapalı: katıksız kırmızı. Hepsi kapalı siyah, hepsi açık beyaz.' },
    { id: 'hex-phone', beat: 'hex.phone', say: 'Yeni bir bilgi değil, aynı bilginin kolay okunan kılığıdır; tıpkı telefon numarasını bölerek yazmak gibi.' },

    // 9 · Her şey sayıya dönüşebilir mi?
    { id: 'numbers-photo', beat: 'numbers.photo', say: 'Bir fotoğraf, sık dokunmuş bir kumaş gibidir: yakından bakınca minicik kareler görürsünüz, pikseller.' },
    { id: 'numbers-pixel', beat: 'numbers.photo', say: 'Her pikselin üç sayısı vardır: kırmızının, yeşilin ve mavinin miktarı. Milyonlarca piksel, milyonlarca üçlü sayı.' },
    { id: 'numbers-sound', beat: 'numbers.sound', say: 'Ses, havadaki basınç dalgasıdır. Saniyede on binlerce kez ölçülür; her ölçüm bir sayıdır. Bu sayılar aynı hızla hoparlöre verilince, kulak aynı sesi yeniden duyar.' },
    { id: 'numbers-video', beat: 'numbers.video', say: 'Videoda ise, her saniyede yirmi beş kadar fotoğraf vardır; göz onları akan bir hareket olarak görür.' },
    { id: 'numbers-sensors', beat: 'numbers.sensors', say: 'Sıcaklık, nem, mesafe, kalp atışı; bunların hepsi, sensörler sayesinde sayıya dönüşür.' },
    { id: 'numbers-statement', beat: 'numbers.statement', say: 'Ortak nokta şudur: ölçülebilen her şey sayıya çevrilebilir; sayıya çevrilen her şey, işlenebilir, saklanabilir, iletilebilir.' },
    { id: 'numbers-danger', beat: 'numbers.statement', say: 'Bilişim çağının bütün gücü de, bütün tehlikesi de, bu tek cümlede saklıdır.' },
    { id: 'numbers-watched', beat: 'numbers.watched', say: 'Çünkü bu cümle, insan için de geçerlidir: nerede olduğunuz, kiminle konuştuğunuz, neye baktığınız, neyi kaç saniye izlediğiniz.' },
    { id: 'numbers-power', beat: 'numbers.power', offset: 0.6, say: 'Ölçmek, güçtür.' },
    { id: 'numbers-question', beat: 'numbers.power', say: 'Ve her güç gibi, kimin elinde olduğu sorusunu doğurur.' },

    { id: 'close-end', beat: 'close.end', say: 'Var ve yok.' },
  ],
};
