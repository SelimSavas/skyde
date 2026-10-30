/*
 * Tabağındaki Bilim · Bölüm 1 — Soğan Neden Ağlatır?
 * Türkçe seslendirme metni. Her satır kendi adını taşıyan vuruşa bağlıdır (film.js).
 * Sayılar yazıyla; kaynaklar için bkz. kaynaklar.md. Kayıt metni: seslendirme-pause.txt.
 * Kaydı olan satırın metni değişirse kimliği de değişmeli (eski kayıt yanlış satıra düşmesin).
 * Kayıt gelince: node video/narrate.mjs sogan-neden-aglatir --engine files:seslendirme/Sogan
 */
window.NARRATION = {
  lines: [
    // 1 · Soğuk açılış
    { id: 'a-cut', say: "Kesme tahtası hazır, bıçak hazır, soğan hazır. Birinci kesik, ikinci kesik… Daha yarısına gelmeden gözlerin yanmaya başlıyor." },
    { id: 'a-tears', say: "Birkaç saniye sonra gözyaşları da geliyor. Üzgün değilsin, kimse kalbini kırmadı; ama ağlıyorsun." },
    { id: 'a-question', say: "Peki avucuna sığan bir sebze, koca bir insanı nasıl ağlatabiliyor?" },

    // 2 · Selam
    { id: 's-hello', say: "Tabağındaki Bilim'e hoş geldin! Burada her gün mutfakta gördüğümüz küçük olaylara büyüteçle bakıyoruz." },
    { id: 's-promise', say: "Bugün bir soğanın içine gireceğiz ve orada saklı, küçük bir kimya laboratuvarı bulacağız. Bölümün sonunda soğanı çok daha az ağlayarak doğramanın yollarını da bileceksin. Üstelik bunlardan biri, çoğumuzun yaptığının tam tersi." },

    // 3 · Küçük bir deney
    { id: 'd-whole', say: "Önce küçük bir deney. Bütün bir soğanı alıp koklasan neredeyse hiçbir şey olmaz. Ne keskin bir koku vardır, ne de yanan gözler." },
    { id: 'd-knife', say: "Ama bıçak soğana girdiği anda her şey değişir. Demek ki seni ağlatan şey soğanın içinde hazır beklemiyor; sen kestiğin anda, oracıkta üretiliyor." },

    // 4 · Büyüteç: hücrenin içi
    { id: 'b-zoom', say: "Hadi biraz yaklaşalım." },
    { id: 'b-cells', say: "Soğan milyonlarca küçük hücreden oluşur. Okulda mikroskopla incelediğimiz o ince, şeffaf zarı hatırlıyor musun? İşte o, soğanın hücreleriydi." },
    { id: 'b-rooms', say: "Her hücreyi iki odalı küçük bir ev gibi düşün. Bir odada kükürtlü bir madde bekliyor. Öbür odada ise onu kesebilen bir enzim var: alliinaz. Biz ona soğanın makası diyelim." },
    { id: 'b-wall', say: "Soğan sağlamken bu ikisi hiç karşılaşmaz; aralarında bir duvar vardır. Bıçak o duvarı yıktığı anda, makas kükürtlü maddeyle buluşur." },
    { id: 'b-chain', say: "Ve göz açıp kapayıncaya kadar bir zincirleme tepkime başlar. Makas maddeyi keser; ortaya ömrü çok kısa, kararsız bir ara ürün çıkar." },
    { id: 'b-second', say: "Tam bu sırada sahneye ikinci bir enzim girer. Bu ara ürünü yakalar ve onu uçucu, küçük bir gaz molekülüne çevirir." },
    { id: 'b-name', say: "Bu gazın adı biraz dil kırıcı: sin-propantiyal-S-oksit. Biz kısaca ağlatan gaz diyelim." },
    { id: 'b-nobel', say: "Bu ikinci enzimi iki bin iki yılında Japon bilim insanları buldu. O güne kadar ağlatan gazın kendiliğinden oluştuğu sanılıyordu. Bu buluş sonradan İg Nobel ödülü de aldı: önce güldüren, sonra düşündüren araştırmalara verilen ödül." },

    // 5 · Göz: küçük bir itfaiye ekibi
    { id: 'g-rise', say: "Bu gaz çok uçucudur. Kesilen yüzeyden hemen havaya karışır ve tezgâha eğilmiş yüzüne doğru yükselir." },
    { id: 'g-cornea', say: "Gözünün ön yüzeyi, yani kornea, vücudumuzun en yoğun sinirli dokularından biridir. Minicik bir toz zerresini bile anında fark etmesi bu yüzden." },
    { id: 'g-signal', say: "Ağlatan gaz bu sinir uçlarını uyarır. Sinirler beynine yanıyor diye haber verir. Beyin de hiç düşünmeden emri verir: Yıka!" },
    { id: 'g-reflex', say: "Gözyaşı bezlerin hemen işe koyulur ve gözünü bol suyla yıkar. Yani soğan gözyaşı duygusal değildir; gözünü korumak için çalışan bir reflekstir. Küçük bir itfaiye ekibi gibi." },

    // 6 · Soğan bunu neden yapıyor?
    { id: 'n-why', say: "Peki soğan neden böyle bir sistem kurmuş? Çünkü bitkiler kaçamaz. Bir hayvan dişlerini geçirdiğinde ne koşabilirler ne de saklanabilirler." },
    { id: 'n-defense', say: "Bu yüzden birçok bitki kendini kimyayla savunur. Bilim insanları soğanın bu düzeneğini de bir savunma sistemi olarak görüyor: Isıranın ağzını ve gözünü yakan bir alarm." },
    { id: 'n-garlic', say: "Sarımsak da aynı ailedendir ve onda da benzer bir makas vardır. Ama sarımsakta o ikinci enzim yoktur. Bu yüzden sarımsak ağzını yakar ama seni ağlatmaz." },
    { id: 'n-flavor', say: "İşin güzel tarafı şu: Gözünü yakan bu zincir, soğana o keskin, iştah açan tadını veren tepkimelerle aynı yerden başlar. Yani biraz ağlamak, biraz da lezzetin bedeli." },

    // 7 · Her soğan aynı değil
    { id: 'k-measure', say: "Her soğan da aynı derecede ağlatmaz. Makas çalışırken yan ürün olarak pirüvik asit adında bir madde de çıkar. Laboratuvarlar bir soğanın ne kadar keskin olduğunu tam da bu artığı ölçerek bulur." },
    { id: 'k-vary', say: "Bu değer çeşide göre değişir. Aynı çeşitte bile o yılın sıcağına, kuraklığına göre farklı çıkabilir. Yani bugün seni ağlatan soğan, geçen haftakinden gerçekten daha sert olabilir." },

    // 8 · En taze araştırma: damlacıklar
    { id: 'c-study', say: "Şimdi işin en taze kısmına gelelim. İki bin yirmi beşte, Amerika'daki Cornell Üniversitesi'nden araştırmacılar, soğan kesilirken neler olduğunu çok yüksek hızlı kameralarla izledi." },
    { id: 'c-press', say: "Gördükleri şaşırtıcıydı. Bıçak soğanın sert dış zarına bastığında zar hemen kesilmiyor. Önce esniyor, alttaki yumuşak dokuyu eziyor ve içeride basınç birikiyor." },
    { id: 'c-burst', say: "Zar sonunda yırtılınca soğan suyu minicik damlacıklar hâlinde dışarı fışkırıyor. En hızlıları saniyede kırk metreye ulaşıyor; bu, saatte yüz kırk kilometreden fazla. Otoyoldaki çoğu arabadan hızlı." },
    { id: 'c-result', say: "Ve iki şeyi açıkça gösterdiler: Bıçak ne kadar körse, fışkıran damlacık o kadar çok ve o kadar hızlı. Kesiş ne kadar hızlıysa, damlacık yine o kadar çok." },
    { id: 'c-irony', say: "Yani hızlı hızlı doğrayayım da bir an önce bitsin taktiği, aslında havaya daha çok soğan suyu saçıyor. Araştırmacılara göre ağlatan maddeyi gözüne taşıyanlardan biri de bu damlacıklar." },

    // 9 · Bu akşam dene
    { id: 'p-intro', say: "Peki bütün bunlar mutfakta ne işe yarar? İşte bilimin söylediği dört basit öneri." },
    { id: 'p-knife', say: "Bir: Bıçağını bile. Keskin bıçak zarı ezmeden keser; daha az hücre patlar, daha az damlacık fışkırır." },
    { id: 'p-slow', say: "İki: Acele etme. Sakin, kontrollü kesişler daha az damlacık demek. Parmakların da sana teşekkür eder." },
    { id: 'p-air', say: "Üç: Havalandır. Aspiratörü aç, pencereyi arala ya da yanına bir vantilatör koy. Ağlatan gaz yüzüne ulaşmadan dağılsın." },
    { id: 'p-goggles', say: "Dört: En kesin çözüm biraz komik görünebilir: gözlük. Gazın ulaşamadığı göz ağlamaz. Kenarları yüzüne oturan bir yüzücü gözlüğü bile iş görür." },
    { id: 'p-cook', say: "Bir de şunu mutlaka fark etmişsindir: Tavada kavrulan soğan seni ağlatmaz. Çünkü ısı enzimleri bozar; makas artık çalışmaz. Peki kavrulan soğan neden tatlanır? O da başka bir bölümün konusu." },

    // 10 · Efsane mi, gerçek mi?
    { id: 'e-intro', say: "Ve geldik Efsane mi, gerçek mi köşesine." },
    { id: 'e-fridge', say: "Soğanı kesmeden önce buzdolabına koymak işe yarar mı? Çok yaygın bir tavsiye. Ama aynı Cornell ekibi, soğutulmuş soğanların daha az değil, daha fazla damlacık fırlatabildiğini gördü. Araştırmacılar bunun için daha çok çalışma gerektiğini söylüyor. Şimdilik hükmümüz: şüpheli." },
    { id: 'e-bread', say: "Ağzında ekmek tutmak ya da yanına mum yakmak? Bunları ölçen ciddi bir çalışma bulamadık. Üstelik ağlatan gaz gözüne havadan gidiyor; ağzındaki ekmeğin onu durdurması pek mümkün görünmüyor. Hükmümüz: kanıtı yok." },
    { id: 'e-tearless', say: "Peki hiç ağlatmayan soğan var mı? Bu bir efsane değil, gerçek! Japonya'da makası neredeyse hiç çalışmayan soğanlar geliştirildi. Amerika'da da otuz yıllık klasik ıslahla, depoda bekledikçe daha da yumuşayan bir soğan raflara çıktı." },

    // 11 · Kapanış
    { id: 'z-sum', say: "Özetleyelim: Bıçak hücrenin duvarını yıkar, iki enzim art arda çalışır, ortaya çıkan gaz gözündeki sinirleri uyarır ve beynin, gözünü yıkamak için gözyaşı gönderir." },
    { id: 'z-tonight', say: "Bu akşam soğan doğrarken bıçağını bile, acele etme, aspiratörü aç. Yine de gözlerin dolarsa bil ki bu, gözünün seni koruma şekli." },
    { id: 'z-next', say: "Bir sonraki bölümde başka bir yakıcı soruya bakacağız: Acı biber ağzını neden yakar? Ve neden su değil de süt işe yarar?" },
    { id: 'z-end', say: "Tabağındaki Bilim'de bugünlük bu kadar. Bir sonraki tabakta görüşmek üzere!" },
  ],
};
window.NARRATION.lines.forEach((l) => { l.beat = l.id; });
