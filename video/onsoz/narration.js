/*
 * Önsöz — Gece Yarısı Dokunulan Cam. Türkçe seslendirme metni (alt yazı yok).
 * Kitabın önsözünden, kursun genel izleyicisi için uyarlandı: kursa hoş geldiniz videosu.
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS; vuruş kimliği satır kimliğiyle aynıdır) bağlıdır ve o vuruşun
 * başından itibaren okunur; görüntü, anlatıcı satırını bitirmeden ilerlemez.
 *   say     okunacak metin: sayılar yazıyla, simge yok
 * Virgül, nokta gibi işaretler hem durak hem de öbek sınırıdır: film.js bir öğeyi cue('satır', k) ile
 * satırın k. öbeğine bağlar (0'dan sayılır). Noktalamayı değiştirirseniz film.js'teki cue numaralarını denetleyin.
 * İnsan sesi: her satır <id>.mp3 olarak kaydedilir ve dub.mjs ile hazır videoya eklenir.
 * Metni değiştirince: node video/narrate.mjs onsoz --pay 1.1
 */
window.NARRATION = {
  lines: [
    // 0 · Açılış
    { id: 'open-title', say: 'Önsöz. Gece yarısı dokunulan cam.' },

    // 1 · Gece yarısı
    { id: 'night-elif', say: 'Gece yarısı. On altı yaşındaki Elif, elindeki telefonun camına dokunuyor.' },
    { id: 'night-berk', say: 'Yarın matematik sınavı var. Ama asıl korkan Elif değil; sınıf arkadaşı Berk.' },
    { id: 'night-type', say: 'Elif ekrana üç kelime yazıyor: Yarın birlikte çalışalım.' },
    { id: 'night-send', say: 'Gönder tuşuna dokunuyor. Saniyenin onda biri geçmeden, mesaj karşı tarafta.' },
    { id: 'night-simple', say: 'Elif için olan biten bundan ibaret: dokundu ve gitti.' },
    { id: 'night-hidden', say: 'Oysa o kısacık aralıkta, insanlığın kurduğu en büyük ortak yapıtlardan biri, sessizce çalışıyor.' },

    // 2 · Mesajın görünmez yolculuğu
    { id: 'jr-switch', say: 'Camın hemen altında, saniyede milyarlarca kez açılıp kapanan minicik anahtarlar var. Yazılan her harf, yalnızca iki simgeye dönüşüyor: var ve yok.' },
    { id: 'jr-program', say: 'Bunların hepsi, bir insanın önceden yazdığı bir programın adımlarını izleyerek oluyor.' },
    { id: 'jr-memory', say: 'İleti, önce telefonun belleğinde şekilleniyor.' },
    { id: 'jr-wifi', say: 'Sonra görünmez dalgalara binip, evin köşesindeki küçük kutuya ulaşıyor.' },
    { id: 'jr-fiber', say: 'Oradan sokağın altındaki ince cam liflere giriyor. Işık olup; şehirleri, ovaları, denizleri aşıyor.' },
    { id: 'jr-routers', say: 'Yol boyunca onlarca aygıt, tıpkı haritaya bakan bir yolcu gibi, iletinin nereye gideceğine saniyenin binde biri içinde karar veriyor.' },
    { id: 'jr-db', say: 'Bir yerde, bir veri tabanına kaydediliyor.' },
    { id: 'jr-lock', say: 'Bir güvenlik katmanı onu şifreliyor; yolda onu kim görürse görsün, yalnızca anlamsız bir karmaşa görüyor.' },
    { id: 'jr-arrive', say: 'Berk’in telefonuna ulaştığında, bu uzun yolculuğun bütün izleri siliniyor.' },
    { id: 'jr-left', say: 'Geriye yalnızca, ekranda beliren o küçük ve sıcak cümle kalıyor.' },
    { id: 'jr-course', say: 'Bu kurs, işte o silinen izin peşine düşüyor.' },

    // 3 · Köprüyü ayakta tutan şey görünmez
    { id: 'br-intro', say: 'Silvan yakınlarında, Batman Çayı’nın üzerinde, sekiz yüz yılı aşkın süredir ayakta duran bir köprü var: Malabadi.' },
    { id: 'br-see', say: 'Uzaktan bakan biri, yalnızca koca bir taş kemer görür.' },
    { id: 'br-forces', say: 'Oysa kemeri ayakta tutan güç görünmez: taşları birbirine kilitleyen basınç, tepedeki kilit taşının yükü dağıtması, suyun altında yüzyıllardır kıpırdamayan temel.' },
    { id: 'br-master', say: 'Ustanın asıl hüneri taşı yontmak değil; hangi taşın hangi yükü taşıyacağını bilmektir.' },
    { id: 'br-team', say: 'Üstelik bu köprüyü tek bir kişi kurmadı. Taşçısı, kalıpçısı, harççısı, dülgeri, iskele kurucusu; her biri kendi işinin ustasıydı.' },
    { id: 'br-harmony', say: 'Yapıyı ayakta tutan, ustaların toplamı değil; aralarındaki uyumdur.' },
    { id: 'br-cross', say: 'Ve bir köprünün asıl işi yük taşımak değil, karşıya geçirmektir. İki yakayı birbirine bağlar.' },

    // 4 · Görünmez köprü
    { id: 'inv-second', say: 'Bugün insanlık, benzer bir yapıyı ikinci kez kuruyor. Ama bu kez taştan değil.' },
    { id: 'inv-parts', say: 'Okyanusların dibinden geçen cam liflerle, gökteki uydularla, şehirlerin kıyısındaki veri merkezleriyle; milyarlarca satır yazılımla.' },
    { id: 'inv-unseen', say: 'Bu yapının ne ayağı görünüyor, ne kemeri.' },
    { id: 'inv-life', say: 'Yine de her gün onun içinde yaşıyoruz: sabah çalan alarm, hastanedeki kayıt, kartla ödeme, tarladaki sulama, uçağın rotası. Hepsi onun içinden geçiyor.' },

    // 5 · Kullanılan değil, kurulan
    { id: 'bd-surface', say: 'Görünmediği için, çoğumuz ona yalnızca yüzeyden dokunuyoruz. Düğmeye basıyoruz, ışık yanıyor. Uygulamayı açıyoruz, yemek kapıya geliyor.' },
    { id: 'bd-belief', say: 'Ve yavaş yavaş şuna inanmaya başlıyoruz: teknoloji, kullanılan bir şeydir.' },
    { id: 'bd-claim', say: 'Bu kurs, bu inancı nazikçe ama kararlılıkla değiştirmek için var. Teknoloji kullanılan bir şey değil; kurulan bir şeydir.' },
    { id: 'bd-decide', say: 'Ve onu kuranlar, başkalarının ondan nasıl yararlanacağına da en baştan karar verir.' },

    // 6 · Bütüncül bakış
    { id: 'ch-split', say: 'Okullarda konular çoğu zaman ayrı kutulara konur: bir yanda donanım, bir yanda programlama, bir yanda ağlar, bir yanda tasarım.' },
    { id: 'ch-real', say: 'Bu ayrım öğrenmeyi kolaylaştırır; ama gerçekte hiçbir teknoloji tek başına ayakta durmaz.' },
    { id: 'ch-links', say: 'Veri tabanı olmayan bir uygulama, hafızasız bir zihindir. Ağa bağlanmayan bir veri tabanı, kapısı örülmüş bir kütüphanedir. Güvenliği olmayan bir ağ, kapısı açık bırakılmış bir evdir.' },
    { id: 'ch-links2', say: 'Algoritması olmayan bir güvenlik, düşünmeyen bir bekçidir. Donanımı olmayan bir algoritma, kâğıtta kalmış bir niyettir. Tasarımı olmayan bütün bu güç ise, insana ulaşamaz.' },
    { id: 'ch-revisit', say: 'Bu yüzden bu kursta konular, kopuk adalar gibi işlenmeyecek. Elif’in o gece gönderdiği iletiye, her kapıda yeniden döneceğiz; her seferinde biraz daha derine inerek.' },
    { id: 'ch-whole', say: 'Ta ki o tek dokunuşun ardındaki bütün katmanları, aynı anda görene dek. Buna bütüncül bakış diyoruz: parçaları değil, parçalar arasındaki görünmez bağları görmek.' },

    // 7 · Bu yolculuk kimin için?
    { id: 'who-everyone', say: 'Bu yolculuk kimin için? Teknolojinin perde arkasını merak eden herkes için.' },
    { id: 'who-learner', say: 'Bilişime yeni adım atıyorsanız, şunu bilin: öğreneceğiniz bazı araçlar, on yıl sonra kullanılmıyor olabilir. Bu korkulacak değil; sevinilecek bir haber.' },
    { id: 'who-thinking', say: 'Çünkü asıl kazanacağınız şey araçlar değil, bir düşünme biçimi: sorunu parçalara ayırmak, kalıpları görmek, çözümü adım adım kurmak, onu başkasına anlatabilmek. Bu beceri hiç eskimez.' },
    { id: 'who-side', say: 'Bu alan size, bir meslekten önce bir konum sunuyor: ekranın hangi tarafında duracağınızı seçme hakkı.' },
    { id: 'who-parent', say: 'Çocuğunun ekran başında geçirdiği zamandan endişe eden bir veliyseniz: ekranın karşısında olmakla, ekranın arkasında olmak, bambaşka şeylerdir.' },
    { id: 'who-two', say: 'Bir çocuk, bir uygulamayı saatlerce kullanabilir. Bir başkası ise sorar: bu neden böyle çalışıyor, verim nereye gidiyor, bunu kim, ne amaçla tasarladı? İkinci çocuk, birincinin dünyasını kuran kişidir.' },
    { id: 'who-all', say: 'Öğretmen, yönetici ya da yalnızca meraklı bir yetişkin olun; bugün üretimden sağlığa, tarımdan hukuka, her alan yazılımla yeniden kuruluyor. Bu dönüşümü anlamak, artık hepimizin işi.' },

    // 8 · Çırak, kalfa, usta
    { id: 'cr-old', say: 'Bu topraklarda bir zanaatı öğrenmenin, çok eski ve bilge bir düzeni vardır.' },
    { id: 'cr-cirak', say: 'Çırak izler: bakmayı, tezgâhı temiz bırakmayı, sabretmeyi öğrenir.' },
    { id: 'cr-kalfa', say: 'Kalfa yapar: ustanın gözü üzerindeyken üretir, hata yapar, hatasından döner.' },
    { id: 'cr-usta', say: 'Usta ise yalnızca üretmez: öğretir, sorumluluk taşır, yaptığı işin arkasında durur.' },
    { id: 'cr-ahi', say: 'Bu düzenin adı Ahilikti. En dikkat çekici yanı da şuydu: usta, çırağına önce sanatını değil, ahlakını öğretirdi.' },
    { id: 'cr-today', say: 'Bugünün atölyesinde tezgâhın yerini bilgisayar, eğenin yerini kod düzenleyici aldı. Ama düzen aynı: önce başkasının kodunu okursunuz, sonra küçük bir parçasını yazarsınız, en sonunda bir bütünün sorumluluğunu taşırsınız.' },
    { id: 'cr-ethics', say: 'Bu yüzden bu kursta etik, ayrı bir başlığa kapatılmayacak. Bir sistemi nasıl kuracağımızı konuşurken, neden öyle kurmamız gerektiğini de konuşacağız. Bir veriyi saklarken, onun bir insana ait olduğunu unutmayacağız.' },
    { id: 'cr-motto', say: 'Çünkü yeteneğin karakterden hızlı büyüdüğü her yerde, tehlike vardır.' },

    // 9 · Kendi taşını yontmak
    { id: 'st-masons', say: 'Bir köprüyü ören taş ustalarının çoğu, karşı yakaya ilk geçen kişiyi göremeden öldü. Yine de her biri kendi taşını, tamamını hiç göremeyeceği bir bütünün parçası olacağını bilerek yonttu.' },
    { id: 'st-today', say: 'Bugün bilişime adım atan herkes, aynı yapının içinde. Yazılan birkaç satır kod, tasarlanan tek bir ekran, kurulan küçük bir ağ; tek başına küçük görünür.' },
    { id: 'st-bridge', say: 'Oysa hepsi, insanlığın kurmakta olduğu o görünmez köprünün, birer taşıdır.' },
    { id: 'st-welcome', say: 'Bu kurs, kendi taşını yontmadan önce, bütünü bir kez olsun görmek isteyenler için. Hoş geldiniz.' },
    { id: 'st-next', say: 'İlk kapıda, en küçük taşla başlıyoruz: var ve yok.' },
  ],
};
// Her satır kendi adını taşıyan vuruşa bağlıdır
window.NARRATION.lines.forEach((l) => { l.beat = l.id; });
