// Initial menu data - extracted from existing HTML
// This serves as the default data seed when no KV data exists

export const initialBanners = [
  {
    id: "banner_1",
    title: "Şefin Elinden",
    emoji: "👨‍🍳",
    description: "Karışık Kumpir ve Kutu Kola. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!",
    price: 420,
    image: "/images/kumpir_kola.png",
    badge: "Popüler",
    ingredients: [
      { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" },
      { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }
    ]
  },
  {
    id: "banner_2",
    title: "Tatlı Şöleni",
    emoji: "🍰",
    description: "Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.",
    price: 360,
    image: "/images/tatli_cay.png",
    badge: "Popüler",
    ingredients: [
      { type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" },
      { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }
    ]
  },
  {
    id: "banner_3",
    title: "Gecelerin Vazgeçilmezi",
    emoji: "🌙",
    description: "Goralı Kumru ve Kutu Kola. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.",
    price: 340,
    image: "/images/gorali_kola.png",
    badge: "Popüler",
    ingredients: [
      { type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" },
      { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }
    ]
  },
  {
    id: "banner_4",
    title: "Sabahın Güneşi",
    emoji: "☀️",
    description: "Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.",
    price: 290,
    image: "/images/tost_cay.png",
    badge: "Popüler",
    ingredients: [
      { type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }
    ]
  }
];

export const initialFeatured = [
  {
    id: "featured_1",
    title: "Efsane Kumru Menü",
    emoji: "⭐",
    description: "1x Orijinal İzmir Kumru (Sucuk, salam, sosis, kaşar peyniri, domates) + Patates Tava (150 g) + İçecek (Kutu Kola).",
    price: 330,
    image: "/images/kumru.png",
    ingredients: [
      { type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" },
      { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" },
      { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }
    ]
  },
  {
    id: "featured_2",
    title: "Karışık Kumpir Şöleni",
    emoji: "⭐",
    description: "Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin 7 çeşit meze ile unutulmaz bir lezzet şöleni.",
    price: 350,
    image: "/images/kumpir.png",
    ingredients: [
      { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" },
      { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }
    ]
  }
];

export const initialCategories = [
  {
    id: "kampanyali",
    title: "Kampanyalı Menüler",
    icon: "fa-solid fa-fire",
    emoji: "",
    navLabel: "🔥 Kampanyalar",
    items: [
      {
        id: "kamp_1", title: "Şefin Elinden", emoji: "👨‍🍳", description: "Karışık Kumpir ve Kutu Kola. Dev fırın patates içerisinde bol kaşar, tereyağı ve dilediğin taze mezelerle hazırlanan eşsiz lezzet!", price: 420, image: "/images/kumpir_kola.png", badge: "Popüler", isHighlight: true,
        ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "kamp_2", title: "Tatlı Şöleni", emoji: "🍰", description: "Kasede Waffle ve Çay. Bol çikolata sosu ve taptaze meyvelerle harmanlanan kase waffle keyfi, yanında sıcacık tavşan kanı çay ile.", price: 360, image: "/images/tatli_cay.png", badge: "Popüler", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "kamp_3", title: "Gecelerin Vazgeçilmezi", emoji: "🌙", description: "Goralı Kumru ve Kutu Kola. Özel sosis, ev yapımı rus salatası ve kornişon turşunun yumuşacık sandviç ekmeğiyle buluştuğu doyurucu lezzet.", price: 340, image: "/images/gorali_kola.png", badge: "Popüler", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "kamp_4", title: "Sabahın Güneşi", emoji: "☀️", description: "Ayvalık Tostu ve Çay. Bol malzemeli orijinal Ayvalık tostu, yanında ince belli bardakta taze demlenmiş çay.", price: 290, image: "/images/tost_cay.png", badge: "Popüler", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "kamp_5", title: "İzmir Kumru Menü (Ayran)", emoji: "", description: "İzmir Kumru + Patates Tava + Ayran", price: 300, image: "/images/kumru.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "kamp_6", title: "Ayvalık Tostu Menü (Ayran)", emoji: "", description: "Ayvalık Tostu + Patates Tava + Ayran", price: 300, image: "/images/tost.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "kamp_7", title: "Hamburger Menü (Ayran)", emoji: "", description: "Hamburger + Patates Tava + Ayran", price: 300, image: "/images/burger.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "kamp_8", title: "Ekmek Arası İncik Menü (Ayran)", emoji: "", description: "Ekmek Arası İncik + Patates Tava + Ayran", price: 290, image: "/images/durum.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "kamp_9", title: "Dürüm İncik Menü (Ayran)", emoji: "", description: "Dürüm İncik + Patates Tava + Ayran", price: 300, image: "/images/durum.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      }
    ]
  },
  {
    id: "kumpirler",
    title: "Kumpirler",
    icon: "",
    emoji: "🥔",
    navLabel: "Kumpirler",
    items: [
      {
        id: "kumpir_1", title: "Karışık Kumpir", emoji: "", description: "Büyük boy fırın patates (400 g), tereyağı, bol kaşar, sosis, salam, amerikan salatası, zeytin, mısır, kornişon.", price: 350, image: "/images/kumpir.png", badge: "Popüler", isHighlight: true,
        ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "kumpir_2", title: "Köfteli Kumpir", emoji: "", description: "Büyük boy patates, tereyağı, kaşar, mini kasap köfteler (150 g), domates sos, mısır.", price: 450, image: "/images/kumpir.png", badge: "", isHighlight: false,
        ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "kumpir_3", title: "Meksikan Kumpir", emoji: "", description: "Büyük boy patates, tereyağı, kaşar, jalepeno biber, meksika fasulyesi, acılı kıyma sos (120 g), mısır.", price: 390, image: "/images/kumpir.png", badge: "Acılı", isHighlight: false,
        ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "kumpir_4", title: "Sade Kumpir", emoji: "", description: "Büyük boy fırın patates (400 g), tereyağı (30 g), bol kaşar peyniri (80 g).", price: 280, image: "/images/kumpir.png", badge: "Vejetaryen", isHighlight: false,
        ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      }
    ]
  },
  {
    id: "durumler",
    title: "Dürümler",
    icon: "fa-solid fa-scroll",
    emoji: "",
    navLabel: "Dürümler",
    items: [
      {
        id: "durum_1", title: "Adana Dürüm", emoji: "", description: "Özel lavaş ekmeğine sarılı nefis Adana kebap, soğan, maydanoz ve domates.", price: 290, image: "/images/durum.png", badge: "", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "durum_2", title: "Tavuk İncik Dürüm", emoji: "", description: "Özel lavaş ekmeğine sarılı ızgara tavuk incik, soğan ve yeşillikler.", price: 250, image: "/images/durum.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      }
    ]
  },
  {
    id: "tostlar",
    title: "Tostlar",
    icon: "fa-solid fa-bread-slice",
    emoji: "",
    navLabel: "Tostlar",
    items: [
      {
        id: "tost_1", title: "Ayvalık Tostu", emoji: "", description: "Orijinal Ayvalık tostu ekmeği, kaşar, sosis, sucuk, salam, amerikan salatası, turşu.", price: 240, image: "/images/tost.png", badge: "", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "tost_2", title: "Sucuklu Kaşarlı Tost", emoji: "", description: "Tost ekmeği, bol kaşar peyniri ve özel sucuk.", price: 210, image: "/images/tost.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "tost_3", title: "Kaşarlı Tost", emoji: "", description: "Tost ekmeği ve bol eritme kaşar peyniri.", price: 190, image: "/images/tost.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "tost_4", title: "Sucuklu Tost", emoji: "", description: "Tost ekmeği ve özel sucuk dilimleri.", price: 190, image: "/images/tost.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "tost_5", title: "Ege Tostu", emoji: "", description: "Özel Ege yöresi lezzetleriyle hazırlanan doyurucu tost.", price: 290, image: "/images/tost.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      }
    ]
  },
  {
    id: "porsiyonlar",
    title: "Porsiyonlar",
    icon: "fa-solid fa-plate-wheat",
    emoji: "",
    navLabel: "Porsiyonlar",
    items: [
      {
        id: "pors_1", title: "Kasap Köfte Porsiyon", emoji: "", description: "Özel kasap köfte, yanında patates kızartması ve yeşillik.", price: 380, image: "/images/porsiyon.png", badge: "", isHighlight: true,
        ingredients: [{ type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "pors_2", title: "Tavuk İncik Porsiyon", emoji: "", description: "Izgara tavuk incik, patates kızartması ve yeşillik ile.", price: 350, image: "/images/porsiyon.png", badge: "", isHighlight: false,
        ingredients: [{ type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      }
    ]
  },
  {
    id: "kumrular",
    title: "İzmir Kumru",
    icon: "fa-solid fa-hotdog",
    emoji: "",
    navLabel: "İzmir Kumru",
    items: [
      {
        id: "kumru_1", title: "Orijinal İzmir Kumru", emoji: "", description: "Özel kumru ekmeği (110 g), salam, sosis, sucuk, Sayas peyniri (eritme kaşar), domates.", price: 240, image: "/images/kumru.png", badge: "", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "kumru_2", title: "Goralı Kumru", emoji: "", description: "Özel kumru ekmeği, sosis, salam, özel Goralı sosu, turşu, mayonez.", price: 270, image: "/images/kumru.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      }
    ]
  },
  {
    id: "burgerler",
    title: "Burgerler",
    icon: "fa-solid fa-burger",
    emoji: "",
    navLabel: "Burgerler",
    items: [
      {
        id: "burger_1", title: "Ortaköy Satır Burger", emoji: "", description: "Özel burger ekmeği, satır kıyması köfte (150 g), karamelize soğan, cheddar peyniri, BBQ sos.", price: 380, image: "/images/burger.png", badge: "Popüler", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "burger_2", title: "Cheeseburger", emoji: "", description: "Burger ekmeği, burger köftesi (120 g), çift dilim cheddar peyniri, domates, marul, turşu.", price: 270, image: "/images/burger.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "burger_3", title: "Hamburger", emoji: "", description: "Burger ekmeği, burger köftesi (120 g), domates, marul, turşu, ketçap, mayonez.", price: 240, image: "/images/burger.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      }
    ]
  },
  {
    id: "ekmek-arasi",
    title: "Ekmek Arası & Yancılar",
    icon: "fa-solid fa-drumstick-bite",
    emoji: "",
    navLabel: "Ekmek Arası",
    items: [
      {
        id: "ekmek_1", title: "Ekmek Arası Tavuk İncik", emoji: "", description: "Yarım ekmek, didilmiş ızgara tavuk incik (100 g), soğan, maydanoz, domates.", price: 230, image: "/images/ekmek_arasi.png", badge: "", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "ekmek_2", title: "Ekmek Arası Satır Köfte", emoji: "", description: "Yarım ekmek, ızgara satır köfte (120 g), domates, soğan piyazı, yeşillik.", price: 230, image: "/images/ekmek_arasi.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "dana", title: "Et Ürünleri", icon: "fa-solid fa-cow" }]
      },
      {
        id: "ekmek_3", title: "Patates Kızartması", emoji: "", description: "Çıtır patates (Küçük 150g / Büyük 250g), özel baharat karışımı, sos.", price: 140, image: "/images/patates_kapta.png", badge: "", isHighlight: false,
        ingredients: []
      }
    ]
  },
  {
    id: "tatlilar",
    title: "Tatlılar",
    icon: "fa-solid fa-ice-cream",
    emoji: "",
    navLabel: "Tatlılar",
    items: [
      {
        id: "tatli_1", title: "Waffle", emoji: "", description: "Taze waffle hamuru, çikolata sosu, taze meyveler, ceviz ve fındık kırığı.", price: 300, image: "/images/tatli.png", badge: "", isHighlight: true,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "tatli_2", title: "Kasede Waffle", emoji: "", description: "Parçalanmış waffle hamuru, bol çikolata, meyveler, dondurma topu.", price: 350, image: "/images/waffle_kase.png", badge: "", isHighlight: false,
        ingredients: [{ type: "tahil", title: "Tahıl / Gluten", icon: "fa-solid fa-wheat-awn" }, { type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }]
      },
      {
        id: "tatli_3", title: "Bardakta Tatlı", emoji: "", description: "Mevsimine göre supangle, magnolia veya puding çeşitleri (200 g).", price: 200, image: "/images/waffle_bardak.png", badge: "", isHighlight: false,
        ingredients: []
      }
    ]
  },
  {
    id: "icecekler",
    title: "İçecekler",
    icon: "fa-solid fa-mug-hot",
    emoji: "",
    navLabel: "İçecekler",
    items: [
      { id: "icecek_1", title: "Nescafe", emoji: "", description: "Hazır kahve, sıcak su, isteğe bağlı süt.", price: 90, image: "/images/nescafe.png", badge: "", isHighlight: false, ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }] },
      { id: "icecek_2", title: "Latte", emoji: "", description: "Espresso, buharla ısıtılmış süt (200 ml).", price: 120, image: "/images/latte.png", badge: "", isHighlight: false, ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }] },
      { id: "icecek_3", title: "Amerikano", emoji: "", description: "Espresso ve sıcak su.", price: 120, image: "/images/americano.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_4", title: "Sıcak Çikolata", emoji: "", description: "Sıcak süt, yoğun çikolata tozu.", price: 120, image: "/images/sicak_cikolata.png", badge: "", isHighlight: false, ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }] },
      { id: "icecek_5", title: "Türk Kahvesi", emoji: "", description: "Geleneksel Türk Kahvesi, lokum eşliğinde.", price: 90, image: "/images/turk_kahvesi.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_6", title: "Çay", emoji: "", description: "İnce belli bardakta taze demlenmiş Türk çayı.", price: 30, image: "/images/cay.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_7", title: "Bitki Çayı", emoji: "", description: "Yeşil çay, adaçayı, ıhlamur veya kuşburnu.", price: 40, image: "/images/bitki_cayi.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_8", title: "Limonata", emoji: "", description: "Taze sıkılmış limon, şeker, nane (300 ml).", price: 80, image: "/images/limonata.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_9", title: "Karadut Özü", emoji: "", description: "Doğal karadut özü suyu, buz (300 ml).", price: 80, image: "/images/karadut_suyu.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_10", title: "Meşrubatlar (Kola, Fanta, Sprite)", emoji: "", description: "Kutu içecek (330 ml).", price: 90, image: "/images/kola.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_11", title: "Ayran", emoji: "", description: "Kapalı Ayran (Büyük / Küçük).", price: 70, image: "/images/ayran.png", badge: "", isHighlight: false, ingredients: [{ type: "sut", title: "Süt Ürünü", icon: "fa-solid fa-bottle-droplet" }] },
      { id: "icecek_12", title: "Sade Soda", emoji: "", description: "Maden suyu (200 ml).", price: 50, image: "/images/sade_soda.png", badge: "", isHighlight: false, ingredients: [] },
      { id: "icecek_13", title: "Churchill", emoji: "", description: "Maden suyu, taze sıkılmış limon suyu, tuz.", price: 120, image: "/images/churchill.png", badge: "", isHighlight: false, ingredients: [] }
    ]
  }
];

export const initialCoupons = [];
export const initialOrders = [];

export const initialSettings = {
  isStoreOpen: true,
  freeShippingThreshold: 180,
  courierFee: 60,
  workingHours: "10:00 - 02:00",
  socialLinks: {
    whatsapp: "905011610399",
    instagram: "https://instagram.com/ortakoykumrucusuburhaniye",
    googleReview: "https://www.google.com/search?sa=X&sca_esv=16b8fec23fd04a91&sxsrf=APpeQntcpRA5sc4X-4KRd89PrvmtMVhlYA:1782189784680&q=Ortak%C3%B6y+Kumrucusu+Burhaniye+Yorumlar&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDI1MTSyMLOwNDS0MLY0NjE3NNnAyPiKUdW_qCQx-_C2SgXv0tyi0uTS4lIFp9KijMS8zMpUhcj8otLcnMSiRazEqQMAm7Pu4msAAAA&rldimm=12541286891183934714&tbm=lcl&hl=tr-TR&ved=2ahUKEwjC0aaoxpyVAxXS_7sIHfzbNj8Q9fQKegQIUxAG&cshid=1782189790072038&biw=874&bih=873&dpr=1#lkt=LocalPoiReviews"
  },
  deliveryLinks: {
    yemeksepeti: "https://www.yemeksepeti.com/restaurant/kis1/ortakoy-kumrucusu?srsltid=AfmBOopb92QPwJszrHiukZcyRhN6t-3c_85qTJ4-cp9Bxvs-wZDUvmjJ",
    getir: "https://getir.com/yemek/restoran/ortakoy-kumpircisi-burhaniye-ogretmenler-mah-burhaniye-balikesir/",
    migros: "https://www.migros.com.tr/yemek/ortakoy-kumrucusu-burhaniye-ogretmenler-mah-st-323b3?srsltid=AfmBOoo6E7vAtdYBcMBbrYD9ygW3wQR2lrZ7pz2jkFGLs5LI9LmX9LlK"
  }
};
