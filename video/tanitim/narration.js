/*
 * Bilişim Teknolojileri Yetkinliği — kurs tanıtım videosu. Türkçe seslendirme metni (alt yazı yok).
 *
 * Her satır bir vuruşa (beat, film.js'teki BEATS) bağlıdır ve o vuruşun başından itibaren sırayla okunur;
 * görüntü, anlatıcı satırlarını bitirmeden ilerlemez.
 *   say     okunacak metin: sayılar yazıyla, simge yok
 *   offset  vuruş başından sonra en erken başlama (sn)
 * Virgül, nokta gibi işaretler hem durak hem de öbek sınırıdır: film.js bir öğeyi cue('satır', k) ile
 * satırın k. öbeğine bağlar (0'dan sayılır). Noktalamayı değiştirirseniz film.js'teki cue numaralarını denetleyin.
 * İnsan sesi: her satır <id>.mp3 olarak kaydedilir ve dub.mjs ile hazır videoya eklenir.
 * Metni değiştirince: node video/narrate.mjs tanitim --pay 1.1
 */
window.NARRATION = {
  lines: [
    // 1 · Tepeden tepeye ateş
    { id: 'fire-chain', beat: 'fires.chain', offset: 0.6, say: 'Bir zamanlar haber, tepeden tepeye yakılan ateşlerle taşınırdı.' },
    { id: 'fire-bit', beat: 'fires.bit', say: 'Ateş ya yanar ya da yanmaz: var ya da yok. Bugün cebinizdeki telefon da, aynı iki simgeyle konuşuyor.' },

    // 2 · İki simgeden her şey
    { id: 'question', beat: 'question.ask', say: 'Peki yalnızca iki simgeden; harfler, fotoğraflar, oyunlar, hatta yapay zekâ nasıl doğuyor?' },

    // 3 · Kursun adı
    { id: 'title', beat: 'title.say', offset: 0.4, say: 'Bilişim Teknolojileri Yetkinliği, bu sorunun peşine düşen bir yolculuk.' },

    // 4 · On iki kapı
    { id: 'gates', beat: 'gates.intro', say: 'Yolculuk, on iki kapıdan geçiyor:' },
    { id: 'gates-list', beat: 'gates.list', say: 'elektriğin sayıya dönüşmesinden makinenin bedenine; algoritmalardan yazılımın yapısına; veri tabanlarından internete; siber güvenlikten web ve mobile; robotlardan yapay zekâya; atölye kültüründen meslek seçimine kadar.' },

    // 5 · Nasıl anlatılıyor
    { id: 'style', beat: 'screen.style', say: 'Her konu, adım adım ilerleyen animasyonlarla anlatılıyor. Gerektiğinde önce bir ön öğrenme yapıyor, sonra asıl konuya geçiyoruz.' },
    { id: 'example', beat: 'screen.example', say: 'Bir harfin nasıl sayıya dönüştüğünü, kapıların nasıl toplama yaptığını, aynı sayının nasıl üç ayrı anlama geldiğini; hepsini gözünüzün önünde kuruyoruz.' },

    // 6 · Ders kitabı
    { id: 'book', beat: 'book.say', say: 'Videolara eşlik eden ders kitabı ve etkinliklerle, öğrendiklerinizi kalem elde pekiştiriyorsunuz.' },

    // 7 · Kimler için
    { id: 'who', beat: 'who.say', say: 'Ön bilgi gerekmiyor. Bilişim Teknolojileri alanını seçmeyi düşünen bir öğrenci de, teknolojinin perde arkasını merak eden bir yetişkin de, buradan başlayabilir.' },

    // 8 · Şimdi açık olan
    { id: 'now', beat: 'now.say', say: 'Birinci kapı, dört bölümüyle açık. Diğer kapılar, birer birer açılacak.' },

    // 9 · Kapanış
    { id: 'close', beat: 'close.say', say: 'İlk ateşi birlikte yakalım. Bilişim Teknolojileri Yetkinliği’ne hoş geldiniz.' },
  ],
};
