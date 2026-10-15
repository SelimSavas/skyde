/*
 * Birinci Kapı, 4. bölüm — Veri, Bilgi, Anlam: Üç Basamaklı Merdiven. Türkçe seslendirme metni (alt yazı yok).
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS) bağlıdır ve o vuruşun başından itibaren sırayla okunur;
 * görüntü, anlatıcı satırlarını bitirmeden ilerlemez.
 *   say     okunacak metin: sayılar yazıyla, simge yok
 *   offset  vuruş başından sonra en erken başlama (sn)
 * Virgül, nokta gibi işaretler hem durak hem de öbek sınırıdır: film.js bir öğeyi cue('satır', k) ile
 * satırın k. öbeğine bağlar (0'dan sayılır). Noktalamayı değiştirirseniz film.js'teki cue numaralarını denetleyin.
 * İnsan sesi: her satır <id>.mp3 olarak kaydedilir ve dub.mjs ile hazır videoya eklenir.
 * Metni değiştirince: node video/narrate.mjs ch04-veri-bilgi-anlam --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'open-title', beat: 'open.title', offset: 0.5, say: 'Birinci kapı, dördüncü bölüm: veri, bilgi, anlam. Üç basamaklı merdiven.' },

    // 1 · Buraya kadar
    { id: 'recap-path', beat: 'recap.path', say: 'Buraya kadar hep fiziği konuştuk: elektriğin nasıl sayıya, sayının nasıl mantığa, mantığın nasıl hesaba dönüştüğünü.' },
    { id: 'recap-step', beat: 'recap.step', say: 'Şimdi bir adım geri çekilip, başka bir soru soralım. Bu soru, bundan sonra anlatacağımız her şeyi taşıyacak.' },
    { id: 'recap-question', beat: 'recap.question', say: 'Elimizdeki bu sayılar, ne anlama geliyor?' },

    // 2 · Aynı sayı, üç dünya
    { id: 'thermo-alone', beat: 'thermo.alone', say: 'Bir termometre, otuz sekiz virgül beş gösteriyor. Bu sayı, tek başına hiçbir şey söylemez.' },
    { id: 'thermo-room', beat: 'thermo.room', say: 'Bir odanın sıcaklığıysa, boğucu bir yaz gününden bahsediyoruzdur.' },
    { id: 'thermo-child', beat: 'thermo.child', say: 'Bir çocuğun ateşiyse, geceyi uykusuz geçireceğiz demektir.' },
    { id: 'thermo-oven', beat: 'thermo.oven', say: 'Bir fırının sıcaklığıysa, fırın çok soğuk kalmıştır: kek pişirmek için, yüz seksen derece kadar gerekir.' },
    { id: 'thermo-three', beat: 'thermo.three', say: 'Aynı sayı. Üç farklı dünya.' },
    { id: 'thermo-rule', beat: 'thermo.rule', say: 'Bu örnek, bilişimin en temel ama en çok atlanan ayrımını gösterir: veri, bilgi ve anlam, asla aynı şey değildir.' },

    // 3 · Basamak bir: veri
    { id: 'data-def', beat: 'data.def', say: 'Basamak bir: veri. Veri, işlenmemiş ham ölçümdür. Tek başına bir yargı taşımaz; yani bize ne yapmamız gerektiğini söylemez.' },
    { id: 'data-examples', beat: 'data.examples', say: 'Otuz sekiz virgül beş: veri. Sıfır beş yüz otuz iki diye başlayan bir dizi rakam: veri. Bir tarih: veri. Bir renk adı, kırmızı: veri.' },
    { id: 'data-source', beat: 'data.source', say: 'Veriyi çoğu zaman bir ölçüm aracı üretir: bir termometre, bir saat, bir kamera. Bazen de form dolduran bir insan. İlk bölümde gördüğümüz gibi, ölçülebilen her şey sayıya çevrilebilir.' },
    { id: 'data-innocent', beat: 'data.innocent', say: 'Verinin en önemli özelliği, masumiyetidir. Veri, iyi ya da kötü değildir; ama doğru ya da yanlış olabilir.' },
    { id: 'data-broken', beat: 'data.broken', say: 'Bir termometre ya doğru ölçmüştür, ya da bozuktur. Bozuk bir termometre, tamamen sağlıklı bir çocuğa, otuz sekiz virgül beş diyebilir. Veri yanlışsa, üzerine kurulan her şey de yanlış olur.' },

    // 4 · Basamak iki: bilgi
    { id: 'info-def', beat: 'info.def', say: 'Basamak iki: bilgi. Bilgi, verinin bağlamına oturtulmuş hâlidir.' },
    { id: 'info-context', beat: 'info.context', say: 'Bağlam, bir şeyin içinde durduğu çevredir. On iki sayısını düşünün: bir saatin üzerinde, öğle vaktidir. Bir doğum günü pastasının üzerinde, bir yaştır. Bir formanın sırtında, bir oyuncudur. Sayı hiç değişmedi; değişen, çevresiydi.' },
    { id: 'info-questions', beat: 'info.questions', say: 'Veriye üç sorunun yanıtı eklendiğinde, bilgi doğar. Neyin ölçüsü? Vücut sıcaklığı. Kimin? Ayşe’nin. Ne zaman? Bu sabah.' },
    { id: 'info-sentence', beat: 'info.sentence', say: 'Ayşe’nin bu sabahki ateşi, otuz sekiz virgül beş. İşte bu, bilgidir. Artık bir şey söylüyor.' },
    { id: 'info-compare', beat: 'info.compare', say: 'Şimdi karşılaştırma yapılabilir: dün sabah otuz sekiz virgül ikiydi; demek ki yükseliyor. Bir eşikle de kıyaslanabilir: vücut sıcaklığı otuz sekiz dereceye ulaşınca, genellikle ateş sayılır.' },

    // 5 · Basamak üç: anlam ve karar
    { id: 'judge-def', beat: 'judge.def', say: 'Basamak üç: anlam ve karar. Anlam, bilgiye insanın kendi deneyimi ve yargısı katıldığında ortaya çıkar.' },
    { id: 'judge-days', beat: 'judge.days', say: 'Ertesi gün de ateş ölçülüyor. Ayşe’nin ailesi, üç günün ölçümlerini yan yana koyuyor. Deneyimleri ve yargıları devreye girince, şu cümle doğuyor: Ayşe’nin ateşi üçüncü gün de düşmedi; onu doktora götürmeliyiz.' },
    { id: 'judge-verdict', beat: 'judge.verdict', say: 'Bu artık veri değildir; bilgi bile değildir. Bir yargıdır. Ve yargı, her zaman, sorumluluk taşıyan bir insana aittir.' },

    // 6 · Merdiven ve makine
    { id: 'ladder-three', beat: 'ladder.three', say: 'Üç basamağı birlikte görelim. Otuz sekiz virgül beş: veri. Ayşe’nin bu sabahki ateşi otuz sekiz virgül beş: bilgi. Onu doktora götürmeliyiz: anlam ve karar.' },
    { id: 'ladder-machine', beat: 'ladder.machine', say: 'Makinelerin asıl işi, bu ilk iki basamaktır. Ölçerler, kaydederler, etiketlerler, karşılaştırırlar; hem de bizden milyonlarca kat hızlı.' },
    { id: 'ladder-help', beat: 'ladder.help', say: 'Üçüncü basamakta ise makineler yalnızca yardımcı olabilir; asla kesin karar veremez. Akıllı bir termometre, ateş üç gündür yüksek diye uyarabilir; ama Ayşe’yi doktora götürme kararı, ailesinindir.' },
    { id: 'ladder-gray', beat: 'ladder.gray', say: 'Yapay zekânın bugün en çok tartışılan o gri bölgesi de, tam olarak burasıdır: makinenin yardımı nerede biter, insanın kararı nerede başlar? Onuncu kapıda, bu konuya uzun uzun döneceğiz.' },

    // 7 · Usta sözü
    { id: 'motto-say', beat: 'motto.say', say: 'Şimdilik akılda kalması gereken tek şey, şu usta sözü: Veri masumdur. Yorum sorumluluktur.' },

    // 8 · Veriyi kim konuşturur?
    { id: 'hidden-report', beat: 'hidden.report', say: 'Bir raporda, verilere göre diye başlayan her cümlede, aslında birinin yaptığı gizli bir yorum saklıdır.' },
    { id: 'hidden-four', beat: 'hidden.four', say: 'Hangi verinin toplandığı. Neyin ölçülmediği. Hangi zaman aralığının seçildiği. Sonucun nasıl çizildiği. Bunların hepsi, birer insan kararıdır.' },
    { id: 'hidden-survey', beat: 'hidden.survey', say: 'Birincisi, hangi verinin toplandığı. Kütüphane kapısında, çıkan öğrencilere soralım: kitap okumayı seviyor musun? Neredeyse hepsi evet der. Rapor yazılır: öğrencilerin yüzde doksanı okumayı seviyor. Oysa yalnızca kütüphaneye gelenlere sorduk.' },
    { id: 'hidden-missing', beat: 'hidden.missing', say: 'İkincisi, neyin ölçülmediği. Bir okul yalnızca sınav notlarını ölçerse, raporda öğrencilerin ne kadar mutlu olduğu hiç görünmez. Ölçülmeyen şey, yok sayılır.' },
    { id: 'hidden-window', beat: 'hidden.window', say: 'Üçüncüsü, zaman aralığı. Bir kasabanın bir yıllık sıcaklık ölçümlerini düşünün. Yalnızca mart ayını seçen biri, hava ısınıyor der. Yalnızca ekim ayını seçen biri, hava soğuyor der. Veri aynı; seçilen zaman aralığı farklı.' },
    { id: 'hidden-axis', beat: 'hidden.axis', say: 'Dördüncüsü, çizim. İki sınıfın not ortalaması: yetmiş iki ve yetmiş beş. Grafiğin kenarındaki sayı çizgisine eksen denir. Eksen sıfırdan başlarsa, iki çubuk neredeyse aynı boydadır. Eksen yetmişten başlarsa, biri ötekinin iki buçuk katı görünür. Fark aynı; çizim onu büyütür.' },
    { id: 'hidden-myth', beat: 'hidden.myth', say: 'Sık duyulan bir söz vardır: rakamlar yalan söylemez. Rakamlar gerçekten yalan söylemez; ama onları seçen ve çizen insan, yanıltabilir.' },
    { id: 'hidden-end', beat: 'hidden.end', say: 'Veriler konuşuyor diye bir şey yoktur. Veriyi birileri konuşturur.' },

    // 9 · Verinin türleri
    { id: 'types-why', beat: 'types.why', say: 'Bir veriyi bilgisayara emanet edeceksek, ona ne tür bir şey verdiğimizi en baştan söylemek zorundayız. Çünkü makine, beş sayısıyla tırnak içindeki beş yazısı arasındaki o devasa farkı, kendiliğinden anlamaz.' },
    { id: 'types-bits', beat: 'types.bits', say: 'Bellekte ikisi de yalnızca bitlerdir. Beş sayısı, ikilik düzende bir sıfır bir olarak saklanır. Beş yazısı ise, ilk bölümdeki karakter kodlamasına göre, kendi numarasıyla saklanır: elli üç. Peki elli üç sayısı nasıl saklanır? Tıpatıp aynı lambalarla. Lambalar, sayı mı yazı mı olduklarını söylemez; bunu, verinin türü söyler.' },
    { id: 'types-plus', beat: 'types.plus', say: 'Farkı en iyi toplama gösterir. Beş artı beş, on eder. Ama iki tane beş yazısını toplamaya kalkarsanız, birçok programlama dili onları yan yana koyar: elli beş yazısı.' },
    { id: 'types-intro', beat: 'types.intro', say: 'Temel türler, her programlama dilinde şaşırtıcı ölçüde benzerdir.' },
    { id: 'types-int', beat: 'types.int', say: 'Tam sayı: kırk iki, eksi yedi gibi kesirsiz sayılar. Toplanır, çarpılır.' },
    { id: 'types-float', beat: 'types.float', say: 'Ondalıklı sayı: otuz sekiz virgül beş gibi kesirli sayılar. Onlar da toplanır, çarpılır.' },
    { id: 'types-text', beat: 'types.text', say: 'Metin: Ayşe gibi bir harf dizisi; tırnak içindeki beş de bir metindir. Birleştirilir, içinde arama yapılır.' },
    { id: 'types-bool', beat: 'types.bool', say: 'Mantıksal: iki durumdan biri; doğru ya da yanlış. İkinci bölümdeki Boole’u hatırlayın. Karar verdirir: ateş otuz sekizden yüksek mi? Doğru.' },
    { id: 'types-date', beat: 'types.date', say: 'Tarih ve saat: zamanda bir nokta, on beş ağustos iki bin yirmi altı gibi. Birbirinden çıkarılır, karşılaştırılır: iki tarih arasında kaç gün var?' },
    { id: 'types-phone', beat: 'types.phone', say: 'Bu ayrımın neden önemli olduğunu bir örnek anlatır. Telefon numarasını sayı olarak saklarsanız, başındaki sıfır kaybolur. Çünkü sayılarda baştaki sıfırın bir anlamı yoktur: sıfır yedi ile yedi, aynı sayıdır.' },
    { id: 'types-plate', beat: 'types.plate', say: 'Ankara’nın plaka kodu da öyle: sıfır altı, sayı olarak saklanırsa, altıya döner.' },
    { id: 'types-rule', beat: 'types.rule', say: 'Telefon numarası bir sayı değil, bir metindir. Üzerinde hiç toplama yapmayız; yalnızca yazarız ve ararız. Akılda tutulacak küçük bir kural: üzerinde hesap yapmayacaksanız, rakamlardan oluşsa bile, o veri bir metindir.' },

    // 10 · Düzenli veri
    { id: 'struct-list', beat: 'struct.list', say: 'Şimdi bir öğrenci listesini düşünün. Her satırda ad, soyad, numara ve sınıf var. Her satır, aynı biçimde.' },
    { id: 'struct-name', beat: 'struct.name', say: 'Buna yapılandırılmış, yani düzenli veri denir. Tabloya kolayca yerleşir; sorgulanır, sıralanır.' },
    { id: 'struct-query', beat: 'struct.query', say: 'Yedi B’deki öğrenciler kimler? Bilgisayar, binlerce satırlık bir tabloda bile, bu soruyu göz açıp kapayıncaya kadar yanıtlar. Beşinci kapının ana konusu, tam olarak budur.' },

    // 11 · Düzensiz veri
    { id: 'messy-notes', beat: 'messy.notes', say: 'Şimdi bir veli toplantısında kâğıda tutulan serbest notları düşünün: birbirini tutmayan uzun cümleler, kenara çizilmiş oklar, yarım kalmış bir liste.' },
    { id: 'messy-name', beat: 'messy.name', say: 'Buna yapılandırılmamış, yani düzensiz veri denir. Fotoğraflar, sesler, videolar ve serbest metinler, hep bu karmaşık kümededir. Bir fotoğraf da sayılardan oluşur; ama hiçbir sütun, içinde kimin olduğunu söylemez.' },
    { id: 'messy-ask', beat: 'messy.ask', say: 'Farkı bir soruyla görelim: Ali’nin matematik notu kaç? Tabloda yanıt, bir satır ile bir sütunun kesiştiği yerdedir. Toplantı kâğıdında ise bir cümlenin içinde saklıdır: Ali matematikte biraz zorlanıyor, son sınavda altmış civarı almış galiba. Sıradan bir program, bunu kendiliğinden bulamaz.' },
    { id: 'messy-iceberg', beat: 'messy.iceberg', say: 'Dünyadaki verinin ezici bir çoğunluğu, işte bu düzensiz kümededir. Tıpkı bir buzdağı gibi: düzenli tablolar görünen ucudur; asıl kütle, suyun altındaki düzensiz yığındır.' },
    { id: 'messy-ai', beat: 'messy.ai', say: 'Ve son yılların en büyük teknolojik atılımı, yapay zekânın o büyük yükselişi, tam da bu düzensiz yığından anlam çıkarabilmesiyle ilgilidir. Ama, sırası gelince.' },

    // 12 · Özet ve kapanış
    { id: 'sum-ladder', beat: 'sum.ladder', say: 'Özetleyelim. Veri, ham ölçümdür. Bilgi, bağlamına oturtulmuş veridir. Anlam ise, bilgiye insanın yargısı katıldığında doğar. Makineler ilk iki basamakta ustadır; üçüncü basamağın sorumluluğu, bizdedir.' },
    { id: 'close-end', beat: 'close.end', say: 'Veri, bilgi, anlam.' },
  ],
};
