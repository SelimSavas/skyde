/*
 * Birinci Kapı, 2. bölüm — Taşa Kazınan Mantık: Türkçe seslendirme metni (alt yazı yok).
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS) bağlıdır ve o vuruşun başından itibaren sırayla okunur;
 * görüntü, anlatıcı satırlarını bitirmeden ilerlemez.
 *   say     okunacak metin: sayılar yazıyla, simge yok
 *   offset  vuruş başından sonra en erken başlama (sn)
 * Virgül, nokta gibi işaretler hem durak hem de öbek sınırıdır: film.js bir öğeyi cue('satır', k) ile
 * satırın k. öbeğine bağlar (0'dan sayılır). Noktalamayı değiştirirseniz film.js'teki cue numaralarını denetleyin.
 * İnsan sesi: her satır <id>.mp3 olarak kaydedilir ve dub.mjs ile hazır videoya eklenir.
 * Metni değiştirince: node video/narrate.mjs ch02-tasa-kazinan-mantik --pay 1.1
 */
window.NARRATION = {
  lines: [
    { id: 'open-title', beat: 'open.title', offset: 0.5, say: 'Birinci kapı, ikinci bölüm: taşa kazınan mantık.' },

    // 1 · Hatırlatma ve soru
    { id: 'recap-numbers', beat: 'recap.numbers', say: 'Bir önceki bölümde, makinenin sayıları nasıl tuttuğunu konuştuk: her şey, var ile yok, bir ile sıfır dizileridir.' },
    { id: 'recap-question', beat: 'recap.question', say: 'Şimdi çok daha şaşırtıcı bir soruya geliyoruz: elektrik nasıl olur da düşünür?' },
    { id: 'recap-bell', beat: 'recap.bell', say: 'Yanıt, bir kapı zilinden bile basittir.' },

    // 2 · Devre ve anahtar (ön bilgi)
    { id: 'circuit-loop', beat: 'circuit.loop', say: 'Önce küçük bir hatırlatma. Elektriğin bir lambayı yakabilmesi için, pilden çıkıp yeniden pile dönen, kesintisiz bir yol gerekir; buna devre denir.' },
    { id: 'circuit-break', beat: 'circuit.break', say: 'Yol bir yerinden koptuğunda, akım durur ve lamba söner.' },
    { id: 'circuit-switch', beat: 'circuit.switch', say: 'Anahtar, bu yolu isteğimizle açıp kapatan küçük bir köprüdür. Işığı açmak der gibi, anahtar açık dediğimizde, akımın geçtiği konumu kastedeceğiz.' },
    { id: 'circuit-bits', beat: 'circuit.bits', say: 'Açık, bir; kapalı, sıfır. Lamba yanıyorsa bir, sönükse sıfır.' },

    // 3 · VE kapısı
    { id: 'and-setup', beat: 'and.setup', say: 'Şimdi bir odada bir lamba ve iki anahtar olsun; adları A ile B. Anahtarları arka arkaya, tek bir hat üzerine bağlayalım.' },
    { id: 'and-cases', beat: 'and.cases', say: 'İkisi de kapalı: lamba sönük. Yalnız A açık: yine sönük. Yalnız B açık: yine sönük. İkisi de açık: lamba yanar.' },
    { id: 'and-why', beat: 'and.why', say: 'Çünkü akımın tek bir yolu var, ve o yol iki anahtarın da içinden geçer; biri bile kapalıysa, yol kopar.' },
    { id: 'and-name', beat: 'and.name', say: 'Bu düzeneğin adı, VE kapısıdır: A VE B açıksa, lamba yanar.' },
    { id: 'and-gate', beat: 'and.name', say: 'Kapı denmesinin nedeni de şu: bu düzenekler, akımın geçip geçmeyeceğine karar verir; tıpkı açılıp kapanan bir kapı gibi.' },

    // 4 · VEYA kapısı
    { id: 'or-setup', beat: 'or.setup', say: 'Şimdi aynı iki anahtarı yan yana, ayrı hatlara bağlayalım. Artık akımın iki yolu var.' },
    { id: 'or-cases', beat: 'or.cases', say: 'İkisi de kapalıyken lamba sönük. A açılınca yanar; B açılınca da yanar; ikisi birden açıkken de yanar.' },
    { id: 'or-name', beat: 'or.name', say: 'Herhangi biri açıksa, lamba yanar. Bunun adı da VEYA kapısıdır.' },

    // 5 · DEĞİL kapısı
    { id: 'not-fridge', beat: 'not.fridge', say: 'Üçüncü bir düzenek daha kurabiliriz: girişi tersine çeviren bir düzenek. Buzdolabının içindeki ışığı düşünün. Kapı kapanırken küçük bir düğmeye bastırır, ve ışık söner; kapıyı açtığınızda düğme bırakılır, ışık yanar.' },
    { id: 'not-name', beat: 'not.name', say: 'Anahtar açıkken lamba söner, kapalıyken yanar. Buna DEĞİL kapısı denir: bir girerse sıfır çıkar, sıfır girerse bir.' },
    { id: 'not-three', beat: 'not.three', say: 'Hepsi bu kadar. VE, VEYA, DEĞİL. Bilişim dünyasının bütün mantığı, bu üç düzenekten kuruludur. Mühendisler onları, işte bu simgelerle çizer.' },

    // 6 · Bunun neden devrimsel olduğu
    { id: 'why-pause', beat: 'why.pause', say: 'Bir an durup düşünelim. Kurduğumuz şey, yalnızca elektrikle çalışan bir devre değildi; bir cümleyi elektriğe çevirmiş olduk.' },
    { id: 'why-alarm', beat: 'why.alarm', say: 'Kapı açıksa VE alarm kuruluysa, sireni çal. Bu bir insan cümlesidir. Ama artık ona karşılık gelen bir devre kurabiliyoruz: iki anahtar, arka arkaya, ucunda siren.' },
    { id: 'why-fire', beat: 'why.fire', say: 'Yangın algılandıysa VEYA düğmeye basıldıysa, kapıları aç. Bu da bir insan cümlesidir; onun da devresi var: iki anahtar, yan yana.' },
    { id: 'why-bridge', beat: 'why.bridge', say: 'İşte bilişimin sırrı burada yatar: mantıksal düşünme ile elektrik devresi arasında, birebir bir karşılık vardır. Bir kez bu köprü kurulunca, insanın kurabildiği her mantıklı cümle, elektrikle çalışan bir düzeneğe çevrilebilir.' },

    // 7 · Boole ve Shannon
    { id: 'boole-who', beat: 'boole.who', say: 'Bu köprünün matematiğini, on dokuzuncu yüzyılda İngiliz matematikçi George Boole kurmuştu; hiçbir makine yokken, tamamen kâğıt üzerinde.' },
    { id: 'boole-algebra', beat: 'boole.algebra', say: 'Cebir, harflerle hesap yapmak demektir. Boole bu hesabı sayılarla değil, doğru ile yanlışla yaptı: doğruya bir, yanlışa sıfır dedi. VE, onun için bir çarpmaydı; DEĞİL ise, birden çıkarmak.' },
    { id: 'boole-shannon', beat: 'boole.shannon', say: 'Yaklaşık yüz yıl sonra, bin dokuz yüz otuz yedide, Claude Shannon adında genç bir mühendis, Boole’un cebrinin elektrik anahtarlarıyla birebir örtüştüğünü fark etti.' },
    { id: 'boole-lesson', beat: 'boole.lesson', say: 'Kuramın, uygulamayı yüz yıl önceden beklediği bu hikâye, bunu ne zaman kullanacağım diye soran her öğrenciye anlatılmaya değer.' },

    // 8 · Doğruluk tablosu
    { id: 'table-intro', beat: 'table.intro', say: 'Bir mantık kapısının davranışını göstermenin en açık yolu, bütün olasılıkları bir tabloya dökmektir. Buna doğruluk tablosu denir.' },
    { id: 'table-read', beat: 'table.read', say: 'Solda girişler, sağda sonuç durur; her satır, bir durumdur. İki giriş varsa dört satır olur; ilk bölümdeki iki lambayı hatırlayın.' },
    { id: 'table-and', beat: 'table.and', say: 'VE kapısında ikisi de gerekir: dört satırdan yalnızca birinde, ikisi de bir olduğunda, sonuç birdir.' },
    { id: 'table-or', beat: 'table.or', say: 'VEYA kapısında biri yeter: sonuç, yalnızca ikisi de sıfırken sıfırdır.' },
    { id: 'table-not', beat: 'table.not', say: 'DEĞİL kapısının tek girişi vardır; ne girerse, tersi çıkar.' },
    { id: 'table-mult', beat: 'table.mult', say: 'Bu tablolara mantığın çarpım tablosu demek yanlış olmaz. Hatta VE tablosu, gerçekten de bir çarpım tablosudur: sıfırla biri çarpın, aynı sonuçları bulursunuz. Ezberlenmesi gerekmez; bir kez kavranınca, zaten unutulmaz.' },

    // 9 · Özel veya
    { id: 'xor-intro', beat: 'xor.intro', say: 'Bir kapı daha var, ve gündelik hayatta çok işe yarar: ÖZEL VEYA. İkisinden biri, ama ikisi birden değil, anlamına gelir.' },
    { id: 'xor-stairs', beat: 'xor.stairs', say: 'Bir merdiven boşluğundaki lambayı düşünün: aşağıdan da, yukarıdan da açılıp kapanır. Aşağıdaki anahtarı çevirin, lamba yanar. Yukarı çıkıp oradaki anahtarı çevirin, lamba söner.' },
    { id: 'xor-rule', beat: 'xor.rule', say: 'Anahtarlar farklı konumdaysa lamba yanar, aynı konumdaysa söner. İşte bu, özel veya kapısıdır.' },

    // 10 · Kapılar toplama yapar
    { id: 'adder-intro', beat: 'adder.intro', say: 'Özel veya, toplama işleminde de karşımıza çıkar. İlk bölümde gördüğümüz gibi makine sayıları bir ve sıfırla yazar; şimdi iki biti toplayalım.' },
    { id: 'adder-cases', beat: 'adder.cases', say: 'Sıfır artı sıfır, sıfır. Sıfır artı bir, bir. Bir artı sıfır, bir. Bir artı bir ise iki eder; ikili sayılarla yazınca, bir sıfır.' },
    { id: 'adder-carry', beat: 'adder.cases', say: 'Yani basamağa sıfır yazılır, bir de elde kalır; tıpkı dokuz artı birde, sıfır yazıp bir elde tuttuğumuz gibi.' },
    { id: 'adder-gates', beat: 'adder.gates', say: 'Şimdi sütunlara bakın. Basamağa yazılan, özel veyanın tablosudur; elde ise, VE’nin tablosu. Bir özel veya ile bir VE kapısı yan yana konunca, iki biti toplayan bir makine olur.' },
    { id: 'adder-chain', beat: 'adder.chain', say: 'Bu küçük toplayıcıları arka arkaya dizince, ne kadar büyük olursa olsun iki sayı toplanabilir. Altı artı yedi, on üç. Her hesap makinesinin kalbinde, bu düzenek atar.' },

    // 11 · Anahtarı kim çevirir?
    { id: 'turn-hand', beat: 'turn.hand', say: 'Şimdiye kadar anahtarları elle çevirdik. Ama bir makinenin, saniyede milyarlarca kez anahtar çevirmesi gerekir; hiçbir el buna yetişemez.' },
    { id: 'turn-chain', beat: 'turn.chain', say: 'Çözüm, elle değil, elektrikle çevrilen bir anahtar bulmaktı. Böylece bir kapının çıkışı, bir sonraki kapının anahtarını çevirebilecekti; zincirleme düşünme mümkün olacaktı.' },
    { id: 'turn-transistor', beat: 'turn.transistor', say: 'Bu buluşun adı transistördür, ve muhtemelen yirminci yüzyılın en önemli icadıdır. Yaptığı iş kulağa sıradan gelir: küçük bir elektrik akımıyla, daha büyük bir akımı açıp kapatır.' },
    { id: 'turn-faucet', beat: 'turn.faucet', say: 'Bir musluğun kolu gibidir; ama kolu çeviren el değil, elektriktir.' },

    // 12 · Tüpten transistöre
    { id: 'tubes-before', beat: 'tubes.before', say: 'Transistörden önce bu işi vakumlu tüpler yapıyordu: ampul boyutunda, sıcak, kırılgan, ve çok elektrik yiyen düzenekler.' },
    { id: 'tubes-eniac', beat: 'tubes.eniac', say: 'İlk bilgisayarlardan ENIAC, on yedi bin tüple koca bir odayı doldururdu; ağırlığı otuz tona yaklaşırdı. Gücü ise, bugünkü bir cep hesap makinesinin altındaydı.' },
    { id: 'tubes-small', beat: 'tubes.small', say: 'Transistör ise küçüktü, ısınmıyordu, kırılmıyordu. Ve daha da önemlisi: küçültülebiliyordu.' },

    // 13 · Kum tanesindeki şehir
    { id: 'chip-print', beat: 'chip.print', say: 'Bir sonraki adım, transistörleri tek tek üretip birbirine lehimlemek yerine, hepsini aynı silisyum parçasının üzerine birlikte basmaktı.' },
    { id: 'chip-silicon', beat: 'chip.silicon', say: 'Silisyum, kumun ve taşın içinde bol bulunan bir elementtir. Kumdan arıtılır, ince dilimlere kesilir; devre ise, ışıkla bir şablondan geçirilerek, fotoğraf basar gibi bu dilimin üzerine basılır.' },
    { id: 'chip-name', beat: 'chip.name', say: 'Buna tümleşik devre, halk arasındaki adıyla çip denir. Bölümün adı da buradan gelir: mantık, sözün gerçek anlamıyla taşa kazınır.' },

    // 14 · Büyüme
    { id: 'growth-intro', beat: 'growth.intro', say: 'Sonrası, insanlık tarihindeki en hızlı büyüme eğrilerinden biridir.' },
    { id: 'growth-list', beat: 'growth.list', say: 'Bin dokuz yüz yetmişlerin bir işlemcisinde, birkaç bin transistör vardı. İki binlerin bir işlemcisinde, birkaç yüz milyon. Bugünün bir telefon işlemcisinde ise, on milyarlarca.' },
    { id: 'growth-doubling', beat: 'growth.doubling', say: 'Bu sayı, kabaca her iki yılda bir ikiye katlandı. İlk bölümdeki lambalarda gördüğümüz gibi, katlamalar birikince, sezgimiz yine yanılır.' },

    // 15 · Sayılamayan
    { id: 'scale-people', beat: 'scale.people', say: 'Bu sayıyı somutlaştırmak zordur; şöyle deneyelim. Türkiye’nin nüfusu, seksen beş milyon civarındadır.' },
    { id: 'scale-phone', beat: 'scale.phone', say: 'Cebinizdeki telefonun işlemcisinde, Türkiye nüfusunun yüzden fazla katı sayıda anahtar vardır; ve hepsi, bir tırnak büyüklüğündeki alana sığmıştır.' },
    { id: 'scale-speed', beat: 'scale.speed', say: 'Her biri, saniyede milyarlarca kez açılıp kapanır. Bu, insan elinin yaptığı en yoğun yapıdır.' },
    { id: 'scale-mosque', beat: 'scale.mosque', say: 'Süleymaniye’nin taşları sayılabilir; bir işlemcinin transistörleri sayılamaz.' },

    { id: 'end-quote', beat: 'end.quote', say: 'Bir şeyin nasıl çalıştığını bilmek, ona duyulan hayranlığı azaltmaz; hak edilmiş kılar.' },
    { id: 'close-end', beat: 'close.end', say: 'Taşa kazınan mantık.' },
  ],
};
