/*
 * YUP Akademi — Gecenin Mavi Işığı: Ekran Işığı Beynimizdeki Saati Nasıl Kandırır?
 * Türkçe seslendirme metni. Her satır kendi adını taşıyan vuruşa bağlıdır (film.js).
 * Sayılar yazıyla; kaynaklar için bkz. kaynaklar.md.
 * Kaydı olan satırın metni değişirse kimliği de değişmeli (eski kayıt yanlış satıra düşmesin).
 * Metni değiştirince: node video/narrate.mjs yup-mavi-isik --engine files:seslendirme/MaviIsik
 */
window.NARRATION = {
  lines: [
    // 0 · Gece yarısı
    { id: 'h-night', say: 'Gece saat bir buçuk. Yarın erken kalkman gerekiyor; ama elinde telefon, sadece beş dakika daha diyorsun.' },
    { id: 'h-off', say: 'Sonunda ekranı kapatıyorsun. Oda karanlık, gözlerin kapalı.' },
    { id: 'h-awake', say: 'Ama uyku gelmiyor. Çünkü beyninin derinlerinde bir saat, hâlâ gündüz olduğunu düşünüyor.' },
    { id: 'h-know', say: 'Belki sen de tanıyorsun: pazar gecesi bir türlü gelmeyen uyku, sabah beş kez ertelenen alarm, öğleden sonra çöken enerji.' },
    { id: 'h-plan', say: 'Bu videoda o saatin nasıl çalıştığını, ışığın onu nasıl kandırdığını ve en önemlisi, bu akşamdan itibaren neyi farklı yapabileceğini göreceğiz.' },

    // 1 · İç saat
    { id: 'c-earth', say: 'Dünya yirmi dört saatte bir döner; gece ile gündüz birbirini kovalar.' },
    { id: 'c-body', say: 'Vücudumuz da bu ritme uyar: vücut ısısı, hormonlar, uyanıklık, hatta acıkma saatimiz.' },
    { id: 'c-name', say: 'Bu ritme sirkadiyen ritim denir; Latincede, yaklaşık bir gün demektir.' },
    { id: 'c-period', say: 'İlginç olan şu: iç saatimiz tam yirmi dört saat değil. Kontrollü deneylerde, ortalama yirmi dört saat on bir dakika ölçülmüş.' },
    { id: 'c-reset', say: 'Yani saatimiz her gün biraz kayar. Onu her sabah yeniden ayarlayan şey ise ışıktır.' },
    { id: 'c-jetlag', say: 'Bu kaymayı hepimiz yaşarız. Hafta sonu geç yatıp öğlene kadar uyuduğunda, sabah ışığını kaçırırsın ve iç saatin ileri kayar. Pazartesi sabahı alarm çaldığında vücudun, sanki başka bir saat diliminden yeni dönmüş gibidir. Buna sosyal jet lag denir.' },

    // 2 · Orkestra şefi
    { id: 's-where', say: 'Bu saatin merkezi, beynin derinlerinde, hipotalamusta durur: suprakiyazmatik çekirdek, kısaca SCN.' },
    { id: 's-size', say: 'Görme sinirlerinin çaprazlaştığı noktanın hemen üstünde, iki küçük hücre kümesi; toplamı yaklaşık yirmi bin nöron.' },
    { id: 's-conductor', say: 'SCN bir orkestra şefi gibidir. Vücuttaki bütün saatlere, aynı tempoda çalmalarını söyler.' },

    // 3 · Melatonin
    { id: 'm-call', say: 'Hava kararınca şef, beynin derinlerindeki küçük bir bezi göreve çağırır: epifiz bezi.' },
    { id: 'm-curve', say: 'Epifiz kana melatonin salar. Gündüz kanda neredeyse hiç melatonin yoktur; akşam yükselir, gece doruğa çıkar, sabaha doğru yeniden düşer.' },
    { id: 'm-signal', say: 'Melatonin bir uyku hapı değildir. Vücuda yalnızca şunu söyler: dışarıda gece var.' },
    { id: 'm-effect', say: 'Vücut ısısı biraz düşer, beden dinlenmeye hazırlanır; uykunun kapısı aralanır.' },

    // 4 · Gizli dedektif
    { id: 'e-how', say: 'Peki şef, dışarıda gece olduğunu nereden biliyor? Gözlerimizden.' },
    { id: 'e-rods', say: 'Gözün arkasındaki retinada, görmemizi sağlayan çubuk ve koni hücreleri vardır. Şekilleri ve renkleri onlar yakalar.' },
    { id: 'e-discovery', say: 'Ama iki bin iki yılında, bilim insanları retinada üçüncü bir ışık algılayıcı buldu: ışığa kendiliğinden duyarlı ganglion hücreleri.' },
    { id: 'e-measure', say: 'Bu hücreler şekil görmez. İçlerindeki melanopsin pigmentiyle yalnızca şunu ölçerler: ortam ne kadar aydınlık?' },
    { id: 'e-blue', say: 'En hassas oldukları renk de mavidir; dalga boyu dört yüz seksen nanometre civarındaki ışık.' },
    { id: 'e-wire', say: 'Ve ölçtüklerini, özel bir sinir yoluyla doğrudan SCN’ye bildirirler.' },
    { id: 'e-blind', say: 'Bu yol görmeden o kadar ayrıdır ki, ışığı bilinçli olarak göremeyen bazı görme engelli insanlarda bile, parlak ışık melatonini hâlâ bastırabilir.' },
    { id: 'e-every', say: 'Bu dedektif hiç mesai bitirmez: gece banyoda yaktığın parlak tavan lambasını da, yatakta yüzüne tuttuğun ekranı da not eder.' },

    // 5 · Işık günlüğü
    { id: 'd-meter', say: 'Peki gün içinde gözümüze gerçekte ne kadar ışık giriyor? Işığı ölçen bir aletle, sıradan bir günü takip edelim. Işığın birimi lükstür.' },
    { id: 'd-out', say: 'Bulutlu bir günde bile dışarıda ışık birkaç bin lükse çıkar; güneşli bir öğlede ise on binleri aşar.' },
    { id: 'd-in', say: 'Evin ya da ofisin içi ise çoğu zaman birkaç yüz lükstür; pencereden uzaklaştıkça daha da azalır. Yani gününü içeride geçiren birinin beyni için gündüz, olması gerekenden çok daha loştur.' },
    { id: 'd-evening', say: 'Akşam ise tam tersi olur: tavan lambaları ve ekranlar, iç saate hâlâ gündüz sinyali verir. Kısacası, gündüzlerimiz fazla karanlık, gecelerimiz fazla aydınlık.' },

    // 6 · Kamp deneyi
    { id: 'd-camp', say: 'Bunu en güzel bir kamp deneyi gösterdi. Bir hafta boyunca elektrik ışığı olmadan, yalnızca güneş ve kamp ateşiyle yaşayan gönüllülerin iç saati, yaklaşık iki saat erkene kaydı.' },
    { id: 'd-sunset', say: 'Melatoninleri gün batımıyla birlikte yükselmeye başladı; sabah da biyolojik gecenin ortasında değil, sonunda uyandılar.' },
    { id: 'd-weekend', say: 'Üstelik bir hafta sonu kampı bile, bu saati bir buçuk saate yakın erkene çekmeye yetti.' },

    // 7 · Ekran ve deneyler
    { id: 'x-back', say: 'Şimdi gece yarısına dönelim. Telefon ekranları ve beyaz LED lambalar, mavi bakımından zengin bir ışık yayar.' },
    { id: 'x-report', say: 'Gözündeki dedektif bu ışığı ölçer ve SCN’ye haber verir: hâlâ gündüz.' },
    { id: 'x-stop', say: 'Şef de epifize, melatonini durdurmasını söyler.' },
    { id: 'x-study', say: 'Bunun etkisi ölçülebilir. İki bin yirmi beşte yayımlanan küçük bir deneyde, on iki kişi akşam üç saat boyunca mavi ya da kırmızı LED ışığında oturdu.' },
    { id: 'x-result', say: 'İkinci saatin sonunda, mavi ışıktakilerin melatonin düzeyi, kırmızı ışıktakilerin üçte birinden azdı.' },
    { id: 'x-tablet', say: 'İki bin on beşte yayımlanan bir başka deneyde, yatmadan önce dört saat tablette okuyanlar, basılı kitap okuyanlara göre daha geç uykuya daldı. İç saatleri ileri kaydı; sabah da daha az dinç uyandılar.' },
    { id: 'x-dim', say: 'Üstelik bunun için güçlü bir ışık gerekmiyor. İki bin on dokuz tarihli bir çalışmada, melatonini yarıya indirmeye otuz lüksten az ışık yetti; bu, gece kullandığımız sıradan bir oda ışığından daha loş.' },
    { id: 'x-vary', say: 'İnsanlar arasındaki fark da büyüktü: en hassas kişi, en dayanıklı kişiden elli kat daha az ışıkla etkilendi.' },
    { id: 'x-friend', say: 'Yani arkadaşın gece telefona bakıp rahatça uyuyabiliyorsa, bu senin için de aynı olacak demek değil.' },

    // 8 · Dürüst olalım
    { id: 'n-honest', say: 'Yine de dürüst olalım: geceleri uyuyamamamızın tek sebebi ışık değil.' },
    { id: 'n-content', say: 'Kaydırdığımız içerik de beyni uyanık tutar: bir bildirim, bir tartışma, bir sonraki video.' },
    { id: 'n-filter', say: 'Gece modu gibi filtreler de tek başına mucize değil. Yüz altmış yedi gençle yapılan bir deneyde, gece modunu açmak uykuyu ölçülebilir biçimde iyileştirmedi.' },
    { id: 'n-amount', say: 'Öte yandan ekranın gözü uyaran ışığı gerçekten azaltıldığında, uykuya dalmak kolaylaşıyor. Yani asıl önemli olan renk tonu değil, gözüne ulaşan ışığın miktarı.' },

    // 9 · Gündüz bol ışık
    { id: 'r-rules', say: 'Peki ne yapabiliriz? Işık bilimcilerinin iki bin yirmi iki tarihli ortak önerileri, üç basit kurala çıkıyor.' },
    { id: 'r-day', say: 'Bir: gündüz bol ışık. Sabah dışarıda geçirilen kısa bir zaman bile, iç saati doğru yöne ayarlar.' },
    { id: 'p-morning', say: 'Pratikte bu şu demek: uyanınca perdeyi sonuna kadar aç. Kahvaltını pencerenin önünde yap; mümkünse işe ya da okula giderken bir durak önce in ve yürü.' },
    { id: 'p-desk', say: 'Gün içinde masanı pencereye yaklaştır; öğle arasında birkaç dakikalığına da olsa dışarı çık. Bulutlu bir gün bile, evin içinden kat kat aydınlıktır.' },

    // 10 · Akşam az ışık
    { id: 'r-evening', say: 'İki: yatmadan önceki üç saatte, ışığı azalt. Tavan lambası yerine loş ve sıcak renkli lambalar; ekranın parlaklığını en aza indir.' },
    { id: 'p-lamp', say: 'Bunun en kolay yolu, akşam yemeğinden sonra tavan lambasını kapatıp küçük, sarı ışıklı bir lamba yakmak. Ampul alırken kutusundaki kelvin değerine bak: iki bin yedi yüz gibi düşük bir sayı, sıcak ve sarı bir ışık demektir.' },
    { id: 'p-distance', say: 'Telefonu kullanman gerekiyorsa, ekranı yüzüne yaklaştırma. Ekranı iki kat uzağa tuttuğunda, gözüne ulaşan ışık kabaca dörtte birine iner.' },

    // 11 · Uykuda karanlık
    { id: 'r-night', say: 'Üç: uyurken karanlık. Yatak odan ne kadar karanlıksa, iç saatin o kadar rahat.' },
    { id: 'p-sleeplight', say: 'Bu yalnızca uyku için değil. Bir deneyde, tavan lambası açıkken tek bir gece uyuyan sağlıklı gençlerin, uyku boyunca kalp atışı hızlandı; ertesi sabah da kan şekerini düzenleyen insüline verdikleri yanıt zayıfladı.' },
    { id: 'p-dark', say: 'Karartma perde ya da bir uyku bandı; şarj aletlerinin küçük ışıklarına bir parça bant. Gece kalkarsan da tavan lambasını değil, yere yakın, kısık ve sarı bir gece lambasını yak.' },
    { id: 'r-phone', say: 'Ve en etkilisi hâlâ en basiti: yatmadan bir saat önce, telefonu odanın dışında bırakmak.' },
    { id: 'p-alarm', say: 'Alarm için basit bir masa saati yeter. Yatakta ekran kaydırmak yerine kitap oku, müzik dinle ya da yarının listesini bir kâğıda yaz.' },

    // 12 · Bir hafta dene
    { id: 'p-weekend', say: 'Hafta sonları da kalkış saatini çok kaydırma; farkı bir saat civarında tutmak, pazartesi sabahlarını kolaylaştırır.' },
    { id: 'p-days', say: 'İç saat bir gecede değil, her gün biraz kayar. Bu yüzden bu alışkanlıkları en az bir hafta dene; sonucu tek gecede değil, günler içinde görürsün.' },
    { id: 'p-doctor', say: 'Ama haftalardır uyuyamıyorsan ya da gün boyu sürekli yorgunsan, bu ipuçlarıyla yetinme; bir hekime danış.' },

    // 13 · Kapanış
    { id: 'z-fire', say: 'Milyonlarca yıl boyunca gecenin tek ışığı ay ve ateşti. Biyolojimiz hâlâ o dünyaya göre ayarlı.' },
    { id: 'z-remember', say: 'Ekranları atmamıza gerek yok. Sadece, beynimize saatin kaç olduğunu söyleyenin ışık olduğunu hatırlamamız yeterli.' },
    { id: 'z-tonight', say: 'Bu gece ekranı biraz erken bırak; yarın sabah da biraz güneş al. İç saatin sana teşekkür edecek.' },
    { id: 'z-end', say: 'YUP Akademi’de görüşmek üzere.' },
  ],
};
window.NARRATION.lines.forEach((l) => { l.beat = l.id; });
