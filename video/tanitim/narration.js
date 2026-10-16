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
    { id: 'fire-chain', beat: 'fires.chain', offset: 0.3, say: 'Bir zamanlar önemli bir haber, tepeden tepeye yakılan ateşlerle taşınırdı.' },
    { id: 'fire-bit', beat: 'fires.bit', say: 'Ateş ya yanar ya yanmaz: var ya da yok. Bugün cebinizdeki telefon da, aynı iki simgeyle konuşuyor.' },

    // 2 · İki simgeden her şey
    { id: 'question', beat: 'question.ask', say: 'Peki, harfler, fotoğraflar, oyunlar, hatta yapay zekâ, yalnızca iki simgeden nasıl doğuyor?' },

    // 3 · Kursun adı
    { id: 'title', beat: 'title.say', offset: 0.4, say: 'Bilişim Teknolojileri Yetkinliği, bu sorunun peşine düşen bir yolculuk.' },

    // 4 · Nasıl anlatılıyor (kurstan görüntüler)
    { id: 'style', beat: 'screen.style', say: 'Konular, adım adım animasyonlarla anlatılıyor. Gerektiğinde önce kısa bir ön öğrenme, sonra asıl konu.' },
    { id: 'example', beat: 'screen.example', say: 'Bir harfin sayıya dönüşmesini, aynı sayının üç ayrı anlam taşımasını; hepsini gözünüzün önünde kuruyoruz.' },

    // 5 · On iki kapı
    { id: 'gates', beat: 'gates.intro', say: 'Bu yolculuk on iki kapıdan geçecek:' },
    { id: 'gates-list', beat: 'gates.list', say: 'bitten işlemciye; algoritmadan yazılıma; veri tabanından internete; siber güvenlikten web ve mobile; robotlardan yapay zekâya; atölyeden mesleğe kadar.' },

    // 6 · Şimdi açık olan
    { id: 'now', beat: 'now.say', say: 'Şimdilik birinci kapı açık, dört bölümüyle. Diğer kapılar da, birer birer açılacak; açıldıkça sizin de olacak.' },

    // 7 · Ders kitabı
    { id: 'book', beat: 'book.say', say: 'İlk bölümün ders kitabı ve etkinlikleri de hazır: öğrendiklerinizi kalem elde pekiştiriyorsunuz.' },

    // 8 · Kimler için
    { id: 'who', beat: 'who.say', say: 'Ön bilgi gerekmez. Bilişim alanını düşünen öğrenciler, perde arkasını merak eden yetişkinler, öğretmenler ve veliler; herkes buradan başlayabilir.' },

    // 9 · Kapanış
    { id: 'close', beat: 'close.say', say: 'İlk ateşi birlikte yakalım. Birinci Kapı sizi bekliyor.' },
  ],
};
