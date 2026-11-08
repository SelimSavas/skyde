/*
 * Birinci Kapı, 3. bölüm — Sayılardan Devreye: Elektriğin Hesap Yapması. Türkçe seslendirme metni (alt yazı yok).
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS) bağlıdır ve o vuruşun başından itibaren sırayla okunur;
 * görüntü, anlatıcı satırlarını bitirmeden ilerlemez.
 *   say     okunacak metin: sayılar yazıyla, simge yok
 *   offset  vuruş başından sonra en erken başlama (sn)
 * Virgül, nokta gibi işaretler hem durak hem de öbek sınırıdır: film.js bir öğeyi cue('satır', k) ile
 * satırın k. öbeğine bağlar (0'dan sayılır). Noktalamayı değiştirirseniz film.js'teki cue numaralarını denetleyin.
 * İnsan sesi: her satır <id>.mp3 olarak kaydedilir ve dub.mjs ile hazır videoya eklenir.
 * Metni değiştirince: node video/narrate.mjs ch03-sayilardan-devreye --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'open-title', beat: 'open.title', offset: 0.5, say: 'Birinci kapı, üçüncü bölüm: sayılardan devreye. Elektriğin hesap yapması.' },

    // 1 · Elimizdekiler
    { id: 'recap-gates', beat: 'recap.gates', say: 'Elimizde artık mantık kapıları var: VE, VEYA, DEĞİL, bir de özel veya.' },
    { id: 'recap-task', beat: 'recap.task', say: 'Geçen bölümde ucundan gördüğümüz işi, şimdi adım adım kuralım: toplama.' },

    // 2 · Ön bilgi: saymak
    { id: 'count-decimal', beat: 'count.decimal', say: 'Toplamaya geçmeden önce, saymayı hatırlayalım. Onluk düzende on rakam var: sıfırdan dokuza. Dokuzdan sonra rakam biter; basamak sıfıra döner, ve soldaki basamak bir artar: on.' },
    { id: 'count-binary', beat: 'count.binary', say: 'İkilik düzende ise yalnızca iki rakam var: sıfır ve bir. Birden sonra rakam biter; basamak sıfıra döner, soldaki basamak bir artar: bir sıfır. Yani ikilik düzende bir sıfır, iki demektir. Sonra bir bir, üç; sonra bir sıfır sıfır, dört.' },

    // 3 · En basit toplama: yarım toplayıcı
    { id: 'add-cases', beat: 'add.cases', say: 'İki biti toplayalım. Dört olasılık var: sıfır artı sıfır, sıfır. Sıfır artı bir, bir. Bir artı sıfır, bir. Bir artı bir ise, bir sıfır.' },
    { id: 'add-carry', beat: 'add.carry', say: 'Son satıra dikkat edin. İkilik düzende bir artı bir, tıpkı onluk düzende dokuz artı bir gibi davranır: sıfır yaz, elde var bir. Sonuç, iki basamağa taşar.' },
    { id: 'add-table', beat: 'add.table', say: 'Şimdi bunu bir tabloya dökelim: solda iki giriş, sağda iki sütun: sonuç basamağı, ve elde.' },
    { id: 'add-recognize', beat: 'add.recognize', say: 'Bu iki sütunu tanıdınız mı? Sonuç basamağı sütunu, tam olarak özel veya kapısının tablosudur. Elde sütunu ise, tam olarak VE kapısının tablosu.' },
    { id: 'add-half', beat: 'add.half', say: 'Yani bir özel veya kapısı ile bir VE kapısını yan yana koyarsanız, elinizde toplama yapan bir devre olur. Buna yarım toplayıcı denir.' },
    { id: 'add-demo', beat: 'add.demo', say: 'Deneyelim. A girişine bir, B girişine bir verelim. Özel veya kapısı sıfır verir, VE kapısı bir. Lambalar, bir sıfır gösterir: iki.' },

    // 4 · Tam toplayıcı (ön bilgi)
    { id: 'full-why', beat: 'full.why', say: 'Peki neden yarım? Çünkü ikinci basamaktan itibaren, toplanacak iki değil, üç bit vardır: iki sayının o basamaktaki bitleri, bir de sağdan gelen elde.' },
    { id: 'full-example', beat: 'full.example', say: 'Üç artı biri ikilik düzende yazalım: bir bir, artı sıfır bir. Sağdaki sütunda bir artı bir: sıfır yaz, elde bir. Soldaki sütunda bir, artı sıfır, artı gelen elde: yine sıfır yaz, elde bir. Sonuç: bir sıfır sıfır, yani dört.' },
    { id: 'full-build', beat: 'full.build', say: 'Bu üç biti toplamak için, iki yarım toplayıcı, ve bir VEYA kapısı birleştirilir. Buna tam toplayıcı denir: üç bit alır, bir sonuç basamağı ve bir elde verir.' },

    // 5 · Toplayıcı zinciri
    { id: 'chain-eight', beat: 'chain.eight', say: 'Şimdi her tam toplayıcının eldesini, soldaki komşusuna bağlayarak, sekiz tanesini arka arkaya dizelim: iki baytı toplayan bir devre kurmuş oluruz.' },
    { id: 'chain-demo', beat: 'chain.demo', say: 'İkilik düzende doksan bir artı elli üç. Elde, sağdan sola, basamaktan basamağa koşar; ve sonuç belirir: yüz kırk dört.' },
    { id: 'chain-32', beat: 'chain.wide', say: 'Otuz iki tane dizerseniz, milyarlara varan sayıları toplayabilirsiniz. İlk bölümdeki otuz iki lambayı hatırlayın: dört milyardan fazla durum.' },

    // 6 · Toplamayı bilmeyen makine
    { id: 'mean-quote', beat: 'mean.quote', say: 'Bu, bütün hikâyenin en önemli anlarından biridir; durup bir kez daha düşünmeye değer. Toplama işlemi, elektriğin akıp akmamasından ibarettir.' },
    { id: 'mean-nomind', beat: 'mean.nomind', say: 'Makine toplamayı bilmez. İçinde toplamayı yapan bir zekâ yoktur. Yalnızca öyle bir düzenek kurulmuştur ki, girişteki akımlar belli bir biçimde olduğunda, çıkıştaki akımlar toplamanın sonucuna denk gelir.' },
    { id: 'mean-reader', beat: 'mean.reader', say: 'Anlam, düzenekte değil; düzeneği kuranın ve okuyanın zihnindedir. Aynı lambalara bakan biri altmış beş sayısını görür, bir başkası A harfini; lambalar ise yalnızca yanar ve söner.' },

    // 7 · Geri kalan her şey
    { id: 'rest-question', beat: 'rest.question', say: 'Peki çıkarma? Çarpma? Bölme? Kök alma? Şaşırtıcı yanıt şu: hepsi, toplamaya indirgenir.' },

    // 8 · Çıkarma: kilometre sayacı hilesi
    { id: 'sub-idea', beat: 'sub.idea', say: 'Çıkarma, negatif bir sayıyla toplamaktır: yedi eksi üç, yediye eksi üç eklemek demektir.' },
    { id: 'sub-odometer', beat: 'sub.odometer', say: 'Ama makine eksi işaretini nasıl yazar? Bir arabanın kilometre sayacını düşünün. Sayaç sıfır sıfır sıfırdayken bir adım geri sararsanız, dokuz dokuz dokuz olur. Yani bu sayaçta dokuz yüz doksan dokuz, aslında eksi bir gibi davranır.' },
    { id: 'sub-trick', beat: 'sub.trick', say: 'Eksi üç ise, dokuz yüz doksan yedi olur. Şimdi yediye dokuz yüz doksan yedi ekleyin: bin dört. Sayaç üç basamaklı olduğu için, baştaki bir taşar ve düşer; geriye dört kalır. Yedi eksi üç: dört. Hem de hiç çıkarma yapmadan.' },
    { id: 'sub-binary', beat: 'sub.binary', say: 'Makine, negatif sayıları ikilik düzende tam olarak bu hileyle yazar. Eksi üçü bulmak bile çıkarma istemez: üçün bütün bitleri DEĞİL kapılarıyla ters çevrilir, ve sonuca bir eklenir. Böylece ayrı bir çıkarma devresi kurmaya gerek kalmaz; aynı toplayıcı, iki işi birden görür.' },

    // 9 · Çarpma: kaydır ve topla
    { id: 'mul-repeat', beat: 'mul.repeat', say: 'Çarpma, tekrarlı toplamadır. Beş kere dört, aslında beş artı beş artı beş artı beştir.' },
    { id: 'mul-shift', beat: 'mul.shift', say: 'Ama makine bunu daha kısa yoldan yapar. Onluk düzende bir sayının sağına sıfır eklemek, onu on ile çarpar. İkilik düzende ise sağa eklenen her sıfır, rakamları bir basamak sola kaydırıp sayıyı ikiyle çarpar; buna kaydırma denir.' },
    { id: 'mul-example', beat: 'mul.example', say: 'Beş, ikilik düzende bir sıfır birdir. Dörtle çarpmak için iki kez kaydırın: bir sıfır bir sıfır sıfır, yani yirmi. Beş kere dört, tek bir toplama bile yapmadan bulundu. Beş kere altı içinse, altıyı dört artı iki diye düşünün: beşin dört katı ile iki katı, yani iki kez ve bir kez kaydırılmış hâlleri toplanır: yirmi artı on, otuz.' },
    { id: 'mul-fast', beat: 'mul.fast', say: 'Makine her çarpmayı, böyle kaydırma ve toplama adımlarıyla, göz açıp kapayıncaya kadar yapar.' },

    // 10 · Bölme ve kök
    { id: 'div-repeat', beat: 'div.repeat', say: 'Bölme, tekrarlı çıkarmadır. Yirminin içinde kaç tane dört var? Çıkarmaya başlayın: on altı, on iki, sekiz, dört, sıfır. Beş kez; yirmi bölü dört, beş.' },
    { id: 'root-intro', beat: 'div.root', say: 'Karekök, logaritma, sinüs: hepsi, yaklaşık değere ulaşana kadar tekrarlanan, toplama ve çarpma dizileriyle hesaplanır.' },
    { id: 'root-example', beat: 'div.sqrt', say: 'İkinin kareköküne bakalım: kendisiyle çarpılınca iki eden sayı. Bir virgül dördü deneyin: karesi bir virgül doksan altı, ikiden biraz az. Bir virgül dört bir: karesi bir virgül doksan sekiz, hâlâ az. Bir virgül dört bir dört: ikiye çok yakın. Her adımda yalnızca çarpma ve karşılaştırma var; ve her adımda, bir basamak daha doğru.' },

    // 11 · Her şey toplamadır
    { id: 'all-list', beat: 'all.list', say: 'Ve buradan çok büyük bir sonuç çıkar. Bir video oynatmak, bir yüzü tanımak, bir cümleyi çevirmek, bir binanın statiğini hesaplamak, bir yapay zekâ modelini eğitmek: bunların hepsi, en dipte, milyarlarca toplama işlemidir.' },
    { id: 'all-pixels', beat: 'all.pixels', say: 'Bir örnek: bir videoyu biraz aydınlatmak, her noktanın parlaklığına bir sayı eklemek demektir. Dört ka denen yüksek çözünürlüklü bir karede, sekiz milyondan fazla nokta vardır; her birinde üç renk, ve saniyede altmış kare. Yalnızca bu kadarı bile, saniyede bir buçuk milyar toplama eder.' },
    { id: 'all-dome', beat: 'all.dome', say: 'Bütün bu işlerde farklı olan, yalnızca işlemlerin sıralamasıdır. Kubbeyi taştan ayıran şey de, taşın kendisi değil, taşların dizilişidir.' },

    // 12 · Zamanı bölen metronom
    { id: 'clock-problem', beat: 'clock.problem', say: 'Bir sorun kaldı. Devrelerdeki elektrik sürekli akar; peki makine, bir işlemin bittiğini ve sıradakine geçme zamanının geldiğini nereden bilir?' },
    { id: 'clock-delay', beat: 'clock.delay', say: 'Üstelik bir kapı, girişi değiştiği anda cevap vermez; elektriğin kapıdan geçmesi, çok kısa da olsa, zaman alır. Sekiz bitlik toplayıcıda elde, basamaktan basamağa koşarken, çıkış bir an için yanlış sayılar gösterir. Erken okuyan, yanlış sonucu okur.' },
    { id: 'clock-orchestra', beat: 'clock.orchestra', say: 'Bir orkestrayı düşünün. Herkes notaları biliyor olabilir; ama biri tempo tutmazsa, ortaya müzik değil, gürültü çıkar. Bilgisayarın şefi, saat darbesidir.' },
    { id: 'clock-crystal', beat: 'clock.crystal', say: 'Kuvars saatlerdeki gibi küçük bir kristal, saniyede sabit sayıda titreşir, ve bu tempo katlanıp bütün devrelere dağıtılır. Her darbede kapılar durumlarını okur, hesabı yapar, sonucu bir sonraki aşamaya aktarır, ve donar. Sonraki darbede, aynı şey tekrarlanır.' },
    { id: 'clock-settle', beat: 'clock.settle', say: 'Darbeler arasındaki süre, eldenin en uzun yolu bile koşup bitirmesine yetecek kadar uzun seçilir; böylece sonuç, her zaman hazır olduğunda okunur.' },
    { id: 'clock-ghz', beat: 'clock.ghz', say: 'İşlemci hızını gösteren üç virgül iki gigahertz gibi ifadeler, işte bu tempoyu anlatır: saniyede üç virgül iki milyar darbe. Yani saniyede üç virgül iki milyar kez: şimdi!' },
    { id: 'clock-light', beat: 'clock.light', say: 'Bu ne kadar hızlı? İki darbe arasında, ışık bile ancak dokuz santimetre yol alır: bir avuç içi kadar.' },

    // 13 · Yaygın yanılgı
    { id: 'myth-intro', beat: 'myth.intro', say: 'Ama burada yaygın bir yanılgı var, ve düzeltmek gerekir: daha yüksek saat hızı, her zaman daha hızlı bilgisayar demek değildir.' },
    { id: 'myth-work', beat: 'myth.work', say: 'Bir işlemci her darbede tek bir basit iş yapıyorsa, çok darbe harcarken az iş çıkarır. Bir başkası, her darbede daha fazla iş yapacak biçimde tasarlanmış olabilir.' },
    { id: 'myth-example', beat: 'myth.example', say: 'Dört gigahertzlik bir işlemci her darbede bir iş yaparsa, saniyede dört milyar iş eder. Üç gigahertzlik bir başkası her darbede dört iş yaparsa, on iki milyar. Yavaş tempolu olan, üç katı iş çıkarır.' },
    { id: 'myth-end', beat: 'myth.end', say: 'Tempoyu hızlandırmak, orkestranın daha iyi çalmasını sağlamaz. Bu konuya serinin ikinci kapısında, işlemcinin iç düzenini konuşurken döneceğiz.' },

    // 14 · Hatırlamak: kendini tutan devre
    { id: 'mem-question', beat: 'mem.question', say: 'Son bir parça eksik. Hesap yapmayı öğrendik; peki sonucu nasıl saklıyoruz?' },
    { id: 'mem-forget', beat: 'mem.forget', say: 'Şimdiye kadar kurduğumuz bütün kapılar unutkandır: çıkışları, yalnızca o anki girişlere bağlıdır. Kapı zilini hatırlayın: düğmeyi bıraktığınız anda susar.' },
    { id: 'mem-loop', beat: 'mem.loop', say: 'Burada devrelerin en zarif hilesi devreye girer: bir kapının çıkışını, kendi girişine geri bağlamak.' },
    { id: 'mem-hold', beat: 'mem.hold', say: 'Böyle bağlanmış bir devre, kendi durumunu besler. VEYA kapısının öteki girişindeki düğmeye bir an basın: çıkış bir olur, bu bir döngüden dolaşıp girişe döner, ve düğmeyi bıraksanız da çıkışı birde tutar.' },
    { id: 'mem-reset', beat: 'mem.reset', say: 'Döngüye bir de silme düğmesi eklenir: ona basınca döngü kopar, çıkış sıfıra düşer, ve sıfırda kalır. Dışarıdan yeni bir değer verilmedikçe, hücre değişmez.' },
    { id: 'mem-bit', beat: 'mem.bit', say: 'Bu, hafızanın en küçük birimidir: bir biti tutar. Kapı zili ile lamba anahtarı arasındaki fark gibi: zil bırakınca susar; anahtar ise konumunu hatırlar.' },

    // 15 · Bellek ve elektrik
    { id: 'ram-register', beat: 'ram.register', say: 'Bu hücrelerden sekizini yan yana koyun: bir bayt tutarsınız. Sekizer baytlık öbekler hâlinde gruplanıp işlemcinin içinde özel görevler verildiğinde, bunlara yazmaç denir: işlemcinin, o an üzerinde çalıştığı sayıları not ettiği küçük defterler.' },
    { id: 'ram-memory', beat: 'ram.memory', say: 'Elektrikle ayakta duran benzer minik hücrelerin milyarlarcası yan yana dizildiğinde, bilgisayarın çalışma belleği ortaya çıkar. Sekiz gigabaytlık bir bellekte, altmış milyardan fazla bit vardır.' },
    { id: 'ram-volatile', beat: 'ram.volatile', say: 'Ve şu ayrıntı önemlidir: bu tür hafıza, elektrik kesildiği anda her şeyi unutur. Çünkü durumu ayakta tutan şey, akan elektriğin kendisidir.' },
    { id: 'ram-homework', beat: 'ram.homework', say: 'Bir öğrencinin, bilgisayarı kapatmadan önce kaydetmediği ödevin yok olmasının tam ve tek nedeni budur.' },
    { id: 'ram-save', beat: 'ram.save', say: 'Kaydet düğmesi ise bilgiyi, elektrik kesilince de silinmeyen kalıcı bir depoya yazar. Ders çıkarmak için, başka bir açıklamaya gerek yok.' },

    // 16 · Özet ve kapanış
    { id: 'sum-three', beat: 'sum.three', say: 'Bu bölümde elektriğe üç şey öğrettik: toplamak, tempo tutmak, ve hatırlamak. Bir bilgisayarın geri kalanı, bu üçünün ustaca dizilişidir.' },
    { id: 'close-end', beat: 'close.end', say: 'Sayılardan devreye.' },
  ],
};
