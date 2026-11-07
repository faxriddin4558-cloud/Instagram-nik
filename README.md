# Instagram qisqa username qidiruvchi

2, 3 va 4 belgili, faqat harf yoki raqamdan iborat Instagram niklarini generatsiya qiladi,
esda qolarligi bo'yicha baholaydi va ommaviy profil sahifalari orqali **dastlabki saralash**
qiladi. Yakuniy qaror — har doim Instagram ilovasida qo'lda.

## O'rnatish va ishga tushirish

```bash
npm install
npx playwright install chromium   # bir marta

npm run dry-run                   # tarmoqsiz: faqat generatsiya + reyting
npm start                         # 40 ta nomzodni sekin tekshiradi (12–25 s pauza)
node finder.cjs --lengths 4 --types mixed --max-checks 30
node finder.cjs --help
```

Qayta ishga tushirsangiz, avval tekshirilganlar (`output/results.csv`) o'tkazib yuboriladi —
kunda bir necha marta kichik partiyalar bilan davom ettiring.

## Natijalar (`output/`)

| Fayl | Mazmuni |
|---|---|
| `candidates.csv` | Baholangan nomzodlar (eng yaxshi 5000), ball sabablari bilan |
| `results.csv` | Tekshirilgan har bir nik: holat, HTTP kodi, vaqt, izoh |
| `top50.csv` | Band bo'lmagan eng yaxshi 50 nomzod — qo'lda tekshirish uchun |

Holatlar: `band` · `ehtimol_bosh` (ommaviy sahifa yo'q — **bo'sh degani emas**) · `nomalum` ·
`xato` · `cheklov` / `login_talab` / `captcha_yoki_challenge` (shu holatlarda dastur **to'xtaydi**).

## Baholash

Qisqalik (2 > 3 > 4), bir xil belgilar (`7777`, `xx`), faqat 2 xil belgi (`7112`, `1001`),
palindrom, `ABAB`/`AABB`, ketma-ketlik (`123`, `abcd`), harf+raqam (`f1`, `x7`),
talaffuzi oson harflar (`nova`, `kel`), yaxlit sonlar (`100`, `7000`) ball oladi.
Tartibsiz aralash (`a1b2`) va chalkash belgilar (`l1`, `o0`) ball yo'qotadi.
Top-50 ro'yxatda raqamli, harfli va aralash niklar navbatma-navbat chiqadi.

## Xavfsizlik qoidalari (kodda majburiy)

- Login avtomatlashtirilmaydi; parol, cookie yoki sessiya so'ralmaydi va saqlanmaydi
  (har safar toza, saqlanmaydigan brauzer konteksti).
- CAPTCHA, rate-limit, login-wall chetlab o'tilmaydi; User-Agent almashtirilmaydi.
  Bunday signal yoki ketma-ket 5 ta aniqlanmagan javob bo'lsa — tekshiruv to'xtaydi.
- Pauza kamida 5 s, bir ishga tushirishda ko'pi bilan 200 ta so'rov.

## Yakuniy tekshiruv — qo'lda, Instagram ilovasida

1. Ilova → Profil → **Profilni tahrirlash** → **Foydalanuvchi nomi**.
2. `top50.csv` dagi nomzodni yozing: ✓ belgisi = bo'sh, "Bu nom band" = band.
3. ✓ chiqsa, darhol saqlang.

> Haqiqat: 2 va 3 belgili niklarning deyarli hammasi allaqachon band yoki Instagram
> tomonidan zaxiralangan. Real imkoniyat asosan 4 belgili aralash niklarda
> (`--lengths 4 --types mixed`).

## GitHub Actions orqali (kompyutersiz)

Workflow: `.github/workflows/ig-username-finder.yml` — faqat qo'lda (`workflow_dispatch`).

1. GitHub → **Actions** → **IG username finder** → **Run workflow**.
2. `max_checks` (1–5), `lengths`, `types` ni tanlang.
3. Tugagach: run sahifasidagi **Summary** da jadval, pastda **Artifacts → ig-username-results**
   (`results.csv`, `top50.csv`, `stop_reason.txt`).

Login/CAPTCHA/rate-limit chiqsa dastur darhol to'xtaydi (chiqish kodi 3) va run ogohlantirish bilan tugaydi.
Eslatma: GitHub Actions serverlari (datacenter IP) Instagram tomonidan tez-tez login sahifasiga
yo'naltiriladi — bunda natija `login_talab` bo'ladi, bu kutilgan holat.

## 4 belgili chiroyli niklar (tarmoqsiz)

```bash
npm run shortlist
```

Instagram'ga so'rov yubormaydi. `shortlists/` papkasiga yozadi:

| Fayl | Mazmuni |
|---|---|
| `beauty4_shortlist.csv` | Eng yaxshi 500 ta 4 belgili nomzod (hammasi `tekshirilmagan`) |
| `manual_top30.csv` | Qo'lda tekshirish uchun 30 ta, bo'sh `ilova_natijasi` ustuni bilan |
| `MANUAL_TOP30.md` | Shu 30 ta — belgilab chiqish uchun ro'yxat |

Shablonlar: `AAAA` (7777), `AAAB` (7771), `ABBA` (7007), `ABAB` (7070), `AABB`, `ABBC` (7112),
`X000`, ketma-ket; aralash: `LDLD` (f7x9), `L+DDD` (x777), `DDD+L`, `LDDL`, `LLDD`;
harfli: `AAAA`, talaffuzli `ABAB`/`CVCV`. 7112, 7007, 7771, f7x9 ro'yxat boshida turadi.
Xilma-xillik uchun bitta harf ko'pi bilan 2 ta nikda ishlatiladi.
