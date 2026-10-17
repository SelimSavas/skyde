/*
 * YUP Akademi — Gecenin Mavi Işığı: Ekran Işığı Beynimizdeki Saati Nasıl Kandırır?
 * Türkçe seslendirme metni. Her satır kendi adını taşıyan vuruşa bağlıdır (film.js).
 * Sayılar yazıyla; kaynaklar için bkz. kaynaklar.md.
 * Metni değiştirince: node video/narrate.mjs yup-mavi-isik --pay 1.1
 */
window.NARRATION = {
  lines: [
    // 0 · Gece yarısı
    { id: 'h-night', say: 'Gece saat bir buçuk. Yarın erken kalkman gerekiyor; ama elinde telefon, sadece beş dakika daha diyorsun.' },
    { id: 'h-off', say: 'Sonunda ekranı kapatıyorsun. Oda karanlık, gözlerin kapalı.' },
    { id: 'h-awake', say: 'Ama uyku gelmiyor. Çünkü beyninin derinlerinde bir saat, hâlâ gündüz olduğunu düşünüyor.' },
    { id: 'h-promise', say: 'Bu videoda, o saati neyin ve nasıl kandırdığını, adım adım göreceğiz.' },

    // 1 · İç saat
    { id: 'c-earth', say: 'Dünya yirmi dört saatte bir döner; gece ile gündüz birbirini kovalar.' },
    { id: 'c-body', say: 'Vücudumuz da bu ritme uyar: vücut ısısı, hormonlar, uyanıklık, hatta acıkma saatimiz.' },
    { id: 'c-name', say: 'Bu ritme sirkadiyen ritim denir; Latincede, yaklaşık bir gün demektir.' },
    { id: 'c-period', say: 'İlginç olan şu: iç saatimiz tam yirmi dört saat değil. Kontrollü deneylerde, ortalama yirmi dört saat on bir dakika ölçülmüş.' },
    { id: 'c-reset', say: 'Yani saatimiz her gün biraz kayar. Onu her sabah yeniden ayarlayan şey ise ışıktır.' },

    // 2 · Orkestra şefi
    { id: 's-where', say: 'Bu saatin merkezi, beynin derinlerinde, hipotalamusta durur: suprakiyazmatik çekirdek, kısaca SCN.' },
    { id: 's-size', say: 'Görme sinirlerinin çaprazlaştığı noktanın hemen üstünde, iki küçük hücre kümesi; toplamı yaklaşık yirmi bin nöron.' },
    { id: 's-conductor', say: 'SCN bir orkestra şefi gibidir. Vücuttaki bütün saatlere, aynı tempoda çalmalarını söyler.' },

    // 3 · Melatonin
    { id: 'm-call', say: 'Hava kararınca şef, beynin derinlerindeki küçük bir bezi göreve çağırır: epifiz bezi.' },
    { id: 'm-path', say: 'Bu çağrı dolambaçlı bir yoldan gider: omurilikten aşağı iner, boyundaki bir sinir düğümünden geçer ve epifize geri döner.' },
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

    // 5 · Ekran ve deneyler
    { id: 'x-back', say: 'Şimdi gece yarısına dönelim. Telefon ekranları ve beyaz LED lambalar, mavi bakımından zengin bir ışık yayar.' },
    { id: 'x-report', say: 'Gözündeki dedektif bu ışığı ölçer ve SCN’ye haber verir: hâlâ gündüz.' },
    { id: 'x-stop', say: 'Şef de epifize, melatonini durdurmasını söyler.' },
    { id: 'x-study', say: 'Bunun etkisi ölçülebilir. İki bin yirmi beşte yayımlanan küçük bir deneyde, on iki kişi akşam üç saat boyunca mavi ya da kırmızı LED ışığında oturdu.' },
    { id: 'x-result', say: 'İkinci saatin sonunda, mavi ışıktakilerin melatonin düzeyi, kırmızı ışıktakilerin üçte birinden azdı.' },
    { id: 'x-tablet', say: 'İki bin on beşte yayımlanan bir başka deneyde, yatmadan önce dört saat tablette okuyanlar, basılı kitap okuyanlara göre daha geç uykuya daldı. İç saatleri ileri kaydı; sabah da daha az dinç uyandılar.' },
    { id: 'x-dim', say: 'Üstelik bunun için güçlü bir ışık gerekmiyor. İki bin on dokuz tarihli bir çalışmada, melatonini yarıya indirmeye otuz lüksten az ışık yetti; bu, gece kullandığımız sıradan bir oda ışığından daha loş.' },
    { id: 'x-vary', say: 'İnsanlar arasındaki fark da büyüktü: en hassas kişi, en dayanıklı kişiden elli kat daha az ışıkla etkilendi.' },

    // 6 · Dürüst olalım
    { id: 'n-honest', say: 'Yine de dürüst olalım: geceleri uyuyamamamızın tek sebebi ışık değil.' },
    { id: 'n-content', say: 'Kaydırdığımız içerik de beyni uyanık tutar: bir bildirim, bir tartışma, bir sonraki video.' },
    { id: 'n-filter', say: 'Gece modu gibi filtreler de tek başına mucize değil. Yüz altmış yedi gençle yapılan bir deneyde, gece modunu açmak uykuyu ölçülebilir biçimde iyileştirmedi.' },
    { id: 'n-amount', say: 'Öte yandan ekranın gözü uyaran ışığı gerçekten azaltıldığında, uykuya dalmak kolaylaşıyor. Yani asıl önemli olan renk tonu değil, gözüne ulaşan ışığın miktarı.' },

    // 7 · Ne yapabiliriz?
    { id: 'r-rules', say: 'Peki ne yapabiliriz? Işık bilimcilerinin iki bin yirmi iki tarihli ortak önerileri, üç basit kurala çıkıyor.' },
    { id: 'r-day', say: 'Bir: gündüz bol ışık. Sabah dışarıda geçirilen kısa bir zaman bile, iç saati doğru yöne ayarlar.' },
    { id: 'r-evening', say: 'İki: yatmadan önceki üç saatte, ışığı azalt. Tavan lambası yerine loş ve sıcak renkli lambalar; ekranın parlaklığını en aza indir.' },
    { id: 'r-night', say: 'Üç: uyurken karanlık. Yatak odan ne kadar karanlıksa, iç saatin o kadar rahat.' },
    { id: 'r-phone', say: 'Ve en etkilisi hâlâ en basiti: yatmadan bir saat önce, telefonu odanın dışında bırakmak.' },

    // 8 · Kapanış
    { id: 'z-fire', say: 'Milyonlarca yıl boyunca gecenin tek ışığı ay ve ateşti. Biyolojimiz hâlâ o dünyaya göre ayarlı.' },
    { id: 'z-remember', say: 'Ekranları atmamıza gerek yok. Sadece, beynimize saatin kaç olduğunu söyleyenin ışık olduğunu hatırlamamız yeterli.' },
    { id: 'z-tonight', say: 'Bu gece ekranı biraz erken bırak; yarın sabah da biraz güneş al. İç saatin sana teşekkür edecek.' },
    { id: 'z-end', say: 'YUP Akademi’de görüşmek üzere.' },
  ],
};
window.NARRATION.lines.forEach((l) => { l.beat = l.id; });
